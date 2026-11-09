"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import adminApi from "../../../api/adminApi";


const BASE = "";
const RESOURCES = {
  collections: `collections/`,
  brands: `brands/`,
  colors: `colors/`,
  sizes: `sizes/`,
  tags: `tags/`,
  attributes: `attributes/`,
  attributeOptions: `attribute-options/`,
  products: "inventory/products/",
  categories: "categories/",
};


const TABS = [
  { key: "collections", label: "Collections" },
  { key: "brands", label: "Brands" },
  { key: "colors", label: "Colors" },
  { key: "sizes", label: "Sizes" },
  { key: "tags", label: "Tags" },
  { key: "attributes", label: "Category attributes" },
  { key: "attributeOptions", label: "Attribute options" },
];


const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  category: "",
  color_code: "",
  category_attribute: "",
  value: "",
  products: [],
};



function displayValue(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);
  if (Array.isArray(value)) {
    const values = value.map((item) => displayValue(item, "")).filter(Boolean);
    return values.length ? values.join(", ") : fallback;
  }
  if (typeof value === "object") {
    for (const key of ["name", "label", "title", "value", "slug", "email", "id"]) {
      const candidate = value[key];
      if (candidate !== null && candidate !== undefined && candidate !== "" && typeof candidate !== "object") return String(candidate);
    }
  }
  return fallback;
}

function getRelationId(value) {
  return value && typeof value === "object" ? value.id ?? "" : value ?? "";
}

function getList(data) {

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) return data.results;

  if (Array.isArray(data?.data)) return data.data;

  return [];

}



function getProductImage(product) {
  const image = product?.image_url || product?.image || product?.thumbnail;

  if (typeof image === "string" && image.trim()) return image;
  if (image?.url) return image.url;
  if (image?.secure_url) return image.secure_url;


  if (Array.isArray(product?.images) && product.images.length) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    return first?.image_url || first?.image || first?.url || first?.secure_url || "";
  }

  return "";
}



function getProductPrice(product) {

  const price = product?.price ?? product?.selling_price;

  if (price === null || price === undefined || price === "") return "";



  const number = Number(price);

  return Number.isFinite(number)

    ? `₦${number.toLocaleString()}`

    : String(price);

}



function getError(error) {

  const data = error?.response?.data;



  if (typeof data === "string") return data;

  if (data && typeof data === "object") {

    return Object.entries(data)

      .map(([key, value]) => {

        const message = Array.isArray(value) ? value.join(", ") : String(value);

        return `${key}: ${message}`;

      })

      .join(" | ");

  }



  return error?.message || "Something went wrong. Please try again.";

}



function toSlug(value) {

  return value

    .toLowerCase()

    .trim()

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/^-|-$/g, "");

}



export default function CatalogPage() {

  const [activeTab, setActiveTab] = useState("collections");

  const [records, setRecords] = useState([]);

  const [availableProducts, setAvailableProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [attributes, setAttributes] = useState([]);



  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");



  const [search, setSearch] = useState("");

  const [productSearch, setProductSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);



  const endpoints = RESOURCES[activeTab];



  const loadAllProducts = useCallback(async () => {

    const all = [];

    const seenPages = new Set();

    let nextUrl = RESOURCES.products;



    while (nextUrl) {

      const pageKey = String(nextUrl);



      if (seenPages.has(pageKey)) {

        throw new Error("The products API returned a repeated pagination URL.");

      }



      seenPages.add(pageKey);



      const response = await adminApi.get(nextUrl);

      const data = response.data;

      const pageProducts = getList(data);



      all.push(...pageProducts);



      if (Array.isArray(data)) {

        break;

      }



      if (data?.next) {

        // DRF may return an absolute next URL. Preserve it exactly.

        nextUrl = data.next;

      } else if (data?.next_page) {

        nextUrl = `${RESOURCES.products}?page=${data.next_page}`;

      } else {

        nextUrl = null;

      }

    }



    // Deduplicate products in case pagination results overlap.

    const unique = new Map();

    all.forEach((product) => unique.set(product.id, product));



    setAvailableProducts(Array.from(unique.values()));

  }, []);



  const loadRecords = useCallback(async () => {

    const response = await adminApi.get(RESOURCES[activeTab]);

    setRecords(getList(response.data));

  }, [activeTab]);



  const loadLookups = useCallback(async () => {

    const results = await Promise.allSettled([

      loadAllProducts(),

      adminApi.get(RESOURCES.categories),

      adminApi.get(RESOURCES.attributes),

    ]);



    if (results[0].status === "rejected") {

      console.error("Unable to load products:", results[0].reason);

    }



    if (results[1].status === "fulfilled") {

      setCategories(getList(results[1].value.data));

    }



    if (results[2].status === "fulfilled") {

      setAttributes(getList(results[2].value.data));

    }

  }, [loadAllProducts]);



  const reload = useCallback(async () => {

    setLoading(true);

    setError("");



    try {

      await Promise.all([loadRecords(), loadLookups()]);

    } catch (err) {

      setError(getError(err));

    } finally {

      setLoading(false);

    }

  }, [loadRecords, loadLookups]);



  useEffect(() => {

    reload();

  }, [reload]);



  const filteredRecords = useMemo(() => {

    const query = search.trim().toLowerCase();

    if (!query) return records;



    return records.filter((record) =>

      [

        record.name,

        record.slug,

        record.category_name,

        record.value,

        record.description,

      ]

        .filter((value) => value !== null && value !== undefined && value !== "")
        .some((value) => displayValue(value, "").toLowerCase().includes(query)),

    );

  }, [records, search]);



  const filteredProducts = useMemo(() => {

    const query = productSearch.trim().toLowerCase();



    return availableProducts.filter((product) => {

      if (!query) return true;



      return [product.name, product.slug, product.brand_name, product.brand, product.id]
        .filter((value) => value !== null && value !== undefined && value !== "")
        .some((value) => displayValue(value, "").toLowerCase().includes(query));

    });

  }, [availableProducts, productSearch]);



  function openCreate() {

    setEditing(null);

    setForm({ ...EMPTY_FORM });

    setProductSearch("");

    setError("");

    setNotice("");

    setShowForm(true);

  }



  function openEdit(record) {

    setEditing(record);

    setError("");

    setNotice("");

    setProductSearch("");



    setForm({

      ...EMPTY_FORM,
      ...record,
      name: displayValue(record.name, ""),
      slug: displayValue(record.slug, ""),
      description: displayValue(record.description, ""),
      value: displayValue(record.value, ""),
      color_code: displayValue(record.color_code, ""),
      category: getRelationId(record.category) === "" ? "" : String(getRelationId(record.category)),
      category_attribute: getRelationId(record.category_attribute) === "" ? "" : String(getRelationId(record.category_attribute)),

      products: Array.isArray(record.products)

        ? record.products.map((product) =>

            typeof product === "object" ? product.id : product,

          )

        : [],

    });



    setShowForm(true);

  }



  function updateField(field, value) {

    setForm((current) => {

      const updated = { ...current, [field]: value };



      if (field === "name" && !editing) {

        updated.slug = toSlug(value);

      }



      return updated;

    });

  }



  function toggleProduct(productId) {

    setForm((current) => {

      const normalizedId = Number(productId);
      const selected = current.products.some((id) => Number(id) === normalizedId);



      return {

        ...current,

        products: selected

          ? current.products.filter((id) => Number(id) !== normalizedId)

          : [...current.products, normalizedId],

      };

    });

  }



  function buildPayload() {

    const payload = { ...form };



    if ("category" in payload) {

      payload.category = payload.category === "" ? null : Number(payload.category);

    }



    if ("category_attribute" in payload) {

      payload.category_attribute =

        payload.category_attribute === ""

          ? null

          : Number(payload.category_attribute);

    }



    if (activeTab === "collections") {

      payload.products = form.products.map(Number);

    } else {

      delete payload.products;

    }



    // Remove fields that belong to another resource.

    if (activeTab !== "colors") delete payload.color_code;

    if (activeTab !== "attributeOptions") delete payload.category_attribute;

    if (activeTab !== "collections" && activeTab !== "brands") {

      delete payload.category;

    }



    return payload;

  }



  async function saveRecord(event) {

    event.preventDefault();

    setSaving(true);

    setError("");

    setNotice("");



    try {

      const payload = buildPayload();



      if (editing) {

        await adminApi.patch(`${endpoints}${editing.id}/`, payload);

        setNotice("Record updated successfully.");

      } else {

        await adminApi.post(endpoints, payload);

        setNotice("Record created successfully.");

      }



      setShowForm(false);

      setEditing(null);

      await loadRecords();

    } catch (err) {

      setError(getError(err));

    } finally {

      setSaving(false);

    }

  }



  async function deleteRecord(record) {

    const confirmed = window.confirm(

      `Delete "${record.name || record.value || "this record"}"?`,

    );



    if (!confirmed) return;



    setError("");

    setNotice("");



    try {

      await adminApi.delete(`${endpoints}${record.id}/`);

      setRecords((current) =>

        current.filter((item) => item.id !== record.id),

      );

      setNotice("Record deleted successfully.");

    } catch (err) {

      setError(getError(err));

    }

  }



  const selectedProducts = form.products

    .map((id) => availableProducts.find((product) => Number(product.id) === Number(id)))

    .filter(Boolean);



  function categoryName(record) {
    const relationId = getRelationId(record.category);
    const category =
      record.category_name ||
      (typeof record.category === "object" ? record.category : null) ||
      categories.find((item) => String(item.id) === String(relationId))?.name;
    return displayValue(category);
  }

  function recordTitle(record) {
    return displayValue(record.name || record.value, `Record #${record.id}`);
  }



  return (

    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl space-y-6">

        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">

              TemmyCollection Admin

            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">

              Catalog management

            </h1>

            <p className="mt-2 text-sm text-slate-500">

              Manage collections, brands, colors, sizes, tags, and attributes.

            </p>

          </div>



          <button

            type="button"

            onClick={openCreate}

            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"

          >

            + Add {TABS.find((tab) => tab.key === activeTab)?.label.replace(/s$/, "")}

          </button>

        </header>



        {error && (

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            {error}

            <button

              type="button"

              onClick={() => setError("")}

              className="ml-3 font-semibold underline"

            >

              Dismiss

            </button>

          </div>

        )}



        {notice && (

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

            {notice}

          </div>

        )}



        <nav className="flex gap-2 overflow-x-auto pb-2">

          {TABS.map((tab) => (

            <button

              type="button"

              key={tab.key}

              onClick={() => {

                setActiveTab(tab.key);

                setSearch("");

                setError("");

                setNotice("");

              }}

              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${

                activeTab === tab.key

                  ? "bg-slate-900 text-white"

                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"

              }`}

            >

              {tab.label}

            </button>

          ))}

        </nav>



        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">

            <div>

              <h2 className="font-bold">

                {TABS.find((tab) => tab.key === activeTab)?.label}

              </h2>

              <p className="mt-1 text-xs text-slate-500">

                {filteredRecords.length} record(s)

                {activeTab === "collections"

                  ? ` · ${availableProducts.length} products loaded`

                  : ""}

              </p>

            </div>



            <input

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              placeholder="Search records..."

              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:max-w-xs"

            />

          </div>



          {loading ? (

            <div className="p-12 text-center text-sm text-slate-500">

              Loading catalog...

            </div>

          ) : filteredRecords.length === 0 ? (

            <div className="p-12 text-center">

              <p className="font-semibold">No records found</p>

              <p className="mt-1 text-sm text-slate-500">

                Add a record or change your search.

              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[720px] text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

                  <tr>

                    <th className="px-5 py-4">Name</th>

                    <th className="px-5 py-4">Slug / Value</th>

                    <th className="px-5 py-4">Category</th>

                    {activeTab === "collections" && (

                      <th className="px-5 py-4">Products</th>

                    )}

                    {activeTab === "colors" && (

                      <th className="px-5 py-4">Color</th>

                    )}

                    <th className="px-5 py-4 text-right">Actions</th>

                  </tr>

                </thead>



                <tbody className="divide-y divide-slate-100">

                  {filteredRecords.map((record) => (

                    <tr key={record.id} className="hover:bg-slate-50">

                      <td className="px-5 py-4">

                        <p className="font-semibold">{recordTitle(record)}</p>

                        <p className="mt-1 text-xs text-slate-400">

                          ID: {record.id}

                        </p>

                      </td>

                      <td className="px-5 py-4 text-slate-500">

                        {displayValue(record.slug || record.value)}

                      </td>

                      <td className="px-5 py-4 text-slate-600">

                        {categoryName(record)}

                      </td>



                      {activeTab === "collections" && (

                        <td className="px-5 py-4">

                          <div className="flex max-w-sm flex-wrap gap-1.5">

                            {(Array.isArray(record.products) ? record.products : []).slice(0, 3).map((product) => (

                              <span

                                key={typeof product === "object" ? product.id : product}

                                className="rounded-lg bg-indigo-50 px-2 py-1 text-xs text-indigo-700"

                              >

                                {typeof product === "object"
                                  ? displayValue(product.name, `Product #${product.id ?? "?"}`)
                                  : displayValue(availableProducts.find((item) => String(item.id) === String(product))?.name, `Product #${product}`)}

                              </span>

                            ))}

                            {(Array.isArray(record.products) ? record.products : []).length > 3 && (

                              <span className="text-xs text-slate-500">

                                +{record.products.length - 3} more

                              </span>

                            )}

                            {(Array.isArray(record.products) ? record.products : []).length === 0 && "No products"}

                          </div>

                        </td>

                      )}



                      {activeTab === "colors" && (

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-2">

                            <span

                              className="h-5 w-5 rounded-full border border-slate-200"

                              style={{

                                backgroundColor: record.color_code || "#ffffff",

                              }}

                            />

                            {displayValue(record.color_code)}

                          </span>

                        </td>

                      )}



                      <td className="px-5 py-4 text-right">

                        <div className="inline-flex gap-2">

                          <button

                            type="button"

                            onClick={() => openEdit(record)}

                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100"

                          >

                            Edit

                          </button>

                          <button

                            type="button"

                            onClick={() => deleteRecord(record)}

                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"

                          >

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>



      {showForm && (

        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6">

          <section className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">

              <div>

                <h2 className="text-xl font-bold">

                  {editing ? "Edit" : "Add"}{" "}

                  {TABS.find((tab) => tab.key === activeTab)?.label.replace(/s$/, "")}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Enter details below.

                </p>

              </div>

              <button

                type="button"

                onClick={() => setShowForm(false)}

                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"

                aria-label="Close form"

              >

                ×

              </button>

            </div>



            <form onSubmit={saveRecord} className="space-y-5 p-5">

              {["collections", "brands", "colors", "sizes", "tags", "attributes"].includes(

                activeTab,

              ) && (

                <div>

                  <label className="mb-1.5 block text-sm font-semibold">

                    Name \*

                  </label>

                  <input

                    required

                    value={form.name}

                    onChange={(event) => updateField("name", event.target.value)}

                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"

                    placeholder="Enter name"

                  />

                </div>

              )}



              {activeTab !== "attributeOptions" && (

                <div>

                  <label className="mb-1.5 block text-sm font-semibold">

                    Slug

                  </label>

                  <input

                    value={form.slug}

                    onChange={(event) => updateField("slug", event.target.value)}

                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"

                    placeholder="auto-generated-from-name"

                  />

                </div>

              )}



              {["collections", "brands"].includes(activeTab) && (

                <div>

                  <label className="mb-1.5 block text-sm font-semibold">

                    Category

                  </label>

                  <select

                    value={form.category}

                    onChange={(event) => updateField("category", event.target.value)}

                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"

                  >

                    <option value="">No category</option>

                    {categories.map((category) => (

                      <option key={category.id} value={category.id}>

                        {displayValue(category.name, `Category #${category.id}`)}

                      </option>

                    ))}

                  </select>

                </div>

              )}



              {activeTab === "colors" && (

                <div>

                  <label className="mb-1.5 block text-sm font-semibold">

                    Color code

                  </label>

                  <div className="flex gap-3">

                    <input

                      type="color"

                      value={/^#[0-9a-f]{6}$/i.test(form.color_code)

                        ? form.color_code

                        : "#000000"}

                      onChange={(event) =>

                        updateField("color_code", event.target.value)

                      }

                      className="h-12 w-16 rounded-lg border border-slate-200 p-1"

                    />

                    <input

                      value={form.color_code}

                      onChange={(event) =>

                        updateField("color_code", event.target.value)

                      }

                      placeholder="#000000"

                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"

                    />

                  </div>

                </div>

              )}



              {activeTab === "attributeOptions" && (

                <>

                  <div>

                    <label className="mb-1.5 block text-sm font-semibold">

                      Attribute \*

                    </label>

                    <select

                      required

                      value={form.category_attribute}

                      onChange={(event) =>

                        updateField("category_attribute", event.target.value)

                      }

                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"

                    >

                      <option value="">Select an attribute</option>

                      {attributes.map((attribute) => (

                        <option key={attribute.id} value={attribute.id}>

                          {displayValue(attribute.name, `Attribute #${attribute.id}`)}

                          {attribute.category_name
                            ? ` — ${displayValue(attribute.category_name)}`
                            : ""}

                        </option>

                      ))}

                    </select>

                  </div>



                  <div>

                    <label className="mb-1.5 block text-sm font-semibold">

                      Option value \*

                    </label>

                    <input

                      required

                      value={form.value}

                      onChange={(event) => updateField("value", event.target.value)}

                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"

                      placeholder="e.g. 15.6 inches"

                    />

                  </div>

                </>

              )}



              {activeTab === "collections" && (

                <div className="space-y-3">

                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                    <div>

                      <label className="block text-sm font-semibold">

                        Collection products

                      </label>

                      <p className="mt-1 text-xs text-slate-500">

                        {form.products.length} selected · {availableProducts.length} products loaded

                      </p>

                    </div>



                    <input

                      value={productSearch}

                      onChange={(event) => setProductSearch(event.target.value)}

                      placeholder="Search products..."

                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 sm:max-w-xs"

                    />

                  </div>



                  {selectedProducts.length > 0 && (

                    <div className="space-y-2 rounded-xl bg-indigo-50/60 p-3">

                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">

                        Selected products

                      </p>

                      {selectedProducts.map((product) => {

                        const image = getProductImage(product);



                        return (

                          <div

                            key={product.id}

                            className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white p-2"

                          >

                            {image ? (

                              <img

                                src={image}

                                alt={displayValue(product.name, "Product image")}

                                className="h-14 w-14 shrink-0 rounded-lg bg-slate-100 object-cover"

                                onError={(event) => {

                                  event.currentTarget.style.display = "none";

                                }}

                              />

                            ) : (

                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">

                                <span className="text-xs">No image</span>

                              </div>

                            )}



                            <div className="min-w-0 flex-1">

                              <p className="line-clamp-2 text-sm font-semibold">

                                {displayValue(product.name, `Product #${product.id ?? "?"}`)}

                              </p>

                              <p className="mt-1 text-xs text-slate-500">

                                {getProductPrice(product)}

                              </p>

                            </div>



                            <button

                              type="button"

                              onClick={() => toggleProduct(product.id)}

                              className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"

                            >

                              Remove

                            </button>

                          </div>

                        );

                      })}

                    </div>

                  )}



                  <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">

                    {filteredProducts.length === 0 ? (

                      <p className="p-6 text-center text-sm text-slate-500">

                        {availableProducts.length === 0

                          ? "No products loaded. Check the products API and pagination response."

                          : "No products match your search."}

                      </p>

                    ) : (

                      filteredProducts.map((product) => {

                        const selected = form.products.some((id) => Number(id) === Number(product.id));

                        const image = getProductImage(product);



                        return (

                          <button

                            type="button"

                            key={product.id}

                            onClick={() => toggleProduct(product.id)}

                            className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${

                              selected

                                ? "border-indigo-400 bg-indigo-50"

                                : "border-transparent hover:border-slate-200 hover:bg-slate-50"

                            }`}

                          >

                            {image ? (

                              <img

                                src={image}

                                alt={displayValue(product.name, "Product image")}

                                loading="lazy"

                                className="h-16 w-16 shrink-0 rounded-lg bg-slate-100 object-cover"

                                onError={(event) => {

                                  event.currentTarget.style.display = "none";

                                }}

                              />

                            ) : (

                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-center text-[10px] text-slate-400">

                                No image

                              </div>

                            )}



                            <div className="min-w-0 flex-1">

                              <p className="line-clamp-2 text-sm font-semibold">

                                {displayValue(product.name, `Product #${product.id ?? "?"}`)}

                              </p>

                              <p className="mt-1 text-xs text-slate-500">

                                {displayValue(product.brand_name || product.brand, "Product")}

                                {" · "}ID: {product.id}

                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-800">

                                {getProductPrice(product)}

                              </p>

                            </div>



                            <span

                              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${

                                selected

                                  ? "bg-indigo-600 text-white"

                                  : "border border-slate-200 bg-white text-slate-600"

                              }`}

                            >

                              {selected ? "Selected ✓" : "Add +"}

                            </span>

                          </button>

                        );

                      })

                    )}

                  </div>

                </div>

              )}



              {["collections", "attributes"].includes(activeTab) && (

                <div>

                  <label className="mb-1.5 block text-sm font-semibold">

                    Description

                  </label>

                  <textarea

                    rows={3}

                    value={form.description}

                    onChange={(event) =>

                      updateField("description", event.target.value)

                    }

                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"

                    placeholder="Optional description"

                  />

                </div>

              )}



              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button

                  type="button"

                  onClick={() => setShowForm(false)}

                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50"

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  disabled={saving}

                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"

                >

                  {saving ? "Saving..." : editing ? "Save changes" : "Create record"}

                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </main>

  );

}
