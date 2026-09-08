"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Info,
  Save,
  Loader2,
} from "lucide-react";
import { Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

// =====================================================================================
// CONFIG
// =====================================================================================

const API_BASE = "http://localhost:3001";

// =====================================================================================
// TYPES
// =====================================================================================

// Bentuk data persis seperti hasil query getAllArtis di backend
interface Artis {
  id: number;
  artist_name: string;
  genre_id: number;
  genre_name: string;
  photo: string | null; // nama file, disajikan lewat `${API_BASE}/uploads/artis/${photo}`
  description: string | null;
}

interface GenreOption {
  id: number;
  genre_name: string;
}

// =====================================================================================
// CONSTANTS
// =====================================================================================

const ITEMS_PER_PAGE = 4;

// Palet warna badge genre yang dirotasi berdasarkan genre_id,
// karena genre sekarang dinamis dari tabel `genres`, bukan enum tetap.
const GENRE_PALETTE = [
  "bg-[#DCEBF0] text-[#1E5A88]",
  "bg-[#D9E7F2] text-[#254A5E]",
  "bg-[#E7E2DB] text-[#5C5548]",
  "bg-[#F3E3C3] text-[#8A7A55]",
  "bg-[#EEF5F1] text-[#3E6350]",
];

function genreStyle(genreId: number) {
  return GENRE_PALETTE[genreId % GENRE_PALETTE.length];
}

// =====================================================================================
// PAGE
// =====================================================================================

export default function DataArtisPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [artisList, setArtisList] = useState<Artis[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtis, setEditingArtis] = useState<Artis | null>(null);
  const [deletingArtis, setDeletingArtis] = useState<Artis | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchArtis();
    fetchGenres();
  }, []);

  // TODO: sesuaikan endpoint ini kalau nama route genre di backend kamu berbeda
  async function fetchGenres() {
    try {
      const res = await fetch(`${API_BASE}/api/genres`);
      if (!res.ok) throw new Error("Gagal memuat daftar genre");
      const data: GenreOption[] = await res.json();
      setGenres(data);
    } catch {
      // dibiarkan diam — dropdown genre akan kosong & user diberi tahu di dalam modal
    }
  }

  async function fetchArtis() {
    setIsLoadingList(true);
    setListError(null);
    try {
      const res = await fetch(`${API_BASE}/api/artis`);
      if (!res.ok) throw new Error("Gagal memuat data artis");
      const data: Artis[] = await res.json();
      setArtisList(data);
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Gagal memuat data artis"
      );
    } finally {
      setIsLoadingList(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return artisList;
    return artisList.filter((a) =>
      a.artist_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, artisList]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const genreTerpopuler = useMemo(() => {
    if (artisList.length === 0) return "-";
    const counts = new Map<string, number>();
    for (const a of artisList) {
      counts.set(a.genre_name, (counts.get(a.genre_name) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }, [artisList]);

  const stats = {
    total: artisList.length,
    genreTerpopuler,
    // TODO: field ini belum ada sumber datanya dari backend, masih placeholder
    eventBulanIni: 42,
    artisBaru: 8,
  };

  function handleArtisAdded() {
    setIsModalOpen(false);
    setPage(1);
    fetchArtis(); // refresh list dari server setelah berhasil menambahkan
  }

  function handleArtisUpdated() {
    setEditingArtis(null);
    fetchArtis(); // refresh list dari server setelah berhasil mengedit
  }

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!deletingArtis) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${API_BASE}/api/artis/${deletingArtis.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus artis");
      setArtisList((prev) => prev.filter((a) => a.id !== deletingArtis.id));
      setDeletingArtis(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Gagal menghapus artis"
      );
    } finally {
      setIsDeleting(false);
    }
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
            placeholder="Cari artis..."
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
            <h1 className="text-2xl font-bold text-[#1E1B16]">
              Kelola Data Artis
            </h1>
            <p className="mt-1 text-sm text-[#6B6459]">
              Manajemen profil, genre, dan statistik performa artis.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#254A5E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E3C4C]"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Artis
          </button>
        </div>

        {/* ================= STAT CARDS ================= */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="TOTAL ARTIS" value={stats.total} accent="#254A5E" />
          <StatCard
            label="GENRE TERPOPULER"
            value={stats.genreTerpopuler}
            accent="#F5C842"
          />
          <StatCard
            label="EVENT BULAN INI"
            value={stats.eventBulanIni}
            accent="#254A5E"
          />
          <StatCard
            label="ARTIS BARU"
            value={`+${stats.artisBaru}`}
            accent="#F5C842"
          />
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-hidden rounded-xl border border-[#EADFCB] bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F3E3C3] text-[11px] font-semibold uppercase tracking-wide text-[#8A7A55]">
                <th className="px-6 py-3">Foto</th>
                <th className="px-6 py-3">Nama Artis</th>
                <th className="px-6 py-3">Genre</th>
                <th className="px-6 py-3">Jumlah Event</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E9D8]">
              {isLoadingList && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-[#9C927E]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat data artis...
                    </span>
                  </td>
                </tr>
              )}

              {!isLoadingList && listError && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-[#C0453A]"
                  >
                    {listError}{" "}
                    <button
                      type="button"
                      onClick={fetchArtis}
                      className="ml-1 font-semibold underline"
                    >
                      Coba lagi
                    </button>
                  </td>
                </tr>
              )}

              {!isLoadingList &&
                !listError &&
                pageData.map((artis) => (
                  <tr
                    key={artis.id}
                    className="transition-colors hover:bg-[#FBF6EC]"
                  >
                    <td className="px-6 py-4">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-[#E7E2DB]">
                        {artis.photo ? (
                          <img
                            src={`${API_BASE}/uploads/artis/${artis.photo}`}
                            alt={artis.artist_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#9C927E]">
                            {artis.artist_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#1E1B16]">
                      {artis.artist_name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${genreStyle(artis.genre_id)}`}
                      >
                        {artis.genre_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B6459]">-</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          aria-label={`Edit ${artis.artist_name}`}
                          onClick={() => setEditingArtis(artis)}
                          className="text-[#254A5E] transition-colors hover:text-[#1E3C4C]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus ${artis.artist_name}`}
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingArtis(artis);
                          }}
                          className="text-[#C0453A] transition-colors hover:text-[#9E362D]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoadingList && !listError && pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-[#9C927E]"
                  >
                    Tidak ada artis yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ================= FOOTER / PAGINATION ================= */}
          <div className="flex items-center justify-between border-t border-[#EADFCB] bg-[#F8EFDC] px-6 py-3">
            <span className="text-xs text-[#8A7A55]">
              Menampilkan {pageData.length} dari {filtered.length} artis
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

      {/* ================= MODAL: TAMBAH ARTIS ================= */}
      {isModalOpen && (
        <AddArtisModal
          genres={genres}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleArtisAdded}
        />
      )}

      {/* ================= MODAL: EDIT ARTIS ================= */}
      {editingArtis && (
        <EditArtisModal
          artis={editingArtis}
          genres={genres}
          onClose={() => setEditingArtis(null)}
          onSuccess={handleArtisUpdated}
        />
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS ================= */}
      {deletingArtis && (
        <ConfirmDeleteModal
          artis={deletingArtis}
          isDeleting={isDeleting}
          error={deleteError}
          onCancel={() => {
            if (isDeleting) return;
            setDeletingArtis(null);
            setDeleteError(null);
          }}
          onConfirm={handleConfirmDelete}
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
  accent,
}: {
  label: string;
  value: string | number;
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
    </div>
  );
}

// =====================================================================================
// MODAL: TAMBAH ARTIS BARU
// =====================================================================================

function AddArtisModal({
  genres,
  onClose,
  onSuccess,
}: {
  genres: GenreOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [artistName, setArtistName] = useState("");
  const [genreId, setGenreId] = useState<number | "">(genres[0]?.id ?? "");
  const [deskripsi, setDeskripsi] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 2;

  function processFile(selected: File | undefined) {
    if (!selected) return;

    if (!["image/jpeg", "image/png"].includes(selected.type)) {
      setFotoError("Format file harus JPG atau PNG.");
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setFotoError(`Ukuran file maksimal ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFotoError(null);
    setFile(selected);

    const reader = new FileReader();
    reader.onload = () => {
      setFotoPreview(reader.result as string);
    };
    reader.readAsDataURL(selected);
  }

  const isValid = artistName.trim().length > 0 && genreId !== "" && !isSubmitting;

  async function handleSubmit() {
    if (!artistName.trim() || genreId === "") return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("artist_name", artistName.trim());
      formData.append("genre_id", String(genreId));
      formData.append("description", deskripsi);
      if (file) {
        // TODO: sesuaikan nama field ini ("photo") dengan nama field
        // yang dipakai di upload.single('xxx') pada route backend kamu
        formData.append("photo", file);
      }

      const res = await fetch(`${API_BASE}/api/artis`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan artis. Silakan coba lagi.");
      }

      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gagal menyimpan artis."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B16]/50 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
      >
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between border-b border-[#EFE9DD] px-6 py-4">
          <h2 className="text-base font-bold text-[#1E1B16]">
            Tambah Artis Baru
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
        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Upload foto */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => processFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                processFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 text-center transition-colors ${
                isDragging
                  ? "border-[#F5C842] bg-[#FEFBF3]"
                  : "border-[#E3DCCC] bg-white hover:border-[#254A5E]/40 hover:bg-[#FAFAF8]"
              }`}
            >
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Preview foto artis"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EFE5] text-[#8A7A55]">
                  <Camera className="h-5 w-5" />
                </span>
              )}
              <span className="text-sm font-medium text-[#4A453B]">
                {fotoPreview
                  ? "Klik untuk ganti foto"
                  : "Klik atau seret foto ke sini"}
              </span>
              <span className="text-xs text-[#9C927E]">
                Format: JPG, PNG (Maks. {MAX_SIZE_MB}MB)
              </span>
            </button>
            {fotoError && (
              <p className="mt-1.5 text-xs font-medium text-[#C0453A]">
                {fotoError}
              </p>
            )}
          </div>

          {/* Nama & Genre */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                Nama Artis
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Contoh: Pamungkas, Hindia"
                className="w-full rounded-lg border border-[#E3DCCC] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B3AA97] focus:border-[#F5C842] focus:outline-none focus:ring-2 focus:ring-[#F5C842]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                Genre Utama
              </label>
              {genres.length === 0 ? (
                <p className="mt-1 text-xs text-[#C0453A]">
                  Daftar genre gagal dimuat dari server.
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={genreId}
                    onChange={(e) => setGenreId(Number(e.target.value))}
                    className="w-full appearance-none rounded-lg border border-[#E3DCCC] bg-white px-3 py-2.5 text-sm text-[#1E1B16] focus:border-[#F5C842] focus:outline-none focus:ring-2 focus:ring-[#F5C842]/40"
                  >
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.genre_name}
                      </option>
                    ))}
                  </select>
                  {genreId !== "" && (
                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${genreStyle(Number(genreId))}`}
                    >
                      {genres.find((g) => g.id === genreId)?.genre_name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
              Deskripsi Singkat
              <span className="text-[10px] font-normal normal-case text-[#B3AA97]">
                Opsional
              </span>
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              placeholder="Tuliskan biografi singkat atau detail menarik tentang artis ini..."
              className="w-full resize-none rounded-lg border border-[#E3DCCC] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B3AA97] focus:border-[#F5C842] focus:outline-none focus:ring-2 focus:ring-[#F5C842]/40"
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="rounded-lg bg-[#FBEAE8] px-3.5 py-3 text-xs font-medium text-[#C0453A]">
              {submitError}
            </div>
          )}

          {/* Info note */}
          <div className="flex items-start gap-2.5 rounded-lg bg-[#EEF5F1] px-3.5 py-3 text-xs text-[#3E6350]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Artis yang baru ditambahkan akan muncul di dashboard manajemen
              dan dapat langsung dihubungkan ke event yang akan datang.
            </p>
          </div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className="flex items-center justify-end gap-3 border-t border-[#EFE9DD] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-[#E3DCCC] px-4 py-2.5 text-sm font-medium text-[#4A453B] transition-colors hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex items-center gap-2 rounded-lg bg-[#254A5E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E3C4C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Menyimpan..." : "Simpan Artis"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// MODAL: EDIT ARTIS
// =====================================================================================

function EditArtisModal({
  artis,
  genres,
  onClose,
  onSuccess,
}: {
  artis: Artis;
  genres: GenreOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [artistName, setArtistName] = useState(artis.artist_name);
  const [genreId, setGenreId] = useState<number | "">(artis.genre_id);
  const [deskripsi, setDeskripsi] = useState(artis.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    artis.photo ? `${API_BASE}/uploads/artis/${artis.photo}` : null
  );
  const [fotoError, setFotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 2;

  function processFile(selected: File | undefined) {
    if (!selected) return;

    if (!["image/jpeg", "image/png"].includes(selected.type)) {
      setFotoError("Format file harus JPG atau PNG.");
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setFotoError(`Ukuran file maksimal ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFotoError(null);
    setFile(selected);

    const reader = new FileReader();
    reader.onload = () => {
      setFotoPreview(reader.result as string);
    };
    reader.readAsDataURL(selected);
  }

  const isValid = artistName.trim().length > 0 && genreId !== "" && !isSubmitting;

  async function handleSubmit() {
    if (!artistName.trim() || genreId === "") return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("artist_name", artistName.trim());
      formData.append("genre_id", String(genreId));
      formData.append("description", deskripsi);
      // Foto hanya dikirim kalau user pilih file baru,
      // supaya foto lama di server tidak tertimpa null saat tidak diganti.
      if (file) {
        // TODO: samakan nama field ini ("photo") dengan yang dipakai
        // di upload.single('xxx') pada route PUT backend kamu
        formData.append("photo", file);
      }

      const res = await fetch(`${API_BASE}/api/artis/${artis.id}`, {
        // TODO: sesuaikan method ini kalau backend kamu pakai PATCH, bukan PUT
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan perubahan. Silakan coba lagi.");
      }

      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gagal menyimpan perubahan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B16]/50 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
      >
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between border-b border-[#EFE9DD] px-6 py-4">
          <h2 className="text-base font-bold text-[#1E1B16]">Edit Artis</h2>
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
        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Upload foto */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => processFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                processFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 text-center transition-colors ${
                isDragging
                  ? "border-[#F5C842] bg-[#FEFBF3]"
                  : "border-[#E3DCCC] bg-white hover:border-[#254A5E]/40 hover:bg-[#FAFAF8]"
              }`}
            >
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Preview foto artis"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EFE5] text-[#8A7A55]">
                  <Camera className="h-5 w-5" />
                </span>
              )}
              <span className="text-sm font-medium text-[#4A453B]">
                {fotoPreview
                  ? "Klik untuk ganti foto"
                  : "Klik atau seret foto ke sini"}
              </span>
              <span className="text-xs text-[#9C927E]">
                Format: JPG, PNG (Maks. {MAX_SIZE_MB}MB)
              </span>
            </button>
            {fotoError && (
              <p className="mt-1.5 text-xs font-medium text-[#C0453A]">
                {fotoError}
              </p>
            )}
          </div>

          {/* Nama & Genre */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                Nama Artis
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Contoh: Pamungkas, Hindia"
                className="w-full rounded-lg border border-[#E3DCCC] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B3AA97] focus:border-[#F5C842] focus:outline-none focus:ring-2 focus:ring-[#F5C842]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                Genre Utama
              </label>
              {genres.length === 0 ? (
                <p className="mt-1 text-xs text-[#C0453A]">
                  Daftar genre gagal dimuat dari server.
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={genreId}
                    onChange={(e) => setGenreId(Number(e.target.value))}
                    className="w-full appearance-none rounded-lg border border-[#E3DCCC] bg-white px-3 py-2.5 text-sm text-[#1E1B16] focus:border-[#F5C842] focus:outline-none focus:ring-2 focus:ring-[#F5C842]/40"
                  >
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.genre_name}
                      </option>
                    ))}
                  </select>
                  {genreId !== "" && (
                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${genreStyle(Number(genreId))}`}
                    >
                      {genres.find((g) => g.id === genreId)?.genre_name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
              Deskripsi Singkat
              <span className="text-[10px] font-normal normal-case text-[#B3AA97]">
                Opsional
              </span>
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              placeholder="Tuliskan biografi singkat atau detail menarik tentang artis ini..."
              className="w-full resize-none rounded-lg border border-[#E3DCCC] px-3 py-2.5 text-sm text-[#1E1B16] placeholder:text-[#B3AA97] focus:border-[#F5C842] focus:outline-none focus:ring-2 focus:ring-[#F5C842]/40"
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="rounded-lg bg-[#FBEAE8] px-3.5 py-3 text-xs font-medium text-[#C0453A]">
              {submitError}
            </div>
          )}

          {/* Info note */}
          <div className="flex items-start gap-2.5 rounded-lg bg-[#EEF5F1] px-3.5 py-3 text-xs text-[#3E6350]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Kalau foto tidak diganti, foto lama akan tetap dipakai.
            </p>
          </div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className="flex items-center justify-end gap-3 border-t border-[#EFE9DD] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-[#E3DCCC] px-4 py-2.5 text-sm font-medium text-[#4A453B] transition-colors hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex items-center gap-2 rounded-lg bg-[#254A5E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E3C4C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// MODAL: KONFIRMASI HAPUS ARTIS
// =====================================================================================

function ConfirmDeleteModal({
  artis,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: {
  artis: Artis;
  isDeleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B16]/50 px-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl"
      >
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between border-b border-[#EFE9DD] px-6 py-4">
          <h2 className="text-base font-bold text-[#1E1B16]">Hapus Artis</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Tutup"
            className="text-[#9C927E] transition-colors hover:text-[#1E1B16] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---------- BODY ---------- */}
        <div className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-3 rounded-lg bg-[#FBEAE8] px-4 py-3.5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5D5D1]">
              <Trash2 className="h-4 w-4 text-[#C0453A]" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#1E1B16]">
                Hapus{" "}
                <span className="font-bold">"{artis.artist_name}"</span>?
              </p>
              <p className="mt-1 text-xs text-[#8A5A55]">
                Tindakan ini tidak dapat dibatalkan. Semua data terkait artis
                ini akan hilang secara permanen.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-[#FBEAE8] px-3.5 py-3 text-xs font-medium text-[#C0453A]">
              {error}
            </div>
          )}
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className="flex items-center justify-end gap-3 border-t border-[#EFE9DD] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-[#E3DCCC] px-4 py-2.5 text-sm font-medium text-[#4A453B] transition-colors hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-[#C0453A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9E362D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}