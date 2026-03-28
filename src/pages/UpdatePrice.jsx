import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const DATA_BARU = [
  { category: "ITEMICANO", items: [
    { name: "original", prices: { "250": 12000, "500": 23000, "1000": 45000 } },
    { name: "klasik", prices: { "250": 14000, "500": 26000, "1000": 50000 } },
    { name: "bold", prices: { "250": 15000, "500": 28000, "1000": 55000 } }
  ]},
  { category: "BLUERICANO", items: [
    { name: "klasik", prices: { "250": 16000, "500": 30000, "1000": 55000 } },
    { name: "bold", prices: { "250": 17000, "500": 32000, "1000": 60000 } }
  ]},
  { category: "C'MONG", items: [
    { name: "klasik", prices: { "250": 17000, "500": 32000, "1000": 60000 } },
    { name: "bold", prices: { "250": 18000, "500": 34000, "1000": 65000 } }
  ]},
  { category: "ES BONBON", items: [
    { name: "light", prices: { "250": 15000, "500": 28000, "1000": 55000 } },
    { name: "klasik", prices: { "250": 16000, "500": 31000, "1000": 60000 } },
    { name: "creamy", prices: { "250": 17000, "500": 33000, "1000": 65000 } },
    { name: "premium", prices: { "250": 20000, "500": 38000, "1000": 70000 } }
  ]},
  { category: "ENDOLITA", items: [
    { name: "light", prices: { "250": 16000, "500": 30000, "1000": 58000 } },
    { name: "klasik", prices: { "250": 18000, "500": 35000, "1000": 65000 } },
    { name: "creamy", prices: { "250": 20000, "500": 38000, "1000": 70000 } },
    { name: "premium", prices: { "250": 23000, "500": 45000, "1000": 80000 } }
  ]},
  { category: "CARETO", items: [
    { name: "klasik", prices: { "250": 22000, "500": 40000, "1000": 75000 } },
    { name: "creamy", prices: { "250": 23000, "500": 45000, "1000": 80000 } },
    { name: "premium", prices: { "250": 25000, "500": 50000, "1000": 90000 } }
  ]},
  { category: "CHOCOFFEE", items: [
    { name: "klasik", prices: { "250": 22000, "500": 40000, "1000": 75000 } },
    { name: "premium", prices: { "250": 25000, "500": 48000, "1000": 90000 } }
  ]},
  { category: "ORIGINAL LATTE", items: [
    { name: "klasik", prices: { "250": 18000, "500": 35000, "1000": 65000 } },
    { name: "premium", prices: { "250": 22000, "500": 40000, "1000": 75000 } }
  ]},
  { category: "TARAMATCHA", items: [
    { name: "klasik", prices: { "250": 18000, "500": 35000, "1000": 65000 } },
    { name: "bold", prices: { "250": 19000, "500": 37000, "1000": 70000 } }
  ]},
  { category: "BARIMATCHA", items: [
    { name: "klasik", prices: { "250": 19000, "500": 37000, "1000": 70000 } },
    { name: "bold", prices: { "250": 20000, "500": 38000, "1000": 75000 } }
  ]},
  { category: "CHOCOLINE", items: [
    { name: "klasik", prices: { "250": 20000, "500": 38000, "1000": 70000 } },
    { name: "premium", prices: { "250": 22000, "500": 40000, "1000": 75000 } }
  ]},
  { category: "EXTRA", items: [
    { name: "extra shot", prices: { "250": 1500, "500": 1500, "1000": 1500 } },
    { name: "extra sugar", prices: { "250": 1000, "500": 1000, "1000": 1000 } }
  ]}
];

export default function UpdatePrice() {
  const [log, setLog] = useState([]);

  const runUpdate = async () => {
    setLog(["Memulai sinkronisasi harga baru..."]);
    try {
      for (const cat of DATA_BARU) {
        // 1. Pastikan Kategori ada (Upsert)
        const { data: catData } = await supabase
          .from('categories').upsert({ name: cat.category }, { onConflict: 'name' }).select().single();

        for (const item of cat.items) {
          // 2. Update harga jika nama sama, atau insert jika belum ada
          await supabase.from('menu_items').upsert({
            category_id: catData.id,
            name: item.name,
            prices: item.prices
          }, { onConflict: 'category_id, name' }); // Pastikan ada unique constraint di DB
        }
        setLog(prev => [...prev, `✅ Kategori ${cat.category} Terupdate`]);
      }
      setLog(prev => [...prev, "✨ SEMUA HARGA BERHASIL DISINKRONKAN!"]);
    } catch (e) {
      setLog(prev => [...prev, `❌ ERROR: ${e.message}`]);
    }
  };

  return (
    <div className="p-10 font-mono text-xs">
      <button onClick={runUpdate} className="bg-black text-white px-6 py-3 rounded-xl mb-4">GAS UPDATE HARGA BARU</button>
      <div className="bg-zinc-100 p-4 rounded-xl space-y-1">
        {log.map((line, i) => <div key={i}>{line}</div>)}
      </div>
    </div>
  );
}