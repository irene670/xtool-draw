"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {Bell,Settings2,Maximize,Minimize,Volume2,VolumeX,Check,LoaderCircle,Sparkles,RotateCcw,WifiOff,LayoutGrid} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Toaster} from "@/components/ui/sonner";
import {toast} from "sonner";
import Wheel from "./wheel";
import PinDialog from "./pin-dialog";
import Admin from "./admin";
import Confetti from "./confetti";
import {DEFAULT_CONFIG,StageState,Round,snapshotOf,rotationForOutcome,newId} from "@/lib/model";
import {StageSound} from "@/lib/sound";
import {api,ApiError} from "@/lib/client";
type Phase="idle"|"announcement"|"ready"|"spinning"|"result";
type Intent="admin"|"sale"|"spin"|"complete";

export default function Stage({activityId}:{activityId:string}){
 const [state,setState]=useState<StageState|null>(null),[phase,setPhase]=useState<Phase>("idle"),[round,setRound]=useState<Round|null>(null),[busy,setBusy]=useState(false),[online,setOnline]=useState(true),[error,setError]=useState(""),[pinOpen,setPinOpen]=useState(false),[intent,setIntent]=useState<Intent>("admin"),[adminOpen,setAdminOpen]=useState(false),[authStamp,setAuthStamp]=useState(0),[rotation,setRotation]=useState(0),[remaining,setRemaining]=useState(5),[soundReady,setSoundReady]=useState(false),[muted,setMuted]=useState(false),[fullscreen,setFullscreen]=useState(false);
 const sound=useRef<StageSound|null>(null),mutedRef=useRef(false),busyRef=useRef(false),phaseRef=useRef<Phase>("idle"),roundRef=useRef<Round|null>(null),stateRef=useRef<StageState|null>(null),adminRef=useRef(false),pendingId=useRef<string|null>(null),announcementEnd=useRef(0),fetching=useRef(false),actionEpoch=useRef(0),wake=useRef<any>(null),resultTimer=useRef<ReturnType<typeof setTimeout>|null>(null),resultShown=useRef(false),intentRef=useRef<Intent>("admin"),webActions=useRef<any>({});
 mutedRef.current=muted;phaseRef.current=phase;roundRef.current=round;stateRef.current=state;adminRef.current=adminOpen;intentRef.current=intent;
 const config=state?.config||DEFAULT_CONFIG;
 const activityQuery=`activity=${encodeURIComponent(activityId)}`;
 const scopedGet=<T,>(action:string)=>api<T>(`${action}?${activityQuery}`);
 const scopedPost=<T,>(action:string,body:any)=>api<T>(action,{...body,activityId});
 const snapshot=round?.snapshot||snapshotOf(config,state?.stock||Object.fromEntries(config.prizes.map(p=>[p.id,p.quantity])),activityId);
 const exhausted=config.mode==="pool"&&!snapshotOf(config,state?.stock||{},activityId).total;
 const setWorking=(v:boolean)=>{busyRef.current=v;setBusy(v);};
 const audio=()=>{sound.current??=new StageSound();sound.current.volume=(stateRef.current?.config.volume??70)/100;sound.current.muted=mutedRef.current;return sound.current;};
 async function enableSound(){const ok=await audio().unlock();setSoundReady(ok);return ok;}
 function askPin(action:Intent){setIntent(action);setPinOpen(true);}
 function handleError(e:unknown,action?:Intent){const msg=(e as Error).message;setError(msg);toast.error(msg);if(e instanceof ApiError&&e.status===401&&action)askPin(action);}
 const fetchState=useCallback(async(reconcile=true)=>{
  if(fetching.current)return null;fetching.current=true;const epoch=actionEpoch.current;
  try{const data=await scopedGet<StageState>("state");if(epoch!==actionEpoch.current||data.revision<(stateRef.current?.revision??-1))return null;setState(data);stateRef.current=data;setOnline(true);
   if(reconcile&&!busyRef.current&&!adminRef.current&&phaseRef.current!=="spinning"){
    const current=roundRef.current;
    if(data.active){
     if(!current||current.id!==data.active.id){pendingId.current=data.active.id;resultShown.current=false;setRound(data.active);roundRef.current=data.active;setRotation(0);setError("");
      if(data.active.outcome){setRotation(rotationForOutcome(data.active.snapshot,data.active.outcome));setPhase("result");phaseRef.current="result";}
      else {const seconds=data.config.announcementSeconds*1000-(data.serverNow-data.active.createdAt);if(seconds>0){announcementEnd.current=Date.now()+seconds;setPhase("announcement");phaseRef.current="announcement";}else{setPhase("ready");phaseRef.current="ready";}}
     }else if(data.active.outcome&&!current.outcome){setRound(data.active);setRotation(rotationForOutcome(data.active.snapshot,data.active.outcome));setPhase("result");phaseRef.current="result";}
    }else if(current){pendingId.current=null;resultShown.current=false;setRound(null);roundRef.current=null;setPhase("idle");phaseRef.current="idle";setRotation(0);}
   }
   return data;
  }catch(e){setOnline(false);if(!stateRef.current)setError((e as Error).message);return null;}finally{fetching.current=false;}
 },[]);
 useEffect(()=>{void fetchState();const timer=setInterval(()=>{if(!document.hidden)void fetchState();},4000);const visibility=()=>{if(!document.hidden){void fetchState();if(document.fullscreenElement&&"wakeLock" in navigator)(navigator as any).wakeLock.request("screen").then((w:any)=>{wake.current=w;}).catch(()=>{});}};const offline=()=>setOnline(false);window.addEventListener("online",visibility);window.addEventListener("offline",offline);document.addEventListener("visibilitychange",visibility);return()=>{clearInterval(timer);window.removeEventListener("online",visibility);window.removeEventListener("offline",offline);document.removeEventListener("visibilitychange",visibility);wake.current?.release();sound.current?.dispose();sound.current=null;if(resultTimer.current)clearTimeout(resultTimer.current);};},[fetchState]);
 useEffect(()=>{if(phase!=="announcement")return;const update=()=>{const left=announcementEnd.current-Date.now();setRemaining(Math.max(1,Math.ceil(left/1000)));if(left<=0)setPhase("ready");};update();const timer=setInterval(update,100);return()=>clearInterval(timer);},[phase]);
 useEffect(()=>{const f=()=>setFullscreen(!!document.fullscreenElement);document.addEventListener("fullscreenchange",f);return()=>document.removeEventListener("fullscreenchange",f);},[]);
 useEffect(()=>{if(!state?.authenticated)return;const q=new URLSearchParams(window.location.search);if(q.get("setup")==="1"){setAuthStamp(v=>v+1);setAdminOpen(true);q.delete("setup");window.history.replaceState(null,"",`/?${q.toString()}`);}},[state?.authenticated]);
 function launch(r:Round){setRound(r);roundRef.current=r;setRotation(0);setError("");resultShown.current=false;if(r.outcome){setRotation(rotationForOutcome(r.snapshot,r.outcome));setPhase("result");return;}announcementEnd.current=Date.now()+config.announcementSeconds*1000;setRemaining(Math.ceil(config.announcementSeconds));setPhase("announcement");audio().bell(config.announcementSeconds);}
 async function startSale(){if(busyRef.current)return;setWorking(true);setError("");try{await enableSound();if(!stateRef.current?.authenticated){askPin("sale");return;}actionEpoch.current++;pendingId.current??=newId();const {round:r}=await scopedPost<{round:Round}>("start",{id:pendingId.current});launch(r);void fetchState(false);}catch(e){handleError(e,"sale");}finally{setWorking(false);}}
 async function spin(){if(busyRef.current||phaseRef.current!=="ready"||!roundRef.current)return;setWorking(true);setError("");try{await enableSound();if(!stateRef.current?.authenticated){askPin("spin");return;}actionEpoch.current++;const r=(await scopedPost<{round:Round}>("draw",{id:roundRef.current.id})).round;
   if(!r.outcome)throw new Error("尚未取得中獎結果，請重試。");setRound(r);roundRef.current=r;resultShown.current=false;setRotation(rotationForOutcome(r.snapshot,r.outcome,rotation));setPhase("spinning");phaseRef.current="spinning";audio().spin(r.outcome.spinMs);
  }catch(e){handleError(e,"spin");}finally{setWorking(false);}}
 function reveal(){if(resultShown.current)return;resultShown.current=true;const id=roundRef.current?.id;resultTimer.current=setTimeout(()=>{if(roundRef.current?.id!==id||phaseRef.current!=="spinning")return;setPhase("result");phaseRef.current="result";audio().win();void fetchState(false);},650);}
 function resetLocal(){if(resultTimer.current){clearTimeout(resultTimer.current);resultTimer.current=null;}sound.current?.stop();setRound(null);roundRef.current=null;setPhase("idle");phaseRef.current="idle";setRotation(0);setError("");pendingId.current=null;resultShown.current=false;}
 async function complete(){if(busyRef.current||!roundRef.current)return;if(!stateRef.current?.authenticated){askPin("complete");return;}setWorking(true);setError("");try{actionEpoch.current++;await scopedPost("complete",{id:roundRef.current.id});resetLocal();void fetchState(false);}catch(e){handleError(e,"complete");}finally{setWorking(false);}}
 async function pinSuccess(){setPinOpen(false);const data=await scopedGet<StageState>("state").catch(()=>null);if(!data){toast.error("驗證成功，活動資料正在重新連線，請再試一次。");void fetchState();return;}setState(data);stateRef.current=data;switch(intentRef.current){case "admin":setAuthStamp(v=>v+1);setAdminOpen(true);break;case "sale":void startSale();break;case "spin":void spin();break;case "complete":void complete();break;}}
 async function trySound(volume:number){const a=audio();a.volume=volume/100;a.muted=false;mutedRef.current=false;if(await a.unlock()){setSoundReady(true);setMuted(false);a.bell(config.announcementSeconds);}else toast.error("此瀏覽器尚未允許音效，請確認裝置聲音設定。");}
 async function toggleSound(){if(!soundReady){await trySound(config.volume);return;}const next=!mutedRef.current;mutedRef.current=next;setMuted(next);if(sound.current)sound.current.muted=next;toast(next?"此裝置已靜音":"此裝置音效已開啟");}
 async function toggleFullscreen(){try{if(document.fullscreenElement){await document.exitFullscreen();await wake.current?.release();}else{await document.documentElement.requestFullscreen();if("wakeLock" in navigator)try{wake.current=await (navigator as any).wakeLock.request("screen");}catch{}}}catch{toast("此瀏覽器未開放全螢幕，請使用瀏覽器的全螢幕功能。");}}
 async function lockDevice(){try{await api("logout",{});setAdminOpen(false);setState(s=>s?{...s,authenticated:false}:null);toast.success("此裝置已鎖定");}catch(e){toast.error((e as Error).message);}}
 webActions.current={get:()=>({phase:phaseRef.current,config:stateRef.current?.config?{eventName:stateRef.current.config.eventName,mode:stateRef.current.config.mode,prizes:stateRef.current.config.prizes.map(p=>({name:p.name,weight:p.weight}))}:null,today:stateRef.current?.stats,active:roundRef.current?{sequence:roundRef.current.sequence,status:roundRef.current.status,prize:phaseRef.current==="result"?roundRef.current.outcome?.prize.name:null}:null})};
 useEffect(()=>{const context=(document as any).modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();const validate=(input:unknown)=>{if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).length)throw new Error("此操作不接受額外欄位。");};const register=(tool:any)=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};register({name:"read_xtool_stage",title:"讀取 xTool 活動狀態",description:"讀取目前設備活動舞台、今日成交及抽獎統計；不更動紀錄。",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input:unknown){validate(input);return webActions.current.get();}});return()=>lifecycle.abort();},[]);
 const interactive=phase==="ready"||phase==="spinning";
 const brandedTitle=config.eventName.toLowerCase().startsWith("xtool ");
 const deviceMark=config.deviceName.replace(/^xtool\s*/i,"")||config.deviceName;
 return <main className={`kiosk-app phase-${phase}`}>
  <Toaster theme="dark" position="top-center" richColors/>
  <header className="kiosk-header" data-testid="stage-header">
   <div className="kiosk-brand"><a className="kiosk-back" href="/" aria-label="回到活動選單"><LayoutGrid/></a><span>xtool</span><i/><b>{deviceMark}</b></div>
   <div className="kiosk-event">{config.eventName}</div>
   <nav className="kiosk-tools" aria-label="舞台控制">
    <button aria-label={muted?"開啟音效":soundReady?"靜音":"啟用音效"} onClick={toggleSound}>{muted?<VolumeX/>:<Volume2/>}</button>
    <button aria-label={fullscreen?"離開全螢幕":"全螢幕"} onClick={toggleFullscreen}>{fullscreen?<Minimize/>:<Maximize/>}<span>全螢幕</span></button>
    <button className="kiosk-admin-entry" aria-label="管理設定" onClick={()=>askPin("admin")} disabled={phase==="announcement"||phase==="spinning"||busy}><Settings2/><span>管理設定</span></button>
   </nav>
  </header>
  <div className="kiosk-body">
   <div className="kiosk-viewport" data-testid="stage-viewport">
    <div className="kiosk-panel">
     {phase==="announcement"?<section className="kiosk-announcement" aria-live="assertive">
      <div className="kiosk-sold" aria-hidden="true">SOLD.</div>
      <Bell className="ringing-bell kiosk-bell"/>
      <h1>現場<span>成交！</span></h1>
      <p>{config.announcement}</p>
      <div className="kiosk-countdown"><span>{config.inviteText}</span><strong>{remaining}</strong></div>
      <div className="announcement-progress" style={{animationDuration:config.announcementSeconds+"s"}}/>
     </section>:phase==="result"&&round?.outcome?<section className="kiosk-result" aria-live="polite">
      <Confetti/>
      <div className="kiosk-win-icon"><Sparkles/></div>
      <p className="kiosk-congrats">恭喜中獎</p>
      <h1>{round.outcome.prize.name}</h1>
      <span className="kiosk-win-rule"/>
      <p className="kiosk-result-meta">{`成交 #${String(round.sequence).padStart(3,"0")} · 中獎結果已保存`}</p>
      <Button className="kiosk-primary" onClick={complete} disabled={busy}>{busy?<LoaderCircle className="animate-spin"/>:<Check/>}完成・回到待機</Button>
     </section>:<section className="kiosk-draw" data-testid="draw-layout">
      <div className="kiosk-copy">
       <p className="kiosk-eyebrow">{interactive?`成交 #${String(round?.sequence||0).padStart(3,"0")} · 專屬幸運時刻`:"成交限定 · 100% 中獎"}</p>
       <h1 className={interactive?undefined:"kiosk-event-title"} aria-label={interactive?undefined:config.eventName}>{interactive?<>{phase==="spinning"?"您的好禮，":"這一轉，"}<br/><em>{phase==="spinning"?"即將揭曉。":"為您喝采。"}</em></>:<>{brandedTitle?<><span className="kiosk-title-brand">xtool</span>{" "}</>:null}<em>{brandedTitle?config.eventName.slice(6):config.eventName}</em></>}</h1>
       <p className="kiosk-intro">{interactive?(phase==="spinning"?"好運轉動中，請稍候。":"請輕觸轉盤中央，開啟好運。"):`完成 ${config.deviceName} 下訂，領取專屬好禮。`}</p>
       <div className="kiosk-action-area">
        {interactive?<div className="kiosk-progress"><Check/>{busy?<><LoaderCircle className="animate-spin"/>正在確認獎項</>:phase==="spinning"?"期待您的幸運好禮":"成交完成，輪到您了"}</div>:<>
         <Button className="kiosk-primary" onClick={startSale} disabled={busy||!state||exhausted||!online}>{busy?<LoaderCircle className="animate-spin"/>:<Bell/>}{busy?"確認中…":exhausted?"本場好禮已送完":"確認成交"}</Button>
         <p className="kiosk-action-help">{!state?"正在連線…":exhausted?"請至管理設定準備新獎池。":"工作人員確認後開啟"}</p>
        </>}
       </div>
      </div>
      <div className="kiosk-wheel" data-testid="wheel-position"><Wheel snapshot={snapshot} rotation={rotation} spinning={phase==="spinning"} ready={phase==="ready"&&!busy} onSpin={spin} onTick={()=>audio().tick()} onFinished={reveal} duration={round?.outcome?.spinMs||5200}/></div>
     </section>}
    </div>
    {!online?<div className="kiosk-alert" role="status"><WifiOff/><span>連線中斷，已保存結果會保留。</span><button onClick={()=>void fetchState()}>重新連線</button></div>:error?<div className="kiosk-alert" role="alert"><span>{error}</span>{!state?<button onClick={()=>void fetchState()}><RotateCcw/>重試</button>:null}</div>:null}
   </div>

  </div>
  <PinDialog open={pinOpen} purpose={intent==="admin"?"admin":"station"} onClose={()=>setPinOpen(false)} onSuccess={()=>void pinSuccess()}/>
  {state?<Admin open={adminOpen} state={state} activityId={activityId} authStamp={authStamp} onClose={()=>setAdminOpen(false)} onSaved={s=>{setState(s);stateRef.current=s;}} onSound={trySound} onLock={lockDevice} onReauth={()=>{setIntent("admin");setPinOpen(true);}}/>:null}
 </main>;
}
