import * as React from "react";
import {cn} from "@/lib/utils";
export const Table=({className,...p}:React.ComponentProps<"table">)=><div className="w-full overflow-x-auto"><table data-slot="table" className={cn("w-full",className)} {...p}/></div>;
export const TableHeader=(p:React.ComponentProps<"thead">)=><thead data-slot="table-header" {...p}/>;
export const TableBody=(p:React.ComponentProps<"tbody">)=><tbody data-slot="table-body" {...p}/>;
export const TableRow=(p:React.ComponentProps<"tr">)=><tr data-slot="table-row" {...p}/>;
export const TableHead=(p:React.ComponentProps<"th">)=><th data-slot="table-head" {...p}/>;
export const TableCell=(p:React.ComponentProps<"td">)=><td data-slot="table-cell" {...p}/>;
