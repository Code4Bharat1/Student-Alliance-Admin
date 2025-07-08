'use client';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import React, { useState } from 'react';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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
        p.id === product.id ? product : p
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
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Header onAddProduct={handleAddProduct} />
        {/* Inject children into the layout correctly */}
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                products,
                setProducts,
                onEditProduct: handleEditProduct,
                onDeleteProduct: handleDeleteProduct,
              })
            : child
        )}
        {isModalOpen && (
          <Modal
            product={selectedProduct}
            onClose={() => setIsModalOpen(false)}
            onSave={saveProduct}
          />
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
