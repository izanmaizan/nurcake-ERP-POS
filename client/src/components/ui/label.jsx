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

const Label = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <label
            ref={ref}
            className={cn(
                `text-sm font-medium leading-none text-[${textColor}] peer-disabled:cursor-not-allowed peer-disabled:opacity-70`,
                className
            )}
            {...props}
        />
    );
});

Label.displayName = "Label";

export { Label };