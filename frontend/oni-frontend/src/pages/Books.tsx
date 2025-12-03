import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { Skeleton } from "@/components/ui/skeleton";

interface Author {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  isbn?: string;
  isBorrowed: boolean;
  author: Author;
  borrowedByUser?: { id: number; email: string } | null;
}

export default function Books() {
  const { user, isAdmin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState({ title: "", isbn: "", authorId: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search, sorting, pagination
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookRes, authorRes] = await Promise.all([
        api.get("/books"),
        api.get("/authors"),
      ]);

      setBooks(bookRes.data);
      setAuthors(authorRes.data);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.authorId) {
      toast.error("Title and author are required");
      return;
    }

    try {
      if (editingId) {
        await api.patch(`/books/${editingId}`, form);
        toast.success("Book updated");
      } else {
        await api.post("/books", form);
        toast.success("Book added");
      }

      setForm({ title: "", isbn: "", authorId: 0 });
      setEditingId(null);
      loadData();
    } catch {
      toast.error("Error saving book");
    }
  };

  const handleEdit = (b: Book) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      isbn: b.isbn || "",
      authorId: b.author.id,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this book?")) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success("Book deleted");
      loadData();
    } catch {
      toast.error("Error deleting book");
    }
  };

  const handleBorrow = async (bookId: number) => {
    if (!user) return toast.error("Please login again");

    try {
      await api.post("/borrow", { bookId });
      toast.success("Book borrowed");
      loadData();
    } catch {
      toast.error("Error borrowing book");
    }
  };

  const handleReturn = async (bookId: number) => {
    if (!user) return toast.error("Please login again");

    try {
      await api.post("/borrow/return", { bookId });
      toast.success("Book returned");
      loadData();
    } catch {
      toast.error("Error returning book");
    }
  };

  // -------------------------
  // FILTER + SORT + PAGINATION
  // -------------------------

  const filteredBooks = useMemo(() => {
    let list = books;

    if (search.trim()) {
      list = list.filter((b) =>
        `${b.title} ${b.author.name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    list = [...list].sort((a, b) =>
      sortAsc
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title),
    );

    return list;
  }, [books, search, sortAsc]);

  const totalPages = Math.ceil(filteredBooks.length / pageSize);

  const paginatedBooks = filteredBooks.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // -------------------------
  // COMPONENTS
  // -------------------------

  const TableSection = (
    <Card className="glass-card animate-fade-slide">
      <CardHeader>
        <CardTitle>Catalog</CardTitle>
        <CardDescription className="text-sm text-slate-400">
          All books with real-time availability.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Search + Sort */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-2 top-3 text-slate-400" />
            <Input
              placeholder="Search books..."
              className="pl-8 bg-black/40 border-white/10 text-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            className="border-white/10 bg-black/30 text-slate-300 hover:bg-black/40 flex items-center gap-2"
            onClick={() => setSortAsc((prev) => !prev)}
          >
            <ChevronUpDownIcon className="h-4 w-4" />
            Sort {sortAsc ? "A → Z" : "Z → A"}
          </Button>
        </div>

        {/* Table */}
        <Table className="min-w-[640px] text-sm">
          <TableHeader>
            <TableRow className="border-b border-white/10">
              <TableHead className="text-slate-400">Title</TableHead>
              <TableHead className="text-slate-400">Author</TableHead>
              <TableHead className="text-slate-400">ISBN</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400 w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedBooks.map((b) => (
              <TableRow
                key={b.id}
                className="border-b border-white/10 hover:bg-white/5 transition"
              >
                <TableCell className="text-slate-100">{b.title}</TableCell>
                <TableCell className="text-slate-200">{b.author.name}</TableCell>
                <TableCell className="text-slate-400">{b.isbn || "-"}</TableCell>

                <TableCell>
                  {b.isBorrowed ? (
                    <Badge className="bg-red-600/40 text-red-200 border border-red-500/40 rounded-full">
                      Borrowed
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 rounded-full">
                      Available
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="space-x-2">
                  {/* Admin actions */}
                  {isAdmin && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3 py-1 bg-black/30 hover:bg-black/40 border-white/10"
                        onClick={() => handleEdit(b)}
                      >
                        <PencilIcon className="h-4 w-4 text-yellow-400" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3 py-1 bg-black/30 hover:bg-black/40 border-white/10"
                        onClick={() => handleDelete(b.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}

                  {/* User actions */}
                  {!isAdmin && (
                    <>
                      {!b.isBorrowed && (
                        <Button
                          size="sm"
                          className="bg-red-600/90 hover:bg-red-500 rounded-xl px-3 py-1"
                          onClick={() => handleBorrow(b.id)}
                        >
                          Borrow
                        </Button>
                      )}

                      {b.isBorrowed && b.borrowedByUser?.id === user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="btn-warning px-3 py-1"
                          onClick={() => handleReturn(b.id)}
                        >
                          Return
                        </Button>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {paginatedBooks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                  No books found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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
      </CardContent>
    </Card>
  );

  const FormSection = (
    <Card className="glass-card-lg animate-fade-slide">
      <CardHeader>
        <CardTitle className="text-lg">
          {editingId ? "Edit Book" : "Add Book"}
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          {editingId
            ? "Update book details."
            : "Create a new book entry."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-slate-400">Title</label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-black/40 border-white/10 text-slate-200 focus-visible:ring-red-500/70"
              placeholder="Book title"
            />
          </div>

          {/* ISBN */}
          <div>
            <label className="text-xs text-slate-400">ISBN (optional)</label>
            <Input
              value={form.isbn}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isbn: e.target.value }))
              }
              className="bg-black/40 border-white/10 text-slate-200 focus-visible:ring-red-500/70"
              placeholder="978-3-16-148410-0"
            />
          </div>

          {/* Author dropdown */}
          <div>
            <label className="text-xs text-slate-400">Author</label>
            <Select
              value={form.authorId ? String(form.authorId) : ""}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, authorId: Number(val) }))
              }
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-slate-200">
                <SelectValue placeholder="Select author" />
              </SelectTrigger>

              <SelectContent
                className="
                  bg-[#111216]
                  border border-white/10
                  text-slate-200
                  rounded-xl
                  shadow-xl
                  max-h-60
                  overflow-y-auto
                "
              >
                {authors.map((a) => (
                  <SelectItem
                    key={a.id}
                    value={String(a.id)}
                    className="
                      text-slate-200
                      hover:bg-white/10
                      data-[highlighted]:bg-white/10
                      data-[state=checked]:bg-red-500/20
                      data-[state=checked]:text-red-300
                    "
                  >
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600/90 hover:bg-red-500 rounded-xl text-white"
          >
            {editingId ? "Update Book" : "Add Book"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Books</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your library catalog and borrowing system.
        </p>
      </div>

      {!loading && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {isAdmin && FormSection}
          {TableSection}
        </div>
      )}

      {loading && (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      )}
    </div>
  );
}
