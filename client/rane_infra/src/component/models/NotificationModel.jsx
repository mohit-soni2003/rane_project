import React from "react";
import { Modal } from "react-bootstrap";

export default function NotificationModal({
    show,
    onHide,
    notifications,
    navigate
}) {

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="md"
        >
            {/* HEADER */}
            <Modal.Header
                closeButton
                className="border-bottom"
                style={{ background: "var(--card)" }}
            >
                <Modal.Title
                    className="fw-semibold"
                    style={{ color: "var(--text-strong)", fontSize: "16px" }}
                >
                    Notifications
                </Modal.Title>
            </Modal.Header>

            {/* BODY */}
            <Modal.Body
                className="p-3"
                style={{
                    maxHeight: "60vh",
                    overflowY: "auto",
                    background: "var(--background)"
                }}
            >
                {notifications?.length === 0 ? (
                    <div className="text-center text-muted small">
                        No notifications found
                    </div>
                ) : (
                    <ul className="list-group list-group-flush">
                        {notifications.map((n, idx) => (
                            <li
                                key={idx}
                                className="list-group-item bg-transparent px-0"
                            >
                                <div className="d-flex">

                                    {/* Timeline Dot */}
                                    <div
                                        className="rounded-circle me-3 mt-1"
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            background:
                                                n.isRead
                                                    ? "var(--muted-foreground)"
                                                    : "var(--primary)",
                                        }}
                                    ></div>

                                    {/* Content */}
                                    <div className="flex-grow-1">

                                        {/* Notification Title */}
                                        <div
                                            className="fw-semibold text-capitalize"
                                            style={{
                                                color: "var(--text-strong)",
                                                fontSize: "14px"
                                            }}
                                        >
                                            {n.title}
                                        </div>

                                        {/* Notification Message */}
                                        <div
                                            className="text-muted small mb-1"
                                            style={{ whiteSpace: "pre-line" }}
                                        >
                                            {n.message}
                                        </div>

                                        {/* Date */}
                                        <div className="text-muted small mb-2">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </div>

                                        {/* Open Button */}
                                        {n.actionUrl && (
                                            <button
                                                className="btn btn-sm"
                                                style={{
                                                    background: "var(--primary)",
                                                    color: "var(--primary-foreground)"
                                                }}
                                                onClick={() => {
                                                    onHide();
                                                    navigate(n.actionUrl);
                                                }}
                                            >
                                                Open
                                            </button>
                                        )}

                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Modal.Body>
        </Modal>
    );
}
