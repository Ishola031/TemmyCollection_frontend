
"use client";

import { useState } from "react";
import { BellRing, CheckCircle2, LoaderCircle } from "lucide-react";
import { enableCustomerPushNotifications } from "../../app/lib/customerPushNotifications";

export default function EnableCustomerNotifications() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleEnable() {
    if (loading) return;

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      await enableCustomerPushNotifications();

      setEnabled(true);
      setMessage("Device notifications are enabled.");
    } catch (err) {
      console.error("Customer push setup failed:", err);

      setError(true);

      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 409) {
        setMessage(
          detail ||
            "This browser subscription belongs to another account. Use a separate browser profile to enable customer notifications without affecting admin notifications."
        );
      } else {
        setMessage(
          detail ||
            err?.response?.data?.error ||
            err?.message ||
            "Could not enable notifications. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleEnable}
        disabled={loading || enabled}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        {loading ? (
          <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" />
        ) : enabled ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <BellRing className="h-5 w-5 shrink-0" />
        )}

        <span>
          {loading
            ? "Enabling notifications..."
            : enabled
              ? "Notifications enabled"
              : "Enable device notifications"}
        </span>
      </button>

      {message && (
        <p
          role="status"
          className={`mt-2 px-3 text-xs leading-5 ${
            error ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
