import React from "react";
import { formatDateAndTime, formatMoney, getOrderNo, pad } from "../../utils/index";
import { StatusPill } from "../shared/ui";

const MAX_LINES = 3;

// An order rendered as a kitchen order ticket (KOT)
const OrderCart = ({ order }) => {
  const extra = order.items.length - MAX_LINES;

  return (
    <article className="ticket-shadow">
      <span className="mx-auto -mb-px block h-3 w-12 rounded-b-md bg-ink" />
      <div className="bg-white px-5 pb-5 pt-4">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted">
          <span>KOT · T-{pad(order.table?.tableNo)}</span>
          <span>#{getOrderNo(order)}</span>
        </div>

        <div className="rule-dashed my-3" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-tight text-ink">
              {order.customerDetails.name}
            </h3>
            <p className="font-mono text-[11px] text-muted">
              {order.customerDetails.guests} guests · dine in
            </p>
          </div>
          <StatusPill status={order.orderStatus} />
        </div>

        {/* Items */}
        <ul className="mt-4 space-y-1 font-mono text-xs text-ink">
          {order.items.slice(0, MAX_LINES).map((item, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="truncate">
                {item.quantity}× {item.name}
              </span>
              <span className="shrink-0 text-muted">{formatMoney(item.price)}</span>
            </li>
          ))}
          {extra > 0 && <li className="text-muted">+ {extra} more</li>}
        </ul>

        <div className="rule-dashed my-3" />

        {/* Total */}
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">Total</span>
          <span className="font-mono text-sm font-bold text-ink">₹{formatMoney(order.bills.totalWithTax)}</span>
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted">{formatDateAndTime(order.createdAt)}</p>
      </div>
      <div className="receipt-edge" />
    </article>
  );
};

export default OrderCart;
