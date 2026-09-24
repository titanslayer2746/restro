import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addTable, getTables } from "../../https";
import { enqueueSnackbar } from "notistack"
import { pad } from "../../utils";
import { Spinner } from "../shared/ui";

const MAX_SEATS = 20;
const presets = [2, 4, 6, 8];

const Modal = ({ setIsTableModalOpen }) => {
  const queryClient = useQueryClient();
  const [seats, setSeats] = useState(4);

  // Only used to preview the number the server will assign
  const { data: tablesRes, isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await getTables();
    },
  });
  const tables = tablesRes?.data.tables || [];
  const nextNo = tables.reduce((max, t) => Math.max(max, t.tableNo), 0) + 1;

  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: (res) => {
        const { data } = res;
        queryClient.invalidateQueries({ queryKey: ["tables"] });
        enqueueSnackbar(data.message, { variant: "success" })
        setIsTableModalOpen(false);
    },
    onError: (error) => {
        enqueueSnackbar(error.response?.data?.message || "Couldn't add the table", { variant: "error" })
        console.log(error);
    }
  })

  const isSaving = tableMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    tableMutation.mutate({ seats });
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsTableModalOpen(false);
  };

  const changeSeats = (delta) => setSeats((s) => Math.min(MAX_SEATS, Math.max(1, s + delta)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-ink bg-surface shadow-[0_30px_80px_-30px_rgba(22,20,15,0.5)]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ink px-5 py-3">
          <div>
            <p className="mono-label">floor / ground</p>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Add table</h2>
          </div>
          <button
            onClick={handleCloseModal}
            disabled={isSaving}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink disabled:opacity-40"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5">
          {/* Preview of the new table */}
          <div className="bg-dots flex items-center gap-4 rounded-xl border border-line p-4">
            <div className="flex aspect-square w-24 shrink-0 flex-col justify-between rounded-xl border border-ink bg-surface p-2.5">
              <span className="font-mono text-[11px] text-muted">
                {tablesLoading ? "T-··" : `T-${pad(nextNo)}`}
              </span>
              <span className="flex flex-wrap gap-[3px]">
                {Array.from({ length: seats }).map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                ))}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              The table number is assigned automatically. This one will be{" "}
              <span className="font-mono text-ink">{tablesLoading ? "…" : `T-${pad(nextNo)}`}</span>.
            </p>
          </div>

          <label className="field-label mt-5">Number of seats</label>
          <div className="flex items-center justify-between rounded-lg border border-line bg-surface p-1.5">
            <button
              type="button"
              onClick={() => changeSeats(-1)}
              disabled={isSaving || seats <= 1}
              aria-label="Fewer seats"
              className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-ink hover:bg-paper disabled:opacity-30"
            >
              &minus;
            </button>
            <span className="font-mono text-lg font-semibold tabular-nums text-ink">{pad(seats)}</span>
            <button
              type="button"
              onClick={() => changeSeats(1)}
              disabled={isSaving || seats >= MAX_SEATS}
              aria-label="More seats"
              className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-ink hover:bg-paper disabled:opacity-30"
            >
              &#43;
            </button>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-2">
            {presets.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSeats(n)}
                disabled={isSaving}
                className={`rounded-lg border py-1.5 font-mono text-xs transition-colors ${
                  seats === n ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button type="submit" disabled={isSaving} aria-busy={isSaving} className="btn-primary mt-6 w-full">
            {isSaving ? <><Spinner /> Adding table…</> : "Add table →"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
