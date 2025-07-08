import React from "react";
import AdminLayout from "./adminLayout";

const layout = ({ children }) => {
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
    </>
  );
};

export default layout;
