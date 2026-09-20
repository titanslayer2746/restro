import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { motion, MotionConfig } from "framer-motion";
import { MdArrowForward } from "react-icons/md";
import logo from "../assets/images/logo.png";
import Barcode from "../components/shared/Barcode";

const pad = (n) => String(n).padStart(2, "0");
const rupees = (n) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const tickerItems = [
  "T-04 · 2× Butter Chicken · fired",
  "T-11 · Masala Dosa · served",
  "T-02 · ₹1,240 · online · verified",
  "T-07 · 4 guests · seated",
  "T-09 · 3× Gulab Jamun · fired",
  "T-01 · ₹860 · paid cash",
  "T-05 · Hyderabadi Biryani · ready",
  "T-03 · invoice #0419 · printed",
];

const specs = [
  ["tables", "live status, tap to seat"],
  ["orders", "cart → ticket → table"],
  ["payments", "cash · online · ledger"],
  ["roles", "waiter / cashier / admin"],
];

const receiptItems = [
  { qty: 2, name: "Butter Chicken", price: 800 },
  { qty: 1, name: "Paneer Tikka", price: 250 },
  { qty: 1, name: "Masala Dosa", price: 180 },
  { qty: 3, name: "Gulab Jamun", price: 180 },
];

const modules = [
  {
    code: "TBL",
    title: "Tables",
    text: "Every table's status at a glance. Seat a party in one tap and it's booked for everyone.",
    tag: "→ /tables",
    tilt: -2,
  },
  {
    code: "MNU",
    title: "Menu",
    text: "Categorised dishes with prices. Build a cart and tie it to a table and a guest.",
    tag: "→ /menu",
    tilt: 1.5,
  },
  {
    code: "ORD",
    title: "Orders",
    text: "Follow each order from the pass to the table and flip its status as it moves.",
    tag: "→ /orders",
    tilt: -1,
  },
  {
    code: "PAY",
    title: "Payments",
    text: "Cash or online, every payment lands in a daily ledger for the cashier to verify.",
    tag: "→ /payments ledger",
    tilt: 2,
  },
  {
    code: "INV",
    title: "Invoices",
    text: "The bill is ready the moment payment clears. Clean, itemised, print-ready.",
    tag: "→ print-ready",
    tilt: -1.5,
  },
  {
    code: "DSH",
    title: "Dashboard",
    text: "Orders, revenue and recent activity for the people who run the place.",
    tag: "→ admin only",
    tilt: 1,
  },
];

const lifecycle = [
  { t: "19:40", s: "Seated", d: "Waiter picks T-04 and adds the guest's name and party size." },
  { t: "19:42", s: "Ordered", d: "Dishes go into the cart and onto the order ticket." },
  { t: "20:05", s: "Ready", d: "The kitchen marks it ready and the order card updates." },
  { t: "20:31", s: "Settled", d: "Paid by cash or online, verified by the cashier. Table's free." },
];

const initialTables = [
  { id: 1, seats: 2, booked: true },
  { id: 2, seats: 4, booked: false },
  { id: 3, seats: 4, booked: true },
  { id: 4, seats: 6, booked: false },
  { id: 5, seats: 2, booked: false },
  { id: 6, seats: 8, booked: true },
  { id: 7, seats: 4, booked: false },
  { id: 8, seats: 2, booked: true },
  { id: 9, seats: 4, booked: false },
  { id: 10, seats: 6, booked: false },
  { id: 11, seats: 2, booked: false },
  { id: 12, seats: 4, booked: true },
];

const useClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("en-GB", { hour12: false });
};

const SectionLabel = ({ index, name }) => (
  <div className="flex items-baseline justify-between border-t border-ink pt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
    <span>§ {index}</span>
    <span className="text-muted">{name}</span>
  </div>
);

const Logo = () => (
  <span className="flex items-center gap-2.5">
    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink">
      <img src={logo} alt="" className="h-5 w-5" />
    </span>
    <span className="text-[17px] font-semibold tracking-tight text-ink">restro</span>
  </span>
);

const Ticker = () => (
  <div className="overflow-hidden bg-ink text-paper">
    <div className="flex w-max animate-marquee py-2 font-mono text-[11px] uppercase tracking-wider">
      {[...tickerItems, ...tickerItems].map((item, i) => (
        <span key={i} className="flex items-center gap-3 pr-10">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {item}
        </span>
      ))}
    </div>
  </div>
);

// Illustrative bill that "prints" out of a slot on load (not live data)
const Receipt = () => {
  const subtotal = receiptItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.05;

  return (
    <div className="relative mx-auto w-full max-w-[340px] lg:mt-4">
      {/* Printer slot */}
      <div className="relative z-10 h-5 rounded-full bg-ink shadow-[0_10px_20px_-8px_rgba(22,20,15,0.6)]">
        <div className="absolute inset-x-6 top-1/2 h-[3px] -translate-y-1/2 rounded bg-black/70" />
      </div>

      <div className="-mt-2.5 overflow-hidden px-4 pb-10">
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.8, delay: 0.3, ease: [0.3, 0.7, 0.2, 1] }}
          style={{ filter: "drop-shadow(0 18px 22px rgba(22,20,15,0.12))" }}
        >
          <div className="relative bg-white px-6 pb-5 pt-8 font-mono text-[12px] text-ink">
            <div className="text-center">
              <p className="text-sm font-bold tracking-[0.35em]">RESTRO</p>
              <p className="mt-1 text-[11px] text-muted">table 04 · 2 guests</p>
              <p className="text-[11px] text-muted">order #0427 · 19:42</p>
            </div>

            <div className="my-4 border-t border-dashed border-ink/30" />

            <ul className="space-y-1.5">
              {receiptItems.map((item) => (
                <li key={item.name} className="flex justify-between gap-4">
                  <span>
                    {item.qty}× {item.name}
                  </span>
                  <span>{rupees(item.price)}</span>
                </li>
              ))}
            </ul>

            <div className="my-4 border-t border-dashed border-ink/30" />

            <div className="space-y-1 text-muted">
              <div className="flex justify-between">
                <span>subtotal</span>
                <span>{rupees(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>gst 5%</span>
                <span>{rupees(tax)}</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span>₹{rupees(subtotal + tax)}</span>
            </div>

            <Barcode className="mt-6" />
            <p className="mt-1.5 text-center text-[10px] tracking-[0.3em] text-muted">
              0427-T04-RZP
            </p>
            <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-muted">
              *** thank you · visit again ***
            </p>

            {/* Stamp */}
            <motion.span
              initial={{ opacity: 0, scale: 1.8, rotate: -14 }}
              animate={{ opacity: 0.9, scale: 1, rotate: -14 }}
              transition={{ delay: 2.2, duration: 0.25, ease: "easeIn" }}
              className="absolute right-4 top-[42%] rounded-md border-2 border-accent px-3 py-0.5 text-lg font-bold tracking-[0.25em] text-accent"
            >
              PAID
            </motion.span>
          </div>
          <div className="receipt-edge" />
        </motion.div>
      </div>
    </div>
  );
};

// A playable floor plan: click tables to seat / clear them
const FloorPlan = () => {
  const [tables, setTables] = useState(initialTables);

  const toggle = (id) =>
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, booked: !t.booked } : t)));

  const booked = tables.filter((t) => t.booked);
  const totalSeats = tables.reduce((sum, t) => sum + t.seats, 0);
  const covers = booked.reduce((sum, t) => sum + t.seats, 0);
  const load = Math.round((covers / totalSeats) * 100);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink bg-surface">
      <div className="flex items-center justify-between border-b border-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider">
        <span>floor / ground</span>
        <span className="text-muted">click a table</span>
      </div>

      <div className="bg-dots grid grid-cols-3 gap-3 p-4 sm:grid-cols-4 sm:p-6 lg:grid-cols-6">
        {tables.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            aria-pressed={t.booked}
            aria-label={`Table ${t.id}, ${t.seats} seats, ${t.booked ? "seated" : "free"}`}
            className={`relative flex aspect-square flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-200 active:scale-95 ${
              t.booked
                ? "border-ink bg-ink text-paper"
                : "border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-ink"
            }`}
          >
            <span className="font-mono text-[11px] opacity-70">T-{pad(t.id)}</span>
            {t.booked && (
              <span className="absolute right-2.5 top-3 h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            )}
            <span>
              <span className="flex flex-wrap gap-[3px]">
                {Array.from({ length: t.seats }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${t.booked ? "bg-paper/70" : "bg-ink/25"}`}
                  />
                ))}
              </span>
              <span className="mt-1.5 block text-xs font-medium">
                {t.booked ? "seated" : "free"}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 border-t border-ink font-mono">
        {[
          ["occupied", `${pad(booked.length)}/${tables.length}`],
          ["covers", `${covers}/${totalSeats}`],
          ["load", `${load}%`],
        ].map(([k, v], i) => (
          <div key={k} className={`px-4 py-3 ${i > 0 ? "border-l border-ink" : ""}`}>
            <p className="text-[10px] uppercase tracking-wider text-muted">{k}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{v}</p>
          </div>
        ))}
      </div>
      <div className="h-1 bg-line">
        <div className="h-full bg-accent transition-all duration-500" style={{ width: `${load}%` }} />
      </div>
    </div>
  );
};

const Ticket = ({ module, number, index }) => (
  <motion.article
    initial={{ opacity: 0, y: -24, rotate: 0 }}
    whileInView={{ opacity: 1, y: 0, rotate: module.tilt }}
    whileHover={{ rotate: 0, y: 6 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ type: "spring", stiffness: 140, damping: 14, delay: index * 0.08 }}
    style={{ transformOrigin: "top center" }}
    className="relative w-[260px] shrink-0 snap-start md:w-auto"
  >
    {/* Rail clip */}
    <span className="mx-auto block h-4 w-12 rounded-b-md bg-ink" />
    <div style={{ filter: "drop-shadow(0 14px 18px rgba(22,20,15,0.12))" }}>
      <div className="bg-white px-5 pb-5 pt-4">
        <div className="flex justify-between font-mono text-[11px] text-muted">
          <span>KOT · {module.code}</span>
          <span>#{pad(number)}</span>
        </div>
        <div className="my-3 border-t border-dashed border-ink/25" />
        <h3 className="text-2xl font-semibold tracking-tight text-ink">{module.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{module.text}</p>
        <div className="mt-5 border-t border-dashed border-ink/25 pt-3 font-mono text-[11px] uppercase tracking-wider text-ink">
          {module.tag}
        </div>
      </div>
      <div className="receipt-edge" />
    </div>
  </motion.article>
);

const PrimaryButton = ({ to, children }) => (
  <Link
    to={to}
    className="group inline-flex items-center gap-3 rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-sm font-medium text-paper transition-colors hover:bg-black"
  >
    {children}
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white transition-transform group-hover:translate-x-0.5">
      <MdArrowForward size={16} />
    </span>
  </Link>
);

const Landing = () => {
  const { isAuth } = useSelector((state) => state.user);
  const clock = useClock();
  const ctaTo = isAuth ? "/home" : "/auth";

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-hidden bg-paper text-ink selection:bg-accent selection:text-white">
        <Ticker />

        {/* NAV */}
        <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
            <Link to="/" aria-label="Restro home">
              <Logo />
            </Link>
            <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted md:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              service open
              <span className="tabular-nums text-ink">{clock}</span>
            </div>
            <div className="flex items-center gap-5 text-sm">
              {!isAuth && (
                <Link to="/auth" className="font-medium text-muted hover:text-ink">
                  Sign in
                </Link>
              )}
              <Link
                to={ctaTo}
                className="rounded-full bg-ink px-4 py-1.5 font-medium text-paper hover:bg-black"
              >
                {isAuth ? "Open app" : "Start service"}
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5">
          {/* HERO */}
          <section className="grid gap-14 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="font-mono text-xs text-muted"
              >
                [ pos / restaurant ] — for waiters, cashiers &amp; owners
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-6 text-[clamp(2.75rem,7.5vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
              >
                The whole floor,
                <br />
                on one{" "}
                <span className="relative inline-block">
                  rail
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
                    className="absolute -bottom-[0.04em] left-0 h-[0.1em] w-full origin-left bg-accent"
                  />
                </span>
                .
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-7 max-w-md text-base leading-relaxed text-muted"
              >
                Seat guests, fire orders, take payment and print the bill, all from a
                screen that stays out of the way when the dining room is full.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-9 flex flex-wrap items-center gap-6"
              >
                <PrimaryButton to={ctaTo}>{isAuth ? "Open app" : "Start service"}</PrimaryButton>
                <a
                  href="#floor"
                  className="font-mono text-xs uppercase tracking-wider text-muted underline decoration-line underline-offset-4 hover:text-ink hover:decoration-ink"
                >
                  try the floor ↓
                </a>
              </motion.div>

              <dl className="mt-14 grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-2 border-t border-line pt-5 font-mono text-xs">
                {specs.map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>

            <Receipt />
          </section>

          {/* FLOOR */}
          <section id="floor" className="scroll-mt-24 py-16">
            <SectionLabel index="01" name="floor" />
            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
              <div>
                <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-5xl">
                  Tap a table.
                  <br />
                  <span className="text-muted">It's seated.</span>
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
                  That's the tables screen in miniature. Seat a party and the whole team
                  sees it straight away. Go on, fill the room.
                </p>
              </div>
              <FloorPlan />
            </div>
          </section>

          {/* MODULES AS TICKETS */}
          <section className="py-16">
            <SectionLabel index="02" name="modules" />
            <h2 className="mt-10 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-5xl">
              Six tickets on the rail.
              <span className="text-muted"> Nothing else to learn.</span>
            </h2>

            {[modules.slice(0, 3), modules.slice(3)].map((row, r) => (
              <div key={r} className="relative mt-12">
                {/* Steel rail */}
                <div className="h-2.5 rounded-full bg-gradient-to-b from-[#d9d5cc] to-[#b9b4a8] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" />
                <div className="-mt-1 flex snap-x gap-5 overflow-x-auto px-3 pb-8 pt-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-6">
                  {row.map((module, i) => (
                    <Ticket key={module.code} module={module} number={r * 3 + i + 1} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* LIFECYCLE */}
          <section className="py-16">
            <SectionLabel index="03" name="lifecycle" />
            <h2 className="mt-10 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-5xl">
              The life of order <span className="font-mono text-accent">#0427</span>
            </h2>

            <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
              <span className="absolute bottom-2 left-[7px] top-2 w-px bg-ink md:bottom-auto md:left-0 md:right-0 md:top-[7px] md:h-px md:w-auto" />
              {lifecycle.map((step, i) => {
                const last = i === lifecycle.length - 1;
                return (
                  <motion.li
                    key={step.s}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                    className="relative pl-9 md:pl-0 md:pt-9"
                  >
                    <span
                      className={`absolute left-0 top-0 h-[15px] w-[15px] rounded-full border-2 border-ink ${
                        last ? "bg-accent" : "bg-paper"
                      }`}
                    />
                    <p className="font-mono text-sm tabular-nums text-muted">{step.t}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{step.s}</h3>
                    <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">{step.d}</p>
                  </motion.li>
                );
              })}
            </ol>
          </section>

          {/* CTA */}
          <section className="py-16">
            <div className="flex flex-col items-start justify-between gap-8 border-y border-ink py-12 md:flex-row md:items-end">
              <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-6xl">
                Doors are open.
                <br />
                <span className="text-muted">Clock in.</span>
              </h2>
              <PrimaryButton to={ctaTo}>{isAuth ? "Open app" : "Sign in to start"}</PrimaryButton>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="relative overflow-hidden pt-6">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-5 font-mono text-[11px] uppercase tracking-wider text-muted sm:flex-row">
            <span>*** thank you · visit again ***</span>
            <span>© {new Date().getFullYear()} restro</span>
          </div>
          <p
            aria-hidden="true"
            className="select-none text-center text-[26vw] font-semibold leading-[0.8] tracking-[-0.06em] text-ink/[0.06]"
          >
            restro
          </p>
        </footer>
      </div>
    </MotionConfig>
  );
};

export default Landing;
