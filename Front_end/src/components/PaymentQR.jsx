import { QRCodeCanvas } from "qrcode.react";

export default function PaymentQR({ amount, orderId, onClose }) {
  const upiId = "aravindsiddharthp@oksbi"
  const name = "Hotel Cafe";

  const payload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    name
  )}&am=${amount}&cu=INR&tn=Order%20${orderId}`;

  return (
    <div className="qr-overlay">
      <div className="qr-card card">
        <div className="qr-header">
          <div>
            <p className="eyebrow">Pay via UPI</p>
            <h3>Amount: ₹{amount}</h3>
            <p className="muted">Order #{orderId}</p>
          </div>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="qr-box">
          <QRCodeCanvas
            value={payload}
            size={220}
            level="H"
            fgColor="#ffffff"
            bgColor="#020617"
          />
        </div>

        <p className="muted center">
          Scan with GPay / PhonePe / Paytm
        </p>
      </div>
    </div>
  );
}
