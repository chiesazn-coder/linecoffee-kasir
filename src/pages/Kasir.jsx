import { Link } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SIZES, rupiah } from "../data/menu";
import html2canvas from "html2canvas";
import { createOrder, getNextQueueNo } from "../lib/orderStore";
import { fetchMenu } from "../lib/menuService";

const ReceiptPreview = React.forwardRef(function ReceiptPreview({ sale, rupiah }, ref) {
  if (!sale) return null;
  const dateText = new Date(sale.createdAt).toLocaleString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const method = sale.paymentMethod === "cash" ? "CASH" : sale.paymentMethod === "qris" ? "QRIS" : "TRANSFER";

  return (
    <div ref={ref} className="mx-auto w-[320px] rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200">
      <div className="text-center">
        <div className="text-base font-extrabold tracking-tight">L!ne Coffee</div>
        <div className="mt-0.5 text-[11px] text-zinc-600 italic">{dateText}</div>
      </div>
      <div className="my-3 border-t border-dashed border-zinc-300" />
      <div className="space-y-2">
        {sale.items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold uppercase italic">{it.product} ({it.size}ml)</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                {it.variant} | Ice: {it.ice} | Sug: {it.sugar}
              </div>
              <div className="text-[11px] text-zinc-600">{it.qty} x Rp {rupiah(it.price)}</div>
            </div>
            <div className="shrink-0 text-sm font-black">Rp {rupiah(it.price * it.qty)}</div>
          </div>
        ))}
      </div>
      <div className="my-3 border-t border-dashed border-zinc-300" />
      <div className="space-y-1 text-sm font-bold">
        <div className="flex justify-between"><span>Total</span><span>Rp {rupiah(sale.total)}</span></div>
        <div className="flex justify-between text-zinc-500 font-medium"><span>Metode</span><span>{method}</span></div>
      </div>
      <div className="my-3 border-t border-dashed border-zinc-300" />
      <div className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-zinc-600">Terima kasih 🙏</div>
    </div>
  );
});

const ReceiptForExport = React.forwardRef(function ReceiptForExport({ sale, rupiah }, ref) {
  if (!sale) return null;
  return (
    <div ref={ref} style={{ width: 320, background: "#fff", padding: 20, fontFamily: "monospace" }}>
      <div style={{ textAlign: "center", fontWeight: "bold" }}>L!ne Coffee</div>
      <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
      {sale.items.map(it => (
        <div key={it.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <div style={{ fontSize: 12 }}>{it.product} - {it.variant} ({it.size}ml)<br/>{it.qty}x{rupiah(it.price)}</div>
          <div style={{ fontSize: 12 }}>{rupiah(it.price * it.qty)}</div>
        </div>
      ))}
      <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
        <span>TOTAL</span><span>Rp {rupiah(sale.total)}</span>
      </div>
    </div>
  );
});

export default function Kasir() {
  const [liveMenu, setLiveMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedSize, setSelectedSize] = useState("250");
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cash, setCash] = useState("");
  const [lastSale, setLastSale] = useState(null);
  const receiptExportRef = useRef(null);
  const [customerName, setCustomerName] = useState("");
  useEffect(() => {
    async function getMenu() {
      try {
        const data = await fetchMenu();
        setLiveMenu(data.sort((a, b) => a.category.localeCompare(b.category)));
      } catch (e) { console.error(e); } finally { setLoadingMenu(false); }
    }
    getMenu();
  }, []);

  const total = useMemo(() => cart.reduce((sum, it) => sum + it.price * it.qty, 0), [cart]);

  // ✅ LOGIKA UPDATE ITEM DENGAN ATURAN EXTRA CHARGE
  function updateCartItem(id, patch) {
    setCart((prev) => prev.map((it) => {
      if (it.id !== id) return it;
      const updatedItem = { ...it, ...patch };
      
      // Ambil Harga Dasar (Reset ke harga awal sebelum ditambah extra)
      const category = liveMenu.find(c => c.category === it.product);
      const menuItem = category?.items.find(i => i.name === it.variant);
      let basePrice = menuItem?.prices[it.size] || 0;

      // Hitung Multiplier (per 250ml)
      const factor = parseInt(it.size) / 250;

      // Aturan 1: Extra Shot (Ice Extra) +1.5k / 250ml
      if (updatedItem.ice === "extra") basePrice += (1500 * factor);
      // Aturan 2: Extra Sugar +1k / 250ml
      if (updatedItem.sugar === "extra") basePrice += (1000 * factor);

      return { ...updatedItem, price: basePrice };
    }));
  }

  function addToCart(category, item) {
    const id = `${category}-${item.name}-${selectedSize}-${Date.now()}`; // ID Unik agar bisa custom per cup
    const price = item.prices[selectedSize];
    setCart(prev => [...prev, {
      id, product: category, variant: item.name, size: selectedSize,
      price, qty: 1, ice: "normal", sugar: "normal"
    }]);
  }

  const paid = useMemo(() => paymentMethod !== "cash" ? total : (Number(String(cash).replace(/[^\d]/g, "")) || 0), [cash, paymentMethod, total]);
  const change = paid - total;

  function saveSale() {
    if (cart.length === 0 || (paymentMethod === "cash" && paid < total)) return;
    const sale = { id: `S-${Date.now()}`, createdAt: new Date().toISOString(), paymentMethod, items: cart, total, paid, change: Math.max(0, change) };
    setLastSale(sale);
    createOrder({
      id: `O-${Date.now()}`, queueNo: getNextQueueNo(), customerName: customerName || "-",
      createdAt: sale.createdAt, status: "new",
      items: cart.map(it => ({ ...it }))
    });
    setCart([]); setCash(""); setCustomerName(""); setIsCheckoutOpen(false);
  }

  async function downloadReceiptPNG() {
    const canvas = await html2canvas(receiptExportRef.current, { scale: 3 });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `Struk-${lastSale.id}.png`;
    a.click();
  }

  if (loadingMenu) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-zinc-400">Syncing...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans pb-20">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Line Coffee <span className="text-zinc-300">Kasir</span></h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 italic">Point of Sale System</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-zinc-100">
            {SIZES.map(s => (
              <button key={s.key} onClick={() => setSelectedSize(s.key)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedSize === s.key ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-900"}`}>{s.label}</button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MENU KATALOG */}
          <section className="lg:col-span-2 space-y-8 bg-white p-6 md:p-8 rounded-[40px] border border-zinc-100 shadow-sm">
            {liveMenu.map(group => (
              <div key={group.category}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-4 border-b border-zinc-50 pb-2">{group.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.items.sort((a,b)=>a.name.localeCompare(b.name)).map(it => (
                    <button key={it.id} onClick={() => addToCart(group.category, it)} className="group bg-zinc-50 hover:bg-white hover:border-zinc-900 border border-transparent p-5 rounded-[28px] text-left transition-all active:scale-95">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-black italic uppercase tracking-tight text-zinc-900">{it.name}</div>
                          <div className="text-[11px] font-bold text-zinc-400 mt-1">Rp {rupiah(it.prices[selectedSize] || 0)}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14M5 12h14"/></svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* KERANJANG BELANJA */}
          <aside className="space-y-4">
            <div className="bg-white p-6 rounded-[40px] border border-zinc-100 shadow-sm sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black italic uppercase tracking-tighter">Keranjang</h2>
                <button onClick={() => setCart([])} className="text-[9px] font-bold text-zinc-300 uppercase hover:text-red-500">Reset</button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="py-10 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">Belum ada pesanan</div>
                ) : (
                  cart.map(it => (
                    <div key={it.id} className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-[11px] font-black uppercase italic tracking-tight">{it.product} <span className="text-zinc-400 font-normal">({it.size}ml)</span></div>
                          <div className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5">{it.variant}</div>
                        </div>
                        <button onClick={() => setCart(c => c.filter(x => x.id !== it.id))} className="text-zinc-200 hover:text-red-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                      </div>

                      {/* OPTIONS CUSTOMIZATION */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <select value={it.ice} onChange={(e) => updateCartItem(it.id, { ice: e.target.value })} className="text-[9px] font-black uppercase p-2 rounded-xl bg-white border-none focus:ring-1 focus:ring-zinc-900 transition-all">
                          <option value="less">Less Ice</option>
                          <option value="normal">Normal Ice</option>
                          <option value="extra">Extra Shot (+{rupiah((parseInt(it.size)/250)*1500)})</option>
                        </select>
                        <select value={it.sugar} onChange={(e) => updateCartItem(it.id, { sugar: e.target.value })} className="text-[9px] font-black uppercase p-2 rounded-xl bg-white border-none focus:ring-1 focus:ring-zinc-900 transition-all">
                          <option value="less">Less Sugar</option>
                          <option value="normal">Normal Sugar</option>
                          <option value="extra">Extra Sugar (+{rupiah((parseInt(it.size)/250)*1000)})</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateCartItem(it.id, { qty: Math.max(1, it.qty - 1) })} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black shadow-sm">-</button>
                          <span className="text-xs font-black">{it.qty}</span>
                          <button onClick={() => updateCartItem(it.id, { qty: it.qty + 1 })} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black shadow-sm">+</button>
                        </div>
                        <div className="text-xs font-black italic">Rp {rupiah(it.price * it.qty)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest tracking-widest">Grand Total</span>
                  <span className="text-xl font-black italic">Rp {rupiah(total)}</span>
                </div>
                <button disabled={cart.length === 0} onClick={() => setIsCheckoutOpen(true)} className="w-full py-5 bg-zinc-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 active:scale-95 disabled:opacity-20 transition-all">Checkout</button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL CHECKOUT */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Payment Details</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-8">
              {["cash", "qris", "transfer"].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === m ? "bg-zinc-900 text-white shadow-xl" : "bg-zinc-50 text-zinc-400"}`}>{m}</button>
              ))}
            </div>

            {paymentMethod === "cash" && (
              <input value={cash} onChange={(e) => setCash(e.target.value)} inputMode="numeric" placeholder="Nominal Uang..." className="w-full py-4 px-6 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all mb-4" />
            )}

            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Atas Nama Pelanggan..." className="w-full py-4 px-6 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all mb-8" />

            <div className="bg-zinc-900 rounded-3xl p-6 text-white mb-8">
              <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase mb-1"><span>Bill</span><span>Kembalian</span></div>
              <div className="flex justify-between font-black text-xl italic tracking-tight"><span>Rp {rupiah(total)}</span><span className={change < 0 ? "text-red-400" : ""}>Rp {rupiah(Math.max(0, change))}</span></div>
            </div>

            <button onClick={saveSale} disabled={paymentMethod === "cash" && paid < total} className="w-full py-5 bg-zinc-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 active:scale-95 disabled:opacity-20 transition-all">Selesaikan Transaksi</button>
          </div>
        </div>
      )}

      {/* MODAL STRUK */}
      {lastSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setLastSale(null)} />
          <div className="relative bg-white p-8 rounded-[40px] w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <ReceiptPreview sale={lastSale} rupiah={rupiah} />
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => window.print()} className="py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Print</button>
              <button onClick={downloadReceiptPNG} className="py-4 bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Simpan PNG</button>
            </div>
            <button onClick={() => setLastSale(null)} className="w-full mt-4 text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Tutup</button>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", left: -9999, top: 0 }}><ReceiptForExport ref={receiptExportRef} sale={lastSale} rupiah={rupiah} /></div>
    </div>
  );
}
