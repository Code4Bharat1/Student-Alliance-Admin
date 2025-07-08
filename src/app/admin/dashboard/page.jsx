"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Modal from "@/components/Modal";
import ProductTable from "@/components/ProductTable";
import { PencilIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard(props) {
  const { products, onEditProduct, onDeleteProduct, isLoading } = props;
  const router = useRouter();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const localToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!isAuthenticated && !token && !localToken) {
      router.replace("/form");
    }
  }, [isAuthenticated, token, router]);

  // Edit handler: open modal with product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  // Save handler: close modal and refresh table
  const handleSaveProduct = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    // Optionally: trigger a refresh, or rely on the ProductTable's event listener
  };

  return (
    <div>
      <ProductTable
        products={products}
        onEdit={handleEditProduct}
        onDelete={onDeleteProduct}
        isLoading={isLoading}
      />
      {modalOpen && (
        <Modal
          product={selectedProduct}
          onClick = {() =>onEdit(product)}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

