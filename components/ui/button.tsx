import * as React from "react";
import {cn} from "@/lib/utils";
export type ButtonProps=React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:"default"|"outline"|"ghost"|"link"|"destructive"|"secondary";size?:string};
export const Button=React.forwardRef<HTMLButtonElement,ButtonProps>(({className,variant="default",...props},ref)=><button ref={ref} data-slot="button" data-variant={variant} className={cn("inline-flex items-center justify-center gap-2 rounded-md disabled:pointer-events-none disabled:opacity-50",variant==="default"&&"bg-primary text-primary-foreground",variant==="outline"&&"border bg-background",variant==="ghost"&&"hover:bg-accent",variant==="link"&&"underline-offset-4 hover:underline",className)} {...props}/>);
Button.displayName="Button";
