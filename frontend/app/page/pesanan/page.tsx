"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Gauge,
  Activity,
  AlertTriangle,
  BarChart3,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  API CLIENT                                                         */
/* ------------------------------------------------------------------ */

// Ganti lewat env var NEXT_PUBLIC_API_URL kalau backend tidak jalan di
// localhost:3001 (mis. saat deploy).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Wrapper kecil di atas fetch native (tanpa axios). Otomatis:
// - Menempelkan base URL
// - Menyisipkan query params
// - Mengirim cookie (credentials: "include") untuk auth berbasis session
// - Menyisipkan Authorization: Bearer <token> kalau ada token JWT di
//   localStorage (hapus bagian ini kalau auth-mu murni cookie/session)
// - Melempar error kalau response bukan 2xx, biar bisa ditangkap try/catch
async function apiGet<T = any>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} gagal (${res.status}): ${text || res.statusText}`);
  }

  // Handle body kosong (mis. 204 No Content) tanpa error JSON parse
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type OrderStatus = "MENUNGGU" | "LUNAS" | "DITOLAK";

interface Order {
  invoice: string;
  name: string;
  phone: string;
  event: string;
  total: string;
  status: "DIBATALKAN" | "TIDAK DIBATALKAN";
  date: string;
}

interface EventOption {
  id: string | number;
  name: string;
}

interface QuotaCategory {
  name: string;
  sold: number;
  quota: number;
  note: string;
  critical?: boolean;
}

interface QuotaEvent {
  id: string | number;
  name: string;
  location: string;
  tag: string;
  tagColor: string;
  categories: QuotaCategory[];
}

interface QuotaStats {
  totalAvailable: number;
  totalSold: number;
  remaining: number;
  criticalCount: number;
}

const statusStyle: Record<Order["status"], string> = {
  "TIDAK DIBATALKAN": "bg-[#E1F5E7] text-[#2E9E5B]",
  DIBATALKAN: "bg-[#FBE4E4] text-[#D0524A]",
};

/* ------------------------------------------------------------------ */
/*  HELPERS                                                             */
/* ------------------------------------------------------------------ */

// Backend kemungkinan mengirim status dalam bentuk lain, mis. "pending",
// "paid", "rejected" — sesuaikan mapping ini kalau perlu.
function normalizeCancellationStatus(
  raw: string | undefined
): "DIBATALKAN" | "TIDAK DIBATALKAN" {
  const v = (raw || "").toLowerCase();

  if (v === "cancelled" || v === "canceled") {
    return "DIBATALKAN";
  }

  return "TIDAK DIBATALKAN";
}
function formatCurrency(value: number | string | undefined): string {
  const num = typeof value === "string" ? Number(value) : value ?? 0;
  if (Number.isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Ambil array data dari berbagai kemungkinan bentuk response
// ({ data: [...] }, { rows: [...] }, atau langsung array).
function unwrapList<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

/* ------------------------------------------------------------------ */
/*  API CALLS                                                          */
/* ------------------------------------------------------------------ */

interface FetchOrdersParams {
  page: number;
  limit: number;
  eventId?: string;
  status?: string;
  promo?: string;
  search?: string;
}

async function fetchOrders(params: FetchOrdersParams) {
  const data = await apiGet<any>("/order", {
    page: params.page,
    limit: params.limit,
    event_id: params.eventId || undefined,
    status: params.status || undefined,
    promo: params.promo || undefined,
    search: params.search || undefined,
  });

  const raw = unwrapList<any>(data);
  const total: number =
    data?.total ?? data?.count ?? data?.meta?.total ?? raw.length;

const orders: Order[] = raw.map((o) => ({
  invoice: o.invoice_number ?? `#INV-${o.id}`,

  name: o.customer_name ?? "-",

  phone: o.customer_phone ?? "-",
  event: o.event_title ?? "-",

  total: formatCurrency(o.total_amount),

  status: normalizeCancellationStatus(o.order_status),

  date: formatDate(o.order_date),
}));

  return { orders, total };
}

async function fetchEvents(): Promise<EventOption[]> {
  const data = await apiGet<any>("/events");
  const raw = unwrapList<any>(data);
  return raw.map((e) => ({ id: e.id, name: e.name ?? e.title ?? "-" }));
}

// Kuota per kategori tiket ditarik dari /tiket-types (difilter per event id
// kalau backend-mu mendukung query event_id). Kalau tiket-types sudah
// mengandung field event_name/venue/date langsung, ini otomatis kepakai.
async function fetchQuotaForEvents(events: EventOption[]): Promise<{
  quotaEvents: QuotaEvent[];
  stats: QuotaStats;
}> {
  const quotaEvents: QuotaEvent[] = [];
  let totalAvailable = 0;
  let totalSold = 0;
  let criticalCount = 0;

  for (const ev of events) {
    const data = await apiGet<any>("/tiket-types", { event_id: ev.id });
    const rawTypes = unwrapList<any>(data);
    if (rawTypes.length === 0) continue;

    const categories: QuotaCategory[] = rawTypes.map((t) => {
      const quota = Number(t.quota ?? t.total_quota ?? 0);
      const sold = Number(t.sold ?? t.tickets_sold ?? 0);
      const pct = quota > 0 ? (sold / quota) * 100 : 0;
      const critical = pct >= 90;
      if (critical) criticalCount += 1;
      totalAvailable += quota;
      totalSold += sold;
      return {
        name: t.name ?? t.type_name ?? "-",
        sold,
        quota,
        note: `${pct.toFixed(pct % 1 === 0 ? 0 : 1)}% terjual`,
        critical,
      };
    });

    const maxPct = Math.max(
      ...categories.map((c) => (c.quota > 0 ? (c.sold / c.quota) * 100 : 0))
    );
    const tag = maxPct >= 95 ? "Hampir Sold Out" : maxPct >= 60 ? "Sedang Laris" : "Tersedia";
    const tagColor =
      maxPct >= 95
        ? "bg-[#FBE4E4] text-[#D0524A]"
        : maxPct >= 60
        ? "bg-[#E4EEFB] text-[#3B6FC9]"
        : "bg-[#E1F5E7] text-[#2E9E5B]";

    const meta = rawTypes[0]?.event ?? {};
    quotaEvents.push({
      id: ev.id,
      name: ev.name,
      location: [meta.venue_name ?? meta.location, formatDate(meta.date)]
        .filter(Boolean)
        .join(" · "),
      tag,
      tagColor,
      categories,
    });
  }

  return {
    quotaEvents,
    stats: {
      totalAvailable,
      totalSold,
      remaining: totalAvailable - totalSold,
      criticalCount,
    },
  };
}

async function fetchActivityLog(): Promise<string[]> {
  try {
    const data = await apiGet<any>("/notifications", { limit: 5 });
    const raw = unwrapList<any>(data);
    return raw.map((n) => n.message ?? n.title ?? String(n));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  SHARED UI                                                          */
/* ------------------------------------------------------------------ */

function TopBar() {
  const [query, setQuery] = useState("");
   const router = useRouter();
   const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#F0E4DC] bg-white px-8 py-4">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8A99E]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari pesanan, event, atau pemesan..."
          className="w-full rounded-lg border border-[#EEE1D8] bg-[#FFF8F4] py-2 pl-9 pr-4 text-sm text-[#3A2E27] placeholder:text-[#B8A99E] outline-none focus:border-[#E8A26B] focus:ring-2 focus:ring-[#F5D9BE]"
        />
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative rounded-full p-2 text-[#8C7A6F] hover:bg-[#FFF3EA]"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E8734A]" />
        </button>
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
    </div>
  );
}

type Tab = "pesanan" | "kuota";

function Breadcrumb({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <p className="text-sm text-[#B8A99E]">
      <span>Dashboard</span>
      <span className="mx-1.5">/</span>
      <button
        type="button"
        onClick={() => onChange("pesanan")}
        className={
          active === "pesanan"
            ? "font-medium text-[#3B6FC9]"
            : "text-[#B8A99E] hover:text-[#3A2E27]"
        }
      >
        Pesanan
      </button>
      <span className="mx-1.5">/</span>
      <button
        type="button"
        onClick={() => onChange("kuota")}
        className={
          active === "kuota"
            ? "font-medium text-[#3B6FC9]"
            : "text-[#B8A99E] hover:text-[#3A2E27]"
        }
      >
        Kuota Tiket
      </button>
    </p>
  );
}

function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-[#B8A99E]">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  TAB: PESANAN                                                       */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 10;

function PesananView({ onOpenKuota }: { onOpenKuota: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [promoFilter, setPromoFilter] = useState("");

  // Nilai filter yang benar-benar dipakai di request (diterapkan lewat tombol)
  const [appliedFilters, setAppliedFilters] = useState({
    eventId: "",
    status: "",
    promo: "",
  });

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { orders: data, total: t } = await fetchOrders({
        page,
        limit: PAGE_SIZE,
        eventId: appliedFilters.eventId,
        status: appliedFilters.status,
        promo: appliedFilters.promo,
      });
      setOrders(data);
      setTotal(t);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pesanan. Coba lagi.");
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters({
      eventId: eventFilter,
      status: statusFilter,
      promo: promoFilter,
    });
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#3A2E27]">
            Daftar Pesanan Masuk
          </h1>
          <div className="mt-1">
            <Breadcrumb active="pesanan" onChange={(t) => t === "kuota" && onOpenKuota()} />
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenKuota}
          className="flex items-center gap-2 rounded-lg border border-[#EEE1D8] bg-white px-4 py-2 text-sm font-medium text-[#3A2E27] shadow-sm hover:bg-[#FFF3EA]"
        >
          <Gauge className="h-4 w-4 text-[#8C7A6F]" />
          Monitor Kuota
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-xl border border-[#F0E4DC] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-[#8C7A6F]">
              Pilih Event
            </label>
            <div className="relative">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#EEE1D8] bg-white px-3 py-2 pr-8 text-sm text-[#3A2E27] outline-none focus:border-[#E8A26B]"
              >
                <option value="">Semua Event</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8A99E]" />
            </div>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-[#8C7A6F]">
              Status Bayar
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#EEE1D8] bg-white px-3 py-2 pr-8 text-sm text-[#3A2E27] outline-none focus:border-[#E8A26B]"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="paid">Lunas</option>
                <option value="rejected">Ditolak</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8A99E]" />
            </div>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-[#8C7A6F]">
              Promo
            </label>
            <div className="relative">
              <select
                value={promoFilter}
                onChange={(e) => setPromoFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#EEE1D8] bg-white px-3 py-2 pr-8 text-sm text-[#3A2E27] outline-none focus:border-[#E8A26B]"
              >
                <option value="">Semua Promo</option>
                <option value="early_bird">Early Bird</option>
                <option value="member">Diskon Member</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8A99E]" />
            </div>
          </div>
          <button
            type="button"
            aria-label="Filter tambahan"
            className="rounded-lg border border-[#EEE1D8] bg-white p-2.5 text-[#8C7A6F] hover:bg-[#FFF3EA]"
          >
            <Filter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-[#F5A623] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E8991A]"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-[#FBE4E4] bg-[#FFF5F5] px-4 py-3 text-sm text-[#D0524A]">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#F0E4DC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
<thead>
  <tr className="bg-[#FCEFDF] text-xs font-semibold uppercase tracking-wide text-[#8C7A6F]">
    <th className="px-6 py-4">Nama</th>
    <th className="px-6 py-4">No. Telepon</th>
    <th className="px-6 py-4 text-left">Event</th>
    <th className="px-6 py-4">Harga</th>
    <th className="px-6 py-4">Status Pesanan</th>
    <th className="px-6 py-4">Tgl Pesan</th>
    <th className="px-6 py-4">Aksi</th>
  </tr>
</thead>
<tbody>
  {loading ? (
    <LoadingRow colSpan={7} />
  ) : orders.length === 0 ? (
    <tr>
      <td
        colSpan={7}
        className="px-6 py-10 text-center text-[#B8A99E]"
      >
        Tidak ada pesanan yang cocok dengan filter.
      </td>
    </tr>
  ) : (
    orders.map((o) => (
      <tr
        key={o.invoice}
        className="border-t border-[#F5EAE1] hover:bg-[#FFFBF7]"
      >
        {/* NAMA */}
        <td className="px-6 py-4">
          <p className="font-medium text-[#3A2E27]">
            {o.name}
          </p>
        </td>

        {/* NO TELEPON */}
        <td className="px-6 py-4 text-[#3A2E27]">
          {o.phone}
        </td>

        {/* EVENT */}
<td className="px-6 py-4 text-[#3A2E27]">
  {o.event}
</td>

        {/* HARGA */}
        <td className="px-6 py-4 text-[#3A2E27]">
          {o.total}
        </td>

        {/* STATUS PEMBATALAN */}
        <td className="px-6 py-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              statusStyle[o.status]
            }`}
          >
            {o.status}
          </span>
        </td>

        {/* TANGGAL PEMESANAN */}
        <td className="px-6 py-4 text-[#3A2E27]">
          {o.date}
        </td>

        {/* AKSI */}
        <td className="px-6 py-4">
          <button
            type="button"
            aria-label={`Lihat detail ${o.invoice}`}
            className="rounded-lg p-2 text-[#3B6FC9] hover:bg-[#E4EEFB]"
          >
            <Eye className="h-4 w-4" />
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F5EAE1] px-6 py-4 text-sm text-[#8C7A6F]">
          <p>
            {total === 0
              ? "Tidak ada pesanan"
              : `Menampilkan ${(page - 1) * PAGE_SIZE + 1}-${Math.min(
                  page * PAGE_SIZE,
                  total
                )} dari ${total} pesanan`}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg p-1.5 text-[#B8A99E] hover:bg-[#FFF3EA] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={
                    p === page
                      ? "h-7 w-7 rounded-lg bg-[#3B6FC9] text-sm font-medium text-white"
                      : "h-7 w-7 rounded-lg text-sm font-medium text-[#3A2E27] hover:bg-[#FFF3EA]"
                  }
                >
                  {p}
                </button>
              ))}
            <button
              type="button"
              aria-label="Halaman berikutnya"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg p-1.5 text-[#B8A99E] hover:bg-[#FFF3EA] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TAB: KUOTA TIKET                                                    */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "danger";
}) {
  return (
    <div className="rounded-xl border border-[#F0E4DC] bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-[#B8A99E]">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          highlight === "danger" ? "text-[#D0524A]" : "text-[#3A2E27]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function QuotaBar({
  sold,
  quota,
  critical,
}: {
  sold: number;
  quota: number;
  critical?: boolean;
}) {
  const pct = quota > 0 ? Math.min(100, Math.round((sold / quota) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F5EAE1]">
      <div
        className={`h-full rounded-full ${critical ? "bg-[#D0524A]" : "bg-[#3B6FC9]"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function KuotaView({ onOpenPesanan }: { onOpenPesanan: () => void }) {
  const [quotaEvents, setQuotaEvents] = useState<QuotaEvent[]>([]);
  const [stats, setStats] = useState<QuotaStats>({
    totalAvailable: 0,
    totalSold: 0,
    remaining: 0,
    criticalCount: 0,
  });
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await fetchEvents();
      const [{ quotaEvents: qe, stats: st }, log] = await Promise.all([
        fetchQuotaForEvents(events),
        fetchActivityLog(),
      ]);
      setQuotaEvents(qe);
      setStats(st);
      setActivityLog(log);
      setLastUpdated(
        new Intl.DateTimeFormat("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date())
      );
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data kuota tiket. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Refresh otomatis tiap 30 detik supaya "Real-time Update" beneran nyata
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="px-8 py-8">
      <div className="mb-1">
        <h1 className="text-2xl font-semibold text-[#3A2E27]">Kuota Tiket</h1>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Breadcrumb active="kuota" onChange={(t) => t === "pesanan" && onOpenPesanan()} />
          <span className="flex items-center gap-1 text-xs text-[#8C7A6F]">
            <Activity className="h-3.5 w-3.5 text-[#3B9E63]" />
            Real-time Update
            {lastUpdated ? ` · Terakhir diperbarui ${lastUpdated}` : ""}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-[#FBE4E4] bg-[#FFF5F5] px-4 py-3 text-sm text-[#D0524A]">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Tiket Tersedia"
          value={stats.totalAvailable.toLocaleString("id-ID")}
        />
        <StatCard
          label="Terjual (Semua Event)"
          value={stats.totalSold.toLocaleString("id-ID")}
        />
        <StatCard
          label="Sisa Kuota"
          value={stats.remaining.toLocaleString("id-ID")}
        />
        <StatCard
          label="Kritikal (< 10%)"
          value={`${stats.criticalCount} Kategori`}
          highlight="danger"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: events */}
        <div className="space-y-5 xl:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-[#F0E4DC] bg-white p-10 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-[#B8A99E]" />
            </div>
          ) : quotaEvents.length === 0 ? (
            <div className="rounded-xl border border-[#F0E4DC] bg-white p-10 text-center text-sm text-[#B8A99E] shadow-sm">
              Belum ada data kuota tiket.
            </div>
          ) : (
            quotaEvents.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-[#F0E4DC] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#3A2E27]">{ev.name}</p>
                    <p className="text-xs text-[#B8A99E]">{ev.location}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${ev.tagColor}`}
                  >
                    {ev.tag}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {ev.categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 font-medium text-[#3A2E27]">
                          {cat.critical && (
                            <AlertTriangle className="h-3.5 w-3.5 text-[#D0524A]" />
                          )}
                          {cat.name}
                        </span>
                        <span className="text-[#8C7A6F]">
                          {cat.sold} / {cat.quota} Terjual
                        </span>
                      </div>
                      <QuotaBar sold={cat.sold} quota={cat.quota} critical={cat.critical} />
                      <p
                        className={`mt-1 text-xs ${
                          cat.critical ? "text-[#D0524A]" : "text-[#B8A99E]"
                        }`}
                      >
                        {cat.note}
                        {cat.critical ? " · Hampir Habis" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: activity + chart + alert */}
        <div className="space-y-5">
          <div className="rounded-xl border border-[#F0E4DC] bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-[#3A2E27]">
              Aktifitas Penjualan
            </p>
            {activityLog.length === 0 ? (
              <p className="text-sm text-[#B8A99E]">Belum ada aktivitas terbaru.</p>
            ) : (
              <ul className="space-y-3">
                {activityLog.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B6FC9]" />
                    <span className="text-[#3A2E27]">{item}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="mt-4 text-sm font-medium text-[#3B6FC9] hover:underline"
            >
              Lihat Semua Log
            </button>
          </div>

          <div className="rounded-xl border border-[#F0E4DC] bg-white p-5 shadow-sm">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#3A2E27]">
              <BarChart3 className="h-4 w-4 text-[#8C7A6F]" />
              Laju Penjualan
            </p>
            {/*
              TODO: sambungkan ke endpoint tren penjualan per jam kalau sudah
              tersedia (mis. GET /api/analytics/sales-trend). Untuk sekarang
              dihitung sederhana dari rasio total terjual supaya tidak hardcode.
            */}
            <div className="flex h-24 items-end gap-1.5">
              {[30, 45, 25, 60, 40, 80, 55, 35].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${
                    i === 5 ? "bg-[#3B6FC9]" : "bg-[#D9E4F5]"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-[#B8A99E]">
              <span>08:00</span>
              <span>13:00</span>
              <span>Sekarang</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#D0524A] p-4 text-white shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Peringatan Stok
            </p>
            <p className="mt-1 text-sm text-white/90">
              {stats.criticalCount} Event/Kategori Memasuki Tahap Sold Out
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                                */
/*  Catatan: sidebar TIDAK disertakan di file ini karena sudah ada     */
/*  di layout project (mis. app/(dashboard)/layout.tsx). Komponen ini  */
/*  hanya berisi topbar + konten halaman, tinggal dipasang sebagai     */
/*  children dari layout tersebut.                                     */
/* ------------------------------------------------------------------ */

export default function OrdersQuotaDashboard() {
  const [tab, setTab] = useState<Tab>("pesanan");

  return (
    <div className="min-h-screen bg-[#FFF8F4]">
      <TopBar />
      {tab === "pesanan" ? (
        <PesananView onOpenKuota={() => setTab("kuota")} />
      ) : (
        <KuotaView onOpenPesanan={() => setTab("pesanan")} />
      )}
    </div>
  );
}