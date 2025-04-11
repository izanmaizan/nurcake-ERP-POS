// avatar.jsx
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "../../lib/tailwind-utils"

// Warna tema krem/emas
const COLORS = {
    bgColor: "#FAF3E0", // Krem muda/background utama
    textColor: "#8B7D3F", // Emas gelap untuk teks
    secondaryTextColor: "#B8A361", // Emas sedang untuk teks sekunder
    cardBgColor: "#FFF8E7", // Krem sangat muda untuk kartu
    accentColor: "#D4AF37", // Emas utama (accent)
    accentLight: "#E6BE8A", // Emas muda
    accentMedium: "#C5B358", // Emas sedang
};

const API = import.meta.env.VITE_API;

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex shrink-0 overflow-hidden rounded-full",
            "h-10 w-10",
            "sm:h-12 sm:w-12",
            "md:h-14 md:w-14",
            className
        )}
        {...props}
    />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
    />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full",
            `bg-[${COLORS.bgColor}] text-[${COLORS.textColor}]`,
            className
        )}
        {...props}
    />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback, COLORS, API }