"use client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Modal from "@/components/Modal";
import React, { useState } from "react";

const AdminLayout = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleAddProduct = () => {
    setIsModalOpen(true);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    setIsModalOpen(true);
    setSelectedProduct(product);
  };

  const saveProduct = (product) => {
    if (selectedProduct) {
      const updatedProducts = products.map((p) =>
        p.id === product.id ? product : p,
      );
      setProducts(updatedProducts);
    } else {
      const newProduct = { ...product, id: Date.now() };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
  };

  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 ml-0 lg:ml-[260px] flex flex-col min-h-screen">
        <Header
          onAddProduct={handleAddProduct}
          onMenuToggle={() => setMobileSidebarOpen((p) => !p)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, {
                  products,
                  setProducts,
                  onEditProduct: handleEditProduct,
                  onDeleteProduct: handleDeleteProduct,
                })
              : child,
          )}
        </main>
      </div>
      {isModalOpen && (
        <Modal
          product={selectedProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={saveProduct}
        />
      )}
    </div>
  );
};

export default AdminLayout;
