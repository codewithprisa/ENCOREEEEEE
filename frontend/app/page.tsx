"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);

  try {
    const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Email atau kata sandi salah");
    }

    const data = await res.json();

    localStorage.setItem("token", data.token);
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    }

    router.push("/page/dashboard");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FDF4EC] px-4 py-12">
      {/* Ambient blobs — the "not stiff" background */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/50 to-orange-100/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-sky-200/40 to-blue-100/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 w-72 h-72 rounded-full bg-gradient-to-tr from-rose-100/40 to-amber-100/30 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-7">
<div className="w-32 h-32 mb-3 -rotate-3 hover:rotate-0 transition-transform duration-500">
  <Image
    src="/logo.png"
    alt="Logo Encoré"
    width={120}
    height={120}
    className="w-full h-full object-contain drop-shadow-sm"
    priority
  />
</div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-wide" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Encoré
          </h1>
          <p className="text-[11px] font-medium text-gray-400 tracking-[0.25em] mt-1.5">
            MANAJEMEN KONSER
          </p>
        </div>

        {/* Card — softened, floating, asymmetric radius */}
        <div className="bg-white/90 backdrop-blur-sm rounded-none shadow-xl shadow-orange-900/[0.06] border border-white overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-200" />

          <div className="p-8 sm:p-9">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Masuk ke Dashboard
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold text-gray-500 tracking-wider mb-2"
                >
                  ALAMAT EMAIL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-none placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200/70 focus:border-blue-300 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-semibold text-gray-500 tracking-wider"
                  >
                    KATA SANDI
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="4" y="10" width="16" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-none placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200/70 focus:border-blue-300 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                    }
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.5 0-9.5-4-11-8 1.02-2.29 2.75-4.3 4.94-5.66M9.9 4.24A10.9 10.9 0 0 1 12 4c5.5 0 9.5 4 11 8-1 2.24-2.5 4.15-4.35 5.5M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-none border-gray-300 text-blue-500 focus:ring-blue-200"
                />
                <span className="text-sm text-gray-600">
                  Tetap masuk selama 30 hari
                </span>
              </label>

{/* Error message */}
{error && (
  <p className="text-sm text-red-500 -mt-1">{error}</p>
)}

{/* Submit */}
<button
  type="submit"
  disabled={isLoading}
  className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-sm py-3 rounded-none transition-all shadow-md shadow-blue-400/30 hover:shadow-lg hover:shadow-blue-400/40 hover:-translate-y-0.5 disabled:opacity-60"
>
  {isLoading ? "Memproses..." : "Masuk"}
</button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Butuh akses bantuan?</p>
              <a
                href="#"
                className="font-semibold text-blue-500 hover:text-blue-600 tracking-wide"
              >
                HUBUNGI IT SUPPORT
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}