"use client";

import { useEffect, useRef, useState } from "react";

interface Suggestion {
  name: string;
  count: number;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestUrl: string;
  placeholder?: string;
  multiValue?: boolean;
  className?: string;
  id?: string;
}

export default function AutocompleteInput({
  value,
  onChange,
  suggestUrl,
  placeholder,
  multiValue = false,
  className = "",
  id,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filtered, setFiltered] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(suggestUrl)
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => {});
  }, [suggestUrl]);

  // Get the current token being typed (last segment for multiValue)
  const getCurrentToken = (): string => {
    if (!multiValue) return value;
    const parts = value.split(",");
    return (parts[parts.length - 1] || "").trim();
  };

  useEffect(() => {
    const token = getCurrentToken().toLowerCase();
    if (!token) {
      setFiltered([]);
      return;
    }
    const already = multiValue
      ? new Set(
          value
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
        )
      : new Set<string>();
    setFiltered(
      suggestions.filter(
        (s) =>
          s.name.toLowerCase().includes(token) &&
          !already.has(s.name.toLowerCase())
      )
    );
  }, [value, suggestions, multiValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applySuggestion = (name: string) => {
    if (multiValue) {
      const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
      parts[parts.length - 1] = name;
      onChange(parts.join(", ") + ", ");
    } else {
      onChange(name);
    }
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      applySuggestion(filtered[activeIndex].name);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {filtered.map((s, i) => (
            <li
              key={s.name}
              onMouseDown={() => applySuggestion(s.name)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === activeIndex
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {s.name}{" "}
              <span className="text-xs text-zinc-400">({s.count})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
