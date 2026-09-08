"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Check,
  X,
  Eye,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Sun, Moon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  CONFIG                                                             */
/* ------------------------------------------------------------------ */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type RefundStatus = "DIAJUKAN" | "DITOLAK" | "SELESAI" | "DISETUJUI";

interface Refund {
  id: string | number;
  invoice: string;
  name: string;
  email: string;
  initials: string;
  event: string;
  reason: string;
  amount: string;
  status: RefundStatus;
  date: string;
}

interface RefundStats {
  totalAjuan: number;
  menungguPersetujuan: number;
  totalRefundIDR: number;
  rataRataProsesHari: number;
}

/* ------------------------------------------------------------------ */
/*  ADAPTER — sesuaikan bagian ini kalau bentuk response backend       */
/*  ternyata beda dari asumsi di bawah.                                */
/* ------------------------------------------------------------------ */

// Mapping status dari backend (Inggris) -> label UI (Indonesia)
const STATUS_FROM_API: Record<string, RefundStatus> = {
  pending: "DIAJUKAN",
  approved: "DISETUJUI",
  rejected: "DITOLAK",
  completed: "SELESAI",
  // fallback kalau backend sudah pakai istilah Indonesia langsung
  DIAJUKAN: "DIAJUKAN",
  DISETUJUI: "DISETUJUI",
  DITOLAK: "DITOLAK",
  SELESAI: "SELESAI",
};

const STATUS_TO_API: Record<"approve" | "reject", string> = {
  approve: "approved",
  reject: "rejected",
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRefund(raw: any): Refund {
  const name = raw.customer_name ?? "Unknown";

  return {
    id: raw.refund_id ?? raw.id,
    invoice: raw.invoice_number ?? "-",

    name,

    email: raw.email ?? "-",

    initials: getInitials(name),

    event: raw.event_title ?? "-",

    reason: raw.reason ?? "-",

    amount: formatRupiah(Number(raw.refund_amount ?? 0)),

    status: STATUS_FROM_API[raw.status] ?? "DIAJUKAN",

    date: raw.requested_at
      ? formatTanggal(raw.requested_at)
      : "-",
  };
}

/* ------------------------------------------------------------------ */
/*  API CALLS                                                          */
/* ------------------------------------------------------------------ */

async function fetchRefunds(params: {
  search: string;
  page: number;
  limit: number;
}): Promise<{ items: Refund[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });

  const res = await fetch(`${API_BASE_URL}/api/refunds?${qs.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Gagal mengambil data refund (status ${res.status})`);
  }

  const json = await res.json();
  // Menangani baik bentuk { data, total, totalPages } maupun array polos
  const rawItems = Array.isArray(json) ? json : json.data ?? [];
  const total = Array.isArray(json) ? rawItems.length : json.total ?? rawItems.length;
  const totalPages = Array.isArray(json)
    ? 1
    : json.totalPages ?? Math.max(1, Math.ceil(total / params.limit));

  return {
    items: rawItems.map(mapRefund),
    total,
    totalPages,
  };
}

async function processRefundApi(
  id: string | number,
  action: "approve" | "reject"
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/refunds/${id}/process`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: STATUS_TO_API[action] }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.msg ?? `Gagal memproses refund (status ${res.status})`);
  }
}

/* ------------------------------------------------------------------ */
/*  SHARED UI                                                          */
/* ------------------------------------------------------------------ */

function TopBar({
  searchValue,
  onSearchChange,
}: {
  searchValue: string;
  onSearchChange: (v: string) => void;
}) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#F0E4DC] bg-white px-8 py-4">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8A99E]" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari invoice atau nama user..."
          className="w-full rounded-lg border border-[#EEE1D8] bg-[#FFF8F4] py-2 pl-9 pr-4 text-sm text-[#3A2E27] placeholder:text-[#B8A99E] outline-none focus:border-[#E8A26B] focus:ring-2 focus:ring-[#F5D9BE]"
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
  );
}

function StatCard({
  label,
  value,
  sub,
  active,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        active ? "border-[#3B6FC9] ring-1 ring-[#3B6FC9]/20" : "border-[#F0E4DC]"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          active ? "text-[#3B6FC9]" : "text-[#B8A99E]"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          active ? "text-[#3B6FC9]" : "text-[#3A2E27]"
        }`}
      >
        {value}
      </p>
      {sub && <div className="mt-1 text-xs text-[#B8A99E]">{sub}</div>}
    </div>
  );
}

const statusStyle: Record<RefundStatus, string> = {
  DIAJUKAN: "bg-[#E4EEFB] text-[#3B6FC9]",
  DITOLAK: "bg-[#FBE4E4] text-[#D0524A]",
  SELESAI: "bg-[#E1F5E7] text-[#2E9E5B]",
  DISETUJUI: "bg-[#FDF1CE] text-[#B8860B]",
};

const AVATAR_PALETTE = [
  "bg-[#F5D9BE] text-[#8C5A2B]",
  "bg-[#D9E4F5] text-[#3B6FC9]",
  "bg-[#E1D9F5] text-[#6B4FA0]",
  "bg-[#D9F5E4] text-[#2E9E5B]",
];

function avatarClass(initials: string): string {
  const idx = initials.charCodeAt(0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx] ?? "bg-[#F0E4DC] text-[#8C7A6F]";
}

/* ------------------------------------------------------------------ */
/*  PAGE CONTENT                                                       */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 10;

function RefundView({ search }: { search: string }) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | number | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRefunds({ search: debouncedSearch, page, limit: PAGE_SIZE });
      setRefunds(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);

      // Stats dihitung dari data yang sudah diambil (halaman ini saja).
      // Kalau backend punya endpoint statistik khusus (mis. /api/refund/stats),
      // ganti blok ini dengan fetch ke endpoint tersebut untuk angka yang akurat
      // di seluruh data, bukan cuma halaman aktif.
      const menunggu = result.items.filter((r) => r.status === "DIAJUKAN").length;
      const totalNominal = result.items
        .filter((r) => r.status === "DISETUJUI" || r.status === "SELESAI")
        .reduce((sum, r) => {
          const numeric = Number(r.amount.replace(/[^0-9]/g, ""));
          return sum + (Number.isFinite(numeric) ? numeric : 0);
        }, 0);
      setStats({
        totalAjuan: result.total,
        menungguPersetujuan: menunggu,
        totalRefundIDR: totalNominal,
        rataRataProsesHari: 1.4, // placeholder — isi dari backend kalau tersedia
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  // Reset ke halaman 1 setiap kali pencarian berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleAction = async (id: string | number, action: "approve" | "reject") => {
    setActioningId(id);
    setError(null);
    try {
      await processRefundApi(id, action);
      await loadRefunds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses refund");
    } finally {
      setActioningId(null);
    }
  };

  const startIdx = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-semibold text-[#3A2E27]">Kelola Refund</h1>
      <p className="mt-1 text-sm text-[#8C7A6F]">
        Tinjau dan proses pengajuan pengembalian dana tiket konser.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-[#F5C6C0] bg-[#FBE4E4] px-4 py-3 text-sm text-[#D0524A]">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Ajuan"
          value={stats ? String(stats.totalAjuan) : "-"}
          sub={
            <span className="flex items-center gap-1 text-[#2E9E5B]">
              <TrendingUp className="h-3.5 w-3.5" />
              +12% dari minggu lalu
            </span>
          }
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={stats ? String(stats.menungguPersetujuan) : "-"}
          sub="Perlu tindakan segera"
          active
        />
        <StatCard
          label="Total Refund (IDR)"
          value={stats ? formatRupiah(stats.totalRefundIDR) : "-"}
          sub="Bulan ini"
        />
        <StatCard
          label="Rata-rata Proses"
          value={stats ? `${stats.rataRataProsesHari} Hari` : "-"}
          sub="Waktu respon"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#F0E4DC] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0E4DC] bg-[#FCEFDF] px-6 py-4">
          <p className="text-sm font-semibold text-[#3A2E27]">
            Daftar Pengajuan Refund
          </p>
          <p className="text-xs text-[#8C7A6F]">
            {total > 0
              ? `Menampilkan ${startIdx}-${endIdx} dari ${total} ajuan`
              : loading
              ? "Memuat..."
              : "Tidak ada ajuan"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-[#FCEFDF] text-xs font-semibold uppercase tracking-wide text-[#8C7A6F]">
                <th className="px-6 py-3">Invoice</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Alasan</th>
                <th className="px-6 py-3">Nominal</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Tgl Ajuan</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-[#B8A99E]">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}

              {!loading && refunds.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-[#B8A99E]">
                    Tidak ada pengajuan refund ditemukan.
                  </td>
                </tr>
              )}

              {!loading &&
                refunds.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[#F5EAE1] hover:bg-[#FFFBF7]"
                  >
                    <td className="px-6 py-4 font-medium text-[#3B6FC9]">
                      {r.invoice}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarClass(
                            r.initials
                          )}`}
                        >
                          {r.initials}
                        </div>
                        <div>
                          <p className="font-medium text-[#3A2E27]">{r.name}</p>
                          <p className="text-xs text-[#B8A99E]">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#3A2E27]">{r.event}</td>
                    <td className="px-6 py-4 text-[#3A2E27]">{r.reason}</td>
                    <td className="px-6 py-4 font-medium text-[#3A2E27]">
                      {r.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#3A2E27]">{r.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`Terima ${r.invoice}`}
                          title="Terima"
                            disabled={
                              r.status !== "DIAJUKAN" ||
                              actioningId === r.id
                            }
                          onClick={() => handleAction(r.id, "approve")}
                          className="rounded-lg p-2 text-[#2E9E5B] hover:bg-[#E1F5E7] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          {actioningId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          aria-label={`Tolak ${r.invoice}`}
                          title="Tolak"
                         disabled={
                            r.status !== "DIAJUKAN" ||
                            actioningId === r.id
                          }
                          onClick={() => handleAction(r.id, "reject")}
                          className="rounded-lg p-2 text-[#D0524A] hover:bg-[#FBE4E4] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Lihat detail ${r.invoice}`}
                          title="Lihat detail"
                          className="rounded-lg p-2 text-[#3B6FC9] hover:bg-[#E4EEFB]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F5EAE1] bg-[#FCEFDF] px-6 py-4 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 text-[#8C7A6F] hover:text-[#3A2E27] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>
          <div className="flex items-center gap-1.5">
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
                      : "h-7 w-7 rounded-lg border border-[#EEE1D8] bg-white text-sm font-medium text-[#3A2E27] hover:bg-[#FFF3EA]"
                  }
                >
                  {p}
                </button>
              ))}
          </div>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 font-medium text-[#3A2E27] hover:text-[#3B6FC9] disabled:opacity-50"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                                */
/*  Catatan: sidebar TIDAK disertakan di file ini karena sudah ada     */
/*  di layout project. Komponen ini hanya berisi topbar + konten       */
/*  halaman, tinggal dipasang sebagai children dari layout tersebut.   */
/* ------------------------------------------------------------------ */

export default function RefundPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-[#FFF8F4]">
      <TopBar searchValue={search} onSearchChange={setSearch} />
      <RefundView search={search} />
    </div>
  );
}