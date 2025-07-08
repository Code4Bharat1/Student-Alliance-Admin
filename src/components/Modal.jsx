"use client";
//updated
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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
    ...(product || {}), // Spread product props if they exist
  });

  // Ensure arrays are properly initialized
  if (!formData.features) formData.features = [];
  if (!formData.additionalImages) formData.additionalImages = ["", "", ""];

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentFeature, setCurrentFeature] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

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

  const addFeature = () => {
    if (
      currentFeature.trim() &&
      !formData.features.includes(currentFeature.trim())
    ) {
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

  const handleSubmit = async () => {
    if (uploading || uploadingIndex !== null) {
      alert("Please wait until image uploads are complete.");
      return;
    }

    // if (!formData.name || !formData.price || !formData.image || !formData.category) {
    //   toast.error("Please fill in all required fields: name, price, image, and category.");
    //   return;
    // }

    const payload = {
      ...formData,
      price: Number(formData.price),
      rating: Number(formData.rating),
      quantity: Number(formData.quantity),
      discount: Number(formData.discount),
      stocks: Number(formData.stocks),
      imagePublicId: formData.imagePublicId,
    };

    console.log("Submitting payload:", payload);

    setSaving(true);
    try {
      const url = product
        ? `http://localhost:5000/api/products/${product._id}`
        : "http://localhost:5000/api/products";

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
    <div className="fixed inset-0 border-gray-700 text-black bg-gradient-to-r from-blue-200 to-pink-200 bg-opacity-80 flex items-center justify-center z-50">
      <motion.div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          {product ? "Edit Product" : "Add Product"}
        </h3>
        <div className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-2 transition"
              required
            />
          </div>

          {/* Product Price */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Product Price
            </label>
            <input
              type="number"
              name="price"
              placeholder="Enter product price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-2 transition"
            />
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Product Description
            </label>
            <textarea
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-2 transition resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Category */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Product Category *
              </label>
              <select
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-2 transition"
                required
              >
                <option value="">Select a category</option>
                <option value="Camera">Camera</option>
                <option value="Digital Board">Digital Board</option>
                <option value="Mic">Mic</option>
                <option value="Cable">Cable</option>
                <option value="Speaker">Speaker</option>
                <option value="Light">Light</option>
                <option value="Stand">Stand</option>
                <option value="OPS">OPS</option>
                <option value="IFPD">IFPD</option>
                <option value="3D Printers">3D Printers</option>
                <option value="STEM & Robotics">STEM & Robotics</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="0"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-2 transition"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                placeholder="Enter discount percentage"
                value={formData.discount}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-2 transition"
              />
            </div>

            {/* Stocks */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Stock Count
              </label>
              <input
                type="number"
                name="stocks"
                min="0"
                placeholder="Enter stock count"
                value={formData.stocks}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-2 transition"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Product Features
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentFeature}
                onChange={(e) => setCurrentFeature(e.target.value)}
                placeholder="Enter a feature"
                className="flex-1 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-2 transition"
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-blue-100 text-blue-600 px-3 rounded-lg hover:bg-blue-200 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.features || []).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Product Image */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Main Product Image *
            </label>
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center relative hover:shadow-md transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {uploading ? (
                <p className="text-blue-500">Uploading...</p>
              ) : formData.image ? (
                <img
                  src={formData.image}
                  alt="Selected"
                  className="h-20 w-20 mx-auto rounded-lg object-cover"
                />
              ) : (
                <p className="text-blue-500">Click to choose an image</p>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Additional Product Images
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(formData.additionalImages || []).map((img, index) => (
                <div
                  key={index}
                  className="border border-dashed border-gray-300 rounded-lg p-4 text-center relative hover:shadow-md transition"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, index)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploadingIndex === index ? (
                    <p className="text-blue-500">Uploading...</p>
                  ) : img ? (
                    <img
                      src={img}
                      alt={`Additional ${index + 1}`}
                      className="h-20 w-20 mx-auto rounded-lg object-cover"
                    />
                  ) : (
                    <p className="text-blue-500">Click to choose image</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={handleSubmit}
            disabled={uploading || saving || uploadingIndex !== null}
          >
            {uploading || saving || uploadingIndex !== null
              ? "Saving..."
              : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
