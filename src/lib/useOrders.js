import { useEffect, useState } from "react";
import { getOrders } from "./orderStore";

export function useOrders() {
  const [orders, setOrders] = useState(() => getOrders());

  useEffect(() => {
    // update saat tab lain mengubah localStorage
    function onStorage(e) {
      if (e.key) setOrders(getOrders());
    }
    window.addEventListener("storage", onStorage);

    // update saat di tab yang sama selesai create/update
    // (kita trigger manual lewat custom event)
    function onOrdersChanged() {
      setOrders(getOrders());
    }
    window.addEventListener("orders:changed", onOrdersChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("orders:changed", onOrdersChanged);
    };
  }, []);

  return { orders, refresh: () => setOrders(getOrders()) };
}
