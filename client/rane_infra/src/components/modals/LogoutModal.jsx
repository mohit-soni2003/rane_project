import Modal from 'react-bootstrap/Modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiX, FiAlertTriangle } from 'react-icons/fi';
// THIS IS ORIGINAL LOGOUT MODAL CODE. DO NOT DELETE.--------
function LogoutModal({ show, onClose }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response) {
        toast.success("Logged out successfully!");

        // Hide the dialog, but DON'T clear auth state yet — clearing it
        // unmounts the authenticated tree (sidebar + this modal + the toast
        // container) which would kill the toast before it's seen.
        onClose();

        // Delay the teardown so the success toast is visible first, then
        // clear state, replace history, and force a clean reload.
        setTimeout(() => {
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            role: null,
          });
          navigate("/", { replace: true });
          window.location.reload();
        }, 1200);
      } else {
        toast.error("Failed to log out. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during logout. Please try again.");
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose} animation={false} centered contentClassName="border-0 overflow-hidden"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="logout-modal" style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>

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
            <button
              onClick={onClose}
              className="logout-btn logout-btn--cancel flex-fill d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
            >
              <FiX size={16} /> Cancel
            </button>
            <button
              onClick={handleLogout}
              className="logout-btn logout-btn--confirm flex-fill d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <style>{`
          .logout-btn {
            border-radius: 10px;
            padding: 10px;
            border: 1px solid transparent;
            transition: background-color .15s ease, border-color .15s ease, transform .05s ease;
            cursor: pointer;
          }
          .logout-btn:active { transform: translateY(1px); }

          .logout-btn--cancel {
            background: var(--secondary);
            color: var(--secondary-foreground);
            border-color: var(--border);
          }
          .logout-btn--cancel:hover {
            background: var(--secondary-hover);
            color: var(--secondary-foreground);
            border-color: var(--secondary-hover);
          }

          .logout-btn--confirm {
            background: var(--destructive);
            color: var(--destructive-foreground);
          }
          .logout-btn--confirm:hover {
            background: var(--accent-hover);
            color: var(--destructive-foreground);
          }

          .logout-btn svg { color: currentColor; }
        `}</style>
      </Modal>

      {/* Toasts. If App.jsx already mounts a global <ToastContainer />,
          remove this one to avoid duplicates. */}
      <ToastContainer position="top-right" autoClose={2500} newestOnTop />
    </>
  );
}

export default LogoutModal;