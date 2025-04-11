import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/tailwind-utils";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"];
// Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

const Separator = React.forwardRef((
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
) => (
    <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
            `shrink-0 bg-[${COLORS[1]}]`,
            orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
            className
        )}
        {...props} />
))
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };