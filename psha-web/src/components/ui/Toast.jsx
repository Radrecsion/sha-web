import { useEffect } from "react";

export default function Toast({ toast }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {}, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`${colors[toast.type] || "bg-gray-500"} text-white px-4 py-2 rounded-lg shadow-lg`}
      >
        {toast.message}
      </div>
    </div>
  );
}
