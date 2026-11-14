import { useEffect, useState } from "react";

function Navbar() {
    const [userEmail] = useState(localStorage.getItem("userEmail"));
    const [notificationCount, setNotificationCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (userEmail) {
            loadNotificationCount();
        }
    }, [userEmail]);

    async function loadNotificationCount() {
        try {
            const response = await fetch(
                `/api/notifications/unread-count?email=${encodeURIComponent(userEmail)}`
            );

            const count = await response.text();
            setNotificationCount(Number(count));
        } catch (error) {
            console.error("Notification count error:", error);
        }
    }

    async function loadNotifications() {
        try {
            const response = await fetch(
                `/api/notifications?email=${encodeURIComponent(userEmail)}`
            );

            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error("Notification error:", error);
        }
    }

    async function toggleNotifications() {
        if (showNotifications) {
            setShowNotifications(false);
            return;
        }

        setShowNotifications(true);
        await loadNotifications();
    }

    async function markAsRead(notification) {
        if (!notification.read) {
            await fetch(
                `/api/notifications/${notification.id}/read?email=${encodeURIComponent(userEmail)}`,
                { method: "PUT" }
            );

            loadNotificationCount();
        }

        setNotifications(prev =>
            prev.map(item =>
                item.id === notification.id
                    ? { ...item, read: true }
                    : item
            )
        );
    }

    function logout() {
        localStorage.removeItem("userEmail");
        window.location.reload();
    }

    return (
        <header>
            <h1>AnonConfess</h1>

            <nav id="authNav">
                {userEmail ? (
                    <>
                        <button onClick={() => window.location.href = "/create-post"}>
                            Post
                        </button>

                        <button onClick={() => window.location.href = "/my-posts"}>
                            My Posts
                        </button>

                        <button onClick={() => window.location.href = "/bookmarks"}>
                            🔖 Bookmarks
                        </button>

                        <div className="notification-wrapper">
                            <button onClick={toggleNotifications}>
                                🔔
                                <span id="notificationCount">
                                    {notificationCount > 0 ? notificationCount : ""}
                                </span>
                            </button>

                            <div
                                id="notificationBox"
                                className="notification-box"
                                style={{ display: showNotifications ? "block" : "none" }}
                            >
                                {notifications.length === 0 ? (
                                    <p className="no-notifications">No notifications</p>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={
                                                notification.read
                                                    ? "notification-item"
                                                    : "notification-item unread"
                                            }
                                            onClick={() => markAsRead(notification)}
                                        >
                                            <p>{notification.message}</p>
                                            <small>
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => window.location.href = "/login"}>
                            Login
                        </button>

                        <button onClick={() => window.location.href = "/register"}>
                            Register
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Navbar;