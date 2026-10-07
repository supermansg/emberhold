// Bounded presentation-only DOM feedback. Simulation time controls reward flights.
// Rewards are NEVER granted here; engine collection remains authoritative.
export class FloatingFeedback {
 constructor(host=document.body,capacity=48){this.host=host;this.slots=[];this.disposed=false;for(let i=0;i<capacity;i++){const el=document.createElement('span');el.className='motion-fly';el.setAttribute('aria-hidden','true');el.hidden=true;host.append(el);this.slots.push({el,active:false});}}
 fly({kind='xp',value=0,x,y,tx,ty,time,duration=.5,priority=0}){if(this.disposed)return false;const s=this.slots.find(s=>!s.active)||this.slots.find(s=>s.priority<priority);if(!s)return false;Object.assign(s,{active:true,kind,value,x,y,tx,ty,time,duration,priority});s.el.hidden=false;s.el.className='motion-fly motion-'+kind;s.el.textContent=kind==='xp'?`+${value} XP`:kind==='coin'?`+${value} ◈`:kind==='key'?`+${value} ⚿`:kind==='healing'?`+${value} HP`:String(value);return true;}
 update(time){if(this.disposed)return;for(let i=0;i<this.slots.length;i++){const s=this.slots[i];if(!s.active)continue;const k=Math.max(0,(time-s.time)/s.duration);if(k>=1){s.active=false;s.el.hidden=true;continue;}const u=Math.max(0,(k-.12)/.88),travel=u*u,arc=Math.sin(u*Math.PI),side=(i%2?1:-1);const x=s.x+(s.tx-s.x)*travel+side*arc*22,y=s.y+(s.ty-s.y)*travel-arc*34;const scale=k<.18?.8+k*2:1.16-u*.65;s.el.style.transform=`translate(${x}px,${y}px) scale(${scale})`;s.el.style.opacity=String(k>.86?(1-k)/.14:1);}}
 reset(){for(const s of this.slots){s.active=false;s.el.hidden=true;}}
 get active(){return this.slots.reduce((n,s)=>n+Number(s.active),0);}
 dispose(){if(this.disposed)return;this.disposed=true;for(const s of this.slots)s.el.remove();this.slots.length=0;}
}
