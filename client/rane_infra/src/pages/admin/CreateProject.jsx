import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, ToastContainer, Toast, Spinner } from 'react-bootstrap';
import { FaProjectDiagram, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FiSend, FiX } from 'react-icons/fi';
import { createProject } from '../../services/project.service.js';

const C = {
  primary: '#6b3e2b',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
};

const EMPTY_FORM = { projectId: '', projectName: '', description: '' };

export default function CreateProject() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Toast state — variant drives icon + color, message drives the text
  const [toast, setToast] = useState({ show: false, variant: 'success', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => setFormData(EMPTY_FORM);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId.trim() || !formData.projectName.trim()) {
      setToast({ show: true, variant: 'warning', text: 'Project ID and Project name are required.' });
      return;
    }
    setSubmitting(true);
    try {
      await createProject(formData);
      // Reset straight to a blank form, as if visiting the page fresh
      setFormData(EMPTY_FORM);
      setToast({ show: true, variant: 'success', text: 'Your project has been created successfully as a draft.' });
    } catch (err) {
      setToast({ show: true, variant: 'error', text: err.message || 'Failed to create project.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toastColors = {
    success: { bg: 'var(--success)', border: 'var(--success-border)', text: C.success, icon: <FaCheckCircle size={15} color={C.success} /> },
    warning: { bg: 'var(--warning)', border: 'var(--warning-border)', text: '#4a1f18', icon: <FaTimesCircle size={15} color="#4a1f18" /> },
    error: { bg: 'var(--destructive-bg)', border: 'var(--destructive-border)', text: C.destructive, icon: <FaTimesCircle size={15} color={C.destructive} /> },
  };
  const tc = toastColors[toast.variant] || toastColors.success;

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '0 2px' }}>

      {/* ── Toast ── */}
      <ToastContainer position="top-end" className="p-3" style={{ position: 'fixed', zIndex: 1080 }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          delay={4000}
          autohide
          style={{ background: tc.bg, border: `1px solid ${tc.border}`, minWidth: 300 }}
        >
          <Toast.Body className="d-flex align-items-center gap-2" style={{ color: tc.text, fontSize: 13.5, fontWeight: 500 }}>
            {tc.icon}
            <span style={{ flex: 1 }}>{toast.text}</span>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Card
        className="border-0"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 10px var(--shadow-color)' }}
      >
        <Card.Header
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
          className="d-flex align-items-center gap-2"
        >
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--warning)' }}
          >
            <FaProjectDiagram size={16} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>Create Project</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Basic details only — everything else is added after the draft is created
            </div>
          </div>
        </Card.Header>

        <Card.Body style={{ padding: '18px 20px' }}>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Project ID *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  placeholder="e.g. RNS-2026-0042"
                  required
                  style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              </Col>
              <Col md={6}>
                <Form.Label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Project name *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g. Platform shelter upgrade"
                  required
                  style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              </Col>
              <Col md={12}>
                <Form.Label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Description{' '}
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 20, padding: '1px 7px', marginLeft: 4 }}>
                    Optional
                  </span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the project scope…"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)', resize: 'vertical' }}
                />
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                onClick={handleClear}
                disabled={submitting}
                style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}
                className="d-flex align-items-center gap-2"
              >
                <FiX size={14} /> Clear
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                style={{ background: 'var(--primary)', border: 'none', fontSize: 13, fontWeight: 600, opacity: submitting ? 0.7 : 1 }}
                className="d-flex align-items-center gap-2"
              >
                {submitting
                  ? <><Spinner animation="border" size="sm" /> Creating…</>
                  : <><FiSend size={14} /> Create project</>}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}