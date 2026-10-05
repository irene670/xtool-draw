import * as React from "react";
import {cn} from "@/lib/utils";
export const Input=React.forwardRef<HTMLInputElement,React.InputHTMLAttributes<HTMLInputElement>>(({className,...props},ref)=><input ref={ref} data-slot="input" className={cn("w-full rounded-md border bg-transparent px-3 py-2 outline-none",className)} {...props}/>);
Input.displayName="Input";
