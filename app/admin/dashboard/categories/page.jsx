
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import adminApi from "../../../api/adminApi";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiFolder,
  FiFolderPlus,
  FiPackage,
  FiLayers,
  FiImage,
  FiAlertCircle,
  FiToggleLeft,
  FiToggleRight,
  FiUploadCloud,
  FiFilter,
  FiExternalLink,
} from "react-icons/fi";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: "",
  parent: "",
  description: "",
  active: false,
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong. Please try again.";
  }

  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;

  if (typeof data === "string") return data;

  const messages = Object.entries(data)
    .map(([field, value]) => {
      const text = Array.isArray(value) ? value.join(", ") : String(value);
      return `${field === "non_field_errors" ? "" : `${field}: `}${text}`;
    })
    .filter(Boolean);

  return messages.join("\n") || "The request could not be completed.";
}

function getResults(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {Number(value || 0).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`my-auto w-full ${
          wide ? "max-w-3xl" : "max-w-xl"
        } overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close dialog"
          >
            <FiX size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [emptyFilter, setEmptyFilter] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [productsTarget, setProductsTarget] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productsPage, setProductsPage] = useState(1);
  const [productsCount, setProductsCount] = useState(0);

  const totalPages = Math.max(1, pagination.totalPages);

  const loadStats = useCallback(async () => {
    try {
      const response = await adminApi.get("categories/stats/");
      setStats(response.data || {});
    } catch (error) {
      console.error("Unable to load category statistics:", error);
    }
  }, []);

  const loadParentOptions = useCallback(async () => {
    try {
      const response = await adminApi.get("categories/", {
        params: { page: 1, page_size: 100, ordering: "name" },
      });

      setAllCategories(getResults(response.data));
    } catch (error) {
      console.error("Unable to load category options:", error);
    }
  }, []);

  const loadCategories = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      setPageError("");

      try {
        const params = {
          page,
          page_size: PAGE_SIZE,
          ordering,
        };

        if (search.trim()) params.search = search.trim();
        if (status) params.status = status;
        if (type) params.type = type;
        if (parentFilter) params.parent = parentFilter;
        if (emptyFilter) params.empty = emptyFilter;

        const response = await adminApi.get("categories/", { params });
        const data = response.data;
        const results = getResults(data);

        setCategories(results);

        const count = Number(data?.count ?? results.length);
        setPagination({
          count,
          page,
          totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
        });
      } catch (error) {
        setPageError(getErrorMessage(error));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, status, type, parentFilter, emptyFilter, ordering]
  );

  useEffect(() => {
    loadStats();
    loadParentOptions();
  }, [loadStats, loadParentOptions]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setType("");
    setParentFilter("");
    setEmptyFilter("");
    setOrdering("-created_at");
    setPage(1);
  }

  function openCreateForm() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(category) {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      parent: category.parent ? String(category.parent) : "",
      description: category.description || "",
      active: Boolean(category.active),
    });
    setImageFile(null);
    setImagePreview(category.image_url || category.image || "");
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview("");
    setFormError("");
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must not exceed 5 MB.");
      return;
    }

    setFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const availableParents = useMemo(() => {
    if (!editingCategory) return allCategories;

    const excludedIds = new Set([Number(editingCategory.id)]);

    // Exclude descendants to prevent circular category relationships.
    let changed = true;
    while (changed) {
      changed = false;

      allCategories.forEach((category) => {
        if (
          category.parent != null &&
          excludedIds.has(Number(category.parent)) &&
          !excludedIds.has(Number(category.id))
        ) {
          excludedIds.add(Number(category.id));
          changed = true;
        }
      });
    }

    return allCategories.filter(
      (category) => !excludedIds.has(Number(category.id))
    );
  }, [allCategories, editingCategory]);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    const name = form.name.trim();

    if (!name) {
      setFormError("Category name is required.");
      setSaving(false);
      return;
    }

    if (
      editingCategory &&
      form.parent &&
      Number(form.parent) === Number(editingCategory.id)
    ) {
      setFormError("A category cannot be its own parent.");
      setSaving(false);
      return;
    }

    const payload = new FormData();
    payload.append("name", name);
    payload.append("description", form.description.trim());
    payload.append("active", String(form.active));
    payload.append("parent", form.parent || "");

    if (imageFile) payload.append("image", imageFile);

    try {
      if (editingCategory) {
        await adminApi.patch(
          `categories/${editingCategory.id}/`,
          payload
        );
        setNotice("Category updated successfully.");
      } else {
        await adminApi.post("categories/", payload);
        setNotice("Category created successfully.");
      }

      closeForm();
      await Promise.all([
        loadCategories({ silent: true }),
        loadStats(),
        loadParentOptions(),
      ]);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(category) {
    setTogglingId(category.id);
    setPageError("");

    try {
      await adminApi.post(`categories/${category.id}/toggle-active/`);
      setNotice(
        `${category.name} is now ${category.active ? "inactive" : "active"}.`
      );

      await Promise.all([
        loadCategories({ silent: true }),
        loadStats(),
        loadParentOptions(),
      ]);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await adminApi.delete(`categories/${deleteTarget.id}/`);
      setNotice("Category deleted successfully.");
      setDeleteTarget(null);

      if (categories.length === 1 && page > 1) setPage((current) => current - 1);

      await Promise.all([
        loadCategories({ silent: true }),
        loadStats(),
        loadParentOptions(),
      ]);
    } catch (error) {
      setDeleteTarget((current) =>
        current ? { ...current, error: getErrorMessage(error) } : current
      );
    } finally {
      setDeleting(false);
    }
  }

  async function openProducts(category) {
    setProductsTarget(category);
    setProducts([]);
    setProductsError("");
    setProductsPage(1);
    setProductsCount(0);
    setProductsLoading(true);

    try {
      const response = await adminApi.get(
        `categories/${category.id}/products/`,
        { params: { page: 1, page_size: PAGE_SIZE } }
      );

      setProducts(getResults(response.data));
      setProductsCount(Number(response.data?.count ?? 0));
    } catch (error) {
      setProductsError(getErrorMessage(error));
    } finally {
      setProductsLoading(false);
    }
  }

  async function changeProductsPage(nextPage) {
    if (!productsTarget || nextPage < 1) return;

    setProductsPage(nextPage);
    setProductsLoading(true);
    setProductsError("");

    try {
      const response = await adminApi.get(
        `categories/${productsTarget.id}/products/`,
        { params: { page: nextPage, page_size: PAGE_SIZE } }
      );

      setProducts(getResults(response.data));
      setProductsCount(Number(response.data?.count ?? productsCount));
    } catch (error) {
      setProductsError(getErrorMessage(error));
    } finally {
      setProductsLoading(false);
    }
  }

  const hasFilters =
    search || status || type || parentFilter || emptyFilter || ordering !== "-created_at";

  return (
    <main className="min-h-screen bg-gray-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Admin</span>
              <span>/</span>
              <span className="font-medium text-indigo-600">Categories</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Categories
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Organize your store products into categories and subcategories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => loadCategories({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <FiPlus size={18} />
              Add category
            </button>
          </div>
        </div>

        {notice && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <FiCheck className="shrink-0" size={18} />
            <span>{notice}</span>
            <button
              type="button"
              className="ml-auto text-emerald-700"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        {pageError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
            <div className="min-w-0 flex-1 whitespace-pre-line">{pageError}</div>
            <button
              type="button"
              onClick={() => setPageError("")}
              aria-label="Dismiss error"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total categories"
            value={stats.total_categories}
            icon={FiLayers}
            description="All categories in your store"
          />
          <StatCard
            title="Active categories"
            value={stats.active_categories}
            icon={FiCheck}
            description="Currently marked as active"
          />
          <StatCard
            title="Parent categories"
            value={stats.parent_categories}
            icon={FiFolder}
            description="Top-level categories"
          />
          <StatCard
            title="Products assigned"
            value={stats.assigned_products}
            icon={FiPackage}
            description="Direct category assignments"
          />
        </section>

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Inactive</span>
              <span className="rounded-lg bg-gray-100 p-2 text-gray-600">
                <FiToggleLeft size={18} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {Number(stats.inactive_categories || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subcategories</span>
              <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <FiFolderPlus size={18} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {Number(stats.child_categories || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Empty categories</span>
              <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <FiPackage size={18} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {Number(stats.empty_categories || 0).toLocaleString()}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  All categories
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {pagination.count.toLocaleString()} categor
                  {pagination.count === 1 ? "y" : "ies"} found
                </p>
              </div>
              <div className="relative w-full sm:max-w-sm">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, slug or description..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                <FiFilter size={16} />
                Filters
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                >
                  <option value="">All types</option>
                  <option value="parent">Parent categories</option>
                  <option value="child">Subcategories</option>
                </select>

                <select
                  value={parentFilter}
                  onChange={(event) => {
                    setParentFilter(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                >
                  <option value="">Any parent</option>
                  {allCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={emptyFilter}
                  onChange={(event) => {
                    setEmptyFilter(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                >
                  <option value="">Products: any</option>
                  <option value="true">No products</option>
                  <option value="false">Has products</option>
                </select>

                <select
                  value={ordering}
                  onChange={(event) => {
                    setOrdering(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                >
                  <option value="-created_at">Newest first</option>
                  <option value="created_at">Oldest first</option>
                  <option value="name">Name A–Z</option>
                  <option value="-name">Name Z–A</option>
                  <option value="-direct_product_count">Most products</option>
                  <option value="direct_product_count">Fewest products</option>
                </select>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Parent
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Products
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-5">
                          <div className="h-4 animate-pulse rounded-md bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                        <FiFolder size={25} />
                      </div>
                      <h3 className="mt-4 font-semibold text-gray-900">
                        No categories found
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                        {hasFilters
                          ? "Try changing your search or filters."
                          : "Create your first category to start organizing products."}
                      </p>
                      <button
                        type="button"
                        onClick={hasFilters ? resetFilters : openCreateForm}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        {hasFilters ? "Clear filters" : "Add a category"}
                        <FiChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                            {category.image_url || category.image ? (
                              <img
                                src={category.image_url || category.image}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FiFolder size={19} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {category.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              /{category.slug}
                            </p>
                            {category.description && (
                              <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {category.parent_name ? (
                          <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <FiFolder size={15} className="text-gray-400" />
                            {category.parent_name}
                          </span>
                        ) : (
                          <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                            Parent category
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openProducts(category)}
                          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                          title="View assigned products"
                        >
                          <FiPackage size={15} />
                          {Number(category.direct_product_count || 0)}
                          <FiExternalLink size={12} />
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge active={category.active} />
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(category.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggle(category)}
                            disabled={togglingId === category.id}
                            title={category.active ? "Deactivate" : "Activate"}
                            aria-label={
                              category.active
                                ? "Deactivate category"
                                : "Activate category"
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-indigo-600 disabled:opacity-50"
                          >
                            {category.active ? (
                              <FiToggleRight size={19} />
                            ) : (
                              <FiToggleLeft size={19} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditForm(category)}
                            title="Edit category"
                            aria-label="Edit category"
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <FiEdit2 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({ ...category, error: "" })
                            }
                            title="Delete category"
                            aria-label="Delete category"
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <FiTrash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-gray-500">
              {pagination.count === 0
                ? "Showing 0 categories"
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                    page * PAGE_SIZE,
                    pagination.count
                  )} of ${pagination.count}`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft size={16} />
                Previous
              </button>
              <span className="px-2 text-sm text-gray-600">
                Page <strong>{page}</strong> of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {formOpen && (
        <Modal
          title={editingCategory ? "Edit category" : "Create category"}
          subtitle={
            editingCategory
              ? `Update ${editingCategory.name}`
              : "Add a category to your store catalogue."
          }
          onClose={closeForm}
          wide
        >
          <form onSubmit={handleSave}>
            <div className="space-y-5 px-6 py-5">
              {formError && (
                <div className="flex items-start gap-2 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                  <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    maxLength={50}
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="e.g. Computer Accessories"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    Maximum 50 characters. The slug is generated automatically.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Parent category
                  </label>
                  <select
                    value={form.parent}
                    onChange={(event) => updateForm("parent", event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">None — top-level category</option>
                    {availableParents.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Select a parent to create a subcategory.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe the products in this category..."
                  className="w-full resize-y rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-1.5 text-right text-xs text-gray-400">
                  {form.description.length}/500
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category image
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/40">
                  {imagePreview ? (
                    <div className="flex w-full flex-col items-center gap-3 sm:flex-row">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="h-24 w-24 rounded-xl border border-gray-200 bg-white object-cover"
                      />
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-semibold text-gray-800">
                          {imageFile?.name || "Current category image"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Choose another image to replace it.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="mb-2 rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
                        <FiUploadCloud size={23} />
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        Click to upload an image
                      </span>
                      <span className="mt-1 text-xs text-gray-400">
                        Image files up to 5 MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-lg p-2 ${
                      form.active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {form.active ? (
                      <FiCheck size={18} />
                    ) : (
                      <FiToggleLeft size={18} />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Active category
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {form.active
                        ? "This category is marked as active."
                        : "This category is currently inactive."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.active}
                  onClick={() => updateForm("active", !form.active)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    form.active ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      form.active ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <FiRefreshCw className="animate-spin" size={16} />
                )}
                {saving
                  ? "Saving..."
                  : editingCategory
                    ? "Save changes"
                    : "Create category"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete category"
          subtitle="Please review this action before continuing."
          onClose={() => !deleting && setDeleteTarget(null)}
        >
          <div className="px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <FiTrash2 size={21} />
              </div>
              <div>
                <p className="text-sm leading-6 text-gray-700">
                  Are you sure you want to delete{" "}
                  <strong>{deleteTarget.name}</strong>? This action cannot be
                  undone.
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Your backend prevents deletion when a category still has
                  directly assigned products or child categories.
                </p>
              </div>
            </div>

            {deleteTarget.error && (
              <div className="mt-4 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                {deleteTarget.error}
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting && (
                <FiRefreshCw className="animate-spin" size={15} />
              )}
              {deleting ? "Deleting..." : "Delete category"}
            </button>
          </div>
        </Modal>
      )}

      {productsTarget && (
        <Modal
          title={`${productsTarget.name} products`}
          subtitle="Products directly assigned to this category."
          onClose={() => setProductsTarget(null)}
          wide
        >
          <div className="px-6 py-5">
            {productsError && (
              <div className="mb-4 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                {productsError}
              </div>
            )}

            {productsLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <FiPackage size={22} />
                </div>
                <p className="mt-3 font-semibold text-gray-800">
                  No products assigned
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  There are no products directly assigned to this category.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiImage className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Stock: {product.stock ?? "—"}
                        {" · "}
                        {product.is_available ? "Available" : "Unavailable"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-gray-900">
                      {product.price != null
                        ? Number(product.price).toLocaleString("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {productsCount > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  {productsCount.toLocaleString()} products
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={productsPage <= 1 || productsLoading}
                    onClick={() => changeProductsPage(productsPage - 1)}
                    className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40"
                    aria-label="Previous products page"
                  >
                    <FiChevronLeft size={17} />
                  </button>
                  <span className="text-sm text-gray-600">
                    {productsPage} / {Math.ceil(productsCount / PAGE_SIZE)}
                  </span>
                  <button
                    type="button"
                    disabled={
                      productsPage >= Math.ceil(productsCount / PAGE_SIZE) ||
                      productsLoading
                    }
                    onClick={() => changeProductsPage(productsPage + 1)}
                    className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40"
                    aria-label="Next products page"
                  >
                    <FiChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-gray-100 bg-gray-50/70 px-6 py-4">
            <button
              type="button"
              onClick={() => setProductsTarget(null)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
