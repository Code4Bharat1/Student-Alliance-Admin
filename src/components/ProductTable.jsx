import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// ============= PRODUCT TABLE COMPONENT =============
export function ProductTable({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [notification, setNotification] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("https://student-alliance-api.code4bharat.com/api/products");
        const data = await res.json();
        const validatedProducts = data.map(product => ({
          ...product,
          name: product.name || "Unnamed Product",
          price: product.price ?? 0,
          quantity: product.quantity ?? 0,
          category: product.category || "Uncategorized",
          image: product.image || "/placeholder-product.jpg"
        }));
        setProducts(validatedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        showNotification("Failed to load products", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    const handleProductAdded = () => fetchProducts();
    window.addEventListener("productAdded", handleProductAdded);
    return () => window.removeEventListener("productAdded", handleProductAdded);
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === "name" || sortBy === "category") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id) => {
    try {
      await fetch(`https://student-alliance-api.code4bharat.com/api/products/${id}`, {
        method: 'DELETE'
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showNotification("Product deleted successfully", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showNotification("Failed to delete product", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editingProduct.name.trim()) {
      showNotification("Product name is required", "error");
      return;
    }
    if (editingProduct.price < 0) {
      showNotification("Price cannot be negative", "error");
      return;
    }
    if (editingProduct.quantity < 0) {
      showNotification("Quantity cannot be negative", "error");
      return;
    }

    try {
      const res = await fetch(`https://student-alliance-api.code4bharat.com/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct)
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();

      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      setEditingProduct(null);
      showNotification("Product updated successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to update product", "error");
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

  return (
    <div className="ml-64 p-6 transition-all duration-300 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === "success" ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-semibold">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Product Inventory
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Manage your product catalog</p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full md:w-80"
          >
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm text-gray-800 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
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
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
        >
          {[
            { label: "Total Products", value: products.length, color: "from-blue-500 to-indigo-500", icon: "📦" },
            { label: "Categories", value: new Set(products.map(p => p.category)).size, color: "from-purple-500 to-pink-500", icon: "🏷️" },
            { label: "Total Value", value: `₹${products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}`, color: "from-green-500 to-emerald-500", icon: "💰" },
            { label: "Low Stock", value: products.filter(p => p.quantity < 10).length, color: "from-orange-500 to-red-500", icon: "⚠️" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/80 backdrop-blur rounded-xl p-5 shadow-lg border border-gray-100"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} mb-3 flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ================= ENHANCED EDIT PRODUCT MODAL ================= */}
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
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Edit Product
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Update product information</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Image Preview */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Product Preview</label>
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Stock Status Indicator */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Stock Status:</span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    editingProduct.quantity < 10 
                      ? 'bg-red-100 text-red-700' 
                      : editingProduct.quantity < 50 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {editingProduct.quantity < 10 ? 'Low Stock' : editingProduct.quantity < 50 ? 'Medium Stock' : 'In Stock'}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 shadow-lg transition-all"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Delete Product?</h2>
              <p className="text-gray-600 text-center mb-6">This action cannot be undone. The product will be permanently removed from your inventory.</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Image</th>
                <th 
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Product
                    {sortBy === "name" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center gap-2">
                    Price
                    {sortBy === "price" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-white/50 transition-colors"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center gap-2">
                    Stock
                    {sortBy === "quantity" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">No products found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                    className="transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        className="h-14 w-14 rounded-xl object-cover shadow-md border-2 border-gray-100"
                        src={product.image}
                        alt={product.name}
                        onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{product.name}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{product.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-4 py-1.5 inline-flex text-sm font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 inline-flex text-sm font-semibold rounded-full ${
                        product.quantity < 10 
                          ? 'bg-red-100 text-red-700' 
                          : product.quantity < 50 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingProduct(product)}
                          className="p-2.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Edit Product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setConfirmDeleteId(product._id)}
                          className="p-2.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete Product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span>-<span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of <span className="font-semibold">{filteredProducts.length}</span> products
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Previous
              </motion.button>
              
              {totalPages <= 7 ? (
                [...Array(totalPages)].map((_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === i + 1
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))
              ) : (
                <>
                  {currentPage > 3 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(1)}
                        className="px-4 py-2 rounded-lg font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        1
                      </motion.button>
                      <span className="px-2 py-2 text-gray-500">...</span>
                    </>
                  )}
                  
                  {[...Array(5)].map((_, i) => {
                    let pageNum;
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    }
                    return null;
                  })}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 py-2 text-gray-500">...</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-4 py-2 rounded-lg font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        {totalPages}
                      </motion.button>
                    </>
                  )}
                </>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Next
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Demo wrapper
export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ProductTable onEdit={(product) => setSelectedProduct(product)} />
    </div>
  );
}