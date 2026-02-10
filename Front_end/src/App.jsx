import { useState, useEffect } from "react";
import Layout from "./components/Layout.jsx";
import Login from "./components/Login.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import Cart from "./components/Cart.jsx";
import PaymentQR from "./components/PaymentQR.jsx";
import SalesReport from "./components/SalesReport.jsx";
import { useStore } from "./state/useStore.js";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const store = useStore();

  const {
    products,
    cart,
    totals,
    reports,
    reportRange,
    loading,
    addToCart,
    increment,
    decrement,
    clearCart,
    addProduct,
    editProduct,
    removeProduct,
    payNow,
    setReportRange,
  } = store;

  const [showQR, setShowQR] = useState(false);
  const [orderMeta, setOrderMeta] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  async function handlePay() {
    const order = await payNow();

    if (order) {
      setOrderMeta({
        id: order.id,
        amount: totals.total,
      });
      setShowQR(true);
    }
  }

  return (
    <Layout
      onPrint={() => window.print()}
      onClear={clearCart}
      onPay={handlePay}
      onLogout={handleLogout}
    >
      {loading && <p className="muted">Loading…</p>}

      <div className="two-col">
        <div className="col">
          <ProductGrid
            products={products}
            onAddToCart={addToCart}
            onCreate={addProduct}
            onUpdate={editProduct}
            onDelete={removeProduct}
          />
        </div>

        <div className="col">
          <div id="print-bill">
            <Cart
              items={cart}
              totals={totals}
              onIncrement={increment}
              onDecrement={decrement}
              onClear={clearCart}
              onPay={handlePay}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      </div>

      <SalesReport
        daily={reports.daily}
        weekly={reports.weekly}
        monthly={reports.monthly}
        range={reportRange}
        onRangeChange={setReportRange}
      />

      {showQR && orderMeta && (
        <PaymentQR
          amount={orderMeta.amount}
          orderId={orderMeta.id}
          onClose={() => setShowQR(false)}
        />
      )}
    </Layout>
  );
}
