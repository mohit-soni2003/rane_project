import Modal from 'react-bootstrap/Modal';
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiX, FiAlertTriangle } from 'react-icons/fi';

function LogoutModel({ show, onClose }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response) {
        navigate("/", { replace: true });
        onClose();
      } else {
        alert("Failed to log out. Please try again.");
      }
    } catch (error) {
      alert("An error occurred during logout. Please try again.");
      console.error("Logout Error:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered animation={false} contentClassName="border-0 overflow-hidden"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>

        {/* Body */}
        <div className="text-center px-4 pt-4 pb-3">
          <div className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--destructive-bg)' }}>
            <FiAlertTriangle size={26} color="var(--destructive)" />
          </div>
          <h5 className="fw-bold mb-2" style={{ color: 'var(--text-strong)' }}>Confirm Logout</h5>
          <p className="mb-0" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Are you sure you want to log out of your account?
          </p>
        </div>

        {/* Footer */}
        <div className="d-flex gap-2 px-4 pb-4">
          <button onClick={onClose}
            className="btn flex-fill d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
            style={{ border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderRadius: 10, padding: '10px' }}>
            <FiX size={16} color="var(--secondary-foreground)" /> Cancel
          </button>
          <button onClick={handleLogout}
            className="btn flex-fill d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
            style={{ border: 'none', background: 'var(--destructive)', color: 'var(--destructive-foreground)', borderRadius: 10, padding: '10px' }}>
            <FiLogOut size={16} color="var(--destructive-foreground)" /> Logout
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default LogoutModel;