import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MENU } from '../data/menu';

export default function Migrate() {
  const [status, setStatus] = useState("Siap memindahkan data...");

  const startMigration = async () => {
    setStatus("Sedang memproses...");
    try {
      for (const cat of MENU) {
        // 1. Masukkan/Dapatkan Kategori
        const { data: categoryData, error: catError } = await supabase
          .from('categories')
          .upsert({ name: cat.category }, { onConflict: 'name' })
          .select()
          .single();

        if (catError) throw catError;

        // 2. Masukkan Item untuk kategori tersebut
        const itemsToInsert = cat.items.map(item => ({
          category_id: categoryData.id,
          name: item.name,
          prices: item.prices
        }));

        const { error: itemError } = await supabase
          .from('menu_items')
          .insert(itemsToInsert);

        if (itemError) throw itemError;
        setStatus(`Berhasil memproses kategori: ${cat.category}`);
      }
      setStatus("Selesai! Semua data menu sudah pindah ke Supabase.");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Migrasi Data Menu</h1>
      <p className="mb-6 bg-zinc-100 p-4 rounded">{status}</p>
      <button 
        onClick={startMigration}
        className="bg-zinc-900 text-white px-6 py-2 rounded-xl"
      >
        Mulai Pindahkan Data ke Supabase
      </button>
    </div>
  );
}