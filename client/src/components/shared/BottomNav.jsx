import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder } from "react-icons/md";
import { MdTableBar } from "react-icons/md";
import { MdReceiptLong } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";
import Modal from "./Modal";

const BottomNav = () => {
  // Hooks
  // useLocation is used to get the current location
  const location = useLocation();
  // useNavigate is used to navigate to different routes
  const navigate = useNavigate();
  // useDispatch is used to dispatch actions to the Redux store
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.user);
  const canSeeLedger = role === "Cashier" || role === "Admin";

  // State to manage the modal open and close
  // useState is used to manage the state of the component
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to manage the number of guests
  const [guestCount, setGuestCount] = useState(0);

  // Modal open and close handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // State to manage the customer name and phone
  const [name, setName] = useState();
  const [phone, setPhone] = useState();

  // State to manage the number of guests
  const increment = () => {
    if (guestCount >= 6) return;
    setGuestCount((count) => count + 1);
  };
  const decrement = () => {
    if (guestCount <= 0) return;
    setGuestCount((count) => count - 1);
  };

  // Function to check if the current path is active
  const isActive = path => location.pathname === path;

  const handleCreateOrder = () => {
    if (!name || !phone || guestCount <= 0) {
      alert("Please fill all the fields");
      return;
    }

    // Dispatch the action to set the customer details
    dispatch(setCustomer({ name, phone, guests: guestCount }));

    // Close the modal
    closeModal();

    // Navigate to the table page
    navigate("/tables");
  }

  const orderDisabled = isActive("/tables") || isActive("/menu");

  const navItem = (path) =>
    `flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors sm:px-4 ${
      isActive(path) ? "bg-ink text-paper" : "text-muted hover:text-ink"
    }`;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
        <div className="flex items-center gap-1 rounded-full border border-ink bg-surface/95 p-1.5 shadow-[0_18px_40px_-18px_rgba(22,20,15,0.45)] backdrop-blur">
          {/* Home Button */}
          <button onClick={() => navigate("/home")} className={navItem("/home")}>
            <FaHome size={14} />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Order Page */}
          <button onClick={() => navigate("/orders")} className={navItem("/orders")}>
            <MdOutlineReorder size={16} />
            <span className="hidden sm:inline">Orders</span>
          </button>

          {/* Order Button */}
          <button
            disabled={orderDisabled}
            onClick={openModal}
            aria-label="Create order"
            className="mx-1 flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            <BiSolidDish size={16} />
            <span className="hidden sm:inline">New order</span>
          </button>

          {/* Tables Page */}
          <button onClick={() => navigate("/tables")} className={navItem("/tables")}>
            <MdTableBar size={16} />
            <span className="hidden sm:inline">Tables</span>
          </button>

          {/* Payments ledger (cashiers and admins) */}
          {canSeeLedger && (
            <button onClick={() => navigate("/payments")} className={navItem("/payments")}>
              <MdReceiptLong size={16} />
              <span className="hidden sm:inline">Ledger</span>
            </button>
          )}
        </div>
      </nav>

      {/* Modal for creating order */}
      <Modal title="Create Order" isOpen={isModalOpen} onClose={closeModal}>
        {/* name entry */}
        <div>
          <label className="field-label">Customer Name</label>
          <input
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Enter customer name"
            className="field"
          />
        </div>

        {/* phone detail */}
        <div className="mt-4">
          <label className="field-label">Customer Phone</label>
          <input
            value={phone || ""}
            onChange={(e) => setPhone(e.target.value)}
            type="number"
            placeholder="+91-9999999999"
            className="field"
          />
        </div>

        {/* No of people */}
        <div className="mt-4">
          <label className="field-label">Number of guests</label>
          <div className="flex items-center justify-between rounded-lg border border-line bg-surface p-1.5">
            <button
              onClick={decrement}
              aria-label="Fewer guests"
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-ink hover:bg-paper"
            >
              &minus;
            </button>
            <span className="font-mono text-sm tabular-nums text-ink">
              {String(guestCount).padStart(2, "0")} guests
            </span>
            <button
              onClick={increment}
              aria-label="More guests"
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-ink hover:bg-paper"
            >
              &#43;
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button onClick={handleCreateOrder} className="btn-primary mt-6 w-full">
          Create order → pick a table
        </button>
      </Modal>
    </>
  );
};

export default BottomNav;
