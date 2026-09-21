import React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../../https";
import { pad } from "../../utils";
import { Skeleton } from "../shared/ui";

const TOP = 10;

// Most-ordered dishes, counted by quantity across all orders
const rankDishes = (orders) => {
  const counts = new Map();
  for (const order of orders) {
    for (const item of order.items || []) {
      if (!item?.name) continue;
      counts.set(item.name, (counts.get(item.name) || 0) + (Number(item.quantity) || 1));
    }
  }
  return [...counts.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, TOP);
};

const PopularDishes = () => {
  // Shares the "orders" cache with the rest of the home screen
  const { data: resData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  const dishes = rankDishes(resData?.data.data || []);
  const max = dishes[0]?.quantity || 1;

  return (
    <div className="panel lg:sticky lg:top-20">
      {/* Popular Dish tag */}
      <div className="flex items-baseline justify-between border-b border-line px-5 py-3.5">
        <h2 className="font-semibold tracking-tight text-ink">Popular dishes</h2>
        <span className="mono-label">by qty ordered</span>
      </div>

      {/* Dishes List */}
      <ol className="scrollHide max-h-[calc(100vh-14rem)] overflow-y-auto px-5 py-2">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 border-b border-line py-3.5 last:border-b-0">
              <Skeleton className="h-3 w-6" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-1 w-full" />
              </div>
            </li>
          ))}

        {!isLoading && dishes.length === 0 && (
          <li className="py-10 text-center font-mono text-xs text-muted">
            no orders yet — rankings appear
            <br />
            after the first ticket
          </li>
        )}

        {dishes.map((dish, index) => (
          <li key={dish.name} className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
            <span className="w-6 font-mono text-xs text-muted">{pad(index + 1)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{dish.name}</p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full ${index === 0 ? "bg-accent" : "bg-ink"}`}
                  style={{ width: `${(dish.quantity / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-xs tabular-nums text-ink">{dish.quantity}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default PopularDishes;
