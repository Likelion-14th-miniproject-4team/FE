import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "./Button";
import icon from "../assets/icon.svg";

export default function Navbar() {
  const navigate = useNavigate();

  const navItems = [
    { label: "Route", path: "/route" },
    { label: "Custom Routine", path: "/customroutine" },
    { label: "Check List", path: "/checklist" },
    { label: "My Page", path: "/mypage" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <nav className="w-full h-24 flex items-center justify-between px-16">
      {/* 메뉴 */}
      <div className="flex items-center gap-6">
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

      {/* 우측 영역 */}
      <div className="flex items-center gap-4">
        <Button
          text="Logout"
          onClick={handleLogout}
          bgColor="var(--color-blue-100)"
          textColor="var(--color-blue-900)"
        />
        {/* 로고 */}
        <div className="flex items-center gap-3">
          <img src={icon} alt="when2leave" className="h-13.5 w-13.5" />
          <span className="nav-active">
            <span className="text-beige-800">when</span>
            <span className="text-blue-500">2</span>
            <span className="text-beige-800">leave</span>
          </span>
        </div>
      </div>
    </nav>
  );
}
