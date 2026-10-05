"use client";
import * as React from "react";
import {cn} from "@/lib/utils";
export function Slider({value=[0],onValueChange,min=0,max=100,step=1,className,...props}:{value?:number[];onValueChange?:(v:number[])=>void;min?:number;max?:number;step?:number;className?:string;[k:string]:any}){return <input data-slot="slider" type="range" min={min} max={max} step={step} value={value[0]??0} onChange={e=>onValueChange?.([Number(e.target.value)])} className={cn("w-full",className)} {...props}/>;}
