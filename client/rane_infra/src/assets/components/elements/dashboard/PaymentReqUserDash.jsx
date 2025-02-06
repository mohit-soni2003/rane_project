import React from 'react';
import "./PaymentReqUserDash.css"

export default function PaymentReqUserDash() {
  return (
    <div className="payment-req-user-dash">
      <h2>Make New Payment Request</h2>
      <div className="payment-req-form">
        <label>Select Tender</label>
        <select name="tender">
          <option value="EL">EL</option>
          <option value="RTM">RTM</option>
          <option value="MEC">MEC</option>
        </select>

        <label>Amount</label>
        <input type="text" placeholder="Enter Amt less than 5000" />

        <label>Description</label>
        <textarea name="desc" placeholder="Enter details"></textarea>

        <label>Upload File</label>
        <input type="file" />

        <button className="submit-btn">Submit Request</button>
      </div>
    </div>
  );
}
