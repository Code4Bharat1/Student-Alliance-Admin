"use client";

import Header from "@/components/Header";
import Modal from "@/components/Modal";
import Image from "next/image";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/products/category/Light"
        );
        setProducts(res.data);
        if (!res.data || res.data.length === 0) {
          console.warn("No products found in the database.");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const handleAddProduct = () => {
    setIsModalOpen(true);
    setSelectedProduct(null);
  };

  const saveProduct = (product) => {
    if (selectedProduct) {
      // Update existing product
      const updatedProducts = products.map((p) =>
        p._id === product._id ? product : p
      );
      setProducts(updatedProducts);
    } else {
      // Add new product
      setProducts([...products, product]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Products Section */}
          <div className="relative p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Category Header */}
            <motion.div
              className="text-center py-0"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h1 className="text-4xl mb-14 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lights
              </h1>
            </motion.div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product._id || index}
                  className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 bg-white flex flex-col"
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
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
                    <h3 className="text-sm font-medium text-gray-900">
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

            {/* Product Count */}
            {products.length > 0 && !loading && (
              <div className="mt-4 text-sm text-gray-500">
                Showing{" "}
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
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
