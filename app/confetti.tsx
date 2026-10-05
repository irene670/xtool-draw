"use client";
import {useEffect,useRef} from "react";
import {PRIZE_COLORS} from "@/lib/model";
export default function Confetti(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const c=ref.current;if(!c)return;const ctx=c.getContext("2d");if(!ctx)return;const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(devicePixelRatio||1,2);c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);const particles=Array.from({length:90},(_,i)=>({x:w/2+(Math.random()-.5)*w*.65,y:h*.2,dx:(Math.random()-.5)*14,dy:-Math.random()*10-1,r:Math.random()*Math.PI,s:Math.random()*5+3,c:Object.values(PRIZE_COLORS)[i%Object.keys(PRIZE_COLORS).length]}));let frame=0,t=0,last=performance.now();const draw=(now:number)=>{const dt=Math.min((now-last)/16.67,2);last=now;t+=dt;ctx.clearRect(0,0,w,h);particles.forEach(p=>{p.x+=p.dx*dt;p.y+=p.dy*dt;p.dy+=.12*dt;p.r+=.04*dt;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,(260-t)/60));ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s,p.s,p.s*1.8);ctx.restore();});if(t<260)frame=requestAnimationFrame(draw);else ctx.clearRect(0,0,w,h);};frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);},[]);
 return <canvas ref={ref} className="confetti" aria-hidden="true"/>;
}
