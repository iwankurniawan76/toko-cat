"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../__component/navbar.js";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const Member = () => {
  const [formData, setFormData] = useState({
    noMember: "",
    pembeli: "",
    alamat: "",
  });
  const [notification, setNotification] = useState(null);
  const [members, setMembers] = useState([]);
  // token
  const [fotoProfile, setFotoProfile] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  // refresh token
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
      setFotoProfile(decoded.fotoProfil);
      setNama(decoded.nama);
      setStatus(decoded.status);
      console.log("Token refreshed:", decoded);
    } catch (err) {
      console.log("Failed to refresh token:", err);
      router.push("login");
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("http://localhost:5500/members");
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5500/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Gagal menyimpan data");
      setNotification({
        type: "success",
        message: "Member berhasil ditambahkan!",
      });
      setTimeout(() => setNotification(null), 3000);
      setFormData({
        noMember: "",
        pembeli: "",
        alamat: "",
      });
      fetchMembers();
    } catch (error) {
      setNotification({ type: "error", message: error.message });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5500/member/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal menghapus Member");
      setNotification({ type: "success", message: "Member berhasil dihapus!" });
      setTimeout(() => setNotification(null), 3000);
      fetchMembers();
    } catch (error) {
      setNotification({ type: "error", message: error.message });
      setTimeout(() => setNotification(null), 3000);
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
    fetchMembers();

    const rawNoMember = `MB-${uuidv4().substring(0, 8)}`;
    setFormData({
      noMember: rawNoMember,
      pembeli: "",
      alamat: "",
    });
  }, []);

  return (
    <div>
      <Navbar nama={nama} status={status} fotoProfile={fotoProfile} logout={logout} />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-sm">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fade-in mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Tambah Member</h2>
          {notification && <div className={`p-3 rounded-md text-white ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>{notification.message}</div>}
          <form onSubmit={handleSubmit} className="text-sm space-y-4">
            <input type="text" name="noMember" value={formData.noMember} placeholder="Nomor Member" className="w-full p-2 border rounded focus:ring focus:ring-blue-300 transition" required readOnly />
            <input
              type="text"
              name="pembeli"
              value={formData.pembeli}
              onChange={handleChange}
              placeholder="Nama Pembeli"
              className="w-full p-2 border rounded focus:ring focus:ring-blue-300 transition"
              required
              autoComplete="new-password"
            />
            <input
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Alamat"
              className="w-full p-2 border rounded focus:ring focus:ring-blue-300 transition"
              required
              autoComplete="new-password"
            />
            {/* <select
              name="Jenis"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring focus:ring-blue-300 transition">
              <option value="">Pilih Otoritas</option>
              <option value="admin">Admin</option>
              <option value="kasir">Kasir</option>
            </select> */}
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
              Simpan
            </button>
          </form>
        </div>
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">No Member</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Alamat</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {members.map((mbr, index) => (
              <tr key={index} className="border-b">
                <td className="p-3 text-center">{index + 1}</td>
                <td className="p-3">{mbr.noMember}</td>
                <td className="p-3">{mbr.pembeli}</td>
                <td className="p-3">{mbr.alamat}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleDelete(mbr.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Member;
