import {config} from './config.js';
import {WaveMeter} from './gesture.js';
const $=id=>document.getElementById(id);
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
document.querySelectorAll('[data-name]').forEach(e=>e.textContent=config.name);
document.querySelectorAll('[data-from]').forEach(e=>e.textContent=config.from);
$('closing').textContent=config.closing;
const film=node('div','film-strip');film.setAttribute('role','tablist');film.setAttribute('aria-label','选择一年的回忆');
const story=node('article','film-story');story.id='year-story';story.setAttribute('role','tabpanel');story.tabIndex=0;
const frames=[];
function yearPhoto(y){if(!y[3])return placeholder(`放一张${y[0]}的照片`);const img=node('img');img.src=y[3];img.alt=`${y[0]}：${y[1]}`;img.loading='lazy';img.onerror=()=>img.replaceWith(placeholder('照片暂时无法加载'));return img;}
function selectYear(index){
  frames.forEach((frame,i)=>{frame.setAttribute('aria-selected',String(i===index));frame.tabIndex=i===index?0:-1;});
  const y=config.years[index];story.setAttribute('aria-labelledby',`year-tab-${index}`);
  const image=node('div','year-photo');image.append(yearPhoto(y));const body=node('div','year-story-text');body.append(node('span','eyebrow',`${y[0]} · ${y[4]||'我们的大学时光'}`),node('h3','',y[1]));
  y[2].split('\n').filter(Boolean).forEach(p=>body.append(node('p','',p)));story.replaceChildren(image,body);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)story.animate([{opacity:.25,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:400,easing:'ease-out'});
}
config.years.forEach((y,i)=>{const frame=node('button','film-frame');frame.id=`year-tab-${i}`;frame.setAttribute('role','tab');frame.setAttribute('aria-controls','year-story');frame.append(node('span','film-year',`${String(i+1).padStart(2,'0')} / ${y[0]}`),yearPhoto(y),node('span','film-title',y[1]));frame.onclick=()=>selectYear(i);frame.onkeydown=e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%frames.length;else if(e.key==='ArrowLeft')next=(i+frames.length-1)%frames.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=frames.length-1;else return;e.preventDefault();selectYear(next);frames[next].focus({preventScroll:true});frames[next].scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});};frames.push(frame);film.append(frame);});
$('timeline').classList.add('film-timeline');$('timeline').append(film,story,node('p','hand film-ending','第五年不是片尾，我们还有好多续集。'));selectYear(0);
function photoBody(photo){if(photo.src){const img=node('img');img.src=photo.src;img.alt=photo.caption;img.loading='lazy';img.onerror=()=>img.replaceWith(placeholder('照片暂时无法加载'));return img;}return placeholder('放一张我们的合照');}
function placeholder(text){const e=node('div','placeholder');e.append(node('span','','♡'),node('div','',text));return e;}
config.photos.forEach(photo=>{const b=node('button','polaroid');b.setAttribute('aria-label',`放大：${photo.caption}`);b.append(photoBody(photo),node('p','',photo.caption),node('small','',photo.mark));b.onclick=()=>{$('photo-content').replaceChildren(photoBody(photo),node('p','',photo.caption));$('photo-dialog').showModal();};$('photos').append(b);});
$('close-photo').onclick=()=>$('photo-dialog').close();$('photo-dialog').onclick=e=>{if(e.target===$('photo-dialog'))$('photo-dialog').close();};
const wishReward=node('dialog','wish-reward');wishReward.id='wish-reward';wishReward.setAttribute('aria-labelledby','wish-reward-title');
const closeReward=node('button','secondary','关闭 ×');closeReward.type='button';closeReward.onclick=()=>wishReward.close();
const rewardImage=node('img');rewardImage.src=config.wishReward.src;rewardImage.alt='阿贾站在盛开的花树下';
const rewardTitle=node('h2','hand',config.wishReward.caption);rewardTitle.id='wish-reward-title';
wishReward.append(closeReward,rewardImage,rewardTitle);document.body.append(wishReward);
wishReward.addEventListener('click',e=>{if(e.target===wishReward){const r=wishReward.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)wishReward.close();}});
let rewardShown=false;
const revealed=new Set();config.wishes.forEach((wish,i)=>{const b=node('button','wish');const front=()=>{b.replaceChildren(node('span','number',String(i+1).padStart(2,'0')),node('small','','点开小祝愿 ♡'));};front();b.setAttribute('aria-label',`第${i+1}个祝愿，点击翻开`);b.setAttribute('aria-pressed','false');b.onclick=()=>{const on=b.classList.toggle('revealed');b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?wish:`第${i+1}个祝愿，点击翻开`);if(on){b.textContent=wish;revealed.add(i);}else front();$('wish-count').textContent=`${revealed.size} / 24`;if(revealed.size===config.wishes.length&&!rewardShown){rewardShown=true;wishReward.showModal();}};$('wish-grid').append(b);});
config.letter.forEach(p=>$('letter-body').append(node('p','',p)));
function celebrate(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<35;i++){const e=node('i','confetto');e.style.left=`${Math.random()*100}%`;e.style.background=['#b9a4c9','#e2b6be','#dec793'][i%3];e.style.animationDelay=`${Math.random()*.7}s`;$('confetti').append(e);setTimeout(()=>e.remove(),4000);}}
$('open').onclick=()=>{$('open').disabled=true;$('opening').classList.add('opened');setTimeout(()=>{$('opening').hidden=true;$('book').hidden=false;window.scrollTo(0,0);const title=document.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});celebrate();},650);};
$('coupon-button').onclick=()=>{$('coupon').hidden=!$('coupon').hidden;$('coupon-button').setAttribute('aria-expanded',String(!$('coupon').hidden));};
let audioContext,masterGain,musicTimer,musicOn=false,noteIndex=0,musicEpoch=0;
let volume=.25;
// Happy Birthday, in C major. Durations are quarter-note beats.
const birthdayMelody=[[67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2],[67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2],[67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,2],[77,.75],[77,.25],[76,1],[72,1],[74,1],[72,3]];
const volumeLabel=node('label','music-volume','音量');
const slider=node('input');slider.type='range';slider.min='0';slider.max='100';slider.value='25';slider.setAttribute('aria-label','背景音乐音量');volumeLabel.append(slider);$('music').after(volumeLabel);
slider.oninput=()=>{volume=Number(slider.value)/100;$('audio').volume=volume;if(masterGain&&musicOn)masterGain.gain.setTargetAtTime(volume,audioContext.currentTime,.06);};
function nextNote(){
  if(!musicOn)return;
  const [midi,beats]=birthdayMelody[noteIndex];const t=audioContext.currentTime;
  for(const [ratio,level] of [[1,.24],[2,.065],[3,.018]]){
    const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=440*2**((midi-69)/12)*ratio;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(level,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+1.5);o.connect(g).connect(masterGain);o.start(t);o.stop(t+1.55);
  }
  noteIndex=(noteIndex+1)%birthdayMelody.length;
  musicTimer=setTimeout(nextNote,beats*460+(noteIndex===0?1800:0));
}
async function stopMusic(immediate=false){
  const epoch=++musicEpoch;musicOn=false;clearTimeout(musicTimer);
  if(masterGain){masterGain.gain.cancelScheduledValues(audioContext.currentTime);masterGain.gain.setTargetAtTime(0,audioContext.currentTime,.08);}
  const startVolume=$('audio').volume;
  if(!immediate)for(let i=1;i<=6;i++){await new Promise(r=>setTimeout(r,35));if(epoch!==musicEpoch)return;$('audio').volume=startVolume*(1-i/6);}
  if(epoch!==musicEpoch)return;$('audio').pause();if(audioContext)await audioContext.suspend();$('music').textContent='♫ 生日快乐歌';$('music').setAttribute('aria-pressed','false');
}
$('music').textContent='♫ 生日快乐歌';
$('music').onclick=async()=>{
  if(musicOn){await stopMusic();return;}const epoch=++musicEpoch;
  try{
    if(config.music){if(!$('audio').getAttribute('src'))$('audio').src=config.music;$('audio').volume=0;await $('audio').play();}
    else{audioContext??=new AudioContext();if(!masterGain){masterGain=audioContext.createGain();masterGain.gain.value=0;masterGain.connect(audioContext.destination);}await audioContext.resume();}
    if(epoch!==musicEpoch)return;musicOn=true;$('music').textContent='Ⅱ 暂停音乐';$('music').setAttribute('aria-pressed','true');
    if(config.music){for(let i=1;i<=8;i++){await new Promise(r=>setTimeout(r,40));if(epoch!==musicEpoch)return;$('audio').volume=volume*i/8;}}
    else{masterGain.gain.cancelScheduledValues(audioContext.currentTime);masterGain.gain.setTargetAtTime(volume,audioContext.currentTime,.15);nextNote();}
  }catch{await stopMusic(true);$('music').textContent='音乐暂时无法播放，点击重试';}
};

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches&&'IntersectionObserver' in window){
  const reveal=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('in-view');reveal.unobserve(entry.target);}},{threshold:.06});
  document.querySelectorAll('.section,.year,.polaroid,.wish,.letter-sheet').forEach(e=>{e.classList.add('reveal');if(e.matches('.wish,.polaroid')){const siblings=[...e.parentElement.children];const columns=e.matches('.wish')?(innerWidth<=700?3:6):3;e.style.setProperty('--reveal-delay',`${siblings.indexOf(e)%columns*80}ms`);}reveal.observe(e);});
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in-view'));reveal.disconnect();}});
}

// The timeline follows the reader's scroll; no scroll locking or page snapping.
const timeline=$('timeline');let scrollFrame=0;
function updateTimeline(){scrollFrame=0;const r=timeline.getBoundingClientRect();const fraction=Math.max(0,Math.min(1,(innerHeight*.76-r.top)/r.height));timeline.style.setProperty('--timeline-progress',reducedMotion.matches?1:fraction);}
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateTimeline);},{passive:true});
window.addEventListener('resize',updateTimeline);updateTimeline();
// Start on the first intentional opening gesture, where browser audio policies allow it.
$('open').addEventListener('click',()=>{if(!musicOn)void $('music').onclick();});
document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button||button.disabled||reducedMotion.matches)return;
  if(button.matches('.wish'))button.animate([{rotate:'y -75deg',opacity:.5},{rotate:'y 0deg',opacity:1}],{duration:360,easing:'ease-out'});
  else button.animate([{scale:'0.96'},{scale:'1.025'},{scale:'1'}],{duration:260,easing:'ease-out'});
});
let stream,landmarker,raf=0,session=0,lastFrame=0,lastVideoTime=-1,done=false,finishing=false;
const meter=new WaveMeter();
function stopCamera(message='摄像头已关闭，可以重新开启或点击吹灭蜡烛。'){
  session++;cancelAnimationFrame(raf);raf=0;stream?.getTracks().forEach(t=>t.stop());stream=null;$('video').srcObject=null;$('video').hidden=true;
  landmarker?.close();landmarker=null;$('start-camera').disabled=false;$('status').textContent=message;$('cake-scene').classList.remove('windy');meter.reset();$('wind-progress').value=0;
}
function finish(gesture){if(done||finishing)return;finishing=true;stopCamera('许愿完成');$('camera-panel').hidden=true;$('gesture').hidden=true;$('blow').hidden=true;document.querySelectorAll('.candle').forEach((c,i)=>setTimeout(()=>c.classList.add('out'),i*250));setTimeout(()=>{done=true;finishing=false;$('success').hidden=false;$('success-note').textContent=gesture?'今年的蜡烛，我们隔着屏幕一起吹灭啦。':'愿望交给时间，今天的快乐先归你。';document.querySelector('.candles').setAttribute('aria-label','蜡烛已全部熄灭');$('reset').hidden=false;celebrate();},800);}
$('blow').onclick=()=>finish(false);
$('gesture').onclick=()=>{$('camera-panel').hidden=false;$('status').textContent='等待开启';};
$('stop-camera').onclick=()=>stopCamera();
$('reset').onclick=()=>{stopCamera('等待开启');done=false;finishing=false;$('success').hidden=true;$('reset').hidden=true;$('gesture').hidden=false;$('blow').hidden=false;document.querySelectorAll('.candle').forEach(c=>c.classList.remove('out'));document.querySelector('.candles').setAttribute('aria-label','三支点燃的蜡烛');};
function timed(promise,ms){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('加载超时，请检查网络后重试，也可以点击吹灭蜡烛。')),ms);})]).finally(()=>clearTimeout(timer));}
$('start-camera').onclick=async()=>{
  if(done||finishing)return;stopCamera('识别加载中…');const current=session;$('start-camera').disabled=true;
  try{
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('当前环境不能开启摄像头，请使用 HTTPS 或 localhost，也可以点击吹灭蜡烛。');
    $('status').textContent='请允许摄像头访问；不需要麦克风权限。';
    const camera=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
    if(current!==session){camera.getTracks().forEach(t=>t.stop());return;}stream=camera;$('video').srcObject=stream;$('video').hidden=false;await timed($('video').play(),10000);if(current!==session)return;
    $('status').textContent='识别加载中，第一次需要下载手部识别模型…';
    const initialize=async()=>{const {HandLandmarker,FilesetResolver}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');return HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',delegate:'CPU'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.6});};
    const pending=initialize();pending.then(model=>{if(current!==session)model.close();},()=>{});
    const model=await timed(pending,30000);if(current!==session)return;landmarker=model;meter.reset();lastFrame=0;lastVideoTime=-1;$('status').textContent='把手掌放进画面里，亮一点会更容易认出哦。';
    const frame=now=>{if(current!==session||!landmarker)return;try{if(now-lastFrame>66&&$('video').readyState>=2&&$('video').currentTime!==lastVideoTime){lastFrame=now;lastVideoTime=$('video').currentTime;const result=landmarker.detectForVideo($('video'),now);const wave=meter.update(result.landmarks[0],now);$('wind-progress').value=wave.progress;$('cake-scene').classList.toggle('windy',wave.moving);$('status').textContent=wave.moving?'挥手中，小小的风正在吹向蜡烛…':wave.open?'看到你的手啦，左右挥一挥。':'没有看到张开的手掌，把手掌放进画面里，亮一点会更容易认出哦。';if(wave.progress>=100){finish(true);return;}}raf=requestAnimationFrame(frame);}catch{stopCamera('识别暂时中断，可以重新开启或点击吹灭蜡烛。');}};
    raf=requestAnimationFrame(frame);
  }catch(error){if(current!==session)return;const messages={NotAllowedError:'摄像头权限未开启，可以在浏览器设置中允许，或直接点击吹灭蜡烛。',NotFoundError:'没有找到摄像头，点击吹灭蜡烛也能完成许愿。',NotReadableError:'摄像头可能被其他应用占用，请关闭后重试，或点击吹灭蜡烛。'};stopCamera(messages[error.name]||error.message||'识别加载失败，请点击吹灭蜡烛。');}
};
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCamera();void stopMusic();}});
window.addEventListener('pagehide',()=>{stopCamera();void stopMusic();});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&(stream||$('start-camera').disabled))stopCamera();},{threshold:0}).observe($('birthday'));

// Cinematic accents stay decorative and never capture clicks or scrolling.
const heartCurtain=node('div','heart-curtain');heartCurtain.setAttribute('aria-hidden','true');heartCurtain.textContent='♥';document.body.append(heartCurtain);
$('open').addEventListener('click',()=>{if(reducedMotion.matches)return;heartCurtain.classList.add('playing');setTimeout(()=>heartCurtain.remove(),1400);});
const paper=document.querySelector('.letter-sheet');
for(const side of ['top','bottom']){const fold=node('div','paper-fold '+side);fold.setAttribute('aria-hidden','true');paper.append(fold);}
const stars=node('div','cinema-stars');stars.setAttribute('aria-hidden','true');
for(let i=0;i<12;i++){const star=node('span','','✧');star.style.left=`${8+(i*23)%84}%`;star.style.top=`${8+(i*17)%60}%`;star.style.animationDelay=`${i*.23}s`;stars.append(star);}$('birthday').prepend(stars);
let cinemaFrame=0;
function sceneProgress(){cinemaFrame=0;const rect=$('birthday').getBoundingClientRect();const progress=reducedMotion.matches?1:Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight*.6)));$('birthday').style.setProperty('--night',progress);}
window.addEventListener('scroll',()=>{if(!cinemaFrame)cinemaFrame=requestAnimationFrame(sceneProgress);},{passive:true});window.addEventListener('resize',sceneProgress);sceneProgress();
