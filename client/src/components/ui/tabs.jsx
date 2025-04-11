import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/tailwind-utils";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"];
// Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md p-1 border",
            "md:h-12 lg:h-14",
            className
        )}
        style={{
            backgroundColor: bgColor,
            borderColor: COLORS[0],
            color: textColor
        }}
        {...props}
    />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
            "transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "data-[state=active]:shadow-sm",
            "sm:px-4 md:px-5 md:text-base lg:px-6",
            className
        )}
        style={{
            color: textColor,
            '--ring-color': COLORS[0],
            '--ring-offset-color': bgColor,
            '--active-bg': cardBgColor,
            '--active-text': COLORS[0],
            '--inactive-text': textColor,
            '--hover-bg': `${COLORS[2]}30`
        }}
        {...props}
    />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "sm:mt-3 md:mt-4",
            className
        )}
        style={{
            color: textColor,
            '--ring-color': COLORS[0],
            '--ring-offset-color': bgColor
        }}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };