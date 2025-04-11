// alert.jsx
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/tailwind-utils";

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

const alertVariants = cva(
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    {
        variants: {
            variant: {
                default: `bg-[${COLORS.cardBgColor}] border-[${COLORS.accentColor}] text-[${COLORS.textColor}]`,
                destructive:
                    `border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500 bg-[${COLORS.cardBgColor}]`,
                success:
                    `border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500 bg-[${COLORS.cardBgColor}]`,
                warning:
                    `border-[${COLORS.accentMedium}] text-[${COLORS.textColor}] dark:border-[${COLORS.accentMedium}] [&>svg]:text-[${COLORS.accentMedium}] bg-[${COLORS.cardBgColor}]`,
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, className }))}
        {...props}
    />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn(
            "mb-1 font-medium leading-none tracking-tight text-[#8B7D3F]",
            className
        )}
        {...props}
    />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed text-[#B8A361]", className)}
        {...props}
    />
));
AlertDescription.displayName = "AlertDescription";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-all duration-100",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out",
            "data-[state=open]:fade-in data-[state=open]:animate-in",
            className
        )}
        {...props}
    />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef(
    ({ className, variant, ...props }, ref) => {
        const API = import.meta.env.VITE_API;
        return (
            <>
                <AlertDialogOverlay />
                <AlertDialogPrimitive.Content
                    ref={ref}
                    className={cn(
                        "fixed z-50 w-[calc(100%-theme(spacing.4))] max-w-lg rounded-lg bg-[#FFF8E7] border border-[#D4AF37] p-6 shadow-lg",
                        "data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10",
                        "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-bottom-10",
                        "md:w-full",
                        "sm:max-w-[425px]",
                        className
                    )}
                    {...props}
                />
            </>
        );
    }
);
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold text-[#8B7D3F]", className)}
        {...props}
    />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef(
    ({ className, ...props }, ref) => (
        <AlertDialogPrimitive.Description
            ref={ref}
            className={cn("text-sm text-[#B8A361]", className)}
            {...props}
        />
    )
);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogCancel = React.forwardRef(
    ({ className, variant, ...props }, ref) => (
        <AlertDialogPrimitive.Cancel
            ref={ref}
            className={cn(
                "mt-2 sm:mt-0",
                "inline-flex h-10 items-center justify-center rounded-md border border-[#D4AF37] bg-[#FFF8E7] px-4 py-2 text-sm font-medium text-[#8B7D3F] transition-colors hover:bg-[#FAF3E0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                className
            )}
            {...props}
        />
    )
);
AlertDialogCancel.displayName = "AlertDialogCancel";

const AlertDialogAction = React.forwardRef(
    ({ className, variant, ...props }, ref) => (
        <AlertDialogPrimitive.Action
            ref={ref}
            className={cn(
                "mt-2 sm:mt-0",
                "inline-flex h-10 items-center justify-center rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#C5B358] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                className
            )}
            {...props}
        />
    )
);
AlertDialogAction.displayName = "AlertDialogAction";

export {
    Alert,
    AlertTitle,
    AlertDescription,
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
    COLORS,
    API
};