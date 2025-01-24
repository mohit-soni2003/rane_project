import React from 'react'
import "./AdminTable.css"

export default function AdminTable() {
  return (
    <div>
        <div className="admin-bill-table">
        <table border="1">
    <thead>
        <tr>
            <th>Uploaded By</th>
            <th>Firm Name</th>
            <th>Work Area</th>
            <th>Phone No</th>
            <th>Email</th>
            <th>LOA No.</th>
            <th>Invoice No</th>
            <th>Payment Status</th>
            <th>View Bill</th>
            <th>Upload Date</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John Doe</td>
            <td>ABC Constructions</td>
            <td>Building</td>
            <td>9876543210</td>
            <td>johndoe@example.com</td>
            <td>LOA12345</td>
            <td>INV00123</td>
            <td>Paid</td>
            <td><a href="view-bill1.pdf">View</a></td>
            <td>2025-01-15</td>
        </tr>
        <tr>
            <td>Jane Smith</td>
            <td>XYZ Solutions</td>
            <td>IT Services</td>
            <td>8765432109</td>
            <td>janesmith@example.com</td>
            <td>LOA98765</td>
            <td>INV00456</td>
            <td>Pending</td>
            <td><a href="view-bill2.pdf">View</a></td>
            <td>2025-01-18</td>
        </tr>
        <tr>
            <td>Robert Brown</td>
            <td>Brown & Co.</td>
            <td>Consulting</td>
            <td>7654321098</td>
            <td>robertbrown@example.com</td>
            <td>LOA45678</td>
            <td>INV00789</td>
            <td>Overdue</td>
            <td><a href="view-bill3.pdf">View</a></td>
            <td>2025-01-20</td>
        </tr>
        <tr>
            <td>Emily Davis</td>
            <td>Davis Engineering</td>
            <td>Mechanical</td>
            <td>6543210987</td>
            <td>emilydavis@example.com</td>
            <td>LOA54321</td>
            <td>INV00234</td>
            <td>Paid</td>
            <td><a href="view-bill4.pdf">View</a></td>
            <td>2025-01-22</td>
        </tr>
        <tr>
            <td>Michael Johnson</td>
            <td>Johnson Enterprises</td>
            <td>Electrical</td>
            <td>5432109876</td>
            <td>michaeljohnson@example.com</td>
            <td>LOA67890</td>
            <td>INV00567</td>
            <td>Pending</td>
            <td><a href="view-bill5.pdf">View</a></td>
            <td>2025-01-23</td>
        </tr>
    </tbody>
</table>


            </div>
    </div>
  )
}
