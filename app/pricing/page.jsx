import Beams from "@/components/Beams";
import React from "react";

export default function page() {
  return (
    <div>
      <Beams />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Pricing Page</h1>
        <p className="text-lg text-gray-600">Explore our pricing plans and choose the one that fits your needs.</p>
        <div className="mt-8"></div>
          <div className="bg-white shadow-md rounded-lg p-6 max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Basic Plan</h2>
            <p className="text-gray-700 mb-4">Our basic plan offers essential features for individuals and small teams.</p>
            <p className="text-lg font-bold">$10/month</p>
          </div>
        </div>
    </div>
  );
}
