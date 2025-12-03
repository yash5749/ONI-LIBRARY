import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import {
  BookOpenIcon,
  UsersIcon,
  BookmarkIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    borrowedBooks: 0,
    totalUsers: 0,
  });

  // chart states
  const [borrowTrendData, setBorrowTrendData] = useState<any[]>([]);
  const [topAuthorsData, setTopAuthorsData] = useState<any[]>([]);

  // helper: generate array of last 7 day labels (Mon, Tue, ...)
  const getLast7DaysLabels = () => {
    const labels: string[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(days[d.getDay()]);
    }
    return labels;
  };

  // helper: safe parse date
  const parseDate = (val: any) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const [booksRes, authorsRes, usersRes] = await Promise.all([
        api.get("/books"),
        api.get("/authors"),
        api.get("/users"),
      ]);

      const books = booksRes.data || [];
      const authors = authorsRes.data || [];
      const users = usersRes.data || [];

      // -------------------------
      // Stats
      // -------------------------
      const borrowedCount = books.filter((b: any) => b.isBorrowed).length;

      setStats({
        totalBooks: books.length,
        totalAuthors: authors.length,
        borrowedBooks: borrowedCount,
        totalUsers: users.length,
      });

      // -------------------------
      // Borrow Trend (last 7 days)
      // Strategy:
      // - If books have `borrowedAt` (ISO timestamp), count borrows per day.
      // - Otherwise fallback: put current borrowed count on today's label and 0 on others
      // -------------------------
      const labels = getLast7DaysLabels(); // ordered from oldest -> today
      const trendMap: Record<string, number> = {};
      labels.forEach((l) => (trendMap[l] = 0));

      // try to detect any timestamp field in books
      const sample = books.find((b: any) => b.borrowedAt || b.borrowed_at || b.updatedAt || b.updated_at);
      if (sample) {
        // use `borrowedAt` or fallback to `updatedAt`/`borrowed_at`
        books.forEach((b: any) => {
          const ts = b.borrowedAt ?? b.borrowed_at ?? b.updatedAt ?? b.updated_at ?? null;
          const parsed = parseDate(ts);
          if (!parsed) return;

          // only count if within last 7 days
          const diff = Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
          if (diff >= 0 && diff < 7) {
            const dayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parsed.getDay()];
            trendMap[dayLabel] = (trendMap[dayLabel] || 0) + 1;
          }
        });
      } else {
        // no timestamps available — fallback: mark today's count as borrowedCount
        const todayLabel = labels[labels.length - 1];
        trendMap[todayLabel] = borrowedCount;
      }

      const trendArray = labels.map((day) => ({ day, count: trendMap[day] || 0 }));
      setBorrowTrendData(trendArray);

      // -------------------------
      // Top Authors (by book count)
      // -------------------------
      const authorCountMap: Record<string | number, number> = {};
      books.forEach((b: any) => {
        // assume authorId or author_id or author field with id
        const aid = b.authorId ?? b.author_id ?? (b.author && b.author.id) ?? null;
        if (!aid) return;
        authorCountMap[aid] = (authorCountMap[aid] || 0) + 1;
      });
      type AuthorStat = { name: string; books: number };

      const top: AuthorStat[] = authors
        .map(
          (a: any): AuthorStat => ({
            name: a.name ?? a.title ?? `Author ${a.id}`,
            books: authorCountMap[a.id] ?? 0,
          })
        )
        .sort((a: AuthorStat, b: AuthorStat) => b.books - a.books)
        .slice(0, 6);


      setTopAuthorsData(top);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // optionally, refresh every X seconds: comment/uncomment if desired
    // const id = setInterval(loadStats, 60_000); // refresh each minute
    // return () => clearInterval(id);
  }, []);

  const items = [
    {
      label: "Total Books",
      value: stats.totalBooks,
      icon: <BookOpenIcon className="h-7 w-7 text-red-400" />,
    },
    {
      label: "Total Authors",
      value: stats.totalAuthors,
      icon: <UsersIcon className="h-7 w-7 text-red-400" />,
    },
    {
      label: "Borrowed Books",
      value: stats.borrowedBooks,
      icon: <BookmarkIcon className="h-7 w-7 text-red-400" />,
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <ChartBarIcon className="h-7 w-7 text-red-400" />,
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Overview of library statistics and activity.
        </p>
      </div>

      {/* Skeleton state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <Card
              key={i}
              className="glass-card hover:-translate-y-1 hover:scale-[1.01] transition-transform duration-300"
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl border border-red-500/40 bg-red-500/15">
                  {item.icon}
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{item.label}</p>
                  <p className="text-3xl font-semibold text-white mt-1">
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator className="my-6 bg-white/10" />

      {/* ======== Charts Section ======== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        {/* Borrow Trend (Line Chart) */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Borrow Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={borrowTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                <XAxis dataKey="day" stroke="#7c7f93" />
                <YAxis stroke="#7c7f93" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d0f1a",
                    border: "1px solid #2a2d41",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Authors (Bar Chart) */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Authors</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topAuthorsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                <XAxis dataKey="name" stroke="#7c7f93" />
                <YAxis stroke="#7c7f93" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d0f1a",
                    border: "1px solid #2a2d41",
                  }}
                />
                <Bar dataKey="books" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* ======== End Charts Section ======== */}

      {/* System overview */}
      {!loading && (
        <Card className="glass-card-lg">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm leading-relaxed">
              This dashboard provides a high-level snapshot of your library’s
              activity. Use the sidebar to manage books, authors, users, and
              borrowing operations. All metrics update automatically as you work.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
