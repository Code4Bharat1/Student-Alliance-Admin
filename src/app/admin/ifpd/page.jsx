"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Mock router for demo
const useRouter = () => ({
  push: (path) => console.log("Navigate to:", path)
});

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [notification, setNotification] = useState(null);
  const [filterPrice, setFilterPrice] = useState("all");

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://api-studentalliance.nexcorealliance.com/api/products/category/IFPD"
        );
        const data = await res.json();
        setProducts(data);
        if (!data || data.length === 0) {
          console.warn("No products found in the database.");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        showNotification("Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddProduct = () => {
    setIsModalOpen(true);
    setSelectedProduct(null);
  };

  const saveProduct = (product) => {
    if (selectedProduct) {
      const updatedProducts = products.map((p) =>
        p._id === product._id ? product : p
      );
      setProducts(updatedProducts);
      showNotification("Product updated successfully", "success");
    } else {
      setProducts([...products, product]);
      showNotification("Product added successfully", "success");
    }
    setIsModalOpen(false);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = filterPrice === "all" ? true :
        filterPrice === "low" ? product.price < 50000 :
        filterPrice === "mid" ? product.price >= 50000 && product.price <= 100000 :
        product.price > 100000;
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "quantity") return b.quantity - a.quantity;
      return 0;
    });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.quantity > 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    lowStock: products.filter(p => p.quantity < 5).length
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
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

      <div className="flex-1 transition-all duration-300">
        <div className="ml-60 p-6 lg:p-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  IFPD Panels
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">
                  Interactive Flat Panel Display Management
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddProduct}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 self-start lg:self-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Panel
              </motion.button>
            </div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              {[
                { label: "Total Panels", value: stats.total, color: "from-blue-500 to-indigo-500", icon: "📱" },
                { label: "In Stock", value: stats.inStock, color: "from-green-500 to-emerald-500", icon: "✅" },
                { label: "Total Value", value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, color: "from-purple-500 to-pink-500", icon: "💎" },
                { label: "Low Stock", value: stats.lowStock, color: "from-orange-500 to-red-500", icon: "⚠️" }
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

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search panels..."
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-700 font-medium cursor-pointer"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="quantity">Stock Quantity</option>
                </select>

                {/* Price Filter */}
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-700 font-medium cursor-pointer"
                >
                  <option value="all">All Prices</option>
                  <option value="low">Below ₹50,000</option>
                  <option value="mid">₹50,000 - ₹1,00,000</option>
                  <option value="high">Above ₹1,00,000</option>
                </select>

                {/* View Toggle */}
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="List View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Products Section */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading IFPD Panels...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg">No panels found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id || index}
                    className="group rounded-xl overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 bg-white flex flex-col cursor-pointer"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => router.push(`/admin/ProductDetails/${product._id}`)}
                  >
                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                        product.quantity === 0
                          ? "bg-red-500 text-white"
                          : product.quantity < 5
                          ? "bg-orange-500 text-white"
                          : "bg-green-500 text-white"
                      }`}>
                        {product.quantity === 0 ? "Out of Stock" : `${product.quantity} in stock`}
                      </span>
                    </div>

                    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">{product.category}</p>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            ₹{product.price?.toLocaleString()}
                          </span>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/ProductDetails/${product._id}`);
                          }}
                        >
                          View Details
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id || index}
                    className="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer flex items-center gap-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => router.push(`/admin/ProductDetails/${product._id}`)}
                  >
                    <div className="relative w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-gray-800 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-sm">{product.category}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Price</p>
                        <p className="text-xl font-bold text-blue-600">
                          ₹{product.price?.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Stock</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          product.quantity === 0
                            ? "bg-red-100 text-red-700"
                            : product.quantity < 5
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {product.quantity} units
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/ProductDetails/${product._id}`);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}