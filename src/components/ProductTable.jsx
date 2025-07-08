"use client";

import {
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductTable({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        // Validate and normalize product data
        const validatedProducts = res.data.map(product => ({
          ...product,
          name: product.name || "Unnamed Product",
          price: product.price ?? 0,
          quantity: product.quantity ?? 0,
          category: product.category || "Uncategorized",
          image: product.image || "/placeholder-product.jpg"
        }));
        setProducts(validatedProducts);
        if (!res.data || res.data.length === 0) {
          console.warn("No products found in the database.");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    const handleProductAdded = () => fetchProducts();
    window.addEventListener("productAdded", handleProductAdded);

    return () => {
      window.removeEventListener("productAdded", handleProductAdded);
    };
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id) => {
    const productToDelete = products.find((p) => p._id === id);
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${productToDelete._id}`
      );
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleDeleteClick = (id) => setConfirmDeleteId(id);
  const handleConfirmDelete = () =>
    confirmDeleteId && handleDelete(confirmDeleteId);
  const handleCancelDelete = () => setConfirmDeleteId(null);

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  return (
    <div className="ml-64 p-6 transition-all duration-300">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 text-black pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-100">
        <AnimatePresence>
          {confirmDeleteId && (
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="text-red-600">
                  <TrashIcon className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Delete Product?
                </h2>
                <p className="text-gray-500 text-sm">
                  Are you sure you want to delete this product? This action cannot
                  be undone.
                </p>
                <div className="flex justify-center space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelDelete}
                    className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold"
                  >
                    Confirm
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center space-x-2 text-blue-600">
                      <ArrowPathIcon className="h-6 w-6 animate-spin" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No products found. Try a different search!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    whileHover={{ scale: 1.01 }}
                    className="hover:bg-blue-50/50 transition-colors duration-150"
                  >
                    <td
                      className="px-6 py-4"
                      onClick={() => router.push(`/admin/ProductDetails/${product._id}`)}
                    >
                      <img
                        className="h-12 w-12 rounded-lg object-cover shadow-sm border border-gray-200"
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => router.push(`/admin/ProductDetails/${product._id}`)}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.category}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => router.push(`/admin/ProductDetails/${product._id}`)}
                    >
                      {product.price > 0 ? (
                        <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                          ₹{product.price.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 text-black"
                      onClick={() => router.push(`/admin/ProductDetails/${product._id}`)}
                    >
                      {product.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(product);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100"
                          title="Edit product"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(product._id);
                          }}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100"
                          title="Delete product"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredProducts.length > 0 && !isLoading && (
          <div className="mt-4 text-sm text-gray-500 p-4">
            Showing {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </div>
        )}
      </div>
    </div>
  );
}