import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#FFD700] text-[#1a1a1a] hover:bg-[#DAA520]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-[#FFD700] bg-[#2d2d2d] text-[#FFD700] hover:bg-[#3d3d3d] hover:text-[#FFD700]",
        secondary: "bg-[#DAA520] text-[#1a1a1a] hover:bg-[#B8860B]",
        ghost: "text-[#FFD700] hover:bg-[#3d3d3d] hover:text-[#FFD700]",
        link: "text-[#FFD700] underline-offset-4 hover:underline hover:text-[#DAA520]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
