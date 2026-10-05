"use client";
import * as React from "react";
import {createPortal} from "react-dom";
import {X} from "lucide-react";
import {cn} from "@/lib/utils";
const C=React.createContext<{open:boolean;set:(v:boolean)=>void}>({open:false,set:()=>{}});
export function Dialog({open=false,onOpenChange,children}:{open?:boolean;onOpenChange?:(v:boolean)=>void;children:React.ReactNode}){return <C.Provider value={{open,set:v=>onOpenChange?.(v)}}>{children}</C.Provider>;}
export function DialogContent({className,children,showCloseButton=true,onOpenAutoFocus,...props}:{className?:string;children:React.ReactNode;showCloseButton?:boolean;onOpenAutoFocus?:(e:any)=>void;[k:string]:any}){const c=React.useContext(C),[mounted,setMounted]=React.useState(false);React.useEffect(()=>setMounted(true),[]);if(!c.open||!mounted)return null;const body=<><div data-slot="dialog-overlay" onClick={()=>c.set(false)}/><div data-slot="dialog-content" role="dialog" aria-modal="true" className={cn("bg-background border rounded-lg",className)} {...props}>{children}{showCloseButton?<button data-slot="dialog-close" type="button" onClick={()=>c.set(false)} aria-label="關閉"><X/></button>:null}</div></>;return createPortal(body,document.body);}
export const DialogTitle=(p:React.ComponentProps<"h2">)=><h2 data-slot="dialog-title" {...p}/>;
export const DialogDescription=(p:React.ComponentProps<"p">)=><p data-slot="dialog-description" {...p}/>;
export const DialogHeader=(p:React.ComponentProps<"div">)=><div data-slot="dialog-header" {...p}/>;
export const DialogFooter=(p:React.ComponentProps<"div">)=><div data-slot="dialog-footer" {...p}/>;
export const DialogClose=({children}:{children?:React.ReactNode})=>{const c=React.useContext(C);return <button data-slot="dialog-close" type="button" onClick={()=>c.set(false)}>{children}</button>;};
export const DialogTrigger=({children}:{children?:React.ReactNode})=>{const c=React.useContext(C);return <button type="button" onClick={()=>c.set(true)}>{children}</button>;};
