import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import {
  LockClosedIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      await login(res.data.token);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d16] flex items-center justify-center px-4 relative overflow-hidden">

      {/* HARD-CODED RED BACKGLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[700px] h-[700px] bg-red-700/20 rounded-full blur-[200px]" />

      {/* LOGIN CARD */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-6 p-8 
                   bg-[#111216]/90 backdrop-blur-xl rounded-2xl 
                   border border-white/10 shadow-2xl"
      >
        {/* HEADER */}
        <div className="text-center">
          <ArrowRightOnRectangleIcon className="h-12 w-12 text-red-500 mx-auto" />

          <h1 className="text-2xl font-bold text-white mt-3 tracking-tight">
            Welcome Back
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Sign in to continue to your dashboard.
          </p>
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <Label className="text-slate-300">Email</Label>

          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="pl-10 bg-black/30 border border-white/10 
                         text-slate-100 placeholder:text-slate-500
                         focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <Label className="text-slate-300">Password</Label>

          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="pl-10 bg-black/30 border border-white/10 
                         text-slate-100 placeholder:text-slate-500
                         focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-base font-medium 
                     bg-red-600 hover:bg-red-500 text-white rounded-xl
                     transition"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {/* FOOTER */}
        <p className="text-center text-slate-400 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-red-400 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
