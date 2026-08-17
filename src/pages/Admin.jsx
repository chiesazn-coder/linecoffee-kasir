import React, { useEffect, useState } from "react";
import { fetchMenu, updateMenuItemPrice, addMenuItem, addCategory, supabase } from "../lib/menuService";
import { SIZES } from "../data/menu";

export default function Admin() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [savingItem, setSavingItem] = useState(null);

  // State untuk Modal Custom
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "category" atau "item"
  const [inputValue, setInputValue] = useState("");

  // State untuk Custom Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, type }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchMenu();
      const sortedData = data.sort((a, b) => a.category.localeCompare(b.category));
      setMenu(sortedData);
      
      // Update selectedCategory jika sedang membuka folder agar data tetap sinkron
      if (selectedCategory) {
        const currentCat = sortedData.find(c => c.id === selectedCategory.id);
        if (currentCat) setSelectedCategory(currentCat);
      }
    } catch { alert("Gagal ambil data"); }
    finally { setLoading(false); }
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    try {
      if (modalType === "category") await addCategory(inputValue);
      else await addMenuItem(selectedCategory.id, inputValue, { "250": 0, "500": 0, "1000": 0 });
      setIsModalOpen(false);
      loadData();
    } catch { alert("Terjadi kesalahan."); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const table = deleteTarget.type === "category" ? "categories" : "menu_items";
      const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id);
      if (error) throw error;
      
      if (deleteTarget.type === "category" && selectedCategory?.id === deleteTarget.id) {
        setSelectedCategory(null);
      }
      
      setDeleteTarget(null);
      loadData();
    } catch { alert("Gagal menghapus."); }
  };

  // ✅ Perbaikan: Update harga menggunakan ITEM ID agar tidak bocor ke kategori lain
  async function handleSaveClick(itemId, currentPrices) {
    setSavingItem(itemId);
    try {
      await updateMenuItemPrice(itemId, currentPrices);
      setTimeout(() => setSavingItem(null), 800);
    } catch (err) { 
      console.error("Gagal menyimpan harga ke Firestore:", err);
      alert("Gagal menyimpan harga. Silakan coba lagi.");
      setSavingItem(null); 
    }
  }

  // ✅ Perbaikan: Filter berdasarkan itemId (ID Unik)
  const localPriceChange = (itemId, sizeKey, newValue) => {
    const val = newValue === "" ? "" : parseInt(newValue) || 0;
    
    // Update menu state global
    setMenu(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => 
        item.id === itemId ? { ...item, prices: { ...item.prices, [sizeKey]: val } } : item
      )
    })));

    // Update folder yang sedang dibuka
    setSelectedCategory(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, prices: { ...item.prices, [sizeKey]: val } } : item
      )
    }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-zinc-900"></div></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 pb-24 font-sans relative selection:bg-zinc-900 selection:text-white">
      
      {/* MODAL TAMBAH (KATEGORI/ITEM) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}></div>
          <form onSubmit={handleModalSubmit} className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">{modalType === "category" ? "Tambah Kategori" : "Tambah Produk"}</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">{modalType === "category" ? "Buat folder menu baru" : `Menambah ke ${selectedCategory.category}`}</p>
            <input autoFocus className="w-full bg-zinc-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-zinc-900 outline-none" placeholder={modalType === "category" ? "Contoh: BLUERICANO" : "Contoh: Klasik"} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-zinc-400 bg-zinc-50 active:scale-95 transition-all">Batal</button>
              <button type="submit" className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase bg-zinc-900 text-white active:scale-95 transition-all">Tambah</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DELETE CUSTOM */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setDeleteTarget(null)}></div>
          <div className="relative bg-white w-full max-w-xs rounded-[40px] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Hapus {deleteTarget.type === 'category' ? 'Kategori' : 'Menu'}?</h3>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8">Data <span className="text-zinc-900 font-bold">"{deleteTarget.name}"</span> akan hilang permanen.</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-100">Ya, Hapus Sekarang</button>
              <button onClick={() => setDeleteTarget(null)} className="w-full py-4 text-zinc-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Batalkan</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-40 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="w-10 h-10 flex items-center justify-center bg-zinc-50 rounded-full active:scale-90 transition-transform shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            )}
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">{selectedCategory ? selectedCategory.category : "Line Coffee"}</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Admin Portal</p>
            </div>
          </div>
          <button onClick={() => window.location.href = '/'} className="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full shadow-lg shadow-zinc-200"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></button>
        </div>
      </nav>

      <div className="max-w-xl mx-auto p-5">
        {!selectedCategory ? (
          <div className="grid grid-cols-1 gap-3">
            {menu.map((cat) => (
              <div key={cat.id} className="group relative bg-white rounded-[24px] border border-zinc-100 shadow-sm flex items-center justify-between overflow-hidden hover:border-zinc-300 transition-colors">
                <button onClick={() => setSelectedCategory(cat)} className="flex-1 p-6 flex items-center gap-4 text-left active:bg-zinc-50 transition-colors">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center font-black text-zinc-300 group-hover:text-zinc-900 transition-colors">{cat.category.charAt(0)}</div>
                  <div>
                    <h2 className="font-bold text-zinc-900 uppercase tracking-tight">{cat.category}</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{cat.items?.length || 0} Products</p>
                  </div>
                </button>
                <button onClick={() => setDeleteTarget({ id: cat.id, name: cat.category, type: 'category' })} className="p-6 text-zinc-200 hover:text-red-500 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
            <button onClick={() => { setModalType("category"); setInputValue(""); setIsModalOpen(true); }} className="mt-4 p-6 rounded-[24px] border-2 border-dashed border-zinc-200 flex items-center justify-center gap-3 text-zinc-400 active:scale-[0.98] transition-all uppercase text-[10px] font-black tracking-widest">+ New Menu</button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {selectedCategory.items?.sort((a,b) => a.name.localeCompare(b.name)).map((item) => (
              <div key={item.id} className="bg-white rounded-[28px] p-5 border border-zinc-100 shadow-sm space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDeleteTarget({ id: item.id, name: item.name, type: 'item' })} className="text-zinc-200 hover:text-red-500 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                    </button>
                    <h3 className="text-base font-black uppercase tracking-tight italic">{item.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleSaveClick(item.id, item.prices)} // ✅ Gunakan item.id
                    disabled={savingItem === item.id} 
                    className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${savingItem === item.id ? "bg-green-500 text-white" : "bg-zinc-900 text-white active:scale-90"}`}
                  >
                    {savingItem === item.id ? "Saved ✓" : "Update"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((size) => (
                    <div key={size.key} className="bg-zinc-50 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-zinc-900 transition-all">
                      <label className="block text-[8px] font-black text-zinc-400 uppercase mb-1 leading-none">{size.label}</label>
                      <div className="flex items-center text-sm font-black italic">
                        <span className="text-zinc-300 mr-1">Rp</span>
                        <input 
                          type="number" 
                          inputMode="numeric" 
                          value={item.prices[size.key] === "" ? "" : item.prices[size.key]} 
                          placeholder="0" 
                          onChange={(e) => localPriceChange(item.id, size.key, e.target.value)} // ✅ Gunakan item.id
                          className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => { setModalType("item"); setInputValue(""); setIsModalOpen(true); }} className="w-full py-5 rounded-[24px] bg-zinc-50 border-2 border-dashed border-zinc-200 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">+ Add Product</button>
          </div>
        )}
      </div>
    </div>
  );
}
