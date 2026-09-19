import React from "react";

// Decorative barcode: even index = bar, odd index = gap
const pattern = "21131231421131221412312113122141311231";

const Barcode = ({ className = "" }) => (
  <div className={`flex h-10 items-stretch justify-center ${className}`} aria-hidden="true">
    {pattern.split("").map((w, i) => (
      <span
        key={i}
        style={{ width: `${w * 1.5}px` }}
        className={i % 2 === 0 ? "bg-ink" : "bg-transparent"}
      />
    ))}
  </div>
);

export default Barcode;
