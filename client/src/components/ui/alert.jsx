import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/tailwind-utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-[#2d2d2d] border-[#FFD700] text-[#FFD700]",
        destructive:
          "border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500 bg-[#2d2d2d]",
        success:
          "border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500 bg-[#2d2d2d]",
        warning:
          "border-[#DAA520] text-[#DAA520] dark:border-[#DAA520] [&>svg]:text-[#DAA520] bg-[#2d2d2d]",
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
      "mb-1 font-medium leading-none tracking-tight text-[#FFD700]",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed text-[#DAA520]", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-100",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out",
      "data-[state=open]:fade-in data-[state=open]:animate-in",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef(
  ({ className, variant, ...props }, ref) => (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 w-[calc(100%-theme(spacing.4))] max-w-lg rounded-lg bg-[#2d2d2d] border border-[#FFD700] p-6 shadow-lg",
          "data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-bottom-10",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
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
    className={cn("text-lg font-semibold text-[#FFD700]", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-[#DAA520]", className)}
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
        "inline-flex h-10 items-center justify-center rounded-md border border-[#FFD700] bg-[#2d2d2d] px-4 py-2 text-sm font-medium text-[#FFD700] transition-colors hover:bg-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
        "inline-flex h-10 items-center justify-center rounded-md bg-[#FFD700] px-4 py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#DAA520] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
};
