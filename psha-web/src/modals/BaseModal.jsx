export default function BaseModal({ title, children, onClose, width = "w-[600px]" }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div
        className={`bg-[var(--card)] text-[var(--text)] rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto transition-colors ${width}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--text)] hover:opacity-70 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
