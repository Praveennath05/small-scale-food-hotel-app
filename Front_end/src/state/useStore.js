import { useEffect, useMemo, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getSalesSummary,
} from "../api/api";

const emptyCart = [];

export function useStore() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const [reportRange, setReportRange] = useState("daily");

  const [reports, setReports] = useState({
    daily: { total: 0, buckets: [] },
    weekly: { total: 0, buckets: [] },
    monthly: { total: 0, buckets: [] },
  });

  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  loadProducts();
  loadSalesReports();
}, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const items = await getProducts();
      setProducts(items || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSalesReports() {
    try {
      const [daily, weekly, monthly] = await Promise.all([
        getSalesSummary("daily"),
        getSalesSummary("weekly"),
        getSalesSummary("monthly"),
      ]);
      setReports({ daily, weekly, monthly });
    } catch (error) {
      console.error("Failed to load sales reports:", error);
    }
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const tax = Math.round(subtotal * 0.05);
    return { subtotal, tax, total: subtotal + tax };
  }, [cart]);
function addToCart(product) {
  setCart((prev) => {
    const id = product.id; // stable Mongo id

    const existing = prev.find((p) => p.id === id);

    if (existing) {
      return prev.map((p) =>
        p.id === id ? { ...p, qty: p.qty + 1 } : p
      );
    }

    return [
      ...prev,
      {
        id,                    // REQUIRED FOR React key
        name: product.name,
        price: Number(product.price),
        qty: 1,
      },
    ];
  });
}

function increment(id) {
  setCart((prev) =>
    prev.map((p) =>
      p.id === id ? { ...p, qty: p.qty + 1 } : p
    )
  );
}

function decrement(id) {
  setCart((prev) =>
    prev
      .map((p) =>
        p.id === id ? { ...p, qty: Math.max(0, p.qty - 1) } : p
      )
      .filter((p) => p.qty > 0)
  );
}

  function clearCart() {
    setCart(emptyCart);
  }

  async function addProduct(payload) {
    setLoading(true);
    try {
      const created = await createProduct(payload);
      setProducts((prev) => [created, ...prev]);
      return created;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function editProduct(id, payload) {
    setLoading(true);
    try {
      const updated = await updateProduct(id, payload);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? updated : p))
      );
      return updated;
    } finally {
      setLoading(false);
    }
  }

  async function removeProduct(id) {
    setLoading(true);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } finally {
      setLoading(false);
    }
  }

  async function payNow() {
    if (!cart.length) return null;

    setLoading(true);
    try {
      const order = await createOrder({
        items: cart,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
      });

      setLastOrder(order);
      setCart(emptyCart);
      await loadSalesReports();

      return order;
    } catch (error) {
      console.error("Failed to create order:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    products,
    cart,
    totals,
    loading,

    reports,
    reportRange,
    setReportRange,

    lastOrder,

    addToCart,
    increment,
    decrement,
    clearCart,

    addProduct,
    editProduct,
    removeProduct,

    payNow,
  };
}
