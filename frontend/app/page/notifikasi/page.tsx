"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Mail,
  MessageSquare,
  Bell,
  Send,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Sun, Moon } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NotifJenis = "in-app" | "email" | "sms";

type NotifStatus = "Terkirim" | "Selesai" | "Terjadwal" | "Gagal";

interface RiwayatItem {
  id: string;
  tanggal: string;
  waktu: string;
  judul: string;
  target: string;
  jenis: NotifJenis;
  status: NotifStatus;
}

// ---------------------------------------------------------------------------
// Mock data (swap for real API data)
// ---------------------------------------------------------------------------

const riwayatData: RiwayatItem[] = [
  {
    id: "1",
    tanggal: "12 Okt 2023",
    waktu: "14:00",
    judul: "Early Bird Hindia Live in Concert Berakhir Besok",
    target: "Semua User",
    jenis: "in-app",
    status: "Terkirim",
  },
  {
    id: "2",
    tanggal: "10 Okt 2023",
    waktu: "09:15",
    judul: "Refund Disetujui - INV-2026-002",
    target: "User Spesifik (Cheril)",
    jenis: "email",
    status: "Selesai",
  },
  {
    id: "3",
    tanggal: "08 Okt 2023",
    waktu: "18:30",
    judul: "Tiket Dewa 19 feat. All Stars Hampir Habis!",
    target: "Wishlist Aktif",
    jenis: "in-app",
    status: "Terjadwal",
  },
  {
    id: "4",
    tanggal: "05 Okt 2023",
    waktu: "11:00",
    judul: "Promo Akhir Pekan: Diskon 10% Tiara Andini Live",
    target: "Semua User",
    jenis: "sms",
    status: "Gagal",
  },
];

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

const jenisConfig: Record<
  NotifJenis,
  { label: string; icon: typeof Bell; classes: string }
> = {
  "in-app": {
    label: "In-App",
    icon: Bell,
    classes: "bg-sky-50 text-sky-700",
  },
  email: {
    label: "Email",
    icon: Mail,
    classes: "bg-sky-50 text-sky-700",
  },
  sms: {
    label: "SMS",
    icon: MessageSquare,
    classes: "bg-amber-50 text-amber-700",
  },
};

const statusConfig: Record<NotifStatus, string> = {
  Terkirim: "bg-amber-400 text-white",
  Selesai: "bg-emerald-100 text-emerald-700",
  Terjadwal: "bg-sky-100 text-sky-700",
  Gagal: "bg-rose-100 text-rose-600",
};

function JenisBadge({ jenis }: { jenis: NotifJenis }) {
  const { label, icon: Icon, classes } = jenisConfig[jenis];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: NotifStatus }) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusConfig[status]}`}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NotifikasiPage() {
  const router = useRouter();
  const [target, setTarget] = useState("Semua Pengguna (Broadcast Global)");
  const [jenisNotifikasi, setJenisNotifikasi] = useState<NotifJenis>("in-app");
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [sending, setSending] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleKirim = () => {
    if (!judul.trim() || !pesan.trim()) return;
    setSending(true);
    // Replace with real API call, e.g. POST /api/notifikasi
    setTimeout(() => {
      setSending(false);
      setJudul("");
      setPesan("");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#FBF3EE]">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-8 py-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A79E90]" />
          <input
            type="text"
            placeholder="Cari data atau laporan..."
            className="w-full rounded-lg border border-[#EDE6DC] bg-[#FBF9F5] py-2 pl-9 pr-4 text-sm text-[#4A4438] placeholder:text-[#A79E90] focus:outline-none focus:ring-2 focus:ring-[#1E5A88]/30"
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
      </header>

      <main className="px-8 py-8">
        {/* Page heading */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E5A88]">
              Notifikasi &amp; Broadcast
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#8A8171]">
              Kirimkan pembaruan, promosi, atau peringatan sistem langsung
              kepada audiens Anda melalui berbagai saluran notifikasi.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#F0D9B5] bg-white px-5 py-3 shadow-sm">
            <div>
              <p className="text-xs text-[#8A8171]">Sisa Kuota Email</p>
              <p className="text-lg font-bold text-[#1E5A88]">45,201</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FCEFD9] text-[#D6942C]">
              <Mail className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          {/* ------------------------------------------------------------ */}
          {/* Left: Form Kirim Broadcast                                   */}
          {/* ------------------------------------------------------------ */}
          <section className="h-fit rounded-2xl border border-[#F3D9AE] bg-[#FDF4E3] p-6">
            <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#1E5A88]">
              <Send className="h-4 w-4" />
              Form Kirim Broadcast
            </h2>

            {/* Target audiens */}
            <label className="mb-1.5 block text-xs font-medium text-[#6B6459]">
              Pilih Target Audiens
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mb-5 w-full rounded-lg border border-[#EADFC8] bg-white px-3 py-2.5 text-sm text-[#4A4438] focus:outline-none focus:ring-2 focus:ring-[#1E5A88]/30"
            >
              <option>Semua Pengguna (Broadcast Global)</option>
              <option>User Spesifik</option>
              <option>Wishlist Aktif</option>
              <option>Pernah Membeli Tiket</option>
            </select>

            {/* Jenis notifikasi */}
            <label className="mb-1.5 block text-xs font-medium text-[#6B6459]">
              Jenis Notifikasi
            </label>
            <div className="mb-5 grid grid-cols-3 gap-2">
              {(
                [
                  { key: "in-app", label: "In-App", icon: Bell },
                  { key: "email", label: "Email", icon: Mail },
                  { key: "sms", label: "SMS/WA", icon: MessageSquare },
                ] as { key: NotifJenis; label: string; icon: typeof Bell }[]
              ).map(({ key, label, icon: Icon }) => {
                const active = jenisNotifikasi === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setJenisNotifikasi(key)}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors ${
                      active
                        ? "border-[#1E5A88] bg-[#1E5A88] text-white"
                        : "border-[#EADFC8] bg-white text-[#6B6459] hover:border-[#1E5A88]/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Judul */}
            <label className="mb-1.5 block text-xs font-medium text-[#6B6459]">
              Judul Notifikasi
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul yang menarik..."
              className="mb-5 w-full rounded-lg border border-[#EADFC8] bg-white px-3 py-2.5 text-sm text-[#4A4438] placeholder:text-[#B3AA98] focus:outline-none focus:ring-2 focus:ring-[#1E5A88]/30"
            />

            {/* Isi pesan */}
            <label className="mb-1.5 block text-xs font-medium text-[#6B6459]">
              Isi Pesan
            </label>
            <textarea
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Tuliskan detail pesan Anda di sini..."
              rows={4}
              className="mb-6 w-full resize-none rounded-lg border border-[#EADFC8] bg-white px-3 py-2.5 text-sm text-[#4A4438] placeholder:text-[#B3AA98] focus:outline-none focus:ring-2 focus:ring-[#1E5A88]/30"
            />

            <button
              type="button"
              onClick={handleKirim}
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E5A88] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#184870] disabled:opacity-60"
            >
              {sending ? "Mengirim..." : "Kirim Sekarang"}
              <Send className="h-4 w-4" />
            </button>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* Right: Stats + Riwayat                                       */}
          {/* ------------------------------------------------------------ */}
          <section className="flex flex-col gap-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border-t-4 border-[#1E5A88] bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-[#8A8171]">
                  Terkirim (30 Hari)
                </p>
                <p className="mt-2 text-2xl font-bold text-[#1E5A88]">
                  128.4k
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  12% vs bln lalu
                </p>
              </div>

              <div className="rounded-xl border-t-4 border-[#EADFC8] bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-[#8A8171]">
                  Tingkat Buka (Avg)
                </p>
                <p className="mt-2 text-2xl font-bold text-[#4A4438]">
                  64.2%
                </p>
                <p className="mt-1 text-xs text-[#8A8171]">
                  Engagement Tinggi
                </p>
              </div>

              <div className="rounded-xl border-t-4 border-rose-300 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-[#8A8171]">
                  Gagal Terkirim
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-500">0.8%</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Cek log kegagalan
                </p>
              </div>
            </div>

            {/* Riwayat table */}
            <div className="overflow-hidden rounded-xl border border-[#EDE6DC] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#EDE6DC] px-5 py-4">
                <h3 className="text-sm font-semibold text-[#4A4438]">
                  Riwayat Notifikasi
                </h3>
                <button className="flex items-center gap-1.5 text-xs font-medium text-[#1E5A88] hover:underline">
                  <Download className="h-3.5 w-3.5" />
                  Ekspor Laporan
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#FBF0DD] text-xs font-semibold uppercase tracking-wide text-[#8A6D3B]">
                      <th className="px-5 py-3">Tanggal &amp; Waktu</th>
                      <th className="px-5 py-3">Judul</th>
                      <th className="px-5 py-3">Target</th>
                      <th className="px-5 py-3">Jenis</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#F3EFE7] last:border-0 hover:bg-[#FBF9F5]"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-[#6B6459]">
                          {item.tanggal}
                          <br />
                          {item.waktu}
                        </td>
                        <td className="max-w-xs px-5 py-4 font-medium text-[#4A4438]">
                          {item.judul}
                        </td>
                        <td className="px-5 py-4 text-[#6B6459]">
                          {item.target}
                        </td>
                        <td className="px-5 py-4">
                          <JenisBadge jenis={item.jenis} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-[#EDE6DC] bg-[#FBF0DD] px-5 py-3">
                <p className="text-xs text-[#8A6D3B]">
                  Menampilkan 1-4 dari 45 riwayat
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#EADFC8] bg-white text-[#8A6D3B] hover:bg-[#FBF9F5] disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#EADFC8] bg-white text-[#8A6D3B] hover:bg-[#FBF9F5]">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}