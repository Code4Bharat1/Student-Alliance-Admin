"use client";

import { useState, useEffect, use, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const CACHE_KEY_PREFIX = "product_detail_";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for individual products
const CACHE_METADATA_KEY = "cache_metadata_product_details";

async function getProduct(id) {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    console.log("🔍 Fetching product with ID:", id);

    const res = await axios.get(`https://student-alliance-api.code4bharat.com/api/products/${id}`);

    if (res.status !== 200) {
      throw new Error(`Unexpected response status: ${res.status}`);
    }

    if (!res.data) {
      throw new Error("No product data received from server");
    }

    console.log("✅ Product found:", !!res.data);
    return res.data;
  } catch (error) {
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage =
        error.response.data?.message || error.response.statusText;

      switch (statusCode) {
        case 400:
          throw new Error(`Invalid request: ${errorMessage}`);
        case 404:
          throw new Error(`Product not found with ID: ${id}`);
        case 500:
          throw new Error(`Server error: ${errorMessage}`);
        default:
          throw new Error(`Request failed (${statusCode}): ${errorMessage}`);
      }
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check if the backend is running"
      );
    } else {
      throw error;
    }
  }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0 }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);

  const unwrappeParams = use(params);
  const productId = unwrappeParams?.id;

  // Calculate cache statistics
  const calculateCacheStats = useCallback(() => {
    try {
      const cacheKey = CACHE_KEY_PREFIX + productId;
      const cached = localStorage.getItem(cacheKey);
      const allMetadata = localStorage.getItem(CACHE_METADATA_KEY);
      
      if (cached && allMetadata) {
        const metadata = JSON.parse(allMetadata);
        const productMeta = metadata[productId];
        
        if (productMeta) {
          const { timestamp, accessCount, lastAccessed } = productMeta;
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
      }
    } catch (error) {
      console.error("Error calculating cache stats:", error);
    }
    return null;
  }, [productId]);

  // Load cached data
  const loadCachedData = useCallback(() => {
    try {
      const cacheKey = CACHE_KEY_PREFIX + productId;
      const cached = localStorage.getItem(cacheKey);
      const allMetadata = localStorage.getItem(CACHE_METADATA_KEY);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const age = now - timestamp;
        
        if (age < CACHE_DURATION) {
          // Update access metadata
          const metadata = allMetadata ? JSON.parse(allMetadata) : {};
          const productMeta = metadata[productId] || { timestamp, accessCount: 0 };
          
          metadata[productId] = {
            ...productMeta,
            accessCount: productMeta.accessCount + 1,
            lastAccessed: now
          };
          
          localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
          
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
  }, [productId]);

  // Save data to cache
  const saveCachedData = useCallback((data) => {
    try {
      const cacheKey = CACHE_KEY_PREFIX + productId;
      const cacheObject = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
      
      // Update metadata
      const allMetadata = localStorage.getItem(CACHE_METADATA_KEY);
      const metadata = allMetadata ? JSON.parse(allMetadata) : {};
      
      metadata[productId] = {
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        productName: data.name
      };
      
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      
      setCacheStatus("💾 Product cached successfully");
      setTimeout(() => setCacheStatus(null), 3000);
    } catch (error) {
      console.error("Error saving cached data:", error);
      if (error.name === 'QuotaExceededError') {
        setCacheStatus("⚠ Storage quota exceeded");
        setTimeout(() => setCacheStatus(null), 4000);
      }
    }
  }, [productId]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try cache first
        const cachedProduct = loadCachedData();
        if (cachedProduct) {
          setProduct(cachedProduct);
          setCacheInfo(calculateCacheStats());
          setLoading(false);
          return;
        }
        
        // Fetch from API
        const productData = await getProduct(productId);
        setProduct(productData);
        saveCachedData(productData);
        setCacheInfo(calculateCacheStats());
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, loadCachedData, saveCachedData, calculateCacheStats]);

  const handleRefresh = async () => {
    setLoading(true);
    setCacheStatus("🔄 Refreshing product...");
    
    try {
      const productData = await getProduct(productId);
      setProduct(productData);
      saveCachedData(productData);
      setCacheInfo(calculateCacheStats());
      setCacheStatus("✓ Product refreshed!");
      setTimeout(() => setCacheStatus(null), 3000);
    } catch (err) {
      console.error("Error refreshing product:", err);
      setError(err.message);
      setCacheStatus("❌ Refresh failed");
      setTimeout(() => setCacheStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    const cacheKey = CACHE_KEY_PREFIX + productId;
    localStorage.removeItem(cacheKey);
    
    // Update metadata
    const allMetadata = localStorage.getItem(CACHE_METADATA_KEY);
    if (allMetadata) {
      const metadata = JSON.parse(allMetadata);
      delete metadata[productId];
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    }
    
    setCacheInfo(null);
    setCacheStatus("🗑️ Cache cleared!");
    setTimeout(() => setCacheStatus(null), 2000);
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (loading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="mx-auto w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </motion.div>
          <motion.p 
            className="text-gray-700 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading product details...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <motion.div 
          variants={slideUp}
          className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg text-center"
        >
          <motion.div 
            animate={{ }}
            transition={{ duration: 0.5 }}
            className="text-red-500 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to Load Product
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (!product) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <motion.div 
          variants={slideUp}
          className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg text-center"
        >
          <div className="text-gray-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Product Not Found
          </h1>
          <p className="text-gray-600 mt-2">
            The requested product could not be found in our catalog.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  const images = [product.image, ...(product.additionalImages || [])].filter(Boolean);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen ml-56 bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Cache Status Banner */}
      <AnimatePresence>
        {cacheStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center justify-between shadow-sm"
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

      <div className="max-w-7xl mx-auto">
        {/* Cache Controls */}
        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            Refresh
          </button>
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
          >
            🗑️ Clear Cache
          </button>
        </div>

        {/* Cache Info */}
        {cacheInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
          >
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <div className="text-gray-600 font-medium">Status</div>
                <div className="text-blue-700 font-bold">
                  {cacheInfo.isValid ? "✓ Cached" : "❌ Expired"}
                </div>
              </div>
              <div>
                <div className="text-gray-600 font-medium">Expires</div>
                <div className="text-blue-700 font-bold">{cacheInfo.remainingMinutes}m</div>
              </div>
              <div>
                <div className="text-gray-600 font-medium">Size</div>
                <div className="text-blue-700 font-bold">{cacheInfo.sizeInKB} KB</div>
              </div>
              <div>
                <div className="text-gray-600 font-medium">Views</div>
                <div className="text-blue-700 font-bold">{cacheInfo.accessCount}</div>
              </div>
              <div>
                <div className="text-gray-600 font-medium">Last View</div>
                <div className="text-blue-700 font-bold text-xs">{cacheInfo.lastAccessed}</div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image Gallery */}
            <div className="md:w-1/2 p-4 md:p-6">
              <div 
                className={`relative h-80 md:h-96 w-full rounded-xl overflow-hidden cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
                onClick={toggleZoom}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative h-full w-full ${isZoomed ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
                  >
                    <Image
                      src={images[selectedImage] || "/placeholder.jpg"}
                      alt={product.name || "Product image"}
                      fill
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {images.length > 1 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    More Images
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleImageClick(idx)}
                        className={`relative h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === idx ? 'border-blue-500' : 'border-transparent'}`}
                      >
                        <Image
                          src={img}
                          alt={`Product thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-8 md:w-1/2">
              <div className="flex flex-col h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <motion.h1 
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      className="text-2xl md:text-3xl font-bold text-gray-900"
                    >
                      {product.name}
                    </motion.h1>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800"
                    >
                      {product.category || "Uncategorized"}
                    </motion.span>
                  </div>

                  <div className="mt-4 flex items-center">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.svg
                          key={star}
                          whileHover={{ scale: 1.2 }}
                          className={`h-5 w-5 ${
                            star <= (product.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </motion.svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {product.rating ? `${product.rating}/5` : "No ratings"}
                    </span>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{product.price}
                      </span>
                      {product.discount && product.discount > 0 && (
                        <>
                          <span className="ml-2 text-sm text-red-500 line-through">
                            ₹
                            {(product.price / (1 - product.discount / 100)).toFixed(
                              2
                            )}
                          </span>
                          <motion.span 
                            whileHover={{ scale: 1.1 }}
                            className="ml-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 px-2 py-1 rounded-full"
                          >
                            {product.discount}% OFF
                          </motion.span>
                        </>
                      )}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`text-sm font-medium ${
                          product.stocks > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.stocks > 0
                          ? `In Stock (${product.stocks} available)`
                          : "Out of Stock"}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Description
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {product.description ||
                        "No description available for this product."}
                    </p>
                  </motion.div>

                  {product.features && product.features.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        Features
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {product.features.map((f, idx) => (
                          <motion.li 
                            key={idx} 
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="flex items-start"
                          >
                            <svg
                              className="h-5 w-5 text-green-500 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-gray-600">{f}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}