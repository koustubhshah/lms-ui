import React, { useEffect, useRef, useState } from "react";

export default function Select({ value, onChange, options, placeholder = "Select", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-left focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 bg-white"
      >
        <span className="block truncate text-slate-900">{selected ? selected.label : placeholder}</span>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-56 overflow-auto py-1">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left ${active ? "bg-slate-100 text-slate-900" : "text-slate-800 hover:bg-slate-50"}`}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}


