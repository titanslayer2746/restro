import React, { useEffect } from "react";
import { Skeleton, Spinner, StatusPill } from "../shared/ui";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";
import { formatDateAndTime, formatMoney, getOrderNo, pad } from "../../utils";
import { updateOrderStatus } from "../../https/index";

const RecentOrders = () => {
  const queryClient = useQueryClient();

  const handleStatusChange = ({orderId, orderStatus}) => {
    orderStatusUpdateMutation.mutate({orderId, orderStatus});
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({orderId, orderStatus}) => updateOrderStatus({orderId, orderStatus}),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refresh order list
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", { variant: "error" });
    }
  })

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

  // The row whose status is being saved right now
  const updatingId = orderStatusUpdateMutation.isPending ? orderStatusUpdateMutation.variables?.orderId : null;

  const orders = resData?.data.data || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-ink bg-surface">
      <div className="flex items-center justify-between border-b border-ink px-5 py-3">
        <h2 className="font-semibold tracking-tight text-ink">Recent orders</h2>
        <span className="mono-label">{orders.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm text-ink">
          <thead className="border-b border-line bg-paper font-mono text-[10px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-normal">Order</th>
              <th className="px-5 py-3 font-normal">Customer</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Date & time</th>
              <th className="px-5 py-3 font-normal">Items</th>
              <th className="px-5 py-3 font-normal">Table</th>
              <th className="px-5 py-3 text-right font-normal">Total</th>
              <th className="px-5 py-3 font-normal">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                className="border-b border-line last:border-b-0 hover:bg-paper/60"
              >
                <td className="px-5 py-3.5 font-mono text-xs">#{getOrderNo(order)}</td>
                <td className="px-5 py-3.5 font-medium">{order.customerDetails.name}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2">
                  <select
                    disabled={updatingId === order._id}
                    className={`rounded-full border bg-surface py-1 pl-3 pr-7 font-mono text-[11px] uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ink/10 ${
                      order.orderStatus === "Completed"
                        ? "border-line text-muted"
                        : order.orderStatus === "Ready"
                        ? "border-emerald-500 text-emerald-700"
                        : "border-accent text-accent"
                    }`}
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange({orderId: order._id, orderStatus: e.target.value})}
                  >
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Ready">
                      Ready
                    </option>
                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                  {updatingId === order._id && <Spinner className="text-muted" />}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-muted">{formatDateAndTime(order.orderDate)}</td>
                <td className="px-5 py-3.5 font-mono text-xs">{order.items.length}</td>
                <td className="px-5 py-3.5 font-mono text-xs">T-{pad(order.table?.tableNo)}</td>
                <td className="px-5 py-3.5 text-right font-mono text-xs">₹{formatMoney(order.bills.totalWithTax)}</td>
                <td className="px-5 py-3.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                  <span className="flex items-center gap-2">
                    {order.paymentMethod}
                    <StatusPill status={order.paymentStatus || "Pending"} />
                  </span>
                </td>
              </tr>
            ))}
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-5 py-4">
                      <Skeleton className="h-3 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}
            {!isLoading && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center font-mono text-xs text-muted">
                  no orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;