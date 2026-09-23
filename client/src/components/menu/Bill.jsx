import React, { useState } from "react";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { addOrder } from "../../https";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderPlaced, removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import { formatMoney } from "../../utils";
import { Spinner } from "../shared/ui";

const paymentOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Online", label: "Online · upi / card" },
];

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);

  // Function to calculate the total price
  const total = useSelector(getTotalPrice);
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();

  const hasGuest = Boolean(customerData.customerName && customerData.table);

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;

      // Keep the guest and table so they can order again; only the cart is cleared.
      // The server books the table as part of creating the order.
      setOrderInfo(data);
      dispatch(removeAllItems());
      dispatch(orderPlaced());
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });

      enqueueSnackbar("Order placed! Payment is waiting for the cashier to verify.", { variant: "success" });
      setShowInvoice(true);
    },
    onError: (error) => {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.message || "Couldn't place the order", { variant: "error" });
    },
  });

  const isPlacing = orderMutation.isPending;

  // function to place order
  const handlePlaceOrder = () => {
    if (isPlacing) return;

    if (!hasGuest) {
      enqueueSnackbar("Create an order and pick a table first", { variant: "warning" });
      return;
    }

    // Check the payment method is selected or not
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method", { variant: "warning" });
      return;
    }

    // Check, is there anything in card or not
    if (cartData.length === 0) {
      enqueueSnackbar("Please select something to order", { variant: "warning" });
      return;
    }

    // Payment is recorded as pending; a cashier verifies it from the ledger
    orderMutation.mutate({
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },
      orderStatus: "In Progress",
      bills: {
        total: total,
        tax: tax,
        totalWithTax: totalPriceWithTax,
      },
      items: cartData,
      table: customerData.table.tableId,
      paymentMethod: paymentMethod,
    });
  };

  const handleFinishGuest = () => {
    dispatch(removeCustomer());
    dispatch(removeAllItems());
    setOrderInfo(undefined);
    navigate("/tables");
  };

  const placeLabel = customerData.ordersPlaced > 0 ? "Place another order →" : "Place order →";

  return (
    <div className="px-6 pb-6 pt-4 font-mono text-xs">
      <div className="space-y-1 text-muted">
        <div className="flex justify-between">
          <span>items ({cartData.length})</span>
          <span>{formatMoney(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>tax {taxRate}%</span>
          <span>{formatMoney(tax)}</span>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-sm font-bold text-ink">
        <span>TOTAL</span>
        <span>₹{formatMoney(totalPriceWithTax)}</span>
      </div>

      <div className="rule-dashed my-4" />

      <p className="mono-label">payment</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {paymentOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPaymentMethod(value)}
            disabled={isPlacing}
            className={`rounded-lg border py-2 text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50 ${
              paymentMethod === value
                ? "border-ink bg-ink text-paper"
                : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted">
        recorded as pending — the cashier verifies it in the ledger.
      </p>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-2 font-sans">
        <button
          onClick={() => setShowInvoice(true)}
          disabled={!orderInfo || isPlacing}
          title={orderInfo ? "Reopen the last receipt" : "Place an order first"}
          className="btn-outline px-4 py-2.5 text-xs"
        >
          Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          aria-busy={isPlacing}
          className="btn-accent py-2.5 text-xs"
        >
          {isPlacing ? (
            <>
              <Spinner /> Placing order…
            </>
          ) : (
            placeLabel
          )}
        </button>
      </div>

      {hasGuest && customerData.ordersPlaced > 0 && (
        <button
          onClick={handleFinishGuest}
          disabled={isPlacing}
          className="mt-3 w-full text-center text-[11px] uppercase tracking-wider text-muted underline decoration-line underline-offset-4 hover:text-ink hover:decoration-ink disabled:opacity-50"
        >
          done with this guest → next table
        </button>
      )}

      {showInvoice && <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />}
    </div>
  );
};

export default Bill;
