"use client";

import { useState, useRef, useEffect } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5",
          "border border-brand-border rounded-app bg-brand-white",
          "text-sm transition-colors text-left",
          "focus:outline-none focus:border-brand-black",
          open ? "border-brand-black" : "hover:border-gray-400",
          !selected && "text-gray-400",
        )}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <HiChevronDown
          size={15}
          className={cn(
            "flex-shrink-0 text-gray-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-brand-white border border-brand-border rounded-app shadow-lg overflow-hidden">
          <ul className="max-h-56 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors",
                      isSelected
                        ? "bg-brand-black text-white"
                        : "text-brand-black hover:bg-brand-light",
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <HiCheck size={14} className="flex-shrink-0" />
                    )}
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
