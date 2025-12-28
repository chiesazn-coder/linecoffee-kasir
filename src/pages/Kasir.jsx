import { Link } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MENU, SIZES, rupiah } from "../data/menu";
import html2canvas from "html2canvas";
import { createOrder, getNextQueueNo } from "../lib/orderStore";

const ReceiptPreview = React.forwardRef(function ReceiptPreview({ sale, rupiah }, ref) {
  if (!sale) return null;

  const dateText = new Date(sale.createdAt).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const method =
    sale.paymentMethod === "cash"
      ? "CASH"
      : sale.paymentMethod === "qris"
      ? "QRIS"
      : sale.paymentMethod === "transfer"
      ? "TRANSFER"
      : String(sale.paymentMethod || "-").toUpperCase();

  return (
    <div
      ref={ref}
      className="mx-auto w-[320px] rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200"
    >
      <div className="text-center">
        <div className="text-base font-extrabold tracking-tight">L!ne Coffee</div>
        <div className="mt-0.5 text-xs text-zinc-600">Struk Pembelian</div>
        <div className="mt-0.5 text-[11px] text-zinc-600">{dateText}</div>
        <div className="mt-0.5 text-[11px] text-zinc-600">ID: {sale.id}</div>
      </div>

      <div className="my-3 border-t border-dashed border-zinc-300" />

      <div className="space-y-2">
        {sale.items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {it.product} <span className="text-zinc-500">({it.size}ml)</span>
              </div>
              <div className="text-[11px] text-zinc-600">
                Varian: <span className="font-medium text-zinc-800">{String(it.variant || "").replace(/^\w/, (c) => c.toUpperCase())}</span>
              </div>
              <div className="text-[11px] text-zinc-600">
                {it.qty} x Rp {rupiah(it.price)}
              </div>
            </div>
            <div className="shrink-0 text-sm font-semibold">
              Rp {rupiah(it.price * it.qty)}
            </div>
          </div>
        ))}
      </div>

      <div className="my-3 border-t border-dashed border-zinc-300" />

      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Total</span>
          <span className="font-extrabold">Rp {rupiah(sale.total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Metode</span>
          <span className="font-semibold">{method}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Dibayar</span>
          <span className="font-semibold">Rp {rupiah(sale.paid)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Kembalian</span>
          <span className="font-semibold">Rp {rupiah(sale.change)}</span>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-zinc-300" />
      <div className="text-center text-xs text-zinc-600">Terima kasih 🙏</div>
    </div>
  );
});

const ReceiptForExport = React.forwardRef(function ReceiptForExport({ sale, rupiah }, ref) {
  if (!sale) return null;

  const dateText = new Date(sale.createdAt).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const method =
    sale.paymentMethod === "cash"
      ? "CASH"
      : sale.paymentMethod === "qris"
      ? "QRIS"
      : sale.paymentMethod === "transfer"
      ? "TRANSFER"
      : String(sale.paymentMethod || "-").toUpperCase();

  return (
    <div
      ref={ref}
      style={{
        width: 320,
        background: "#fff",
        color: "#111",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 14,
        lineHeight: 1.25,
        padding: 16,
        // kunci anti “kepotong” (descender font)
        paddingBottom: 22,
        overflow: "visible",
        display: "inline-block",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>L!ne Coffee</div>
        <div style={{ marginTop: 4, fontSize: 12 }}>Struk Pembelian</div>
        <div style={{ marginTop: 2, fontSize: 12 }}>{dateText}</div>
        <div style={{ marginTop: 2, fontSize: 12 }}>ID: {sale.id}</div>
      </div>

      <div style={{ borderTop: "1px dashed #999", margin: "12px 0" }} />

      <div style={{ display: "grid", gap: 10 }}>
        {sale.items.map((it) => (
          <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              {/* jangan truncate */}
              <div style={{ fontWeight: 800 }}>
                {it.product} <span style={{ opacity: 0.7 }}>({it.size}ml)</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                Varian: <span style={{ fontWeight: 700, opacity: 1 }}>{it.variant}</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {it.qty} x Rp {rupiah(it.price)}
              </div>
            </div>
            <div style={{ whiteSpace: "nowrap", fontWeight: 700 }}>
              Rp {rupiah(it.price * it.qty)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px dashed #999", margin: "12px 0" }} />

      <div style={{ display: "grid", gap: 8 }}>
        {[
          ["Total", `Rp ${rupiah(sale.total)}`],
          ["Metode", method],
          ["Dibayar", `Rp ${rupiah(sale.paid)}`],
          ["Kembalian", `Rp ${rupiah(sale.change)}`],
        ].map(([l, r]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ opacity: 0.8 }}>{l}</div>
            <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{r}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px dashed #999", margin: "12px 0" }} />

      <div style={{ textAlign: "center", fontSize: 12, opacity: 0.8 }}>
        Terima kasih 🙏
      </div>
    </div>
  );
});



export default function Kasir() {
  const [selectedSize, setSelectedSize] = useState("250");
  const [cart, setCart] = useState([]); // {id, name, category, size, price, qty}
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash | qris | transfer
  const [cash, setCash] = useState(""); // input uang diterima untuk cash
  const [lastSale, setLastSale] = useState(null);
  const receiptPreviewRef = useRef(null);
  const receiptExportRef = useRef(null);
  const [customerName, setCustomerName] = useState("");
  const [editingId, setEditingId] = useState(null); // id cart item yg sedang edit

  const total = useMemo(
    () => cart.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cart]
  );

  async function downloadReceiptPNG() {
    if (!receiptExportRef.current || !lastSale) return;
  
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  
      const el = receiptExportRef.current;
  
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        logging: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
  
      const dataUrl = canvas.toDataURL("image/png");
  
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Struk-${lastSale.id}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan struk sebagai PNG");
    }
  }
         
  function addToCart(category, item) {
    // category = nama menu/produk (mis. ITEMICANO)
    // item.name = varian (mis. Classic, Premium)
    const id = `${category}-${item.name}-${selectedSize}`;
    const price = item.prices[selectedSize];
  
    setCart((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found) {
        return prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...prev,
        {
          id,
          product: category,     // ✅ nama menu/kopi
          variant: item.name,    // ✅ varian
          size: selectedSize,
          price,
          qty: 1,
          ice: "normal",
          sugar: "normal",
        },
      ];
    });
  }
  
  function inc(id) {
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  }

  function dec(id) {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
        .filter(Boolean)
    );
  }

  function remove(id) {
    setCart((prev) => prev.filter((x) => x.id !== id));
  }

  function updateCartItem(id, patch) {
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  

  function clearCart() {
    setCart([]);
  }

  function parseRupiahInput(v) {
    return Number(String(v).replace(/[^\d]/g, "")) || 0;
  }

  function niceOpt(v) {
    if (v === "less") return "Less";
    if (v === "extra") return "Extra";
    return "Normal";
  }
  
  
  const paid = useMemo(() => {
    // kalau non-cash, dianggap bayar pas
    if (paymentMethod !== "cash") return total;
    return parseRupiahInput(cash);
  }, [cash, paymentMethod, total]);
  
  const change = paid - total;

  function saveSale() {
    if (cart.length === 0) return;
  
    // validasi cash: harus cukup
    if (paymentMethod === "cash" && paid < total) {
      alert("Uang diterima kurang dari total.");
      return;
    }
  
    const sale = {
      id: `S-${Date.now()}`,
      createdAt: new Date().toISOString(),
      paymentMethod, // cash | qris | transfer
      items: cart,
      total,
      paid,
      change: Math.max(0, paid - total),
    };

    setLastSale(sale);

    // ====== BUAT ORDER PRODUKSI (TANPA HARGA) ======
    const queueNo = getNextQueueNo();

    const productionOrder = {
      id: `O-${Date.now()}`, // order id
      queueNo,
      customerName: (customerName || "").trim() || "-",
      createdAt: new Date().toISOString(), // tgl order
      productionDate: "", // opsional, nanti di produksi bisa diisi
      items: cart.map((it) => ({
        product: it.product,
        variant: it.variant,
        size: it.size,
        qty: it.qty,
        ice: it.ice || "normal",
        sugar: it.sugar || "normal",
      })),
      status: "new",
    };

    createOrder(productionOrder);
  
    const key = "linecoffee_sales";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([sale, ...existing]));
  
    // reset setelah sukses
    setCart([]);
    setCash("");
    setCustomerName("");   // ✅ tambahin ini
    setIsCheckoutOpen(false);
    setEditingId(null);
    setEditingId(null);
  }

  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  
  function paymentLabel(pm) {
    if (pm === "cash") return "CASH";
    if (pm === "qris") return "QRIS";
    if (pm === "transfer") return "TRANSFER";
    return String(pm || "-").toUpperCase();
  }
  
  function printReceipt(sale) {
    if (!sale) return;
  
    const itemsHtml = sale.items
      .map((it) => {
        const lineTotal = it.price * it.qty;
        return `
          <div class="row">
            <div class="left">
              <div class="name">${escapeHtml(it.product)} (${it.size}ml)</div>
              <div class="sub">Varian: ${escapeHtml(it.variant)}</div>
              <div class="sub">${it.qty} x Rp ${rupiah(it.price)}</div>
            </div>
            <div class="right">Rp ${rupiah(lineTotal)}</div>
          </div>
        `;
      })
      .join("");
  
    const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Struk</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: monospace;
      }
      
      .receipt {
        width: 48mm;
        padding: 4mm;
        font-size: 11px;
      }
      
      .center {
        text-align: center;
      }
      
      .title {
        font-weight: bold;
        font-size: 14px;
      }
      
      .muted {
        font-size: 10px;
        color: #000;
      }
      
      .hr {
        border-top: 1px dashed #000;
        margin: 6px 0;
      }
      
      .row {
        display: flex;
        justify-content: space-between;
        gap: 4px;
        margin: 4px 0;
      }
      
      .left {
        flex: 1;
      }
      
      .name {
        font-weight: bold;
      }
      
      .sub {
        font-size: 10px;
      }
      
      .right {
        white-space: nowrap;
        text-align: right;
      }
      
      .bold {
        font-weight: bold;
      }
      
      @media print {
        @page {
          size: 58mm auto;
          margin: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="center">
        <div class="title">L!ne Coffee</div>
        <div class="muted">Struk Pembelian</div>
        <div class="muted">${fmtDate(sale.createdAt)}</div>
        <div class="muted">ID: ${sale.id}</div>
      </div>
  
      <div class="hr"></div>
  
      ${itemsHtml}
  
      <div class="hr"></div>
  
      <div class="totals">
        <div class="row">
          <div class="sub">Total</div>
          <div class="right bold">Rp ${rupiah(sale.total)}</div>
        </div>
        <div class="row">
          <div class="sub">Metode</div>
          <div class="right">${paymentLabel(sale.paymentMethod)}</div>
        </div>
        <div class="row">
          <div class="sub">Dibayar</div>
          <div class="right">Rp ${rupiah(sale.paid)}</div>
        </div>
        <div class="row">
          <div class="sub">Kembalian</div>
          <div class="right">Rp ${rupiah(sale.change)}</div>
        </div>
      </div>
  
      <div class="hr"></div>
  
      <div class="center muted">Terima kasih 🙏</div>
    </div>
  
    <script>
      window.onload = () => {
        window.print();
        window.onafterprint = () => window.close();
      };
    </script>
  </body>
  </html>`;
  
    const w = window.open("", "PRINT", "width=400,height=600");
    if (!w) {
      alert("Pop-up diblokir browser. Izinkan pop-up untuk cetak struk.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
  
  function capitalize(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  
  
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">Line Coffee Kasir</h1>

            <Link
              to="/"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
            >
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">Ukuran:</span>
            <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-zinc-200">
              {SIZES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSelectedSize(s.key)}
                  className={[
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    selectedSize === s.key
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {/* KATALOG */}
          <section className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Menu</h2>
              <div className="text-sm text-zinc-600">
                Klik item untuk tambah ke keranjang
              </div>
            </div>

            <div className="space-y-5">
              {MENU.map((group) => (
                <div key={group.category}>
                  <h3 className="mb-2 text-sm font-semibold tracking-wide text-zinc-800">
                    {group.category}
                  </h3>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.items.map((it) => (
                      <button
                        key={it.name}
                        onClick={() => addToCart(group.category, it)}
                        className="group rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-left transition hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium capitalize">{it.name}</div>
                            <div className="mt-1 text-sm text-zinc-600">
                              {SIZES.find((s) => s.key === selectedSize)?.label} • Rp {rupiah(it.prices[selectedSize])}
                            </div>
                          </div>
                          <span className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-semibold text-white opacity-90 group-hover:opacity-100">
                            + Tambah
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* KERANJANG */}
          <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Keranjang</h2>
              <button
                onClick={clearCart}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Clear
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                Keranjang masih kosong. Pilih menu di kiri untuk menambah.
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((it) => (
                  <div key={it.id} className="rounded-xl border border-zinc-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">
                          {it.product} <span className="text-zinc-500">({it.size}ml)</span>
                        </div>
                        <div className="text-xs text-zinc-600">Varian: {it.variant}</div>
                        {/* RINGKAS ICE/SUGAR + EDIT */}
                        <div className="mt-2">
                          {/* baris ringkas */}
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-2 py-2">
                            <div className="text-xs font-medium text-zinc-700">
                              Ice: <span className="font-semibold text-zinc-900">{niceOpt(it.ice || "normal")}</span>
                              <span className="mx-2 text-zinc-300">•</span>
                              Sugar: <span className="font-semibold text-zinc-900">{niceOpt(it.sugar || "normal")}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setEditingId(editingId === it.id ? null : it.id)}
                              className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                            >
                              {editingId === it.id ? "Done" : "Edit"}
                            </button>
                          </div>

                          {/* panel edit */}
                          {editingId === it.id && (
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <div className="mb-1 text-[11px] font-medium text-zinc-600">Ice</div>
                                <select
                                  value={it.ice || "normal"}
                                  onChange={(e) => updateCartItem(it.id, { ice: e.target.value })}
                                  className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm"
                                >
                                  <option value="less">Less</option>
                                  <option value="normal">Normal</option>
                                  <option value="extra">Extra</option>
                                </select>
                              </div>

                              <div>
                                <div className="mb-1 text-[11px] font-medium text-zinc-600">Sugar</div>
                                <select
                                  value={it.sugar || "normal"}
                                  onChange={(e) => updateCartItem(it.id, { sugar: e.target.value })}
                                  className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm"
                                >
                                  <option value="less">Less</option>
                                  <option value="normal">Normal</option>
                                  <option value="extra">Extra</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-1 text-sm text-zinc-700">
                          Rp {rupiah(it.price)} x {it.qty}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(it.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dec(it.id)}
                          className="h-9 w-9 rounded-lg border border-zinc-200 bg-white text-lg hover:bg-zinc-50"
                        >
                          -
                        </button>
                        <div className="min-w-10 text-center font-semibold">{it.qty}</div>
                        <button
                          onClick={() => inc(it.id)}
                          className="h-9 w-9 rounded-lg border border-zinc-200 bg-white text-lg hover:bg-zinc-50"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm font-semibold">
                        Rp {rupiah(it.price * it.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-xl bg-zinc-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Total</span>
                <span className="text-lg font-semibold">Rp {rupiah(total)}</span>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => {
                setPaymentMethod("cash");
                setCash("");
                setCustomerName("");
                setEditingId(null);
                setIsCheckoutOpen(true);
              }}
              className="mt-3 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Checkout
            </button>

          </aside>
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsCheckoutOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl ring-1 ring-zinc-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Checkout</h3>
                <p className="text-sm text-zinc-600">
                  Pembayaran dilakukan manual oleh kasir. Sistem hanya mencatat transaksi.
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Tutup
              </button>
            </div>

            {/* TOTAL */}
            <div className="mt-4 rounded-xl bg-zinc-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Total</span>
                <span className="text-lg font-semibold">Rp {rupiah(total)}</span>
              </div>
            </div>

            {/* METODE BAYAR */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Metode pembayaran
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "cash", label: "Cash" },
                  { key: "qris", label: "QRIS" },
                  { key: "transfer", label: "Transfer" },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setPaymentMethod(m.key);
                      if (m.key !== "cash") setCash("");
                    }}
                    className={[
                      "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                      paymentMethod === m.key
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod !== "cash" && (
                <div className="mt-2 text-sm text-zinc-600">
                  Metode {paymentMethod.toUpperCase()} dianggap dibayar pas. Kembalian Rp 0.
                </div>
              )}
            </div>

            {/* INPUT CASH (MUNCUL KALAU CASH) */}
            {paymentMethod === "cash" && (
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Uang diterima (Rp)
                </label>
                <input
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  inputMode="numeric"
                  placeholder="contoh: 50000"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm outline-none focus:border-zinc-400"
                />

                <div className="mt-2 flex flex-wrap gap-2">
                  {[20000, 50000, 100000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCash(String(v))}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
                    >
                      Rp {rupiah(v)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RINGKASAN BAYAR */}
            <div className="mt-4 rounded-xl border border-zinc-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Dibayar (dicatat)</span>
                <span className="font-semibold">Rp {rupiah(paid)}</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-zinc-600">Kembalian</span>
                <span
                  className={[
                    "font-semibold",
                    paymentMethod === "cash" && change < 0 ? "text-red-600" : "text-zinc-900",
                  ].join(" ")}
                >
                  Rp {rupiah(paymentMethod === "cash" ? Math.max(0, change) : 0)}
                </span>
              </div>

              {paymentMethod === "cash" && change < 0 && (
                <div className="mt-2 text-sm font-medium text-red-600">
                  Uang kurang Rp {rupiah(Math.abs(change))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Atas nama order
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="contoh: Kak Rani"
                className="w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm outline-none focus:border-zinc-400"
              />
              <div className="mt-2 text-xs text-zinc-500">
                Nama ini akan muncul di stiker produksi, bukan di struk harga.
              </div>
            </div>


            {/* SUBMIT */}
            <button
              onClick={saveSale}
              disabled={cart.length === 0 || (paymentMethod === "cash" && paid < total)}
              className="mt-4 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Selesaikan Transaksi
            </button>
          </div>
        </div>
      )}

      {lastSale && (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Preview Struk</div>
              <div className="text-xs text-zinc-600">{lastSale.id}</div>
            </div>
            <button
              onClick={() => setLastSale(null)}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
            >
              Tutup
            </button>
          </div>

          {/* ini yang di-capture */}
          <div
            ref={receiptPreviewRef}
            className="mx-auto mt-3 inline-block bg-white p-4"
            style={{ overflow: "visible" }}
          >
            <ReceiptPreview sale={lastSale} rupiah={rupiah} />
          </div>

          <button
            onClick={() => printReceipt(lastSale)}
            className="mt-3 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white"
          >
            Cetak Struk
          </button>

          <button
            onClick={downloadReceiptPNG}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold hover:bg-zinc-50"
          >
            Simpan Struk (PNG)
          </button>
        </div>
      )}

      {/* sumber export (hidden) */}
      <div style={{ position: "fixed", left: -99999, top: 0 }}>
        <ReceiptForExport ref={receiptExportRef} sale={lastSale} rupiah={rupiah} />
      </div>

      <div style={{ height: 6 }} />

    </div>
  );
}
