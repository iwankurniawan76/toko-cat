"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../__component/navbar.js";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const SalesReport = () => {
  const [notification, setNotification] = useState(null);
  const [users, setUsers] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
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
      router.push("/");
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

  useEffect(() => {
    if (startDate && endDate) {
      const getPenjualan = async () => {
        try {
          const response = await axios.get(`http://localhost:5500/penjualan/${startDate}/${endDate}`);
          let barang = response.data;
          setFilteredData(
            barang.map((item) => ({
              ...item,
              keuntungan: item.totHarga - item.h_beli * item.quantity,
            }))
          );
        } catch (error) {
          console.log("Gagal mencari data member:", error.message);
        }
      };

      getPenjualan();
    }
  }, [startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (angka) => {
    return angka?.toLocaleString("id-ID") || "Rp 0";
  };

  return (
    <div>
      <Navbar nama={nama} status={status} fotoProfile={fotoProfile} logout={logout} />
      <div className="p-5 max-w-4xl mx-auto text-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Laporan Penjualan Barang</h2>
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-2">
          <label className="font-semibold">Dari Tanggal:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded w-full sm:w-auto" />
          <label className="font-semibold">Sampai Tanggal:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded w-full sm:w-auto" />
        </div>

        {filteredData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border mt-4 text-sm">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border p-2">No</th>
                  <th className="border p-2">Nama Barang</th>
                  <th className="border p-2">Distributor</th>
                  {/* <th className="border p-2">Merek</th> */}
                  <th className="border p-2">Member</th>
                  <th className="border p-2">quantity</th>
                  <th className="border p-2">Harga Beli</th>
                  <th className="border p-2">Harga Jual</th>
                  <th className="border p-2">Diskon (%)</th>
                  <th className="border p-2">jumlah</th>
                  <th className="border p-2">Keuntungan</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{item.namaBarang}</td>
                    <td className="border p-2">{item.distributor}</td>
                    {/* <td className="border p-2">{item.merek}</td> */}
                    <td className="border p-2">{item.pembeli}</td>
                    <td className="border p-2">{item.quantity}</td>
                    <td className="border p-2">Rp {item.h_beli.toLocaleString()}</td>
                    <td className="border p-2">Rp {item.h_jual.toLocaleString()}</td>
                    <td className="border p-2 text-center">{item.pembeli !== "" || item.quantity >= 3 ? item.diskon + "%" : ""}</td>
                    <td className="border p-2">Rp {item.totHarga.toLocaleString()}</td>
                    <td className="border p-2">Rp {item.keuntungan.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredData.length > 0 && (
                  <tr className="hover:bg-gray-100">
                    <td colSpan={8} className="border p-2">
                      Total Penjualan
                    </td>
                    <td className="border p-2">Rp.{formatRupiah(filteredData.reduce((acc, curr) => acc + curr.totHarga, 0))}</td>
                    <td></td>
                  </tr>
                )}
                {filteredData.length > 0 && (
                  <tr className="hover:bg-gray-100">
                    <td colSpan={9} className="border p-2">
                      Total Keuntungan
                    </td>
                    <td className="border p-2">Rp.{formatRupiah(filteredData.reduce((acc, curr) => acc + curr.keuntungan, 0))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {filteredData.length > 0 && (
          <button onClick={handlePrint} className="no-print mt-4 p-2 bg-blue-500 text-white rounded w-full sm:w-auto">
            Cetak Laporan
          </button>
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
    </div>
  );
};

export default SalesReport;
