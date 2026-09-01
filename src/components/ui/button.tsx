import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-50 shadow-sm hover:bg-neutral-800 active:bg-neutral-950",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800",
        outline:
          "border border-neutral-200 bg-white shadow-xs hover:bg-neutral-50 hover:text-neutral-900 text-neutral-700",
        secondary:
          "bg-neutral-100 text-neutral-800 shadow-xs hover:bg-neutral-200/80",
        ghost: "hover:bg-neutral-100 hover:text-neutral-900 text-neutral-600",
        link: "text-neutral-900 underline-offset-4 hover:underline",
        subtle:
          "bg-neutral-50 border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        xs: "h-6 rounded px-2 text-[11px]",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-9 rounded-md px-4 text-sm",
        icon: "h-7 w-7",
        "icon-sm": "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
