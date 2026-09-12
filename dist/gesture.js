// Pure movement evaluator, independent of the camera. Only real, continuous open-palm motion earns progress.
export class WaveMeter {
  constructor(){this.reset();}
  reset(){this.samples=[];this.progress=0;this.last=0;this.lastMotion=0;}
  update(hand, now){
    const dt=this.last ? Math.min(now-this.last,120) : 0;this.last=now;
    const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const open=hand && [8,12,16,20].filter(i=>distance(hand[i],hand[0])>distance(hand[i-2],hand[0])*1.22).length>=3;
    if(!open){this.samples=[];this.progress=Math.max(0,this.progress-dt*.018);return {progress:this.progress,open:false,moving:false};}
    const x=(hand[0].x+hand[5].x+hand[9].x+hand[13].x+hand[17].x)/5;
    const prev=this.samples.at(-1);this.samples.push({x,t:now});this.samples=this.samples.filter(s=>now-s.t<800);
    const range=Math.max(...this.samples.map(s=>s.x))-Math.min(...this.samples.map(s=>s.x));
    const speed=prev && now>prev.t ? Math.abs(x-prev.x)/(now-prev.t):0;
    const moving=this.samples.length>=3 && range>.095 && speed>.00012 && speed<.006;
    if(moving){this.lastMotion=now;this.progress=Math.min(100,this.progress+dt*.044);}
    else if(now-this.lastMotion>350)this.progress=Math.max(0,this.progress-dt*.012);
    return {progress:this.progress,open:true,moving};
  }
}
