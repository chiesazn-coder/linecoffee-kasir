import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteOrder, getOrders, updateOrder } from "../lib/orderStore";

function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ✅ Label diperbarui agar tim produksi sadar ada EXTRA
function labelIce(v) {
  const s = String(v || "normal").toUpperCase();
  if (s === "LESS") return "ICE: LESS";
  if (s === "EXTRA") return "⭐ EXTRA SHOT ⭐"; // Kasih bintang biar barista liat
  return "ICE: NORMAL";
}

function labelSugar(v) {
  const s = String(v || "normal").toUpperCase();
  if (s === "LESS") return "SUGAR: LESS";
  if (s === "EXTRA") return "⭐ EXTRA SUGAR ⭐"; // Kasih bintang biar barista liat
  return "SUGAR: NORMAL";
}

function buildOneLabelHTML({ order, item }) {
  // Cek apakah ada extra untuk kasih border/tanda khusus di stiker
  const isExtra = item.ice === "extra" || item.sugar === "extra";

  return `
    <div class="paper ${isExtra ? 'has-extra' : ''}">
      <div class="rot">
        <div class="top">
          <div class="brand">L!ne Coffee</div>
          <div class="queue">#${escapeHtml(order.queueNo)}</div>
        </div>

        <div class="nameRow">
          <div class="val">${escapeHtml(order.customerName || "-")}</div>
        </div>

        <div class="item">
          <div class="prod">${escapeHtml(item.product)}</div>
          <div class="meta">${escapeHtml(item.variant)} • ${escapeHtml(item.size)}ml</div>
        </div>

        <div class="prefs">
          <div class="${item.ice === 'extra' ? 'bold-extra' : ''}">${escapeHtml(labelIce(item.ice))}</div>
          <div class="${item.sugar === 'extra' ? 'bold-extra' : ''}">${escapeHtml(labelSugar(item.sugar))}</div>
        </div>

        <div class="dates">
          ${escapeHtml(formatDateTime(order.createdAt))}
        </div>
      </div>
    </div>
  `;
}

function printStickers58x30(order) {
  const labels = [];
  (order.items || []).forEach((it) => {
    const qty = Math.max(1, Number(it.qty || 1));
    for (let i = 0; i < qty; i++) {
      labels.push({ order, item: it });
    }
  });

  const labelsHtml = labels
    .map((x) => buildOneLabelHTML(x) + `<div class="pageBreak"></div>`)
    .join("");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @media print { @page { size: 58mm 30mm; margin: 0; } }
    body { margin:0; padding:0; font-family: monospace; }
    .paper { width: 58mm; height: 30mm; overflow: hidden; border: 1px solid transparent; }
    /* Jika ada extra, beri garis bawah tebal di stiker sebagai pengingat */
    .has-extra { border-bottom: 3px solid #000; } 
    
    .rot { padding: 2mm; }
    .top { display: flex; justify-content: space-between; margin-bottom: 1mm; }
    .brand { font-weight: bold; font-size: 11px; }
    .queue { font-weight: 900; font-size: 16px; border: 1px solid #000; padding: 0 2px; }

    .nameRow { font-size: 12px; font-weight: 900; margin-bottom: 1.5mm; border-bottom: 0.5px solid #eee; }
    
    .item { margin-bottom: 1mm; }
    .prod { font-weight: 900; font-size: 12px; text-transform: uppercase; }
    .meta { font-size: 10px; }

    .prefs { font-size: 10px; font-weight: bold; margin-top: 1mm; }
    /* Style khusus untuk teks Extra agar sangat mencolok */
    .bold-extra { background: #000; color: #fff; padding: 0 2px; display: inline-block; }

    .dates { font-size: 7px; margin-top: 2mm; text-align: right; opacity: 0.7; }
    .pageBreak { page-break-after: always; }
  </style>
</head>
<body>
  ${labelsHtml}
  <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); };</script>
</body>
</html>`;

  const w = window.open("", "PRINT_STICKER", "width=500,height=400");
  w.document.write(html);
  w.document.close();
}

function escapeHtml(str) {
  return String(str ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export default function Produksi() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = () => setOrders(getOrders());
    load();
    window.addEventListener("orders:changed", load);
    return () => window.removeEventListener("orders:changed", load);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 pb-20">
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900">Line Coffee <span className="text-zinc-300">Produksi</span></h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Kitchen & Bar Station</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold shadow-sm">Dashboard</Link>
            <Link to="/kasir" className="px-5 py-2.5 bg-zinc-900 text-white rounded-2xl text-xs font-bold shadow-lg shadow-zinc-200">Kasir</Link>
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border border-dashed border-zinc-200">
             <p className="text-zinc-300 font-black uppercase tracking-widest text-xs italic">Antrean Kosong</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-100 group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center text-xl font-black italic">#{o.queueNo}</div>
                      <div>
                        <h2 className="text-lg font-black uppercase tracking-tight">{o.customerName || "Tanpa Nama"}</h2>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{formatDateTime(o.createdAt)}</p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      {o.items.map((it, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${it.ice === 'extra' || it.sugar === 'extra' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-50 bg-zinc-50'} flex justify-between items-center`}>
                          <div>
                            <p className="text-xs font-black uppercase italic">{it.product} ({it.size}ml)</p>
                            <p className={`text-[10px] font-bold uppercase ${it.ice === 'extra' || it.sugar === 'extra' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              Var: {it.variant} | 
                              <span className={it.ice === 'extra' ? 'underline text-white' : ''}> Ice: {it.ice}</span> | 
                              <span className={it.sugar === 'extra' ? 'underline text-white' : ''}> Sug: {it.sugar}</span>
                            </p>
                          </div>
                          <div className="text-lg font-black italic">x{it.qty}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-48 flex flex-col gap-2 justify-center">
                    <button 
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        updateOrder(o.id, { productionDate: today });
                        printStickers58x30(o);
                      }}
                      className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-200 active:scale-95 transition-all"
                    >
                      Print Sticker
                    </button>
                    <button onClick={() => deleteOrder(o.id)} className="w-full py-3 text-zinc-300 hover:text-red-500 text-[9px] font-bold uppercase transition-colors">Hapus Antrean</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}