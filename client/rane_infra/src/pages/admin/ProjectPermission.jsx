import React, { useState, useEffect } from 'react';
import { FaUserShield, FaTimesCircle } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { getProjects } from '../../services/project.service.js';
import PermissionsModule from '../admin/PermissionModule.jsx';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

// ── shared styles — same theme as the rest of the admin pages ──
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
const labelStyle = {
    fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
    width: '100%', border: '1px solid var(--border)', borderRadius: 8,
    padding: '9px 12px', fontSize: 13.5, color: 'var(--foreground)',
    background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

export default function ProjectPermission() {
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [projectsError, setProjectsError] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');

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

    const selectedProject = projects.find((p) => p._id === selectedProjectId) || null;

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
                        <FaUserShield size={17} color={C.primary} />
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>
                        Project Permissions
                    </div>
                </div>
            </div>

            {/* ── Project selection ── */}
            <div style={moduleCardStyle}>
                <div style={moduleBodyStyle}>
                    <div style={sectionHeaderStyle}>
                        <FaUserShield size={13} color={C.accent} />
                        <span>Select Project</span>
                    </div>

                    <div>
                        <label htmlFor="permissionProjectSelect" style={labelStyle}>Project</label>
                        {loadingProjects && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                                <FiRefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading projects…
                            </div>
                        )}
                        {!loadingProjects && projectsError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.destructive }}>
                                <FaTimesCircle size={13} /> {projectsError}
                            </div>
                        )}
                        {!loadingProjects && !projectsError && (
                            <select
                                id="permissionProjectSelect"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                style={{ ...controlStyle, cursor: 'pointer', maxWidth: 420 }}
                            >
                                <option value="">Select a project</option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.projectName} ({p.projectId})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Permissions management for the selected project ── */}
            {selectedProject && <PermissionsModule project={selectedProject} />}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}