import test from 'node:test';import assert from 'node:assert/strict';import {WaveMeter} from '../dist/gesture.js';
function hand(x,open=true){const p=Array.from({length:21},()=>({x,y:.65}));for(const i of [8,12,16,20]){p[i]={x,y:open?.15:.6};p[i-2]={x,y:.4};}return p;}
test('静止手掌与小幅抖动不会产生微风',()=>{for(const jitter of [0,.004]){const m=new WaveMeter();for(let t=0;t<5000;t+=70)m.update(hand(.5+Math.sin(t/100)*jitter),t);assert.equal(m.progress,0);}});
test('握拳移动不会触发',()=>{const m=new WaveMeter();for(let t=0;t<5000;t+=70)m.update(hand(.5+.2*Math.sin(t/180),false),t);assert.equal(m.progress,0);});
test('连续明显挥手可以完成',()=>{const m=new WaveMeter();for(let t=0;t<3500;t+=70)m.update(hand(.5+.18*Math.sin(t/180)),t);assert.equal(m.progress,100);});
test('丢失手掌后进度衰减且清除历史',()=>{const m=new WaveMeter();for(let t=0;t<1500;t+=70)m.update(hand(.5+.18*Math.sin(t/180)),t);const before=m.progress;for(let t=1500;t<3000;t+=70)m.update(null,t);assert.ok(m.progress<before);assert.equal(m.samples.length,0);m.reset();assert.equal(m.progress,0);});
