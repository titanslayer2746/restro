import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import Modal from "../shared/Modal";
import { Spinner } from "../shared/ui";
import { addCategory } from "../../https";
import useMenu from "../../hooks/useMenu";

const CategoryModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { menu } = useMenu();
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: (data) => addCategory(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      enqueueSnackbar(res.data.message, { variant: "success" });
      onClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Couldn't add the category", { variant: "error" });
    },
  });

  const trimmed = name.trim();
  const duplicate = menu.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trimmed || duplicate) return;
    mutation.mutate({ name: trimmed });
  };

  const close = () => !mutation.isPending && onClose();

  return (
    <Modal isOpen title="Add category" label="menu / categories" onClose={close}>
      <form onSubmit={handleSubmit}>
        <label className="field-label">Category name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="e.g. Breakfast"
          className="field"
          disabled={mutation.isPending}
          required
        />
        {duplicate && <p className="mt-1.5 font-mono text-[11px] text-accent">that category already exists</p>}

        {menu.length > 0 && (
          <>
            <p className="field-label mt-5">Already on the menu</p>
            <div className="flex flex-wrap gap-1.5">
              {menu.map((c) => (
                <span key={c._id} className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {c.name}
                </span>
              ))}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !trimmed || duplicate}
          aria-busy={mutation.isPending}
          className="btn-primary mt-6 w-full"
        >
          {mutation.isPending ? <><Spinner /> Adding…</> : "Add category →"}
        </button>
      </form>
    </Modal>
  );
};

export default CategoryModal;
