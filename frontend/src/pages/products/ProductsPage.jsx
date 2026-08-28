import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Package, Layers, AlertTriangle, Ban, Search, Plus } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import ProductDrawer from "../../components/products/ProductDrawer";
import ProductRowMenu from "../../components/products/ProductRowMenu";
import { useAuth } from "../../context/AuthContext";
import { getProductStatsApi, getProductsListApi, getProductsApi } from "../../api/product.api";

// stockStatus is computed server-side (backend/src/constants/stock.js) and
// returned on every product — this just maps that value to a badge, it
// doesn't re-derive the threshold itself.
const STOCK_BADGES = {
  OUT_OF_STOCK: { label: "Out of Stock", className: "bg-red-50 text-red-600" },
  LOW_STOCK: { label: "Low Stock", className: "bg-amber-50 text-amber-600" },
};

export default function ProductsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "Admin";

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // "create" | "edit" | "duplicate" | "view" | null — Dashboard's "Add Product"
  // quick action navigates here with { state: { openCreate: true } }.
  const [drawerMode, setDrawerMode] = useState(
    isAdmin && location.state?.openCreate ? "create" : null
  );
  const [activeProduct, setActiveProduct] = useState(null);

  const refresh = useCallback(() => {
    getProductsListApi({ search, status: status || undefined }).then((result) => {
      setProducts(result.products);
    }).catch((err) => setError(err.message));

    if (isAdmin) {
      getProductStatsApi().then(setStats).catch(() => setStats(null));
    } else {
      // /products/stats is Admin-only, but Sales already has full read
      // access to the (unfiltered) product list itself — so the same
      // real numbers are derived here client-side instead of showing "—".
      getProductsApi({ limit: 100 })
        .then((all) => {
          setStats({
            totalProducts: all.length,
            categories: new Set(all.map((p) => p.category).filter(Boolean)).size,
            lowStock: all.filter((p) => p.stockStatus === "LOW_STOCK").length,
            outOfStock: all.filter((p) => p.stockStatus === "OUT_OF_STOCK").length,
          });
        })
        .catch(() => setStats(null));
    }
  }, [search, status, isAdmin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { categories, units } = useMemo(() => {
    const cats = new Set();
    const uns = new Set();
    for (const p of products) {
      if (p.category) cats.add(p.category);
      if (p.unit) uns.add(p.unit);
    }
    return { categories: [...cats], units: [...uns] };
  }, [products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Products</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your catalogue, pricing, HSN codes and GST rates.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={stats?.totalProducts ?? "—"} />
        <StatCard icon={Layers} label="Categories" value={stats?.categories ?? "—"} />
        <StatCard icon={AlertTriangle} label="Low Stock" value={stats?.lowStock ?? "—"} />
        <StatCard icon={Ban} label="Out of Stock" value={stats?.outOfStock ?? "—"} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full outline-none placeholder:text-gray-400"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">all</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setActiveProduct(null);
              setDrawerMode("create");
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="overflow-x-auto overflow-y-visible rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">HSN</th>
              <th className="px-4 py-3 font-medium">GST</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stockBadge = STOCK_BADGES[p.stockStatus];
              return (
                <tr key={p._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{p.productName}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3 text-gray-500">{p.hsnCode}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {p.gst}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-ink">
                    {p.openingStock.toLocaleString("en-IN")} <span className="text-gray-400">{p.unit}</span>
                  </td>
                  <td className="px-4 py-3">
                    {stockBadge ? (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockBadge.className}`}>
                        {stockBadge.label}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "ACTIVE" ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductRowMenu
                      product={p}
                      onView={() => {
                        setActiveProduct(p);
                        setDrawerMode("view");
                      }}
                      onEdit={() => {
                        setActiveProduct(p);
                        setDrawerMode("edit");
                      }}
                      onDuplicate={() => {
                        setActiveProduct(p);
                        setDrawerMode("duplicate");
                      }}
                      onChanged={refresh}
                    />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-400">Showing {products.length} of {products.length} products</p>

      <ProductDrawer
        open={drawerMode === "create" || drawerMode === "edit" || drawerMode === "duplicate" || drawerMode === "view"}
        onClose={() => setDrawerMode(null)}
        onSaved={refresh}
        product={drawerMode === "edit" || drawerMode === "view" ? activeProduct : null}
        duplicateFrom={drawerMode === "duplicate" ? activeProduct : null}
        readOnly={drawerMode === "view"}
        categories={categories}
        units={units}
      />
    </div>
  );
}
