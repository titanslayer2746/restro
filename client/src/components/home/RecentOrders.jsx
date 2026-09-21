import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";
import { Skeleton } from "../shared/ui";

const RecentOrders = () => {
  const [search, setSearch] = useState("");

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

  const query = search.trim().toLowerCase();
  const orders = (resData?.data.data || []).filter(
    (order) =>
      !query ||
      order.customerDetails.name?.toLowerCase().includes(query) ||
      String(order.table?.tableNo).includes(query)
  );

  return (
    <div className="panel mt-8">
      {/* Recent Orders */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          <h2 className="font-semibold tracking-tight text-ink">Recent orders</h2>
        </div>
        <Link to="/orders" className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink">
          view all →
        </Link>
      </div>

      {/* SEARCH */}
      <div className="px-5 pt-4">
        <label className="flex items-center gap-3 rounded-lg border border-line bg-paper px-3.5 py-2 focus-within:border-ink">
          <FaSearch className="text-muted" size={12} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or table"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
          />
        </label>
      </div>

      {/* Order List */}
      <div className="scrollHide max-h-[380px] overflow-y-auto px-5 py-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2.5 w-1/5" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))
        ) : orders.length > 0 ? (
          orders.map((order, index) => {
            return <OrderList key={index} order={order} />;
          })
        ) : (
          <p className="py-10 text-center font-mono text-xs text-muted">
            {query ? "no matching orders" : "no orders yet — the rail is empty"}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;
