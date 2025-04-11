import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

// Konstanta warna tema krem/emas
const COLORS = {
    primary: "#D4AF37",    // Emas utama
    secondary: "#C5B358",  // Emas sekunder
    accent: "#E6BE8A",     // Krem aksen
    bgLight: "#FAF3E0",    // Krem muda/background utama
    textDark: "#8B7D3F",   // Emas gelap untuk teks
    textMedium: "#B8A361", // Emas sedang untuk teks sekunder
    cardBg: "#FFF8E7"      // Krem sangat muda untuk kartu
};

const API = import.meta.env.VITE_API;

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-[#D4AF37] text-[#FAF3E0] hover:bg-[#C5B358]",
                destructive: "bg-red-500 text-white hover:bg-red-600",
                outline:
                    "border border-[#D4AF37] bg-[#FAF3E0] text-[#8B7D3F] hover:bg-[#FFF8E7] hover:text-[#D4AF37]",
                secondary: "bg-[#C5B358] text-[#FAF3E0] hover:bg-[#B8A361]",
                ghost: "text-[#8B7D3F] hover:bg-[#FFF8E7] hover:text-[#D4AF37]",
                link: "text-[#8B7D3F] underline-offset-4 hover:underline hover:text-[#D4AF37]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
                xs: "h-8 px-2.5 text-xs rounded-md", // Untuk layar mobile
                full: "w-full h-11 px-4", // Untuk membuat tombol memenuhi lebar kontainer
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={buttonVariants({ variant, size, className })}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };