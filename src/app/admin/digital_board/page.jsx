"use client";

import Header from "@/components/Header";
import Modal from "@/components/Modal";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const CACHE_KEY = "products_digital_board";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_METADATA_KEY = "cache_metadata_digital_board";
const SEARCH_CACHE_KEY = "search_history_digital_board";
const USER_PREFS_KEY = "user_prefs_digital_board";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const router = useRouter();

  // Calculate cache statistics
  const calculateCacheStats = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const metadata = localStorage.getItem(CACHE_METADATA_KEY);
      
      if (cached && metadata) {
        const { timestamp, accessCount, lastAccessed } = JSON.parse(metadata);
        const now = Date.now();
        const age = now - timestamp;
        const remainingTime = Math.max(0, CACHE_DURATION - age);
        const sizeInKB = (new Blob([cached]).size / 1024).toFixed(2);
        
        return {
          isValid: age < CACHE_DURATION,
          ageInMinutes: Math.floor(age / 60000),
          remainingMinutes: Math.ceil(remainingTime / 60000),
          sizeInKB,
          accessCount: accessCount || 0,
          lastAccessed: lastAccessed ? new Date(lastAccessed).toLocaleString() : 'Never'
        };
      }
    } catch (error) {
      console.error("Error calculating cache stats:", error);
    }
    return null;
  }, []);

  // Load cached data with enhanced tracking
  const loadCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const metadata = localStorage.getItem(CACHE_METADATA_KEY);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const age = now - timestamp;
        
        if (age < CACHE_DURATION) {
          const meta = metadata ? JSON.parse(metadata) : {};
          const updatedMeta = {
            timestamp,
            accessCount: (meta.accessCount || 0) + 1,
            lastAccessed: now
          };
          localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(updatedMeta));
          
          const remainingMinutes = Math.ceil((CACHE_DURATION - age) / 60000);
          setCacheStatus(`✓ Loaded from cache (${remainingMinutes}m remaining)`);
          setTimeout(() => setCacheStatus(null), 4000);
          
          return data;
        } else {
          setCacheStatus("⚠ Cache expired - fetching fresh data");
          setTimeout(() => setCacheStatus(null), 3000);
        }
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
      setCacheStatus("❌ Cache error - fetching from server");
      setTimeout(() => setCacheStatus(null), 3000);
    }
    return null;
  }, []);

  // Save data to cache with metadata
  const saveCachedData = useCallback((data) => {
    try {
      const cacheObject = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
      
      const metadata = {
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        itemCount: data.length
      };
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      
      setCacheStatus("💾 Data cached successfully");
      setTimeout(() => setCacheStatus(null), 3000);
    } catch (error) {
      console.error("Error saving cached data:", error);
      if (error.name === 'QuotaExceededError') {
        setCacheStatus("⚠ Storage quota exceeded - cache not saved");
        setTimeout(() => setCacheStatus(null), 4000);
      }
    }
  }, []);

  // Load user preferences
  const loadUserPreferences = useCallback(() => {
    try {
      const prefs = localStorage.getItem(USER_PREFS_KEY);
      if (prefs) {
        const { sortBy: savedSort, autoRefresh: savedAutoRefresh } = JSON.parse(prefs);
        if (savedSort) setSortBy(savedSort);
        if (savedAutoRefresh !== undefined) setAutoRefresh(savedAutoRefresh);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

  // Save user preferences
  const saveUserPreferences = useCallback(() => {
    try {
      const prefs = { sortBy, autoRefresh };
      localStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  }, [sortBy, autoRefresh]);

  // Save search history
  const saveSearchHistory = useCallback((term) => {
    if (!term) return;
    try {
      const history = JSON.parse(localStorage.getItem(SEARCH_CACHE_KEY) || '[]');
      const updated = [term, ...history.filter(t => t !== term)].slice(0, 5);
      localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUserPreferences();
    
    const fetchProducts = async () => {
      const cachedProducts = loadCachedData();
      if (cachedProducts && cachedProducts.length > 0) {
        setProducts(cachedProducts);
        setCacheInfo(calculateCacheStats());
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(
          "https://student-alliance-api.code4bharat.com/api/products/category/Digital%20Board "
        );
        setProducts(res.data);
        saveCachedData(res.data);
        setCacheInfo(calculateCacheStats());
        
        if (!res.data || res.data.length === 0) {
          console.warn("No products found in the database.");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setOfflineMode(true);
        setCacheStatus("❌ Network error - using offline mode");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [loadCachedData, saveCachedData, calculateCacheStats, loadUserPreferences]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      const stats = calculateCacheStats();
      if (stats && !stats.isValid) {
        handleRefresh(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, calculateCacheStats]);

  // Save preferences when changed
  useEffect(() => {
    saveUserPreferences();
  }, [sortBy, autoRefresh, saveUserPreferences]);

  // Update cache info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheInfo(calculateCacheStats());
    }, 30000);

    return () => clearInterval(interval);
  }, [calculateCacheStats]);

  const handleAddProduct = () => {
    setIsModalOpen(true);
    setSelectedProduct(null);
  };

  const saveProduct = (product) => {
    let updatedProducts;
    if (selectedProduct) {
      updatedProducts = products.map((p) =>
        p._id === product._id ? product : p
      );
    } else {
      updatedProducts = [...products, product];
    }
    
    setProducts(updatedProducts);
    saveCachedData(updatedProducts);
    setCacheInfo(calculateCacheStats());
    setIsModalOpen(false);
  };

  const handleRefresh = async (silent = false) => {
    setLoading(true);
    if (!silent) {
      setCacheStatus("🔄 Refreshing data...");
    }
    
    try {
      const res = await axios.get(
        "https://student-alliance-api.code4bharat.com/api/products/category/Digital%20Board "
      );
      setProducts(res.data);
      saveCachedData(res.data);
      setCacheInfo(calculateCacheStats());
      setOfflineMode(false);
      
      if (!silent) {
        setCacheStatus("✓ Data refreshed successfully!");
        setTimeout(() => setCacheStatus(null), 3000);
      }
    } catch (error) {
      console.error("Failed to refresh products:", error);
      setOfflineMode(true);
      setCacheStatus("❌ Refresh failed - using cached data");
      setTimeout(() => setCacheStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_METADATA_KEY);
    setCacheInfo(null);
    setCacheStatus("🗑️ Cache cleared successfully!");
    setTimeout(() => setCacheStatus(null), 2000);
  };

  const handleClearAllData = () => {
    if (confirm("Clear all cached data including preferences and search history?")) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_METADATA_KEY);
      localStorage.removeItem(SEARCH_CACHE_KEY);
      localStorage.removeItem(USER_PREFS_KEY);
      setCacheInfo(null);
      setCacheStatus("🗑️ All data cleared!");
      setTimeout(() => setCacheStatus(null), 2000);
    }
  };

  const handleExportCache = () => {
    try {
      const data = {
        products,
        metadata: calculateCacheStats(),
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `digital-board-cache-${Date.now()}.json`;
      a.click();
      setCacheStatus("💾 Cache exported successfully!");
      setTimeout(() => setCacheStatus(null), 3000);
    } catch (error) {
      console.error("Export failed:", error);
      setCacheStatus("❌ Export failed");
      setTimeout(() => setCacheStatus(null), 3000);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "stock") return b.quantity - a.quantity;
      return 0;
    });

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.length > 2) {
      saveSearchHistory(value);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Cache Status Banner */}
          <AnimatePresence>
            {cacheStatus && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center justify-between shadow-sm"
              >
                <span className="font-medium">{cacheStatus}</span>
                <button
                  onClick={() => setCacheStatus(null)}
                  className="ml-4 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offline Mode Banner */}
          {offlineMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg text-sm flex items-center gap-2"
            >
              <span className="text-lg">📡</span>
              <span className="font-medium">Offline Mode - Using cached data</span>
            </motion.div>
          )}

          {/* Products Section */}
          <div className="relative p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Header with Controls */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Digital Board
                </h1>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRefresh(false)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    title="Refresh products"
                  >
                    <span className={loading ? "animate-spin" : ""}>🔄</span>
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                  
                  <button
                    onClick={handleClearCache}
                    className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors flex items-center gap-2"
                    title="Clear cache"
                  >
                    🗑️ Clear Cache
                  </button>

                  <button
                    onClick={handleExportCache}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors flex items-center gap-2"
                    title="Export cache"
                  >
                    💾 Export
                  </button>

                  <button
                    onClick={handleClearAllData}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-2"
                    title="Clear all data"
                  >
                    🔥 Clear All
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search digital boards..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock">Stock Quantity</option>
                </select>

                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
                </label>
              </div>

              {/* Cache Info Card */}
              {cacheInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 font-medium">Cache Status</div>
                      <div className="text-blue-700 font-bold">
                        {cacheInfo.isValid ? "✓ Active" : "❌ Expired"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Expires In</div>
                      <div className="text-blue-700 font-bold">{cacheInfo.remainingMinutes}m</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Cache Size</div>
                      <div className="text-blue-700 font-bold">{cacheInfo.sizeInKB} KB</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Access Count</div>
                      <div className="text-blue-700 font-bold">{cacheInfo.accessCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Last Access</div>
                      <div className="text-blue-700 font-bold text-xs">{cacheInfo.lastAccessed}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Loading State */}
            {loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading digital boards...</p>
              </div>
            )}

            {/* Product Cards */}
            {!loading || products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id || index}
                    className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 bg-white flex flex-col cursor-pointer"
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => {
                      router.push(`/admin/ProductDetails/${product._id}`);
                    }}
                  >
                    <div className="relative w-full aspect-[4/3] bg-gray-50">
                      <Image
                        src={product.image || "/placeholder-product.jpg"}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 flex-grow">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.category && (
                        <div className="text-xs text-gray-500 mt-1">
                          {product.category}
                        </div>
                      )}
                      <div className="mt-3 flex justify-between items-center">
                        <span className="px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                          ₹{product.price?.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.quantity?.toLocaleString()} in stock
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}

            {/* Empty State */}
            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 font-medium">
                  {searchTerm ? "No digital boards match your search" : "No digital boards found"}
                </p>
              </div>
            )}

            {/* Product Count */}
            {filteredProducts.length > 0 && !loading && (
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing {filteredProducts.length} of {products.length} {products.length === 1 ? "board" : "boards"}
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isModalOpen && (
          <Modal
            product={selectedProduct}
            onClose={() => setIsModalOpen(false)}
            onSave={saveProduct}
          />
        )}
      </div>
    </div>
  );
}