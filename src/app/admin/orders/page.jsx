"use client";

import { useState, useEffect, useCallback } from "react";
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
          lastAccessed: lastAccessed
            ? new Date(lastAccessed).toLocaleString()
            : "Never",
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
            lastAccessed: now,
          };
          localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(updatedMeta));

          const remainingMinutes = Math.ceil((CACHE_DURATION - age) / 60000);
          setCacheStatus(
            `✓ Loaded from cache (${remainingMinutes}m remaining)`,
          );
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
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));

      const metadata = {
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        itemCount: data.length,
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
        const { statusFilter: savedStatus, autoRefresh: savedAutoRefresh } =
          JSON.parse(prefs);
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
        const res = await axios.get("/api/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
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
  }, [
    loadCachedData,
    saveCachedData,
    calculateCacheStats,
    loadFilterPreferences,
  ]);

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
      const res = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
        exportDate: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
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
    indexOfLastOrder,
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
    <div className="min-h-full">
      {/* Cache Status Banner */}
      {cacheStatus && (
        <div className="mb-4 p-3 bg-info-bg border border-border-primary text-text-primary rounded-xl text-sm flex items-center justify-between">
          <span className="font-medium">{cacheStatus}</span>
          <button
            onClick={() => setCacheStatus(null)}
            className="ml-4 text-text-tertiary hover:text-text-primary font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Offline Mode Banner */}
      {offlineMode && (
        <div className="mb-4 p-3 bg-warning-bg border border-border-primary text-warning rounded-xl text-sm flex items-center gap-2">
          <span className="text-lg">📡</span>
          <span className="font-medium">Offline Mode — Using cached data</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-heading">
            Orders
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage and track all orders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRefresh(false)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-hover rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 text-sm font-medium text-warning bg-warning-bg hover:opacity-80 border border-border-primary rounded-xl transition-colors"
          >
            🗑️ Clear Cache
          </button>
          <button
            onClick={handleExportCache}
            className="px-4 py-2 text-sm font-medium text-success bg-success-bg hover:opacity-80 border border-border-primary rounded-xl transition-colors"
          >
            💾 Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className="bg-bg-card border border-border-primary rounded-xl p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary truncate">
                Total Orders
              </p>
              <p className="mt-1 text-2xl font-bold text-text-heading">
                {orders.length}
              </p>
            </div>
            <div className="p-2.5 text-brand-primary bg-info-bg rounded-xl">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="bg-bg-card border border-border-primary rounded-xl p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary truncate">
                Revenue
              </p>
              <p className="mt-1 text-2xl font-bold text-text-heading">
                ₹
                {orders
                  .reduce(
                    (sum, order) => sum + (order.total || order.amount || 0),
                    0,
                  )
                  .toFixed(2)}
              </p>
            </div>
            <div className="p-2.5 text-success bg-success-bg rounded-xl">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="bg-bg-card border border-border-primary rounded-xl p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary truncate">
                Avg. Order Value
              </p>
              <p className="mt-1 text-2xl font-bold text-text-heading">
                ₹
                {orders.length > 0
                  ? (
                      orders.reduce(
                        (sum, order) =>
                          sum + (order.total || order.amount || 0),
                        0,
                      ) / orders.length
                    ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="p-2.5 text-warning bg-warning-bg rounded-xl">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="bg-bg-card border border-border-primary rounded-xl p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary truncate">
                Pending Orders
              </p>
              <p className="mt-1 text-2xl font-bold text-text-heading">
                {
                  orders.filter(
                    (order) => order.orderStatus?.toLowerCase() === "pending",
                  ).length
                }
              </p>
            </div>
            <div className="p-2.5 text-error bg-error-bg rounded-xl">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filters & Cache Controls */}
      <div
        className="bg-bg-card border border-border-primary rounded-xl p-4 mb-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus text-text-primary placeholder-text-tertiary text-sm"
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
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              "all",
              "pending",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === status
                    ? "bg-brand-primary text-white"
                    : "bg-bg-hover text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Cache meta & auto-refresh */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border-primary">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-primary"
            />
            <span className="text-sm text-text-secondary">Auto-refresh</span>
          </label>
          {cacheInfo && (
            <div className="flex flex-wrap gap-4 text-xs text-text-tertiary">
              <span>
                Cache:{" "}
                <strong className="text-text-primary">
                  {cacheInfo.isValid ? "✓ Active" : "Expired"}
                </strong>
              </span>
              <span>
                Expires:{" "}
                <strong className="text-text-primary">
                  {cacheInfo.remainingMinutes}m
                </strong>
              </span>
              <span>
                Size:{" "}
                <strong className="text-text-primary">
                  {cacheInfo.sizeInKB} KB
                </strong>
              </span>
              <span>
                Hits:{" "}
                <strong className="text-text-primary">
                  {cacheInfo.accessCount}×
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="bg-bg-card border border-border-primary rounded-xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-primary">
            <thead>
              <tr className="bg-bg-tertiary">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">
                  Items
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-bold text-brand-primary">
                        #{order._id.slice(-6)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-text-primary">
                        {order.customerDetails?.name ||
                          order.customer?.name ||
                          "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                      <span className="text-sm text-text-secondary">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-success">
                        ₹{(order.total || order.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge
                        status={order.orderStatus?.toLowerCase() || "pending"}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-text-secondary">
                        {order.items?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button className="text-sm text-brand-primary hover:underline font-medium mr-3">
                        View
                      </button>
                      <button className="text-sm text-error hover:underline font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <p className="text-text-tertiary text-sm">
                      {loading
                        ? "Loading orders..."
                        : "No orders found matching your criteria."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > ordersPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border-primary gap-3">
            <p className="text-xs text-text-tertiary">
              Showing{" "}
              <strong className="text-text-primary">
                {indexOfFirstOrder + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-text-primary">
                {Math.min(indexOfLastOrder, filteredOrders.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-text-primary">
                {filteredOrders.length}
              </strong>
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs rounded-lg bg-bg-tertiary border border-border-primary text-text-secondary disabled:opacity-50 hover:bg-bg-hover"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                    className={`px-3 py-1.5 text-xs rounded-lg ${
                      currentPage === page
                        ? "bg-brand-primary text-white"
                        : "bg-bg-tertiary border border-border-primary text-text-secondary hover:bg-bg-hover"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg bg-bg-tertiary border border-border-primary text-text-secondary disabled:opacity-50 hover:bg-bg-hover"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
