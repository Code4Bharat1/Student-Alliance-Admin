'use client'
import UpdatePass from '@/components/UpdatePass'
import React, { Suspense } from "react";


const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <UpdatePass />
      </Suspense>
    </div>
  );
}

export default page;
