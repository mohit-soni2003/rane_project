import React from 'react'
import "./BillShowTable.css"
import Button from 'react-bootstrap/Button';



export default function BillShowTable() {
    return (
        <>
            <div className="bill-table">
                <table border="1">
                    <thead>
                        <tr>
                            <th>Firm Name</th>
                            <th>Work Area</th>
                            <th>Phone No</th>
                            <th>Email</th>
                            <th>LOA No.</th>
                            <th>Invoice No</th>
                            <th>Payment Status</th>
                            <th>View Bill</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Example Firm</td>
                            <td>IT Services</td>
                            <td>123-456-7890</td>
                            <td>example@example.com</td>
                            <td>LOA12345</td>
                            <td>INV67890</td>
                            <td>Paid</td>
                            <td><Button variant="primary">View Bill</Button></td>
                        </tr>
                        <tr>
                            <td>Another Firm</td>
                            <td>Construction</td>
                            <td>987-654-3210</td>
                            <td>another@example.com</td>
                            <td>LOA54321</td>
                            <td>INV09876</td>
                            <td>Unpaid</td>
                            <td><Button variant="primary">View Bill</Button></td>
                        </tr>
                        <tr>
                            <td>Another Firm</td>
                            <td>Construction</td>
                            <td>987-654-3210</td>
                            <td>another@example.com</td>
                            <td>LOA54321</td>
                            <td>INV09876</td>
                            <td>Unpaid</td>
                            <td><Button variant="primary">View Bill</Button></td>
                        </tr>
                        <tr>
                            <td>Another Firm</td>
                            <td>Construction</td>
                            <td>987-654-3210</td>
                            <td>another@example.com</td>
                            <td>LOA54321</td>
                            <td>INV09876</td>
                            <td>Unpaid</td>
                            <td><Button variant="primary">View Bill</Button></td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </>
    )
}
