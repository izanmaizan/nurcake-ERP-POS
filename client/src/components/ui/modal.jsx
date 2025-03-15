// modal.jsx
import React from "react";

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-[#2d2d2d] border border-[#FFD700] rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#FFD700]">
            <h3 className="text-xl font-semibold text-[#FFD700]">{title}</h3>
            <button
              onClick={onClose}
              className="text-[#DAA520] hover:text-[#FFD700] focus:outline-none">
              <span className="sr-only">Tutup</span>
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-[#DAA520]">{children}</div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-[#FFD700]">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#3d3d3d] text-[#FFD700] rounded-md hover:bg-[#4d4d4d] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 focus:ring-offset-[#2d2d2d]">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
