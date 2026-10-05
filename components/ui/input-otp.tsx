"use client";
import * as React from "react";
import {cn} from "@/lib/utils";
const C=React.createContext({value:""});
export function InputOTP({value="",onChange,maxLength=4,containerClassName,children,...props}:{value?:string;onChange?:(v:string)=>void;maxLength?:number;containerClassName?:string;children:React.ReactNode;[k:string]:any}){return <C.Provider value={{value}}><div data-slot="input-otp" className={cn("flex",containerClassName)}><input value={value} onChange={e=>onChange?.(e.target.value.replace(/\D/g,"").slice(0,maxLength))} maxLength={maxLength} className="sr-only" {...props}/>{children}</div></C.Provider>;}
export const InputOTPGroup=({className,...p}:React.ComponentProps<"div">)=><div data-slot="input-otp-group" className={cn("flex",className)} {...p}/>;
export function InputOTPSlot({index,className}:{index:number;className?:string}){const {value}=React.useContext(C);return <div data-slot="input-otp-slot" className={cn("grid place-items-center",className)}>{value[index]||""}</div>;}
