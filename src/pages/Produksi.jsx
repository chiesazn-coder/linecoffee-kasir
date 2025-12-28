import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteOrder, getOrders, updateOrder } from "../lib/orderStore";

function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(yyyyMmDd) {
  if (!yyyyMmDd) return "-";
  // tampilkan tetap YYYY-MM-DD biar jelas buat produksi
  return yyyyMmDd;
}

function labelIce(v) {
  const s = String(v || "normal").toUpperCase();
  if (s === "LESS") return "ICE, LESS";
  if (s === "EXTRA") return "ICE, EXTRA";
  return "ICE, NORMAL";
}

function labelSugar(v) {
  const s = String(v || "normal").toUpperCase();
  if (s === "LESS") return "LESS SUGAR";
  if (s === "EXTRA") return "EXTRA SUGAR";
  return "NORMAL SUGAR";
}

function buildOneLabelHTML({ order, item, indexNo }) {
  // indexNo opsional kalau kamu mau tanda urutan label (tidak wajib)
  return `
    <div class="paper">
      <div class="rot">
        <div class="top">
          <div class="brand">L!ne Coffee</div>
          <div class="queue">#${escapeHtml(order.queueNo)}</div>
        </div>

        <div class="nameRow">
          <div class="lbl">Nama</div>
          <div class="val">${escapeHtml(order.customerName || "-")}</div>
        </div>

        <div class="item">
          <div class="prod">${escapeHtml(item.product)}</div>
          <div class="meta">Var: ${escapeHtml(item.variant)} • ${escapeHtml(item.size)}ml</div>
          <div class="qty">x1</div>
        </div>

        <div class="prefs">
          <div>${escapeHtml(labelIce(item.ice))}</div>
          <div>${escapeHtml(labelSugar(item.sugar))}</div>
        </div>

        <div class="dates">
          Order: ${escapeHtml(formatDateTime(order.createdAt))} •
          Prod: ${escapeHtml(formatDateOnly(order.productionDate))}
        </div>
      
      </div>
    </div>
  `;
}

function printStickers58x30(order) {
  // flatten items -> jadikan array label per 1 pcs
  const labels = [];
  (order.items || []).forEach((it) => {
    const qty = Math.max(1, Number(it.qty || 1));
    for (let i = 0; i < qty; i++) {
      labels.push({ order, item: it, indexNo: i + 1 });
    }
  });

  const labelsHtml = labels
    .map((x) => buildOneLabelHTML(x) + `<div class="pageBreak"></div>`)
    .join("");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sticker</title>
  <style>
    @media print {
      @page { size: 58mm 30mm; margin: 0; }
    }

    body { margin:0; padding:0; background:#fff; }
    .paper{
      width: 58mm;
      height: 30mm;
      overflow: hidden;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color:#000;
    }

    .rot{
      width: 58mm;
      height: 30mm;
      box-sizing: border-box;
      padding: 2.5mm 2mm;
    }

    .top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2mm;
    }
    .brand { font-weight: 900; font-size: 12px; letter-spacing: .3px; }
    .queue { font-weight: 900; font-size: 14px; }

    .nameRow {
      display:flex;
      justify-content: space-between;
      gap: 2mm;
      margin-bottom: 2mm;
      font-size: 11px;
    }
    .nameRow .lbl { opacity: .85; }
    .nameRow .val { font-weight: 900; }

    .item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1mm 2mm;
      align-items: start;
      margin-bottom: 1mm;
    }
    .prod { font-weight: 900; font-size: 11px; }
    .meta { grid-column: 1 / 2; font-size: 10px; opacity: .85; }
    .qty { grid-column: 2 / 3; grid-row: 1 / 3; font-weight: 900; font-size: 11px; white-space: nowrap; }

    .prefs{
      display:flex;
      justify-content: space-between;
      gap: 2mm;
      font-size: 10px;
      font-weight: 800;
      margin-top: .5mm;
    }

    .dates {
      display:flex;
      justify-content: space-between;
      gap: 2mm;
      margin-top: 1.2mm;
      font-size: 8px;
      opacity: .9;
      white-space: nowrap;
    }

    .pageBreak { page-break-after: always; }
    .pageBreak:last-child { page-break-after: auto; }
  </style>
</head>
<body>
  ${labelsHtml}

  <script>
    window.onload = () => {
      setTimeout(() => window.print(), 300);
      // window.onafterprint = () => window.close();
    };
  </script>
</body>
</html>`;

  const w = window.open("", "PRINT_STICKER", "width=520,height=420");
  if (!w) { alert("Pop-up diblokir browser. Izinkan pop-up untuk print sticker."); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function Produksi() {
  const [orders, setOrders] = useState([]);

  // load + auto refresh
  useEffect(() => {
    const load = () => setOrders(getOrders());

    load();
    window.addEventListener("orders:changed", load);
    window.addEventListener("storage", load); // kalau buka 2 tab

    return () => {
      window.removeEventListener("orders:changed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const sorted = useMemo(() => {
    // tampilkan order terbaru di atas (sudah begitu dari store), tapi kita rapihin aja
    return [...orders];
  }, [orders]);

  function setProdDate(order) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const yyyyMmDd = `${y}-${m}-${d}`;

    updateOrder(order.id, { productionDate: yyyyMmDd });
  }

  function markPrinted(order) {
    updateOrder(order.id, { status: "printed" });
  }

  function remove(order) {
    if (!confirm("Hapus order ini?")) return;
    deleteOrder(order.id);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Line Coffee Produksi</h1>
            <div className="text-sm text-zinc-600">
              Print sticker 58mm tanpa harga (thermal).
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
            >
              Dashboard
            </Link>
            <Link
              to="/kasir"
              className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Ke Kasir
            </Link>
          </div>
        </header>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Belum ada order produksi. Lakukan transaksi dari Kasir dulu.
          </div>
        ) : (
          <div className="grid gap-3">
            {sorted.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-zinc-900 px-3 py-1.5 text-sm font-extrabold text-white">
                        #{o.queueNo}
                      </div>
                      <div className="text-sm font-semibold">
                        {o.customerName || "-"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Status: {o.status || "new"}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-zinc-600">
                      Tgl order: {formatDateTime(o.createdAt)} • Tgl produksi:{" "}
                      {formatDateOnly(o.productionDate)}
                    </div>

                    <div className="mt-3 space-y-2">
                      {(o.items || []).map((it, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">
                                {it.product}{" "}
                                <span className="text-zinc-500">
                                  ({it.size}ml)
                                </span>
                              </div>
                              <div className="text-xs text-zinc-600">
                                Varian: {it.variant}
                              </div>
                              <div className="text-xs text-zinc-600">
                                Ice: {it.ice || "normal"} • Sugar: {it.sugar || "normal"}
                              </div>
                            </div>
                            <div className="text-sm font-extrabold">x{it.qty}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 md:w-56">
                    <button
                      onClick={() => {
                        const t = new Date();
                        const y = t.getFullYear();
                        const m = String(t.getMonth() + 1).padStart(2, "0");
                        const d = String(t.getDate()).padStart(2, "0");
                        const today = `${y}-${m}-${d}`;

                        const prodDate = o.productionDate || today;

                        if (!o.productionDate) {
                          updateOrder(o.id, { productionDate: prodDate });
                        }

                        printStickers58x30({ ...o, productionDate: prodDate });

                        updateOrder(o.id, { status: "printed" });
                      }}
                      className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Print Sticker 58mm
                    </button>

                    <button
                      onClick={() => setProdDate(o)}
                      className="w-full rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold hover:bg-zinc-50"
                    >
                      Set Tgl Produksi Hari Ini
                    </button>

                    <button
                      onClick={() => markPrinted(o)}
                      className="w-full rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold hover:bg-zinc-50"
                    >
                      Tandai Printed
                    </button>

                    <button
                      onClick={() => remove(o)}
                      className="w-full rounded-xl border border-red-200 bg-white py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Hapus Order
                    </button>
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
