"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../__component/navbar.js";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { FormatRupiah } from "@/utils/formatRupiah";
import { useRouter } from "next/navigation";

export default function FormInputBarang() {
  const [formData, setFormData] = useState({
    tglPembelian: "",
    kodeBarang: "",
    produk: "",
    distributor: "",
    merek: "",
    quantity: "",
    satuan: "",
    h_beli: 0,
    h_jual: 0,
    diskon: 0,
  });

  const [tglPembelian, setTglPembelian] = useState("");
  const [barangList, setBarangList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [plusMode, setPlusMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const itemsPerPage = 10;

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
      if (decoded.status !== "admin") {
        router.push("penjualan");
      }
      setFotoProfile(decoded.fotoProfil);
      setNama(decoded.nama);
      setStatus(decoded.status);
      console.log("Token refreshed:", decoded);
    } catch (err) {
      console.log("Failed to refresh token:", err);
      router.push("/");
    }
  };

  const fetchBarang = async () => {
    try {
      const response = await axios.get("http://localhost:5500/produks", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setBarangList(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const showNotification = (message, success = true) => {
    setNotification({ message, success });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editMode ? "PUT" : "POST";
      let url = "";
      if (editMode) {
        url = `http://localhost:5500/produk/${editId}`;
      } else {
        url = "http://localhost:5500/produk";
      }
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Gagal menyimpan data");
      fetchBarang();
      showNotification(editMode ? "Data berhasil diperbarui!" : "Data berhasil disimpan!");
      setShowForm(false);
      setEditMode(false);
      setPlusMode(false);
      setEditId(null);
      setFormData({
        kodeBarang: "",
        produk: "",
        distributor: "",
        merek: "",
        quantity: "",
        satuan: "",
        h_beli: "",
        h_jual: "",
        diskon: "",
      });
    } catch (err) {
      showNotification(`Gagal menyimpan ${err.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const handleTambahData = () => {
    const kodeBarang = `KB-${uuidv4().substring(0, 8)}`;
    const today = new Date().toISOString().split("T")[0];
    setTglPembelian(today);
    setIsReadOnly(false);
    setFormData({
      tglPembelian: today,
      kodeBarang: kodeBarang,
      produk: "",
      distributor: "",
      merek: "",
      quantity: "",
      satuan: "",
      h_beli: "",
      h_jual: "",
      diskon: "",
    });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    // Contoh tanggal dari server: "2025-02-26T00:00:00.000Z"
    const rawDate = item.tglPembelian;
    // Konversi ke format "yyyy-MM-dd"
    const formattedDate = rawDate.split("T")[0];
    setFormData({
      tglPembelian: formattedDate,
      kodeBarang: item.kodeBarang,
      produk: item.produk,
      distributor: item.distributor,
      merek: item.merek,
      quantity: item.quantity,
      satuan: item.satuan,
      h_beli: item.h_beli,
      h_jual: item.h_jual,
      diskon: item.diskon,
    });
    setIsReadOnly(true);
    setEditId(item.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handlePlus = (item) => {
    // Contoh tanggal dari server: "2025-02-26T00:00:00.000Z"
    const rawDate = item.tglPembelian;
    // Konversi ke format "yyyy-MM-dd"
    const formattedDate = rawDate.split("T")[0];
    setFormData({
      tglPembelian: formattedDate,
      kodeBarang: item.kodeBarang,
      produk: item.produk,
      distributor: item.distributor,
      merek: item.merek,
      quantity: 1,
      satuan: item.satuan,
      h_beli: "",
      h_jual: "",
      diskon: "",
    });
    setIsReadOnly(true);
    setPlusMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5500/produk/${id}`, { method: "DELETE" });
      fetchBarang();
      showNotification("Data berhasil dihapus!");
    } catch (err) {
      showNotification("Gagal menghapus data", false);
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
      router.push("/");
    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditId(null);
    setFormData({
      kodeBarang: "",
      produk: "",
      distributor: "",
      merek: "",
      quantity: "",
      satuan: "",
      h_beli: "",
      h_jual: "",
      diskon: "",
    });
  };

  const filteredItems = barangList.filter(
    (item) =>
      item.produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.distributor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.merek.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    refreshToken();
    fetchBarang();
  }, []);

  return (
    <div>
      <Navbar nama={nama} status={status} fotoProfile={fotoProfile} logout={logout} />
      <div className="w-full p-6 bg-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Manajemen Barang</h2>
        <button onClick={handleTambahData} className="mb-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
          Tambah Data
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto text-sm">
            <input type="date" name="tglPembelian" value={formData.tglPembelian} onChange={(e) => setTglPembelian(e.target.value)} placeholder="Tgl Pembelian" className="w-full p-2 border rounded" />
            <input type="text" name="kodeBarang" value={formData.kodeBarang} readOnly placeholder="Kode Barang" className="w-full p-2 border rounded" />
            <input type="text" name="produk" value={formData.produk} onChange={handleChange} placeholder="Nama Barang" className="w-full p-2 border rounded" required readOnly={isReadOnly} />
            <input type="text" name="distributor" value={formData.distributor} onChange={handleChange} placeholder="Distributor" className="w-full p-2 border rounded" readOnly={isReadOnly} />
            <input type="text" name="merek" value={formData.merek} onChange={handleChange} placeholder="Merek" className="w-full p-2 border rounded" readOnly={isReadOnly} />
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Stok" className="w-full p-2 border rounded" required />
            <input type="text" name="satuan" value={formData.satuan} onChange={handleChange} placeholder="Satuan" className="w-full p-2 border rounded" required readOnly={isReadOnly} />
            <FormatRupiah value={formData.h_beli} onChange={(value) => setFormData({ ...formData, h_beli: value })} placeholder="Harga Modal" className="w-full p-2 border rounded" />
            <FormatRupiah value={formData.h_jual} onChange={(value) => setFormData({ ...formData, h_jual: value })} placeholder="Harga Jual" className="w-full p-2 border rounded" />
            <input type="number" name="diskon" value={formData.diskon} onChange={handleChange} placeholder="Diskon" className="w-full p-2 border rounded" required />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
              {loading ? "Menyimpan..." : editMode ? "Simpan Perubahan" : "Simpan Data"}
            </button>
            <button type="button" onClick={handleCloseForm} className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition mt-2">
              Tutup Form
            </button>
          </form>
        )}
        {notification && <div className={`mt-4 p-3 rounded-md text-white ${notification.success ? "bg-green-500" : "bg-red-500"}`}>{notification.message}</div>}
        <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Cari Produk" className="w-full p-2 mt-4 border rounded" />
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">No</th>
                <th className="border border-gray-300 p-2">Kode Barang</th>
                <th className="border border-gray-300 p-2">Nama Barang</th>
                <th className="border border-gray-300 p-2">Distributor</th>
                <th className="border border-gray-300 p-2">Merek</th>
                <th className="border border-gray-300 p-2">Stok</th>
                <th className="border border-gray-300 p-2">Satuan</th>
                <th className="border border-gray-300 p-2">H.Modal</th>
                <th className="border border-gray-300 p-2">H.Jual</th>
                <th className="border border-gray-300 p-2">Diskon (%)</th>
                <th className="border border-gray-300 p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="border border-gray-300 p-2">{item.kodeBarang}</td>
                  <td className="border border-gray-300 p-2">{item.produk}</td>
                  <td className="border border-gray-300 p-2">{item.distributor}</td>
                  <td className="border border-gray-300 p-2">{item.merek}</td>
                  <td className="border border-gray-300 p-2">{item.quantity}</td>
                  <td className="border border-gray-300 p-2">{item.satuan}</td>
                  <td className="border border-gray-300 p-2">{item.h_beli.toLocaleString("id-ID")}</td>
                  <td className="border border-gray-300 p-2">{item.h_jual.toLocaleString("id-ID")}</td>
                  <td className="border border-gray-300 p-2">{item.diskon}%</td>
                  <td className="border border-gray-300 p-2">
                    <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                      Edit
                    </button>
                    <button onClick={() => handlePlus(item)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">
                      Tambah
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-md mr-2">
            Prev
          </button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded-md ml-2">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
