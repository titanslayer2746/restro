import React, { useRef, useEffect } from "react";
import { RiDeleteBin2Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { removeItems } from "../../redux/slices/cartSlice";
import { formatMoney } from "../../utils";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const scrolRef = useRef();
  useEffect(() => {
    if (scrolRef.current) {
      scrolRef.current.scrollTo({
        top: scrolRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [cartData]);

  const handleRemove = (id) => {
    dispatch(removeItems(id));
  }

  return (
    <div className="px-6 pt-4">
      <p className="mono-label">order details</p>
      <div className="scrollHide mt-3 max-h-[34vh] overflow-y-auto" ref={scrolRef}>
        {/* Cart items */}
        {cartData.length === 0 ? (
          <p className="py-8 text-center font-mono text-xs text-muted">
            — cart is empty —
            <br />
            add dishes from the menu
          </p>
        ) : (
          <ul className="space-y-2 font-mono text-xs text-ink">
            {cartData.map((item, index) => (
              <li key={index} className="group flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">
                  {item.quantity}× {item.name}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {formatMoney(item.price)}
                  <button
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-muted transition-colors hover:text-accent"
                  >
                    <RiDeleteBin2Line size={14} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rule-dashed mt-4" />
    </div>
  );
};

export default CartInfo;
