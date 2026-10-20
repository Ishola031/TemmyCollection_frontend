
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
  Minus,
  LoaderCircle,
  Send,
  Save,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  Users,
  Search,
  RefreshCw,
  Check,
  Mail,
  X,
} from "lucide-react";
import adminApi from "../../../../api/adminApi";

const getList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.subscribers)) return data.subscribers;

  return [];
};

const defaultBlocks = [
  { type: "heading", text: "New Arrivals Are Here!" },
  {
    type: "paragraph",
    content:
      "Discover the latest styles at TemmyCollection. Find your next favourite look today.",
  },
  { type: "button", label: "Shop Now", url: "" },
];

const blockOptions = [
  { value: "heading", label: "Heading", icon: Type },
  { value: "paragraph", label: "Paragraph", icon: Type },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "button", label: "Button", icon: LinkIcon },
  { value: "divider", label: "Divider", icon: Minus },
  { value: "spacer", label: "Spacer", icon: Minus },
  { value: "product", label: "Product", icon: ImageIcon },
  { value: "product_grid", label: "Product grid", icon: ImageIcon },
  { value: "social_links", label: "Social links", icon: LinkIcon },
];

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
      />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </span>
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
      />
    </label>
  );
}

function BlockEditor({ block, index, onChange, onRemove, onMove, total }) {
  const update = (field, value) => onChange(index, field, value);

  const Icon =
    blockOptions.find((option) => option.value === block.type)?.icon || Type;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gray-100 p-2">
            <Icon size={17} className="text-gray-700" />
          </div>
          <div>
            <p className="text-sm font-semibold capitalize text-gray-900">
              {(block.type || "content").replaceAll("_", " ")}
            </p>
            <p className="text-xs text-gray-400">Content block {index + 1}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            aria-label="Move block up"
          >
            <ChevronUp size={17} />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            aria-label="Move block down"
          >
            <ChevronDown size={17} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
            aria-label="Remove block"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {block.type === "heading" && (
        <Field
          label="Heading text"
          value={block.text}
          onChange={(value) => update("text", value)}
          placeholder="Enter your heading"
        />
      )}

      {block.type === "paragraph" && (
        <TextField
          label="Paragraph text"
          value={block.content}
          onChange={(value) => update("content", value)}
          placeholder="Write your newsletter message..."
        />
      )}

      {block.type === "image" && (
        <div className="space-y-4">
          <Field
            label="Image URL"
            value={block.url}
            onChange={(value) => update("url", value)}
            placeholder="https://example.com/image.jpg"
          />
          <Field
            label="Alternative text"
            value={block.alt}
            onChange={(value) => update("alt", value)}
            placeholder="Describe the image"
          />
          {block.url && (
            <img
              src={block.url}
              alt={block.alt || "Newsletter image preview"}
              className="max-h-64 w-full rounded-xl border border-gray-100 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      )}

      {block.type === "button" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Button label"
            value={block.label}
            onChange={(value) => update("label", value)}
            placeholder="Shop Now"
          />
          <Field
            label="Button URL"
            value={block.url}
            onChange={(value) => update("url", value)}
            placeholder="https://temmycollection.com"
          />
        </div>
      )}

      {block.type === "divider" && (
        <p className="py-3 text-sm text-gray-500">
          A horizontal divider will appear between content sections.
        </p>
      )}

      {block.type === "spacer" && (
        <Field
          label="Spacer height (pixels)"
          value={block.height ?? "24"}
          onChange={(value) => update("height", value)}
          type="number"
        />
      )}

      {block.type === "product" && (
        <div className="space-y-4">
          <Field
            label="Product name"
            value={block.name}
            onChange={(value) => update("name", value)}
            placeholder="Product name"
          />
          <Field
            label="Product image URL"
            value={block.image}
            onChange={(value) => update("image", value)}
            placeholder="https://example.com/product.jpg"
          />
          <Field
            label="Product URL"
            value={block.url}
            onChange={(value) => update("url", value)}
            placeholder="https://temmycollection.com/products/..."
          />
          <Field
            label="Price (optional)"
            value={block.price}
            onChange={(value) => update("price", value)}
            placeholder="₦25,000"
          />
        </div>
      )}

      {block.type === "product_grid" && (
        <TextField
          label="Products JSON"
          value={
            typeof block.products === "string"
              ? block.products
              : JSON.stringify(block.products ?? [], null, 2)
          }
          onChange={(value) => update("products", value)}
          placeholder='[{"name":"Product name","image":"https://...","url":"https://..."}]'
          rows={5}
        />
      )}

      {block.type === "social_links" && (
        <TextField
          label="Social links JSON"
          value={
            typeof block.links === "string"
              ? block.links
              : JSON.stringify(block.links ?? [], null, 2)
          }
          onChange={(value) => update("links", value)}
          placeholder='[{"label":"Instagram","url":"https://www.instagram.com/"}]'
          rows={4}
        />
      )}
    </div>
  );
}

function normalizeBlocks(blocks) {
  return (Array.isArray(blocks) ? blocks : []).map((block) => {
    const normalized = { ...block };

    for (const field of ["products", "links"]) {
      if (typeof normalized[field] === "string") {
        try {
          normalized[field] = JSON.parse(normalized[field]);
        } catch {
          throw new Error(
            `The ${field === "products" ? "product grid" : "social links"} block contains invalid JSON.`
          );
        }
      }
    }

    if (
      normalized.type === "spacer" &&
      normalized.height !== undefined &&
      normalized.height !== ""
    ) {
      normalized.height = Number(normalized.height);

      if (!Number.isFinite(normalized.height) || normalized.height < 0) {
        throw new Error("Spacer height must be a valid non-negative number.");
      }
    }

    return normalized;
  });
}

function getErrorMessage(err) {
  const data = err?.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
            ? value
            : JSON.stringify(value);

        return `${key}: ${message}`;
      })
      .join(" | ");
  }

  return err?.message || "Something went wrong. Please try again.";
}

export default function CreateCampaign({ onBack }) {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [blocks, setBlocks] = useState(defaultBlocks);

  const [audience, setAudience] = useState("all");
  const [subscribers, setSubscribers] = useState([]);
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState([]);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savedCampaign, setSavedCampaign] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop");

  useEffect(() => {
    let active = true;

    const loadTemplates = async () => {
      setLoadingTemplates(true);

      try {
        const response = await adminApi.get("templates/");
        if (active) setTemplates(getList(response));
      } catch (err) {
        if (active) {
          setError(
            getErrorMessage(err) ||
              "Saved templates could not be loaded. You can still create a campaign manually."
          );
        }
      } finally {
        if (active) setLoadingTemplates(false);
      }
    };

    loadTemplates();

    return () => {
      active = false;
    };
  }, []);

  const loadSubscribers = async () => {
    setLoadingSubscribers(true);
    setError("");

    try {
      const response = await adminApi.get("newsletter/subscribers/", {
        params: {
          status: "subscribed",
          page_size: 100,
        },
      });

      const list = getList(response).filter(
        (subscriber) => subscriber.status === "subscribed"
      );

      setSubscribers(list);
    } catch (err) {
      setError(
        getErrorMessage(err) ||
          "Subscribers could not be loaded. Please try again."
      );
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
    // Load the first subscriber page when the editor opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSubscribers = useMemo(() => {
    const query = subscriberSearch.trim().toLowerCase();

    if (!query) return subscribers;

    return subscribers.filter((subscriber) => {
      const email = subscriber.email || "";
      const userName =
        subscriber.user?.name ||
        subscriber.user?.username ||
        subscriber.name ||
        "";

      return (
        email.toLowerCase().includes(query) ||
        String(userName).toLowerCase().includes(query)
      );
    });
  }, [subscribers, subscriberSearch]);

  const selectedCount = selectedSubscriberIds.length;

  const chooseTemplate = (value) => {
    setTemplateId(value);

    if (!value) return;

    const template = templates.find(
      (item) => String(item.id) === String(value)
    );

    if (!template) return;

    setSubject(template.subject || "");
    setPreviewText(template.preview_text || "");
    setBlocks(
      Array.isArray(template.blocks) && template.blocks.length
        ? template.blocks.map((block) => ({ ...block }))
        : []
    );
  };

  const toggleSubscriber = (subscriberId) => {
    setSelectedSubscriberIds((current) =>
      current.includes(subscriberId)
        ? current.filter((id) => id !== subscriberId)
        : [...current, subscriberId]
    );
  };

  const selectVisibleSubscribers = () => {
    const visibleIds = filteredSubscribers.map((subscriber) => subscriber.id);

    setSelectedSubscriberIds((current) => [
      ...new Set([...current, ...visibleIds]),
    ]);
  };

  const clearSelection = () => setSelectedSubscriberIds([]);

  const updateBlock = (index, field, value) => {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, [field]: value } : block
      )
    );
  };

  const removeBlock = (index) => {
    setBlocks((current) => current.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    setBlocks((current) => {
      const next = [...current];
      const target = index + direction;

      if (target < 0 || target >= next.length) return current;

      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addBlock = (type) => {
    const newBlocks = {
      heading: { type: "heading", text: "Your heading" },
      paragraph: { type: "paragraph", content: "Write your message here." },
      image: { type: "image", url: "", alt: "" },
      button: { type: "button", label: "Shop Now", url: "" },
      divider: { type: "divider" },
      spacer: { type: "spacer", height: 24 },
      product: {
        type: "product",
        name: "",
        image: "",
        url: "",
        price: "",
      },
      product_grid: { type: "product_grid", products: [] },
      social_links: { type: "social_links", links: [] },
    };

    if (!newBlocks[type]) return;

    setBlocks((current) => [...current, newBlocks[type]]);
  };

  const saveCampaign = async (shouldSend) => {
    setError("");
    setNotice("");

    if (!name.trim()) {
      setError("Enter a campaign name.");
      return;
    }

    if (!subject.trim()) {
      setError("Enter an email subject.");
      return;
    }

    if (shouldSend && audience === "selected" && selectedCount === 0) {
      setError("Select at least one subscribed recipient before sending.");
      return;
    }

    if (shouldSend && audience === "selected") {
      const selectedIdsAreValid = selectedSubscriberIds.every((id) =>
        subscribers.some(
          (subscriber) =>
            String(subscriber.id) === String(id) &&
            subscriber.status === "subscribed"
        )
      );

      if (!selectedIdsAreValid) {
        setError(
          "Some selected subscribers are no longer available. Refresh the subscriber list and select recipients again."
        );
        return;
      }
    }

    let finalBlocks;

    try {
      finalBlocks = normalizeBlocks(blocks);
    } catch (err) {
      setError(err.message || "Please correct the content blocks.");
      return;
    }

    if (shouldSend && finalBlocks.length === 0) {
      setError("Add at least one content block before sending.");
      return;
    }

    setSaving(true);

    try {
      let campaign = savedCampaign;

      const campaignPayload = {
        name: name.trim(),
        subject: subject.trim(),
        preview_text: previewText.trim(),
        template: templateId ? Number(templateId) : null,
        blocks: finalBlocks,
      };

      if (!campaign?.id) {
        const response = await adminApi.post(
          "campaigns/",
          campaignPayload
        );

        campaign = response.data;
        setSavedCampaign(campaign);
      } else {
        const response = await adminApi.patch(
          `campaigns/${campaign.id}/`,
          campaignPayload
        );

        campaign = response.data;
        setSavedCampaign(campaign);
      }

      if (!shouldSend) {
        setNotice("Campaign draft saved successfully.");
        return;
      }

      const sendPayload = {
        audience,
        ...(audience === "selected"
          ? { subscriber_ids: selectedSubscriberIds }
          : {}),
      };

      const sendResponse = await adminApi.post(
        `campaigns/${campaign.id}/send/`,
        sendPayload
      );

      setNotice(
        sendResponse?.data?.message ||
          "The campaign send request was accepted. Check recipient tracking for email outcomes."
      );
    } catch (err) {
      setError(getErrorMessage(err) || "The campaign could not be saved or sent.");
    } finally {
      setSaving(false);
    }
  };

  const renderPreviewBlock = (block, index) => {
    switch (block.type) {
      case "heading":
        return (
          <h2
            key={index}
            className="my-4 text-2xl font-bold leading-tight text-gray-900"
          >
            {block.text || "Your heading"}
          </h2>
        );

      case "paragraph":
        return (
          <p
            key={index}
            className="my-4 whitespace-pre-wrap text-sm leading-7 text-gray-600"
          >
            {block.content || "Your message will appear here."}
          </p>
        );

      case "image":
        return block.url ? (
          <img
            key={index}
            src={block.url}
            alt={block.alt || ""}
            className="my-4 max-h-72 w-full rounded-xl object-cover"
          />
        ) : (
          <div
            key={index}
            className="my-4 flex h-36 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400"
          >
            Add an image URL
          </div>
        );

      case "button":
        return (
          <div key={index} className="my-6 text-center">
            <span className="inline-flex rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white">
              {block.label || "Button"}
            </span>
          </div>
        );

      case "divider":
        return <hr key={index} className="my-6 border-gray-200" />;

      case "spacer":
        return (
          <div
            key={index}
            style={{
              height: `${Math.min(
                Math.max(Number(block.height) || 24, 0),
                200
              )}px`,
            }}
          />
        );

      case "product":
        return (
          <div
            key={index}
            className="my-4 rounded-xl border border-gray-100 p-3"
          >
            {block.image && (
              <img
                src={block.image}
                alt={block.name || ""}
                className="mb-3 max-h-48 w-full rounded-lg object-cover"
              />
            )}
            <p className="font-semibold text-gray-900">
              {block.name || "Product name"}
            </p>
            {block.price && (
              <p className="mt-1 text-sm text-gray-600">{block.price}</p>
            )}
          </div>
        );

      case "product_grid": {
        let products = block.products || [];

        if (typeof products === "string") {
          try {
            products = JSON.parse(products);
          } catch {
            products = [];
          }
        }

        return (
          <div key={index} className="my-4 grid grid-cols-2 gap-3">
            {Array.isArray(products) && products.length ? (
              products.map((product, productIndex) => (
                <div
                  key={`${product.name || "product"}-${productIndex}`}
                  className="rounded-xl border border-gray-100 p-2"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name || ""}
                      className="mb-2 h-24 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-gray-100">
                      <ImageIcon size={20} className="text-gray-400" />
                    </div>
                  )}
                  <p className="text-xs font-semibold text-gray-800">
                    {product.name || "Product"}
                  </p>
                  {product.price && (
                    <p className="mt-1 text-xs text-gray-500">
                      {product.price}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500">
                Add products in the product grid JSON field.
              </div>
            )}
          </div>
        );
      }

      case "social_links": {
        let links = block.links || [];

        if (typeof links === "string") {
          try {
            links = JSON.parse(links);
          } catch {
            links = [];
          }
        }

        return (
          <div key={index} className="my-5 flex flex-wrap justify-center gap-3">
            {Array.isArray(links) &&
              links.map((link, linkIndex) => (
                <span
                  key={`${link.label || "link"}-${linkIndex}`}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700"
                >
                  {link.label || "Social link"}
                </span>
              ))}
          </div>
        );
      }

      default:
        return (
          <div
            key={index}
            className="my-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"
          >
            Preview is not available for the {block.type || "unknown"} block.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to newsletter
        </button>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-600">
            TemmyCollection
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Create newsletter campaign
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Build your email, choose your recipients, save a draft, or send
            your campaign.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="break-words">{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto shrink-0 rounded-md p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p>{notice}</p>
              {savedCampaign?.id && (
                <p className="mt-1 break-all text-xs">
                  Campaign ID: {savedCampaign.id}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            {/* Campaign details */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 text-base font-bold text-gray-900">
                Campaign details
              </h2>

              <div className="space-y-4">
                <Field
                  label="Campaign name"
                  value={name}
                  onChange={setName}
                  placeholder="October Fashion Campaign"
                />

                <Field
                  label="Email subject"
                  value={subject}
                  onChange={setSubject}
                  placeholder="Discover our latest collection"
                />

                <TextField
                  label="Preview text"
                  value={previewText}
                  onChange={setPreviewText}
                  placeholder="A short summary shown beside the subject in the inbox."
                  rows={2}
                />

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Start from a saved template
                  </span>
                  <select
                    value={templateId}
                    onChange={(event) => chooseTemplate(event.target.value)}
                    disabled={loadingTemplates}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
                  >
                    <option value="">
                      {loadingTemplates
                        ? "Loading templates..."
                        : "Start from scratch"}
                    </option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {!loadingTemplates && templates.length === 0 && (
                    <span className="mt-2 block text-xs text-gray-500">
                      No saved templates were returned. You can still build a
                      campaign below.
                    </span>
                  )}
                </label>
              </div>
            </section>

            {/* Audience selection */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Choose recipients
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Send to every active subscriber or choose specific people.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAudience("all")}
                  className={`rounded-xl border p-4 text-left transition ${
                    audience === "all"
                      ? "border-rose-400 bg-rose-50 ring-1 ring-rose-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-gray-700" />
                      <span className="text-sm font-semibold text-gray-900">
                        All subscribers
                      </span>
                    </div>
                    {audience === "all" && (
                      <CheckCircle2 size={18} className="text-rose-600" />
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Send to everyone who is currently subscribed.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAudience("selected")}
                  className={`rounded-xl border p-4 text-left transition ${
                    audience === "selected"
                      ? "border-rose-400 bg-rose-50 ring-1 ring-rose-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-gray-700" />
                      <span className="text-sm font-semibold text-gray-900">
                        Selected subscribers
                      </span>
                    </div>
                    {audience === "selected" && (
                      <CheckCircle2 size={18} className="text-rose-600" />
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Choose only the subscribers you want to contact.
                  </p>
                </button>
              </div>

              {audience === "all" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <Users size={18} className="mt-0.5 shrink-0 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      All active subscribers
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Your backend will determine the complete list of
                      subscribed recipients when the campaign is processed.
                    </p>
                  </div>
                </div>
              )}

              {audience === "selected" && (
                <div className="mt-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Select subscribers
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedCount} selected
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={selectVisibleSubscribers}
                        disabled={
                          loadingSubscribers || filteredSubscribers.length === 0
                        }
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Select visible
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        disabled={selectedCount === 0}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Clear selection
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="search"
                      value={subscriberSearch}
                      onChange={(event) =>
                        setSubscriberSearch(event.target.value)
                      }
                      placeholder="Search by email or name..."
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>

                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                      <span className="text-xs font-semibold text-gray-600">
                        Subscribed contacts
                      </span>
                      <button
                        type="button"
                        onClick={loadSubscribers}
                        disabled={loadingSubscribers}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        <RefreshCw
                          size={13}
                          className={loadingSubscribers ? "animate-spin" : ""}
                        />
                        Refresh
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {loadingSubscribers ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-sm text-gray-500">
                          <LoaderCircle
                            size={22}
                            className="animate-spin text-rose-500"
                          />
                          Loading subscribers...
                        </div>
                      ) : filteredSubscribers.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <Users
                            size={25}
                            className="mx-auto mb-2 text-gray-300"
                          />
                          <p className="text-sm font-semibold text-gray-700">
                            {subscribers.length === 0
                              ? "No subscribers found"
                              : "No matching subscribers"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {subscribers.length === 0
                              ? "Check your subscriber API and try refreshing."
                              : "Try a different email address or name."}
                          </p>
                        </div>
                      ) : (
                        filteredSubscribers.map((subscriber) => {
                          const checked = selectedSubscriberIds.some(
                            (id) => String(id) === String(subscriber.id)
                          );

                          const displayName =
                            subscriber.user?.name ||
                            subscriber.user?.username ||
                            subscriber.name ||
                            "";

                          return (
                            <label
                              key={subscriber.id}
                              className={`flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50 ${
                                checked ? "bg-rose-50/60" : "bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  toggleSubscriber(subscriber.id)
                                }
                                className="h-4 w-4 shrink-0 rounded border-gray-300 accent-rose-600"
                              />

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold uppercase text-gray-600">
                                {(displayName || subscriber.email || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {displayName || subscriber.email}
                                </p>
                                {displayName && (
                                  <p className="truncate text-xs text-gray-500">
                                    {subscriber.email}
                                  </p>
                                )}
                                {!displayName && (
                                  <p className="text-xs text-gray-500">
                                    Newsletter subscriber
                                  </p>
                                )}
                              </div>

                              {checked && (
                                <Check
                                  size={17}
                                  className="shrink-0 text-rose-600"
                                />
                              )}
                            </label>
                          );
                        })
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs text-gray-500">
                        Showing {filteredSubscribers.length} of{" "}
                        {subscribers.length} loaded
                      </p>
                      <p className="text-xs font-semibold text-gray-700">
                        {selectedCount} selected
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    The subscriber endpoint currently loads up to 100
                    subscribers in this screen. If your list is larger, add
                    backend pagination loading to select subscribers beyond
                    this page.
                  </p>
                </div>
              )}
            </section>

            {/* Email content */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Email content
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Add blocks and arrange them in the order you want.
                  </p>
                </div>

                <select
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) addBlock(event.target.value);
                    event.target.value = "";
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-rose-400"
                >
                  <option value="">+ Add content block</option>
                  {blockOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 space-y-4">
                {blocks.map((block, index) => (
                  <BlockEditor
                    key={`${block.type}-${index}`}
                    block={block}
                    index={index}
                    total={blocks.length}
                    onChange={updateBlock}
                    onRemove={removeBlock}
                    onMove={moveBlock}
                  />
                ))}

                {!blocks.length && (
                  <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
                    <LayoutTemplate
                      size={28}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="text-sm font-semibold text-gray-700">
                      Your campaign is empty
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Add a heading, paragraph, image, or button to get
                      started.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Actions */}
            <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <button
                type="button"
                onClick={onBack}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => saveCampaign(false)}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  Save draft
                </button>

                <button
                  type="button"
                  onClick={() => saveCampaign(true)}
                  disabled={
                    saving ||
                    (audience === "selected" &&
                      selectedCount === 0)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}
                  {saving ? "Processing..." : "Save and send"}
                </button>
              </div>
            </section>
          </div>

          {/* Email preview */}
          <aside className="xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5">
                <h2 className="font-bold text-gray-900">Email preview</h2>
                <p className="mt-1 text-xs text-gray-500">
                  A basic content preview, not an exact inbox rendering.
                </p>

                <div className="mt-4 flex rounded-xl bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                      previewMode === "desktop"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                      previewMode === "mobile"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 p-3 sm:p-4">
                <div
                  className={`mx-auto overflow-hidden rounded-xl bg-white shadow-sm transition-all ${
                    previewMode === "mobile" ? "max-w-[280px]" : "max-w-full"
                  }`}
                >
                  <div className="border-b border-gray-100 px-4 py-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
                      TemmyCollection
                    </p>
                  </div>

                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-xs text-gray-400">Subject</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {subject || "Your campaign subject"}
                    </p>
                    {previewText && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {previewText}
                      </p>
                    )}
                  </div>

                  <div className="px-4 py-3">
                    {blocks.length ? (
                      blocks.map(renderPreviewBlock)
                    ) : (
                      <p className="py-10 text-center text-sm text-gray-400">
                        Add content blocks to preview your email.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 px-4 py-5 text-center">
                    <p className="text-xs text-gray-500">
                      You are receiving this email because you subscribed to
                      TemmyCollection updates.
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Your email delivery setup must include a working
                      unsubscribe link.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
              <strong>Before sending:</strong> check every link and image.
              Sending a campaign does not confirm delivery. Check the
              campaign&apos;s recipient tracking to verify email outcomes.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
