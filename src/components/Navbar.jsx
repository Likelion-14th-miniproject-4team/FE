import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "./Button";
import icon from "../assets/icon.svg";
import { logout } from "../api/api";
import { MdMenu, MdClose } from "react-icons/md";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  const navItems = [
    { label: "Route", path: "/route" },
    { label: "Custom Routine", path: "/customroutine" },
    { label: "Check List", path: "/checklist" },
    { label: "My Page", path: "/mypage" },
  ];

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav ref={navRef} className="w-full h-24 flex items-center justify-between px-6 md:px-16 relative">
      {/* 데스크탑 메뉴 */}
      <div className="hidden md:flex items-center gap-6">
        {navItems.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `nav-${isActive ? "active" : "default"} text-blue-900 whitespace-nowrap transition hover:text-blue-1000`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* 모바일 햄버거 버튼 */}
      <button
        type="button"
        className="md:hidden text-blue-900 p-1 cursor-pointer"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
      </button>

      {/* 우측 영역 */}
      <div className="flex items-center gap-4">
        {/* 데스크탑 Logout */}
        <div className="hidden md:block">
          <Button
            text="Logout"
            onClick={handleLogout}
            bgColor="var(--color-blue-100)"
            textColor="var(--color-blue-900)"
          />
        </div>
        {/* 로고 — 항상 표시 */}
        <div className="flex items-center gap-3">
          <img src={icon} alt="when2leave" className="h-10 w-10 md:h-13.5 md:w-13.5" />
          <span className="nav-active">
            <span className="text-beige-800">when</span>
            <span className="text-blue-500">2</span>
            <span className="text-beige-800">leave</span>
          </span>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="absolute top-24 left-0 w-full bg-white border-b border-gray-200 shadow-md flex flex-col z-50 md:hidden">
          {navItems.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-6 py-4 nav-${isActive ? "active" : "default"} text-blue-900 transition hover:bg-gray-100`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="px-6 py-4 border-t border-gray-200">
            <Button
              text="Logout"
              onClick={handleLogout}
              bgColor="var(--color-blue-100)"
              textColor="var(--color-blue-900)"
              className="h-10 px-6 body-md w-full"
            />
          </div>
        </div>
      )}
    </nav>
  );
}
