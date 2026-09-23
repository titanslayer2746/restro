import React, { useRef } from "react";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Barcode from "../shared/Barcode";
import { formatDateAndTime, formatMoney, getOrderNo, pad } from "../../utils";

// The r-* classes style the printed copy, where Tailwind isn't loaded
const printStyles = `
  body { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; color: #16140f; padding: 16px; }
  .r-sheet { width: 280px; margin: 0 auto; }
  .r-center { text-align: center; }
  .r-row { display: flex; justify-content: space-between; gap: 12px; }
  .r-rule { border-top: 1px dashed #999; margin: 10px 0; }
  .r-bold { font-weight: 700; }
  .r-muted { color: #6b665c; }
  .r-title { font-size: 14px; font-weight: 700; letter-spacing: 0.35em; }
  .r-noprint { display: none !important; }
  ul { list-style: none; padding: 0; margin: 0; }
  p { margin: 2px 0; }
`;

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const invoiceRef = useRef(null);
  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
            <html>
              <head>
                <title>Order Receipt</title>
                <style>${printStyles}</style>
              </head>
              <body>
                <div class="r-sheet">${printContent}</div>
              </body>
            </html>
          `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 1000);
  };

  const verified = orderInfo.paymentStatus === "Verified";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/40 px-4 py-10 backdrop-blur-sm">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.3, 0.7, 0.2, 1] }}
        className="ticket-shadow w-full max-w-[360px]"
      >
        <div className="relative bg-white px-6 pb-6 pt-8 font-mono text-xs text-ink">
          {/* Receipt Content for Printing */}
          <div ref={invoiceRef}>
            <div className="r-center text-center">
              <p className="r-title text-sm font-bold tracking-[0.35em]">RESTRO</p>
              <p className="r-muted mt-1 text-[11px] text-muted">order receipt · thank you!</p>
            </div>

            <div className="r-rule rule-dashed my-4" />

            {/* Order Details */}
            <div className="space-y-1">
              <p className="r-row flex justify-between"><span className="r-muted text-muted">order</span><span>#{getOrderNo(orderInfo)}</span></p>
              {orderInfo.table?.tableNo && (
                <p className="r-row flex justify-between"><span className="r-muted text-muted">table</span><span>T-{pad(orderInfo.table.tableNo)}</span></p>
              )}
              <p className="r-row flex justify-between"><span className="r-muted text-muted">name</span><span>{orderInfo.customerDetails.name}</span></p>
              <p className="r-row flex justify-between"><span className="r-muted text-muted">phone</span><span>{orderInfo.customerDetails.phone}</span></p>
              <p className="r-row flex justify-between"><span className="r-muted text-muted">guests</span><span>{orderInfo.customerDetails.guests}</span></p>
              <p className="r-row flex justify-between"><span className="r-muted text-muted">date</span><span>{formatDateAndTime(orderInfo.orderDate)}</span></p>
            </div>

            <div className="r-rule rule-dashed my-4" />

            {/* Items Summary */}
            <ul className="space-y-1.5">
              {orderInfo.items.map((item, index) => (
                <li key={index} className="r-row flex justify-between gap-3">
                  <span>{item.quantity}× {item.name}</span>
                  <span>{formatMoney(item.price)}</span>
                </li>
              ))}
            </ul>

            <div className="r-rule rule-dashed my-4" />

            {/* Bills Summary */}
            <div className="space-y-1 text-muted">
              <p className="r-row r-muted flex justify-between"><span>subtotal</span><span>{formatMoney(orderInfo.bills.total)}</span></p>
              <p className="r-row r-muted flex justify-between"><span>tax</span><span>{formatMoney(orderInfo.bills.tax)}</span></p>
            </div>
            <p className="r-row r-bold mt-2 flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span>₹{formatMoney(orderInfo.bills.totalWithTax)}</span>
            </p>

            <div className="r-rule rule-dashed my-4" />

            {/* Payment Details */}
            <div className="space-y-1 text-[11px]">
              <p className="r-row flex justify-between"><span className="r-muted text-muted">payment</span><span>{orderInfo.paymentMethod}</span></p>
              <p className="r-row flex justify-between">
                <span className="r-muted text-muted">status</span>
                <span>{verified ? "verified" : "pending verification"}</span>
              </p>
            </div>

            <Barcode className="r-noprint mt-6" />
            <p className="r-center r-muted mt-4 text-center text-[10px] uppercase tracking-widest text-muted">
              *** thank you · visit again ***
            </p>
          </div>

          {/* Stamp */}
          <motion.span
            initial={{ opacity: 0, scale: 1.8, rotate: -14 }}
            animate={{ opacity: 0.9, scale: 1, rotate: -14 }}
            transition={{ delay: 0.6, duration: 0.25, ease: "easeIn" }}
            className="pointer-events-none absolute right-5 top-24 rounded-md border-2 border-accent px-3 py-0.5 text-lg font-bold tracking-[0.25em] text-accent"
          >
            {verified ? "PAID" : "PLACED"}
          </motion.span>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-2 font-sans">
            <button onClick={() => setShowInvoice(false)} className="btn-outline py-2 text-xs">
              Close
            </button>
            <button onClick={handlePrint} className="btn-primary py-2 text-xs">
              Print receipt
            </button>
          </div>
        </div>
        <div className="receipt-edge" />
      </motion.div>
    </div>,
    document.body
  );
};

export default Invoice;
