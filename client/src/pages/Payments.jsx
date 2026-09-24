import React from "react";
import BottomNav from "../components/shared/BottomNav";
import Ledger from "../components/ledger/Ledger";
import { PageHeader } from "../components/shared/ui";

const Payments = () => {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-32 pt-8 md:px-10">
      <PageHeader index="05" name="ledger" title="Payments">
        <p className="max-w-xs text-right font-mono text-[11px] leading-relaxed text-muted">
          count the cash or check the transfer, then verify it here.
        </p>
      </PageHeader>

      <div className="mt-8">
        <Ledger />
      </div>

      <BottomNav />
    </section>
  );
};

export default Payments;
