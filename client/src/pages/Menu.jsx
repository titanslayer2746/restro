import React from "react";
import BottomNav from "../components/shared/BottomNav";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";
import { PageHeader, Initials } from "../components/shared/ui";
import { getAvatarName, pad } from "../utils";

const Menu = () => {

  const customerData = useSelector(state => state.customer)
  const { customerName } = customerData;
  const tableNo = customerData.table?.tableNo;

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-32 pt-8 md:px-10 lg:grid-cols-[1fr_360px]">
      {/* Left div */}
      <div className="min-w-0">
        <PageHeader index="04" name="menu" title="Menu">
          {/* Selected customer and table */}
          <div className="flex items-center gap-3 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-4">
            <Initials className="h-8 w-8 rounded-full">{getAvatarName(customerName)}</Initials>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">{customerName || "No customer"}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {tableNo ? `table T-${pad(tableNo)}` : "no table selected"}
              </p>
            </div>
          </div>
        </PageHeader>

        <MenuContainer />
      </div>

      {/* Right div: the live bill, styled as a receipt */}
      <aside className="ticket-shadow self-start lg:sticky lg:top-20">
        <div className="bg-white">
          {/* Customer Info */}
          <CustomerInfo />

          {/* Cart Info */}
          <CartInfo />

          {/* Bills */}
          <Bill />
        </div>
        <div className="receipt-edge" />
      </aside>

      <BottomNav />
    </section>
  );
};

export default Menu;
