// src/lib/orderStore.js
const KEY = "linecoffee_orders_v1";

/**
 * Order shape:
 * {
 *   id: string,
 *   queueNo: number,
 *   customerName: string,
 *   createdAt: string, // ISO
 *   productionDate: string, // YYYY-MM-DD (optional)
 *   items: [{ product, variant, size, qty }],
 *   status: "new" | "printed" | "done"
 * }
 */

function emitChange() {
  window.dispatchEvent(new Event("orders:changed"));
}

export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOrders(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
  emitChange();
}

export function getNextQueueNo() {
  const orders = getOrders();
  const maxNo = orders.reduce((m, o) => Math.max(m, o.queueNo || 0), 0);
  return maxNo + 1;
}

export function createOrder(order) {
  const orders = getOrders();
  const next = [order, ...orders];
  saveOrders(next);
  emitChange();           // ✅ ini penting
  return order;
}

export function updateOrder(id, patch) {
  const orders = getOrders();
  const next = orders.map((o) => (o.id === id ? { ...o, ...patch } : o));
  saveOrders(next);
  emitChange();           // ✅
  return next.find((o) => o.id === id) || null;
}

export function deleteOrder(id) {
  const orders = getOrders();
  const next = orders.filter((o) => o.id !== id);
  saveOrders(next);
  emitChange();           // ✅
}

export function clearOrders() {
  localStorage.removeItem(KEY);
  emitChange();           // ✅
}

