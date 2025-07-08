"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
} from "recharts";

const AnalyticsDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [customersPerMonth, setCustomersPerMonth] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Sample data - replace with your actual data
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
    { name: "IFPD", revenue: 120000 },
    { name: "Camers", revenue: 85000 },
    { name: "Stem", revenue: 65000 },
    { name: "Stands", revenue: 35000 },
    { name: "Mic", revenue: 45000 },
  ];

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders");
        setTotalOrders(res.data.length);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };
    const fetchCustomerCount = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/customers");
        setTotalCustomers(res.data.length);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };
    const fetchCustomersPerMonth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/customers/stats/per-month"
        );
        setCustomersPerMonth(res.data);
      } catch (err) {
        console.error("Failed to fetch customers per month:", err);
      }
    };
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    const fetchRecentOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders");
        // Sort by createdAt or updatedAt and take the latest 5
        const sorted = res.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentOrders(sorted);
      } catch (err) {
        console.error("Failed to fetch recent orders:", err);
      }
    };
    fetchOrderCount();
    fetchCustomerCount();
    fetchCustomersPerMonth();
    fetchProducts();
    fetchRecentOrders();
  }, []);

  // Define all possible categories
  const ALL_CATEGORIES = [
    "IFPD",
    "3D Printers",
    "Stem and Robotics",
    "Cables",
    "Others",
    "Camers",
    "Stem",
    "Stands",
    "Mic",
    // Add more if needed
  ];

  // Prepare data for PieChart: group by category and count products in each
  const productCategoryData = ALL_CATEGORIES.map((cat) => ({
    name: cat,
    value: products.filter((product) => product.category === cat).length,
  }));

  // Prepare data for PieChart: Top 3 products, rest as "Others"
  const getTopProductsData = (products) => {
    // Count products by name
    const counts = {};
    products.forEach((product) => {
      const name = product.name || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });

    // Convert to array and sort by count
    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top 3 products
    const top3 = sorted.slice(0, 3);
    // Sum the rest as "Others"
    const othersValue = sorted
      .slice(3)
      .reduce((sum, item) => sum + item.value, 0);

    if (othersValue > 0) {
      top3.push({ name: "Others", value: othersValue });
    }

    return top3;
  };

  const topProducts = getTopProductsData(products);

  // Summary cards data
  const summaryData = [
    { title: "Total Sales", value: "₹2,47,800", change: "+12%", trend: "up" },
    { title: "Total Orders", value: totalOrders, change: "+5%", trend: "up" },
    {
      title: "Total Customers",
      value: totalCustomers,
      change: "+8%",
      trend: "up",
    }, // Show real customer count
    { title: "Conversion Rate", value: "3.2%", change: "-0.5%", trend: "down" },
  ];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28DFF",
    "#FF6666",
    "#66FF66",
  ];

  // Format tooltip for rupees
  const rupeeTooltipFormatter = (value) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  // Prepare data for BarChart: group by category and sum quantities
  const productsBarData = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    quantity: products
      .filter((product) => product.category === cat)
      .reduce((sum, product) => sum + (product.quantity || 0), 0),
  }));

  return (
    <div className="p-6 text-black ml-64 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryData.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {item.title}
                </p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.trend === "up"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Trend Chart */}
        <div className="bg-white text-black p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={rupeeTooltipFormatter} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Sales (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4">
            Top Selling Products
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by Category Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4">
            Revenue by Category
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={rupeeTooltipFormatter} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Acquisition */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4">
            Customer Acquisition
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customersPerMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="New Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product Quantities */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">
          Product Quantities
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productsBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" name="Quantity" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-black mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {order._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerDetails?.name ||
                      order.customer?.name ||
                      "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{order.total?.toLocaleString() || "0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.orderStatus === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.orderStatus === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.orderStatus === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
