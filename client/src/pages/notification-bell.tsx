import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Bell, Trash2 } from "lucide-react";
import { Notification } from "shared/notification.schema";
import { formatDistanceToNow, formatRelative } from "date-fns";
import { fetchWithCredentials, getLoggedInUser } from "@/lib/utils";

export default function NotificationBell() {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);


    // Fetch notifications
    useEffect(() => {
        setLoadingNotifications(true);
        fetchWithCredentials(`/api/all_notifications?isHRLeader=${getLoggedInUser().group?.split(':')?.includes('hrleader')}`) 
            .then(res => res.json())
            .then(data => {
                setNotifications(data);
            })
            .catch(() => {
                setLoadingNotifications(false);
            });
    }, []);

    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

    const handleDelete = async (id: number) => {
        try {
            const response = await fetchWithCredentials(`/api/notifications/UpdateStatus`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action: "delete" }),
            });
            if (!response.ok) throw new Error("Failed to delete notification");
            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== id)
            );
        } catch (err) {
            // Optionally handle error
        }
    };


    function TimeAgo(date: string) {
        const dateObj = new Date(date).toISOString();
        //   return <span>{formatDistanceToNow(dateObj, { addSuffix: true })}</span>;
        return <span>{formatRelative(dateObj, new Date())}</span>;
    }

    return (
        <div className="relative" ref={notificationRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 left-3 px-1  h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{notifications.length}</span>
                    </span>
                )}
            </button>
            {showNotifications && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {Array.isArray(notifications) && notifications?.map((notification, index) => ( 
                            <div key={index} className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 cursor-pointer">
                                        <p className="text-sm text-gray-700"><span
                                            className="prose prose-sm dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: notification.message }}
                                        /></p>
                                        <p className="text-xs text-gray-400 mt-1">{TimeAgo(notification.createdAt)}</p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(notification.id)
                                        }}

                                        disabled={deletingId === notification.id}
                                        className="ml-2 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                        <Link
                            href="/notifications"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                            onClick={() => setShowNotifications(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

