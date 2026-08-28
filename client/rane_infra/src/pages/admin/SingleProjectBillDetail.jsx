import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaFileInvoiceDollar, FaProjectDiagram, FaBoxes, FaExclamationTriangle,
    FaTimesCircle, FaArrowLeft,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { getProjectBillById } from '../../services/projectBillService.js';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

const GST_RATE = 0.18;

/* ── helpers ──────────────────────────────────────────────────────────────── */

const dash = (v) => (v === 0 ? '0' : v || v === false ? v : '—');

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatCurrency = (n) =>
    n || n === 0 ? '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—';

/* ── shared styles — same theme as SingleProjectDetail ── */

const moduleCardStyle = {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
    marginBottom: 14, boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
};

const moduleBodyStyle = { padding: '16px 18px' };

const sectionHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
    fontWeight: 700, fontSize: 13, color: 'var(--text-strong)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
};

const subHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: 7, margin: '16px 0 10px',
    fontWeight: 700, fontSize: 12, color: 'var(--text-strong)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
};

const gridTwo = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 18px',
};

const rowLabelStyle = {
    fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2,
};

const rowValueStyle = { fontSize: 13.5, color: 'var(--foreground)', wordBreak: 'break-word' };

const summaryRowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13,
};

const summaryLabelStyle = { color: 'var(--text-muted)', fontWeight: 600 };
const summaryValueStyle = { color: 'var(--text-strong)', fontWeight: 700 };

const backButtonStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
};

const tableWrapStyle = { overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 700 };
const thStyle = {
    textAlign: 'left', padding: '8px 10px', fontSize: 10.5, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};
const thRightStyle = { ...thStyle, textAlign: 'right' };
const tdStyle = {
    padding: '8px 10px', borderBottom: '1px solid var(--border)',
    color: 'var(--foreground)', whiteSpace: 'nowrap',
};
const tdWrapStyle = { ...tdStyle, whiteSpace: 'normal', minWidth: 160 };
const tdRightStyle = { ...tdStyle, textAlign: 'right' };
const totalRowStyle = { fontWeight: 700, color: 'var(--text-strong)', background: 'var(--input)' };

function Field({ label, children }) {
    return (
        <div>
            <div style={rowLabelStyle}>{label}</div>
            <div style={rowValueStyle}>{children}</div>
        </div>
    );
}

function Module({ icon, title, extra, children }) {
    return (
        <div style={moduleCardStyle}>
            <div style={moduleBodyStyle}>
                <div style={{ ...sectionHeaderStyle, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {icon}
                        <span>{title}</span>
                    </div>
                    {extra}
                </div>
                {children}
            </div>
        </div>
    );
}

/* ── main component ──────────────────────────────────────────────────────── */

export default function SingleProjectBillDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBill = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getProjectBillById(id);
            setBill(data);
        } catch (err) {
            setError(err.message || 'Failed to load bill');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchBill();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <div style={{
            padding: '0 2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'var(--foreground)',
            background: 'var(--background)',
            minHeight: '100vh',
        }}>
            {/* Error */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 8, marginBottom: 14, background: 'var(--destructive-bg)',
                    border: '1px solid var(--destructive-border)', fontSize: 13, color: C.destructive,
                }}>
                    <FaTimesCircle size={14} color={C.destructive} /> {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '40px 0', color: 'var(--text-muted)', fontSize: 14,
                }}>
                    <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading bill…
                </div>
            )}

            {!loading && !error && bill && (() => {
                const itemsList = bill.items || [];
                const itemsTotal = itemsList.reduce(
                    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0
                );

                const recoveryList = bill.recovery || [];
                const recoveryTotal = recoveryList.reduce((sum, r) => sum + (Number(r.recoveryAmt) || 0), 0);

                const netPayable = (Number(bill.grossAmount) || 0) - recoveryTotal;

                // Derived tax-vs-stored-tax sanity check, matching the create
                // form's 18%-backed-out convention — shown only as a reference.
                const billAmt = Number(bill.billAmtInclusiveGST) || 0;
                const expectedTax = billAmt ? billAmt - billAmt / (1 + GST_RATE) : null;

                return (
                    <>
                        {/* ── Identity module ── */}
                        <div style={moduleCardStyle}>
                            <div style={{ ...moduleBodyStyle, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 8, background: 'var(--warning)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <FaFileInvoiceDollar size={17} color={C.primary} />
                                </div>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.25 }}>
                                        {dash(bill.billNo)}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                        {bill.project?.projectName
                                            ? `${bill.project.projectName} (${bill.project.projectId || '—'})`
                                            : dash(bill.project)}
                                    </div>
                                </div>
                                <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
                                    <FaArrowLeft size={11} /> Back
                                </button>
                            </div>
                        </div>

                        {/* ── Bill details ── */}
                        <Module icon={<FaFileInvoiceDollar size={13} color={C.accent} />} title="Bill Details">
                            <div style={gridTwo}>
                                <Field label="Bill No.">{dash(bill.billNo)}</Field>
                                <Field label="LOA No.">{dash(bill.loaNo)}</Field>
                                <Field label="AGR No.">{dash(bill.agrNo)}</Field>
                                <Field label="LOA date">{formatDate(bill.loaDate)}</Field>
                            </div>

                            <div style={subHeaderStyle}>Amounts</div>
                            <div style={gridTwo}>
                                <Field label="BNS amount">{formatCurrency(bill.bnsAmt)}</Field>
                                <Field label="ADS amount">{formatCurrency(bill.adsAmt)}</Field>
                                <Field label="Total amount">{formatCurrency(bill.totalAmt)}</Field>
                                <Field label="Rebate">{formatCurrency(bill.rebate)}</Field>
                                <Field label="Bill amount (incl. GST)">{formatCurrency(bill.billAmtInclusiveGST)}</Field>
                                <Field label="Tax">{formatCurrency(bill.tax)}</Field>
                                <Field label="Gross amount">{formatCurrency(bill.grossAmount)}</Field>
                                <Field label="TDS amount">{formatCurrency(bill.tdsAmt)}</Field>
                            </div>
                            {expectedTax !== null && Math.abs(expectedTax - (Number(bill.tax) || 0)) > 0.5 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11.5, color: C.destructive }}>
                                    <FaExclamationTriangle size={11} />
                                    Stored tax differs from the 18%-backed-out value ({formatCurrency(expectedTax)}) — worth a check.
                                </div>
                            )}
                        </Module>

                        {/* ── Items ── */}
                        <Module
                            icon={<FaBoxes size={13} color={C.accent} />}
                            title="Items"
                            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{itemsList.length} item{itemsList.length === 1 ? '' : 's'}</span>}
                        >
                            {itemsList.length > 0 ? (
                                <div style={tableWrapStyle}>
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Item No.</th>
                                                <th style={thStyle}>Name</th>
                                                <th style={thStyle}>Unit</th>
                                                <th style={thRightStyle}>Qty</th>
                                                <th style={thRightStyle}>Rate</th>
                                                <th style={thRightStyle}>Line Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itemsList.map((row, i) => {
                                                const it = row.item || {};
                                                const lineTotal = (Number(row.qty) || 0) * (Number(row.rate) || 0);
                                                return (
                                                    <tr key={row._id || i}>
                                                        <td style={tdStyle}>{dash(it.itemNo)}</td>
                                                        <td style={tdWrapStyle}>{dash(it.name)}</td>
                                                        <td style={tdStyle}>{dash(it.unit)}</td>
                                                        <td style={tdRightStyle}>{dash(row.qty)}</td>
                                                        <td style={tdRightStyle}>{formatCurrency(row.rate)}</td>
                                                        <td style={tdRightStyle}>{formatCurrency(lineTotal)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr style={totalRowStyle}>
                                                <td style={tdStyle} colSpan={5}>Total</td>
                                                <td style={tdRightStyle}>{formatCurrency(itemsTotal)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No items billed.</div>
                            )}
                        </Module>

                        {/* ── Recovery ── */}
                        <Module
                            icon={<FaFileInvoiceDollar size={13} color={C.accent} />}
                            title="Recovery"
                            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{recoveryList.length} entr{recoveryList.length === 1 ? 'y' : 'ies'}</span>}
                        >
                            {recoveryList.length > 0 ? (
                                <div style={tableWrapStyle}>
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Type</th>
                                                <th style={thStyle}>Code</th>
                                                <th style={thStyle}>Description</th>
                                                <th style={thRightStyle}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recoveryList.map((r, i) => (
                                                <tr key={r._id || i}>
                                                    <td style={tdStyle}>{dash(r.recoveryType)}</td>
                                                    <td style={tdStyle}>{dash(r.code)}</td>
                                                    <td style={tdWrapStyle}>{dash(r.desc)}</td>
                                                    <td style={tdRightStyle}>{formatCurrency(r.recoveryAmt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>No recovery entries.</div>
                            )}

                            <div style={subHeaderStyle}>Summary</div>
                            <div style={summaryRowStyle}>
                                <span style={summaryLabelStyle}>Total recoveries</span>
                                <span style={summaryValueStyle}>{formatCurrency(recoveryTotal)}</span>
                            </div>
                            <div style={{ ...summaryRowStyle, borderBottom: 'none' }}>
                                <span style={summaryLabelStyle}>Net payable (Gross − Total recoveries)</span>
                                <span style={{ ...summaryValueStyle, color: C.success }}>{formatCurrency(netPayable)}</span>
                            </div>
                        </Module>

                        {/* ── Project reference ── */}
                        <Module icon={<FaProjectDiagram size={13} color={C.accent} />} title="Project">
                            <div style={gridTwo}>
                                <Field label="Project name">{dash(bill.project?.projectName)}</Field>
                                <Field label="Project ID">{dash(bill.project?.projectId)}</Field>
                                <Field label="Bill created">{formatDate(bill.createdAt)}</Field>
                                <Field label="Last updated">{formatDate(bill.updatedAt)}</Field>
                            </div>
                        </Module>
                    </>
                );
            })()}

            {!loading && !error && !bill && (
                <div style={{
                    textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)',
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                }}>
                    Bill not found.
                </div>
            )}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}