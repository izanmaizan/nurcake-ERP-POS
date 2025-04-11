import * as React from "react";
import { cn } from "../../lib/tailwind-utils";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"];
// Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                `flex h-10 w-full rounded-md border border-[${COLORS[0]}] bg-[${cardBgColor}] px-3 py-2 text-sm text-[${textColor}] ring-offset-[${bgColor}]`,
                `file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[${textColor}]`,
                `placeholder:text-[${secondaryTextColor}]/50`,
                `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[${COLORS[0]}] focus-visible:ring-offset-2`,
                "disabled:cursor-not-allowed disabled:opacity-50",
                `hover:border-[${COLORS[1]}]`,
                "transition-colors duration-200",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

export { Input };