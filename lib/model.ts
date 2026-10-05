export type Prize = { id: string; name: string; shortName: string; weight: number; quantity: number; cost: number | null; grand: boolean; color: string };
export type Config = { deviceName: string; eventName: string; announcement: string; inviteText: string; announcementSeconds: number; openingCueVersion?: number; prizeCatalogVersion?: number; eventNameVersion?: number; activitySchemaVersion?: number; volume: number; mode: "probability" | "pool"; prizes: Prize[]; poolNumber: number };
export type Snapshot = { activityId?: string; mode: Config["mode"]; prizes: Prize[]; weights: number[]; total: number; poolNumber: number };
export type Outcome = { prize: Prize; angle: number; index: number; spinMs: number };
export type Round = { id: string; sequence: number; createdAt: number; drawnAt: number | null; completedAt: number | null; status: "confirmed" | "drawn" | "complete"; snapshot: Snapshot; outcome: Outcome | null; note: string; day: string };
export type StageState = { activityId: string; config: Config; stock: Record<string, number>; active: Round | null; authenticated: boolean; stats: {started: number; completed: number; byPrize: Record<string,number>}; revision: number; serverNow: number };
export type ActivitySummary = { id:string; deviceName:string; eventName:string; mode:Config["mode"]; prizeCount:number; active:boolean; revision:number };
export const PRIZE_COLORS: Record<string, string> = {rotary_kit:"#ed9b7a",laminator_kit:"#d9b765",cmyk_set:"#70b9a8",white_double:"#78afe1",white_single:"#b0a0db",care_annual:"#de98b3"};
const LEGACY_PRIZE_COLORS: Record<string,string> = {white:"#ed9b7a",cmyk:"#d9b765",care:"#70b9a8",clean:"#78afe1",starter:"#b0a0db"};
export const prizeColor = (id: string) => PRIZE_COLORS[id] || LEGACY_PRIZE_COLORS[id] || "#9eafbf";
export const DEFAULT_CONFIG: Config = {
 deviceName:"xTool O1",activitySchemaVersion:1,eventName:"xtool 幸運輪大抽獎",eventNameVersion:1,announcement:"恭喜現場貴賓完成 O1 下訂",inviteText:"現在進入成交限定幸運大抽獎",announcementSeconds:5,openingCueVersion:1,prizeCatalogVersion:1,volume:70,mode:"probability",poolNumber:1,
 prizes:[
 {id:"rotary_kit",name:"旋轉軸套件組",shortName:"旋轉軸套件",weight:5,quantity:0,cost:null,grand:false,color:PRIZE_COLORS.rotary_kit},
 {id:"laminator_kit",name:"覆膜機套件組",shortName:"覆膜機套件",weight:5,quantity:0,cost:null,grand:false,color:PRIZE_COLORS.laminator_kit},
 {id:"cmyk_set",name:"CMYK 彩色墨水套裝組",shortName:"CMYK 彩墨",weight:5,quantity:0,cost:null,grand:false,color:PRIZE_COLORS.cmyk_set},
 {id:"white_double",name:"高印量UV白墨二入組",shortName:"UV 白墨二入",weight:20,quantity:0,cost:null,grand:false,color:PRIZE_COLORS.white_double},
 {id:"white_single",name:"高印量UV白墨單入組",shortName:"UV 白墨單入",weight:25,quantity:0,cost:null,grand:false,color:PRIZE_COLORS.white_single},
 {id:"care_annual",name:"全套保養套組（一年份）",shortName:"一年份保養",weight:40,quantity:0,cost:null,grand:false,color:PRIZE_COLORS.care_annual}]
};
export function blankActivityConfig(deviceName:string,eventName:string):Config{
 const weights=[16.67,16.67,16.67,16.67,16.66,16.66];
 return {...structuredClone(DEFAULT_CONFIG),deviceName,eventName,announcement:`恭喜現場貴賓完成 ${deviceName} 下訂`,prizes:DEFAULT_CONFIG.prizes.map((p,i)=>({...p,name:`${deviceName} 好禮 ${i+1}`,shortName:`好禮 ${i+1}`,weight:weights[i],quantity:0,cost:null}))};
}
export const mod=(n:number)=>((n%360)+360)%360;
export function newId(){if(typeof crypto.randomUUID==="function")return crypto.randomUUID();const a=crypto.getRandomValues(new Uint8Array(16));a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;const s=Array.from(a,x=>x.toString(16).padStart(2,"0")).join("");return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`;}
export function snapshotOf(config:Config,stock:Record<string,number>,activityId="main"):Snapshot{const weights=config.prizes.map(p=>config.mode==="pool"?(stock[p.id]??0):Math.round(p.weight*100));return {activityId,mode:config.mode,prizes:config.prizes,weights,total:weights.reduce((a,b)=>a+b,0),poolNumber:config.poolNumber};}
export function wheelSegments(snapshot:Snapshot){const degrees=360/snapshot.prizes.length;return snapshot.prizes.map((prize,index)=>({prize,index,start:index*degrees,end:(index+1)*degrees,mid:(index+.5)*degrees,degrees}));}
export function secureInteger(max:number){if(!Number.isSafeInteger(max)||max<1||max>0xffffffff)throw new Error("Invalid random range");const limit=Math.floor(0x100000000/max)*max;const a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}
export function pickOutcome(snapshot:Snapshot,ticket:number):Outcome{if(ticket<0||ticket>=snapshot.total)throw new Error("Ticket outside pool");let start=0;for(let i=0;i<snapshot.prizes.length;i++){const end=start+snapshot.weights[i];if(ticket<end)return {prize:snapshot.prizes[i],index:i,angle:wheelSegments(snapshot)[i].mid,spinMs:5200};start=end;}throw new Error("Prize unavailable");}
export function rotationTarget(angle:number,current=0){return current+7*360+mod(-angle-mod(current));}
export function rotationForOutcome(snapshot:Snapshot,outcome:Outcome,current=0){const segment=wheelSegments(snapshot).find(s=>s.prize.id===outcome.prize.id);if(!segment)throw new Error("Prize unavailable");return rotationTarget(segment.mid,current);}
export function taipeiDay(timestamp=Date.now()){return new Date(timestamp+8*3600000).toISOString().slice(0,10);}
export function percent(value:number,total:number){if(!total||!value)return 0;const n=value/total*100;return n<.01?"<0.01":Number(n.toFixed(2));}
export function validateConfig(raw:unknown):Config{
 const c=raw as Config;
 if(!c||!["probability","pool"].includes(c.mode)||!Array.isArray(c.prizes)||c.prizes.length!==DEFAULT_CONFIG.prizes.length)throw new Error("請保留六個獎項並選擇抽獎模式。");
 if(typeof c.deviceName!=="string"||!c.deviceName.trim()||c.deviceName.length>30)throw new Error("設備名稱請填寫 1～30 個字。");
 for(const key of ["eventName","announcement","inviteText"] as const)if(typeof c[key]!=="string"||!c[key].trim()||c[key].length>60)throw new Error("活動文字請填寫 1～60 個字。");
 if(!Number.isFinite(c.volume)||c.volume<0||c.volume>100)throw new Error("音量必須介於 0～100。");
 if(!Number.isFinite(c.announcementSeconds)||c.announcementSeconds<3||c.announcementSeconds>5)throw new Error("公告時間必須介於 3～5 秒。");
 let total=0;
 const prizes=c.prizes.map((p,i)=>{if(p.id!==DEFAULT_CONFIG.prizes[i].id)throw new Error("獎項識別資料不正確。");if(typeof p.name!=="string"||!p.name.trim()||p.name.length>40||typeof p.shortName!=="string"||!p.shortName.trim()||p.shortName.length>10)throw new Error("獎項全名限 40 字，轉盤短名限 10 字。");if(!Number.isFinite(p.weight)||p.weight<0||p.weight>100||Math.abs(p.weight*100-Math.round(p.weight*100))>1e-6)throw new Error("機率請填 0～100，最多兩位小數。");total+=Math.round(p.weight*100);if(!Number.isInteger(p.quantity)||p.quantity<0||p.quantity>10000)throw new Error("獎池數量必須是 0～10,000 的整數。");if(p.cost!==null&&(!Number.isFinite(p.cost)||p.cost<0||p.cost>1000))throw new Error("單項成本請填 0～1,000 元，或留空待確認。");return {...p,name:p.name.trim(),shortName:p.shortName.trim(),color:DEFAULT_CONFIG.prizes[i].color,grand:false};});
 if(total!==10000)throw new Error("所有獎項機率加總必須等於 100%。");if(c.mode==="pool"&&!prizes.some(p=>p.quantity>0))throw new Error("固定獎池至少需要一份獎品。");
 return {...c,deviceName:c.deviceName.trim(),eventName:c.eventName.trim(),announcement:c.announcement.trim(),inviteText:c.inviteText.trim(),prizes,activitySchemaVersion:1};
}
