import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", form);
      toast.success("Account created successfully");
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d16] flex items-center justify-center px-4 relative overflow-hidden">

      {/* RED GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[700px] h-[700px] bg-red-700/20 rounded-full blur-[200px]" />

      {/* CARD */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-6 p-8 
                   bg-[#111216]/90 backdrop-blur-xl rounded-2xl 
                   border border-white/10 shadow-2xl"
      >
        <div className="text-center">
          <ArrowLeftOnRectangleIcon className="h-12 w-12 text-red-500 mx-auto" />

          <h1 className="text-2xl font-bold text-white mt-3 tracking-tight">
            Create Account
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Register to access your library dashboard.
          </p>
        </div>

        {/* NAME */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Name</label>

          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pl-10 py-2.5 rounded-xl bg-black/30 border border-white/10
                         text-slate-100 placeholder:text-slate-500
                         focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Email</label>

          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 py-2.5 rounded-xl bg-black/30 border border-white/10
                         text-slate-100 placeholder:text-slate-500
                         focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Password</label>

          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full pl-10 py-2.5 rounded-xl bg-black/30 border border-white/10
                         text-slate-100 placeholder:text-slate-500
                         focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>
        </div>

        {/* REGISTER BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-base font-medium
                     bg-red-600 hover:bg-red-500 text-white transition"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        {/* FOOTER */}
        <p className="text-center text-slate-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-red-400 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
