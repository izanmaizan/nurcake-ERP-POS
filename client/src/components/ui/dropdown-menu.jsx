import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "../../lib/tailwind-utils";

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

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef(
    ({ className, inset, children, ...props }, ref) => (
        <DropdownMenuPrimitive.SubTrigger
            ref={ref}
            className={cn(
                "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-[#8B7D3F] focus:bg-[#FFF8E7] data-[state=open]:bg-[#FFF8E7]",
                inset && "pl-8",
                className
            )}
            {...props}>
            {children}
            <ChevronRight className="ml-auto h-4 w-4 text-[#D4AF37]" />
        </DropdownMenuPrimitive.SubTrigger>
    )
);
DropdownMenuSubTrigger.displayName =
    DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef(
    ({ className, ...props }, ref) => (
        <DropdownMenuPrimitive.SubContent
            ref={ref}
            className={cn(
                "z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#D4AF37] bg-[#FAF3E0] p-1 text-[#8B7D3F] shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-auto sm:w-56 md:w-64",
                className
            )}
            {...props}
        />
    )
);
DropdownMenuSubContent.displayName =
    DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef(
    ({ className, sideOffset = 4, ...props }, ref) => {
        return (
            <div className="relative">
                <DropdownMenuPrimitive.Content
                    ref={ref}
                    sideOffset={sideOffset}
                    className={cn(
                        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#D4AF37] bg-[#FAF3E0] p-1 text-[#8B7D3F] shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-auto sm:w-56 md:w-64",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef(
    ({ className, inset, ...props }, ref) => (
        <DropdownMenuPrimitive.Item
            ref={ref}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-[#8B7D3F] focus:bg-[#FFF8E7] focus:text-[#D4AF37] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                inset && "pl-8",
                className
            )}
            {...props}
        />
    )
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef(
    ({ className, children, checked, ...props }, ref) => (
        <DropdownMenuPrimitive.CheckboxItem
            ref={ref}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors text-[#8B7D3F] focus:bg-[#FFF8E7] focus:text-[#D4AF37] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            checked={checked}
            {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-[#D4AF37]" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    )
);
DropdownMenuCheckboxItem.displayName =
    DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef(
    ({ className, children, ...props }, ref) => (
        <DropdownMenuPrimitive.RadioItem
            ref={ref}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors text-[#8B7D3F] focus:bg-[#FFF8E7] focus:text-[#D4AF37] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-[#D4AF37] text-[#D4AF37]" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
            {children}
        </DropdownMenuPrimitive.RadioItem>
    )
);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef(
    ({ className, inset, ...props }, ref) => (
        <DropdownMenuPrimitive.Label
            ref={ref}
            className={cn(
                "px-2 py-1.5 text-sm font-semibold text-[#D4AF37]",
                inset && "pl-8",
                className
            )}
            {...props}
        />
    )
);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef(
    ({ className, ...props }, ref) => (
        <DropdownMenuPrimitive.Separator
            ref={ref}
            className={cn("-mx-1 my-1 h-px bg-[#E6BE8A]", className)}
            {...props}
        />
    )
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }) => {
    return (
        <span
            className={cn(
                "ml-auto text-xs tracking-widest text-[#B8A361] opacity-70",
                className
            )}
            {...props}
        />
    );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
};