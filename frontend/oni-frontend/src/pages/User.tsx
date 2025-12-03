import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

import {
  UserIcon,
  StarIcon,
  TrashIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ------------------ SKELETON ------------------
function UsersSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-lg bg-white/5 border border-white/10"
        ></div>
      ))}
    </div>
  );
}

// ------------------ MAIN COMPONENT ------------------
export default function Users() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Search + Sort + Pagination
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 7;

  if (!isAdmin) {
    return (
      <div className="text-center mt-20 text-slate-300">
        <ShieldCheckIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400">Only admins can view user accounts.</p>
      </div>
    );
  }

  // ------------------ LOAD USERS ------------------
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ------------------ ACTIONS ------------------
  const promoteUser = async (id: number) => {
    try {
      await api.patch(`/users/promote/${id}`);
      toast.success("User promoted to admin");
      loadUsers();
    } catch {
      toast.error("Failed to promote user");
    }
  };

  const deleteUser = async () => {
    try {
      if (!deleteId) return;
      await api.delete(`/users/${deleteId}`);
      toast.success("User deleted successfully");
      setDeleteId(null);
      loadUsers();
    } catch {
      toast.error("Error deleting user");
    }
  };

  // ------------------ UTILS ------------------
  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  // ------------------ FILTER + SORT ------------------
  const filteredUsers = useMemo(() => {
    let list = users;

    if (search.trim()) {
      list = list.filter((u: any) =>
        `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    list = [...list].sort((a: any, b: any) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

    return list;
  }, [users, search, sortAsc]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginated = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ------------------ RENDER ------------------
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Users
        </h1>
        <p className="text-slate-400">Manage user accounts and roles.</p>
      </div>

      {/* SKELETON */}
      {loading && <UsersSkeleton />}

      {/* MAIN TABLE */}
      {!loading && (
        <div className="glass-card p-6 rounded-xl overflow-hidden">
          {/* Search + Sort */}
          <div className="flex items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="relative w-64">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-2 top-3 text-slate-400" />
              <Input
                placeholder="Search users..."
                className="pl-8 bg-black/40 border-white/10 text-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <Button
              variant="outline"
              className="border-white/10 bg-black/30 text-slate-300 hover:bg-black/40 flex items-center gap-2"
              onClick={() => setSortAsc((prev) => !prev)}
            >
              <ChevronUpDownIcon className="h-4 w-4" />
              Sort {sortAsc ? "A → Z" : "Z → A"}
            </Button>
          </div>

          {/* TABLE */}
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="p-3 text-slate-300 text-left">User</th>
                <th className="p-3 text-slate-300 text-left">Email</th>
                <th className="p-3 text-slate-300 text-left">Role</th>
                <th className="p-3 text-slate-300 text-left w-28">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((u: any) => (
                <tr
                  key={u.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300 font-semibold">
                      {initials(u.name)}
                    </div>
                    <span className="text-white">{u.name}</span>
                  </td>

                  <td className="p-3 text-slate-300">{u.email}</td>

                  <td className="p-3">
                    {u.role === "admin" ? (
                      <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        User
                      </Badge>
                    )}
                  </td>

                  <td className="p-3 flex items-center gap-3">
                    {u.role !== "admin" && (
                      <button
                        onClick={() => promoteUser(u.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteId(u.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-slate-400 italic"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-6 gap-4">
            <Button
              variant="outline"
              className="bg-black/30 border-white/10 text-slate-300 hover:bg-black/40"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <p className="text-slate-400 text-sm">
              Page {page} of {totalPages || 1}
            </p>

            <Button
              variant="outline"
              className="bg-black/30 border-white/10 text-slate-300 hover:bg-black/40"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="glass-card max-w-sm rounded-xl border border-white/10 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-red-400 text-lg font-semibold">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <p className="text-slate-300">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              className="border-white/10 bg-black/30 hover:bg-black/40"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>

            <Button className="bg-red-600/90 hover:bg-red-500" onClick={deleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
