import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Books from "../pages/Books";
import Authors from "../pages/Author";

import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import type { JSX } from "react";
import Borrowed from "../pages/Borrowed";
import Users from "../pages/User";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (!isAdmin) return <Navigate to="/books" />; // redirect non-admins
  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes wrapped inside layout */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          <Route path="/books" element={<Books />} />
          <Route path="/borrowed" element={<Borrowed />} />

          {/* Admin-only pages */}
          <Route
            path="/authors"
            element={
              <AdminRoute>
                <Authors />
              </AdminRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
