import React, { useRef } from "react";

function resolveVar(cssVarRef) {
  const match = cssVarRef.match(/^var\(--([^)]+)\)$/);
  if (!match || typeof window === "undefined") return cssVarRef;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(`--${match[1]}`)
      .trim() || cssVarRef
  );
}

function shiftShade(cssVar, delta) {
  const match = cssVar.match(/^var\(--color-([a-z]+)-(\d+)\)$/);
  if (!match) return cssVar;
  const newShade = Math.min(Math.max(parseInt(match[2]) + delta, 100), 1000);
  return `var(--color-${match[1]}-${newShade})`;
}

export default function Button({
  text,
  onClick,
  bgColor = "var(--color-blue-900)",
  textColor = "var(--color-blue-100)",
  className = "h-12 px-8 py-3 body-md",
}) {
  const btnRef = useRef(null);

  const applyBg = (cssVar) => {
    if (btnRef.current) {
      btnRef.current.style.backgroundColor = resolveVar(cssVar);
    }
  };

  return (
    <button
      type="button"
      ref={btnRef}
      onClick={onClick}
      style={{
        backgroundColor: resolveVar(bgColor),
        color: resolveVar(textColor),
      }}
      onMouseEnter={() => applyBg(shiftShade(bgColor, 100))}
      onMouseLeave={() => applyBg(bgColor)}
      onMouseDown={(e) => {
        e.preventDefault();
        applyBg(shiftShade(bgColor, 200));
      }}
      onMouseUp={() => applyBg(shiftShade(bgColor, 100))}
      className={`${className} rounded-lg cursor-pointer appearance-none select-none`}
    >
      {text}
    </button>
  );
}
