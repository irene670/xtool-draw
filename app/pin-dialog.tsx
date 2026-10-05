"use client";
import {useEffect,useState} from "react";
import {LockKeyhole,Delete,LoaderCircle} from "lucide-react";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {InputOTP,InputOTPGroup,InputOTPSlot} from "@/components/ui/input-otp";
import {Button} from "@/components/ui/button";
import {api} from "@/lib/client";

export default function PinDialog({open,purpose,onClose,onSuccess}:{open:boolean;purpose:"admin"|"station";onClose:()=>void;onSuccess:()=>void}){
 const [pin,setPin]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{if(open){setPin("");setError("");}},[open]);
 async function submit(){if(busy||pin.length!==4)return;setBusy(true);setError("");try{await api("auth",{pin,purpose});setPin("");onSuccess();}catch(e){setError((e as Error).message);setPin("");}finally{setBusy(false);}}
 return <Dialog open={open} onOpenChange={v=>{if(!v&&!busy)onClose();}}><DialogContent className="pin-dialog" onOpenAutoFocus={e=>e.preventDefault()}><div className="pin-lock"><LockKeyhole size={26}/></div><DialogTitle>{purpose==="admin"?"工作人員管理":"啟用現場裝置"}</DialogTitle><DialogDescription>{purpose==="admin"?"輸入管理 PIN，進入活動設定與新增功能。":"輸入工作人員 PIN，本裝置可連續進行活動。"}</DialogDescription><form onSubmit={e=>{e.preventDefault();void submit();}}><InputOTP maxLength={4} value={pin} onChange={setPin} inputMode="none" pattern="^[0-9]*$" autoComplete="off" aria-label="4 位數管理 PIN" disabled={busy} containerClassName="pin-input"><InputOTPGroup>{[0,1,2,3].map(i=><InputOTPSlot key={i} index={i} className={pin[i]?"pin-filled":""}/>)}</InputOTPGroup></InputOTP><div className="pin-keypad">{[1,2,3,4,5,6,7,8,9,"清除",0,"退格"].map(n=><Button key={n} type="button" variant="ghost" disabled={busy} onClick={()=>setPin(p=>n==="清除"?"":n==="退格"?p.slice(0,-1):(p+String(n)).slice(0,4))} aria-label={n==="退格"?"退格":String(n)}>{n==="退格"?<Delete size={22}/>:n}</Button>)}</div><p className="form-error" role="alert">{error}</p><Button type="submit" className="form-primary" disabled={pin.length!==4||busy}>{busy?<><LoaderCircle className="animate-spin"/>驗證中</>:purpose==="admin"?"驗證工作人員":"啟用裝置"}</Button></form><p className="pin-footnote">預設 PIN：0000 · 正式活動前建議修改</p></DialogContent></Dialog>;
}
