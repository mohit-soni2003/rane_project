import { useState, useEffect, useCallback } from 'react';
import { getMyProjectPermissions } from '../../services/permissionService';

// Matches ProjectPermission.SECTIONS on the backend — keep these two
// lists in sync if a section is ever added/renamed.
export const SECTIONS = [
    'basic', 'location', 'advance', 'bidding', 'advance_financial',
    'penalty', 'security_deposit', 'material', 'bill', 'document',
    'task', 'approvals',
];

const emptyPermissions = () => {
    const p = {};
    SECTIONS.forEach((s) => { p[s] = { view: false, edit: false }; });
    return p;
};

// One hook, called once per page (SingleProjectDetail / EditProjectDetail),
// that fetches the current user's effective permissions for a project and
// exposes simple canView(section) / canEdit(section) helpers.
export function usePermissions(projectId) {
    const [permissions, setPermissions] = useState(emptyPermissions());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError('');
        try {
            const data = await getMyProjectPermissions(projectId);
            setPermissions({ ...emptyPermissions(), ...data });
        } catch (err) {
            setError(err.message || 'Failed to load permissions');
            // Fail closed — if permissions can't be determined, show nothing
            // editable/visible rather than defaulting to open access.
            setPermissions(emptyPermissions());
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { load(); }, [load]);

    const canView = (section) => !!permissions[section]?.view;
    const canEdit = (section) => !!permissions[section]?.edit;

    return { permissions, loading, error, canView, canEdit, reload: load };
}