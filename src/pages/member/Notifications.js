import { useState, useEffect } from "react";
import api from "../../api";
import MemberNavbar from "./MemberNavbar";
import "./notifications.css";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchNotifications();
    }, []);

    /* ================= FETCH NOTIFICATIONS ================= */
    const fetchNotifications = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/api/notifications/my/");
            setNotifications(res.data);
        } catch (err) {
            console.log("Notification load error", err);
            setError("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    /* ================= MARK AS READ ================= */
    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/read/${id}/`);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                )
            );
        } catch (err) {
            console.log("Mark read error", err);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return date.slice(0, 10);
    };

    return (
        <div className="with-navbar">
            <MemberNavbar />

            <div className="notifications-container">
                <h2 className="notifications-title">🔔 Notifications</h2>

                {loading && <p className="loading-text">Loading notifications...</p>}
                {error && <p className="error-text">{error}</p>}

                {!loading && notifications.length === 0 && (
                    <p className="no-notifications">No notifications</p>
                )}

                {!loading && notifications.length > 0 && (
                    <ul className="notifications-list">
                        {notifications.map((n) => (
                            <li
                                key={n.id}
                                className={`notification-item ${
                                    n.is_read ? "read" : "unread"
                                }`}
                            >
                                <div className="notification-header">
                                    <span className={`notification-type ${n.notif_type}`}>
                                        {n.notif_type.toUpperCase()}
                                    </span>
                                    <span className="notification-date">
                                        {formatDate(n.created_at)}
                                    </span>
                                </div>

                                <p className="notification-message">
                                    {n.message}
                                </p>

                                <div className="notification-action">
                                    {!n.is_read ? (
                                        <button
                                            className="btn mark-read-btn"
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            Mark as Read
                                        </button>
                                    ) : (
                                        <span className="read-badge">Read</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Notifications;
