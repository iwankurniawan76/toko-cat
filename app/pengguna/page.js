"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Navbar from "../__component/navbar.js";

export default function ProfileSettings() {
  const [selectedOption, setSelectedOption] = useState("profile");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // token
  const [id, setId] = useState("");
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
      setId(decoded.userId);
      setFotoProfile(decoded.fotoProfil);
      setNama(decoded.nama);
      setStatus(decoded.status);
      console.log("Token refreshed:", decoded);
    } catch (err) {
      console.log("Failed to refresh token:", err);
      router.push("login");
    }
  };

  // Saat user memilih gambar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file)); // Preview gambar
    }
  };

  // Upload Foto Profil
  const handleUpload = async (e) => {
    alert(id);
    e.preventDefault();
    if (!foto) return toast.error("Pilih gambar terlebih dahulu!");

    setLoading(true);
    const formData = new FormData();
    formData.append("fotoProfil", foto);
    formData.append("nama", nama);
    formData.append("status", status);

    try {
      const res = await axios.put(`http://localhost:5500/user/profile/${id}`, formData);

      toast.success(res.data.message);
      setPreview(`http://localhost:5500${res.data.fotoProfil}`);
      setFotoProfile(res.data.fotoProfil);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal upload");
    } finally {
      setLoading(false);
    }
  };

  // Ubah Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordLama || !passwordBaru) return toast.error("Isi semua field!");

    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:5500/user/${id}`, {
        nama,
        passwordLama,
        passwordBaru,
      });

      toast.success(res.data.message);
      setPasswordLama("");
      setPasswordBaru("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
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
      <Navbar nama={nama} status={status} fotoProfile={fotoProfile} logout={logout} preview={preview} />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg mt-2">
        <h2 className="text-lg font-semibold mb-4 text-center">Pengaturan Akun</h2>

        {/* Radio Pilihan */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-4 flex justify-center gap-4">
          <label className="inline-flex items-center">
            <input type="radio" value="profile" checked={selectedOption === "profile"} onChange={() => setSelectedOption("profile")} className="form-radio text-blue-500" />
            <span className="ml-2">Ubah Foto</span>
          </label>

          <label className="inline-flex items-center">
            <input type="radio" value="password" checked={selectedOption === "password"} onChange={() => setSelectedOption("password")} className="form-radio text-blue-500" />
            <span className="ml-2">Ubah Password</span>
          </label>
        </motion.div>

        {/* Form Upload Foto Profil */}
        {selectedOption === "profile" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="text-center mb-4">
              {preview ? <img src={preview} alt="Preview" className="w-32 h-32 mx-auto rounded-full border" /> : <div className="w-32 h-32 mx-auto rounded-full bg-gray-200"></div>}
            </div>

            <input type="file" name="fotoProfil" onChange={handleFileChange} className="mb-3 w-full text-sm text-gray-500" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpload}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md ${loading ? "bg-gray-400" : "bg-blue-500"} text-white`}
            >
              {loading ? "Uploading..." : "Upload Foto"}
            </motion.button>
          </motion.div>
        )}

        {/* Form Ubah Password */}
        {selectedOption === "password" && (
          <motion.form onSubmit={handleChangePassword} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password Lama"
                value={passwordLama}
                onChange={(e) => setPasswordLama(e.target.value)}
                className="border p-2 w-full rounded-md pr-10"
              />
              <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password Baru"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                className="border p-2 w-full rounded-md pr-10"
              />
              <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md w-full mt-2">
              Simpan Perubahan
            </motion.button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
