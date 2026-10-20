"use client";

const fieldClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const sectionClass = "border-b border-slate-100 py-4 last:border-0";


export function ProductFilterPanel({filters = {},value = {},onChange,onClear,onClose,loading = false,mobile = false,resultCount,}) {
  const toggle = (key, item) => {
    const current = Array.isArray(value[key]) ? value[key] : [];
    onChange?.(key, current.includes(item) ? current.filter((v) => v !== item) : [...current, item]);
  };
  const set = (key, next) => onChange?.(key, next);
  const price = filters.price || {};
  const category = filters.category;
  const categoryList = Array.isArray(category) ? category : [];
  const selectedCategories = filters.subcategories || [];

  return (
    <aside className={`${mobile ? "fixed inset-0 z-50 flex flex-col bg-white" : "sticky top-20 hidden max-h-[calc(100vh-6rem)] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex"}`}>
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Filters</h2>
          {Number.isFinite(resultCount) && <p className="mt-0.5 text-xs text-slate-500">{resultCount.toLocaleString()} products</p>}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClear} className="text-xs font-semibold text-amber-700 hover:text-amber-800">Clear all</button>
          {mobile && <button type="button" onClick={onClose} className="rounded-full px-2 py-1 text-lg text-slate-500 hover:bg-slate-100" aria-label="Close filters">×</button>}
        </div>
      </header>

      <div className="flex-1 space-y-0 overflow-y-auto px-4 pb-5">
        {loading && <div className="sticky top-0 h-0.5 animate-pulse bg-amber-500" />}

        <section className={sectionClass}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Category</h3>
          {category?.name && <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">{category.name}</p>}
          {categoryList.map((item) => <p key={item.id} className="py-1 text-sm text-slate-700">{item.name}</p>)}
          {selectedCategories.length > 0 && <div className="mt-2 space-y-1">{selectedCategories.map((item) => <button type="button" key={item.id} onClick={() => onChange?.("category", item.slug)} className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50">{item.name}</button>)}</div>}
        </section>

        <section className={sectionClass}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Price (₦)</h3>
          {(price.min != null || price.max != null) && <p className="mb-2 text-xs text-slate-500">Available: ₦{Number(price.min || 0).toLocaleString("en-NG")} – ₦{Number(price.max || 0).toLocaleString("en-NG")}</p>}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-500">Minimum<input className={`${fieldClass} mt-1`} type="number" min="0" inputMode="numeric" placeholder="Min" value={value.minPrice ?? ""} onChange={(e) => set("minPrice", e.target.value)} /></label>
            <label className="text-xs text-slate-500">Maximum<input className={`${fieldClass} mt-1`} type="number" min="0" inputMode="numeric" placeholder="Max" value={value.maxPrice ?? ""} onChange={(e) => set("maxPrice", e.target.value)} /></label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Customer rating</h3>
          {[4, 3, 2, 1].map((stars) => <label key={stars} className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 text-sm hover:bg-slate-50">
            <input type="radio" name={mobile ? "mobile-rating" : "rating"} checked={String(value.rating ?? "") === String(stars)} onChange={() => set("rating", String(value.rating) === String(stars) ? "" : String(stars))} />
            <span className="text-amber-500">{"★".repeat(stars)}<span className="text-slate-200">{"★".repeat(5 - stars)}</span></span><span className="text-slate-600">& up</span>
          </label>)}
        </section>

        <section className={sectionClass}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Discount</h3>
          <div className="flex flex-wrap gap-2">{[10, 20, 30, 40, 50].map((discount) => <button type="button" key={discount} aria-pressed={Number(value.minDiscount) === discount} onClick={() => set("minDiscount", Number(value.minDiscount) === discount ? "" : String(discount))} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${Number(value.minDiscount) === discount ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>{discount}% or more</button>)}</div>
        </section>

        <section className={sectionClass}>
          <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-700">
            <span>In stock only</span><input type="checkbox" checked={value.inStock === "true" || value.inStock === true} onChange={(e) => set("inStock", e.target.checked ? "true" : "")} className="h-4 w-4 accent-amber-600" />
          </label>
        </section>

        <Facet title="Brand" items={filters.brands} selected={value.brands} onToggle={(slug) => toggle("brands", slug)} />
        <Facet title="Size" items={filters.sizes} selected={value.sizes} onToggle={(slug) => toggle("sizes", slug)} />
        <Facet title="Color" items={filters.colors} selected={value.colors} onToggle={(slug) => toggle("colors", slug)} color />

        {(filters.attributes || []).map((attribute) => (
          <section className={sectionClass} key={attribute.id}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">{attribute.name}</h3>
            <div className="space-y-1">{attribute.options.map((option) => {
              const key = `attribute_${attribute.id}`;
              const selected = Array.isArray(value[key]) ? value[key] : value[key] ? [value[key]] : [];
              return <label key={option.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-slate-600">
                <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggle(key, option.value)} className="h-4 w-4 rounded accent-amber-600" />{option.value}
              </label>;
            })}</div>
          </section>
        ))}
      </div>

      {mobile && <footer className="border-t border-slate-100 bg-white p-4"><button type="button" onClick={onClose} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">Show {Number.isFinite(resultCount) ? resultCount.toLocaleString() : "products"}</button></footer>}
    </aside>
  );
}

function Facet({ title, items = [], selected, onToggle, color = false }) {
  if (!items?.length) return null;
  const chosen = Array.isArray(selected) ? selected : [];
  return <section className={sectionClass}>
    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">{title}</h3>
    <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
      {items.map((item) => <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 text-sm text-slate-600 hover:bg-slate-50">
        <input type="checkbox" checked={chosen.includes(item.slug)} onChange={() => onToggle(item.slug)} className="h-4 w-4 rounded accent-amber-600" />
        {color && item.hexcode && <span aria-hidden="true" className="h-4 w-4 rounded-full border border-slate-200" style={{ backgroundColor: item.hexcode }} />}
        <span className="min-w-0 flex-1 truncate">{item.name}</span>
      </label>)}
    </div>
  </section>;
}

export function ProductSort({ value = "recommended", onChange }) {
  return <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
    <span className="hidden sm:inline">Sort by</span>
    <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-500" value={value} onChange={(e) => onChange?.(e.target.value)}>
      <option value="recommended">Recommended</option>
      <option value="popular">Most popular</option>
      <option value="newest">Newest arrivals</option>
      <option value="price_asc">Price: low to high</option>
      <option value="price_desc">Price: high to low</option>
      <option value="rating">Top rated</option>
      <option value="discount">Biggest discount</option>
    </select>
  </label>;
}
