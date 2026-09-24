import React, { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { FaSearch } from "react-icons/fa";
import { getOrders, updatePaymentStatus } from "../../https";
import { formatMoney, getOrderNo, pad } from "../../utils";
import { EmptyState, Segmented, Skeleton, Spinner, StatusPill } from "../shared/ui";

const DAY = 24 * 60 * 60 * 1000;
const RANGES = { Today: 0, "7 days": 7, "30 days": 30, All: null };

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const time = (date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

const dayLabel = (date) =>
  new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const amountOf = (order) => order.bills?.totalWithTax || 0;
const statusOf = (order) => order.paymentStatus || "Pending";

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const exportCsv = (rows) => {
  const header = ["date", "time", "order", "customer", "phone", "table", "method", "amount", "status", "verified_by", "verified_at"];
  const lines = rows.map((o) =>
    [
      new Date(o.orderDate).toLocaleDateString("en-CA"),
      time(o.orderDate),
      getOrderNo(o),
      o.customerDetails?.name,
      o.customerDetails?.phone,
      o.table?.tableNo ?? "",
      o.paymentMethod,
      amountOf(o).toFixed(2),
      statusOf(o),
      o.verifiedBy?.name ?? "",
      o.verifiedAt ? new Date(o.verifiedAt).toLocaleString("en-IN") : "",
    ].map(csvCell).join(",")
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ledger-${new Date().toLocaleDateString("en-CA")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const Ledger = () => {
  const queryClient = useQueryClient();
  const { role } = useSelector((state) => state.user);
  const canVerify = role === "Cashier" || role === "Admin";

  const [range, setRange] = useState("Today");
  const [method, setMethod] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const { data: resData, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) enqueueSnackbar("Couldn't load the ledger", { variant: "error" });
  }, [isError]);

  const paymentMutation = useMutation({
    mutationFn: (vars) => updatePaymentStatus(vars),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar(res.data.message, { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Couldn't update the payment", { variant: "error" });
    },
  });
  const savingId = paymentMutation.isPending ? paymentMutation.variables?.orderId : null;

  const orders = useMemo(() => resData?.data.data || [], [resData]);

  // Orders inside the chosen date range; the summary uses these
  const inRange = useMemo(() => {
    const days = RANGES[range];
    if (days === null) return orders;
    const from = startOfToday() - days * DAY;
    return orders.filter((o) => new Date(o.orderDate).getTime() >= from);
  }, [orders, range]);

  // ...then narrowed by method, status and search for the list
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inRange.filter(
      (o) =>
        (method === "All" || o.paymentMethod === method) &&
        (status === "All" || statusOf(o) === status) &&
        (!q ||
          o.customerDetails?.name?.toLowerCase().includes(q) ||
          getOrderNo(o).includes(q) ||
          String(o.customerDetails?.phone ?? "").includes(q))
    );
  }, [inRange, method, status, search]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const o of rows) {
      const key = new Date(o.orderDate).toDateString();
      if (!map.has(key)) map.set(key, { label: dayLabel(o.orderDate), rows: [] });
      map.get(key).rows.push(o);
    }
    return [...map.values()];
  }, [rows]);

  const sum = (list) => list.reduce((s, o) => s + amountOf(o), 0);
  const verified = inRange.filter((o) => statusOf(o) === "Verified");
  const pending = inRange.filter((o) => statusOf(o) === "Pending");

  const summary = [
    { label: "Collected", value: sum(verified), note: `${verified.length} verified`, accent: false },
    { label: "Pending", value: sum(pending), note: `${pending.length} to verify`, accent: pending.length > 0 },
    { label: "Cash", value: sum(verified.filter((o) => o.paymentMethod === "Cash")), note: "verified" },
    { label: "Online", value: sum(verified.filter((o) => o.paymentMethod === "Online")), note: "verified" },
  ];

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-ink bg-surface lg:grid-cols-4">
        {summary.map((item, index) => (
          <div
            key={item.label}
            className={`px-5 py-4 ${index % 2 === 1 ? "border-l border-ink" : ""} ${
              index >= 2 ? "border-t border-ink lg:border-t-0" : ""
            } ${index === 2 ? "lg:border-l" : ""}`}
          >
            <div className="flex items-center justify-between">
              <p className="mono-label">{item.label}</p>
              {item.accent && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-6 w-24" />
            ) : (
              <p className="mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight text-ink">
                ₹{formatMoney(item.value)}
              </p>
            )}
            <p className="mt-1 font-mono text-[11px] text-muted">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Segmented options={Object.keys(RANGES)} value={range} onChange={setRange} />
        <Segmented options={["All", "Cash", "Online"]} value={method} onChange={setMethod} />
        <Segmented options={["All", "Pending", "Verified"]} value={status} onChange={setStatus} />
        <label className="flex min-w-[200px] flex-1 items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 focus-within:border-ink">
          <FaSearch className="text-muted" size={11} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Customer, phone or order no."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
          />
        </label>
        <button
          onClick={() => exportCsv(rows)}
          disabled={rows.length === 0}
          className="btn-outline px-4 py-2 text-xs"
        >
          Export CSV
        </button>
      </div>

      {/* Entries */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-ink bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm text-ink">
            <thead className="border-b border-ink bg-paper font-mono text-[10px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-normal">Time</th>
                <th className="px-5 py-3 font-normal">Order</th>
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Table</th>
                <th className="px-5 py-3 font-normal">Method</th>
                <th className="px-5 py-3 text-right font-normal">Amount</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 text-right font-normal">Verification</th>
              </tr>
            </thead>

            {isLoading && (
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-line last:border-b-0">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <Skeleton className="h-3 w-full max-w-[110px]" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}

            {!isLoading &&
              groups.map((group) => (
                <tbody key={group.label} className="border-b border-ink last:border-b-0">
                  <tr className="bg-paper/70">
                    <td colSpan={5} className="px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-ink">
                      {group.label}
                      <span className="ml-2 text-muted">· {group.rows.length} entries</span>
                    </td>
                    <td className="px-5 py-2 text-right font-mono text-xs font-semibold">
                      ₹{formatMoney(sum(group.rows))}
                    </td>
                    <td colSpan={2} />
                  </tr>
                  {group.rows.map((order) => {
                    const isVerified = statusOf(order) === "Verified";
                    const saving = savingId === order._id;
                    return (
                      <tr key={order._id} className="border-t border-line hover:bg-paper/50">
                        <td className="px-5 py-3 font-mono text-xs text-muted">{time(order.orderDate)}</td>
                        <td className="px-5 py-3 font-mono text-xs">#{getOrderNo(order)}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium">{order.customerDetails?.name}</p>
                          <p className="font-mono text-[11px] text-muted">{order.customerDetails?.phone}</p>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">
                          {order.table?.tableNo ? `T-${pad(order.table.tableNo)}` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-xs font-semibold">
                          ₹{formatMoney(amountOf(order))}
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill status={statusOf(order)} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          {isVerified ? (
                            <div className="flex items-center justify-end gap-3">
                              <span className="font-mono text-[11px] text-muted">
                                {order.verifiedBy?.name || "—"}
                                {order.verifiedAt && ` · ${time(order.verifiedAt)}`}
                              </span>
                              {canVerify && (
                                <button
                                  onClick={() => paymentMutation.mutate({ orderId: order._id, paymentStatus: "Pending" })}
                                  disabled={Boolean(savingId)}
                                  className="font-mono text-[10px] uppercase tracking-wider text-muted underline underline-offset-4 hover:text-accent disabled:opacity-40"
                                >
                                  {saving ? <Spinner className="h-3 w-3" /> : "undo"}
                                </button>
                              )}
                            </div>
                          ) : canVerify ? (
                            <button
                              onClick={() => paymentMutation.mutate({ orderId: order._id, paymentStatus: "Verified" })}
                              disabled={Boolean(savingId)}
                              aria-busy={saving}
                              className="btn-accent px-3.5 py-1.5 text-[11px]"
                            >
                              {saving ? <><Spinner className="h-3 w-3" /> Verifying…</> : "Verify ✓"}
                            </button>
                          ) : (
                            <span className="font-mono text-[11px] text-muted">awaiting cashier</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ))}
          </table>
        </div>

        {!isLoading && rows.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="No entries"
              text={orders.length ? "Nothing matches these filters." : "Payments appear here as soon as orders are placed."}
            />
          </div>
        )}

        {!isLoading && rows.length > 0 && (
          <div className="flex items-center justify-between border-t border-ink bg-paper px-5 py-3 font-mono text-xs">
            <span className="uppercase tracking-wider text-muted">{rows.length} entries shown</span>
            <span className="font-semibold text-ink">₹{formatMoney(sum(rows))}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;
