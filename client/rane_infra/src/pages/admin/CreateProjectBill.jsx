import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaFileInvoiceDollar, FaSave, FaPlus, FaTrash, FaBoxes, FaTimesCircle,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { getProjects, getProjectItems } from '../../services/project.service.js';
import { createProjectBill} from "../../services//projectBillService.js";

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

// GST rate baked into the "Bill amount (incl. GST)" figure — used to back
// out the tax component (billAmt - billAmt / 1.18).
const GST_RATE = 0.18;

const prettify = (v) =>
    typeof v === 'string' ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const formatAmt = (n) => (n || n === 0 ? Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—');

/* ── shared styles — same theme as EditProjectDetail / SingleProjectDetail ── */

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

const labelStyle = {
    fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const controlStyle = {
    width: '100%', border: '1px solid var(--border)', borderRadius: 8,
    padding: '9px 12px', fontSize: 13.5, color: 'var(--foreground)',
    background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

const saveButtonStyle = (busy) => ({
    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8,
    border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: busy ? 'not-allowed' : 'pointer', marginTop: 16, opacity: busy ? 0.7 : 1,
});

const secondaryButtonStyle = {
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
};

const subCardStyle = {
    background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '12px 14px', marginBottom: 10,
};

const savedTag = {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
    color: C.success, marginLeft: 12,
};

const errorTag = {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
    color: C.destructive, marginLeft: 12,
};

const summaryRowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13,
};

const summaryLabelStyle = { color: 'var(--text-muted)', fontWeight: 600 };
const summaryValueStyle = { color: 'var(--text-strong)', fontWeight: 700 };

const tableWrapStyle = { overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 700 };
const thStyle = {
    textAlign: 'left', padding: '8px 8px', fontSize: 10.5, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};
const thRightStyle = { ...thStyle, textAlign: 'right' };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };
const cellInputStyle = { ...controlStyle, padding: '6px 8px', fontSize: 12.5, minWidth: 90 };
const totalRowStyle = { fontWeight: 700, color: 'var(--text-strong)', background: 'var(--input)' };

function Field({ label, htmlFor, children }) {
    return (
        <div>
            <label htmlFor={htmlFor} style={labelStyle}>{label}</label>
            {children}
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

/* ── empty recovery row ──────────────────────────────────────────────────── */
const emptyRecovery = () => ({ recoveryType: '', code: '', desc: '', recoveryAmt: '' });

export default function CreateProjectBill() {
    const navigate = useNavigate();

    // ── projects picker ──
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [projectsError, setProjectsError] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');

    // ── items for the selected project ──
    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [itemsError, setItemsError] = useState('');
    // rows keyed by item _id: { qty, rate }
    const [itemRows, setItemRows] = useState({});

    // ── bill fields ──
    const [form, setForm] = useState({
        billNo: '',
        loaNo: '',
        agrNo: '',
        loaDate: '',
        bnsAmt: '',
        adsAmt: '',
        totalAmt: '',
        rebate: '',
        billAmtInclusiveGST: '',
        tax: '',
        grossAmount: '',
        tdsAmt: '',
    });

    // ── recovery entries ──
    const [recoveryRows, setRecoveryRows] = useState([emptyRecovery()]);

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Load the project list once on mount, using the same route the rest
    // of the app already uses to list projects.
    useEffect(() => {
        const loadProjects = async () => {
            setLoadingProjects(true);
            setProjectsError('');
            try {
                const data = await getProjects({ scope: 'all' });
                setProjects(Array.isArray(data) ? data : []);
            } catch (err) {
                setProjectsError(err.message || 'Failed to load projects');
            } finally {
                setLoadingProjects(false);
            }
        };
        loadProjects();
    }, []);

    // Whenever a project is picked, load its items and seed each row with
    // qty 0 and a starting rate pulled from the item's own ourRate.
    const handleSelectProject = async (e) => {
        const projectId = e.target.value;
        setSelectedProjectId(projectId);
        setItems([]);
        setItemRows({});
        setSaved(false);
        setError('');

        if (!projectId) return;

        setLoadingItems(true);
        setItemsError('');
        try {
            const data = await getProjectItems(projectId);
            const list = Array.isArray(data) ? data : [];
            setItems(list);
            const rows = {};
            list.forEach((it) => {
                rows[it._id] = { qty: 0, rate: it.ourRate ?? 0 };
            });
            setItemRows(rows);
        } catch (err) {
            setItemsError(err.message || 'Failed to load items');
        } finally {
            setLoadingItems(false);
        }
    };

    const handleFormChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    /* ── auto-calculation chain ─────────────────────────────────────────
       Each amount field still stays a normal, editable input — these
       effects just pre-fill the next field in the sequence the moment
       its inputs are available. Editing an upstream field re-runs the
       chain forward from that point; editing a downstream field directly
       is left alone until something upstream of it changes again.
       ──────────────────────────────────────────────────────────────── */

    // 1) Total amount = BNS + ADS
    useEffect(() => {
        if (form.bnsAmt === '' && form.adsAmt === '') {
            setForm((prev) => ({ ...prev, totalAmt: '' }));
            return;
        }
        const bns = Number(form.bnsAmt) || 0;
        const ads = Number(form.adsAmt) || 0;
        setForm((prev) => ({ ...prev, totalAmt: bns + ads }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.bnsAmt, form.adsAmt]);

    // 2) Bill amount (incl. GST) = Total amount - Rebate
    useEffect(() => {
        const total = Number(form.totalAmt) || 0;
        const rebate = Number(form.rebate) || 0;
        const billAmt = total - rebate;
        setForm((prev) => ({ ...prev, billAmtInclusiveGST: (prev.totalAmt === '' ? '' : billAmt) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.totalAmt, form.rebate]);

    // 3) Tax = GST component backed out of the inclusive bill amount
    //    Gross amount = Bill amount (incl. GST)
    useEffect(() => {
        const billAmt = Number(form.billAmtInclusiveGST) || 0;
        if (form.billAmtInclusiveGST === '') {
            setForm((prev) => ({ ...prev, tax: '', grossAmount: '' }));
            return;
        }
        const taxComponent = billAmt - billAmt / (1 + GST_RATE);
        setForm((prev) => ({
            ...prev,
            tax: Math.round(taxComponent * 100) / 100,
            grossAmount: billAmt,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.billAmtInclusiveGST]);

    const handleItemRowChange = (itemId, field, value) => {
        setItemRows((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value },
        }));
        setSaved(false);
        setError('');
    };

    const rowTotal = (row) => (Number(row?.qty) || 0) * (Number(row?.rate) || 0);
    const itemsGrandTotal = items.reduce((sum, it) => sum + rowTotal(itemRows[it._id]), 0);

    // ── recovery row helpers ──
    const handleRecoveryChange = (index, field, value) => {
        setRecoveryRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
        setSaved(false);
        setError('');
    };

    const addRecoveryRow = () => setRecoveryRows((prev) => [...prev, emptyRecovery()]);

    const removeRecoveryRow = (index) => setRecoveryRows((prev) => prev.filter((_, i) => i !== index));

    const recoveryTotal = recoveryRows.reduce((sum, r) => sum + (Number(r.recoveryAmt) || 0), 0);

    // Net payable = Gross amount - Total recoveries
    const netPayable = (Number(form.grossAmount) || 0) - recoveryTotal;

    const handleSave = async () => {
        setError('');
        setSaved(false);

        if (!selectedProjectId) {
            setError('Select a project first.');
            return;
        }

        if (!form.billNo.trim()) {
            setError('Bill No. is required.');
            return;
        }

        // Only items the user actually gave a qty to are included.
        const billedItems = items
            .filter((it) => Number(itemRows[it._id]?.qty) > 0)
            .map((it) => ({
                item: it._id,
                qty: Number(itemRows[it._id].qty),
                rate: Number(itemRows[it._id].rate) || 0,
            }));

        // Only recovery rows with a type and an amount are included.
        const recovery = recoveryRows
            .filter((r) => r.recoveryType.trim() && r.recoveryAmt !== '')
            .map((r) => ({
                recoveryType: r.recoveryType,
                code: r.code || undefined,
                desc: r.desc || undefined,
                recoveryAmt: Number(r.recoveryAmt),
            }));

        setSaving(true);
        try {
            const payload = {
                billNo: form.billNo,
                loaNo: form.loaNo || undefined,
                agrNo: form.agrNo || undefined,
                loaDate: form.loaDate || undefined,
                bnsAmt: form.bnsAmt === '' ? undefined : Number(form.bnsAmt),
                adsAmt: form.adsAmt === '' ? undefined : Number(form.adsAmt),
                totalAmt: form.totalAmt === '' ? undefined : Number(form.totalAmt),
                rebate: form.rebate === '' ? undefined : Number(form.rebate),
                billAmtInclusiveGST: form.billAmtInclusiveGST === '' ? undefined : Number(form.billAmtInclusiveGST),
                tax: form.tax === '' ? undefined : Number(form.tax),
                grossAmount: form.grossAmount === '' ? undefined : Number(form.grossAmount),
                tdsAmt: form.tdsAmt === '' ? undefined : Number(form.tdsAmt),
                items: billedItems,
                recovery,
            };
            const created = await createProjectBill(selectedProjectId, payload);
            setSaved(true);
            // Land on the project's page after a short pause so "Saved" is visible.
            if (created?._id) {
                setTimeout(() => navigate(`/admin/project/${selectedProjectId}`), 600);
            }
        } catch (err) {
            setError(err.message || 'Failed to create bill');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            padding: '0 2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'var(--foreground)',
            background: 'var(--background)',
            minHeight: '100vh',
        }}>
            {/* ── Header ── */}
            <div style={moduleCardStyle}>
                <div style={{ ...moduleBodyStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 8, background: 'var(--warning)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <FaFileInvoiceDollar size={17} color={C.primary} />
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>
                        Create Project Bill
                    </div>
                </div>
            </div>

            {/* ── Project selection ── */}
            <Module icon={<FaFileInvoiceDollar size={13} color={C.accent} />} title="Project">
                <Field label="Select project" htmlFor="projectSelect">
                    <select
                        id="projectSelect" value={selectedProjectId}
                        onChange={handleSelectProject}
                        disabled={loadingProjects || !!projectsError}
                        style={{ ...controlStyle, cursor: loadingProjects ? 'not-allowed' : 'pointer', maxWidth: 420 }}
                    >
                        <option value="">
                            {loadingProjects ? 'Loading projects…' : projectsError ? 'Failed to load projects' : 'Select a project'}
                        </option>
                        {projects.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.projectName} ({p.projectId})
                            </option>
                        ))}
                    </select>
                </Field>
                {projectsError && <div style={{ fontSize: 11.5, color: C.destructive, marginTop: 6 }}>{projectsError}</div>}
            </Module>

            {selectedProjectId && (
                <>
                    {/* ── Bill fields ── */}
                    <Module icon={<FaFileInvoiceDollar size={13} color={C.accent} />} title="Bill Details">
                        <div style={gridTwo}>
                            <Field label="Bill No." htmlFor="billNo">
                                <input id="billNo" type="text" name="billNo" value={form.billNo} onChange={handleFormChange} style={controlStyle} />
                            </Field>
                        </div>

                        <div style={subHeaderStyle}>LOA / agreement reference</div>
                        <div style={gridTwo}>
                            <Field label="LOA No." htmlFor="loaNo">
                                <input id="loaNo" type="text" name="loaNo" value={form.loaNo} onChange={handleFormChange} style={controlStyle} />
                            </Field>
                            <Field label="AGR No." htmlFor="agrNo">
                                <input id="agrNo" type="text" name="agrNo" value={form.agrNo} onChange={handleFormChange} style={controlStyle} />
                            </Field>
                            <Field label="LOA date" htmlFor="loaDate">
                                <input id="loaDate" type="date" name="loaDate" value={form.loaDate} onChange={handleFormChange} style={{ ...controlStyle, cursor: 'pointer' }} />
                            </Field>
                        </div>

                        <div style={subHeaderStyle}>Amounts</div>
                        <div style={gridTwo}>
                            <Field label="BNS amount" htmlFor="bnsAmt">
                                <input id="bnsAmt" type="number" name="bnsAmt" value={form.bnsAmt} onChange={handleFormChange} style={controlStyle} />
                            </Field>
                            <Field label="ADS amount" htmlFor="adsAmt">
                                <input id="adsAmt" type="number" name="adsAmt" value={form.adsAmt} onChange={handleFormChange} style={controlStyle} />
                            </Field>
                            <Field label="Total amount" htmlFor="totalAmt">
                                <input
                                    id="totalAmt" type="number" name="totalAmt" value={form.totalAmt}
                                    onChange={handleFormChange} style={controlStyle}
                                />
                            </Field>
                            <Field label="Rebate" htmlFor="rebate">
                                <input id="rebate" type="number" name="rebate" value={form.rebate} onChange={handleFormChange} style={controlStyle} />
                            </Field>
                            <Field label="Bill amount (incl. GST)" htmlFor="billAmtInclusiveGST">
                                <input
                                    id="billAmtInclusiveGST" type="number" name="billAmtInclusiveGST" value={form.billAmtInclusiveGST}
                                    onChange={handleFormChange} style={controlStyle}
                                />
                            </Field>
                            <Field label="Tax (18% GST, backed out)" htmlFor="tax">
                                <input
                                    id="tax" type="number" name="tax" value={form.tax}
                                    onChange={handleFormChange} style={controlStyle}
                                />
                            </Field>
                            <Field label="Gross amount" htmlFor="grossAmount">
                                <input
                                    id="grossAmount" type="number" name="grossAmount" value={form.grossAmount}
                                    onChange={handleFormChange} style={controlStyle}
                                />
                            </Field>
                            <Field label="TDS amount" htmlFor="tdsAmt">
                                <input id="tdsAmt" type="number" name="tdsAmt" value={form.tdsAmt} onChange={handleFormChange} style={controlStyle} />
                            </Field>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                            Total, bill amount, tax and gross amount are pre-filled as you go — BNS + ADS → Total,
                            Total − Rebate → Bill amount (incl. GST), which also sets Tax and Gross amount. All four stay editable.
                        </div>
                    </Module>

                    {/* ── Items — from the selected project, qty defaults to 0 ── */}
                    <Module
                        icon={<FaBoxes size={13} color={C.accent} />}
                        title="Items"
                        extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{items.length} in project</span>}
                    >
                        {loadingItems && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                                <FiRefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading items…
                            </div>
                        )}

                        {!loadingItems && itemsError && (
                            <div style={{ fontSize: 13, color: C.destructive }}>{itemsError}</div>
                        )}

                        {!loadingItems && !itemsError && items.length === 0 && (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>This project has no items yet.</div>
                        )}

                        {!loadingItems && !itemsError && items.length > 0 && (
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
                                        {items.map((it) => {
                                            const row = itemRows[it._id] || { qty: 0, rate: 0 };
                                            return (
                                                <tr key={it._id}>
                                                    <td style={tdStyle}>{it.itemNo || '—'}</td>
                                                    <td style={tdStyle}>{it.name || '—'}</td>
                                                    <td style={tdStyle}>{it.unit || '—'}</td>
                                                    <td style={tdStyle}>
                                                        <input
                                                            type="number" min="0" value={row.qty}
                                                            onChange={(e) => handleItemRowChange(it._id, 'qty', e.target.value)}
                                                            style={{ ...cellInputStyle, textAlign: 'right' }}
                                                        />
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <input
                                                            type="number" min="0" value={row.rate}
                                                            onChange={(e) => handleItemRowChange(it._id, 'rate', e.target.value)}
                                                            style={{ ...cellInputStyle, textAlign: 'right' }}
                                                        />
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
                                                        {rowTotal(row).toLocaleString('en-IN')}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr style={totalRowStyle}>
                                            <td style={tdStyle} colSpan={5}>Total (only items with qty &gt; 0 are saved)</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{itemsGrandTotal.toLocaleString('en-IN')}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </Module>

                    {/* ── Recovery — add multiple entries ── */}
                    <Module
                        icon={<FaFileInvoiceDollar size={13} color={C.accent} />}
                        title="Recovery"
                        extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{recoveryRows.length} entr{recoveryRows.length === 1 ? 'y' : 'ies'}</span>}
                    >
                        {recoveryRows.map((row, i) => (
                            <div key={i} style={subCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>Entry {i + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeRecoveryRow(i)}
                                        disabled={recoveryRows.length === 1}
                                        style={{
                                            border: 'none', background: 'transparent',
                                            color: recoveryRows.length === 1 ? 'var(--text-muted)' : C.destructive,
                                            cursor: recoveryRows.length === 1 ? 'not-allowed' : 'pointer', padding: 4,
                                        }}
                                        title="Remove entry"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                                <div style={gridTwo}>
                                    <Field label="Recovery type" htmlFor={`recoveryType-${i}`}>
                                        <input
                                            id={`recoveryType-${i}`} type="text" value={row.recoveryType}
                                            onChange={(e) => handleRecoveryChange(i, 'recoveryType', e.target.value)}
                                            style={controlStyle}
                                        />
                                    </Field>
                                    <Field label="Code" htmlFor={`recoveryCode-${i}`}>
                                        <input
                                            id={`recoveryCode-${i}`} type="text" value={row.code}
                                            onChange={(e) => handleRecoveryChange(i, 'code', e.target.value)}
                                            style={controlStyle}
                                        />
                                    </Field>
                                    <Field label="Description" htmlFor={`recoveryDesc-${i}`}>
                                        <input
                                            id={`recoveryDesc-${i}`} type="text" value={row.desc}
                                            onChange={(e) => handleRecoveryChange(i, 'desc', e.target.value)}
                                            style={controlStyle}
                                        />
                                    </Field>
                                    <Field label="Recovery amount" htmlFor={`recoveryAmt-${i}`}>
                                        <input
                                            id={`recoveryAmt-${i}`} type="number" value={row.recoveryAmt}
                                            onChange={(e) => handleRecoveryChange(i, 'recoveryAmt', e.target.value)}
                                            style={controlStyle}
                                        />
                                    </Field>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                            <button type="button" onClick={addRecoveryRow} style={secondaryButtonStyle}>
                                <FaPlus size={11} /> Add recovery
                            </button>
                        </div>

                        <div style={subHeaderStyle}>Summary</div>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Total recoveries</span>
                            <span style={summaryValueStyle}>{formatAmt(recoveryTotal)}</span>
                        </div>
                        <div style={{ ...summaryRowStyle, borderBottom: 'none' }}>
                            <span style={summaryLabelStyle}>Net payable (Gross − Total recoveries)</span>
                            <span style={{ ...summaryValueStyle, color: C.success }}>{formatAmt(netPayable)}</span>
                        </div>
                    </Module>

                    {/* ── Save ── */}
                    <Module icon={<FaFileInvoiceDollar size={13} color={C.accent} />} title="Save Bill">
                        <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                            <FaSave size={12} /> {saving ? 'Saving…' : 'Create bill'}
                        </button>
                        {saved && <span style={savedTag}>Bill created</span>}
                        {error && <span style={errorTag}>{error}</span>}
                    </Module>
                </>
            )}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}