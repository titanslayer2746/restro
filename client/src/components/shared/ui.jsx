import React from "react";
import BackButton from "./BackButton";

// Small building blocks shared by every page of the app

export const PageHeader = ({ index, name, title, back = true, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-5">
    <div className="flex items-end gap-4">
      {back && <BackButton />}
      <div>
        <p className="mono-label">
          § {index} · {name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
          {title}
        </h1>
      </div>
    </div>
    {children}
  </div>
);

export const Segmented = ({ options, value, onChange, counts }) => (
  <div className="scrollHide inline-flex max-w-full overflow-x-auto rounded-full border border-ink bg-surface p-1">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
          value === option ? "bg-ink text-paper" : "text-muted hover:text-ink"
        }`}
      >
        {option}
        {counts && (
          <span className={value === option ? "text-paper/60" : "text-muted/70"}>
            {counts[option] ?? 0}
          </span>
        )}
      </button>
    ))}
  </div>
);

const dotColors = {
  Ready: "bg-emerald-500",
  Available: "bg-emerald-500",
  Verified: "bg-emerald-500",
  "In Progress": "bg-accent",
  Booked: "bg-accent",
  Pending: "bg-accent",
  Completed: "bg-ink",
};

export const StatusPill = ({ status }) => (
  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink">
    <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status] || "bg-muted"}`} />
    {status}
  </span>
);

export const Initials = ({ children, className = "" }) => (
  <span
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink font-mono text-xs font-semibold text-paper ${className}`}
  >
    {children || "—"}
  </span>
);

// Inline spinner for buttons; inherits the text colour
export const Spinner = ({ className = "" }) => (
  <span
    aria-hidden="true"
    className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
  />
);

// Grey placeholder block shown while data loads
export const Skeleton = ({ className = "" }) => (
  <span aria-hidden="true" className={`block animate-pulse rounded-md bg-line ${className}`} />
);

export const EmptyState =({ title, text }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/25 px-6 py-16 text-center">
    <p className="mono-label">— nothing here —</p>
    <p className="mt-3 text-lg font-semibold tracking-tight text-ink">{title}</p>
    {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
  </div>
);
