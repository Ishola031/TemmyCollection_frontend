"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Send,
  Plus,
  Search,
  RefreshCw,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  MousePointerClick,
  Ban,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import adminApi from "../../../api/adminApi";

const EMPTY_STATS = {
  subscribers: { total: 0, subscribed: 0, unsubscribed: 0 },
  welcome_emails: {
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    sending: 0,
  },
  campaigns: {
    total: 0,
    draft: 0,
    queued: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
  },
  campaign_emails: {
    total: 0,
    successful: 0,
    pending: 0,
    sending: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    bounced: 0,
    complained: 0,
    opened: 0,
    clicked: 0,
  },
};

const getList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getCount = (response, items) =>
  Number(response?.data?.count ?? response?.data?.total ?? items.length);

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString();

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusStyle = (status) => {
  const value = String(status || "").toLowerCase();

  if (["subscribed", "sent", "delivered", "successful"].includes(value)) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    ["queued", "sending", "pending", "not_sent", "draft"].includes(value)
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    ["failed", "bounced", "complained", "cancelled"].includes(value)
  ) {
    return "bg-red-50 text-red-700";
  }

  if (value === "unsubscribed") {
    return "bg-gray-100 text-gray-600";
  }

  return "bg-blue-50 text-blue-700";
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(
        status
      )}`}
    >
      {status || "Unknown"}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  details = [],
}) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-gray-500">{title}</p>

        <div className={`shrink-0 rounded-lg p-2 ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {formatNumber(value)}
      </p>

      {details.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-gray-100 pt-3">
          {details.map((item) => (
            <span
              key={item.label}
              className={`text-xs ${
                item.color || "text-gray-500"
              }`}
            >
              <span className="font-semibold">
                {formatNumber(item.value)}
              </span>{" "}
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="px-6 py-12 text-center">
      <Mail className="mx-auto mb-3 text-gray-300" size={32} />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

export default function NewsletterDashboard() {
  const [activeTab, setActiveTab] = useState("subscribers");

  const [stats, setStats] = useState(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientError, setRecipientError] = useState("");

  // Fetch aggregate statistics.
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");

    try {
      const response = await adminApi.get("newsletter/stats/");
      const data = response?.data ?? {};

      setStats({
        subscribers: {
          ...EMPTY_STATS.subscribers,
          ...(data.subscribers ?? {}),
        },
        welcome_emails: {
          ...EMPTY_STATS.welcome_emails,
          ...(data.welcome_emails ?? {}),
        },
        campaigns: {
          ...EMPTY_STATS.campaigns,
          ...(data.campaigns ?? {}),
        },
        campaign_emails: {
          ...EMPTY_STATS.campaign_emails,
          ...(data.campaign_emails ?? {}),
        },
      });
    } catch (err) {
      console.error("Newsletter stats error:", err);

      setStatsError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not load newsletter statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch subscribers and campaigns independently.
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const requests = await Promise.allSettled([
      adminApi.get("newsletter/subscribers/", {
        params: {
          page,
          page_size: pageSize,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(activeTab === "subscribers" && statusFilter !== "all"
            ? { status: statusFilter }
            : {}),
        },
      }),
      adminApi.get("campaigns/", {
        params: {
          page,
          page_size: pageSize,
        },
      }),
    ]);

    const errors = [];

    if (requests[0].status === "fulfilled") {
      const items = getList(requests[0].value);

      setSubscribers(items);
      setSubscriberCount(getCount(requests[0].value, items));
    } else {
      setSubscribers([]);
      setSubscriberCount(0);
      errors.push(
        requests[0].reason?.response?.data?.detail ||
          "Could not load subscribers."
      );
      console.error("Newsletter subscribers error:", requests[0].reason);
    }

    if (requests[1].status === "fulfilled") {
      const items = getList(requests[1].value);

      setCampaigns(items);
      setCampaignCount(getCount(requests[1].value, items));
    } else {
      setCampaigns([]);
      setCampaignCount(0);
      errors.push(
        requests[1].reason?.response?.data?.detail ||
          "Could not load campaigns."
      );
      console.error("Newsletter campaigns error:", requests[1].reason);
    }

    setError(errors.join(" "));
    setLoading(false);
  }, [page, search, statusFilter, activeTab]);

  // Run both loaders when the dashboard mounts.
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshDashboard = async () => {
    await Promise.all([loadStats(), loadData()]);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setStatusFilter("all");
    setError("");
    setNotice("");
  };

  // Subscribe or unsubscribe a subscriber.
  const updateSubscriberStatus = async (subscriber) => {
    if (!subscriber?.id) {
      setError("This subscriber has no ID.");
      return;
    }

    const currentStatus = String(subscriber.status || "").toLowerCase();

    const nextStatus =
      currentStatus === "subscribed" ? "unsubscribed" : "subscribed";

    setBusyId(subscriber.id);
    setError("");
    setNotice("");

    try {
      await adminApi.patch(
        `newsletter/subscribers/${subscriber.id}/`,
        { status: nextStatus }
      );

      setNotice(`${subscriber.email} is now ${nextStatus}.`);

      await Promise.all([loadData(), loadStats()]);
    } catch (err) {
      console.error("Update subscriber error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.status?.[0] ||
          "Could not update this subscriber."
      );
    } finally {
      setBusyId(null);
    }
  };

  // Export the currently displayed subscriber page.
  const exportSubscribers = () => {
    const headers = [
      "Email",
      "Status",
      "Subscribed At",
      "Unsubscribed At",
    ];

    const rows = subscribers.map((subscriber) => [
      subscriber.email || "",
      subscriber.status || "",
      subscriber.subscribed_at || "",
      subscriber.unsubscribed_at || "",
    ]);

    const escapeCell = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "temmycollection-newsletter-subscribers.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // View recipient delivery information for a campaign.
  const loadRecipients = async (campaign) => {
    if (!campaign?.id) return;

    setSelectedCampaign(campaign);
    setRecipients([]);
    setRecipientError("");
    setRecipientsLoading(true);

    try {
      const response = await adminApi.get(
        `campaigns/${campaign.id}/recipients/`
      );

      setRecipients(getList(response));
    } catch (err) {
      console.error("Campaign recipients error:", err);

      setRecipientError(
        err?.response?.data?.detail ||
          "Could not load campaign recipients."
      );
    } finally {
      setRecipientsLoading(false);
    }
  };

  // Send a campaign.
  const sendCampaign = async (campaign) => {
    if (!campaign?.id) return;

    const confirmed = window.confirm(
      `Send "${campaign.name || campaign.subject}" to the newsletter audience?`
    );

    if (!confirmed) return;

    setBusyId(campaign.id);
    setError("");
    setNotice("");

    try {
      const response = await adminApi.post(
        `campaigns/${campaign.id}/send/`
      );

      console.log(response.data)

      setNotice(
        response?.data?.detail ||
          response?.data?.message ||
          "Campaign send request accepted."
      );

      await Promise.all([loadData(), loadStats()]);
    } catch (err) {
      console.error("Send campaign error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "The campaign could not be sent."
      );
    } finally {
      setBusyId(null);
    }
  };

  const visibleCampaigns = campaigns.filter((campaign) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return [campaign.name, campaign.subject].some((value) =>
      String(value || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(
      (activeTab === "subscribers" ? subscriberCount : campaignCount) /
        pageSize
    )
  );

  const recipientSummary = recipients.reduce(
    (summary, recipient) => {
      const status = String(recipient.status || "").toLowerCase();

      summary.total += 1;

      if (status === "sent") summary.sent += 1;
      if (status === "delivered") summary.delivered += 1;
      if (["failed", "bounced"].includes(status)) summary.failed += 1;
      if (status === "pending") summary.pending += 1;
      if (status === "complained") summary.complained += 1;
      if (recipient.opened_at) summary.opened += 1;
      if (recipient.clicked_at) summary.clicked += 1;

      return summary;
    },
    {
      total: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
      complained: 0,
      opened: 0,
      clicked: 0,
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
              TemmyCollection
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Newsletter
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your audience and monitor campaign performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={refreshDashboard}
              disabled={loading || statsLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading || statsLoading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>


            
            <Link href="/admin/dashboard/newsletter/create">
                <div className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
                  <Plus size={17} />
                  Create campaign
                </div>
            </Link>

            <Link href="/admin/dashboard/newsletter/templates">
                <div className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
                  <Plus size={17} />
                  Create template
                </div>
            </Link>
            
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {statsError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{statsError}</span>
            </div>

            <button
              onClick={loadStats}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Compact statistics */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Overview
            </h2>

            {statsLoading && (
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <RefreshCw size={13} className="animate-spin" />
                Updating
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Subscribers"
              value={stats.subscribers.total}
              icon={Users}
              color="bg-rose-50 text-rose-600"
              details={[
                {
                  label: "subscribed",
                  value: stats.subscribers.subscribed,
                  color: "text-emerald-600",
                },
                {
                  label: "unsubscribed",
                  value: stats.subscribers.unsubscribed,
                  color: "text-gray-500",
                },
              ]}
            />

            <SummaryCard
              title="Welcome emails sent"
              value={stats.welcome_emails.sent}
              icon={Mail}
              color="bg-blue-50 text-blue-600"
              details={[
                {
                  label: "pending",
                  value: stats.welcome_emails.pending,
                  color: "text-amber-600",
                },
                {
                  label: "failed",
                  value: stats.welcome_emails.failed,
                  color: "text-red-600",
                },
              ]}
            />

            <SummaryCard
              title="Campaigns"
              value={stats.campaigns.total}
              icon={Send}
              color="bg-violet-50 text-violet-600"
              details={[
                {
                  label: "sent",
                  value: stats.campaigns.sent,
                  color: "text-emerald-600",
                },
                {
                  label: "drafts",
                  value: stats.campaigns.draft,
                },
                {
                  label: "failed",
                  value: stats.campaigns.failed,
                  color: "text-red-600",
                },
              ]}
            />

            <SummaryCard
              title="Campaign recipients"
              value={stats.campaign_emails.total}
              icon={MousePointerClick}
              color="bg-emerald-50 text-emerald-600"
              details={[
                {
                  label: "delivered",
                  value: stats.campaign_emails.delivered,
                  color: "text-emerald-600",
                },
                {
                  label: "opened",
                  value: stats.campaign_emails.opened,
                  color: "text-blue-600",
                },
                {
                  label: "clicked",
                  value: stats.campaign_emails.clicked,
                  color: "text-violet-600",
                },
              ]}
            />
          </div>
        </section>

        {/* Audience and campaign management */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-5 border-b border-gray-100 px-4 pt-3 sm:px-6">
            <button
              onClick={() => changeTab("subscribers")}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition ${
                activeTab === "subscribers"
                  ? "border-rose-600 text-rose-700"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Subscribers
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {formatNumber(subscriberCount)}
              </span>
            </button>

            <button
              onClick={() => changeTab("campaigns")}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition ${
                activeTab === "campaigns"
                  ? "border-rose-600 text-rose-700"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Campaign history
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {formatNumber(campaignCount)}
              </span>
            </button>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="relative w-full sm:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={
                  activeTab === "subscribers"
                    ? "Search subscribers by email..."
                    : "Search campaigns..."
                }
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {activeTab === "subscribers" && (
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-400"
                >
                  <option value="all">All statuses</option>
                  <option value="subscribed">Subscribed</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
              )}

              {activeTab === "subscribers" && (
                <button
                  onClick={exportSubscribers}
                  disabled={!subscribers.length}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Table loading state */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-gray-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading newsletter data...
            </div>
          ) : activeTab === "subscribers" ? (
            /* Subscribers table */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Subscriber</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Subscribed</th>
                    <th className="px-6 py-4 font-semibold">Unsubscribed</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id ?? subscriber.email}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {subscriber.email || "No email"}
                        </div>

                        {subscriber.user && (
                          <div className="mt-1 text-xs text-gray-500">
                            {subscriber.user.name ||
                              subscriber.user.username ||
                              "Registered customer"}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={subscriber.status} />
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(subscriber.subscribed_at)}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(subscriber.unsubscribed_at)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            updateSubscriberStatus(subscriber)
                          }
                          disabled={busyId === subscriber.id}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          {busyId === subscriber.id
                            ? "Updating..."
                            : String(subscriber.status).toLowerCase() ===
                                "subscribed"
                              ? "Unsubscribe"
                              : "Subscribe"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!subscribers.length && (
                <EmptyState message="No subscribers match your search or filter." />
              )}
            </div>
          ) : (
            /* Campaign history table */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Campaign</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Recipients</th>
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {visibleCampaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {campaign.name || "Untitled campaign"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {campaign.subject || "No subject"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatNumber(campaign.recipients)}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(campaign.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => loadRecipients(campaign)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            <Eye size={14} />
                            Recipients
                          </button>

                          {["draft", "failed"].includes(
                            String(campaign.status).toLowerCase()
                          ) && (
                            <button
                              onClick={() => sendCampaign(campaign)}
                              disabled={busyId === campaign.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Send size={14} />
                              {busyId === campaign.id
                                ? "Sending..."
                                : "Send"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!visibleCampaigns.length && (
                <EmptyState message="No campaigns match your search." />
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} ·{" "}
              {formatNumber(
                activeTab === "subscribers"
                  ? subscriberCount
                  : campaignCount
              )}{" "}
              records
            </p>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                }
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Campaign recipient tracking modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCampaign(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recipient tracking
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedCampaign.name || selectedCampaign.subject}
                </p>
              </div>

              <button
                onClick={() => setSelectedCampaign(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                aria-label="Close recipient tracking"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
              {recipientError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {recipientError}
                </div>
              )}

              {recipientsLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                  <RefreshCw size={17} className="animate-spin" />
                  Loading recipients...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCard
                      title="Recipients"
                      value={recipientSummary.total}
                      icon={Users}
                      color="bg-gray-100 text-gray-600"
                    />

                    <SummaryCard
                      title="Delivered"
                      value={recipientSummary.delivered}
                      icon={CheckCircle2}
                      color="bg-emerald-50 text-emerald-600"
                    />

                    <SummaryCard
                      title="Opened"
                      value={recipientSummary.opened}
                      icon={Eye}
                      color="bg-blue-50 text-blue-600"
                    />

                    <SummaryCard
                      title="Failed"
                      value={recipientSummary.failed}
                      icon={AlertCircle}
                      color="bg-red-50 text-red-600"
                    />
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full min-w-[600px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Sent at</th>
                          <th className="px-4 py-3">Delivered at</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {recipients.map((recipient) => (
                          <tr key={recipient.id || recipient.email}>
                            <td className="px-4 py-3 text-gray-800">
                              {recipient.email || "—"}
                            </td>

                            <td className="px-4 py-3">
                              <StatusBadge status={recipient.status} />
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {formatDate(recipient.sent_at)}
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {formatDate(recipient.delivered_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {!recipients.length && (
                      <EmptyState message="No recipient records found for this campaign." />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}