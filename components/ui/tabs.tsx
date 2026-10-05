"use client";
import * as React from "react";
import {cn} from "@/lib/utils";
const C=React.createContext<{value:string;set:(v:string)=>void}>({value:"",set:()=>{}});
export function Tabs({value,defaultValue,onValueChange,className,children}:{value?:string;defaultValue?:string;onValueChange?:(v:string)=>void;className?:string;children:React.ReactNode}){const [inner,setInner]=React.useState(defaultValue||"");const v=value??inner;const set=(x:string)=>{if(value===undefined)setInner(x);onValueChange?.(x)};return <C.Provider value={{value:v,set}}><div data-slot="tabs" className={className}>{children}</div></C.Provider>;}
export const TabsList=({className,...p}:React.ComponentProps<"div">)=><div data-slot="tabs-list" role="tablist" className={className} {...p}/>;
export function TabsTrigger({value,className,disabled,children}:{value:string;className?:string;disabled?:boolean;children:React.ReactNode}){const c=React.useContext(C),active=c.value===value;return <button type="button" data-slot="tabs-trigger" data-state={active?"active":"inactive"} role="tab" aria-selected={active} disabled={disabled} className={className} onClick={()=>c.set(value)}>{children}</button>;}
export function TabsContent({value,className,children,...p}:{value:string;className?:string;children:React.ReactNode;[k:string]:any}){const c=React.useContext(C);if(c.value!==value)return null;return <div data-slot="tabs-content" data-state="active" className={cn("tabs-content",className)} {...p}>{children}</div>;}
