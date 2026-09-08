"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Search,
  MapPin,
  Pencil,
  Eye,
  Trash2,
  ChevronDown,
  Info,
  ImagePlus,
  Users,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Circle,
  X,
  UploadCloud,
  Ticket,
  Percent,
  ArrowLeft,
} from "lucide-react";

function TopBar() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  return (
    <div
      className="animate-enter flex items-center justify-between gap-6"
      style={{ animationDelay: "0ms" }}
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
  );
}

type StatusEvent = "Published" | "Draft" | "Closed";



type EventItem = {
  id: string;
  posterLabel: string;
  posterColor: string;
  genreId: number;
  judul: string;
  genre: string;
  genreColor: string;
  lokasi: string;
  venue: string;
  tanggal: string;
  status: StatusEvent;
  terjual: number;
  kuota: number;
  deskripsi: string;
  artis: string[];
  waktu: string;
  periodeMulai: string;
  periodeSelesai: string;
  syaratKetentuan: string;
  refundOtomatis: boolean;
  hargaTermurah: number;
  hargaTermahal: number;
  venueId: number | null;
  adminId: number | null;
  poster: string;
  eventDateRaw: string;
};

type Venue = {
  id: number;
  venue_name: string;
  city: string;
};

type Genre = {
  id: number;
  genre_name: string;
  color_bg: string;
  color_text: string;
  color_swatch: string;
};

const JABODETABEK_AREAS = [
  "Jakarta Pusat",
  "Jakarta Utara",
  "Jakarta Barat",
  "Jakarta Selatan",
  "Jakarta Timur",
  "Bogor",
  "Depok",
  "Tangerang",
  "Tangerang Selatan",
  "Bekasi",
];

type ArtistOption = {
  id: number;
  name: string;
  genre: string;
};

const ARTIST_AVATAR_PALETTE = [
  "#1E5A88",
  "#6E5A3F",
  "#2E9E5B",
  "#C23B3B",
  "#5B9BD5",
  "#8E6BAE",
];

const ARTIST_OPTIONS: ArtistOption[] = [
  { id: 10, name: "Nadin Amizah", genre: "Indie" },
  { id: 11, name: "Hindia", genre: "Indie" },
  { id: 12, name: "Sal Priadi", genre: "Pop" },
  { id: 13, name: "Tulus", genre: "Pop" },
  { id: 14, name: "Mahalini", genre: "Pop" },
  { id: 15, name: "Rizky Febian", genre: "Pop" },
  { id: 16, name: "Tiara Andini", genre: "Pop" },
  { id: 17, name: "Dewa 19", genre: "Rock" },
  { id: 18, name: "Sheila On 7", genre: "Rock" },
];

function getArtistAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ARTIST_AVATAR_PALETTE[Math.abs(hash) % ARTIST_AVATAR_PALETTE.length];
}

function getArtistInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1][0] : "";
  return (first + second).toUpperCase();
}

function getGenreBadgeStyle(genre: string) {
  const map: Record<string, string> = {
    Rock: "text-[#6E5A3F] bg-[#F4DEB5]",
    Pop: "text-[#6B6459] bg-[#E8DDD2]",
    Indie: "text-[#1E5A88] bg-[#1E5A88]/10",
    Jazz: "text-[#2E9E5B] bg-[#2E9E5B]/10",
    EDM: "text-[#C23B3B] bg-[#C23B3B]/10",
  };
  return map[genre] ?? "text-[#6B6459] bg-[#6B6459]/10";
}

const statusStyles: Record<StatusEvent, string> = {
  Published: "text-[#2E9E5B] bg-[#2E9E5B]/10",
  Draft: "text-[#B0A695] bg-[#6B6459]/10",
  Closed: "text-[#C23B3B] bg-[#C23B3B]/10",
};

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function normalizeArtists(item: any): string[] {
  const raw =
    item?.artists ??
    item?.artist_list ??
    item?.artist_names ??
    item?.artist_name ??
    null;

  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((a) => {
        if (typeof a === "string") {
          return a.trim();
        }

        if (a && typeof a === "object") {
          return (
            a.name ??
            a.artist_name ??
            a.nama ??
            ""
          ).toString().trim();
        }

        return "";
      })
      .filter((name) => name.length > 0);
  }

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }

  return [];
}


function DetailEvent({
  event,
  onBack,
  onEdit,
}: {
  event: EventItem;
  onBack: () => void;
  onEdit: () => void;
}) {
  const percent = Math.round((event.terjual / event.kuota) * 100);
  const barColor =
    percent >= 100 ? "bg-[#C23B3B]" : percent >= 60 ? "bg-[#1E5A88]" : "bg-[#5B9BD5]";

  return (
    <>
      <div
        className="animate-enter mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
        style={{ animationDelay: "80ms" }}
      >
        <ChevronRight size={14} className="text-[#6B6459]" />
        <button
          type="button"
          onClick={onBack}
          className="text-[#6B6459] hover:text-[#1E5A88] transition-colors"
        >
          Daftar Event
        </button>
        <ChevronRight size={14} className="text-[#6B6459]" />
        <span className="text-[#1E5A88] normal-case">{event.judul}</span>
      </div>

      <div
        className="animate-enter mt-3 flex items-start justify-between gap-6 flex-wrap"
        style={{ animationDelay: "160ms" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-[#6B6459] hover:text-[#1E5A88] transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Event
        </button>

        <div className="flex items-center gap-2">
          <span
            className={[
              "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold",
              statusStyles[event.status],
            ].join(" ")}
          >
            {event.status}
          </span>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-lg bg-[#1E5A88] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17466B] transition-colors"
          >
            <Pencil size={16} />
            Edit Event
          </button>
        </div>
      </div>

      <div
        className="animate-enter mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5"
        style={{ animationDelay: "240ms" }}
      >
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="p-5 shrink-0">
                <div
                  className={[
                    "w-full sm:w-40 h-56 rounded-md overflow-hidden flex items-center justify-center",
                    event.posterColor,
                  ].join(" ")}
                >
                  {event.poster ? (
                    <img
                      src={event.poster}
                      alt={event.judul}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-white/90 text-center px-1">
                      {event.posterLabel}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1">
                <span
                  className={[
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                    event.genreColor,
                  ].join(" ")}
                >
                  {event.genre}
                </span>
                <h1 className="mt-2.5 text-2xl font-bold text-[#1E1B16]">{event.judul}</h1>
                <div className="mt-3 flex flex-col gap-1.5">
                  <p className="flex items-center gap-2 text-sm text-[#6B6459]">
                    <MapPin size={14} className="text-[#6B6459] shrink-0" />
                    {event.venue}, {event.lokasi}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-[#6B6459]">
                    <Calendar size={14} className="text-[#6B6459] shrink-0" />
                    {event.tanggal}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-[#6B6459]">
                    <Clock size={14} className="text-[#6B6459] shrink-0" />
                    {event.waktu} WIB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-[#1E5A88]" />
              <h3 className="text-sm font-bold text-[#1E1B16]">Deskripsi Event</h3>
            </div>
            <p className="text-sm text-[#6B6459] leading-relaxed">{event.deskripsi}</p>
          </div>

          <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-[#1E5A88]" />
              <h3 className="text-sm font-bold text-[#1E1B16]">Artis / Penampilan</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.artis.length > 0 ? (
                event.artis.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#F4DEB5]/50 border border-[#E8DDD2] px-3 py-1.5 text-xs font-semibold text-[#1E1B16]"
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                      style={{ backgroundColor: getArtistAvatarColor(a) }}
                    >
                      {getArtistInitials(a)}
                    </span>
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#B0A695]">Belum ada artis ditambahkan.</span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-[#1E5A88]" />
              <h3 className="text-sm font-bold text-[#1E1B16]">Logistik &amp; Penjualan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                  Periode Penjualan Tiket
                </p>
                <p className="mt-1 text-sm text-[#1E1B16]">
                  {event.periodeMulai} s/d {event.periodeSelesai}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                  Rentang Harga Tiket
                </p>
                <p className="mt-1 text-sm text-[#1E1B16]">
                  {formatRupiah(event.hargaTermurah)} - {formatRupiah(event.hargaTermahal)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-[#1E5A88]" />
              <h3 className="text-sm font-bold text-[#1E1B16]">Kebijakan &amp; S&amp;K</h3>
            </div>
            <p className="text-sm text-[#6B6459] leading-relaxed">{event.syaratKetentuan}</p>
            <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-[#F4DEB5]/30 border border-[#E8DDD2] px-4 py-3">
              <p className="text-sm font-semibold text-[#1E1B16]">Refund Otomatis</p>
              <span
                className={[
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                  event.refundOtomatis
                    ? "text-[#2E9E5B] bg-[#2E9E5B]/10"
                    : "text-[#6B6459] bg-[#6B6459]/10",
                ].join(" ")}
              >
                {event.refundOtomatis ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Ticket size={16} className="text-[#1E5A88]" />
              <h3 className="text-sm font-bold text-[#1E1B16]">Okupansi Tiket</h3>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-[#1E1B16]">
                {event.terjual.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-[#6B6459] mb-1">
                / {event.kuota.toLocaleString("id-ID")} kuota
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#E8DDD2] overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#6B6459]">
              <Percent size={12} />
              {percent}% terjual
            </p>
          </div>

          <div className="rounded-xl bg-[#1E5A88]/10 border border-[#1E5A88]/20 p-4 flex items-start gap-2.5">
            <Info size={16} className="text-[#1E5A88] shrink-0 mt-0.5" />
            <p className="text-xs text-[#1E5A88] leading-relaxed">
              Ini adalah tampilan detail internal untuk admin. Perubahan hanya tersimpan lewat tombol Edit Event.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#1E5A88] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17466B] transition-colors"
            >
              <Pencil size={15} />
              Edit Event
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center rounded-lg bg-[#FCF8F3] border border-[#1E5A88] px-4 py-2.5 text-sm font-semibold text-[#1E5A88] hover:bg-[#1E5A88]/5 transition-colors"
            >
              Kembali ke Daftar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

type DraftStatus = "Draft" | "Published" | "Closed";
type ViewMode = "list" | "form" | "detail";

const BACKEND_URL = "http://localhost:3001";

export default function DaftarEventPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<string>("Semua Status");
  const [genreFilter, setGenreFilter] = useState("Semua Genre");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [query, setQuery] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [posterLoadError, setPosterLoadError] = useState(false);

  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [venues, setVenues] = useState<Venue[]>([]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("Draft");
  const [judulKonser, setJudulKonser] = useState("");
  const [deskripsiEvent, setDeskripsiEvent] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [wilayahJabodetabek, setWilayahJabodetabek] = useState("");
  const [detailAlamat, setDetailAlamat] = useState("");
  const [genreUtama, setGenreUtama] = useState("");
  const [artisList, setArtisList] = useState<
    { id: number; name: string; genre: string }[]
  >([]);

  const [artisDropdownOpen, setArtisDropdownOpen] = useState(false);
  const [artisSearchQuery, setArtisSearchQuery] = useState("");
  const artisDropdownRef = useRef<HTMLDivElement>(null);

  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState("");
  const [waktuPelaksanaan, setWaktuPelaksanaan] = useState("");
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeSelesai, setPeriodeSelesai] = useState("");
  const [syaratKetentuan, setSyaratKetentuan] = useState("");
  const [refundOtomatis, setRefundOtomatis] = useState(false);

  const fetchGenres = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/genres`);

      if (!res.ok) {
        throw new Error("Gagal mengambil data genre");
      }

      const data = await res.json();

      setGenres(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/events`);

      if (!res.ok) {
        throw new Error(`Gagal fetch events: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          "Response bukan JSON — cek BACKEND_URL dan pastikan endpoint /api/events mengembalikan JSON."
        );
      }

      const data = await res.json();

const mappedData: EventItem[] = data.map((item: any) => ({
  id: item.id.toString(),
  posterLabel: "",
  posterColor: "bg-[#1E3A5F]",

  judul: item.title,
  genre: item.genre_name ?? "",
  genreId: item.genre_id,
  genreColor: "text-[#1E5A88] bg-[#1E5A88]/10",

  lokasi: item.city,
  venue: item.venue_name,

  tanggal: new Date(item.event_date).toLocaleDateString("id-ID"),

  status:
    item.status === "published"
      ? "Published"
      : item.status === "closed"
      ? "Closed"
      : "Draft",

  terjual: Number(item.total_sold),
  kuota: Number(item.total_quota),

  deskripsi: item.description,
  artis: normalizeArtists(item),

  waktu: item.event_date
    ? new Date(item.event_date).toISOString().slice(11, 16)
    : "",

  periodeMulai: item.ticket_open,
  periodeSelesai: item.ticket_close,

  syaratKetentuan: item.terms_conditions,
  refundOtomatis: Boolean(item.refund_policy),

  hargaTermurah: Number(item.min_price ?? 0),
  hargaTermahal: Number(item.max_price ?? 0),

  venueId: item.venue_id != null ? Number(item.venue_id) : null,
  adminId: item.admin_id != null ? Number(item.admin_id) : null,

  poster: item.poster ?? "",
  eventDateRaw: item.event_date ?? "",
}));

      setEventList(mappedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/venues`);
      if (!res.ok) return;
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) return;
      const data = await res.json();
      const mapped: Venue[] = data.map((v: any) => ({
        id: Number(v.id),
        venue_name: v.venue_name,
        city: v.city,
      }));
      setVenues(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchVenues();
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!artisDropdownOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (artisDropdownRef.current && !artisDropdownRef.current.contains(e.target as Node)) {
        setArtisDropdownOpen(false);
        setArtisSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [artisDropdownOpen]);

  const toDateInputValue = (raw: string) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
    return d.toISOString().slice(0, 10);
  };

  const toTimeInputValue = (raw: string) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(11, 16);
  };

  const checklist = [
    { label: "Informasi Dasar Terisi", done: judulKonser.trim().length > 0 },
    { label: "Pilih minimal 1 Artis", done: artisList.length > 0 },
    { label: "Upload Poster Event", done: Boolean(posterPreview) },
    { label: "Tentukan Periode Tiket", done: periodeMulai.length > 0 && periodeSelesai.length > 0 },
  ];

  const filteredArtistOptions = useMemo(() => {
    const q = artisSearchQuery.trim().toLowerCase();
    return ARTIST_OPTIONS.filter(
      (a) => !artisList.some((x) => x.id === a.id) && a.name.toLowerCase().includes(q)
    );
  }, [artisList, artisSearchQuery]);

  const handlePilihArtis = (artist: ArtistOption) => {
    if (!artisList.some((a) => a.id === artist.id)) {
      setArtisList((prev) => [
        ...prev,
        {
          id: artist.id,
          name: artist.name,
          genre: artist.genre,
        },
      ]);
    }
    setArtisSearchQuery("");
  };

  const handleHapusArtis = (name: string) => {
    setArtisList((prev) => prev.filter((a) => a.name !== name));
  };

  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setPosterLoadError(false);
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreview("");
    setPosterLoadError(false);
  };

  const resetForm = () => {
    setJudulKonser("");
    setDeskripsiEvent("");
    setSelectedVenueId("");
    setWilayahJabodetabek("");
    setDetailAlamat("");
    setGenreUtama("");
    setPosterFile(null);
    setPosterPreview("");
    setPosterLoadError(false);
    setArtisList([]);
    setArtisDropdownOpen(false);
    setArtisSearchQuery("");
    setTanggalPelaksanaan("");
    setWaktuPelaksanaan("");
    setPeriodeMulai("");
    setPeriodeSelesai("");
    setSyaratKetentuan("");
    setRefundOtomatis(false);
    setDraftStatus("Draft");
    setEditingEventId(null);
    setSubmitError(null);
  };

  const handleTambahEventBaru = () => {
    resetForm();
    setView("form");
  };

  const filteredVenuesByWilayah = useMemo(() => {
    if (!wilayahJabodetabek) return venues;
    return venues.filter((v) =>
      v.city.toLowerCase().includes(wilayahJabodetabek.toLowerCase())
    );
  }, [venues, wilayahJabodetabek]);

  const selectedVenueLabel = useMemo(() => {
    const v = venues.find((item) => String(item.id) === selectedVenueId);
    return v ? `${v.venue_name}, ${v.city}` : "";
  }, [venues, selectedVenueId]);

  const mapQuery = useMemo(() => {
    const parts = [selectedVenueLabel || wilayahJabodetabek, detailAlamat].filter(
      (part) => part && part.trim().length > 0
    );
    return parts.length > 0 ? parts.join(", ") : "Jabodetabek";
  }, [selectedVenueLabel, wilayahJabodetabek, detailAlamat]);

  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  const genreOptions = useMemo(() => {
    const list = eventList
      .map((e) => e.genre)
      .filter((g): g is string => Boolean(g && g.trim().length > 0));
    return ["Semua Genre", ...Array.from(new Set(list))];
  }, [eventList]);

  const filteredEvents = useMemo(() => {
    return eventList.filter((e) => {
      const matchStatus = statusFilter === "Semua Status" || e.status === statusFilter;
      const matchGenre = genreFilter === "Semua Genre" || e.genre === genreFilter;
      const matchQuery =
        query.trim() === "" ||
        e.judul.toLowerCase().includes(query.toLowerCase()) ||
        e.venue.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchGenre && matchQuery;
    });
  }, [statusFilter, eventList, genreFilter, query]);

  const selectedEvent = useMemo(
    () => eventList.find((e) => e.id === selectedEventId) ?? null,
    [eventList, selectedEventId]
  );

  const selectedGenre = useMemo(
    () => genres.find((g) => String(g.id) === genreUtama) ?? null,
    [genres, genreUtama]
  );

  const handleLihatDetail = (id: string) => {
    setSelectedEventId(id);
    setView("detail");
  };

  const prefillFormFrom = (target: EventItem) => {
    setEditingEventId(target.id);
    setPosterPreview(target.poster);
    setPosterLoadError(false);
    setSubmitError(null);
    setJudulKonser(target.judul);
    setDeskripsiEvent(target.deskripsi);
    setSelectedVenueId(target.venueId != null ? String(target.venueId) : "");
    const matchedWilayah = JABODETABEK_AREAS.find((w) =>
      target.lokasi?.toLowerCase().includes(w.toLowerCase())
    );
    setWilayahJabodetabek(matchedWilayah ?? "");
    setDetailAlamat("");
    setGenreUtama(String(target.genreId ?? ""));
    setArtisList(
      target.artis.map((name) => ({
        id: 0,
        name,
        genre: target.genre,
      }))
    );
    setTanggalPelaksanaan(toDateInputValue(target.eventDateRaw));
    setWaktuPelaksanaan(toTimeInputValue(target.eventDateRaw));
    setPeriodeMulai(target.periodeMulai ? target.periodeMulai.slice(0, 10) : "");
    setPeriodeSelesai(target.periodeSelesai ? target.periodeSelesai.slice(0, 10) : "");
    setSyaratKetentuan(target.syaratKetentuan);
    setRefundOtomatis(target.refundOtomatis);
    setDraftStatus(target.status);
  };

  const handleEditFromDetail = () => {
    if (selectedEvent) {
      prefillFormFrom(selectedEvent);
    }
    setView("form");
  };

  function handleEditFromDetailForRow(id: string) {
    const target = eventList.find((e) => e.id === id);
    if (target) {
      prefillFormFrom(target);
    }
    setView("form");
  }

  const handleSubmitEvent = async () => {
    // Validasi dilakukan SEBELUM proses simpan dimulai, bukan di dalam
    // blok finally seperti sebelumnya. Ini yang menyebabkan proses edit
    // gagal tersimpan (tombol macet di "Menyimpan..." dan error tidak
    // pernah ditampilkan ke user).
    if (!judulKonser.trim()) {
      setSubmitError("Judul konser wajib diisi.");
      return;
    }

    if (!genreUtama) {
      setSubmitError("Genre wajib dipilih.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const eventDate =
      tanggalPelaksanaan && waktuPelaksanaan
        ? `${tanggalPelaksanaan}T${waktuPelaksanaan}:00`
        : tanggalPelaksanaan || null;

    const existing = editingEventId
      ? eventList.find((e) => e.id === editingEventId)
      : null;

    const formData = new FormData();

    formData.append("admin_id", String(existing?.adminId ?? 1));
    formData.append("title", judulKonser);
    formData.append("description", deskripsiEvent);
    

    formData.append("artists", JSON.stringify(artisList));
    formData.append("genre_id", String(genreUtama));
    formData.append("venue_id", selectedVenueId);
    
    formData.append("location", detailAlamat || wilayahJabodetabek);

    formData.append("event_date", eventDate ?? "");
    formData.append("ticket_open", periodeMulai);
    formData.append("ticket_close", periodeSelesai);
    formData.append("terms_conditions", syaratKetentuan);
    formData.append("refund_policy", String(refundOtomatis));
    formData.append("status", draftStatus.toLowerCase());

    if (posterFile) {
      formData.append("poster", posterFile);
    }

    try {
      const url = editingEventId
        ? `${BACKEND_URL}/api/events/${editingEventId}`
        : `${BACKEND_URL}/api/events`;

      const method = editingEventId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Gagal menyimpan event.");
      }

      await fetchEvents();
      resetForm();
      setView("list");
    } catch (err) {
      console.error(err);
      setSubmitError(
        err instanceof Error ? err.message : "Gagal menyimpan event."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Hapus event ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Gagal menghapus event (${res.status})`);
      }
      await fetchEvents();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal menghapus event.");
    }
  };

  return (
    <div className="p-8">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-enter {
          animation: fadeSlideUp 0.5s ease-out both;
        }
      `}</style>

      <TopBar />

      {view === "list" && (
        <>
          <div
            className="animate-enter mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
            style={{ animationDelay: "80ms" }}
          >
            <ChevronRight size={14} className="text-[#6B6459]" />
            <span className="text-[#1E5A88]">Daftar Event</span>
          </div>

          <div
            className="animate-enter mt-3 flex items-start justify-between gap-6 flex-wrap"
            style={{ animationDelay: "160ms" }}
          >
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-[#1E1B16]">Daftar Event</h1>
              <p className="mt-2 text-sm text-[#6B6459] leading-relaxed">
                Kelola semua event yang terdaftar di platform, pantau status publikasi dan
                okupansi tiket dari satu tempat.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTambahEventBaru}
              className="flex items-center gap-2 rounded-lg bg-[#1E5A88] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17466B] transition-colors shrink-0"
            >
              <Plus size={18} />
              Tambah Event
            </button>
          </div>

          <div
            className="animate-enter mt-6 rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5"
            style={{ animationDelay: "220ms" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_200px] gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                  Pencarian Cepat
                </label>
                <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-[#F4DEB5]/30 border border-[#E8DDD2] px-3 py-2.5 focus-within:border-[#6E5A3F] transition-colors">
                  <Search size={16} className="text-[#6B6459] shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ketik nama artis atau venue..."
                    className="w-full bg-transparent text-sm text-[#1E1B16] placeholder:text-[#B0A695] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                  Status
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 pr-9 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors cursor-pointer"
                  >
                    <option>Semua Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                    <option>Closed</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6459]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                  Genre
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 pr-9 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors cursor-pointer"
                  >
                    {genreOptions.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6459]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="animate-enter mt-6 rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] overflow-hidden"
            style={{ animationDelay: "300ms" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead>
                  <tr className="bg-[#F4DEB5]/50">
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                      Poster
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                      Detail Event
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                      Genre
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                      Lokasi
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                      Tanggal
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                      Okupansi
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event, i) => {
                   const percent =
                    event.kuota > 0
                        ? Math.round((event.terjual / event.kuota) * 100)
                        : 0;
                    const barColor =
                      percent >= 100
                        ? "bg-[#C23B3B]"
                        : percent >= 60
                        ? "bg-[#1E5A88]"
                        : "bg-[#5B9BD5]";
                    return (
                      <tr
                        key={event.id}
                        className={[
                          "transition-colors hover:bg-[#F7EFE4]",
                          i !== filteredEvents.length - 1 ? "border-b border-[#E8DDD2]" : "",
                        ].join(" ")}
                      >
                        <td className="px-6 py-4">
                          <div
                            className={[
                              "w-14 h-[72px] rounded-md overflow-hidden flex items-center justify-center",
                              event.posterColor,
                            ].join(" ")}
                          >
                            {event.poster ? (
                              <img
                                src={event.poster}
                                alt={event.judul}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-white/90 text-center px-1">
                                {event.posterLabel}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#1E1B16] max-w-[220px]">
                            {event.judul}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={[
                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                              event.genreColor,
                            ].join(" ")}
                          >
                            {event.genre}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#1E1B16]">{event.lokasi}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B6459]">
                            <MapPin size={12} className="text-[#6B6459] shrink-0" />
                            {event.venue}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#1E1B16]">{event.tanggal}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={[
                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                              statusStyles[event.status],
                            ].join(" ")}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <span className="text-xs font-semibold text-[#1E1B16] shrink-0">
                              {event.terjual.toLocaleString("id-ID")} / {event.kuota.toLocaleString("id-ID")}
                            </span>
                            <div className="flex-1 h-1.5 rounded-full bg-[#E8DDD2] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${Math.min(percent, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-[#6B6459] shrink-0">
                              {percent}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              aria-label="Edit event"
                              onClick={() => {
                                setSelectedEventId(event.id);
                                handleEditFromDetailForRow(event.id);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F4DEB5]/60 transition-colors"
                            >
                              <Pencil size={16} className="text-[#6B6459]" />
                            </button>
                            <button
                              type="button"
                              aria-label="Lihat detail"
                              onClick={() => handleLihatDetail(event.id)}
                              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F4DEB5]/60 transition-colors"
                            >
                              <Eye size={16} className="text-[#6B6459]" />
                            </button>
                            <button
                              type="button"
                              aria-label="Hapus event"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={16} className="text-[#C23B3B]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-sm text-[#6B6459]">
                        {loading
                          ? "Memuat data event..."
                          : "Tidak ada event yang cocok dengan filter saat ini."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-[#F4DEB5]/30 flex-wrap gap-2">
              <span className="text-xs text-[#6B6459]">
                  Menampilkan 1-{filteredEvents.length} dari {eventList.length} event
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Halaman sebelumnya"
                  className="flex items-center justify-center w-7 h-7 rounded-md border border-[#E8DDD2] bg-[#FCF8F3] hover:bg-[#F7EFE4] transition-colors disabled:opacity-40"
                  disabled
                >
                  <ChevronLeft size={14} className="text-[#6B6459]" />
                </button>
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={[
                      "flex items-center justify-center w-7 h-7 rounded-md text-xs font-semibold transition-colors",
                      p === 1
                        ? "bg-[#1E5A88] text-white"
                        : "border border-[#E8DDD2] bg-[#FCF8F3] text-[#6B6459] hover:bg-[#F7EFE4]",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                ))}
                <span className="px-1 text-xs text-[#6B6459]">...</span>
                <button
                  type="button"
                  className="flex items-center justify-center w-7 h-7 rounded-md border border-[#E8DDD2] bg-[#FCF8F3] text-xs font-semibold text-[#6B6459] hover:bg-[#F7EFE4] transition-colors"
                >
                  5
                </button>
                <button
                  type="button"
                  aria-label="Halaman berikutnya"
                  className="flex items-center justify-center w-7 h-7 rounded-md border border-[#E8DDD2] bg-[#FCF8F3] hover:bg-[#F7EFE4] transition-colors"
                >
                  <ChevronRight size={14} className="text-[#6B6459]" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {view === "detail" && selectedEvent && (
        <DetailEvent
          event={selectedEvent}
          onBack={() => setView("list")}
          onEdit={handleEditFromDetail}
        />
      )}

      {view === "form" && (
        <>
          <div
            className="animate-enter mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
            style={{ animationDelay: "80ms" }}
          >
            <ChevronRight size={14} className="text-[#6B6459]" />
            <button
              type="button"
              onClick={() => setView("list")}
              className="text-[#6B6459] hover:text-[#1E5A88] transition-colors"
            >
              Daftar Event
            </button>
            <ChevronRight size={14} className="text-[#6B6459]" />
            <span className="text-[#1E5A88]">Buat Event Baru</span>
          </div>

          <div
            className="animate-enter mt-3 flex items-start justify-between gap-6 flex-wrap"
            style={{ animationDelay: "160ms" }}
          >
            <h1 className="text-2xl font-bold text-[#1E1B16]">
              {editingEventId ? "Edit Event" : "Buat Event Baru"}
            </h1>

            <div className="flex items-center gap-1 rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] p-1">
              {(["Draft", "Published", "Closed"] as DraftStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraftStatus(s)}
                  className={[
                    "px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors",
                    draftStatus === s
                      ? "bg-[#1E5A88] text-white"
                      : "text-[#6B6459] hover:bg-[#F4DEB5]/40",
                  ].join(" ")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div
            className="animate-enter mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={16} className="text-[#1E5A88]" />
                  <h3 className="text-sm font-bold text-[#1E1B16]">Konten Utama</h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                      Judul Konser
                    </label>
                    <input
                      type="text"
                      value={judulKonser}
                      onChange={(e) => setJudulKonser(e.target.value)}
                      placeholder="Contoh: Tulus Monokrom Tour : Pop"
                      className="mt-1.5 w-full rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B0A695] outline-none focus:border-[#6E5A3F] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                      Deskripsi Event
                    </label>
                    <div className="mt-1.5 rounded-lg border border-[#E8DDD2] overflow-hidden">
                      <div className="flex items-center gap-3 px-3 py-2 bg-[#F4DEB5]/40 border-b border-[#E8DDD2] text-xs font-semibold text-[#6E5A3F]">
                        <span className="font-serif italic">B</span>
                        <span className="italic">I</span>
                        <span>≡</span>
                        <span className="ml-auto">∞</span>
                      </div>
                      <textarea
                        value={deskripsiEvent}
                        onChange={(e) => setDeskripsiEvent(e.target.value)}
                        placeholder="Tuliskan detail menarik tentang konser ini..."
                        rows={5}
                        className="w-full bg-[#FCF8F3] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B0A695] outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                        Wilayah (Jabodetabek)
                      </label>
                      <div className="relative mt-1.5">
                        <select
                          value={wilayahJabodetabek}
                            onChange={(e) => {
                              setWilayahJabodetabek(e.target.value);
                              setSelectedVenueId("");
                            }}
                          className="w-full appearance-none rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 pr-9 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors cursor-pointer"
                        >
                          <option value="">Pilih wilayah...</option>
                          {JABODETABEK_AREAS.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6459]"
                        />
                      </div>

                      {(wilayahJabodetabek || detailAlamat) && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F4DEB5]/30 border border-[#E8DDD2] px-3 py-2.5">
                          <MapPin size={14} className="text-[#6B6459] shrink-0" />

                          <span className="text-sm text-[#1E1B16]">
                            {selectedVenueLabel ||
                              detailAlamat ||
                              wilayahJabodetabek ||
                              "Lokasi belum ditentukan."}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                        Genre Utama
                      </label>
                      <div className="relative mt-1.5">
                        <select
                          value={genreUtama}
                          onChange={(e) => setGenreUtama(e.target.value)}
                          className="w-full appearance-none rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] pl-9 pr-9 py-2.5 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={genres.length === 0}
                        >
                          <option value="">
                            {genres.length === 0 ? "Memuat genre..." : "Pilih Genre"}
                          </option>
                          {genres.map((g) => (
                            <option
                              key={g.id}
                              value={String(g.id)}
                              style={{ color: g.color_text, backgroundColor: g.color_bg }}
                            >
                              {g.genre_name}
                            </option>
                          ))}
                        </select>
                        <span
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-[#E8DDD2]"
                          style={{
                            backgroundColor: selectedGenre?.color_swatch ?? "#B0A695",
                          }}
                        />
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6459]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                      Detail Alamat / Catatan Lokasi
                    </label>
                   <input
                    type="text"
                    value={detailAlamat}
                    onChange={(e) => setDetailAlamat(e.target.value)}
                    placeholder="Contoh: BSD, Tangerang Selatan"
                    className="mt-1.5 w-full rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B0A695] outline-none focus:border-[#6E5A3F] transition-colors"
                  />

                    <div className="mt-3 overflow-hidden rounded-lg border border-[#E8DDD2]">
                      <iframe
                        key={mapQuery}
                        title="Peta lokasi venue"
                        src={mapEmbedSrc}
                        width="100%"
                        height="220"
                        style={{ border: 0, display: "block" }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#6B6459]">
                      <MapPin size={12} className="text-[#6B6459] shrink-0" />
                      Peta menyesuaikan otomatis berdasarkan wilayah, venue, dan detail alamat yang dipilih/diketik.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#1E5A88]" />
                    <h3 className="text-sm font-bold text-[#1E1B16]">Pilih Artis / Penampilan</h3>
                  </div>

                  <div className="relative" ref={artisDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setArtisDropdownOpen((prev) => !prev)}
                      className="text-xs font-semibold text-[#1E5A88] hover:text-[#17466B] transition-colors"
                    >
                      + Tambah Artis Baru
                    </button>

                    {artisDropdownOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] shadow-lg overflow-hidden">
                        <div className="p-2.5 border-b border-[#E8DDD2]">
                          <div className="flex items-center gap-2 rounded-lg bg-[#F4DEB5]/30 border border-[#E8DDD2] px-3 py-2">
                            <Search size={14} className="text-[#6B6459] shrink-0" />
                            <input
                              type="text"
                              autoFocus
                              value={artisSearchQuery}
                              onChange={(e) => setArtisSearchQuery(e.target.value)}
                              placeholder="Cari artis..."
                              className="w-full bg-transparent text-sm text-[#1E1B16] placeholder:text-[#B0A695] outline-none"
                            />
                          </div>
                        </div>

                        <div className="max-h-72 overflow-y-auto">
                          {filteredArtistOptions.length > 0 ? (
                            filteredArtistOptions.map((artist) => (
                              <button
                                key={artist.id}
                                type="button"
                                onClick={() => handlePilihArtis(artist)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F4DEB5]/40 transition-colors"
                              >
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ backgroundColor: getArtistAvatarColor(artist.name) }}
                                >
                                  {getArtistInitials(artist.name)}
                                </div>
                                <span className="flex-1 text-sm font-medium text-[#1E1B16]">
                                  {artist.name}
                                </span>
                                <span
                                  className={[
                                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0",
                                    getGenreBadgeStyle(artist.genre),
                                  ].join(" ")}
                                >
                                  {artist.genre}
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="px-4 py-6 text-center text-xs text-[#B0A695]">
                              Tidak ada artis yang cocok.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {artisList.length > 0 ? (
                    artisList.map((artis) => (
                      <span
                        key={artis.name}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#F4DEB5]/50 border border-[#E8DDD2] px-3 py-1.5 text-xs font-semibold text-[#1E1B16]"
                      >
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                          style={{ backgroundColor: getArtistAvatarColor(artis.name) }}
                        >
                          {getArtistInitials(artis.name)}
                        </span>
                        {artis.name}
                        <button
                          type="button"
                          aria-label={`Hapus ${artis.name}`}
                          onClick={() => handleHapusArtis(artis.name)}
                          className="text-[#6B6459] hover:text-[#C23B3B] transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#B0A695]">
                      Belum ada artis dipilih. Klik &quot;+ Tambah Artis Baru&quot; untuk memilih.
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-[#1E5A88]" />
                  <h3 className="text-sm font-bold text-[#1E1B16]">Logistik &amp; Penjualan</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                      Waktu Pelaksanaan
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 flex-1 focus-within:border-[#6E5A3F] transition-colors">
                        <Calendar size={14} className="text-[#6B6459] shrink-0" />
                        <input
                          type="date"
                          value={tanggalPelaksanaan}
                          onChange={(e) => setTanggalPelaksanaan(e.target.value)}
                          className="w-full bg-transparent text-sm text-[#1E1B16] outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 flex-1 focus-within:border-[#6E5A3F] transition-colors">
                        <Clock size={14} className="text-[#6B6459] shrink-0" />
                        <input
                          type="time"
                          value={waktuPelaksanaan}
                          onChange={(e) => setWaktuPelaksanaan(e.target.value)}
                          className="w-full bg-transparent text-sm text-[#1E1B16] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                      Periode Penjualan Tiket
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="date"
                        value={periodeMulai}
                        onChange={(e) => setPeriodeMulai(e.target.value)}
                        className="w-full rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors"
                      />
                      <span className="text-xs text-[#6B6459] shrink-0">s/d</span>
                      <input
                        type="date"
                        value={periodeSelesai}
                        onChange={(e) => setPeriodeSelesai(e.target.value)}
                        className="w-full rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={16} className="text-[#1E5A88]" />
                  <h3 className="text-sm font-bold text-[#1E1B16]">Kebijakan &amp; S&amp;K</h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                      Syarat &amp; Ketentuan Umum
                    </label>
                    <textarea
                      value={syaratKetentuan}
                      onChange={(e) => setSyaratKetentuan(e.target.value)}
                      placeholder="Masukkan syarat dan ketentuan bagi pengunjung..."
                      rows={4}
                      className="mt-1.5 w-full rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B0A695] outline-none focus:border-[#6E5A3F] transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6459] mb-2">
                      Kebijakan Refund
                    </p>
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#F4DEB5]/30 border border-[#E8DDD2] px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1E1B16]">
                          Izinkan Refund Otomatis
                        </p>
                        <p className="text-xs text-[#6B6459] mt-0.5">
                          Ubah pengaturan minimal refund mandiri lewat event dashboard perkenan.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={refundOtomatis}
                        onClick={() => setRefundOtomatis((prev) => !prev)}
                        className={[
                          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
                          refundOtomatis ? "bg-[#1E5A88]" : "bg-[#B0A695]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                            refundOtomatis ? "translate-x-6" : "translate-x-1",
                          ].join(" ")}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#1E5A88]">Poster Utama</h3>
                  {posterPreview && !posterLoadError && (
                    <button
                      type="button"
                      onClick={handleRemovePoster}
                      className="flex items-center gap-1 text-xs font-semibold text-[#C23B3B] hover:text-[#A32F2F] transition-colors"
                    >
                      <Trash2 size={12} />
                      Hapus
                    </button>
                  )}
                </div>

                {posterPreview && !posterLoadError ? (
                  <div className="group relative overflow-hidden rounded-lg border border-[#E8DDD2]">
                    <img
                      src={posterPreview}
                      alt="Poster event"
                      onError={() => setPosterLoadError(true)}
                      className="w-full h-72 object-cover"
                    />
                    <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1E1B16]/0 opacity-0 group-hover:bg-[#1E1B16]/55 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                      <span className="flex items-center gap-2 rounded-lg bg-[#FCF8F3] px-3.5 py-2 text-xs font-semibold text-[#1E1B16] shadow-sm">
                        <ImagePlus size={14} className="text-[#1E5A88]" />
                        Ganti Poster
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePosterFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-[#B0A695] bg-[#F4DEB5]/20 px-4 py-10 text-center cursor-pointer hover:border-[#6E5A3F] hover:bg-[#F4DEB5]/35 transition-colors">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F4DEB5]/60">
                      <ImagePlus size={22} className="text-[#6E5A3F]" />
                    </span>
                    <span className="text-sm font-semibold text-[#1E1B16]">
                      {posterLoadError ? "Poster tidak dapat dimuat" : "Drag & Drop Poster"}
                    </span>
                    <span className="text-xs text-[#6B6459] leading-relaxed">
                      {posterLoadError ? (
                        "Unggah ulang gambar poster untuk event ini."
                      ) : (
                        <>
                          Rasio 3:4 disarankan
                          <br />
                          (Contoh: 1200x1600px), Maks 5MB
                        </>
                      )}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-[#1E5A88] px-3 py-1.5 text-xs font-semibold text-[#1E5A88]">
                      <UploadCloud size={13} />
                      Pilih File
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePosterFileChange}
                    />
                  </label>
                )}
              </div>

              <div className="rounded-xl bg-[#1E5A88]/10 border border-[#1E5A88]/20 p-4 flex items-start gap-2.5">
                <Info size={16} className="text-[#1E5A88] shrink-0 mt-0.5" />
                <p className="text-xs text-[#1E5A88] leading-relaxed">
                  Preview tampilan publik tersedia setelah draft disimpan.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {submitError && (
                  <p className="text-xs font-medium text-[#C23B3B] bg-[#C23B3B]/10 rounded-lg px-3 py-2">
                    {submitError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSubmitEvent}
                  disabled={submitting}
                  className="flex items-center justify-center rounded-lg bg-[#1E5A88] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17466B] transition-colors disabled:opacity-60"
                >
                  {submitting
                    ? "Menyimpan..."
                    : editingEventId
                    ? "Simpan Perubahan"
                    : "Buat Event"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setView("list");
                  }}
                  className="flex items-center justify-center rounded-lg bg-[#FCF8F3] border border-[#1E5A88] px-4 py-2.5 text-sm font-semibold text-[#1E5A88] hover:bg-[#1E5A88]/5 transition-colors"
                >
                  Batalkan &amp; Kembali
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-[#C23B3B] hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                  Hapus Draft Event
                </button>
              </div>

              <div className="rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] p-5">
                <h3 className="text-sm font-bold text-[#1E1B16] mb-3">Checklist Kelengkapan</h3>
                <div className="flex flex-col gap-2.5">
                  {checklist.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.done ? (
                        <CheckCircle2 size={16} className="text-[#2E9E5B] shrink-0" />
                      ) : (
                        <Circle size={16} className="text-[#B0A695] shrink-0" />
                      )}
                      <span
                        className={[
                          "text-xs",
                          item.done ? "text-[#1E1B16] font-medium" : "text-[#6B6459]",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}