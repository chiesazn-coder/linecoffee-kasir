import { useState } from "react";
import { supabase } from "../lib/supabase"; // Jalur ke supabase.js kamu
import { db } from "../lib/firebase"; // Jalur ke firebase.js kamu
import { doc, writeBatch } from "firebase/firestore";

export default function Migrate() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const jalankanMigrasiKategori = async () => {
    setLoading(true);
    setStatus("Sedang mengambil data KATEGORI dari Supabase...");

    try {
      // 1. Ambil data dari tabel categories Supabase
      const { data: categoriesData, error: dbError } = await supabase
        .from("categories")
        .select("*");

      if (dbError) throw dbError;

      setStatus(`Menemukan ${categoriesData.length} kategori. Menyiapkan paket batch Firebase...`);

      const batch = writeBatch(db);

      // 2. Masukkan semua data kategori ke dalam antrean batch Firestore
      categoriesData.forEach((cat) => {
        const docRef = doc(db, "categories", cat.id.toString());
        batch.set(docRef, {
          name: cat.name,
          display_order: cat.display_order || 0 // Disertakan display_order agar urutan menu tidak acak-acakan
        });
      });

      setStatus("Mengirim data kategori ke Firebase Firestore...");

      // 3. Eksekusi kirim batch sekaligus (1 kali request)
      await batch.commit();

      setStatus(`Migrasi Sukses Total! Semua ${categoriesData.length} kategori berhasil dipindahkan.`);
    } catch (error) {
      console.error(error);
      setStatus(`Migrasi Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 text-white bg-zinc-900 min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-zinc-800 p-8 rounded-3xl border border-zinc-700 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Migrasi Kategori</h1>
        <p className="text-zinc-400 text-sm mb-6">Langkah terakhir: Pindahkan data kategori ke Firebase Firestore.</p>
        
        <button 
          onClick={jalankanMigrasiKategori}
          disabled={loading}
          className="w-full px-6 py-4 bg-amber-600 rounded-xl font-bold hover:bg-amber-700 disabled:bg-zinc-600 transition-all text-white"
        >
          {loading ? "Memproses..." : "Mulai Migrasi Kategori"}
        </button>
        
        {status && (
          <div className="mt-6 p-4 bg-zinc-900 rounded-xl border border-zinc-700 text-xs font-mono text-left text-amber-400 break-words">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}