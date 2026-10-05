export class ApiError extends Error {constructor(message:string,public status=0){super(message);}}
export async function api<T=any>(action:string,body?:unknown):Promise<T>{
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),18000);
 try{const r=await fetch(`/api/stage/${action}`,{method:body===undefined?"GET":"POST",headers:body===undefined?{}:{"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body),cache:"no-store",credentials:"same-origin",signal:ctrl.signal});let data:any;try{data=await r.json();}catch{throw new ApiError("活動資料暫時無法讀取，請稍後重試。",r.status);}if(!r.ok)throw new ApiError(data.error||"操作失敗，請再試一次。",r.status);return data;}catch(e){if(e instanceof ApiError)throw e;throw new ApiError("連線暫時中斷，請重試；已保存的中獎結果會保留。");}finally{clearTimeout(timer);}
}
