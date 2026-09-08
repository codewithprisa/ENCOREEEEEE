"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  TrendingUp,
  Search,
  Filter,
  Download,
  Armchair,
  Ticket,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  X,
  Pipette,
  Palette,
} from "lucide-react";
import Image from "next/image";

/* ================= Shared: Top bar ================= */
function TopBar() {
   const router = useRouter();
   const [isDarkMode, setIsDarkMode] = useState(false);
  return (
    <div className="animate-enter flex items-center justify-between gap-6" style={{ animationDelay: "0ms" }}>
      <div className="group flex items-center gap-3 flex-1 max-w-2xl rounded-xl bg-[#F4DEB5]/40 border border-transparent px-5 py-4 transition-all duration-200 focus-within:bg-[#FCF8F3] focus-within:border-[#6E5A3F] focus-within:shadow-[0_0_0_3px_rgba(110,90,63,0.08)]">
        <Search size={22} className="text-[#6B6459] shrink-0 transition-colors duration-200 group-focus-within:text-[#6E5A3F]" />
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

/* ================= Kategori Tiket data ================= */
const stats = [
  {
    label: "Total Kuota",
    value: "15.000",
    valueColor: "text-[#1E5A88]",
    borderColor: "border-t-[#E0B84D]",
    footer: "500 dari penambahan baru",
    footerIcon: TrendingUp,
    footerColor: "text-[#6B6459]",
  },
  {
    label: "Total Terjual",
    value: "9.420",
    valueColor: "text-[#1E1B16]",
    borderColor: "border-t-[#5B9BD5]",
    footer: "62.8% Terisi",
    footerColor: "text-[#1E5A88] font-semibold",
  },
  {
    label: "Sisa Slot",
    value: "5.580",
    valueColor: "text-[#6E5A3F]",
    borderColor: "border-t-[#6E5A3F]",
    footer: "Masih Tersedia",
    footerColor: "text-[#6B6459]",
  },
  {
    label: "Estimasi Revenue",
    value: "Rp 12.4M",
    valueColor: "text-[#1E1B16]",
    borderColor: "border-t-[#1E3A5F]",
    footer: "Berdasarkan kategori aktif",
    footerColor: "text-[#6B6459]",
  },
];

type TipeKategori = "Seated" | "Festival";
type StatusKategori = "Aktif" | "Nonaktif";

type Kategori = {
  id: string;
  nama: string;
  subtitle: string;
  tipe: TipeKategori;
  harga: number;
  kuota: number;
  terjual: number;
  status: StatusKategori;
  warna: string;
  sale_start?: string;
  sale_end?: string;
};

/* ================= Kategori & Warna (tag warna badge) ================= */
type WarnaOption = { id: string; label: string; color: string };

const defaultWarnaOptions: WarnaOption[] = [
  { id: "standar", label: "Standar", color: "#5B9BD5" },
  { id: "regular", label: "Regular", color: "#2E9E5B" },
  { id: "vip", label: "VIP", color: "#E0B84D" },
  { id: "vvip", label: "VVIP", color: "#FFFFFF" },
];

// Palet cepat untuk menambah warna baru
const quickAddPalette = ["#C23B3B", "#B8752E", "#8B6FB0", "#4FA8A0", "#D97757", "#3A342C"];

const initialKategoriList: Kategori[] = [
  {
    id: "vvip",
    nama: "vvip",
    subtitle: "Lounge Access + Merch",
    tipe: "Seated",
    harga: 3500000,
    kuota: 500,
    terjual: 482,
    status: "Aktif",
    warna: "#FFFFFF",
  },
  {
    id: "vip",
    nama: "vip",
    subtitle: "Front of Stage",
    tipe: "Festival",
    harga: 1250000,
    kuota: 4500,
    terjual: 3120,
    status: "Aktif",
    warna: "#E0B84D",
  },
  {
    id: "regular",
    nama: "regular",
    subtitle: "Level 2, Row A-M",
    tipe: "Seated",
    harga: 850000,
    kuota: 6000,
    terjual: 4810,
    status: "Aktif",
    warna: "#2E9E5B",
  },
  {
    id: "standar",
    nama: "standar",
    subtitle: "Early Bird Session",
    tipe: "Festival",
    harga: 950000,
    kuota: 4000,
    terjual: 1008,
    status: "Nonaktif",
    warna: "#5B9BD5",
  },
];

const tipeStyles: Record<TipeKategori, string> = {
  Seated: "text-[#1E5A88] bg-[#1E5A88]/10",
  Festival: "text-[#B8752E] bg-[#B8752E]/10",
};

const statusStyles: Record<StatusKategori, string> = {
  Aktif: "text-[#2E9E5B] bg-[#2E9E5B]/10",
  Nonaktif: "text-[#6B6459] bg-[#6B6459]/10",
};

const formatNumber = (value: number | undefined) =>
  (value ?? 0).toLocaleString("id-ID");

/* ================= Form Kategori (Modal) ================= */
type KategoriFormState = {
  nama: string;
  subtitle: string;
  tipe: TipeKategori;
  harga: string;
  kuota: string;
  terjual: string;
  status: StatusKategori;
  warna: string;
};

const emptyForm: KategoriFormState = {
  nama: "",
  subtitle: "",
  tipe: "Seated",
  harga: "",
  kuota: "",
  terjual: "0",
  status: "Aktif",
  warna: defaultWarnaOptions[0].color,
};

function KategoriModal({
  mode,
  initialData,
  warnaOptions,
  onAddWarnaOption,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  initialData: KategoriFormState;
  warnaOptions: WarnaOption[];
  onAddWarnaOption: (opt: WarnaOption) => void;
  onClose: () => void;
  onSubmit: (data: KategoriFormState) => void;
}) {
  const [form, setForm] = useState<KategoriFormState>(initialData);
  const [error, setError] = useState("");

  // State untuk panel "Tambah Warna"
  const [showAddWarna, setShowAddWarna] = useState(false);
  const [newWarnaLabel, setNewWarnaLabel] = useState("");
  const [newWarnaColor, setNewWarnaColor] = useState(quickAddPalette[0]);
  const [addWarnaError, setAddWarnaError] = useState("");

  const update = (field: keyof KategoriFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.nama.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }
    if (!form.harga.trim()) {
      setError("Harga wajib diisi.");
      return;
    }
    if (!form.kuota.trim() || isNaN(Number(form.kuota.replace(/\./g, "")))) {
      setError("Kuota harus berupa angka.");
      return;
    }
    setError("");
    onSubmit(form);
  };

  const confirmAddWarna = () => {
    if (!newWarnaLabel.trim()) {
      setAddWarnaError("Nama tag warna wajib diisi.");
      return;
    }
    const slug = newWarnaLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newOpt: WarnaOption = {
      id: `${slug}-${Date.now()}`,
      label: newWarnaLabel.trim(),
      color: newWarnaColor,
    };
    onAddWarnaOption(newOpt);
    update("warna", newOpt.color);
    setNewWarnaLabel("");
    setNewWarnaColor(quickAddPalette[0]);
    setAddWarnaError("");
    setShowAddWarna(false);
  };

  const cancelAddWarna = () => {
    setShowAddWarna(false);
    setNewWarnaLabel("");
    setAddWarnaError("");
  };

  

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B16]/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="animate-modal-in w-full max-w-lg rounded-2xl bg-[#FCF8F3] border border-[#E8DDD2] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8DDD2] bg-[#F4DEB5]/30">
          <div>
            <h3 className="text-lg font-bold text-[#1E1B16]">
              {mode === "add" ? "Tambah Kategori Baru" : "Edit Kategori"}
            </h3>
            <p className="text-xs text-[#6B6459] mt-0.5">
              {mode === "add" ? "Buat kategori tiket baru untuk event ini." : "Perbarui detail kategori tiket."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#E8DDD2]/60 transition-colors shrink-0"
          >
            <X size={18} className="text-[#6B6459]" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
              Nama Kategori
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => update("nama", e.target.value)}
              placeholder="Contoh: VIP Premium"
              className="mt-1.5 w-full rounded-lg bg-white border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
              Deskripsi Singkat
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="Contoh: Lounge Access + Merch"
              className="mt-1.5 w-full rounded-lg bg-white border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors"
            />
          </div>

          {/* ===== Kategori & Warna ===== */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
              <Palette size={13} className="text-[#6E5A3F]" />
              Kategori &amp; Warna
            </label>

            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {warnaOptions.map((opt) => {
                const isSelected = form.warna.toLowerCase() === opt.color.toLowerCase();
                const accent = opt.color.toLowerCase() === "#ffffff" ? "#1E5A88" : opt.color;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update("warna", opt.color)}
                    className={[
                      "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-150",
                      isSelected ? "shadow-sm" : "border-[#E8DDD2] bg-white hover:bg-[#F7EFE4]",
                    ].join(" ")}
                    style={
                      isSelected
                        ? { borderColor: accent, backgroundColor: `${accent}14` }
                        : undefined
                    }
                  >
                    <span
                      className="w-7 h-7 rounded-md border border-black/10 shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: isSelected ? accent : "#3A342C" }}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {!showAddWarna ? (
              <button
                type="button"
                onClick={() => setShowAddWarna(true)}
                className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D9CFBF] px-4 py-2.5 text-sm font-semibold text-[#6E5A3F] hover:bg-[#F4DEB5]/30 hover:border-[#B0A695] transition-colors"
              >
                <Plus size={16} />
                Tambah Warna
              </button>
            ) : (
              <div className="mt-2.5 rounded-xl border border-[#E8DDD2] bg-white p-4 flex flex-col gap-3">
                <input
                  type="text"
                  value={newWarnaLabel}
                  onChange={(e) => setNewWarnaLabel(e.target.value)}
                  placeholder="Nama tag, contoh: Presale"
                  className="w-full rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] px-3 py-2 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {quickAddPalette.map((c) => {
                    const isActive = newWarnaColor.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        title={c}
                        onClick={() => setNewWarnaColor(c)}
                        className={[
                          "w-7 h-7 rounded-md transition-all duration-150 border",
                          isActive
                            ? "ring-2 ring-offset-1 ring-[#1E5A88] border-transparent"
                            : "border-black/10 hover:scale-110",
                        ].join(" ")}
                        style={{ backgroundColor: c }}
                      />
                    );
                  })}
                  <label
                    title="Warna kustom"
                    className="relative w-7 h-7 rounded-md border-2 border-dashed border-[#B0A695] flex items-center justify-center cursor-pointer hover:border-[#6E5A3F] transition-colors"
                  >
                    <Pipette size={12} className="text-[#6E5A3F]" />
                    <input
                      type="color"
                      value={newWarnaColor}
                      onChange={(e) => setNewWarnaColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Pilih warna kustom"
                    />
                  </label>
                  <span
                    className="w-7 h-7 rounded-md border border-black/10 shrink-0"
                    style={{ backgroundColor: newWarnaColor }}
                    title="Preview warna terpilih"
                  />
                </div>

                {addWarnaError && (
                  <p className="text-xs font-medium text-[#C23B3B]">{addWarnaError}</p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelAddWarna}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-[#6B6459] hover:bg-[#E8DDD2]/60 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmAddWarna}
                    className="rounded-lg bg-[#1E5A88] px-3 py-2 text-xs font-semibold text-white hover:bg-[#17466B] transition-colors"
                  >
                    Tambah Warna
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===== Preview Badge ===== */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
              Preview Badge
            </label>
            <div className="mt-1.5 rounded-lg bg-[#F4DEB5]/25 border border-[#E8DDD2] px-4 py-6 flex items-center justify-center">
              <span
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-semibold border"
                style={{
                  backgroundColor: form.warna.toLowerCase() === "#ffffff" ? "#FCF8F3" : `${form.warna}26`,
                  color: form.warna.toLowerCase() === "#ffffff" ? "#1E5A88" : form.warna,
                  borderColor: form.warna.toLowerCase() === "#ffffff" ? "#E8DDD2" : "transparent",
                }}
              >
                {form.nama.trim() || "Nama Kategori"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">Tipe</label>
              <div className="mt-1.5 flex rounded-lg border border-[#E8DDD2] bg-white p-1 gap-1">
                {(["Seated", "Festival"] as TipeKategori[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update("tipe", t)}
                    className={[
                      "flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors",
                      form.tipe === t
                        ? t === "Seated"
                          ? "bg-[#1E5A88] text-white"
                          : "bg-[#B8752E] text-white"
                        : "text-[#6B6459] hover:bg-[#F4DEB5]/40",
                    ].join(" ")}
                  >
                    {t === "Seated" ? <Armchair size={13} /> : <Ticket size={13} />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">Status</label>
              <div className="mt-1.5 flex rounded-lg border border-[#E8DDD2] bg-white p-1 gap-1">
                {(["Aktif", "Nonaktif"] as StatusKategori[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update("status", s)}
                    className={[
                      "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
                      form.status === s
                        ? s === "Aktif"
                          ? "bg-[#2E9E5B] text-white"
                          : "bg-[#6B6459] text-white"
                        : "text-[#6B6459] hover:bg-[#F4DEB5]/40",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">Harga</label>
              <div className="mt-1.5 flex items-center rounded-lg bg-white border border-[#E8DDD2] px-3 py-2.5 focus-within:border-[#6E5A3F] transition-colors">
                <span className="text-sm font-semibold text-[#6B6459] mr-1">Rp</span>
                <input
                  type="text"
                  value={form.harga}
                  onChange={(e) => update("harga", e.target.value)}
                  placeholder="1.250.000"
                  className="w-full bg-transparent text-sm text-[#1E1B16] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">Kuota</label>
              <input
                type="text"
                value={form.kuota}
                onChange={(e) => update("kuota", e.target.value)}
                placeholder="4500"
                className="mt-1.5 w-full rounded-lg bg-white border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#1E1B16] outline-none focus:border-[#6E5A3F] transition-colors"
              />
            </div>
          </div>

          {mode === "edit" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#6B6459]">
                Terjual (tiket)
              </label>
              <input
                type="text"
                value={form.terjual}
                readOnly
                disabled
                className="mt-1.5 w-full rounded-lg bg-[#EDE6DC] border border-[#E8DDD2] px-3 py-2.5 text-sm text-[#6B6459] outline-none cursor-not-allowed"
              />
              <p className="mt-1.5 text-[11px] leading-snug text-[#8A8171]">
                Jumlah terjual dihitung otomatis dari transaksi dan tidak bisa diubah manual di sini.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-[#C23B3B]/10 px-3 py-2.5 text-xs font-medium text-[#C23B3B]">
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E8DDD2] bg-[#F4DEB5]/20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#6B6459] hover:bg-[#E8DDD2]/60 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-[#1E5A88] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17466B] transition-colors"
          >
            <Save size={16} />
            {mode === "add" ? "Simpan Kategori" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Main Page ================= */
export default function KategoriTiketPage() {
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchKategoriTiket = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/tiket-types"
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil kategori tiket");
        }

        const data = await response.json();

        const mappedData: Kategori[] = data.map((item: any) => ({
          id: String(item.id),
          nama: item.ticket_name,
          subtitle: item.description ?? "",
          tipe: "Seated",
          harga: Number(item.price),
          kuota: Number(item.quota),
          terjual: Number(item.sold),
          status: item.status === "active" ? "Aktif" : "Nonaktif",
          warna: item.color ?? "#FFFFFF",
          sale_start: item.sale_start,
          sale_end: item.sale_end,
        }));

        setKategoriList(mappedData);
      } catch (error) {
        console.error("GET KATEGORI TIKET ERROR:", error);
      }
    };

    fetchKategoriTiket();
  }, []);

  const totalKuota = kategoriList.reduce(
    (total, item) => total + item.kuota,
    0
  );

  const totalTerjual = kategoriList.reduce(
    (total, item) => total + item.terjual,
    0
  );

  const sisaSlot = totalKuota - totalTerjual;

  const persentaseTerisi =
    totalKuota > 0 ? (totalTerjual / totalKuota) * 100 : 0;

  const estimasiRevenue = kategoriList.reduce(
    (total, item) => total + item.harga * item.terjual,
    0
  );

  // Daftar tag Kategori & Warna — bisa ditambah dari dalam modal
  const [warnaOptions, setWarnaOptions] = useState<WarnaOption[]>(defaultWarnaOptions);

  const openAddModal = () => {
    setEditingId(null);
    setModalMode("add");
  };

  const openEditModal = (kategori: Kategori) => {
    setEditingId(kategori.id);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  const editingKategori = editingId ? kategoriList.find((k) => k.id === editingId) : null;

  const formInitialData: KategoriFormState = editingKategori
    ? {
        nama: editingKategori.nama,
        subtitle: editingKategori.subtitle,
        tipe: editingKategori.tipe,
        harga: String(editingKategori.harga),
        kuota: String(editingKategori.kuota),
        terjual: String(editingKategori.terjual),
        status: editingKategori.status,
        warna: editingKategori.warna,
      }
    : emptyForm;

const handleFormSubmit = async (data: KategoriFormState) => {
  const kuotaNum = Number(data.kuota.replace(/\./g, "")) || 0;
  const terjualNum = Number(data.terjual.replace(/\./g, "")) || 0;
  const hargaNum = Number(data.harga.replace(/\./g, "")) || 0;

  try {
    if (modalMode === "add") {
      const response = await fetch(
        "http://localhost:3001/api/tiket-types",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_name: data.nama,
            description: data.subtitle,
            price: hargaNum,
            quota: kuotaNum,
            sold: 0,
            status: data.status === "Aktif" ? "active" : "inactive",
            sale_start: editingKategori?.sale_start,
            sale_end: editingKategori?.sale_end,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal menambahkan kategori tiket");
      }

      alert("Kategori tiket berhasil ditambahkan!");
    }

    if (modalMode === "edit" && editingId) {
      const response = await fetch(
        `http://localhost:3001/api/tiket-types/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_name: data.nama,
            description: data.subtitle,
            price: hargaNum,
            quota: kuotaNum,
            sold: terjualNum,
            status: data.status === "Aktif" ? "active" : "inactive",
            color: data.warna,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Gagal memperbarui kategori tiket"
        );
      }

      alert("Kategori tiket berhasil diperbarui!");
    }

    // Ambil ulang data dari database
    const response = await fetch(
      "http://localhost:3001/api/tiket-types"
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data kategori tiket");
    }

    const updatedData = await response.json();

    const mappedData: Kategori[] = updatedData.map((item: any) => ({
      id: String(item.id),
      nama: item.ticket_name,
      subtitle: item.description ?? "",
      tipe: "Seated",
      harga: Number(item.price),
      kuota: Number(item.quota),
      terjual: Number(item.sold),
      status: item.status === "active" ? "Aktif" : "Nonaktif",
      warna: item.color ?? "#FFFFFF",
    }));

    setKategoriList(mappedData);

    closeModal();
  } catch (error) {
    console.error("SIMPAN KATEGORI ERROR:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menyimpan kategori tiket"
    );
  }
};

  const handleDelete = (id: string) => {
    setKategoriList((prev) => prev.filter((k) => k.id !== id));
  };

  const aktifCount = kategoriList.filter((k) => k.status === "Aktif").length;
  const arsipCount = kategoriList.filter((k) => k.status === "Nonaktif").length;

  return (
    <div className="p-8">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-enter {
          animation: fadeSlideUp 0.5s ease-out both;
        }
        .animate-modal-in {
          animation: modalIn 0.2s ease-out both;
        }
      `}</style>

      {modalMode && (
        <KategoriModal
          mode={modalMode}
          initialData={formInitialData}
          warnaOptions={warnaOptions}
          onAddWarnaOption={(opt) => setWarnaOptions((prev) => [...prev, opt])}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
        />
      )}

      <TopBar />

      {/* Breadcrumb */}
      <div className="animate-enter mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ animationDelay: "80ms" }}>
        <ChevronRight size={14} className="text-[#6B6459]" />
        <span className="text-[#1E5A88]">Kategori Tiket</span>
      </div>

      {/* Header */}
      <div className="animate-enter mt-3 flex items-start justify-between gap-6 flex-wrap" style={{ animationDelay: "160ms" }}>
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-[#1E1B16]">Kelola Kategori Tiket</h1>
          <p className="mt-2 text-sm text-[#6B6459] leading-relaxed">
            Atur struktur harga, kuota, dan tipe kursi untuk Jakarta Soundwave 2024. Perubahan
            akan langsung berdampak pada ketersediaan di halaman pemesanan user.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-[#1E5A88] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17466B] transition-colors shrink-0"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* Stat cards */}
      <div className="animate-enter mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ animationDelay: "240ms" }}>
        {stats.map((stat, i) => {
          const FooterIcon = stat.footerIcon;
          return (
            <div
              key={stat.label}
              className={[
                "animate-enter rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] border-t-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                stat.borderColor,
              ].join(" ")}
              style={{ animationDelay: `${300 + i * 80}ms` }}
            >
              <p className="text-xs uppercase tracking-wide text-[#6B6459] font-semibold">{stat.label}</p>
              <p className={`mt-3 text-3xl font-bold ${stat.valueColor}`}>{stat.value}</p>
              <div className={`mt-3 flex items-center gap-1.5 text-xs ${stat.footerColor}`}>
                {FooterIcon && <FooterIcon size={14} />}
                <span>{stat.footer}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daftar Kategori */}
      <div className="animate-enter mt-6 rounded-xl bg-[#FCF8F3] border border-[#E8DDD2] overflow-hidden" style={{ animationDelay: "620ms" }}>
        <div className="flex items-center justify-between px-6 py-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-[#1E1B16]">Daftar Kategori</h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-[#1E5A88] bg-[#1E5A88]/10">
              {aktifCount} Aktif
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-[#6B6459] bg-[#6B6459]/10">
              {arsipCount} Arsip
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" aria-label="Filter" className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#F4DEB5]/50 border border-[#E8DDD2] hover:bg-[#F4DEB5]/70 transition-colors">
              <Filter size={16} className="text-[#6E5A3F]" />
            </button>
            <button type="button" aria-label="Unduh" className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#F4DEB5]/50 border border-[#E8DDD2] hover:bg-[#F4DEB5]/70 transition-colors">
              <Download size={16} className="text-[#6E5A3F]" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-[#F4DEB5]/50">
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">Nama Kategori</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">Tipe</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">Harga</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">Kuota</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">Terjual</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">Sisa</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-[#6E5A3F] px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kategoriList.map((kategori, i) => {
                const sisa = kategori.kuota - kategori.terjual;
                const sisaRatio = kategori.kuota > 0 ? sisa / kategori.kuota : 0;
                const sisaColor =
                  sisaRatio <= 0.05 ? "text-[#C23B3B] font-bold" : "text-[#1E1B16]";
                return (
                  <tr
                    key={kategori.id}
                    className={[
                      "transition-colors hover:bg-[#F7EFE4]",
                      i !== kategoriList.length - 1 ? "border-b border-[#E8DDD2]" : "",
                    ].join(" ")}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-[4px] border border-black/10 shrink-0"
                          style={{ backgroundColor: kategori.warna }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#1E1B16]">{kategori.nama}</p>
                          <p className="text-xs text-[#6B6459] mt-0.5">{kategori.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={["inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", tipeStyles[kategori.tipe]].join(" ")}>
                        {kategori.tipe === "Seated" ? <Armchair size={12} /> : <Ticket size={12} />}
                        {kategori.tipe}
                      </span>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-[#1E1B16]">Rp {kategori.harga}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-[#1E1B16]">{formatNumber(kategori.kuota)}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-[#1E1B16]">{formatNumber(kategori.terjual)}</span></td>
                    <td className="px-6 py-4"><span className={`text-sm ${sisaColor}`}>{formatNumber(sisa)}</span></td>
                    <td className="px-6 py-4">
                      <span className={["inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", statusStyles[kategori.status]].join(" ")}>
                        {kategori.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Edit kategori"
                          onClick={() => openEditModal(kategori)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F4DEB5]/60 transition-colors"
                        >
                          <Pencil size={16} className="text-[#6B6459]" />
                        </button>
                        <button
                          type="button"
                          aria-label="Hapus kategori"
                          onClick={() => handleDelete(kategori.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} className="text-[#C23B3B]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-[#F4DEB5]/30 flex-wrap gap-2">
          <span className="text-xs text-[#6B6459]">Menampilkan 1-{kategoriList.length} dari {kategoriList.length} kategori</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#1E5A88]">Terakhir diperbarui: Hari ini, 14:20</span>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Halaman sebelumnya" className="flex items-center justify-center w-7 h-7 rounded-md border border-[#E8DDD2] bg-[#FCF8F3] hover:bg-[#F7EFE4] transition-colors disabled:opacity-40" disabled>
                <ChevronLeft size={14} className="text-[#6B6459]" />
              </button>
              <button type="button" aria-label="Halaman berikutnya" className="flex items-center justify-center w-7 h-7 rounded-md border border-[#E8DDD2] bg-[#FCF8F3] hover:bg-[#F7EFE4] transition-colors disabled:opacity-40" disabled>
                <ChevronRight size={14} className="text-[#6B6459]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}