"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const AnalyticsDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [customersPerMonth, setCustomersPerMonth] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [dateRange, setDateRange] = useState("7days");

  const salesData = [
    { name: "Jan", sales: 4000, orders: 2400, customers: 1800 },
    { name: "Feb", sales: 3000, orders: 1398, customers: 1200 },
    { name: "Mar", sales: 2000, orders: 9800, customers: 800 },
    { name: "Apr", sales: 2780, orders: 3908, customers: 1600 },
    { name: "May", sales: 1890, orders: 4800, customers: 1400 },
    { name: "Jun", sales: 2390, orders: 3800, customers: 1900 },
    { name: "Jul", sales: 3490, orders: 4300, customers: 2100 },
  ];

  const revenueByCategory = [
    { name: "IFPD", revenue: 120000, growth: 12 },
    { name: "Cameras", revenue: 85000, growth: 8 },
    { name: "STEM", revenue: 65000, growth: -3 },
    { name: "Stands", revenue: 35000, growth: 15 },
    { name: "Mic", revenue: 45000, growth: 5 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const ordersRes = await fetch("https://student-alliance-api.code4bharat.com/api/orders");
        const ordersData = await ordersRes.json();
        setTotalOrders(ordersData.length);
        
        const sorted = ordersData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentOrders(sorted);

        const customersRes = await fetch("https://student-alliance-api.code4bharat.com/api/customers");
        const customersData = await customersRes.json();
        setTotalCustomers(customersData.length);

        const monthlyRes = await fetch(
          "https://student-alliance-api.code4bharat.com/api/customers/stats/per-month"
        );
        const monthlyData = await monthlyRes.json();
        setCustomersPerMonth(monthlyData);

        const productsRes = await fetch("https://student-alliance-api.code4bharat.com/api/products");
        const productsData = await productsRes.json();
        setProducts(productsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const ALL_CATEGORIES = [
    "IFPD", "3D Printers", "Stem and Robotics", "Cables", 
    "Others", "Camers", "Stem", "Stands", "Mic"
  ];

  const productCategoryData = ALL_CATEGORIES.map((cat) => ({
    name: cat,
    value: products.filter((product) => product.category === cat).length,
  })).filter(item => item.value > 0);

  const getTopProductsData = (products) => {
    const counts = {};
    products.forEach((product) => {
      const name = product.name || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const top3 = sorted.slice(0, 3);
    const othersValue = sorted.slice(3).reduce((sum, item) => sum + item.value, 0);

    if (othersValue > 0) {
      top3.push({ name: "Others", value: othersValue });
    }

    return top3;
  };

  const topProducts = getTopProductsData(products);

  const summaryData = [
    { 
      title: "Total Sales", 
      value: "₹2,47,800", 
      change: "+12%", 
      trend: "up",
      icon: "💰",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      title: "Total Orders", 
      value: totalOrders, 
      change: "+5%", 
      trend: "up",
      icon: "📦",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      change: "+8%",
      trend: "up",
      icon: "👥",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      title: "Conversion Rate", 
      value: "3.2%", 
      change: "-0.5%", 
      trend: "down",
      icon: "📈",
      gradient: "from-orange-500 to-red-500"
    },
  ];

  const COLORS = [
    "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", 
    "#10B981", "#EF4444", "#06B6D4"
  ];

  const rupeeTooltipFormatter = (value) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const productsBarData = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    quantity: products
      .filter((product) => product.category === cat)
      .reduce((sum, product) => sum + (product.quantity || 0), 0),
  })).filter(item => item.quantity > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ml-64 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Track your business performance</p>
          </div>

          {/* View Toggles */}
          <div className="flex gap-2 bg-white/80 backdrop-blur rounded-xl p-1.5 shadow-lg border border-gray-100">
            {["overview", "detailed"].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeView === view
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {summaryData.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-100 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                {item.icon}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.trend === "up"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.change}
              </span>
            </div>
            
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {item.title}
            </p>
            <p className="text-3xl font-bold text-gray-800">{item.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Sales Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Monthly performance</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Sales</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={rupeeTooltipFormatter}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorSales)"
                  name="Sales (₹)"
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#colorOrders)"
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-100"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Top Selling Products</h2>
            <p className="text-sm text-gray-500 mt-1">Best performers this month</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Revenue by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-100 mb-6"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Revenue by Category</h2>
          <p className="text-sm text-gray-500 mt-1">Performance across categories</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByCategory}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                formatter={rupeeTooltipFormatter}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="revenue" 
                name="Revenue (₹)" 
                fill="url(#colorRevenue)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Product Quantities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-100 mb-6"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Product Quantities</h2>
          <p className="text-sm text-gray-500 mt-1">Current inventory levels</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productsBarData}>
              <defs>
                <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="category"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={100}
                stroke="#6B7280"
              />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="quantity" 
                name="Quantity" 
                fill="url(#colorQuantity)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-100"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Latest transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order, index) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-blue-600">
                      #{order._id.slice(-6)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {order.customerDetails?.name || order.customer?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-600">
                      ₹{order.total?.toLocaleString() || "0"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                        order.orderStatus === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus === "Processing"
                          ? "bg-blue-100 text-blue-700"
                          : order.orderStatus === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">📦</span>
                      </div>
                      <p className="text-gray-600 font-medium">No recent orders</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;