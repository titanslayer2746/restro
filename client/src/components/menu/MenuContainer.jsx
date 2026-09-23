import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import useMenu from "../../hooks/useMenu";
import { EmptyState, Skeleton } from "../shared/ui";

const MAX_QTY = 4;

const MenuContainer = () => {
  const { menu, isLoading, isError, refetch } = useMenu();
  const { role } = useSelector((state) => state.user);

  const [selectedId, setSelectedId] = useState();
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState();
  const dispatch = useDispatch();

  // Default to the first category once the menu has loaded
  const selected = menu.find((category) => category._id === selectedId) || menu[0];

  const handleAddToCart = (item) => {
    if (itemCount === 0 || item._id !== itemId) return;

    const {name, price} = item;
    const newObj = { id: new Date().toISOString(), name, pricePerQuantity: price, quantity: itemCount, price: itemCount * price };

    dispatch(addItems(newObj));
    setItemCount(0);
  }

  // The stepper tracks one dish at a time; touching another dish starts it fresh
  const increment = (id) => {
    if (id !== itemId) {
      setItemId(id);
      setItemCount(1);
      return;
    }
    setItemCount((count) => Math.min(MAX_QTY, count + 1));
  };

  const decrement = (id) => {
    if (id !== itemId) return;
    setItemCount((count) => Math.max(0, count - 1));
  };

  if (isLoading) {
    return (
      <div aria-label="Loading menu">
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[118px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8">
        <EmptyState title="Couldn't load the menu" text="Check your connection and try again." />
        <div className="mt-4 flex justify-center">
          <button onClick={() => refetch()} className="btn-outline px-4 py-2 text-xs">Retry</button>
        </div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="mt-8">
        <EmptyState
          title="The menu is empty"
          text={role === "Admin" ? "Add a category and some dishes from the dashboard." : "Ask an admin to add categories and dishes."}
        />
      </div>
    );
  }

  return (
    <>
      {/* Categories */}
      <div className="scrollHide -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        {menu.map((category) => {
          const active = selected._id === category._id;
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => {
                setSelectedId(category._id);
                setItemId(undefined);
                setItemCount(0);
              }}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-ink hover:border-ink"
              }`}
            >
              {category.name}
              <span className={`font-mono text-[10px] ${active ? "text-paper/60" : "text-muted"}`}>
                {String(category.items.length).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-baseline justify-between border-t border-ink pt-3">
        <span className="mono-label text-ink">{selected.name}</span>
        <span className="mono-label">set qty, then add</span>
      </div>

      {/* Dishes */}
      {selected.items.length === 0 ? (
        <div className="mt-5">
          <EmptyState title={`No dishes in ${selected.name} yet`} text={role === "Admin" ? "Add some from the dashboard." : undefined} />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {selected.items.map((item) => {
            const count = item._id === itemId ? itemCount : 0;
            return (
              <div
                key={item._id}
                className="panel flex flex-col justify-between gap-5 p-4 transition-colors hover:border-ink"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug text-ink">{item.name}</h3>
                    {item.tag && (
                      <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                        <span className={`h-1.5 w-1.5 rounded-full ${/non/i.test(item.tag) ? "bg-accent" : "bg-emerald-500"}`} />
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-sm text-ink">₹{item.price}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Quantity stepper */}
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      onClick={() => decrement(item._id)}
                      aria-label={`Decrease ${item.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-paper"
                    >
                      &minus;
                    </button>
                    <span className="w-6 text-center font-mono text-xs tabular-nums text-ink">{count}</span>
                    <button
                      onClick={() => increment(item._id)}
                      aria-label={`Increase ${item.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-paper"
                    >
                      &#43;
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={count === 0}
                    className="rounded-full bg-accent px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white transition-colors hover:bg-accent-dark disabled:bg-line disabled:text-muted"
                  >
                    add →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MenuContainer;
