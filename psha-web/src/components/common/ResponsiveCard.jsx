// components/common/ResponsiveCard.jsx
export default function ResponsiveCard({ 
  title, 
  children, 
  footer, 
  className = "" 
}) {
  return (
    <div
      className={`p-4 sm:p-6 border rounded-xl shadow-sm 
                  bg-[var(--card)] text-[var(--text)] 
                  w-full max-w-full ${className}`}
    >
      {title && (
        <h2 className="font-semibold text-lg mb-4">{title}</h2>
      )}
      <div className="space-y-4">{children}</div>
      {footer && (
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
          {footer}
        </div>
      )}
    </div>
  );
}
