"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

export function ProductTable({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const itemsPerPage = 8;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      const validatedProducts = data.map((product) => ({
        ...product,
        name: product.name || "Unnamed Product",
        price: product.price ?? 0,
        quantity: product.quantity ?? 0,
        category: product.category || "Uncategorized",
        image: product.image || "/placeholder-product.svg",
      }));
      setProducts(validatedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    window.addEventListener("productAdded", fetchProducts);
    return () => window.removeEventListener("productAdded", fetchProducts);
  }, [fetchProducts]);

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category &&
          product.category.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === "name" || sortBy === "category") {
        aVal = (aVal || "").toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }
      return sortOrder === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) return;
    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editingProduct),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p)),
      );
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const stats = [
    { label: "Total Products", value: products.length, icon: "📦" },
    {
      label: "Categories",
      value: new Set(products.map((p) => p.category)).size,
      icon: "🏷️",
    },
    {
      label: "Total Value",
      value: `₹${products.reduce((sum, p) => sum + p.price * p.quantity, 0).toLocaleString()}`,
      icon: "💰",
    },
    {
      label: "Low Stock",
      value: products.filter((p) => p.quantity < 10).length,
      icon: "⚠️",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-heading">
              Product Inventory
            </h2>
            <p className="text-text-tertiary text-sm mt-0.5">
              Manage your product catalog
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus text-text-primary placeholder-text-tertiary text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <svg
              className="absolute left-3 top-3 h-4 w-4 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-bg-card border border-border-primary rounded-xl p-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{stat.icon}</span>
                <div>
                  <p className="text-xs text-text-tertiary font-medium">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-text-heading">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingProduct(null)}
          >
            <motion.form
              onSubmit={handleEditSubmit}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-modal rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border border-border-primary"
              style={{ boxShadow: "var(--shadow-lg)" }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-text-heading">
                  Edit Product
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-lg hover:bg-bg-hover text-text-tertiary"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-5 h-40 rounded-xl overflow-hidden bg-bg-tertiary">
                <img
                  src={editingProduct.image}
                  alt={editingProduct.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "/placeholder-product.svg";
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2.5 border border-border-primary rounded-xl bg-bg-input text-text-primary focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus outline-none text-sm"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2.5 border border-border-primary rounded-xl bg-bg-input text-text-primary focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus outline-none text-sm"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2.5 border border-border-primary rounded-xl bg-bg-input text-text-primary focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus outline-none text-sm"
                    value={editingProduct.quantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 border border-border-primary rounded-xl bg-bg-input text-text-primary focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus outline-none text-sm"
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2.5 border border-border-primary rounded-xl bg-bg-input text-text-primary focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus outline-none text-sm"
                    value={editingProduct.image}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        image: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-bg-tertiary hover:bg-bg-hover text-text-primary font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-medium text-sm"
                >
                  Save Changes
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-modal rounded-2xl p-6 max-w-md w-full border border-border-primary"
              style={{ boxShadow: "var(--shadow-lg)" }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="w-14 h-14 bg-error-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-error"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-heading text-center mb-2">
                Delete Product?
              </h2>
              <p className="text-text-secondary text-center text-sm mb-5">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-bg-tertiary hover:bg-bg-hover text-text-primary font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-error hover:opacity-90 text-white font-medium text-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div
        className="bg-bg-card border border-border-primary rounded-xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-bg-tertiary border-b border-border-primary">
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Image
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort("name")}
                >
                  Product{" "}
                  {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort("price")}
                >
                  Price{" "}
                  {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort("quantity")}
                >
                  Stock{" "}
                  {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-text-tertiary text-sm">
                        Loading products...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <p className="text-text-tertiary text-sm">
                      No products found
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-5 py-3">
                      <img
                        className="h-12 w-12 rounded-lg object-cover border border-border-primary"
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = "/placeholder-product.svg";
                        }}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-text-heading text-sm">
                        {product.name}
                      </div>
                      <div className="text-xs text-text-tertiary mt-0.5">
                        {product.category}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-success">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          product.quantity < 10
                            ? "bg-error-bg text-error"
                            : product.quantity < 50
                              ? "bg-warning-bg text-warning"
                              : "bg-success-bg text-success"
                        }`}
                      >
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 rounded-lg hover:bg-info-bg text-brand-primary transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(product._id)}
                          className="p-2 rounded-lg hover:bg-error-bg text-error transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border-primary">
            <p className="text-xs text-text-tertiary">
              {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
              {filteredProducts.length}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border-primary text-text-secondary disabled:opacity-50 text-xs font-medium hover:bg-bg-hover"
              >
                Prev
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const page =
                  totalPages <= 5
                    ? i + 1
                    : currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;
                if (page < 1 || page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${currentPage === page ? "bg-brand-primary text-white" : "bg-bg-tertiary border border-border-primary text-text-secondary hover:bg-bg-hover"}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border-primary text-text-secondary disabled:opacity-50 text-xs font-medium hover:bg-bg-hover"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <ProductTable onEdit={() => {}} />;
}
