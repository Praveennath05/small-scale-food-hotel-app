import MenuBar from "./MenuBar.jsx";

export default function Layout({ children, onPrint, onClear, onPay, onLogout }) {
  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1 >Gladius Cafe </h1>
          <h3>  </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="actions">
            <button className="ghost" onClick={onClear}>
              Clear cart
            </button>
            <button className="ghost" onClick={onPrint}>
              Print bill
            </button>
            <button className="primary" onClick={onPay}>
              Pay now
            </button>
          </div>
          <MenuBar onLogout={onLogout} />
        </div>
      </header>
      {children}
    </div>
  );
}



