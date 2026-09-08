"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Ticket,
  Wallet,
  CalendarDays,
  MoreVertical,
  ArrowRight,
  ChevronDown,
  Download,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:3001/api";

// ---------- Tipe data dari API ----------
interface RevenueRes {
  total_revenue: number | null;
}
interface OrdersRes {
  total_orders: number;
}
interface TicketsRes {
  tickets_sold: number | null;
}
interface BestEvent {
  title: string;
  total_ticket: number;
}
interface EventFromApi {
  id: number;
  title: string;
  genre: string;
  event_date: string;
  status: string; // nilai asli dari DB, misal "draft" | "published" | "completed"
  venue_name: string;
  admin_name: string;
}

// ---------- Mapping status & warna ----------
// Sesuaikan key di sini kalau nilai enum status di database kamu beda
const statusLabel: Record<string, string> = {
  draft: "Draft",
  published: "Terjadwal",
  ongoing: "Berlangsung",
  completed: "Selesai",
};

const statusStyles: Record<string, string> = {
  draft: "text-[#6B6459] bg-[#6B6459]/10",
  published: "text-[#1E5A88] bg-[#1E5A88]/10",
  ongoing: "text-[#C25B3F] bg-[#C25B3F]/10",
  completed: "text-[#2E9E5B] bg-[#2E9E5B]/10",
};

const GENRE_COLORS = ["#1E5A88", "#7EC8E3", "#2E4A63", "#D8C9B0", "#C25B3F"];

export default function DashboardPage() {
  const router = useRouter();

  const [revenue, setRevenue] = useState(0);
  const [orders, setOrders] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [bestEvents, setBestEvents] = useState<BestEvent[]>([]);
  const [events, setEvents] = useState<EventFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [revRes, ordRes, tixRes, bestRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/analytics/revenue`, { headers }),
          fetch(`${API_URL}/analytics/orders`, { headers }),
          fetch(`${API_URL}/analytics/tickets`, { headers }),
          fetch(`${API_URL}/analytics/best-events`, { headers }),
          fetch(`${API_URL}/events`, { headers }),
        ]);

        if (!revRes.ok || !ordRes.ok || !tixRes.ok || !bestRes.ok || !eventsRes.ok) {
          throw new Error("Gagal memuat data dashboard");
        }

        const revData: RevenueRes = await revRes.json();
        const ordData: OrdersRes = await ordRes.json();
        const tixData: TicketsRes = await tixRes.json();
        const bestData: BestEvent[] = await bestRes.json();
        const eventsData: EventFromApi[] = await eventsRes.json();

        setRevenue(revData.total_revenue ?? 0);
        setOrders(ordData.total_orders ?? 0);
        setTicketsSold(tixData.tickets_sold ?? 0);
        setBestEvents(bestData);
        setEvents(eventsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
      notation: value >= 1_000_000 ? "compact" : "standard",
    }).format(value);

  const formatTanggal = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (isLoading) {
    return <div className="p-8 text-sm text-[#6B6459]">Memuat dashboard...</div>;
  }
  if (error) {
    return <div className="p-8 text-sm text-red-500">{error}</div>;
  }

  // --- Turunan data dari events (dihitung di frontend, bukan endpoint baru) ---
  const eventAktif = events.filter(
    (e) => e.status === "published" || e.status === "ongoing"
  ).length;

  const genreCount: Record<string, number> = {};
  events.forEach((e) => {
    genreCount[e.genre] = (genreCount[e.genre] || 0) + 1;
  });
  const totalGenreEvents = events.length || 1;
  const genreData = Object.entries(genreCount)
    .map(([label, count], i) => ({
      label,
      percent: Math.round((count / totalGenreEvents) * 100),
      color: GENRE_COLORS[i % GENRE_COLORS.length],
    }))
    .sort((a, b) => b.percent - a.percent);

  const stats = [
    { icon: Ticket, label: "Total Tiket Terjual", value: ticketsSold.toLocaleString("id-ID") },
    { icon: Wallet, label: "Total Revenue", value: formatRupiah(revenue) },
    { icon: CalendarDays, label: "Event Aktif", value: eventAktif.toString() },
    { icon: CalendarDays, label: "Total Order", value: orders.toLocaleString("id-ID") },
  ];

  const recentEvents = events.slice(0, 4);

  return (
    <div className="p-8">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-enter { animation: fadeSlideUp 0.5s ease-out both; }
      `}</style>

      {/* Top bar: search + admin */}
      <div
        className="animate-enter mt-6 flex items-center justify-between gap-6"
        style={{ animationDelay: "80ms" }}
      >
        <div className="group flex items-center gap-3 flex-1 max-w-2xl rounded-xl bg-[#F4DEB5]/40 border border-transparent px-5 py-4 transition-all duration-200 focus-within:bg-[#FCF8F3] focus-within:border-[#6E5A3F] focus-within:shadow-[0_0_0_3px_rgba(110,90,63,0.08)]">
          <Search
            size={22}
            className="text-[#6B6459] shrink-0 transition-colors duration-200 group-focus-within:text-[#6E5A3F]"
          />
          <input
            type="text"
            placeholder="Cari event, artis, atau transaksi..."
            className="w-full bg-transparent text-base text-[#6B6459] placeholder:text-[#B0A695] outline-none"
          />
        </div>

<div className="flex items-center gap-3">
  {/* Tombol Toggle Tema */}
  <button
    type="button"
    onClick={() => setIsDarkMode((prev) => !prev)}
    aria-label={isDarkMode ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
    className={`group relative shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
      isDarkMode
        ? "border-[#1E3C4C] bg-[#1E293B] text-[#F5C842] hover:border-[#F5C842] hover:shadow-[#F5C842]/15"
        : "border-[#E8DDD2] bg-[#FCF8F3] text-[#F5A623] hover:border-[#1E5A88] hover:shadow-[#1E5A88]/15"
    }`}
  >
    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
    <span className="relative">
      {isDarkMode ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </span>
  </button>

  {/* Tombol Lihat Profile */}
  <button
    type="button"
    onClick={() => router.push("/page/profile")}
    className={`group relative shrink-0 rounded-xl border px-5 py-2.5 text-sm font-semibold cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
      isDarkMode
        ? "border-[#2C3E50] bg-[#1E293B] text-[#F5F0E8] hover:border-[#F5C842] hover:text-[#F5C842] hover:shadow-[#F5C842]/15"
        : "border-[#E8DDD2] bg-[#FCF8F3] text-[#1E1B16] hover:border-[#1E5A88] hover:text-[#1E5A88] hover:shadow-[#1E5A88]/15"
    }`}
  >
    <span
      className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full ${
        isDarkMode ? "via-[#F5C842]/10" : "via-[#1E5A88]/10"
      }`}
    />
    <span className="relative">Lihat Profile</span>
  </button>

</div>
      </div>

      {/* Stat cards */}
      <div
        className="animate-enter mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        style={{ animationDelay: "160ms" }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#D8C9B0] cursor-default"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#1E5A88]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1E5A88]/8 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={20} className="text-[#1E5A88]" strokeWidth={2} />
                </div>
              </div>
              <p className="relative mt-4 text-xs uppercase tracking-wide text-[#6B6459] font-medium">
                {stat.label}
              </p>
              <p className="relative mt-1 text-2xl font-bold text-[#1E1B16]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart section */}
      <div
        className="animate-enter mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4"
        style={{ animationDelay: "500ms" }}
      >
        {/* Grafik Penjualan Tiket (tetap pakai data bestEvents, cuma gaya visualnya diganti) */}
        <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-6 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#1E1B16]">
                Grafik Penjualan Tiket
              </h3>
              <p className="mt-1 text-sm text-[#6B6459]">
                Performa penjualan berdasarkan event terlaris
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#F4DEB5]/50 border border-[#E8DDD2] px-3 py-2 text-sm font-medium text-[#1E1B16] hover:bg-[#F4DEB5]/70 transition-colors"
              >
                Mei 2024
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#1E5A88] px-3 py-2 text-sm font-medium text-white hover:bg-[#17466B] transition-colors shadow-sm shadow-[#1E5A88]/30"
              >
                <Download size={16} />
                Ekspor Data
              </button>
            </div>
          </div>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bestEvents} margin={{ top: 16, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTiket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E5A88" stopOpacity={0.35} />
                    <stop offset="55%" stopColor="#1E5A88" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#1E5A88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#E8DDD2"
                  strokeDasharray="3 6"
                />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 11, fill: "#9A9186" }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={48}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9A9186" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  cursor={{ stroke: "#1E5A88", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E8DDD2",
                    borderRadius: "10px",
                    fontSize: "12px",
                    boxShadow: "0 8px 24px -8px rgba(30,90,136,0.25)",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: "#1E1B16", fontWeight: 600, marginBottom: 4 }}
                  itemStyle={{ color: "#1E5A88", fontWeight: 600 }}
                  formatter={(value) => [`${Number(value).toLocaleString("id-ID")} tiket`, "Terjual"]}
                />
                <Area
                  type="natural"
                  dataKey="total_ticket"
                  stroke="#1E5A88"
                  strokeWidth={3}
                  fill="url(#colorTiket)"
                  activeDot={{
                    r: 6,
                    fill: "#1E5A88",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  }}
                  dot={false}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Perbandingan Genre */}
        <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#1E1B16]">Perbandingan Genre</h3>
          <p className="mt-1 text-sm text-[#6B6459]">Distribusi jumlah event per genre</p>

          <div className="mt-6 flex flex-col gap-5">
            {genreData.map((genre) => (
              <div key={genre.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-[#1E1B16]">{genre.label}</span>
                  <span className="font-bold text-[#1E5A88]">{genre.percent}%</span>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full bg-[#F4DEB5]/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${genre.percent}%`, backgroundColor: genre.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {genreData.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#E8DDD2] flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#F4DEB5]/60 shrink-0">
                <TrendingUp size={16} className="text-[#6E5A3F]" />
              </div>
              <p className="text-sm text-[#6B6459] pt-1">
                Genre <span className="font-semibold text-[#1E1B16]">{genreData[0].label}</span> paling
                banyak diselenggarakan saat ini ({genreData[0].percent}% dari total event).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* List Event Terbaru */}
      <div
        className="animate-enter mt-6 rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] overflow-hidden"
        style={{ animationDelay: "600ms" }}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-base font-semibold text-[#1E1B16]">List Event Terbaru</h3>
          <Link
            href="/page/event"
            className="flex items-center gap-1 text-sm font-semibold text-[#1E5A88] hover:text-[#17466B] transition-colors"
          >
            Lihat Semua Event
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="bg-[#F4DEB5]/50">
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                  Nama Konser
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                  Venue
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                  Tanggal
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event, i) => (
                <tr
                  key={event.id}
                  className={[
                    "transition-colors hover:bg-[#F7EFE4]",
                    i !== recentEvents.length - 1 ? "border-b border-[#E8DDD2]" : "",
                  ].join(" ")}
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#1E1B16]">{event.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#6B6459]">{event.venue_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#6B6459]">{formatTanggal(event.event_date)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={[
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                        statusStyles[event.status] ?? "text-[#6B6459] bg-[#6B6459]/10",
                      ].join(" ")}
                    >
                      {statusLabel[event.status] ?? event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      aria-label="Aksi lainnya"
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F4DEB5]/60 transition-colors"
                    >
                      <MoreVertical size={16} className="text-[#6B6459]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}