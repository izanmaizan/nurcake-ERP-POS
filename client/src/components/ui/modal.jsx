// modal.jsx
import React from "react";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"];
// Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
              className={`relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl bg-[${cardBgColor}] 
                      border border-[${COLORS[0]}] rounded-lg shadow-xl transition-all duration-300`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-3 sm:p-4 border-b border-[${COLORS[2]}]`}>
              <h3 className={`text-lg sm:text-xl font-semibold text-[${textColor}]`}>{title}</h3>
              <button
                  onClick={onClose}
                  className={`text-[${secondaryTextColor}] hover:text-[${textColor}] focus:outline-none 
                         transition-colors duration-200`}>
                <span className="sr-only">Tutup</span>
                <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
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
            <div className={`p-4 sm:p-6 text-[${textColor}] max-h-[70vh] overflow-y-auto`}>{children}</div>

            {/* Footer */}
            <div className={`flex justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t border-[${COLORS[2]}]`}>
              <button
                  onClick={onClose}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-[${bgColor}] text-[${textColor}] rounded-md 
                         border border-[${COLORS[1]}] hover:bg-[${cardBgColor}] 
                         focus:outline-none focus:ring-2 focus:ring-[${COLORS[0]}] focus:ring-offset-1 
                         transition-colors duration-200 text-sm sm:text-base`}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};