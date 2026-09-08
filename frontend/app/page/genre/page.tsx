"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MoreVertical,
  X,
  Pipette,
  Save,
} from "lucide-react";

// =====================================================================================
// TYPES
// =====================================================================================

interface BadgeColor {
  id: string;
  bg: string;
  text: string;
  swatch: string; // solid swatch shown in the color picker circle
}

interface Genre {
  id: number;
  nama: string;
  jumlahArtis: number;
  jumlahEvent: number;
  color: BadgeColor;
}

// =====================================================================================
// PALET WARNA BADGE — sesuai preset di pop up "Tambah Genre"
// =====================================================================================

const COLOR_PRESETS: BadgeColor[] = [
  { id: "blue", swatch: "#8FB8DE", bg: "#DCEBF7", text: "#255684" },
  { id: "peach", swatch: "#F0D8B8", bg: "#FBEEDD", text: "#8A6A34" },
  { id: "skyblue", swatch: "#BFDCEE", bg: "#E3F1F9", text: "#2C6E8F" },
  { id: "tan", swatch: "#E4CBA0", bg: "#F6E9D3", text: "#8A6A1D" },
  { id: "olive", swatch: "#C7B78C", bg: "#EFE7D3", text: "#6B5D34" },
  { id: "mint", swatch: "#C9DCC0", bg: "#E7F1E1", text: "#43653A" },
];

const ITEMS_PER_PAGE = 5;
const BACKEND_URL = "http://localhost:3001";

// =====================================================================================
// PAGE
// =====================================================================================

export default function KelolaGenrePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [genreList, setGenreList] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);

  // Modal state: null = closed, "add" = create mode, Genre = edit mode (prefilled)
  const [modalMode, setModalMode] = useState<"add" | Genre | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return genreList;
    return genreList.filter((g) =>
      g.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, genreList]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const genreTerpopuler = [...genreList].sort(
    (a, b) => b.jumlahArtis - a.jumlahArtis
  )[0];
  const kapasitasEvent = 48;

  async function fetchGenres() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/genres`);

      if (!res.ok) {
        throw new Error(`Gagal memuat genre (${res.status})`);
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          "Response bukan JSON — cek BACKEND_URL dan endpoint /api/genres."
        );
      }

      const data = await res.json();

      setGenreList(
        data.map((item: any, index: number) => {
          const fallback = COLOR_PRESETS[(item.id ?? index) % COLOR_PRESETS.length];
          return {
            id: item.id,
            nama: item.genre_name ?? item.nama ?? item.name ?? "",
            jumlahArtis: item.jumlahArtis ?? 0,
            jumlahEvent: item.jumlahEvent ?? 0,
            // Use the saved color if present, otherwise fall back to a
            // deterministic preset (covers older rows saved before the
            // color_bg/color_text/color_swatch columns existed).
            color: {
              id: "db",
              bg: item.color_bg ?? fallback.bg,
              text: item.color_text ?? fallback.text,
              swatch: item.color_swatch ?? fallback.swatch,
            },
          };
        })
      );
    } catch (err) {
      console.error(err);
      setLoadError(
        err instanceof Error ? err.message : "Gagal memuat daftar genre."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGenres();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus genre?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/genres/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || `Gagal menghapus genre (${res.status})`
        );
      }

      await fetchGenres();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal menghapus genre.");
    }
  }

  // Used by the modal for BOTH create and update. Throws on failure so the
  // modal itself can display the error inline instead of the page silently
  // doing nothing.
  async function handleSaveGenre(
    data: { nama: string; color: BadgeColor },
    editingId: number | null
  ) {
    const url = editingId
      ? `${BACKEND_URL}/api/genres/${editingId}`
      : `${BACKEND_URL}/api/genres`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        genre_name: data.nama,
        color_bg: data.color.bg,
        color_text: data.color.text,
        color_swatch: data.color.swatch,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.message ||
          (editingId
            ? `Gagal memperbarui genre (${res.status})`
            : `Gagal menambah genre (${res.status})`)
      );
    }

    await fetchGenres();
    setModalMode(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF8F4]">
      {/* ================= TOPBAR ================= */}
      <header className="flex items-center justify-between border-b border-[#EADFCB] bg-white px-8 py-4">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9C927E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari genre..."
            className="w-full rounded-lg border border-[#EADFCB] bg-white py-2 pl-9 pr-3 text-sm text-[#254A5E] placeholder:text-[#9C927E] focus:border-[#F5C842] focus:outline-none focus:ring-2 focus:ring-[#F5C842]/40"
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
        {/* ================= HEADER ================= */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1B16]">Kelola Genre</h1>
            <p className="mt-1 max-w-md text-sm text-[#6B6459]">
              Atur klasifikasi musik untuk memudahkan pemetaan artis dan
              segmentasi event konser Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalMode("add")}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-[#254A5E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E3C4C]"
          >
            <Plus className="h-4 w-4" />
            Tambah Genre
          </button>
        </div>

        {/* ================= STAT CARDS ================= */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="TOTAL GENRE"
            value={String(genreList.length).padStart(2, "0")}
            sublabel="Aktif"
            accent="#254A5E"
          />
          <StatCard
            label="GENRE TERPOPULER"
            value={genreTerpopuler?.nama ?? "-"}
            sublabel={`${genreTerpopuler?.jumlahArtis ?? 0} Artis`}
            accent="#F5C842"
          />
          <StatCard
            label="KAPASITAS EVENT"
            value={String(kapasitasEvent)}
            sublabel="Slot Tersedia"
            accent="#254A5E"
          />
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-hidden rounded-xl border border-[#EADFCB] bg-white">
          <div className="flex items-center justify-between border-b border-[#EADFCB] bg-white px-6 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9C927E]">
              Daftar Genre Musik
            </span>
            <div className="flex items-center gap-3 text-[#9C927E]">
              <button
                type="button"
                aria-label="Filter"
                className="transition-colors hover:text-[#254A5E]"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Opsi lainnya"
                className="transition-colors hover:text-[#254A5E]"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loadError && (
            <div className="border-b border-[#EADFCB] bg-red-50 px-6 py-3 text-sm text-[#C0453A]">
              {loadError}
            </div>
          )}

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F3E3C3] text-[11px] font-semibold uppercase tracking-wide text-[#8A7A55]">
                <th className="px-6 py-3">Nama Genre</th>
                <th className="px-6 py-3">Jumlah Artis</th>
                <th className="px-6 py-3">Jumlah Event</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E9D8]">
              {pageData.map((genre) => (
                <tr
                  key={genre.id}
                  className="transition-colors hover:bg-[#FBF6EC]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                        style={{
                          backgroundColor: genre.color.bg,
                          color: genre.color.text,
                        }}
                      >
                        {genre.nama ? genre.nama.charAt(0).toUpperCase() : "?"}
                      </span>
                      <span className="text-sm font-medium text-[#1E1B16]">
                        {genre.nama}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B6459]">
                    {genre.jumlahArtis} Artis
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                      style={{
                        backgroundColor: genre.color.bg,
                        color: genre.color.text,
                      }}
                    >
                      {String(genre.jumlahEvent).padStart(2, "0")} Event
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalMode(genre)}
                        aria-label={`Edit ${genre.nama}`}
                        className="text-[#254A5E] transition-colors hover:text-[#1E3C4C]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(genre.id)}
                        aria-label={`Hapus ${genre.nama}`}
                        className="text-[#C0453A] transition-colors hover:text-[#9E362D]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-[#9C927E]"
                  >
                    {loading
                      ? "Memuat data genre..."
                      : "Tidak ada genre yang cocok dengan pencarian."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ================= FOOTER / PAGINATION ================= */}
          <div className="flex items-center justify-between border-t border-[#EADFCB] bg-[#F8EFDC] px-6 py-3">
            <span className="text-xs text-[#8A7A55]">
              Menampilkan {pageData.length} dari {filtered.length} genre
              tersedia
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#EADFCB] bg-white text-[#8A7A55] transition-colors hover:bg-[#F1E9D8] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                      num === currentPage
                        ? "bg-[#254A5E] text-white"
                        : "border border-[#EADFCB] bg-white text-[#8A7A55] hover:bg-[#F1E9D8]"
                    }`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#EADFCB] bg-white text-[#8A7A55] transition-colors hover:bg-[#F1E9D8] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL: TAMBAH / EDIT GENRE ================= */}
      {modalMode !== null && (
        <GenreModal
          key={modalMode === "add" ? "add" : modalMode.id}
          initial={modalMode === "add" ? null : modalMode}
          onClose={() => setModalMode(null)}
          onSubmit={(data) =>
            handleSaveGenre(data, modalMode === "add" ? null : modalMode.id)
          }
        />
      )}
    </div>
  );
}

// =====================================================================================
// STAT CARD COMPONENT
// =====================================================================================

function StatCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string;
  sublabel: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-[#EADFCB] bg-white p-4">
      <div
        className="mb-3 h-0.5 w-8 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9C927E]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold leading-tight text-[#1E1B16]">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-[#9C927E]">{sublabel}</p>
    </div>
  );
}

// =====================================================================================
// MODAL: TAMBAH / EDIT GENRE
// Dipakai untuk dua mode:
//  - initial === null  -> mode "Tambah Genre Baru"
//  - initial !== null  -> mode "Edit Genre", form di-prefill dari data genre
// =====================================================================================

function GenreModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Genre | null;
  onClose: () => void;
  onSubmit: (data: { nama: string; color: BadgeColor }) => Promise<void>;
}) {
  const isEdit = initial !== null;

  const [nama, setNama] = useState(initial?.nama ?? "");
  const [selectedColorId, setSelectedColorId] = useState<string>(() => {
    if (!initial) return COLOR_PRESETS[0].id;
    const matched = COLOR_PRESETS.find(
      (c) => c.swatch.toLowerCase() === initial.color.swatch?.toLowerCase()
    );
    return matched ? matched.id : COLOR_PRESETS[0].id;
  });
  const [customColor, setCustomColor] = useState<string | null>(() => {
    if (!initial) return null;
    const matched = COLOR_PRESETS.find(
      (c) => c.swatch.toLowerCase() === initial.color.swatch?.toLowerCase()
    );
    // If the saved swatch doesn't match any preset, treat it as a custom color
    return matched ? null : initial.color.swatch ?? null;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeColor: BadgeColor = customColor
    ? {
        id: "custom",
        swatch: customColor,
        bg: withOpacity(customColor, 0.16),
        text: darken(customColor),
      }
    : COLOR_PRESETS.find((c) => c.id === selectedColorId) ?? COLOR_PRESETS[0];

  const isValid = nama.trim().length > 0;

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ nama: nama.trim(), color: activeColor });
      // onSubmit closes the modal on success (page owns modal state)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan genre."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B16]/50 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl"
      >
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between border-b border-[#EFE9DD] px-6 py-4">
          <h2 className="text-base font-bold text-[#1E1B16]">
            {isEdit ? "Edit Genre" : "Tambah Genre Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-[#9C927E] transition-colors hover:text-[#1E1B16]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---------- BODY ---------- */}
        <div className="space-y-5 px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-[#C0453A]">
              {error}
            </p>
          )}

          {/* Nama genre */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
              Nama Genre
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Indie, Pop, Rock"
              className="w-full rounded-lg border border-[#E3DCCC] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B3AA97] focus:border-[#F5C842] focus:outline-none focus:ring-2 focus:ring-[#F5C842]/40"
            />
          </div>

          {/* Pilih warna badge */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
              Pilih Warna Badge
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_PRESETS.map((c) => {
                const isActive = !customColor && selectedColorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedColorId(c.id);
                      setCustomColor(null);
                    }}
                    aria-label={`Pilih warna ${c.id}`}
                    className="h-8 w-8 rounded-full transition-transform hover:scale-105"
                    style={{
                      backgroundColor: c.swatch,
                      boxShadow: isActive
                        ? `0 0 0 2px white, 0 0 0 4px ${c.swatch}`
                        : "none",
                    }}
                  />
                );
              })}

              {/* Custom color picker */}
              <label
                className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-[#C9C1AE] text-[#9C927E] transition-colors hover:border-[#254A5E] hover:text-[#254A5E]"
                style={
                  customColor
                    ? {
                        backgroundColor: customColor,
                        boxShadow: `0 0 0 2px white, 0 0 0 4px ${customColor}`,
                        border: "none",
                      }
                    : undefined
                }
              >
                {!customColor && <Pipette className="h-3.5 w-3.5" />}
                <input
                  type="color"
                  value={customColor ?? "#8FB8DE"}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Pilih warna kustom"
                />
              </label>
            </div>
          </div>

          {/* Preview badge */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#B3AA97]">
              Preview Badge
            </p>
            <div className="flex items-center justify-center rounded-lg bg-[#FBF6EC] py-5">
              <span
                className="rounded-full px-4 py-1.5 text-sm font-semibold"
                style={{
                  backgroundColor: activeColor.bg,
                  color: activeColor.text,
                }}
              >
                {nama.trim() || "Nama Genre"}
              </span>
            </div>
          </div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className="flex items-center justify-end gap-3 border-t border-[#EFE9DD] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E3DCCC] px-4 py-2.5 text-sm font-medium text-[#4A453B] transition-colors hover:bg-[#FAFAF8]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex items-center gap-2 rounded-lg bg-[#254A5E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E3C4C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Simpan Genre"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// COLOR HELPERS — turunkan warna badge (bg tipis + teks gelap) dari 1 warna kustom
// =====================================================================================

function withOpacity(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex);
  // blend dengan putih supaya hasilnya tetap solid (bukan transparan)
  const blend = (channel: number) =>
    Math.round(channel * opacity + 255 * (1 - opacity));
  return rgbToHex(blend(r), blend(g), blend(b));
}

function darken(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 0.55;
  return rgbToHex(
    Math.round(r * factor),
    Math.round(g * factor),
    Math.round(b * factor)
  );
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}