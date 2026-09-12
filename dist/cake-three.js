import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';

// Module interface: setState('lit' | 'blowing' | 'blown'), dispose().
export function createCake(host){
 let renderer;
 try {renderer=new T.WebGLRenderer({alpha:true,antialias:true});}catch{return null;}
 const canvas=renderer.domElement;canvas.setAttribute('aria-label','可拖动旋转、双指缩放的双层生日蛋糕');
 host.append(canvas);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const scene=new T.Scene(), camera=new T.PerspectiveCamera(36,1,.1,30);
 camera.position.set(4,3.2,6);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,1.35,0);controls.enablePan=false;
 controls.minDistance=5;controls.maxDistance=10;controls.minPolarAngle=.35;controls.maxPolarAngle=1.6;controls.enableDamping=true;
 scene.add(new T.HemisphereLight(0xfff5e6,0xaaa0b5,2));
 const soft=new T.DirectionalLight(0xfff3e3,2.3);soft.position.set(-3,6,4);scene.add(soft);
 const candleLight=new T.PointLight(0xffbc74,1.8,5,2);candleLight.position.set(0,2.85,0);scene.add(candleLight);
 const cream=new T.MeshStandardMaterial({color:0xf3e7d4,roughness:1,flatShading:true});
 const sponge=new T.MeshStandardMaterial({color:0xcdb095,roughness:1,flatShading:true});
 const rose=new T.MeshStandardMaterial({color:0xc991a1,roughness:1,flatShading:true});
 const pink=new T.MeshStandardMaterial({color:0xe8bcc8,roughness:.85});
 function mesh(geometry,material,x,y,z){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);scene.add(m);return m;}
 function cylinder(r,h,y,mat){return mesh(new T.CylinderGeometry(r,r,h,40),mat,0,y,0);}
 cylinder(1.48,.08,.1,new T.MeshStandardMaterial({color:0xd4d1d2,roughness:1}));
 cylinder(1.23,.84,.62,sponge);cylinder(1.25,.19,1.04,cream);
 cylinder(.87,.73,1.48,sponge);cylinder(.89,.17,1.89,cream);
 for(const [r,y,n] of [[1.16,.24,20],[.81,1.98,12]]){
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const m=mesh(new T.IcosahedronGeometry(.085,1),rose,Math.cos(a)*r,y,Math.sin(a)*r);m.scale.set(1, .75,1);}
 }
 for(const [r,y] of [[1.23,1.02],[.87,1.86]]){
  for(let i=0;i<3;i++){const a=.4+i*2;const m=mesh(new T.SphereGeometry(.105,12,8),cream,Math.cos(a)*r,y-.1,Math.sin(a)*r);m.scale.y=1.8+i*.22;}
 }
 cylinder(.064,.57,2.27,pink);
 mesh(new T.SphereGeometry(.035,8,6),cream,.045,2.48,0).scale.y=2;
 cylinder(.012,.08,2.59,new T.MeshStandardMaterial({color:0x57464b}));
 // All geometry is generated locally, including the little heart decoration.
 const heart=new T.Shape();heart.moveTo(0,0);heart.bezierCurveTo(-.27,.17,-.18,.34,0,.19);heart.bezierCurveTo(.18,.34,.27,.17,0,0);
 const h=mesh(new T.ExtrudeGeometry(heart,{depth:.05,bevelEnabled:false}),rose,.35,1.98,.22);h.rotation.x=-Math.PI/2;
 // Soft circular particle texture, generated in memory (no image downloads).
 const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=64;const ctx=texCanvas.getContext('2d');
 const gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'white');gradient.addColorStop(.35,'rgba(255,255,255,.6)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const texture=new T.CanvasTexture(texCanvas);
 function particles(count,color,size){const positions=new Float32Array(count*3);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));const mat=new T.PointsMaterial({color,size,map:texture,transparent:true,depthWrite:false,opacity:.65});const points=new T.Points(geo,mat);scene.add(points);return {positions,geo,mat,points,count};}
 const fire=particles(65,0xffbe79,.12),smoke=particles(24,0xc2bac2,.18);
 let state='lit',elapsed=0,blownAt=0,raf=0,last=0,visible=false,disposed=false;
 const seed=Array.from({length:65},(_,i)=>({a:i*2.399,r:.02+(i%7)/130,phase:i/65}));
 function updateParticles(){
  const towardCamera=camera.position.clone().sub(controls.target).normalize();const age=elapsed-blownAt;fire.points.visible=state!=='blown'||age<.8;smoke.points.visible=state==='blown'&&age<3.8;
  for(let i=0;i<fire.count;i++){const s=seed[i],p=(s.phase+elapsed*.55)%1;const scatter=state==='blown'?Math.min(age,1):0;
   fire.positions.set([Math.cos(s.a)*s.r*(1-p)+Math.sin(elapsed*2)*p*.025+scatter*Math.sin(s.a)*.25+scatter*towardCamera.x*1.5,2.63+p*.3+scatter*.08,Math.sin(s.a)*s.r+(state==='blowing'?p*.22:0)+scatter*towardCamera.z*1.5],i*3);}
  fire.mat.opacity=state==='blown'?Math.max(0,1-age/.8)*.65:.65;fire.geo.attributes.position.needsUpdate=true;
  for(let i=0;i<smoke.count;i++){const a=Math.max(0,age-i*.035);smoke.positions.set([Math.sin(a*2+i)*.07*a,2.64+a*.35,Math.cos(i)*.04*a],i*3);}
  smoke.mat.opacity=state==='blown'?Math.max(0,1-age/3.8)*.18:0;smoke.geo.attributes.position.needsUpdate=true;
  candleLight.intensity=state==='blown'?0:1.8+Math.sin(elapsed*3)*.12;
 }
 function frame(now){raf=0;if(disposed||!visible||document.hidden)return;elapsed+=Math.min((now-last)/1000,.05);last=now;controls.update();updateParticles();renderer.render(scene,camera);raf=requestAnimationFrame(frame);}
 function resume(){if(visible&&!document.hidden&&!raf&&!disposed){last=performance.now();raf=requestAnimationFrame(frame);}}
 const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();});resize.observe(host);
 const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;resume();});observer.observe(host);
 document.addEventListener('visibilitychange',resume);
 const api={setState(next){if(!['lit','blowing','blown'].includes(next)||next===state)return;if(next==='blown')blownAt=elapsed;state=next;host.dataset.candleState=state;},dispose(){disposed=true;cancelAnimationFrame(raf);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',resume);controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});texture.dispose();renderer.dispose();canvas.remove();}};
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();api.dispose();host.classList.remove('cake-three-ready');},{once:true});
 host.classList.add('cake-three-ready');return api;
}

