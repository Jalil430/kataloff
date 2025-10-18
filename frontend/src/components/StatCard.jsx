import React from "react";

export default function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="text-sm text-indigo-600/80">{title}</div>
      <div className="text-2xl md:text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
