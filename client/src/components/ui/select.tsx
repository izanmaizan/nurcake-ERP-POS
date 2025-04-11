import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"];
// Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(
    ({ className, children, ...props }, ref) => (
        <SelectPrimitive.Trigger
            ref={ref}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-[${COLORS[0]}] bg-[${bgColor}] px-3 py-2 text-sm text-[${textColor}] placeholder:text-[${secondaryTextColor}] focus:outline-none focus:ring-2 focus:ring-[${COLORS[0]}] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}>
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-4 w-4 text-[${secondaryTextColor}]" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef(
    ({ className, ...props }, ref) => (
        <SelectPrimitive.ScrollUpButton
            ref={ref}
            className={`flex cursor-default items-center justify-center py-1 text-[${textColor}] ${className}`}
            {...props}>
            <ChevronUp className="h-4 w-4" />
        </SelectPrimitive.ScrollUpButton>
    )
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef(
    ({ className, ...props }, ref) => (
        <SelectPrimitive.ScrollDownButton
            ref={ref}
            className={`flex cursor-default items-center justify-center py-1 text-[${textColor}] ${className}`}
            {...props}>
            <ChevronDown className="h-4 w-4" />
        </SelectPrimitive.ScrollDownButton>
    )
);
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef(
    ({ className, children, position = "popper", ...props }, ref) => (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                ref={ref}
                className={`relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-[${COLORS[0]}] bg-[${cardBgColor}] text-[${textColor}] shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out ${className}`}
                position={position}
                {...props}>
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport className="p-1">
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef(
    ({ className, children, ...props }, ref) => (
        <SelectPrimitive.Item
            ref={ref}
            className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none text-[${secondaryTextColor}] hover:bg-[${bgColor}] focus:bg-[${bgColor}] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
            {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
};