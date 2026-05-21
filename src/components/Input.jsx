import React from "react";

export default function Input({
  type = "text",
  id,
  value,
  onChange,
  placeholder = "텍스트를 입력하세요",
  isError = false,
  disabled = false,
  width = "w-70",
}) {
  return (
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`h-12 ${width} px-4 py-3 border-1.5 rounded-lg body-sm outline-none transition
        ${
          isError
            ? "bg-red-100 border-red-500 text-red-900 placeholder:text-red-900"
            : disabled
              ? "bg-gray-100 border-gray-200 text-gray-400 placeholder:text-gray-400 cursor-not-allowed"
              : `bg-blue-100 text-gray-900 placeholder:text-gray-500 hover:border-blue-500 focus:border-blue-500 cursor-text ${value ? "border-blue-500" : "border-gray-300"}`
        }
      `}
    />
  );
}
