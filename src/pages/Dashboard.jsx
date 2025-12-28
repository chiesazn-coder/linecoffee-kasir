import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-4xl p-4 md:p-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h1 className="text-2xl font-semibold">Line Coffee</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Pilih mode kerja yang mau digunakan.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Link
              to="/kasir"
              className="rounded-2xl border border-zinc-200 bg-zinc-900 p-5 text-white transition hover:opacity-95"
            >
              <div className="text-lg font-semibold">Kasir</div>
              <div className="mt-1 text-sm text-white/80">
                Input order, hitung pembayaran, simpan transaksi.
              </div>
            </Link>

            <Link
              to="/produksi"
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 transition hover:bg-zinc-50"
            >
              <div className="text-lg font-semibold">Produksi (Label)</div>
              <div className="mt-1 text-sm text-zinc-600">
                Cetak label antrian dan detail order tanpa harga.
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
