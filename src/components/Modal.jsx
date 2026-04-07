"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    rating: 0,
    quantity: 0,
    discount: 0,
    stocks: 0,
    features: [],
    additionalImages: ["", "", ""],
    ...(product || {}),
  });

  if (!formData.features) formData.features = [];
  if (!formData.additionalImages) formData.additionalImages = ["", "", ""];

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentFeature, setCurrentFeature] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { value: "Camera", icon: "📷" },
    { value: "Digital Board", icon: "📋" },
    { value: "Mic", icon: "🎤" },
    { value: "Cable", icon: "🔌" },
    { value: "Speaker", icon: "🔊" },
    { value: "Light", icon: "💡" },
    { value: "Stand", icon: "🎬" },
    { value: "OPS", icon: "⚙️" },
    { value: "IFPD", icon: "🖥️" },
    { value: "3D Printers", icon: "🖨️" },
    { value: "STEM & Robotics", icon: "🤖" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleDrag = (e, isDragging) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(isDragging);
  };

  const handleDrop = (e, index = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      uploadImage(file, index);
    }
  };

  const uploadImage = async (file, index = null) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    if (index !== null) {
      setUploadingIndex(index);
    } else {
      setUploading(true);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.fileUrl) {
        if (index !== null) {
          const updatedImages = [...formData.additionalImages];
          updatedImages[index] = data.fileUrl;
          setFormData((prev) => ({
            ...prev,
            additionalImages: updatedImages,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            image: data.fileUrl,
            wasabiKey: data.wasabiKey,
          }));
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
      setUploadingIndex(null);
    }
  };

  const handleImageUpload = async (e, index = null) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadImage(file, index);
  };

  const addFeature = () => {
    if (currentFeature.trim() && !formData.features.includes(currentFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()],
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.additionalImages];
    updatedImages[index] = "";
    setFormData((prev) => ({
      ...prev,
      additionalImages: updatedImages,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.image) newErrors.image = "Main image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (uploading || uploadingIndex !== null) {
      alert("Please wait until image uploads are complete.");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      rating: Number(formData.rating),
      quantity: Number(formData.quantity),
      discount: Number(formData.discount),
      stocks: Number(formData.stocks),
      imagePublicId: formData.imagePublicId,
    };

    setSaving(true);
    try {
      const url = product
        ? `https://api-studentalliance.nexcorealliance.com/api/products/${product._id}`
        : "https://api-studentalliance.nexcorealliance.com/api/products";

      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        window.dispatchEvent(new Event("productAdded"));
        onSave(result);
        onClose();
      } else {
        alert("Failed to save product: " + result.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {product ? "Edit Product" : "Add New Product"}
              </h3>
              <p className="text-blue-100 text-sm">
                {product ? "Update your product details" : "Fill in the details to add a new product"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Professional DSLR Camera"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 transition-all outline-none`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full border-2 ${errors.price ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 pl-8 transition-all outline-none`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className={`w-full border-2 ${errors.category ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 transition-all outline-none`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.value}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Description
              </label>
              <textarea
                name="description"
                placeholder="Describe your product features and benefits..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 transition-all outline-none resize-none"
              />
            </div>
          </div>

          {/* Inventory Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Inventory & Pricing
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stocks</label>
                <input
                  type="number"
                  name="stocks"
                  min="0"
                  placeholder="0"
                  value={formData.stocks}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <input
                  type="number"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              Product Features
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentFeature}
                onChange={(e) => setCurrentFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                placeholder="Add a feature (press Enter)"
                className="flex-1 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 transition-all outline-none"
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {(formData.features || []).map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-2 rounded-full text-sm font-medium text-blue-700"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-blue-500 hover:text-red-600 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center transition-all"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
              Product Images
            </h4>

            {/* Main Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Main Image <span className="text-red-500">*</span>
              </label>
              <div
                onDragEnter={(e) => handleDrag(e, true)}
                onDragLeave={(e) => handleDrag(e, false)}
                onDragOver={(e) => handleDrag(e, true)}
                onDrop={(e) => handleDrop(e)}
                className={`relative border-2 border-dashed ${dragActive ? 'border-blue-500 bg-blue-50' : errors.image ? 'border-red-500' : 'border-gray-300'} rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-blue-600 font-medium">Uploading...</p>
                  </div>
                ) : formData.image ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={formData.image}
                      alt="Main product"
                      className="h-32 w-32 rounded-lg object-cover shadow-lg"
                    />
                    <p className="text-sm text-gray-500">Click or drag to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-600 font-semibold">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Images (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(formData.additionalImages || []).map((img, index) => (
                  <div
                    key={index}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadingIndex === index ? (
                      <div className="flex flex-col items-center gap-2 h-24">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="text-xs text-blue-600">Uploading...</p>
                      </div>
                    ) : img ? (
                      <div className="relative">
                        <img
                          src={img}
                          alt={`Additional ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 h-24 justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-xs text-gray-500">Add Image</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading || saving || uploadingIndex !== null}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold transition-all ${
                  uploading || saving || uploadingIndex !== null
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white"
                }`}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </span>
                ) : (
                  "Save Product"
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}