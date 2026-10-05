"use client";
import * as React from "react";
import {createPortal} from "react-dom";
import {cn} from "@/lib/utils";
const C=React.createContext<{open:boolean;set:(v:boolean)=>void}>({open:false,set:()=>{}});
export function AlertDialog({open=false,onOpenChange,children}:{open?:boolean;onOpenChange?:(v:boolean)=>void;children:React.ReactNode}){return <C.Provider value={{open,set:v=>onOpenChange?.(v)}}>{children}</C.Provider>;}
export function AlertDialogContent({className,children,...p}:React.ComponentProps<"div">){const c=React.useContext(C),[m,setM]=React.useState(false);React.useEffect(()=>setM(true),[]);if(!c.open||!m)return null;return createPortal(<><div data-slot="alert-dialog-overlay"/><div data-slot="alert-dialog-content" role="alertdialog" className={cn("bg-background border rounded-lg",className)} {...p}>{children}</div></>,document.body);}
export const AlertDialogTitle=(p:React.ComponentProps<"h2">)=><h2 data-slot="alert-dialog-title" {...p}/>;
export const AlertDialogDescription=(p:React.ComponentProps<"p">)=><p data-slot="alert-dialog-description" {...p}/>;
export const AlertDialogFooter=(p:React.ComponentProps<"div">)=><div data-slot="alert-dialog-footer" {...p}/>;
export function AlertDialogCancel({children,...p}:React.ButtonHTMLAttributes<HTMLButtonElement>){const c=React.useContext(C);return <button type="button" onClick={()=>c.set(false)} {...p}>{children}</button>;}
export function AlertDialogAction({children,onClick,...p}:React.ButtonHTMLAttributes<HTMLButtonElement>){const c=React.useContext(C);return <button type="button" onClick={e=>{onClick?.(e);c.set(false)}} {...p}>{children}</button>;}
