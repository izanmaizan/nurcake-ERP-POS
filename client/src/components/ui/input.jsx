import * as React from "react";
import { cn } from "../../lib/tailwind-utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[#FFD700] bg-[#1a1a1a] px-3 py-2 text-sm text-[#DAA520] ring-offset-[#1a1a1a]",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#FFD700]",
        "placeholder:text-[#DAA520]/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DAA520] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-[#DAA520]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
