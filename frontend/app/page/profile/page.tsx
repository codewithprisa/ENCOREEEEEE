"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  User,
  ShieldCheck,
  LogOut,
  History,
  UserPlus,
  Monitor,
  X,
  Eye,
  EyeOff,
  Pencil,
  Loader2,
} from "lucide-react";
import { Sun, Moon } from "lucide-react";

const API_URL = "http://localhost:3001/api";

// ---------------------------------------------------------------------------
// Tipe data dari API — sesuaikan field ini kalau bentuk response
// userController.js / authController.js kamu beda
// ---------------------------------------------------------------------------
interface AdminFromApi {
  id: number;
  nama?: string;
  name?: string;
  email: string;
  hp?: string;
  phone?: string;
  no_hp?: string;
  avatar?: string;
  foto?: string;
  created_at?: string;
  createdAt?: string;
}

interface AdminData {
  id: number | null;
  nama: string;
  email: string;
  hp: string;
  bergabung: string;
  avatar: string;
}

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces";

function mapAdmin(raw: AdminFromApi): AdminData {
  return {
    id: raw.id,
    nama: raw.nama ?? raw.name ?? "Admin",
    email: raw.email ?? "-",
    hp: raw.hp ?? raw.phone ?? raw.no_hp ?? "-",
    bergabung: raw.created_at || raw.createdAt
      ? new Date(raw.created_at ?? raw.createdAt ?? "").toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-",
    avatar: raw.avatar ?? raw.foto ?? FALLBACK_AVATAR,
  };
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

const LOGIN_ACTIVITY = [
  {
    id: 1,
    device: "Chrome on Windows",
    versi: "Versi 121.0.6167.140",
    lokasi: "Jakarta, Indonesia",
    ip: "103.121.18.24",
    waktu: "Sekarang",
    aktif: true,
  },
  {
    id: 2,
    device: "Safari on iPhone",
    versi: "Versi 17.3.1",
    lokasi: "Jakarta, Indonesia",
    ip: "182.4.55.90",
    waktu: "Kemarin, 20:14",
    aktif: false,
  },
  {
    id: 3,
    device: "Chrome on Android",
    versi: "Versi 120.0.6099.230",
    lokasi: "Bandung, Indonesia",
    ip: "36.85.12.201",
    waktu: "3 hari lalu",
    aktif: false,
  },
];

// ---------------------------------------------------------------------------
// Reusable field
// ---------------------------------------------------------------------------
function Field({
  label,
  disabled,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        {...props}
        disabled={disabled}
        className={
          "w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm outline-none transition " +
          (disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-800 focus:border-[#2C4257] focus:ring-2 focus:ring-[#2C4257]/15")
        }
      />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Tambah Admin modal
// ---------------------------------------------------------------------------
type NewAdminForm = {
  nama: string;
  hp: string;
  email: string;
  password: string;
};

function TambahAdminModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (admin: NewAdminForm) => Promise<void>;
}) {
  const [form, setForm] = useState<NewAdminForm>({ nama: "", hp: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama || !form.hp || !form.email || !form.password) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan admin");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2C4257]/10 text-[#2C4257]">
              <UserPlus size={18} />
            </span>
            <h2 className="text-base font-semibold text-slate-800">Tambah Admin Baru</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Nama Lengkap"
            placeholder="cth. Budi Santoso"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
          />
          <Field
            label="Nomor Ponsel"
            placeholder="+62 8xx xxxx xxxx"
            value={form.hp}
            onChange={(e) => setForm({ ...form, hp: e.target.value })}
            required
          />
          <Field
            label="Email"
            type="email"
            placeholder="cth. budi@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div className="relative">
            <Field
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2C4257] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f3040] disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Tambahkan Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ProfilePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [draftAccount, setDraftAccount] = useState({ nama: "", email: "", hp: "" });
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // ---- Ambil data admin yang sedang login ----
  useEffect(() => {
    const fetchMe = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal memuat profil admin");
        const raw: AdminFromApi = await res.json();
        const mapped = mapAdmin(raw);
        setAdmin(mapped);
        setDraftAccount({ nama: mapped.nama, email: mapped.email, hp: mapped.hp });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, []);

  function handleStartEditAccount() {
    if (!admin) return;
    setDraftAccount({ nama: admin.nama, email: admin.email, hp: admin.hp });
    setAccountError(null);
    setIsEditingAccount(true);
  }

  function handleCancelEditAccount() {
    if (!admin) return;
    setDraftAccount({ nama: admin.nama, email: admin.email, hp: admin.hp });
    setAccountError(null);
    setIsEditingAccount(false);
  }

  // ---- Simpan info akun: langsung keluar dari mode edit (optimistic),
  // tanpa spinner/loading. Request ke API tetap dikirim di background.
  // Kalau gagal, balik ke data lama & tampilkan error.
  function handleSaveAccount() {
    if (!admin?.id) return;

    const previousAdmin = admin;
    const nextAccount = { ...draftAccount };

    // Update UI langsung, tanpa menunggu response
    setAdmin({ ...admin, ...nextAccount });
    setIsEditingAccount(false);
    setAccountError(null);

    const token = getToken();
    fetch(`${API_URL}/users/${admin.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: nextAccount.nama,
        email: nextAccount.email,
        phone: nextAccount.hp,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.msg ?? "Gagal menyimpan perubahan");
        }
      })
      .catch((err) => {
        // Rollback kalau request gagal
        setAdmin(previousAdmin);
        setDraftAccount({
          nama: previousAdmin.nama,
          email: previousAdmin.email,
          hp: previousAdmin.hp,
        });
        setAccountError(err instanceof Error ? err.message : "Terjadi kesalahan");
      });
  }

  async function handleAddAdmin(newAdmin: NewAdminForm) {
    const token = getToken();
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nama: newAdmin.nama,
        hp: newAdmin.hp,
        email: newAdmin.email,
        password: newAdmin.password,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.msg ?? "Gagal menambahkan admin");
    }
  }

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    lama: "",
    baru: "",
    konfirmasi: "",
  });

  function handleStartEditPassword() {
    setPasswordForm({ lama: "", baru: "", konfirmasi: "" });
    setPasswordError(null);
    setIsEditingPassword(true);
  }

  function handleCancelEditPassword() {
    setPasswordForm({ lama: "", baru: "", konfirmasi: "" });
    setPasswordError(null);
    setIsEditingPassword(false);
  }

  // ---- Ubah password: langsung keluar dari mode edit (optimistic),
  // tanpa spinner/loading. Kalau gagal, error ditampilkan & mode edit dibuka lagi.
  function handleSavePassword() {
    if (!admin?.id) return;
    if (!passwordForm.lama || !passwordForm.baru || !passwordForm.konfirmasi) return;
    if (passwordForm.baru !== passwordForm.konfirmasi) {
      setPasswordError("Password baru dan konfirmasi tidak sama.");
      return;
    }

    const submittedForm = { ...passwordForm };

    // Tutup mode edit langsung, tanpa menunggu response
    setPasswordForm({ lama: "", baru: "", konfirmasi: "" });
    setPasswordError(null);
    setIsEditingPassword(false);

    const token = getToken();
    fetch(`${API_URL}/users/${admin.id}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password_lama: submittedForm.lama,
        password_baru: submittedForm.baru,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.msg ?? "Gagal mengubah password");
        }
      })
      .catch((err) => {
        // Buka lagi mode edit kalau gagal, biar user tahu & bisa coba lagi
        setPasswordError(err instanceof Error ? err.message : "Terjadi kesalahan");
        setIsEditingPassword(true);
      });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF1EA] text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Memuat profil...
      </div>
    );
  }

  if (loadError || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF1EA] text-sm text-red-500">
        {loadError ?? "Profil tidak ditemukan"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF1EA] px-4 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Kelola informasi akun dan pengaturan keamanan dashboard Anda.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-[#2C4257] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f3040] sm:self-auto"
          >
            <UserPlus size={16} />
            Tambah Admin
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* -------------------------------------------------- */}
          {/* Left column                                        */}
          {/* -------------------------------------------------- */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-center shadow-sm">
              <h3 className="text-base font-semibold text-slate-800">{admin.nama}</h3>
              <p className="text-sm text-slate-400">{admin.email}</p>

              <div className="mt-5 border-t border-slate-100 pt-4 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Bergabung Sejak
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">{admin.bergabung}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3 text-sm font-semibold text-red-500 shadow-sm transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>

          {/* -------------------------------------------------- */}
          {/* Right column                                       */}
          {/* -------------------------------------------------- */}
          <div className="space-y-6">
            {/* Informasi Akun */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <User size={17} />
                  <h2 className="text-sm font-semibold">Informasi Akun</h2>
                </div>
                {!isEditingAccount && (
                  <button
                    onClick={handleStartEditAccount}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2C4257] hover:underline"
                  >
                    <Pencil size={13} />
                    Edit Informasi
                  </button>
                )}
              </div>

              {accountError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                  {accountError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Nama Lengkap"
                  value={draftAccount.nama}
                  disabled={!isEditingAccount}
                  onChange={(e) => setDraftAccount({ ...draftAccount, nama: e.target.value })}
                />
                <Field
                  label="Email"
                  type="email"
                  value={draftAccount.email}
                  disabled
                  onChange={(e) => setDraftAccount({ ...draftAccount, email: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Nomor HP"
                    value={draftAccount.hp}
                    disabled
                    onChange={(e) => setDraftAccount({ ...draftAccount, hp: e.target.value })}
                  />
                </div>
              </div>

              {isEditingAccount && (
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={handleCancelEditAccount}
                    className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveAccount}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2C4257] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f3040]"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </div>

            {/* Keamanan */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <ShieldCheck size={17} />
                  <h2 className="text-sm font-semibold">Keamanan</h2>
                </div>
                {!isEditingPassword && (
                  <button
                    onClick={handleStartEditPassword}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2C4257] hover:underline"
                  >
                    <Pencil size={13} />
                    Edit Password
                  </button>
                )}
              </div>

              {passwordError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <Field
                    label="Password Lama"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwordForm.lama}
                    disabled={!isEditingPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, lama: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={!isEditingPassword}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Password Baru"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.baru}
                    disabled={!isEditingPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, baru: e.target.value })}
                  />
                  <Field
                    label="Konfirmasi Password Baru"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.konfirmasi}
                    disabled={!isEditingPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, konfirmasi: e.target.value })
                    }
                  />
                </div>
              </div>

              {isEditingPassword && (
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={handleCancelEditPassword}
                    className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSavePassword}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2C4257] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f3040]"
                  >
                    Ubah Password
                  </button>
                </div>
              )}
            </div>

            {/* Aktivitas Login — masih data statis, lihat catatan di bawah kode */}
            <div className="rounded-2xl border border-amber-100 bg-[#FCF3E7] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <History size={17} />
                  <h2 className="text-sm font-semibold">Aktivitas Login</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                  SESI INI AKTIF
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      <th className="pb-2 font-semibold">Perangkat &amp; Browser</th>
                      <th className="pb-2 font-semibold">Lokasi / IP</th>
                      <th className="pb-2 text-right font-semibold">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LOGIN_ACTIVITY.map((row) => (
                      <tr key={row.id} className="border-t border-amber-100/80">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <Monitor size={16} className="text-slate-500" />
                            <div>
                              <p className="font-medium text-slate-800">{row.device}</p>
                              <p className="text-xs text-slate-400">{row.versi}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600">
                          <p>{row.lokasi}</p>
                          <p className="text-xs text-slate-400">{row.ip}</p>
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={
                              row.aktif
                                ? "font-medium text-emerald-600"
                                : "text-slate-500"
                            }
                          >
                            {row.waktu}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-center">
                <button className="text-xs font-semibold text-[#2C4257] underline-offset-2 hover:underline">
                  Lihat Semua Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <TambahAdminModal onClose={() => setShowModal(false)} onAdd={handleAddAdmin} />
      )}
    </div>
  );
}