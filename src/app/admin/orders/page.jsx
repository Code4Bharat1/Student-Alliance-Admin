"use client";

import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";

const CACHE_KEY = "orders_data";
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (orders change frequently)
const CACHE_METADATA_KEY = "cache_metadata_orders";
const FILTERS_CACHE_KEY = "orders_filters";

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 7;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

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

  // Load cached data
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
    }
    return null;
  }, []);

  // Save data to cache
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
      
      setCacheStatus("💾 Orders cached successfully");
      setTimeout(() => setCacheStatus(null), 3000);
    } catch (error) {
      console.error("Error saving cached data:", error);
    }
  }, []);

  // Load filter preferences
  const loadFilterPreferences = useCallback(() => {
    try {
      const prefs = localStorage.getItem(FILTERS_CACHE_KEY);
      if (prefs) {
        const { statusFilter: savedStatus, autoRefresh: savedAutoRefresh } = JSON.parse(prefs);
        if (savedStatus) setStatusFilter(savedStatus);
        if (savedAutoRefresh !== undefined) setAutoRefresh(savedAutoRefresh);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

  // Save filter preferences
  const saveFilterPreferences = useCallback(() => {
    try {
      const prefs = { statusFilter, autoRefresh };
      localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  }, [statusFilter, autoRefresh]);

  // Initial load
  useEffect(() => {
    loadFilterPreferences();
    
    const fetchOrders = async () => {
      const cachedOrders = loadCachedData();
      if (cachedOrders && cachedOrders.length > 0) {
        setOrders(cachedOrders);
        setCacheInfo(calculateCacheStats());
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get("https://api-studentalliance.nexcorealliance.com/api/orders");
        setOrders(res.data);
        saveCachedData(res.data);
        setCacheInfo(calculateCacheStats());
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOfflineMode(true);
        setCacheStatus("❌ Network error - using offline mode");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [loadCachedData, saveCachedData, calculateCacheStats, loadFilterPreferences]);

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
    saveFilterPreferences();
  }, [statusFilter, autoRefresh, saveFilterPreferences]);

  // Update cache info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheInfo(calculateCacheStats());
    }, 30000);

    return () => clearInterval(interval);
  }, [calculateCacheStats]);

  const handleRefresh = async (silent = false) => {
    setLoading(true);
    if (!silent) {
      setCacheStatus("🔄 Refreshing orders...");
    }
    
    try {
      const res = await axios.get("https://api-studentalliance.nexcorealliance.com/api/orders");
      setOrders(res.data);
      saveCachedData(res.data);
      setCacheInfo(calculateCacheStats());
      setOfflineMode(false);
      
      if (!silent) {
        setCacheStatus("✓ Orders refreshed successfully!");
        setTimeout(() => setCacheStatus(null), 3000);
      }
    } catch (err) {
      console.error("Failed to refresh orders:", err);
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

  const handleExportCache = () => {
    try {
      const data = {
        orders,
        metadata: calculateCacheStats(),
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-cache-${Date.now()}.json`;
      a.click();
      setCacheStatus("💾 Orders exported successfully!");
      setTimeout(() => setCacheStatus(null), 3000);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerDetails?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-green-100 text-green-800",
      delivered: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const normalized = status?.toLowerCase() || "pending";
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[normalized]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen ml-64 bg-gray-50">
      <Head>
        <title>Orders | Admin Dashboard</title>
        <meta name="description" content="Manage your e-commerce orders" />
      </Head>

      {/* Horizontal Navigation Bar */}
      <nav className="flex flex-row items-center gap-2 px-6 py-4 bg-gray-800">
        <Link
          href="/admin/dashboard"
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md"
        >
          Orders
          <span className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-bold leading-none text-white bg-indigo-500 rounded-full">
            {orders.length}
          </span>
        </Link>
        <Link
          href="/admin/customers"
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          Customers
        </Link>
        <Link
          href="/admin/analytics"
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          Analytics
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          Settings
        </Link>
      </nav>

      {/* Cache Status Banner */}
      {cacheStatus && (
        <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center justify-between shadow-sm">
          <span className="font-medium">{cacheStatus}</span>
          <button
            onClick={() => setCacheStatus(null)}
            className="ml-4 text-blue-600 hover:text-blue-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Offline Mode Banner */}
      {offlineMode && (
        <div className="mx-6 mt-4 p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg text-sm flex items-center gap-2">
          <span className="text-lg">📡</span>
          <span className="font-medium">Offline Mode - Using cached data</span>
        </div>
      )}

      {/* Cache Controls */}
      <div className="px-6 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRefresh(false)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className={loading ? "animate-spin" : ""}>🔄</span>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            
            <button
              onClick={handleClearCache}
              className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
            >
              🗑️ Clear Cache
            </button>

            <button
              onClick={handleExportCache}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
            >
              💾 Export
            </button>

            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
            </label>
          </div>

          {/* Cache Info */}
          {cacheInfo && (
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status: </span>
                <span className="font-bold text-blue-700">
                  {cacheInfo.isValid ? "✓ Active" : "❌ Expired"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Expires: </span>
                <span className="font-bold text-blue-700">{cacheInfo.remainingMinutes}m</span>
              </div>
              <div>
                <span className="text-gray-600">Size: </span>
                <span className="font-bold text-blue-700">{cacheInfo.sizeInKB} KB</span>
              </div>
              <div>
                <span className="text-gray-600">Access: </span>
                <span className="font-bold text-blue-700">{cacheInfo.accessCount}x</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">
                  Total Orders
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {orders.length}
                </p>
              </div>
              <div className="p-3 text-indigo-600 bg-indigo-100 rounded-full">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">
                  Revenue
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  ₹
                  {orders
                    .reduce((sum, order) => sum + (order.total || order.amount || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-3 text-green-600 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">
                  Avg. Order Value
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  ₹
                  {orders.length > 0 ? (
                    orders.reduce((sum, order) => sum + (order.total || order.amount || 0), 0) /
                    orders.length
                  ).toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="p-3 text-yellow-600 bg-yellow-100 rounded-full">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">
                  Pending Orders
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {orders.filter((order) => order.orderStatus?.toLowerCase() === "pending").length}
                </p>
              </div>
              <div className="p-3 text-red-600 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Orders table */}
        <div className="px-6 pb-6">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order._id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.customerDetails?.name ||
                              order.customer?.name ||
                              "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{(order.total || order.amount || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={
                              order.orderStatus?.toLowerCase() || "pending"
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.items?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="mr-2 text-indigo-600 hover:text-indigo-900">
                            View
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-sm text-center text-gray-500"
                      >
                        {loading ? "Loading orders..." : "No orders found matching your criteria."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {filteredOrders.length > ordersPerPage && (
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstOrder + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastOrder, filteredOrders.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredOrders.length}</span>{" "}
                  results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;