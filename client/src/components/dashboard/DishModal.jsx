import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import Modal from "../shared/Modal";
import { Spinner } from "../shared/ui";
import { addDish } from "../../https";
import useMenu from "../../hooks/useMenu";

const tags = ["", "Vegetarian", "Non-Vegetarian"];

const DishModal = ({ onClose, onAddCategory }) => {
  const queryClient = useQueryClient();
  const { menu, isLoading } = useMenu();
  const [form, setForm] = useState({ name: "", price: "", categoryId: "", tag: "" });

  // Fall back to the first category until one is picked
  const categoryId = form.categoryId || menu[0]?._id || "";

  const mutation = useMutation({
    mutationFn: (data) => addDish(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      enqueueSnackbar(res.data.message, { variant: "success" });
      onClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Couldn't add the dish", { variant: "error" });
    },
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      name: form.name.trim(),
      price: Number(form.price),
      categoryId,
      tag: form.tag,
    });
  };

  const close = () => !mutation.isPending && onClose();
  const busy = mutation.isPending;

  return (
    <Modal isOpen title="Add dish" label="menu / dishes" onClose={close}>
      {!isLoading && menu.length === 0 ? (
        <div className="text-center">
          <p className="text-sm text-muted">Dishes live inside a category, and there aren't any yet.</p>
          <button onClick={onAddCategory} className="btn-primary mt-5 w-full">
            Add a category first →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="field-label">Dish name</label>
          <input
            autoFocus
            value={form.name}
            onChange={set("name")}
            maxLength={60}
            placeholder="e.g. Masala Chai"
            className="field"
            disabled={busy}
            required
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Price (₹)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                value={form.price}
                onChange={set("price")}
                placeholder="0.00"
                className="field font-mono"
                disabled={busy}
                required
              />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select
                value={categoryId}
                onChange={set("categoryId")}
                className="field"
                disabled={busy || isLoading}
                required
              >
                {isLoading && <option>Loading…</option>}
                {menu.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="field-label mt-4">Label</p>
          <div className="grid grid-cols-3 gap-2">
            {tags.map((tag) => (
              <button
                key={tag || "none"}
                type="button"
                onClick={() => setForm((f) => ({ ...f, tag }))}
                disabled={busy}
                className={`rounded-lg border py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  form.tag === tag ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {tag || "none"}
              </button>
            ))}
          </div>

          <button type="submit" disabled={busy || isLoading} aria-busy={busy} className="btn-primary mt-6 w-full">
            {busy ? <><Spinner /> Adding…</> : "Add dish →"}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default DishModal;
