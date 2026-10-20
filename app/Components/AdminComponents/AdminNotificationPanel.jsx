
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Package,
  Users,
  Megaphone,
  Settings,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import notificationApi from "../../api/notificationApi";

const categoryIcons = {
  order: ShoppingBag,
  payment: CreditCard,
  inventory: Package,
  customer: Users,
  promotion: Megaphone,
  system: Settings,
};

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminNotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const loadNotifications = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const params = { page_size: 50 };

      if (filter === "unread") {
        params.is_read = false;
      } else if (filter === "read") {
        params.is_read = true;
      }

      const [notificationData, countData] = await Promise.all([
        notificationApi.getNotifications(params),
        notificationApi.getUnreadCount(),
      ]);

      const items = Array.isArray(notificationData)
        ? notificationData
        : notificationData.results || [];

      setNotifications(items);

      const count =
        typeof countData === "number"
          ? countData
          : countData.unread_count ??
            countData.count ??
            countData.unread ??
            0;

      setUnreadCount(Number(count) || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not load notifications. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleMarkRead(notification) {
    if (notification.is_read || busyId !== null) return;

    setBusyId(notification.id);

    try {
      await notificationApi.markAsRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not mark notification as read."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0 || busyId !== null) return;

    setBusyId("all");

    try {
      await notificationApi.markAllAsRead();

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not mark all notifications as read."
      );
    } finally {
      setBusyId(null);
    }
  }

  function refresh() {
    setRefreshing(true);
    loadNotifications(false);
  }

  return (
    <section className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-3">
              <Bell className="h-6 w-6 text-gray-800" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Your store updates and activity alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || busyId !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Unread notifications</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {unreadCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Notifications loaded</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Read notifications</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {notifications.filter((item) => item.is_read).length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
          <div>
            <h2 className="font-semibold text-gray-900">Recent activity</h2>
            <p className="mt-1 text-xs text-gray-500">
              Select a notification to mark it as read.
            </p>
          </div>

          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
              { value: "read", label: "Read" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  filter === item.value
                    ? "bg-white font-semibold text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="m-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-gray-100 p-4">
              <Bell className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              No notifications found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              New store alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const Icon =
                categoryIcons[notification.category] || Bell;

              const content = (
                <div
                  className={`flex gap-3 p-4 transition hover:bg-gray-50 ${
                    !notification.is_read ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="h-fit rounded-xl bg-gray-100 p-3">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>

                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>

                  {notification.is_read ? (
                    <Check className="h-4 w-4 shrink-0 text-gray-400" />
                  ) : (
                    <span className="shrink-0 text-xs font-medium text-blue-700">
                      New
                    </span>
                  )}
                </div>
              );

              return (
                <div key={notification.id}>
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => handleMarkRead(notification)}
                      className="block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification)}
                      disabled={busyId !== null}
                      className="block w-full text-left disabled:opacity-70"
                    >
                      {content}
                    </button>
                  )}

                  {!notification.is_read && notification.link && (
                    <div className="flex justify-end border-t border-gray-100 px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification)}
                        disabled={busyId !== null}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark as read
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
