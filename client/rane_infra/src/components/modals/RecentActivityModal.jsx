import React from "react";
import { Modal } from "react-bootstrap";

export default function RecentActivityModal({ show, onHide, activities, navigate }) {
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
                    Recent Activities
                </Modal.Title>
            </Modal.Header>

            {/* BODY */}
            <Modal.Body
                className="p-3"
                style={{ maxHeight: "60vh", overflowY: "auto", background: "var(--background)" }}
            >
                {activities.length === 0 ? (
                    <div className="text-center text-muted small">No recent activity found</div>
                ) : (
                    <ul className="list-group list-group-flush">
                        {activities.map((activity, idx) => (
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
                                            background: "var(--primary)",
                                        }}
                                    ></div>

                                    {/* Content */}
                                    <div className="flex-grow-1">
                                        <div
                                            className="fw-semibold text-capitalize"
                                            style={{ color: "var(--text-strong)", fontSize: "14px" }}
                                        >
                                            {activity.actionType}
                                        </div>

                                        <div
                                            className="text-muted small"
                                        >
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </div>

                                        <div className="text-muted small mb-2">
                                            {activity.description}
                                        </div>

                                        <button
                                            className="btn btn-sm"
                                            style={{
                                                background: "var(--primary)",
                                                color: "var(--primary-foreground)"
                                            }}
                                            onClick={() => {
                                                onHide();
                                                navigate(activity.actionUrl);
                                            }}
                                        >
                                            Open
                                        </button>
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
