"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Settings2,
  CheckSquare,
  Ban,
  Printer,
  AlertTriangle,
  Save,
  RefreshCw,
  X,
  Palette,
  Ticket,
  CheckCircle2,
  Armchair,
  CalendarDays,
} from "lucide-react";

/* ================= Shared: Top bar ================= */
function TopBar() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="group flex items-center gap-3 flex-1 max-w-2xl rounded-xl bg-[#F4DEB5]/40 border border-transparent px-5 py-4 transition-all duration-200 focus-within:bg-[#FCF8F3] focus-within:border-[#6E5A3F] focus-within:shadow-[0_0_0_3px_rgba(110,90,63,0.08)]">
        <Search
          size={22}
          className="text-[#6B6459] shrink-0 transition-colors duration-200 group-focus-within:text-[#6E5A3F]"
        />
        <input
          type="text"
          placeholder="Cari denah, baris, atau kursi..."
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
  );
}

/* ================= Kategori kursi (menentukan warna) ================= */
type SeatCategory = "standar" | "regular" | "vip" | "vvip";
type SeatKind = SeatCategory | "kosong";

const categoryStyle: Record<
  SeatCategory,
  { fill: string; border: string; text: string; label: string }
> = {
  standar: {
    fill: "#4A9FE0", // biru
    border: "#2E74B0",
    text: "#FFFFFF",
    label: "Standar",
  },
  regular: {
    fill: "#3FB871", // hijau
    border: "#2A8F57",
    text: "#FFFFFF",
    label: "Regular",
  },
  vip: {
    fill: "#F2C230", // kuning
    border: "#C99A18",
    text: "#4A3B0A",
    label: "VIP",
  },
  vvip: {
    fill: "#FFFFFF", // putih
    border: "#C9BFA9",
    text: "#4A4438",
    label: "VVIP",
  },
};

const rusakStyle = {
  fill: "#FFFFFF",
  border: "#E4536B",
  text: "#E4536B",
  label: "Rusak",
};

// Kursi terjual: merah solid, supaya beda jelas dari kursi rusak (putih-dashed)
const terjualStyle = {
  fill: "#E4536B",
  border: "#C23752",
  text: "#FFFFFF",
  label: "Terjual",
};

const kosongStyle = {
  fill: "#EDE6DC",
  border: "#EDE6DC",
  text: "#B0A695",
  label: "Kosong",
};

type Seat = {
  nomor: number | null;
  kind: SeatKind;
  rusak: boolean;
  terjual: boolean;
  customColor?: string;
};
type Row = { label: string; seats: Seat[] };

/* Kunci filter statistik di bagian bawah halaman */
type StatFilter = "total" | "terjual" | "rusak" | "tersedia" | null;

// Warna outline highlight per filter, dipakai saat kartu statistik diklik
const filterHighlightColor: Record<Exclude<StatFilter, null>, string> = {
  total: "#E4536B",
  terjual: "#E4536B",
  rusak: "#E4536B",
  tersedia: "#E4536B",
};

const filterLabel: Record<Exclude<StatFilter, null>, string> = {
  total: "Total Kursi",
  terjual: "Kursi Terjual",
  rusak: "Kursi Rusak",
  tersedia: "Kursi Tersedia",
};

/* ================= Data event ================= */
type EventOption = {
  id: number;
  title: string;
  venue_name: string | null;
  city: string | null;
  event_date: string;
};


/* Ukuran layout (px) — dipakai supaya panggung bisa diposisikan tepat
   di tengah lebar barisan kursi, bukan di tengah kartu.
   Prefiks tiap baris sekarang: [checkbox][gap][label][gap] lalu kursi. */
const ROW_CHECKBOX_WIDTH = 16; // h-4 w-4
const LABEL_WIDTH = 20; // w-5
const ROW_GAP = 12; // gap-3
const PREFIX_WIDTH = ROW_CHECKBOX_WIDTH + ROW_GAP + LABEL_WIDTH + ROW_GAP;
const SEAT_SIZE = 44; // h-11 w-11
const SEAT_GAP = 10; // gap-2.5

/* ================= Helpers untuk warna kustom kursi ================= */
function normalizeHex(hex: string): string {
  const c = hex.replace("#", "");
  return c.length === 3
    ? c
        .split("")
        .map((ch) => ch + ch)
        .join("")
    : c;
}

function darkenColor(hex: string, amount = 30): string {
  const c = normalizeHex(hex);
  const num = parseInt(c, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((num >> 16) & 0xff) - amount);
  const g = clamp(((num >> 8) & 0xff) - amount);
  const b = clamp((num & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function getContrastText(hex: string): string {
  const c = normalizeHex(hex);
  const num = parseInt(c, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#1E1B16" : "#FFFFFF";
}

/** Gaya visual efektif sebuah kursi:
 * kosong > rusak > terjual > warna kustom > warna standar kategori. */
function getSeatVisual(seat: Seat) {
  if (seat.kind === "kosong") return kosongStyle;
  if (seat.rusak) return rusakStyle;
  if (seat.terjual) return terjualStyle;
  if (seat.customColor) {
    return {
      fill: seat.customColor,
      border: darkenColor(seat.customColor),
      text: getContrastText(seat.customColor),
      label: `${categoryStyle[seat.kind].label} (kustom)`,
    };
  }
  return categoryStyle[seat.kind];
}

/** Apakah kursi termasuk dalam filter statistik yang sedang aktif. */
function matchesStatFilter(seat: Seat, filter: StatFilter): boolean {
  if (!filter || seat.kind === "kosong") return true;
  switch (filter) {
    case "total":
      return true;
    case "terjual":
      return seat.terjual && !seat.rusak;
    case "rusak":
      return seat.rusak;
    case "tersedia":
      return !seat.rusak && !seat.terjual;
    default:
      return true;
  }
}

/**
 * Label baris: A, B, C, ... Z, AA, AB, ...
 */
function rowLabelAt(index: number): string {
  let n = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

/**
 * Membuat denah yang SIMETRIS (jumlah kursi kiri = kanan lorong) dan
 * NOMOR KURSI BERURUTAN dari baris pertama sampai baris terakhir tanpa
 * pernah reset — contoh: baris A = 1..10, baris B lanjut 11..20, dst.
 */
function generateRows(jumlahBaris: number, kursiPerBaris: number): Row[] {
  const safeBaris = Math.max(1, Math.floor(jumlahBaris) || 1);
  const safeKursi = Math.max(2, Math.floor(kursiPerBaris) || 2);
  const totalKursi = safeKursi % 2 === 0 ? safeKursi : safeKursi + 1;
  const half = totalKursi / 2;

  let urutan = 0;
  const rows: Row[] = [];

  for (let i = 0; i < safeBaris; i++) {
    const seats: Seat[] = [];

    for (let k = 0; k < half; k++) {
      urutan += 1;
      seats.push({ nomor: urutan, kind: "standar", rusak: false, terjual: false });
    }
    seats.push({ nomor: null, kind: "kosong", rusak: false, terjual: false });
    seats.push({ nomor: null, kind: "kosong", rusak: false, terjual: false });
    for (let k = 0; k < half; k++) {
      urutan += 1;
      seats.push({ nomor: urutan, kind: "standar", rusak: false, terjual: false });
    }

    rows.push({ label: rowLabelAt(i), seats });
  }

  return rows;
}

/* ================= Halaman utama ================= */
export default function EditorDenahKursiPage() {
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const selectedEvent = useMemo(
    () => eventOptions.find((e) => e.id === selectedEventId) ?? null,
    [eventOptions, selectedEventId]
  );

  const [nama, setNama] = useState("");
  const [baris, setBaris] = useState(1);
  const [kursiPerBaris, setKursiPerBaris] = useState(2);
  const [hargaBase, setHargaBase] = useState("");

  const [rows, setRows] = useState<Row[]>(() =>
    generateRows(1, 2)
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(["A-5"])
  );

  // Filter statistik aktif (diklik lewat kartu Total/Terjual/Rusak/Tersedia)
  const [statFilter, setStatFilter] = useState<StatFilter>(null);

  // Status penyimpanan denah kursi ke backend
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Ganti event: muat ulang konfigurasi baris/kursi/harga & denah sesuai
  // event yang dipilih, lalu bersihkan seleksi & filter yang sedang aktif.
  const handleEventChange = (eventId: string) => {
    const id = Number(eventId);

    const ev = eventOptions.find((e) => e.id === id);

    if (!ev) return;

    setSelectedEventId(id);
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Lebar area kursi (tanpa kolom label baris) dalam px — dipakai untuk
  // menyelaraskan panggung tepat di tengah barisan kursi.
  const seatsPerRow = rows[0]?.seats.length ?? 0;
  const seatAreaWidth =
    seatsPerRow > 0
      ? seatsPerRow * SEAT_SIZE + (seatsPerRow - 1) * SEAT_GAP
      : 0;
  const chartWidth = PREFIX_WIDTH + seatAreaWidth;

  // Apakah pengaturan saat ini berbeda dari denah yang sedang tampil
  const isDirty = useMemo(() => {
    const evenKursi =
      kursiPerBaris % 2 === 0 ? kursiPerBaris : kursiPerBaris + 1;
    const currentKursi = rows[0] ? rows[0].seats.length : 0;
    return rows.length !== baris || currentKursi !== evenKursi;
  }, [rows, baris, kursiPerBaris]);

  const stats = useMemo(() => {
    const flat = rows.flatMap((r) => r.seats).filter((s) => s.nomor !== null);
    const total = flat.length;
    const rusak = flat.filter((s) => s.rusak).length;
    // Kursi rusak tidak dihitung terjual/tersedia meski sempat ditandai terjual
    const terjual = flat.filter((s) => s.terjual && !s.rusak).length;
    const tersedia = total - rusak - terjual;
    return { total, rusak, terjual, tersedia };
  }, [rows]);

  // Semua kursi yang sedang dipilih (bisa lebih dari satu, mis. lewat
  // ceklis baris), dipakai untuk panel edit kategori/warna/rusak.
  const selectedSeats = useMemo(() => {
    const found: { rowLabel: string; seat: Seat }[] = [];
    for (const row of rows) {
      for (const seat of row.seats) {
        const id = seat.nomor !== null ? `${row.label}-${seat.nomor}` : null;
        if (id !== null && selectedIds.has(id)) {
          found.push({ rowLabel: row.label, seat });
        }
      }
    }
    return found;
  }, [rows, selectedIds]);
  const selectedSeatInfo = selectedSeats[0] ?? null;

  const updateSelectedSeat = (patch: Partial<Seat>) => {
    if (selectedIds.size === 0) return;
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        seats: row.seats.map((s) => {
          const id = s.nomor !== null ? `${row.label}-${s.nomor}` : null;
          return id !== null && selectedIds.has(id) ? { ...s, ...patch } : s;
        }),
      }))
    );
    // Ada editan baru sejak simpan terakhir
    setSaveSuccess(false);
  };

  const toggleSeat = (rowLabel: string, seat: Seat) => {
    if (seat.nomor === null) return;
    const id = `${rowLabel}-${seat.nomor}`;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  useEffect(() => {
  if (!selectedEventId) {
    setTicketTypes([]);
    return;
  }

  const fetchTicketTypes = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tiket-types/event/${selectedEventId}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil tipe tiket");
      }

      const data = await response.json();

      setTicketTypes(data);
      console.log("TIKET EVENT:", selectedEventId, data);
    } catch (error) {
      console.error("Gagal mengambil tipe tiket:", error);
      setTicketTypes([]);
    }
  };

  fetchTicketTypes();
}, [selectedEventId]);

  // Ceklis di samping label baris (A, B, C, ...) — pilih/batalkan semua
  // kursi di baris itu sekaligus.
  const rowSeatIds = (row: Row) =>
    row.seats.filter((s) => s.nomor !== null).map((s) => `${row.label}-${s.nomor}`);

  const isRowFullySelected = (row: Row) => {
    const ids = rowSeatIds(row);
    return ids.length > 0 && ids.every((id) => selectedIds.has(id));
  };

  const isRowPartiallySelected = (row: Row) => {
    const ids = rowSeatIds(row);
    const selectedCount = ids.filter((id) => selectedIds.has(id)).length;
    return selectedCount > 0 && selectedCount < ids.length;
  };

  const toggleRow = (row: Row) => {
    const ids = rowSeatIds(row);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      ids.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const selectAllSeats = () => {
    const allIds = rows.flatMap(rowSeatIds);
    setSelectedIds((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds)
    );
  };

  // Kursi/baris selalu dijaga genap supaya sisi kiri & kanan lorong tetap simetris
  const handleKursiPerBarisChange = (value: number) => {
    if (Number.isNaN(value)) {
      setKursiPerBaris(2);
      return;
    }
    setKursiPerBaris(Math.max(2, value));
  };

  const handleTerapkan = () => {
    setRows(generateRows(baris, kursiPerBaris));
    setSelectedIds(new Set());
    setStatFilter(null);
    setSaveSuccess(false);
  };

  // Simpan denah kursi (semua baris & kursi beserta kategori, warna,
  // status rusak/terjual) ke backend.
const handleSimpanDenah = async () => {
  if (!selectedEventId) {
    setSaveError("Pilih event terlebih dahulu.");
    return;
  }

  setSaving(true);
  setSaveError(null);
  setSaveSuccess(false);

  try {
    const response = await fetch(
      `http://localhost:3001/api/events/${selectedEventId}/seatmap`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hargaBase,
          rows,
        }),
      }
    );

    // Baca response dari backend
    const responseText = await response.text();

    console.log("========== SAVE SEATMAP ==========");
    console.log("Event ID:", selectedEventId);
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Response:", responseText);
    console.log("==================================");

    if (!response.ok) {
      throw new Error(
        `Server error ${response.status}: ${responseText}`
      );
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  } catch (error) {
    console.error("SAVE SEATMAP ERROR:", error);

    setSaveError(
      error instanceof Error
        ? error.message
        : "Gagal menyimpan denah kursi."
    );
  } finally {
    setSaving(false);
  }
};

  // Klik kartu statistik: toggle highlight lokasi kursi di denah
  const toggleStatFilter = (key: Exclude<StatFilter, null>) => {
    setStatFilter((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/events");

      if (!response.ok) {
        throw new Error("Gagal mengambil data event");
      }

      const data = await response.json();

      setEventOptions(data);

      // Dropdown native browser otomatis menampilkan opsi pertama secara
      // visual walau belum ada onChange yang terpicu. Supaya state
      // `selectedEventId` tidak diam-diam kosong (dan tombol Simpan gagal
      // padahal dropdown kelihatan sudah terisi), pilih event pertama
      // begitu data selesai dimuat.
      if (Array.isArray(data) && data.length > 0) {
        setSelectedEventId((prev) => prev ?? data[0].id);
      }
    } catch (error) {
      console.error("GET EVENTS ERROR:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  fetchEvents();
}, []);

  return (
    <div className="min-h-screen bg-[#FBF3EE] p-8">
      <TopBar />

      {/* Breadcrumb */}
      <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <Link
          href="/page/event"
          className="text-[#6B6459] hover:text-[#1E5A88] transition-colors"
        >
          Event
        </Link>
        <ChevronRight size={14} className="text-[#B0A695]" />
        <span className="text-[#1E5A88]">Editor Denah Kursi</span>
      </div>

      {/* Header */}
      <div className="mt-3">
<h1 className="text-xl font-bold text-[#1E1B16] tracking-tight">
  {selectedEvent?.title ?? "Memuat event..."}
</h1>
<p className="mt-1 text-sm text-[#6B6459]">
  Kelola denah kursi event ini
</p>
      </div>

      {/* Konten utama: peta kursi + panel pengaturan */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* ---------------- Peta kursi ---------------- */}
        <div className="relative rounded-2xl border border-[#E8DDD2] bg-white p-6 shadow-sm">
          {/* Pemilih Event — pilih event yang ada lalu atur kursinya */}
          <div className="mb-5 rounded-xl border border-[#EADFC8] bg-[#FDF4E3] p-4">
            <label
              htmlFor="event-select"
              className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#8A6D3B]"
            >
              <CalendarDays size={13} />
              Pilih Event
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
<select
  id="event-select"
  value={selectedEventId ?? ""}
  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#EADFC8] bg-white px-3.5 py-2.5 pr-9 text-sm font-medium text-[#1E1B16] outline-none transition-colors focus:ring-2 focus:ring-[#1E5A88]/30"
                >
{loadingEvents ? (
  <option value="">Memuat event...</option>
) : (
  <>
    <option value="" disabled>
      Pilih event...
    </option>
    {eventOptions.map((ev) => (
      <option key={ev.id} value={ev.id}>
        {ev.title} — {ev.venue_name ?? "Venue belum tersedia"}
      </option>
    ))}
  </>
)}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8171]"
                />
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs text-[#6B6459] sm:pl-1">
{selectedEvent && (
  <>
    <span>{selectedEvent.venue_name ?? "Venue belum tersedia"}</span>
    <span className="text-[#D8CBB4]">•</span>
    <span>
      {new Date(selectedEvent.event_date).toLocaleDateString("id-ID")}
    </span>
  </>
)}
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-[#8A8171]">
              Ganti event untuk memuat denah kursinya masing-masing, lalu atur
              baris, kursi, dan harga lewat panel Pengaturan di sebelah kanan.
            </p>
          </div>

          {/* Badge filter statistik aktif */}
          {statFilter && (
            <div
              className="mb-4 flex items-center justify-between rounded-lg border px-4 py-2.5"
              style={{
                borderColor: filterHighlightColor[statFilter],
                background: `${filterHighlightColor[statFilter]}14`,
              }}
            >
              <span
                className="flex items-center gap-2 text-xs font-semibold"
                style={{ color: filterHighlightColor[statFilter] }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: filterHighlightColor[statFilter] }}
                />
                Menampilkan lokasi: {filterLabel[statFilter]}
              </span>
              <button
                type="button"
                onClick={() => setStatFilter(null)}
                className="text-[#8A8171] hover:text-[#1E1B16]"
                aria-label="Tutup filter"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Panggung + grid kursi disatukan dalam satu blok, supaya
              posisi panggung selalu tepat di tengah lebar barisan kursi. */}
          <div className="overflow-x-auto pb-2">
            <div className="mx-auto" style={{ width: chartWidth || undefined }}>
              {/* Panggung — lebarnya = lebar area kursi, diposisikan mulai
                  setelah kolom label baris, lalu dipusatkan di tengahnya. */}
              <div
                className="flex justify-center"
                style={{
                  marginLeft: PREFIX_WIDTH,
                  width: seatAreaWidth || undefined,
                }}
              >
                <div className="flex w-full max-w-md items-center justify-center rounded-2xl bg-[#1D1A16] px-8 py-7">
                  <span className="text-xl font-bold tracking-wide text-white sm:text-2xl">
                    PANGGUNG UTAMA (STAGE)
                  </span>
                </div>
              </div>

              {/* Grid baris kursi */}
              <div className="mt-8 flex flex-col gap-4">
                {rows.map((row) => {
                  const rowChecked = isRowFullySelected(row);
                  const rowIndeterminate = isRowPartiallySelected(row);
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rowChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = rowIndeterminate;
                        }}
                        onChange={() => toggleRow(row)}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-[#E4536B]"
                        aria-label={`Pilih semua kursi baris ${row.label}`}
                        title={`Pilih semua kursi baris ${row.label}`}
                      />
                      <span className="w-5 shrink-0 text-sm font-semibold text-[#8A8171]">
                        {row.label}
                      </span>
                      <div className="flex gap-2.5">
                        {row.seats.map((seat, i) => {
                          const style = getSeatVisual(seat);
                          const id =
                            seat.nomor !== null
                              ? `${row.label}-${seat.nomor}`
                              : null;
                          const isSelected = id !== null && selectedIds.has(id);

                          if (seat.kind === "kosong") {
                            return (
                              <div
                                key={i}
                                className="h-11 w-11 shrink-0 rounded-lg"
                                style={{ background: style.fill }}
                              />
                            );
                          }

                          const matchesFilter = matchesStatFilter(seat, statFilter);
                          const dimmed = statFilter !== null && !matchesFilter;
                          const filterOutline =
                            statFilter !== null && matchesFilter
                              ? `0 0 0 3px ${filterHighlightColor[statFilter]}`
                              : undefined;

                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => toggleSeat(row.label, seat)}
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:scale-[1.08] ${
                                seat.rusak ? "border-dashed" : ""
                              } ${
                                isSelected
                                  ? "ring-2 ring-[#E4536B] ring-offset-2 ring-offset-white"
                                  : ""
                              } ${dimmed ? "opacity-25 grayscale" : ""}`}
                              style={{
                                background: style.fill,
                                borderColor: style.border,
                                color: style.text,
                                boxShadow: filterOutline,
                              }}
                              title={`Kursi ${row.label}${seat.nomor} — ${style.label}`}
                            >
                              {seat.rusak ? <Ban size={15} /> : seat.nomor}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Panel pengaturan ---------------- */}
        <aside className="h-fit rounded-2xl border border-[#F3D9AE] bg-[#FDF4E3] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E1B16]">Pengaturan</h2>
            <Settings2 size={18} className="text-[#8A6D3B]" />
          </div>

          <div className="mb-2 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B6459]">
                Baris
              </label>
              <input
                type="number"
                min={1}
                value={baris}
                onChange={(e) => setBaris(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg border border-[#EADFC8] bg-white px-3 py-2.5 text-sm text-[#4A4438] focus:outline-none focus:ring-2 focus:ring-[#1E5A88]/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B6459]">
                Kursi/Baris
              </label>
              <input
                type="number"
                min={2}
                step={2}
                value={kursiPerBaris}
                onChange={(e) =>
                  handleKursiPerBarisChange(Number(e.target.value))
                }
                className="w-full rounded-lg border border-[#EADFC8] bg-white px-3 py-2.5 text-sm text-[#4A4438] focus:outline-none focus:ring-2 focus:ring-[#1E5A88]/30"
              />
            </div>
          </div>
          <p className="mb-5 text-[11px] leading-snug text-[#8A8171]">
            Kursi/Baris otomatis dibulatkan ke angka genap agar sisi kiri dan
            kanan lorong selalu simetris.
          </p>

          <button
            type="button"
            onClick={handleTerapkan}
            className={`mb-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
              isDirty
                ? "bg-[#1E5A88] text-white hover:bg-[#164873]"
                : "bg-white text-[#6B6459] hover:bg-[#F7EFE4]"
            }`}
          >
            <RefreshCw size={16} />
            Terapkan &amp; Buat Ulang Denah
          </button>

          {/* Tombol simpan denah kursi ke backend */}
          <button
            type="button"
            onClick={handleSimpanDenah}
            disabled={saving}
            className={`mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
              saveSuccess
                ? "bg-[#2A8F57] text-white"
                : "bg-[#E4536B] text-white hover:bg-[#C23752]"
            }`}
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving
              ? "Menyimpan..."
              : saveSuccess
              ? "Denah Tersimpan"
              : "Simpan Denah Kursi"}
          </button>
          {saveError && (
            <p className="mb-3 text-[11px] leading-snug text-[#E4536B]">
              {saveError}
            </p>
          )}
          <p className="mb-5 text-[11px] leading-snug text-[#8A8171]">
            Menyimpan seluruh denah — baris, nomor kursi, kategori, warna,
            serta status rusak &amp; terjual — ke server.
          </p>

          {/* Edit kursi terpilih: ubah kategori (warna) & status rusak/terjual */}
          {selectedSeatInfo && (
            <div className="mb-5 rounded-lg border border-[#EADFC8] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[#1E1B16]">
                  {selectedSeats.length > 1
                    ? `Edit ${selectedSeats.length} Kursi Terpilih`
                    : `Edit Kursi ${selectedIds.values().next().value ?? ""}`}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-[#B0A695] hover:text-[#6B6459]"
                  aria-label="Tutup panel edit"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#6B6459]">
                <Palette size={13} />
                Kategori &amp; Warna
              </p>
              <div className="mb-4 grid grid-cols-2 gap-2">
                {(
                  ["standar", "regular", "vip", "vvip"] as SeatCategory[]
                ).map((catKey) => {
                  const s = categoryStyle[catKey];
                  const active =
                    selectedSeatInfo.seat.kind === catKey &&
                    !selectedSeatInfo.seat.customColor;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() =>
                        updateSelectedSeat({
                          kind: catKey,
                          customColor: undefined,
                        })
                      }
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-[#1E5A88] bg-[#EAF3FA] text-[#1E5A88]"
                          : "border-[#EADFC8] text-[#6B6459] hover:bg-[#FDF4E3]"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-[3px] border"
                        style={{ background: s.fill, borderColor: s.border }}
                      />
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <p className="mb-2 text-xs font-medium text-[#6B6459]">
                Warna kustom lainnya
              </p>
              <div className="mb-4 flex items-center gap-2.5">
                <input
                  type="color"
                  value={
                    selectedSeatInfo.seat.customColor ??
                    categoryStyle[
                      selectedSeatInfo.seat.kind === "kosong"
                        ? "standar"
                        : selectedSeatInfo.seat.kind
                    ].fill
                  }
                  onChange={(e) =>
                    updateSelectedSeat({ customColor: e.target.value })
                  }
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-[#EADFC8] bg-white p-1"
                  aria-label="Pilih warna kustom kursi"
                />
                <span className="flex-1 text-[11px] leading-snug text-[#8A8171]">
                  Di luar 4 kategori standar, kamu bisa timpa dengan warna
                  bebas.
                </span>
                {selectedSeatInfo.seat.customColor && (
                  <button
                    type="button"
                    onClick={() => updateSelectedSeat({ customColor: undefined })}
                    className="shrink-0 text-xs font-medium text-[#1E5A88] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between gap-2 rounded-lg border border-[#EADFC8] bg-[#FDF4E3] px-3 py-2.5">
                  <span className="flex items-center gap-2 text-xs font-medium text-[#6B6459]">
                    <Ban size={14} className="text-[#E4536B]" />
                    Tandai kursi ini rusak
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedSeats.every((s) => s.seat.rusak)}
                    onChange={(e) => updateSelectedSeat({ rusak: e.target.checked })}
                    className="h-4 w-4 accent-[#E4536B]"
                  />
                </label>

                <label className="flex items-center justify-between gap-2 rounded-lg border border-[#EADFC8] bg-[#FDF4E3] px-3 py-2.5">
                  <span className="flex items-center gap-2 text-xs font-medium text-[#6B6459]">
                    <Ticket size={14} className="text-[#C23752]" />
                    Tandai kursi ini terjual
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedSeats.every((s) => s.seat.terjual)}
                    onChange={(e) =>
                      updateSelectedSeat({ terjual: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#C23752]"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 border-t border-[#EADFC8] pt-5">
            <button
              type="button"
              onClick={selectAllSeats}
              className="flex flex-col items-center gap-1.5 rounded-lg py-2 text-[#6B6459] transition-colors hover:bg-white"
            >
              <CheckSquare size={18} />
              <span className="text-[11px] font-medium">
                {selectedIds.size === rows.flatMap(rowSeatIds).length &&
                selectedIds.size > 0
                  ? "Batal Semua"
                  : "Pilih Semua"}
              </span>
            </button>
            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={() =>
                updateSelectedSeat({
                  rusak: !selectedSeats.every((s) => s.seat.rusak),
                })
              }
              className="flex flex-col items-center gap-1.5 rounded-lg py-2 text-[#6B6459] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Ban size={18} />
              <span className="text-[11px] font-medium">
                {selectedSeats.length > 0 &&
                selectedSeats.every((s) => s.seat.rusak)
                  ? "Pulihkan"
                  : "Blokir"}
              </span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1.5 rounded-lg py-2 text-[#6B6459] transition-colors hover:bg-white"
            >
              <Printer size={18} />
              <span className="text-[11px] font-medium">Manifest</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ---------------- Kartu statistik (klik untuk highlight lokasi di denah) ---------------- */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => toggleStatFilter("total")}
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition-all ${
            statFilter === "total"
              ? "border-[#E4536B] ring-2 ring-[#E4536B]/30"
              : "border-[#E8DDD2] hover:border-[#C9BFA9]"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8171]">
              Total Kursi
            </p>
            <Armchair size={16} className="text-[#8A8171]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#1E1B16]">{stats.total}</p>
        </button>

        <button
          type="button"
          onClick={() => toggleStatFilter("terjual")}
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition-all ${
            statFilter === "terjual"
              ? "border-[#E4536B] ring-2 ring-[#E4536B]/30"
              : "border-[#E8DDD2] hover:border-[#E4536B]/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8171]">
              Terjual
            </p>
            <Ticket size={16} className="text-[#C23752]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#C23752]">
            {stats.terjual}
          </p>
        </button>

        <button
          type="button"
          onClick={() => toggleStatFilter("rusak")}
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition-all ${
            statFilter === "rusak"
              ? "border-[#E4536B] ring-2 ring-[#E4536B]/30"
              : "border-[#E8DDD2] hover:border-[#E4536B]/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8171]">
              Rusak
            </p>
            <AlertTriangle size={16} className="text-[#E4536B]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#E4536B]">{stats.rusak}</p>
        </button>

        <button
          type="button"
          onClick={() => toggleStatFilter("tersedia")}
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition-all ${
            statFilter === "tersedia"
              ? "border-[#E4536B] ring-2 ring-[#E4536B]/30"
              : "border-[#E8DDD2] hover:border-[#3FB871]/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8171]">
              Tersedia
            </p>
            <CheckCircle2 size={16} className="text-[#2A8F57]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#2A8F57]">
            {stats.tersedia}
          </p>
        </button>
      </div>
    </div>
  );
}