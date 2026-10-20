
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Copy,
  Eye,
  X,
  Save,
  Mail,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading,
  AlignLeft,
  Minus,
  Space,
  ShoppingBag,
  Grid2X2,
  Share2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  LayoutTemplate,
} from "lucide-react";

import adminApi from "../../api/adminApi";

const BLOCK_TYPES = [
  { type: "heading", label: "Heading", icon: Heading },
  { type: "paragraph", label: "Paragraph", icon: AlignLeft },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "button", label: "Button", icon: LinkIcon },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "spacer", label: "Spacer", icon: Space },
  { type: "product", label: "Product", icon: ShoppingBag },
  { type: "product_grid", label: "Product grid", icon: Grid2X2 },
  { type: "social_links", label: "Social links", icon: Share2 },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  subject: "",
  preview_text: "",
  blocks: [],
};

const createBlock = (type) => {
  const defaults = {
    heading: {
      type,
      text: "Your newsletter heading",
      level: 2,
      align: "left",
    },
    paragraph: {
      type,
      text: "Write your newsletter content here.",
      align: "left",
    },
    image: {
      type,
      url: "",
      alt: "Newsletter image",
      link: "",
    },
    button: {
      type,
      text: "Shop Now",
      url: "",
      align: "center",
    },
    divider: { type },
    spacer: { type, height: 24 },
    product: {
      type,
      name: "Product name",
      image: "",
      price: "",
      url: "",
      button_text: "View Product",
    },
    product_grid: {
      type,
      title: "Featured Products",
      products: [],
      columns: 2,
    },
    social_links: {
      type,
      title: "Follow Us",
      instagram: "",
      facebook: "",
      tiktok: "",
      x: "",
      website: "",
    },
  };

  return defaults[type] || { type };
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;

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

  return error?.message || "Something went wrong. Please try again.";
}

function unwrapList(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.templates)) return data.templates;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function Field({ label, hint, children }) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${className}`}
    />
  );
}

function TextArea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${className}`}
    />
  );
}

function Button({ children, variant = "secondary", className = "", ...props }) {
  const styles = {
    primary:
      "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700",
    secondary:
      "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    danger:
      "border border-red-200 bg-white text-red-600 hover:bg-red-50",
    ghost: "border border-transparent text-gray-500 hover:bg-gray-100",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function BlockFields({ block, onChange }) {
  const update = (key, value) => onChange({ ...block, [key]: value });

  switch (block.type) {
    case "heading":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heading text">
            <TextInput
              value={block.text || ""}
              onChange={(e) => update("text", e.target.value)}
            />
          </Field>

          <Field label="Heading size">
            <select
              value={block.level || 2}
              onChange={(e) => update("level", Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value={1}>Large</option>
              <option value={2}>Medium</option>
              <option value={3}>Small</option>
            </select>
          </Field>

          <Field label="Alignment">
            <select
              value={block.align || "left"}
              onChange={(e) => update("align", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
        </div>
      );

    case "paragraph":
      return (
        <>
          <Field label="Paragraph text">
            <TextArea
              rows={5}
              value={block.text || ""}
              onChange={(e) => update("text", e.target.value)}
              placeholder="Write your newsletter message..."
            />
          </Field>

          <Field label="Alignment">
            <select
              value={block.align || "left"}
              onChange={(e) => update("align", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
        </>
      );

    case "image":
      return (
        <div className="space-y-4">
          <Field
            label="Image URL"
            hint="Use a publicly accessible HTTPS image URL."
          >
            <TextInput
              type="url"
              value={block.url || ""}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://example.com/newsletter-image.jpg"
            />
          </Field>

          <Field label="Alternative text">
            <TextInput
              value={block.alt || ""}
              onChange={(e) => update("alt", e.target.value)}
              placeholder="Describe the image"
            />
          </Field>

          <Field label="Image link (optional)">
            <TextInput
              type="url"
              value={block.link || ""}
              onChange={(e) => update("link", e.target.value)}
              placeholder="https://example.com"
            />
          </Field>

          {block.url && (
            <img
              src={block.url}
              alt={block.alt || ""}
              className="max-h-56 w-full rounded-lg border border-gray-200 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      );

    case "button":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button text">
            <TextInput
              value={block.text || ""}
              onChange={(e) => update("text", e.target.value)}
              placeholder="Shop Now"
            />
          </Field>

          <Field label="Button URL">
            <TextInput
              type="url"
              value={block.url || ""}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://example.com/shop"
            />
          </Field>

          <Field label="Alignment">
            <select
              value={block.align || "center"}
              onChange={(e) => update("align", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
        </div>
      );

    case "spacer":
      return (
        <Field label="Space height (pixels)">
          <TextInput
            type="number"
            min={0}
            max={300}
            value={block.height ?? 24}
            onChange={(e) =>
              update(
                "height",
                Math.min(300, Math.max(0, Number(e.target.value) || 0)),
              )
            }
          />
        </Field>
      );

    case "product":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name">
            <TextInput
              value={block.name || ""}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>

          <Field label="Product price">
            <TextInput
              value={block.price ?? ""}
              onChange={(e) => update("price", e.target.value)}
              placeholder="₦25,000"
            />
          </Field>

          <Field label="Product image URL">
            <TextInput
              type="url"
              value={block.image || ""}
              onChange={(e) => update("image", e.target.value)}
              placeholder="https://example.com/product.jpg"
            />
          </Field>

          <Field label="Product page URL">
            <TextInput
              type="url"
              value={block.url || ""}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://example.com/product"
            />
          </Field>

          <Field label="Button text">
            <TextInput
              value={block.button_text || ""}
              onChange={(e) => update("button_text", e.target.value)}
            />
          </Field>
        </div>
      );

    case "product_grid":
      return (
        <div className="space-y-4">
          <Field label="Grid heading">
            <TextInput
              value={block.title || ""}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>

          <Field
            label="Products (JSON)"
            hint='Enter a JSON array, for example: [{"name":"Bag","price":"₦15000","image":"https://example.com/bag.jpg","url":"https://example.com/bag"}].'
          >
            <TextArea
              rows={6}
              value={JSON.stringify(block.products || [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  if (Array.isArray(parsed)) update("products", parsed);
                } catch {
                  // Keep the last valid products array until JSON is valid.
                }
              }}
              placeholder="[]"
            />
          </Field>

          <Field label="Columns">
            <select
              value={block.columns || 2}
              onChange={(e) => update("columns", Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
              <option value={4}>4 columns</option>
            </select>
          </Field>
        </div>
      );

    case "social_links":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section title">
            <TextInput
              value={block.title || ""}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>

          {["instagram", "facebook", "tiktok", "x", "website"].map((key) => (
            <Field key={key} label={key === "x" ? "X URL" : `${key[0].toUpperCase()}${key.slice(1)} URL`}>
              <TextInput
                type="url"
                value={block[key] || ""}
                onChange={(e) => update(key, e.target.value)}
                placeholder="https://..."
              />
            </Field>
          ))}
        </div>
      );

    case "divider":
      return (
        <p className="text-sm text-gray-500">
          Adds a horizontal divider between sections of your newsletter.
        </p>
      );

    default:
      return null;
  }
}

function BlockPreview({ block }) {
  switch (block.type) {
    case "heading": {
      const Tag = [1, 2, 3].includes(Number(block.level))
        ? `h${block.level}`
        : "h2";

      return (
        <Tag
          className="font-bold text-gray-900"
          style={{
            textAlign: block.align || "left",
            fontSize: block.level === 1 ? 28 : block.level === 3 ? 18 : 23,
          }}
        >
          {block.text || "Your heading"}
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p
          className="whitespace-pre-wrap text-sm leading-7 text-gray-700"
          style={{ textAlign: block.align || "left" }}
        >
          {block.text || "Your paragraph"}
        </p>
      );

    case "image":
      return block.url ? (
        <img
          src={block.url}
          alt={block.alt || ""}
          className="mx-auto max-h-80 w-full rounded object-contain"
        />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
          <ImageIcon className="mr-2 h-5 w-5" />
          Add an image URL
        </div>
      );

    case "button":
      return (
        <div
          className="py-2"
          style={{ textAlign: block.align || "center" }}
        >
          <span className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white">
            {block.text || "Button"}
          </span>
        </div>
      );

    case "divider":
      return <hr className="border-gray-200" />;

    case "spacer":
      return <div style={{ height: Math.min(300, Math.max(0, Number(block.height) || 0)) }} />;

    case "product":
      return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {block.image ? (
            <img
              src={block.image}
              alt={block.name || ""}
              className="h-36 w-full object-cover"
            />
          ) : (
            <div className="flex h-36 items-center justify-center bg-gray-100">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="space-y-2 p-3">
            <p className="font-medium text-gray-900">
              {block.name || "Product name"}
            </p>
            {block.price && (
              <p className="text-sm text-gray-600">{block.price}</p>
            )}
            <span className="inline-block rounded bg-indigo-600 px-3 py-2 text-xs font-medium text-white">
              {block.button_text || "View Product"}
            </span>
          </div>
        </div>
      );

    case "product_grid":
      return (
        <div className="space-y-3">
          <h3 className="text-center font-semibold text-gray-900">
            {block.title || "Featured Products"}
          </h3>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(4, Math.max(2, Number(block.columns) || 2))}, minmax(0, 1fr))`,
            }}
          >
            {(block.products || []).map((product, index) => (
              <div
                key={`${product.name || "product"}-${index}`}
                className="min-w-0 overflow-hidden rounded border border-gray-200"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name || ""}
                    className="h-20 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 items-center justify-center bg-gray-100">
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div className="p-2 text-xs">
                  <p className="truncate font-medium">
                    {product.name || "Product"}
                  </p>
                  {product.price && <p>{product.price}</p>}
                </div>
              </div>
            ))}
            {(!block.products || block.products.length === 0) && (
              <p className="col-span-full py-4 text-center text-xs text-gray-500">
                Add products using the block editor.
              </p>
            )}
          </div>
        </div>
      );

    case "social_links": {
      const links = ["instagram", "facebook", "tiktok", "x", "website"].filter(
        (key) => block[key],
      );

      return (
        <div className="space-y-2 py-3 text-center">
          <p className="font-medium text-gray-800">
            {block.title || "Follow Us"}
          </p>
          <p className="break-words text-xs text-indigo-600">
            {links.length
              ? links.map((key) => key.toUpperCase()).join(" · ")
              : "Add your social media URLs"}
          </p>
        </div>
      );
    }

    default:
      return null;
  }
}

export default function NewsletterTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminApi.get("templates/");
      setTemplates(unwrapList(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return templates;

    return templates.filter((template) =>
      [
        template.name,
        template.description,
        template.subject,
        template.preview_text,
      ].some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [templates, search]);

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, blocks: [] });
    setError("");
    setSuccess("");
    setShowPreview(false);
    setShowEditor(true);
  };

  const openEdit = (template) => {
    setEditingId(template.id);
    setForm({
      name: template.name || "",
      description: template.description || "",
      subject: template.subject || "",
      preview_text: template.preview_text || "",
      blocks: Array.isArray(template.blocks) ? template.blocks : [],
    });
    setError("");
    setSuccess("");
    setShowPreview(false);
    setShowEditor(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setShowEditor(false);
    setShowPreview(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const addBlock = (type) => {
    setForm((previous) => ({
      ...previous,
      blocks: [...previous.blocks, createBlock(type)],
    }));
  };

  const updateBlock = (index, updatedBlock) => {
    setForm((previous) => ({
      ...previous,
      blocks: previous.blocks.map((block, i) =>
        i === index ? updatedBlock : block,
      ),
    }));
  };

  const removeBlock = (index) => {
    setForm((previous) => ({
      ...previous,
      blocks: previous.blocks.filter((_, i) => i !== index),
    }));
  };

  const moveBlock = (index, direction) => {
    setForm((previous) => {
      const blocks = [...previous.blocks];
      const target = index + direction;

      if (target < 0 || target >= blocks.length) return previous;

      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];

      return { ...previous, blocks };
    });
  };

  const saveTemplate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
      preview_text: form.preview_text.trim(),
      blocks: form.blocks,
    };

    if (!payload.name || !payload.subject) {
      setError("Template name and email subject are required.");
      return;
    }

    if (!Array.isArray(payload.blocks) || payload.blocks.length > 100) {
      setError("A template can contain no more than 100 content blocks.");
      return;
    }

    setSaving(true);

    try {
      if (editingId != null) {
        await adminApi.patch(`templates/${editingId}/`, payload);
        setSuccess("Template updated successfully.");
      } else {
        await adminApi.post("templates/", payload);
        setSuccess("Template created successfully.");
      }

      await loadTemplates();
      setShowEditor(false);
      setShowPreview(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (template) => {
    const confirmed = window.confirm(
      `Delete the template "${template.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(template.id);
    setError("");
    setSuccess("");

    try {
      await adminApi.delete(`templates/${template.id}/`);
      setTemplates((previous) =>
        previous.filter((item) => item.id !== template.id),
      );
      setSuccess(`"${template.name}" was deleted.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const duplicateTemplate = (template) => {
    setEditingId(null);
    setForm({
      name: `${template.name} (Copy)`,
      description: template.description || "",
      subject: template.subject || "",
      preview_text: template.preview_text || "",
      blocks: Array.isArray(template.blocks)
        ? JSON.parse(JSON.stringify(template.blocks))
        : [],
    });
    setError("");
    setSuccess("");
    setShowPreview(false);
    setShowEditor(true);
  };

  const headingText = editingId ? "Edit template" : "Create template";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              Newsletter
              <span>/</span>
              Templates
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Newsletter Templates
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create reusable email designs for your campaigns.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={loadTemplates} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New template
            </Button>
          </div>
        </div>

        {(error || success) && (
          <div
            role="status"
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <span className="min-w-0 flex-1 break-words">{error || success}</span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
              }}
              className="shrink-0 opacity-70 hover:opacity-100"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total templates</p>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <LayoutTemplate className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {templates.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Content blocks</p>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {templates.reduce(
                (total, template) =>
                  total +
                  (Array.isArray(template.blocks) ? template.blocks.length : 0),
                0,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Available block types</p>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Plus className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {BLOCK_TYPES.length}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Saved templates</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage the layouts used to create newsletter campaigns.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-sm text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading templates...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <LayoutTemplate className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                {search ? "No matching templates" : "No templates yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                {search
                  ? "Try another search term."
                  : "Create a reusable template for your next newsletter campaign."}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-5"
                  onClick={openCreate}
                >
                  <Plus className="h-4 w-4" />
                  Create your first template
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Template</th>
                    <th className="px-5 py-4">Email subject</th>
                    <th className="px-5 py-4">Blocks</th>
                    <th className="px-5 py-4">Last updated</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {template.name}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                              {template.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-xs truncate text-sm text-gray-700">
                          {template.subject}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                          {template.preview_text || "No preview text"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {Array.isArray(template.blocks)
                            ? template.blocks.length
                            : 0}{" "}
                          blocks
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {template.updated_at
                          ? new Date(template.updated_at).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(template)}
                            title="Edit template"
                            className="rounded-lg p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => duplicateTemplate(template)}
                            title="Duplicate template"
                            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteTemplate(template)}
                            disabled={deletingId === template.id}
                            title="Delete template"
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === template.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/50 p-2 sm:p-5">
          <div className="mx-auto my-3 flex max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-5">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {headingText}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Design a reusable email template.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-7">
                {error}
              </div>
            )}

            <form onSubmit={saveTemplate}>
              <div className="grid min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
                <div className="max-h-[72vh] space-y-6 overflow-y-auto p-5 sm:p-7">
                  <section className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Template details
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        These details help you identify and use the template.
                      </p>
                    </div>

                    <Field label="Template name">
                      <TextInput
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        placeholder="e.g. New Arrivals"
                        maxLength={150}
                        required
                      />
                    </Field>

                    <Field label="Description">
                      <TextArea
                        value={form.description}
                        onChange={(e) =>
                          updateForm("description", e.target.value)
                        }
                        rows={2}
                        placeholder="What is this template for?"
                      />
                    </Field>

                    <Field label="Email subject">
                      <TextInput
                        value={form.subject}
                        onChange={(e) => updateForm("subject", e.target.value)}
                        placeholder="Discover our latest collection"
                        maxLength={255}
                        required
                      />
                    </Field>

                    <Field label="Email preview text">
                      <TextInput
                        value={form.preview_text}
                        onChange={(e) =>
                          updateForm("preview_text", e.target.value)
                        }
                        placeholder="A short message shown beside the subject"
                        maxLength={255}
                      />
                    </Field>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Email content
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {form.blocks.length} of 100 blocks used
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                        <button
                          type="button"
                          key={type}
                          disabled={form.blocks.length >= 100}
                          onClick={() => addBlock(type)}
                          className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-left text-sm text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>

                    {form.blocks.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
                        <FileText className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-3 font-medium text-gray-800">
                          Your email is empty
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Choose a block above to start building your email.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {form.blocks.map((block, index) => {
                          const definition = BLOCK_TYPES.find(
                            (item) => item.type === block.type,
                          );
                          const Icon = definition?.icon || FileText;

                          return (
                            <div
                              key={`${block.type}-${index}`}
                              className="overflow-hidden rounded-xl border border-gray-200"
                            >
                              <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-3 py-2.5">
                                <div className="flex min-w-0 items-center gap-2">
                                  <Icon className="h-4 w-4 shrink-0 text-indigo-600" />
                                  <span className="truncate text-sm font-semibold text-gray-800">
                                    {definition?.label || block.type}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    #{index + 1}
                                  </span>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => moveBlock(index, -1)}
                                    className="rounded p-1.5 text-gray-500 hover:bg-white disabled:opacity-30"
                                    title="Move up"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === form.blocks.length - 1}
                                    onClick={() => moveBlock(index, 1)}
                                    className="rounded p-1.5 text-gray-500 hover:bg-white disabled:opacity-30"
                                    title="Move down"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeBlock(index)}
                                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                                    title="Remove block"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4 p-4">
                                <BlockFields
                                  block={block}
                                  onChange={(updated) =>
                                    updateBlock(index, updated)
                                  }
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>

                <aside className="max-h-[72vh] overflow-y-auto border-t border-gray-200 bg-gray-50 p-5 sm:p-7 lg:border-l lg:border-t-0">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Email preview
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Approximate content preview
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-gray-500" />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-4">
                      <p className="text-xs text-gray-500">Subject</p>
                      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                        {form.subject || "Your email subject"}
                      </p>
                      <p className="mt-1 break-words text-xs text-gray-500">
                        {form.preview_text || "Your preview text"}
                      </p>
                    </div>

                    <div className="space-y-5 p-4 sm:p-5">
                      <div className="border-b border-gray-100 pb-4 text-center">
                        <p className="text-lg font-black tracking-wide text-gray-900">
                          TEMMY
                          <span className="text-indigo-600">COLLECTION</span>
                        </p>
                      </div>

                      {form.blocks.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">
                          Your email content will appear here.
                        </div>
                      ) : (
                        form.blocks.map((block, index) => (
                          <div key={`${block.type}-preview-${index}`}>
                            <BlockPreview block={block} />
                          </div>
                        ))
                      )}

                      <div className="border-t border-gray-100 pt-4 text-center text-xs leading-5 text-gray-400">
                        You received this email because you subscribed to
                        TemmyCollection.
                        <br />
                        Unsubscribe · Contact us
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    This is a visual preview, not an exact rendering in every
                    email client. Your backend email renderer must support the
                    same block types and field names for the sent email to
                    match this design.
                  </p>
                </aside>
              </div>

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:px-7">
                <p className="text-xs text-gray-500">
                  {editingId
                    ? "Changes will update this saved template."
                    : "Save this template to reuse it in campaigns."}
                </p>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => setShowPreview((previous) => !previous)}
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? "Preview available" : "Preview"}
                  </Button>

                  <Button
                    type="button"
                    onClick={closeEditor}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save template"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
