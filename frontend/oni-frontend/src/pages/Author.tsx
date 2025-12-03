import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";

interface Author {
  id: number;
  name: string;
  bio?: string;
}

export default function Authors() {
  const { isAdmin } = useAuth();

  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [form, setForm] = useState({ name: "", bio: "" });

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/authors");
      setAuthors(res.data);
    } catch {
      toast.error("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const openModal = (a?: Author) => {
    if (a) {
      setEditingId(a.id);
      setForm({ name: a.name, bio: a.bio || "" });
    } else {
      setEditingId(null);
      setForm({ name: "", bio: "" });
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Name is required");

    try {
      if (editingId) {
        await api.patch(`/authors/${editingId}`, form);
        toast.success("Author updated");
      } else {
        await api.post("/authors", form);
        toast.success("Author added");
      }

      setOpen(false);
      loadAuthors();
    } catch {
      toast.error("Error saving author");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this author?")) return;

    try {
      await api.delete(`/authors/${id}`);
      toast.success("Author deleted");
      loadAuthors();
    } catch {
      toast.error("Error deleting author");
    }
  };

  // -------------------------
  // FILTER + SORT
  // -------------------------
  const filteredAuthors = useMemo(() => {
    let list = authors;

    if (search.trim()) {
      list = list.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    list = [...list].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );

    return list;
  }, [authors, search, sortAsc]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Authors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all authors in the system.
          </p>
        </div>

        {isAdmin && (
          <Button className="flex items-center gap-2" onClick={() => openModal()}>
            <PlusCircleIcon className="h-5 w-5" />
            Add Author
          </Button>
        )}
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-2 top-3 text-slate-400" />
          <Input
            placeholder="Search authors..."
            className="pl-8 bg-black/40 border-white/10 text-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          className="border-white/10 bg-black/30 text-slate-200 hover:bg-black/40 flex items-center gap-2"
          onClick={() => setSortAsc((prev) => !prev)}
        >
          <ChevronUpDownIcon className="h-4 w-4" />
          Sort {sortAsc ? "A → Z" : "Z → A"}
        </Button>
      </div>

      {/* Author List */}
      <Card className="glass-card-lg">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Author List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {filteredAuthors.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">
              No authors found.
            </p>
          )}

          {filteredAuthors.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between border-b border-white/10 pb-4 last:border-none"
            >
              {/* Avatar + Info */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 font-semibold">
                  {getInitials(a.name)}
                </div>

                <div>
                  <p className="text-lg font-medium text-white">{a.name}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {a.bio || "No biography available."}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => openModal(a)}>
                    <PencilIcon className="h-5 w-5 text-yellow-400" />
                  </Button>

                  <Button variant="ghost" onClick={() => handleDelete(a.id)}>
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            glass-card
            max-w-md
            rounded-2xl
            bg-[#0d0f10]
            border border-white/10
            text-slate-200
            shadow-2xl
          "
        >
          <DialogHeader>
            <DialogTitle className="text-slate-200 text-lg font-semibold">
              {editingId ? "Edit Author" : "Add Author"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-slate-400">Name</label>
              <Input
                className="bg-black/40 border-white/10 text-slate-200 focus-visible:ring-red-500/60"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Bio</label>
              <Textarea
                className="h-28 bg-black/40 border-white/10 text-slate-200 focus-visible:ring-red-500/60"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Short biography"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600/90 hover:bg-red-500 text-white rounded-xl"
            >
              {editingId ? "Update Author" : "Add Author"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
