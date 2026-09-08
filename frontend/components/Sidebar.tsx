"use client";



import { useState } from "react";

import {

  Menu,

  X,

  LayoutDashboard,

  CalendarDays,

  Ticket,

  Armchair,

  Mic2,

  Drama,

  ShoppingCart,

  RotateCcw,

  Bell,

  Settings,

  Sparkles,

} from "lucide-react";

import SidebarItem from "./SidebarItem";



const menuItems = [

  { href: "/page/dashboard", label: "Dashboard", icon: LayoutDashboard },

  { href: "/page/event", label: "Event", icon: CalendarDays },

  { href: "/page/kategori-tiket", label: "Kategori Tiket", icon: Ticket },

  { href: "/page/denah-kursi", label: "Denah Kursi", icon: Armchair },

  { href: "/page/artis", label: "Artis", icon: Mic2 },

  { href: "/page/genre", label: "Genre", icon: Drama },

  { href: "/page/pesanan", label: "Pesanan", icon: ShoppingCart },

  { href: "/page/refund", label: "Refund", icon: RotateCcw },

  { href: "/page/notifikasi", label: "Notifikasi", icon: Bell },

  { href: "/page/pengaturan", label: "Pengaturan", icon: Settings },

];



export default function Sidebar() {

  const [isOpen, setIsOpen] = useState(false);



  return (

    <>

      {/* Mobile hamburger button */}

      <button

        type="button"

        onClick={() => setIsOpen(true)}

        aria-label="Buka menu"

        className="md:hidden fixed top-4 left-4 z-40 flex items-center justify-center w-10 h-10 rounded-lg bg-[#FCF8F3] border border-[#E8DDD2] shadow-sm"

      >

        <Menu size={22} className="text-[#6E5A3F]" />

      </button>



      {/* Mobile overlay backdrop */}

      {isOpen && (

        <div

          onClick={() => setIsOpen(false)}

          className="md:hidden fixed inset-0 z-40 bg-black/30"

          aria-hidden="true"

        />

      )}



      {/* Sidebar */}

      <aside

        className={[

          "fixed md:sticky top-0 left-0 z-50 md:z-0",

          "h-screen w-[260px] shrink-0",

          "bg-[#FCF8F3] border-r border-[#E8DDD2]",

          "flex flex-col",

          "transition-transform duration-300 ease-in-out",

          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",

        ].join(" ")}

      >

        {/* Close button (mobile only) */}

        <button

          type="button"

          onClick={() => setIsOpen(false)}

          aria-label="Tutup menu"

          className="md:hidden absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F7EFE4]"

        >

          <X size={20} className="text-[#6E5A3F]" />

        </button>



        {/* Logo Section */}

        <div className="pt-8 px-6">

          <div className="flex items-center gap-2">

            <Sparkles size={28} className="text-[#7EC8E3]" strokeWidth={2.2} />

            <span className="text-2xl font-bold text-[#1E5A88] leading-none">

              Encore

            </span>

          </div>

          <p className="mt-1 text-[11px] tracking-wide uppercase text-[#6B6459] font-medium">

            Manajemen Konser

          </p>

        </div>



        {/* Menu */}

        <nav className="mt-8 flex-1 overflow-y-auto pb-6">

          <ul className="flex flex-col gap-1">

            {menuItems.map((item) => (

              <li key={item.href}>

                <SidebarItem

                  href={item.href}

                  label={item.label}

                  icon={item.icon}

                  onNavigate={() => setIsOpen(false)}

                />

              </li>

            ))}

          </ul>

        </nav>

      </aside>

    </>

  );

}