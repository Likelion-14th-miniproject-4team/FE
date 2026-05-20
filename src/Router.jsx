import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Setting from "./pages/Setting";
import Landing from "./pages/Landing";
import RouteSearch from "./pages/RouteSearch";
import RouteActive from "./pages/RouteActive";
import CustomRoutine from "./pages/CustomRoutine";
import CheckList from "./pages/CheckList";
import MyPage from "./pages/MyPage";
import Navbar from "./components/Navbar";

function NavbarLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<NavbarLayout />}>
          <Route path="/route" element={<RouteSearch />} />
          <Route path="/route/active" element={<RouteActive />} />
          <Route path="/customroutine" element={<CustomRoutine />} />
          <Route path="/checklist" element={<CheckList />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/setting" element={<Setting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
