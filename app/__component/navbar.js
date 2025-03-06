"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar({ nama, status, logout, fotoProfile, preview }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="no-print bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* Logo Perusahaan */}
      <img src={`/logo.png`} alt="FOTO PROFILE" className="w-10 h-10 rounded-full" />

      {/* Tombol Hamburger Menu (Hanya muncul di Mobile) */}
      <button className="md:hidden focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      {/* Menu Navigasi */}
      <div
        className={`absolute lg:static top-16 left-0 w-full lg:w-auto bg-gray-800 lg:bg-transparent lg:flex space-x-6 p-4 lg:p-0 transition-all duration-300 ${isMobileMenuOpen ? "block" : "hidden"}`}
      >
        {status === "admin" && (
          <>
            <Link href="/manage-user" className="block lg:inline-block hover:text-gray-300">
              Manage User
            </Link>
            <Link href="/persediaan" className="block lg:inline-block hover:text-gray-300">
              Stok Barang
            </Link>
          </>
        )}
        <Link href="/member" className="block lg:inline-block hover:text-gray-300">
          Member
        </Link>
        <Link href="/penjualan" className="block lg:inline-block hover:text-gray-300">
          Penjualan
        </Link>
        <Link href="/laporan" className="block lg:inline-block hover:text-gray-300">
          Laporan
        </Link>
      </div>

      {/* User Dropdown */}
      <div className="relative">
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
          <img src={preview || `http://localhost:5500${fotoProfile}`} alt="FOTO PROFILE" className="w-8 h-8 rounded-full" />
          <span>{nama}</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md">
            <Link href="/pengguna" className="block w-full text-left px-4 py-2 hover:bg-gray-200">
              Pengguna
            </Link>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* CSS untuk menyembunyikan elemen saat print */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
