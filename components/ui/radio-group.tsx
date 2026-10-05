"use client";
import * as React from "react";
const C=React.createContext<{value?:string;set?:(v:string)=>void}>({});
export function RadioGroup({value,onValueChange,className,children}:{value?:string;onValueChange?:(v:string)=>void;className?:string;children:React.ReactNode}){return <C.Provider value={{value,set:onValueChange}}><div data-slot="radio-group" className={className} role="radiogroup">{children}</div></C.Provider>;}
export function RadioGroupItem({value,className,...props}:{value:string;className?:string;[k:string]:any}){const c=React.useContext(C);return <button type="button" data-slot="radio-group-item" role="radio" aria-checked={c.value===value} className={className} onClick={()=>c.set?.(value)} {...props}><span aria-hidden="true">{c.value===value?"●":""}</span></button>;}
