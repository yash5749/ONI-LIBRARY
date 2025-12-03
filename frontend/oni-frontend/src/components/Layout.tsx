import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  BookmarkIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Layout() {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium border border-transparent",
      isActive
        ? "bg-blue-600/20 border-blue-600/40 text-blue-300 shadow-sm backdrop-blur"
        : "text-slate-300 hover:bg-slate-800/60 hover:border-slate-700",
    ].join(" ");

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">

      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl flex items-center justify-between px-4 py-3 z-40 shadow-lg">
        <h1 className="text-lg font-semibold">Library</h1>
        <button onClick={() => setOpen(true)}>
          <Bars3Icon className="h-7 w-7 text-slate-200" />
        </button>
      </div>

      {/* ===== MOBILE BACKDROP ===== */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 shadow-2xl
          transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          transition-transform duration-300
          w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Library</h1>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-slate-300" />
          </button>
        </div>

        {/* ===== NAV LINKS ===== */}
        <nav className="p-4 flex-1 space-y-2 text-sm">

          <NavLink onClick={() => setOpen(false)} className={linkClasses} to="/dashboard">
            <HomeIcon className="h-5 w-5" />
            Dashboard
          </NavLink>

          <NavLink onClick={() => setOpen(false)} className={linkClasses} to="/books">
            <BookOpenIcon className="h-5 w-5" />
            Books
          </NavLink>

          {isAdmin && (
            <NavLink onClick={() => setOpen(false)} className={linkClasses} to="/authors">
              <UsersIcon className="h-5 w-5" />
              Authors
            </NavLink>
          )}

          <NavLink onClick={() => setOpen(false)} className={linkClasses} to="/borrowed">
            <BookmarkIcon className="h-5 w-5" />
            Borrowed
          </NavLink>

          {isAdmin && (
            <NavLink onClick={() => setOpen(false)} className={linkClasses} to="/users">
              <UserGroupIcon className="h-5 w-5" />
              Users
            </NavLink>
          )}
        </nav>

        {/* ===== LOGOUT BUTTON ===== */}
        <div className="p-4 border-t border-slate-800/80 backdrop-blur-xl">
          <button
            onClick={() => {
              handleLogout();
              setOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium transition shadow-lg"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
