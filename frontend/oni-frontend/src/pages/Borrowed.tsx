import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";

interface Author {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  isbn?: string;
  author: Author;
  isBorrowed: boolean;
}

export default function Borrowed() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadBorrowed = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await api.get("/borrow/user/me");
      setBooks(res.data);
    } catch (err) {
      toast.error("Failed to load borrowed books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowed();
  }, [user]);

  const handleReturn = async (bookId: number) => {
    try {
      await api.post("/borrow/return", { bookId });
      toast.success("Book returned successfully");
      loadBorrowed();
    } catch {
      toast.error("Failed to return book");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;

    return books.filter((b) =>
      [
        b.title,
        b.author?.name,
        b.isbn || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [books, search]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Borrowed Books</h1>
          <p className="text-muted-foreground text-sm">
            View and return books you have borrowed.
          </p>
        </div>

        {books.length > 0 && (
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-64"
          />
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <Card className="p-4">
          <Skeleton className="h-5 w-1/4 mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </Card>
      )}

      {/* Empty State */}
      {!loading && books.length === 0 && (
        <Card className="py-12 text-center">
          <CardTitle className="text-lg">No borrowed books</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Go to Books and borrow something.
          </p>
        </Card>
      )}

      {/* No search results */}
      {!loading && books.length > 0 && filtered.length === 0 && (
        <Card className="py-10 text-center">
          <CardTitle>No matches found</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Try searching with a different title or author.
          </p>
        </Card>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Borrowed Books</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead className="text-right">Return</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>{b.author?.name}</TableCell>
                    <TableCell>{b.isbn || "-"}</TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReturn(b.id)}
                      >
                        Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
