import React, { useState, useEffect, useRef } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "옵션을 선택하세요",
  disabled = false,
  width = "w-70",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option) => {
    if (disabled) return;
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isSelected = !!value;

  const triggerStyle = disabled
    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-default"
    : isOpen
      ? "bg-blue-100 border-blue-500 text-blue-900 cursor-pointer"
      : isSelected
        ? "bg-blue-100 border-blue-500 text-blue-900 cursor-pointer hover:border-blue-600 active:border-blue-700"
        : "bg-blue-100 border-gray-300 text-blue-900 cursor-pointer hover:border-gray-400 active:border-gray-500";

  return (
    <div className={`relative ${width}`} ref={ref}>
      {/* Trigger */}
      <div
        onClick={handleDropdown}
        aria-expanded={isOpen}
        className={`h-12 w-full flex items-center justify-between px-4 py-3 border-1.5 rounded-lg body-sm transition whitespace-nowrap ${triggerStyle}`}
      >
        <span className={!value ? "text-gray-500" : ""}>
          {value || placeholder}
        </span>
        {!disabled &&
          (isOpen ? (
            <AiOutlineUp size={16} className="shrink-0 text-gray-600" />
          ) : (
            <AiOutlineDown size={16} className="shrink-0 text-gray-600" />
          ))}
      </div>

      {/* List */}
      {!disabled && isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-blue-100 border-1.5 border-gray-300 rounded-lg overflow-x-hidden overflow-y-auto max-h-42.5 flex flex-col">
          {options.map((option) => (
            <li
              key={option.index}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={value === (option.label ?? option.value)}
              className="px-4 py-3 body-sm text-blue-900 bg-blue-100 cursor-pointer hover:bg-blue-200 active:bg-blue-300 transition whitespace-nowrap"
            >
              {option.label ?? option.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
