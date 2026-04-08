"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { ProductTable } from "@/components/ProductTable";

export default function AdminDashboard() {
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

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleSaveProduct = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    window.dispatchEvent(new Event("productAdded"));
  };

  return (
    <div>
      <ProductTable onEdit={handleEditProduct} />
      {modalOpen && (
        <Modal
          product={selectedProduct}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
