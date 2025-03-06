"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Navbar from "../__component/navbar.js";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // token
  const [id, setId] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const refreshToken = async () => {
    try {
      const response = await axios.get("http://localhost:5500/token", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.data) {
        throw new Error("No accessToken received from server");
      }
      const accessToken = response.data;
      const decoded = jwtDecode(accessToken);
      setId(decoded.userId);
      setNama(decoded.nama);
      setStatus(decoded.status);
      console.log("Token refreshed:", decoded);
    } catch (err) {
      console.log("Failed to refresh token:", err);
      router.push("login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi minimal 6 karakter untuk password baru
    if (newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter.");
      return;
    }
    const data = {
      nama,
      oldPassword,
      newPassword,
    };
    try {
      const response = await axios.put(`http://localhost:5500/user/${id}`, data, {
        headers: {
          "Content-Type": "application/json", // Pastikan format JSON
          //   Authorization: `Bearer ${token}`, // Kirim token JWT
        },
        validateStatus: (status) => status < 500,
      });
      setTimeout(() => {
        setSuccess(response.data.message);
        setOldPassword("");
        setNewPassword("");
      }, 1000);
    } catch (err) {
      if (err.response) {
        // 🔴 Tangkap error dari backend
        setError(err.response.data?.message || "Terjadi kesalahan.");
      } else {
        setError("Gagal terhubung ke server.");
      }
    }
  };

  const logout = async (id) => {
    try {
      const res = await axios.delete("http://localhost:5500/logout", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      router.push("/login");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  return (
    <div>
      <Navbar nama={nama} status={status} logout={logout} />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Ubah Password</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Lama */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
            <input
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan password lama"
              required
            />
            <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-9 text-gray-600">
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Baru */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan password baru"
              required
            />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-9 text-gray-600">
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Tombol Submit */}
          <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400" disabled={!oldPassword || !newPassword}>
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
}
