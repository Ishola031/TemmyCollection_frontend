"use client";

import { useState } from "react";
import adminApi from "../api/adminApi";
import { enableAdminPushNotifications } from "../../app/lib/pushNotifications";

export default function EnableAdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleEnable() {
    setLoading(true);
    setMessage("");

    try {
      await enableAdminPushNotifications(adminApi);
      setMessage("Browser notifications enabled successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          error.message ||
          "Could not enable notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Enabling..." : "Enable notifications"}
      </button>

      {message && <p role="status">{message}</p>}
    </div>
  );
}