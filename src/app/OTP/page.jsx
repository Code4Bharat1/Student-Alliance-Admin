"use client";
import OTP from "@/components/OTP";
import React, { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTP />
    </Suspense>
  );
};

export default Page;
