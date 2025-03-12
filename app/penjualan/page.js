"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../__component/navbar.js";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const Penjualan = () => {
  const [dataPembeli, setDataPembeli] = useState([]);
  const [searchPembeli, setSearchPembeli] = useState("");
  const [pembeli, setPembeli] = useState("");
  const [tglPembelian, setTglPembelian] = useState("");
  const [member, setMember] = useState(false);
  const [noMember, setNoMember] = useState("");
  const [kodeBarang, setKodeBarang] = useState("");
  const [noPenjualan, setNoPenjualan] = useState("");
  const [tglPenjualan, setTglPenjualan] = useState("");
  const [idBarang, setIdBarang] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [distributor, setDistributor] = useState("");
  const [merek, setMerek] = useState("");
  const [h_jual, setHargajual] = useState(0);
  const [h_beli, setHargabeli] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [qtyMaks, setQtyMaks] = useState(1);
  const [rincian, setRincian] = useState([]);
  const [diskon, setDiskon] = useState(0);
  const [barang, setBarang] = useState([]);
  const [searchBarang, setSearchBarang] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(true);
  // notifikasi
  const [tambahSuccess, setTambahSuccess] = useState(false);
  const [tambahError, setTambahError] = useState(false);
  const [bayarSuccess, setBayarSuccess] = useState(false);
  const [bayarError, setBayarError] = useState(false);
  // token
  const [id, setId] = useState("");
  const [fotoProfile, setFotoProfile] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const [page, setPage] = useState(1);
  const limit = 5; // ⬅️ Batasi hanya 5 item per halaman
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / limit);

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

  const fetchBarang = async () => {
    try {
      const response = await axios.get("http://localhost:5500/penjualan/search", {
        params: { keySearch: searchBarang, page, limit },
      });

      setBarang(response.data.brg);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Gagal mencari data barang:", error);
    }
  };

  const handleSearchBarang = async (e) => {
    const searchValue = e.target.value;
    setSearchBarang(searchValue);
    try {
      const response = await axios.get(`http://localhost:5500/penjualan/search`, {
        params: { keySearch: searchValue, page: page }, // Kirim sebagai queri
      });
      setBarang(response.data.brg);
      setTotalCount(response.data.totalCount);
      setSearchBarang(e.target.value);
      setPage(1); // Reset ke halaman pertama saat mencari ulang
    } catch (error) {
      console.log("Gagal mencari data barang:", error);
    }
  };

  const handleSelectBarang = (barang) => {
    setIdBarang(barang.id);
    setTglPembelian(barang.tglPembelian);
    setQtyMaks(barang.quantity);
    setKodeBarang(barang.kodeBarang);
    setNamaBarang(barang.produk);
    setDistributor(barang.distributor);
    setMerek(barang.merek);
    setHargabeli(barang.h_beli);
    setHargajual(barang.h_jual || 0);
    setDiskon(barang.diskon || 0);
    setBarang([]); // mengkosongkan data setelah select diklik
    setSearchBarang(barang.produk);
    setIsReadOnly(false);
  };

  const handleSearchPembeli = async (e) => {
    const searchValue = e.target.value;
    setSearchPembeli(searchValue);
    try {
      const response = await axios.get(`http://localhost:5500/members/search`, {
        params: { keySearch: searchValue }, // Kirim sebagai queri
      });
      setDataPembeli(response.data);
    } catch (error) {
      console.log("Gagal mencari data member:", error.message);
    }
  };

  const handleSelectPembeli = (p) => {
    setPembeli(p.pembeli);
    setNoMember(p.noMember);
    if (p.pembeli !== "") {
      setMember(true);
    }
    setDataPembeli([]); // mengkosongkan data setelah select diklik
    setSearchPembeli(p.pembeli);
  };

  const handleQuantity = (e) => {
    let cekQty = e.target.valueAsNumber;
    if (cekQty > qtyMaks) {
      alert(`Quantity Tidak bisa melebihi Stok, stok ada ${qtyMaks}`);
      setQuantity(qtyMaks);
    } else {
      setQuantity(e.target.valueAsNumber || 1);
    }
  };

  // Tambah barang ke Rincian penjualan
  const handleSubmit = async (e) => {
    e.preventDefault();
    // cek apakah nama Barang di klik dari list
    if (idBarang === "") {
      setSearchBarang("");
      setBarang([]);
      setSearchPembeli("");
      setPembeli("");
      setNamaBarang("");
      setTambahError(true);
      setTimeout(() => {
        setTambahError(false);
      }, 2000);
      return;
    }
    // Cari Total Harga
    const tarifDiskon = diskon / 100;
    const syaratDiskon = 3;
    const hargaNormal = quantity * h_jual;
    const nilaiDiskon = hargaNormal * tarifDiskon;
    let hargaBersih = 0;
    if (!member) {
      if (quantity >= syaratDiskon) {
        hargaBersih = hargaNormal - nilaiDiskon;
      } else {
        hargaBersih = hargaNormal;
      }
    } else {
      hargaBersih = hargaNormal - nilaiDiskon;
    }
    // Cari Potongan Diskon
    const rawPotDiskon = hargaNormal - hargaBersih;
    // Rincian Penjualan
    let newRincian = [...rincian];
    let data = {
      id: idBarang,
      nama,
      pembeli,
      tglPembelian,
      noMember,
      kodeBarang,
      noPenjualan,
      tglPenjualan,
      namaBarang,
      distributor,
      merek,
      h_beli,
      h_jual,
      totHarga: hargaBersih,
      quantity,
      diskon,
      potDiskon: rawPotDiskon,
    };
    let existingData = newRincian.find((item) => item.id === data.id);
    if (existingData) {
      // Jika objek dengan id yang sama sudah ada, timpa nilainya
      existingData.nama = data.nama;
      existingData.pembeli = data.pembeli;
      existingData.tglPembelian = data.tglPembelian;
      existingData.noMember = data.noMember;
      existingData.noPenjualan = data.noPenjualan;
      existingData.tglPenjualan = data.tglPenjualan;
      existingData.id = data.id;
      existingData.namaBarang = data.namaBarang;
      existingData.distributor = data.distributor;
      existingData.merek = data.merek;
      existingData.quantity = data.quantity;
      existingData.diskon = data.diskon;
      existingData.potDiskon = data.potDiskon;
      existingData.h_beli = data.h_beli;
      existingData.h_jual = data.h_jual;
      existingData.totHarga = data.totHarga;
    } else {
      // Jika objek dengan id yang sama tidak ada, tambahkan objek baru ke array
      newRincian.push(data);
    }
    try {
      setTambahSuccess(true);
      setTimeout(() => {
        setTambahSuccess(false);
      }, 2000);
      setRincian(newRincian);
      // setTotal(total + data.harga * data.quantity);
      setTglPembelian("");
      setKodeBarang("");
      setNamaBarang("");
      setSearchBarang("");
      setDistributor("");
      setMerek("");
      setHargajual(0);
      setQuantity(1);
      setDiskon(0);
    } catch (error) {
      setTambahError(true);
      setTimeout(() => {
        setTambahError(false);
      }, 2000);
    }
  };

  const handleBayar = async () => {
    try {
      if (rincian.length === 0) {
        alert("Tidak ada barang untuk diproses.");
        return;
      }
      // Update stok barang dengan PUT request
      const updatePromises = rincian.map((item) =>
        axios
          .put(`http://localhost:5500/produks/${item.id}`, {
            quantity: item.quantity,
          })
          .catch((error) => console.error(`Gagal update stok: ${item.kodeBarang}`, error))
      );
      // Simpan data penjualan dengan POST request
      const insertPromises = rincian.map((item) => {
        const data = {
          id: item.id,
          nama: item.nama,
          pembeli: item.pembeli,
          tglPembelian: item.tglPembelian,
          noMember: item.noMember,
          kodeBarang: item.kodeBarang,
          noPenjualan: item.noPenjualan,
          tglPenjualan: item.tglPenjualan,
          namaBarang: item.namaBarang,
          distributor: item.distributor,
          merek: item.merek,
          h_beli: item.h_beli,
          h_jual: item.h_jual,
          totHarga: item.totHarga,
          quantity: item.quantity,
          diskon: item.diskon,
          potDiskon: item.potDiskon,
        };
        return axios
          .post("http://localhost:5500/penjualan", data, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .catch((error) => console.error(`Gagal menyimpan data penjualan: ${item.kodeBarang}`, error));
      });

      // Tunggu semua request selesai
      await Promise.all([...updatePromises, ...insertPromises]);

      // Notifikasi berhasil
      setBayarSuccess(true);
      setTimeout(() => setBayarSuccess(false), 2000);

      // Reset state setelah pembayaran berhasil
      setSearchPembeli("");
      setSearchBarang("");
      setPembeli("");
      setRincian([]);
      // setTotal(0);

      // Generate noPenjualan baru
      setNoPenjualan(`PJ-${uuidv4().substring(0, 8)}`);
    } catch (error) {
      console.error("Terjadi kesalahan saat proses pembayaran:", error);

      // Tampilkan error kepada pengguna
      setBayarError(true);
      setTimeout(() => setBayarError(false), 2000);
    }
  };

  const handleRemove = (index) => {
    const newRincian = [...rincian];
    const removedItem = newRincian.splice(index, 1)[0];
    setRincian(newRincian);
    // setTotal(total - removedItem.harga * removedItem.quantity);
  };

  const handleBatal = () => {
    setSearchBarang("");
    setRincian([]);
    setKodeBarang("");
    setNamaBarang("");
    setSearchBarang("");
    setMerek("");
    setHargajual(0);
    setQuantity(1);
    setDiskon(0);
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

  const formatTgl = (tglpjl) => {
    let [year, month, day] = tglpjl.split("-"); // Pisahkan menjadi [2025, 02, 21]
    let formattedDate = `${day}/${month}/${year}`; // Gabungkan ke DD/MM/YYYY
    return formattedDate;
  };

  const formatRupiah = (angka) => {
    return angka?.toLocaleString("id-ID") || "Rp 0";
  };

  useEffect(() => {
    refreshToken();
    const today = new Date().toISOString().split("T")[0];
    setTglPenjualan(today);

    const noPenjualan = `PJ-${uuidv4().substring(0, 8)}`;
    setNoPenjualan(noPenjualan);
  }, []);

  // ✅ Gunakan useEffect agar data berubah saat `page` berubah
  useEffect(() => {
    fetchBarang();
  }, [page]); // Tambahkan `page` sebagai dependensi

  return (
    <div>
      <Navbar nama={nama} status={status} fotoProfile={fotoProfile} logout={logout} />
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 text-sm">
        <h2 className="text-2xl font-bold mb-4">Penjualan</h2>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {/* No Penjualan */}
          <input type="hidden" value={noPenjualan} />
          {/* Tanggal Penjualan */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Tanggal Penjualan</label>
            <input className="border rounded w-full py-2 px-3" type="date" value={tglPenjualan} onChange={(e) => setTglPenjualan(e.target.value)} />
          </div>
          {/* Kode Barang */}
          <input type="hidden" value={kodeBarang} />
          <input type="hidden" value={tglPembelian} />
          {/* Pilih Barang */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Nama Barang</label>
            <input type="search" value={searchBarang} onChange={handleSearchBarang} placeholder="Cari nama barang" className="border rounded w-full py-2 px-3" required />
            {barang.length > 0 && (
              <div>
                <ul>
                  {barang.map((b) => (
                    <li key={b.id}>
                      <span className="cursor-pointer" onClick={() => handleSelectBarang(b)}>
                        {b.produk}--{b.distributor}--{b.merek}--{b.satuan}--{b.h_jual}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between">
                  <button className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                    Sebelumnya
                  </button>
                  <span>
                    Halaman {page} dari {totalPages}
                  </span>
                  <button className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50" onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))} disabled={page >= totalPages}>
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Merek */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Merek</label>
            <input className="border rounded w-full py-2 px-3" type="text" value={merek} readOnly required />
          </div>
          {/* Harga */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Harga</label>
            <input className="border rounded w-full py-2 px-3" type="text" value={formatRupiah(h_jual)} readOnly required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Diskon</label>
            <input className="border rounded w-full py-2 px-3" type="text" value={diskon} readOnly required />
          </div>
          {/* Quantity */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="number"
              value={quantity}
              min="1"
              onChange={handleQuantity}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && quantity === 1) {
                  setQuantity("");
                }
              }}
              readOnly={isReadOnly}
              required
            />
          </div>
          {/* Pilih Barang */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Pembeli</label>
            <input type="search" value={searchPembeli || ""} onChange={handleSearchPembeli} placeholder="Cari Pembeli" className="border rounded w-full py-2 px-3" />
            {dataPembeli.length > 0 && (
              <ul>
                {dataPembeli.map((p, index) => (
                  <li key={index}>
                    <span className="cursor-pointer" onClick={() => handleSelectPembeli(p)}>
                      {p.pembeli}--{p.noMember}--{p.alamat}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input value={noMember} type="hidden" onChange={handleSearchBarang} />
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
            Tambah
          </button>{" "}
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 sm:mx-2 rounded" onClick={handleBatal} type="button">
            Hapus Semua Rician
          </button>
        </form>
        {/* Rincian Penjualan */}
        <h5 className="text-2xl font-bold mb-4">Rincian Penjualan</h5>
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Kode Barang</th>
              <th className="px-4 py-2">Tgl. Penjualan</th>
              <th className="px-4 py-2">Nama Barang</th>
              <th className="px-4 py-2">Distributor</th>
              <th className="px-4 py-2">Merek</th>
              <th className="px-4 py-2">Harga</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">diskon (%)</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rincian.map(
              (item, index) =>
                index == 0 && (
                  <tr key={index}>
                    <td colSpan={8} className="px-4 py-2">
                      {`Kode Penjualan : ${item.noPenjualan}`}
                    </td>
                  </tr>
                )
            )}
            {rincian.map(
              (item, index) =>
                index == 0 && (
                  <tr key={index}>
                    <td colSpan={8} className="px-4 py-2">
                      {`Pembeli : ${item.pembeli}`}
                    </td>
                  </tr>
                )
            )}
            {rincian.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{item.kodeBarang}</td>
                <td className="px-4 py-2">{formatTgl(item.tglPenjualan)}</td>
                <td className="px-4 py-2">{item.namaBarang}</td>
                <td className="px-4 py-2">{item.distributor}</td>
                <td className="px-4 py-2">{item.merek}</td>
                <td className="px-4 py-2">Rp.{formatRupiah(item.h_jual)}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{item.pembeli !== "" || item.quantity >= 3 ? item.diskon + "%" : ""}</td>
                <td className="px-4 py-2">Rp.{formatRupiah(item.totHarga)}</td>
                <td>
                  <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => handleRemove(index)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rincian.length > 0 && (
          <>
            <div className="text-right mr-24">
              <h2 className="text-sm font-bold">Grand Total</h2>
              <p className="text-sm mt-2">Rp.{formatRupiah(rincian.reduce((acc, curr) => acc + curr.totHarga, 0))}</p>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm mt-2" onClick={handleBayar}>
                Bayar
              </button>
            </div>
          </>
        )}

        {tambahSuccess && (
          <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">Tambah berhasil!</span>
          </div>
        )}
        {tambahError && (
          <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">Tambah gagal!</span>
          </div>
        )}
        {bayarSuccess && (
          <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">Bayar berhasil!</span>
          </div>
        )}
        {bayarError && (
          <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">Bayar gagal!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Penjualan;
