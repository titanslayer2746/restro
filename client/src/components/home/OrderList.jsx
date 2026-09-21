import React from "react";
import { getAvatarName, pad } from "../../utils/index";
import { Initials, StatusPill } from "../shared/ui";

const OrderList = ({ order }) => {
  return (
    <div className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
      {/* user box */}
      <Initials>{getAvatarName(order.customerDetails.name)}</Initials>

      {/* user and it's item count */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {order.customerDetails.name}
        </p>
        <p className="font-mono text-[11px] text-muted">{order.items.length} items</p>
      </div>

      {/* Booked Table no. */}
      <span className="hidden rounded-md border border-ink px-2 py-0.5 font-mono text-[11px] text-ink sm:inline">
        T-{pad(order.table?.tableNo)}
      </span>

      {/* Item ready or not */}
      <StatusPill status={order.orderStatus} />
    </div>
  );
};

export default OrderList;
