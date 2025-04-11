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

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "sm:min-h-[100px] md:min-h-[120px] md:text-base",
                className
            )}
            style={{
                backgroundColor: cardBgColor,
                borderColor: COLORS[2],
                color: textColor,
                '--ring-color': COLORS[0],
                '--ring-offset-color': bgColor,
                '--placeholder-color': secondaryTextColor
            }}
            ref={ref}
            {...props}
        />
    );
});

Textarea.displayName = "Textarea";

export { Textarea };