"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FiSettings,
  FiCreditCard,
  FiTruck,
  FiMail,
  FiPackage,
  FiShoppingBag,
  FiShield,
  FiGlobe,
  FiActivity,
  FiSave,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiLock,
  FiPower,
  FiAlertTriangle,
  FiImage,
  FiClock,
} from "react-icons/fi";

import adminApi from "../../../api/adminApi";
import EnableAdminNotifications from "../../../Components/EnableAdminNotifications";
const DEFAULT_SETTINGS = {
  store_name: "TemmyCollection",
  store_description: "",
  contact_email: "",
  contact_phone: "",
  business_address: "",
  currency: "NGN",
  timezone: "Africa/Lagos",
  date_format: "DD/MM/YYYY",
  website_url: "",
  logo_url: "",
  maintenance_mode: false,
  maintenance_message:
    "We are currently improving our store. Please check back shortly.",
  maintenance_title: "We'll be back soon!",
  maintenance_allow_admin: true,
  low_stock_threshold: 10,
  allow_backorders: false,
  hide_out_of_stock: true,
  guest_checkout: true,
  minimum_order_amount: 0,
  order_prefix: "TC",
  reservation_minutes: 30,
  free_shipping_threshold: 0,
  shipping_enabled: true,
  pickup_enabled: false,
  pickup_address: "",
  email_notifications: true,
  order_email_notifications: true,
  low_stock_notifications: true,
  newsletter_enabled: true,
  sender_name: "TemmyCollection",
  sender_email: "",
  seo_title: "TemmyCollection",
  seo_description: "",
  allow_search_indexing: true,
  review_moderation: true,
};

const SECTIONS = [
  { id: "store", label: "Store profile", icon: FiShoppingBag, description: "Business identity and contact details" },
  { id: "maintenance", label: "Maintenance mode", icon: FiPower, description: "Temporarily restrict the storefront" },
  { id: "payments", label: "Payments", icon: FiCreditCard, description: "Payment provider configuration" },
  { id: "shipping", label: "Shipping & pickup", icon: FiTruck, description: "Delivery methods and prices" },
  { id: "email", label: "Email & notifications", icon: FiMail, description: "Email delivery and alerts" },
  { id: "inventory", label: "Inventory", icon: FiPackage, description: "Stock management rules" },
  { id: "checkout", label: "Orders & checkout", icon: FiShoppingBag, description: "Checkout and reservation rules" },
  { id: "security", label: "Security", icon: FiShield, description: "Access control and account safety" },
  { id: "seo", label: "SEO & social", icon: FiGlobe, description: "Search engine appearance" },
  { id: "system", label: "System status", icon: FiActivity, description: "Store services and integrations" },
];

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first)) return String(first[0]);
    if (typeof first === "string") return first;
  }

  if (error?.response?.status === 404) {
    return "The settings API has not been created yet. Build the Django settings endpoint before saving.";
  }

  return error?.message || "Something went wrong. Please try again.";
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", ...props }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${props.className || ""}`}
    />
  );
}

function SelectInput({ value, onChange, children }) {
  return (
    <select
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
    >
      {children}
    </select>
  );
}

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-slate-900" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SettingRow({ title, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SaveButton({ saving, onClick, label = "Save changes" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? (
        <FiRefreshCw className="animate-spin" size={16} />
      ) : (
        <FiSave size={16} />
      )}
      {saving ? "Saving..." : label}
    </button>
  );
}

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState("store");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [initialSettings, setInitialSettings] = useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [maintenanceConfirm, setMaintenanceConfirm] = useState(null);
  const [showSensitive, setShowSensitive] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await adminApi.get("settings/");
      const received = response.data?.settings || response.data || {};
      const merged = { ...DEFAULT_SETTINGS, ...received };

      setSettings(merged);
      setInitialSettings(merged);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const update = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSuccess("");
  };

  const dirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const saveSettings = async (keys = Object.keys(settings)) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = Object.fromEntries(
        keys.map((key) => [key, settings[key]])
      );

      const response = await adminApi.patch("settings/", payload);
      const received = response.data?.settings || response.data || {};
      const saved = { ...settings, ...received };

      setSettings(saved);
      setInitialSettings(saved);
      setSuccess("Your settings have been saved successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveSection = async (section) => {
    const fields = {
      store: [
        "store_name", "store_description", "contact_email",
        "contact_phone", "business_address", "currency",
        "timezone", "date_format", "website_url", "logo_url",
      ],
      maintenance: [
        "maintenance_mode", "maintenance_message",
        "maintenance_title", "maintenance_allow_admin",
      ],
      payments: [],
      shipping: [
        "shipping_enabled", "free_shipping_threshold",
        "pickup_enabled", "pickup_address",
      ],
      email: [
        "email_notifications", "order_email_notifications",
        "low_stock_notifications", "newsletter_enabled",
        "sender_name", "sender_email",
      ],
      inventory: [
        "low_stock_threshold", "allow_backorders", "hide_out_of_stock",
      ],
      checkout: [
        "guest_checkout", "minimum_order_amount",
        "order_prefix", "reservation_minutes",
      ],
      security: [],
      seo: [
        "seo_title", "seo_description", "allow_search_indexing",
        "review_moderation",
      ],
      system: [],
    };

    const keys = fields[section] || [];
    if (keys.length) await saveSettings(keys);
  };

  const handleMaintenanceChange = (enabled) => {
    setError("");
    setSuccess("");
    setMaintenanceConfirm(enabled);
  };

  const confirmMaintenanceChange = async () => {
    const enabled = maintenanceConfirm;
    setMaintenanceConfirm(null);

    setSettings((current) => ({
      ...current,
      maintenance_mode: enabled,
    }));

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await adminApi.patch("settings/", {
        maintenance_mode: enabled,
        maintenance_title: settings.maintenance_title,
        maintenance_message: settings.maintenance_message,
        maintenance_allow_admin: settings.maintenance_allow_admin,
      });

      const received = response.data?.settings || response.data || {};
      const saved = { ...settings, ...received, maintenance_mode: enabled };

      setSettings(saved);
      setInitialSettings((current) => ({ ...current, ...saved }));
      setSuccess(
        enabled
          ? "Maintenance mode has been enabled."
          : "Maintenance mode has been disabled. Your storefront can reopen."
      );
    } catch (err) {
      setSettings((current) => ({
        ...current,
        maintenance_mode: !enabled,
      }));
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    setTestingEmail(true);
    setError("");
    setSuccess("");

    try {
      // Implement this endpoint on the Django backend.
      const response = await adminApi.post("settings/test-email/", {
        email: settings.sender_email || settings.contact_email,
      });

      setSuccess(
        response.data?.message || "Test email request completed successfully."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTestingEmail(false);
    }
  };

  const active = SECTIONS.find((section) => section.id === activeSection);
  const ActiveIcon = active?.icon || FiSettings;

  const renderStore = () => (
    <>
      <SectionHeading
        eyebrow="General"
        title="Store profile"
        description="Manage your business identity, contact information and regional preferences."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Field label="Store name">
          <TextInput value={settings.store_name} onChange={(v) => update("store_name", v)} placeholder="TemmyCollection" />
        </Field>
        <Field label="Website URL">
          <TextInput value={settings.website_url} onChange={(v) => update("website_url", v)} placeholder="https://yourstore.com" />
        </Field>
        <Field label="Contact email">
          <TextInput type="email" value={settings.contact_email} onChange={(v) => update("contact_email", v)} placeholder="hello@yourstore.com" />
        </Field>
        <Field label="Contact phone">
          <TextInput value={settings.contact_phone} onChange={(v) => update("contact_phone", v)} placeholder="+234..." />
        </Field>
        <Field label="Currency">
          <SelectInput value={settings.currency} onChange={(v) => update("currency", v)}>
            <option value="NGN">NGN — Nigerian Naira</option>
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="EUR">EUR — Euro</option>
          </SelectInput>
        </Field>
        <Field label="Time zone">
          <SelectInput value={settings.timezone} onChange={(v) => update("timezone", v)}>
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
            <option value="UTC">UTC</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
          </SelectInput>
        </Field>
        <Field label="Date format">
          <SelectInput value={settings.date_format} onChange={(v) => update("date_format", v)}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </SelectInput>
        </Field>
        <Field label="Business address">
          <TextInput value={settings.business_address} onChange={(v) => update("business_address", v)} placeholder="Business address" />
        </Field>
        <div className="lg:col-span-2">
          <Field label="Store description">
            <textarea
              rows={4}
              value={settings.store_description}
              onChange={(e) => update("store_description", e.target.value)}
              placeholder="Tell customers about your store..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="Store logo URL" hint="Use your existing Cloudinary image URL. Actual file uploads can be added separately.">
            <TextInput value={settings.logo_url} onChange={(v) => update("logo_url", v)} placeholder="https://res.cloudinary.com/..." />
          </Field>
          {settings.logo_url && (
            <img
              src={settings.logo_url}
              alt="Store logo preview"
              className="mt-3 h-16 max-w-48 rounded-lg border border-slate-200 bg-white object-contain p-2"
            />
          )}
        </div>
      </div>
    </>
  );

  const renderMaintenance = () => (
    <>
      <SectionHeading
        eyebrow="Store availability"
        title="Maintenance mode"
        description="Temporarily take your public storefront offline while you make important updates."
      />

      <div className={`mb-6 rounded-2xl border p-5 ${settings.maintenance_mode ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${settings.maintenance_mode ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
            {settings.maintenance_mode ? <FiAlertTriangle size={23} /> : <FiCheckCircle size={23} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-bold ${settings.maintenance_mode ? "text-amber-900" : "text-emerald-900"}`}>
              {settings.maintenance_mode ? "Maintenance mode is ON" : "Your storefront is online"}
            </p>
            <p className={`mt-1 text-sm leading-6 ${settings.maintenance_mode ? "text-amber-800" : "text-emerald-800"}`}>
              {settings.maintenance_mode
                ? "Visitors may be blocked from shopping, depending on your backend maintenance middleware."
                : "Customers can access your store normally, provided other services are healthy."}
            </p>
          </div>
          <Toggle
            checked={Boolean(settings.maintenance_mode)}
            onChange={handleMaintenanceChange}
            disabled={saving}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Field label="Maintenance page title">
          <TextInput value={settings.maintenance_title} onChange={(v) => update("maintenance_title", v)} placeholder="We'll be back soon!" />
        </Field>

        <Field label="Message to visitors" hint="Explain why the store is temporarily unavailable and reassure visitors that they can return soon.">
          <textarea
            rows={5}
            value={settings.maintenance_message}
            onChange={(e) => update("maintenance_message", e.target.value)}
            maxLength={2000}
            placeholder="We are making improvements..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {settings.maintenance_message.length}/2000
          </p>
        </Field>

        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
          <SettingRow
            title="Allow administrators through"
            description="Let authorized administrators access management tools during maintenance. The backend must enforce this rule."
            checked={settings.maintenance_allow_admin}
            onChange={(v) => update("maintenance_allow_admin", v)}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <FiLock className="mt-0.5 text-slate-500" size={18} />
            <div>
              <p className="text-sm font-semibold text-slate-800">Backend enforcement required</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                This switch saves a setting; it cannot block public requests on its own. Django must enforce maintenance mode on the storefront APIs and pages while allowing permitted admin and operational endpoints.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">Visitor page preview</p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 px-6 py-12 text-center text-white sm:px-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <FiSettings className="animate-pulse" size={28} />
            </div>
            <h3 className="mt-5 text-2xl font-bold">
              {settings.maintenance_title || "We'll be back soon!"}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300">
              {settings.maintenance_message}
            </p>
            <p className="mt-6 text-xs text-slate-400">
              {settings.store_name || "TemmyCollection"}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <SaveButton saving={saving} onClick={() => saveSection("maintenance")} />
        </div>
      </div>
    </>
  );

  const renderPayments = () => (
    <>
      <SectionHeading
        eyebrow="Checkout"
        title="Payment settings"
        description="Review payment integration status and manage provider configuration."
      />
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <FiCreditCard size={23} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">Flutterwave</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Payment credentials should remain on the Django server and in environment variables, never in browser-accessible settings.
            </p>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <FiActivity size={13} /> Connection status requires backend health endpoint
            </span>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Configure provider credentials and webhook verification on the backend. Do not store secret keys in the public settings response.
        </div>
      </div>
    </>
  );

  const renderShipping = () => (
    <>
      <SectionHeading eyebrow="Fulfilment" title="Shipping & pickup" description="Configure delivery availability and pickup options for customers." />
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5">
        <SettingRow title="Enable shipping" description="Allow customers to select delivery at checkout." checked={settings.shipping_enabled} onChange={(v) => update("shipping_enabled", v)} />
        <SettingRow title="Enable local pickup" description="Let customers collect eligible orders from your pickup location." checked={settings.pickup_enabled} onChange={(v) => update("pickup_enabled", v)} />
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Free shipping minimum (NGN)" hint="Use 0 if you don't want to configure a minimum here.">
          <TextInput type="number" min="0" value={settings.free_shipping_threshold} onChange={(v) => update("free_shipping_threshold", v === "" ? "" : Number(v))} />
        </Field>
        <Field label="Pickup address">
          <TextInput value={settings.pickup_address} onChange={(v) => update("pickup_address", v)} placeholder="Enter pickup address" />
        </Field>
      </div>
    </>
  );

  const renderEmail = () => (
    <>
      <SectionHeading eyebrow="Communications" title="Email & notifications" description="Manage store notifications and the sender identity used for customer emails." />
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5">
        <SettingRow title="Email notifications" description="Enable configured email notification workflows." checked={settings.email_notifications} onChange={(v) => update("email_notifications", v)} />
        <SettingRow title="Order email notifications" description="Send configured order-related emails to customers." checked={settings.order_email_notifications} onChange={(v) => update("order_email_notifications", v)} />
        <SettingRow title="Low-stock alerts" description="Notify administrators when inventory reaches the configured threshold." checked={settings.low_stock_notifications} onChange={(v) => update("low_stock_notifications", v)} />
        <SettingRow title="Newsletter subscriptions" description="Allow your newsletter workflows to operate." checked={settings.newsletter_enabled} onChange={(v) => update("newsletter_enabled", v)} />
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Sender name">
          <TextInput value={settings.sender_name} onChange={(v) => update("sender_name", v)} placeholder="TemmyCollection" />
        </Field>
        <Field label="Sender email">
          <TextInput type="email" value={settings.sender_email} onChange={(v) => update("sender_email", v)} placeholder="newsletter@yourdomain.com" />
        </Field>
      </div>
      <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-slate-800">Test email delivery</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Sends a test email to the configured sender/contact email using your backend integration.</p>
        </div>
        <button type="button" disabled={testingEmail} onClick={testEmail} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
          {testingEmail ? <FiRefreshCw className="animate-spin" /> : <FiMail />}
          {testingEmail ? "Sending..." : "Send test email"}
        </button>
      </div>
    </>
  );

  const renderInventory = () => (
    <>
      <SectionHeading eyebrow="Products" title="Inventory settings" description="Set defaults for stock alerts and out-of-stock products." />
      <Field label="Low-stock threshold" hint="Notify the team when a product's stock reaches this quantity.">
        <TextInput type="number" min="0" value={settings.low_stock_threshold} onChange={(v) => update("low_stock_threshold", v === "" ? "" : Number(v))} />
      </Field>
      <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5">
        <SettingRow title="Allow backorders" description="Allow customers to order products when inventory is unavailable. Ensure checkout and stock reservation logic supports this." checked={settings.allow_backorders} onChange={(v) => update("allow_backorders", v)} />
        <SettingRow title="Hide out-of-stock products" description="Hide products with no available stock from relevant storefront listings." checked={settings.hide_out_of_stock} onChange={(v) => update("hide_out_of_stock", v)} />
      </div>
    </>
  );

  const renderCheckout = () => (
    <>
      <SectionHeading eyebrow="Orders" title="Orders & checkout" description="Control checkout preferences and unpaid order reservation defaults." />
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5">
        <SettingRow title="Guest checkout" description="Allow customers to place orders without creating an account." checked={settings.guest_checkout} onChange={(v) => update("guest_checkout", v)} />
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Minimum order amount" hint="Set 0 to disable the minimum amount rule.">
          <TextInput type="number" min="0" value={settings.minimum_order_amount} onChange={(v) => update("minimum_order_amount", v === "" ? "" : Number(v))} />
        </Field>
        <Field label="Order number prefix">
          <TextInput value={settings.order_prefix} onChange={(v) => update("order_prefix", v)} placeholder="TC" maxLength={10} />
        </Field>
        <Field label="Unpaid reservation duration (minutes)" hint="Make sure this agrees with your Celery reservation release task.">
          <TextInput type="number" min="1" value={settings.reservation_minutes} onChange={(v) => update("reservation_minutes", v === "" ? "" : Number(v))} />
        </Field>
      </div>
    </>
  );

  const renderSecurity = () => (
    <>
      <SectionHeading eyebrow="Protection" title="Security & access" description="Important access and security actions should be enforced on your Django backend." />
      <div className="space-y-4">
        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5">
          <FiShield className="mt-1 text-emerald-600" size={23} />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Admin access control</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">Use your existing admin authentication and permission classes to restrict settings access to authorized staff.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5">
          <FiLock className="mt-1 text-blue-600" size={23} />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Session security</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">Review admin session expiration, refresh-token rotation, and logout behavior in your authentication endpoints.</p>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Role management, session revocation, and audit logs need their own protected backend functionality. This screen does not pretend those operations are available before their APIs exist.
        </div>
      </div>
    </>
  );

  const renderSEO = () => (
    <>
      <SectionHeading eyebrow="Discoverability" title="SEO & social" description="Configure default metadata for search engines and social sharing." />
      <div className="space-y-6">
        <Field label="Default SEO title">
          <TextInput value={settings.seo_title} onChange={(v) => update("seo_title", v)} placeholder="TemmyCollection | Shop Fashion" maxLength={70} />
        </Field>
        <Field label="Default meta description" hint="A concise summary of your store for search results.">
          <textarea rows={4} maxLength={320} value={settings.seo_description} onChange={(e) => update("seo_description", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" placeholder="Describe your store..." />
        </Field>
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5">
          <SettingRow title="Allow search engine indexing" description="Indicates whether public pages should be indexable. Your Next.js metadata and robots configuration must apply this setting." checked={settings.allow_search_indexing} onChange={(v) => update("allow_search_indexing", v)} />
          <SettingRow title="Review moderation" description="Require review moderation if your backend review workflow supports it." checked={settings.review_moderation} onChange={(v) => update("review_moderation", v)} />
        </div>
      </div>
    </>
  );

  const renderSystem = () => (
    <>
      <SectionHeading eyebrow="Operations" title="System status" description="Use health endpoints to monitor the services supporting your store." />
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: "Django API", detail: "Backend health endpoint", icon: FiActivity },
          { title: "Database", detail: "Database connection health", icon: FiPackage },
          { title: "Email provider", detail: "Brevo connection and delivery", icon: FiMail },
          { title: "Payments", detail: "Flutterwave and webhook health", icon: FiCreditCard },
          { title: "Background jobs", detail: "Celery worker and Redis", icon: FiClock },
          { title: "Image storage", detail: "Cloudinary connection", icon: FiImage },
        ].map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.title} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon size={21} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{service.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{service.detail}</p>
              </div>
              <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                Not checked
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-500">
        These are integration placeholders. Connect real backend health checks before displaying a service as online or offline.
      </p>
    </>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "store": return renderStore();
      case "maintenance": return renderMaintenance();
      case "payments": return renderPayments();
      case "shipping": return renderShipping();
      case "email": return renderEmail();
      case "inventory": return renderInventory();
      case "checkout": return renderCheckout();
      case "security": return renderSecurity();
      case "seo": return renderSEO();
      case "system": return renderSystem();
      default: return renderStore();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            {/* <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <FiSettings />
              <span>Administration</span>
              <span>/</span>
              <span className="font-medium text-slate-800">Settings</span>
            </div> */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Settings
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your store configuration, operations and preferences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <EnableAdminNotifications/>
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            {/* <SaveButton saving={saving} onClick={() => saveSection(activeSection)} /> */}
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
            <div className="flex-1">{error}</div>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><FiX /></button>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
            <div className="flex-1">{success}</div>
            <button type="button" onClick={() => setSuccess("")} aria-label="Dismiss success"><FiX /></button>
          </div>
        )}

        {settings.maintenance_mode && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <FiAlertTriangle size={19} />
            <p className="flex-1">
              <strong>Maintenance mode is enabled.</strong> Confirm that your backend is enforcing it as intended.
            </p>
            <button type="button" onClick={() => setActiveSection("maintenance")} className="font-semibold underline">
              Manage
            </button>
setSettings          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <FiSettings size={21} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Store settings</p>
                  <p className="mt-1 text-xs text-slate-500">Configuration center</p>
                </div>
              </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const selected = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-left transition lg:w-full ${
                      selected
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="text-sm font-semibold">{section.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="hidden border-t border-slate-100 p-4 lg:block">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <FiLock size={14} />
                  Secure configuration
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Protect sensitive settings with server-side permissions.
                </p>
              </div>
            </div>
          </aside>

          <main className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <ActiveIcon size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900">{active?.label}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{active?.description}</p>
              </div>
              {dirty && (
                <span className="ml-auto shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="p-5 sm:p-7">
              {loading ? (
                <div className="space-y-5">
                  <div className="h-7 w-48 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />
                  <div className="grid gap-5 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                </div>
              ) : (
                renderContent()
              )}
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
              <p className="text-xs text-slate-500">
                {dirty ? "You have changes that haven't been saved." : "Your displayed settings match the last loaded or saved values."}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={!dirty || saving}
                  onClick={() => {
                    setSettings(initialSettings);
                    setError("");
                    setSuccess("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Discard
                </button>
                <SaveButton
                  saving={saving}
                  onClick={() => saveSection(activeSection)}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {maintenanceConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${maintenanceConfirm ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
              {maintenanceConfirm ? <FiAlertTriangle size={23} /> : <FiPower size={23} />}
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {maintenanceConfirm ? "Enable maintenance mode?" : "Reopen your storefront?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {maintenanceConfirm
                ? "Customers may be unable to browse or place orders once the backend enforces maintenance mode. Existing orders and background tasks need to be handled safely."
                : "Your public storefront will become available again if your backend uses this setting to control access."}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMaintenanceConfirm(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMaintenanceChange}
                disabled={saving}
                className={`rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 ${maintenanceConfirm ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {maintenanceConfirm ? "Enable maintenance" : "Reopen storefront"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
