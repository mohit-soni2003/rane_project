import React from 'react';
import ClientHeader from '../../component/header/ClientHeader';
import {
  FaFileAlt, FaFileInvoice, FaCartPlus, FaArrowDown, FaArrowUp, FaCalculator,
  FaTruck, FaMoneyBillWave, FaUniversity, FaEllipsisH
} from 'react-icons/fa';

const documents = [
  { name: 'LOA', description: 'View all Letter of Authorization', icon: <FaFileAlt />, color: 'primary' },
  { name: 'Sales Order', description: 'View all Sales Orders', icon: <FaFileInvoice />, color: 'success' },
  { name: 'Purchase Order', description: 'View all Purchase Orders', icon: <FaCartPlus />, color: 'danger' },
  { name: 'Pay-In', description: 'View all Pay-In documents', icon: <FaArrowDown />, color: 'info' },
  { name: 'Pay-Out', description: 'View all Pay-Out documents', icon: <FaArrowUp />, color: 'warning' },
  { name: 'Estimate', description: 'View all Estimates', icon: <FaCalculator />, color: 'success' },
  { name: 'Delivery Challan', description: 'View all Delivery Challans', icon: <FaTruck />, color: 'warning' },
  { name: 'Expense', description: 'View all Expenses', icon: <FaMoneyBillWave />, color: 'purple' },
  { name: 'Bank Reference', description: 'View all Bank References', icon: <FaUniversity />, color: 'secondary' },
  { name: 'Other', description: 'View all other documents', icon: <FaEllipsisH />, color: 'dark' },
];

export default function DocumentCategory() {
  return (
    <>
      <ClientHeader />
      <div
        className="container py-4 my-3"
        style={{ backgroundColor: 'var(--client-component-bg-color)' }}
      >
        <h4 className="mb-4 fw-bold">Document Categories</h4>
        <div className="row">
          {documents.map((doc, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div
                className="card shadow-sm h-100 border-0"
                role="button"
                style={{
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div className="card-body d-flex align-items-center gap-3">
                  <div
                    className={`bg-${doc.color} bg-opacity-25 text-${doc.color} rounded-circle d-flex align-items-center justify-content-center`}
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '1.4rem',
                    }}
                  >
                    {doc.icon}
                  </div>
                  <div>
                    <h6 className="mb-1 fw-semibold">{doc.name}</h6>
                    <p
                      className="mb-0 text-muted"
                      style={{ fontSize: '0.875rem' }}
                    >
                      {doc.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
