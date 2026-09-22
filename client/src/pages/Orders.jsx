import React, { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack";
import { EmptyState, PageHeader, Segmented, Skeleton } from "../components/shared/ui";

const statuses = ["All", "In Progress", "Ready", "Completed"];

const Orders = () => {
  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) enqueueSnackbar("Couldn't load orders", { variant: "error" });
  }, [isError]);

  const [status, setStatus] = useState("All");

  const allOrders = resData?.data.data || [];

  // Filter logic based on selected status
  const filteredOrders =
    status === "All" ? allOrders : allOrders.filter((order) => order.orderStatus === status);

  const counts = Object.fromEntries(
    statuses.map((s) => [s, s === "All" ? allOrders.length : allOrders.filter((o) => o.orderStatus === s).length])
  );

  return (
    <section className="mx-auto max-w-7xl px-5 pb-32 pt-8 md:px-10">
      <PageHeader index="03" name="rail" title="Orders">
        <Segmented options={statuses} value={status} onChange={setStatus} counts={counts} />
      </PageHeader>

      {/* Order rail */}
      <div className="mt-10 h-2.5 rounded-full bg-gradient-to-b from-[#d9d5cc] to-[#b9b4a8] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" />

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading orders">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 bg-white p-5">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOrders.map((order, index) => (
              <OrderCard key={index} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={status === "All" ? "No orders on the rail" : `No ${status.toLowerCase()} orders`}
            text="New orders appear here as soon as they're placed from the menu."
          />
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
