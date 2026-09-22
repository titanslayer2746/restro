import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BottomNav from "../components/shared/BottomNav";
import TableCard from "../components/tables/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";
import { EmptyState, PageHeader, Segmented, Skeleton } from "../components/shared/ui";

const Tables = () => {
  const [status, setStatus] = useState("All");
  const customer = useSelector((state) => state.customer);

  const { data: resData, isError, isLoading }  = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await getTables();
    },
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    if (isError) enqueueSnackbar("Couldn't load tables", { variant: "error" });
  }, [isError]);

  const allTables = resData?.data.tables || [];
  const filteredTables = status === "All" ? allTables : allTables.filter((table) => table.status === status);

  const counts = {
    All: allTables.length,
    Available: allTables.filter((t) => t.status === "Available").length,
    Booked: allTables.filter((t) => t.status === "Booked").length,
  };
  const seatsFree = allTables
    .filter((t) => t.status === "Available")
    .reduce((sum, t) => sum + (Number(t.seats) || 0), 0);

  return (
    <section className="mx-auto max-w-7xl px-5 pb-32 pt-8 md:px-10">
      <PageHeader index="02" name="floor" title="Tables">
        <Segmented
          options={["All", "Available", "Booked"]}
          value={status}
          onChange={setStatus}
          counts={counts}
        />
      </PageHeader>

      {/* Seating hint when an order is being created */}
      {customer.customerName && !customer.table && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-accent bg-accent-soft px-4 py-3 text-sm text-ink">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Seating <strong>{customer.customerName}</strong>
          <span className="font-mono text-xs text-muted">· {customer.guests} guests</span>
          <span className="text-muted">— pick a free table to open the menu.</span>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink bg-surface">
        <div className="flex items-center justify-between border-b border-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider">
          <span>floor / ground</span>
          <span className="text-muted">free tables open the menu</span>
        </div>

        <div className="bg-dots p-4 sm:p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6" aria-label="Loading tables">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : filteredTables.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {filteredTables.map((table,index) => (
                <TableCard key={index} _id={table._id} name={table.tableNo} status={table.status} initials={table?.currentOrder?.customerDetails.name} seats={table.seats} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={allTables.length ? `No ${status.toLowerCase()} tables` : "No tables yet"}
              text={allTables.length ? "Try another filter." : "An admin can add tables from the dashboard."}
            />
          )}
        </div>

        <div className="grid grid-cols-3 border-t border-ink font-mono">
          {[
            ["available", counts.Available],
            ["booked", counts.Booked],
            ["seats free", seatsFree],
          ].map(([k, v], i) => (
            <div key={k} className={`px-4 py-3 ${i > 0 ? "border-l border-ink" : ""}`}>
              <p className="text-[10px] uppercase tracking-wider text-muted">{k}</p>
              {isLoading ? (
                <Skeleton className="mt-1.5 h-5 w-10" />
              ) : (
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{String(v).padStart(2, "0")}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
