import React from "react";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useState } from "react";
import Metrics from "../components/dashboard/Metrics"
import RecentOrders from "../components/dashboard/RecentOrders"
import Staff from "../components/dashboard/Staff";
import Modal from "../components/dashboard/Modal";
import CategoryModal from "../components/dashboard/CategoryModal";
import DishModal from "../components/dashboard/DishModal";
import Ledger from "../components/ledger/Ledger";
import { PageHeader, Segmented } from "../components/shared/ui";

const buttons = [
    { key:1, label: "Add table", icon: <MdTableBar />, action: "table" },
    { key:2, label: "Add category", icon: <MdCategory />, action: "category" },
    { key:3, label: "Add dish", icon: <BiSolidDish />, action: "dish" },
  ];

  const tabs = ["Metrics", "Orders", "Staff", "Payments"];

const Dashboard = () => {

  // Which "add" modal is open: "table" | "category" | "dish" | null
  const [openModal, setOpenModal] = useState(null);
  const [activeTab, setActiveTab] = useState("Metrics")

  const closeModal = () => setOpenModal(null);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-10">
      <PageHeader index="00" name="admin" title="Control room">
        <div className="flex flex-wrap items-center gap-2">
          {buttons.map(({ key, label, icon, action }) => {
            return (
              <button onClick={() => setOpenModal(action)} key={key} className="btn-outline px-4 py-2 text-xs">
                {icon} {label}
              </button>
            );
          })}
        </div>
      </PageHeader>

      <div className="mt-8 flex items-center justify-between border-t border-ink pt-4">
        <Segmented options={tabs} value={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-8">
        {activeTab === "Metrics" && <Metrics />}
        {activeTab === "Orders" && <RecentOrders />}
        {activeTab === "Staff" && <Staff />}
        {activeTab === "Payments" && <Ledger />}
      </div>

      {openModal === "table" && <Modal setIsTableModalOpen={(open) => !open && closeModal()} />}
      {openModal === "category" && <CategoryModal onClose={closeModal} />}
      {openModal === "dish" && <DishModal onClose={closeModal} onAddCategory={() => setOpenModal("category")} />}
    </div>
  );
};

export default Dashboard;
