import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/tailwind-utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-[#2d2d2d] p-1 text-[#DAA520] border border-[#FFD700]",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
      "ring-offset-[#1a1a1a] transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DAA520] focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#FFD700] data-[state=active]:shadow-sm",
      "data-[state=inactive]:text-[#DAA520] data-[state=inactive]:hover:bg-[#3d3d3d]",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 text-[#DAA520]",
      "ring-offset-[#1a1a1a]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DAA520] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
