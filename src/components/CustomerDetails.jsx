"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543210",
      accountCreated: "2023-05-15",
      totalOrders: 12,
      totalRevenue: 45600,
      lastOrder: "2023-10-28",
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 8765432109",
      accountCreated: "2023-06-22",
      totalOrders: 8,
      totalRevenue: 32400,
      lastOrder: "2023-10-25",
      status: "Active",
    },
    {
      id: 3,
      name: "Amit Patel",
      email: "amit.patel@example.com",
      phone: "+91 7654321098",
      accountCreated: "2023-07-10",
      totalOrders: 5,
      totalRevenue: 18750,
      lastOrder: "2023-09-15",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Neha Gupta",
      email: "neha.gupta@example.com",
      phone: "+91 6543210987",
      accountCreated: "2023-08-05",
      totalOrders: 15,
      totalRevenue: 67800,
      lastOrder: "2023-10-30",
      status: "Active",
    },
    {
      id: 5,
      name: "Sanjay Verma",
      email: "sanjay.verma@example.com",
      phone: "+91 9432109876",
      accountCreated: "2023-09-18",
      totalOrders: 3,
      totalRevenue: 9900,
      lastOrder: "2023-10-10",
      status: "Active",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredCustomers = customers
    .filter(
      (customer) =>
        (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)) &&
        (filterStatus === "all" || customer.status === filterStatus),
    )
    .sort((a, b) => {
      if (sortConfig.key) {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "totalRevenue") {
          aVal = Number(aVal);
          bVal = Number(bVal);
        }

        if (aVal < bVal) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
      }
      return 0;
    });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "Active").length,
    revenue: customers.reduce((sum, c) => sum + c.totalRevenue, 0),
    avgOrders: (
      customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length
    ).toFixed(1),
  };

  return (
    <div>
      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-card rounded-2xl p-8 max-w-2xl w-full border border-border-primary"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-heading">
                      {selectedCustomer.name}
                    </h2>
                    <p className="text-text-tertiary">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-info-bg rounded-xl p-4">
                  <p className="text-sm text-text-secondary mb-1">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-text-heading">
                    {selectedCustomer.totalOrders}
                  </p>
                </div>
                <div className="bg-success-bg rounded-xl p-4">
                  <p className="text-sm text-text-secondary mb-1">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-text-heading">
                    ₹{selectedCustomer.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-bg-hover rounded-xl p-4">
                  <p className="text-sm text-text-secondary mb-1">Last Order</p>
                  <p className="text-lg font-semibold text-text-heading">
                    {new Date(selectedCustomer.lastOrder).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <div className="bg-bg-hover rounded-xl p-4">
                  <p className="text-sm text-text-secondary mb-1">
                    Account Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedCustomer.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                  <svg
                    className="w-5 h-5 text-text-tertiary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-text-primary">
                    {selectedCustomer.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                  <svg
                    className="w-5 h-5 text-text-tertiary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-text-primary">
                    Member since{" "}
                    {new Date(
                      selectedCustomer.accountCreated,
                    ).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-text-heading">
              Customers
            </h1>
            <p className="text-text-secondary mt-1">
              Manage your customer base
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-12 pr-4 py-3 border border-border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus transition-all bg-bg-input text-text-primary placeholder-text-tertiary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total Customers",
              value: stats.total,
              icon: "👥",
              gradient: "from-blue-500 to-indigo-500",
            },
            {
              label: "Active Customers",
              value: stats.active,
              icon: "✅",
              gradient: "from-green-500 to-emerald-500",
            },
            {
              label: "Total Revenue",
              value: `₹${(stats.revenue / 1000).toFixed(0)}k`,
              icon: "💰",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              label: "Avg Orders",
              value: stats.avgOrders,
              icon: "📦",
              gradient: "from-orange-500 to-red-500",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-bg-card rounded-xl p-5 border border-border-primary"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3 flex items-center justify-center text-xl`}
              >
                {stat.icon}
              </div>
              <p className="text-text-secondary text-sm font-medium">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-text-heading mt-1">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Filters and View Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-bg-card rounded-xl p-4 border border-border-primary mb-6"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {["all", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterStatus === status
                    ? "bg-brand-primary text-white"
                    : "bg-bg-hover text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>

          <div className="flex gap-2 bg-bg-hover rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-bg-card text-brand-primary"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
              style={
                viewMode === "grid" ? { boxShadow: "var(--shadow-sm)" } : {}
              }
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-bg-card text-brand-primary"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
              style={
                viewMode === "list" ? { boxShadow: "var(--shadow-sm)" } : {}
              }
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setSelectedCustomer(customer)}
              className="bg-bg-card rounded-2xl p-6 border border-border-primary cursor-pointer group"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-text-heading group-hover:text-brand-primary transition-colors">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-text-tertiary">{customer.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {customer.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-info-bg rounded-lg p-3">
                  <p className="text-xs text-text-secondary">Orders</p>
                  <p className="text-lg font-bold text-brand-primary">
                    {customer.totalOrders}
                  </p>
                </div>
                <div className="bg-success-bg rounded-lg p-3">
                  <p className="text-xs text-text-secondary">Revenue</p>
                  <p className="text-lg font-bold text-success">
                    ₹{(customer.totalRevenue / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    customer.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {customer.status}
                </span>
                <span className="text-xs text-text-tertiary">
                  Last: {new Date(customer.lastOrder).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-bg-card rounded-2xl border border-border-primary overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-bg-hover border-b border-border-primary">
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-bg-tertiary transition-colors"
                    onClick={() => requestSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Customer
                      {sortConfig.key === "name" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-bg-tertiary transition-colors"
                    onClick={() => requestSort("accountCreated")}
                  >
                    <div className="flex items-center gap-2">
                      Joined
                      {sortConfig.key === "accountCreated" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-bg-tertiary transition-colors"
                    onClick={() => requestSort("totalOrders")}
                  >
                    <div className="flex items-center gap-2">
                      Orders
                      {sortConfig.key === "totalOrders" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-bg-tertiary transition-colors"
                    onClick={() => requestSort("totalRevenue")}
                  >
                    <div className="flex items-center gap-2">
                      Revenue
                      {sortConfig.key === "totalRevenue" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-heading">
                            {customer.name}
                          </p>
                          <p className="text-sm text-text-tertiary">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {new Date(customer.accountCreated).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        ₹{customer.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {filteredCustomers.length === 0 && (
        <div className="bg-white/90 backdrop-blur rounded-2xl p-12 text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium text-lg">
            No customers found
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
