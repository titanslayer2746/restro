import React from 'react'
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCustomers, getOrders, getTables } from "../../https";
import useMenu from "../../hooks/useMenu";
import { formatMoney } from "../../utils";
import { Skeleton } from "../shared/ui";

const DAY = 24 * 60 * 60 * 1000;
const WINDOW = 30 * DAY;

// Percentage change between this 30 days and the 30 days before it
const change = (current, previous) => {
  if (!previous) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return { percentage: `${Math.abs(pct)}%`, isIncrease: pct >= 0 };
};

const inWindow = (date, from, to) => {
  const t = new Date(date).getTime();
  return t >= from && t < to;
};

const Readout = ({ data, loading }) => (
  <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-ink bg-surface lg:grid-cols-4">
    {data.map((metric, index) => (
      <div
        key={metric.title}
        className={`px-5 py-4 ${index % 2 === 1 ? "border-l border-ink" : ""} ${
          index >= 2 ? "border-t border-ink lg:border-t-0" : ""
        } ${index === 2 ? "lg:border-l" : ""}`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="mono-label truncate">{metric.title}</p>
          {!loading && metric.trend && (
            <span
              className={`font-mono text-[11px] ${metric.trend.isIncrease ? "text-emerald-600" : "text-accent"}`}
              title="vs the previous 30 days"
            >
              {metric.trend.isIncrease ? "▲" : "▼"} {metric.trend.percentage}
            </span>
          )}
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-6 w-24" />
        ) : (
          <p className="mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {metric.value}
          </p>
        )}
        {metric.note && <p className="mt-1 font-mono text-[11px] text-muted">{metric.note}</p>}
      </div>
    ))}
  </div>
);

const useList = (key, fn) => {
  const query = useQuery({
    queryKey: [key],
    queryFn: async () => {
      return await fn();
    },
    placeholderData: keepPreviousData,
  });
  return { list: query.data?.data.data ?? query.data?.data.tables ?? [], isLoading: query.isLoading };
};

const Metrics = () => {
  const orders = useList("orders", getOrders);
  const customers = useList("customers", getCustomers);
  const tables = useList("tables", getTables);
  const { menu, isLoading: menuLoading } = useMenu();

  const now = Date.now();
  const current = orders.list.filter((o) => inWindow(o.orderDate, now - WINDOW, now + DAY));
  const previous = orders.list.filter((o) => inWindow(o.orderDate, now - 2 * WINDOW, now - WINDOW));
  const revenue = (list) => list.reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

  const newCustomers = customers.list.filter((c) => inWindow(c.createdAt, now - WINDOW, now + DAY)).length;
  const prevCustomers = customers.list.filter((c) => inWindow(c.createdAt, now - 2 * WINDOW, now - WINDOW)).length;

  const avg = (list) => (list.length ? revenue(list) / list.length : 0);

  const performance = [
    { title: "Revenue", value: `₹${formatMoney(revenue(current))}`, trend: change(revenue(current), revenue(previous)) },
    { title: "Orders", value: current.length, trend: change(current.length, previous.length) },
    { title: "New customers", value: newCustomers, trend: change(newCustomers, prevCustomers), note: `${customers.list.length} all-time` },
    { title: "Avg. order", value: `₹${formatMoney(avg(current))}`, trend: change(avg(current), avg(previous)) },
  ];

  const booked = tables.list.filter((t) => t.status === "Booked").length;
  const items = [
    { title: "Categories", value: menu.length },
    { title: "Dishes", value: menu.reduce((sum, c) => sum + c.items.length, 0) },
    { title: "Active orders", value: orders.list.filter((o) => o.orderStatus === "In Progress").length, note: "in progress now" },
    { title: "Tables", value: tables.list.length, note: `${booked} booked right now` },
  ];

  return (
    <div>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight text-ink'>Overall performance</h2>
          <p className="mt-1 text-sm text-muted">
            Last 30 days, compared with the 30 days before.
          </p>
        </div>
        <span className='rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted'>
          last 30 days
        </span>
      </div>

      <div className="mt-5">
        <Readout data={performance} loading={orders.isLoading || customers.isLoading} />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Item details
        </h2>
        <p className="mt-1 text-sm text-muted">
          What's on the menu and on the floor right now.
        </p>
      </div>

      <div className="mt-5">
        <Readout data={items} loading={menuLoading || orders.isLoading || tables.isLoading} />
      </div>
    </div>
  )
}

export default Metrics
