import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatDate, pad } from "../../utils";

const CustomerInfo = () => {

  const [date] = useState(new Date());

  const customerData = useSelector(state => state.customer)
  const { customerName } = customerData;
  const customerNameDisplay = customerName ? customerName : "Customer Name";
  const customerId = customerData.OrderId;
  const customerIdDisplay = customerId ? customerId.slice(-6) : "N/A";
  const tableNo = customerData.table?.tableNo;

  return (
    <div className="px-6 pt-7 text-center font-mono">
      <p className="text-sm font-bold tracking-[0.35em] text-ink">RESTRO</p>
      <p className="mt-2 font-sans text-base font-semibold tracking-tight text-ink">
        {customerNameDisplay}
      </p>
      <p className="mt-1 text-[11px] text-muted">
        #{customerIdDisplay} · dine in{tableNo ? ` · T-${pad(tableNo)}` : ""}
      </p>
      <p className="text-[11px] text-muted">{formatDate(date)}</p>
      {customerData.ordersPlaced > 0 && (
        <p className="mx-auto mt-2 w-fit rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-accent">
          order {pad(customerData.ordersPlaced + 1)} for this guest
        </p>
      )}
      <div className="rule-dashed mt-4" />
    </div>
  );
};

export default CustomerInfo;
