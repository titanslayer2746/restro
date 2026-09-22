import React, { useEffect, useState } from "react";
import { getAvatarName, pad } from '../../utils/index'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { removeCustomer, updateTable } from "../../redux/slices/customerSlice";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { clearTable } from "../../https";
import { Spinner } from "../shared/ui";

const TableCard = ({ _id, name, status, seats, initials}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentTableId = useSelector((state) => state.customer.table?.tableId);
  const booked = status === "Booked";
  // The guest being served right now can go back to their own (booked) table to order again
  const isCurrentGuest = booked && currentTableId === _id;
  const locked = booked && !isCurrentGuest;

  // Clearing takes two taps: the first arms it, the second frees the table
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timer);
  }, [confirming]);

  const clearMutation = useMutation({
    mutationFn: () => clearTable(_id),
    onSuccess: (res) => {
      // If this was the guest being served, their session is over too
      if (isCurrentGuest) {
        dispatch(removeCustomer());
        dispatch(removeAllItems());
      }
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar(res.data.message, { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Couldn't clear the table", { variant: "error" });
    },
    onSettled: () => setConfirming(false),
  });

  const handleClear = () => {
    if (clearMutation.isPending) return;
    if (!confirming) return setConfirming(true);
    clearMutation.mutate();
  };

  // Function to handle click on table card
  // If the table is booked by someone else, do nothing else navigate to menu page
  const handleClick = () => {
    if( locked ) return
    if( isCurrentGuest ) return navigate('/menu');

    const table = { tableId: _id, tableNo: name }

    // Dispatch the action to set the table number
    dispatch( updateTable({ table }));

    navigate('/menu');
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={locked || clearMutation.isPending}
        aria-label={`Table ${name}, ${seats} seats, ${status}`}
        className={`group relative flex aspect-square w-full flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 ${
          booked
            ? `border-ink bg-ink text-paper ${isCurrentGuest ? "ring-2 ring-accent ring-offset-2 ring-offset-paper" : "cursor-not-allowed"}`
            : "border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_10px_24px_-14px_rgba(22,20,15,0.4)]"
        } ${clearMutation.isPending ? "opacity-60" : ""}`}
      >
        {/* Table No. and status dot */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs opacity-70">T-{pad(name)}</span>
          <span className={`h-2 w-2 rounded-full ${booked ? "animate-pulse bg-accent" : "bg-emerald-500"}`} />
        </div>

        {/* Guest initials on booked tables */}
        <div className="flex justify-center">
          {booked ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/30 font-mono text-sm font-semibold">
              {getAvatarName(initials) || "—"}
            </span>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted opacity-0 transition-opacity group-hover:opacity-100">
              seat here →
            </span>
          )}
        </div>

        {/* Seats on the table */}
        <div>
          <span className="flex flex-wrap gap-[3px]">
            {Array.from({ length: Math.min(Number(seats) || 0, 12) }).map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${booked ? "bg-paper/60" : "bg-ink/25"}`} />
            ))}
          </span>
          <span className="mt-1.5 flex items-baseline justify-between text-xs">
            <span className="font-medium">{booked ? "Booked" : "Available"}</span>
            <span className="font-mono opacity-60">{seats} seats</span>
          </span>
        </div>
      </button>

      {/* Free the table once the guest has left */}
      {booked && (
        <button
          type="button"
          onClick={handleClear}
          disabled={clearMutation.isPending}
          aria-busy={clearMutation.isPending}
          aria-label={confirming ? `Confirm clearing table ${name}` : `Clear table ${name}`}
          className={`absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
            confirming
              ? "border-accent bg-accent text-white"
              : "border-paper/30 text-paper/80 hover:border-paper hover:text-paper"
          }`}
        >
          {clearMutation.isPending ? (
            <>
              <Spinner className="h-2.5 w-2.5" /> clearing
            </>
          ) : confirming ? (
            "sure?"
          ) : (
            "clear"
          )}
        </button>
      )}
    </div>
  );
};

export default TableCard;
