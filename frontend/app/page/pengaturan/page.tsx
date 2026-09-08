"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ExternalLink,
  QrCode,
  Landmark,
  Wallet,
  CreditCard,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

interface PaymentMethod {
  key: string;
  name: string;
  connected: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { key: "qris", name: "QRIS", connected: true, icon: QrCode, iconBg: "bg-[#FDF1CE]", iconColor: "text-[#B8860B]" },
  { key: "va", name: "Virtual Account", connected: true, icon: Landmark, iconBg: "bg-[#E4EEFB]", iconColor: "text-[#3B6FC9]" },
  { key: "gopay", name: "GoPay", connected: true, icon: Wallet, iconBg: "bg-[#E1F5E7]", iconColor: "text-[#2E9E5B]" },
  { key: "ovo", name: "OVO", connected: true, icon: Wallet, iconBg: "bg-[#E1D9F5]", iconColor: "text-[#6B4FA0]" },
  { key: "dana", name: "DANA", connected: false, icon: Wallet, iconBg: "bg-[#F0E4DC]", iconColor: "text-[#8C7A6F]" },
  { key: "card", name: "Kartu Kredit", connected: true, icon: CreditCard, iconBg: "bg-[#FBE4E4]", iconColor: "text-[#D0524A]" },
];

interface NotifPref {
  key: string;
  label: string;
}

const NOTIF_PREFS: NotifPref[] = [
  { key: "pesanan_baru", label: "Pesanan Baru" },
  { key: "pengajuan_refund", label: "Pengajuan Refund" },
  { key: "kuota_menipis", label: "Kuota Tiket Menipis" },
  { key: "review_baru", label: "Review Baru dari User" },
];

/* ------------------------------------------------------------------ */
/*  SHARED UI                                                          */
/* ------------------------------------------------------------------ */

function TopBar() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#F0E4DC] bg-white px-8 py-4">
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#3B6FC9]" : "bg-[#E3D8CE]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE CONTENT                                                       */
/* ------------------------------------------------------------------ */

function PengaturanView() {
  const [payments, setPayments] = useState(PAYMENT_METHODS);
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    pesanan_baru: true,
    pengajuan_refund: true,
    kuota_menipis: false,
    review_baru: true,
  });

  const router = useRouter();

  const togglePayment = (key: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.key === key ? { ...p, connected: !p.connected } : p))
    );
  };

  const toggleNotif = (key: string) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="px-8 py-8">
      {/* Header: judul di kiri, tombol profile di kanan */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#3A2E27]">Pengaturan</h1>
          <p className="mt-1 text-sm text-[#8C7A6F]">
            Kelola pengaturan sistem dan preferensi admin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/page/profile")}
          className="group relative shrink-0 rounded-xl border border-[#E8DDD2] bg-[#FCF8F3] px-5 py-2.5 text-sm font-semibold text-[#1E1B16] cursor-pointer overflow-hidden transition-all duration-300 hover:border-[#1E5A88] hover:text-[#1E5A88] hover:shadow-md hover:shadow-[#1E5A88]/15 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#1E5A88]/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          <span className="relative">Lihat Profile</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: Integrasi Pembayaran */}
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-xl border border-[#F0E4DC] bg-white shadow-sm">
            <div className="border-b border-[#F0E4DC] bg-[#FCEFDF] px-6 py-4">
              <p className="text-sm font-semibold text-[#3A2E27]">
                Integrasi Pembayaran
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              {payments.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#F0E4DC] bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${p.iconBg}`}
                    >
                      <p.icon className={`h-5 w-5 ${p.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A2E27]">
                        {p.name}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          p.connected ? "text-[#3B6FC9]" : "text-[#B8A99E]"
                        }`}
                      >
                        {p.connected ? "TERHUBUNG" : "TERPUTUS"}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    checked={p.connected}
                    onChange={() => togglePayment(p.key)}
                    label={`Hubungkan ${p.name}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preferensi Notifikasi + Informasi Sistem */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-[#F0E4DC] bg-white shadow-sm">
            <div className="border-b border-[#F0E4DC] bg-[#FCEFDF] px-6 py-4">
              <p className="text-sm font-semibold text-[#3A2E27]">
                Preferensi Notifikasi
              </p>
            </div>
            <div className="divide-y divide-[#F5EAE1] px-6">
              {NOTIF_PREFS.map((n) => (
                <div
                  key={n.key}
                  className="flex items-center justify-between gap-3 py-4"
                >
                  <span className="text-sm text-[#3A2E27]">{n.label}</span>
                  <Toggle
                    checked={notifs[n.key]}
                    onChange={() => toggleNotif(n.key)}
                    label={n.label}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#F0E4DC] bg-white shadow-sm">
            <div className="border-b border-[#F0E4DC] bg-[#FCEFDF] px-6 py-4">
              <p className="text-sm font-semibold text-[#3A2E27]">
                Informasi Sistem
              </p>
            </div>
            <div className="space-y-3 px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8C7A6F]">Versi Aplikasi</span>
                <span className="font-medium text-[#3A2E27]">v2.4.1</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8C7A6F]">Pembaruan Terakhir</span>
                <span className="font-medium text-[#3A2E27]">
                  12 Oktober 2023
                </span>
              </div>
              <div className="mt-2 space-y-2 border-t border-[#F5EAE1] pt-3">
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#3B6FC9] hover:underline"
                >
                  Kebijakan Privasi
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#3B6FC9] hover:underline"
                >
                  Syarat Penggunaan
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
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

export default function PengaturanPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4]">
      <TopBar />
      <PengaturanView />
    </div>
  );
}