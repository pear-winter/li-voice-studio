const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../index.js'),'utf8');
const elements=new Map(),handlers=new Map(),calls=[],records=[];
const $=id=>{if(!elements.has(id))elements.set(id,{id,value:'',checked:false,textContent:''});return elements.get(id);};
let confirms=[],operations=[];
const context=vm.createContext({Blob,TextEncoder,TextDecoder,URL,DataView,Uint8Array,Date,Set,Map,Math,Number,Error,JSON,Promise,console,config:{provider:'fish'},W:{Blob,setTimeout,confirm:()=>confirms.shift()},$,on:(el,event,fn)=>handlers.set(el.id,fn),status:()=>{},safe:x=>x,pending:null,batchBusy:false,mixBusy:false,syncBusy:false,profilesBusy:false,
 request:async(url,body,options)=>{calls.push({url,body,options});return{ok:true,status:200,type:'audio/mpeg',bytes:Uint8Array.from([1,2,3]).buffer};},endpoint:(c,p)=>c.host+p,historyList:async()=>records,historyBlob:async id=>new Blob([id]),clearInlineCache:()=>{},stopHistory:()=>{},stopInline:()=>{},loadInline:async()=>{},renderHistory:async()=>{},recordPicks:new Set(),historyTx:async(names,mode,fn)=>fn({objectStore:name=>({delete:id=>operations.push([name,id])})}),recordingName:r=>(r.title||r.id)+'.mp3'});
for(const name of ['normalizeFishHost','normalizeFishVoice','effectiveVoice','raw','dateBoundary','crc32','zipAudio'])vm.runInContext(source.split('\n').find(l=>l.startsWith((name==='raw'||name==='zipAudio'?'async ':'')+'function '+name+'(')),context);
vm.runInContext(source.split('\n').find(l=>l.startsWith("on($('deleteOld'),'click'")),context);
(async()=>{
assert.equal(vm.runInContext("effectiveVoice({voiceId:'mini',fishVoiceId:'fish'}).voiceId",context),'fish');
await vm.runInContext("raw({host:'https://api.fish.audio',model:'s2-pro',provider:'fish'},'speak',{text:'(sighs)你好<#0.5#>梨梨',voice_setting:{voice_id:'fish-id',speed:1.1,vol:1,emotion:'sad'}},'mock')",context);
assert.equal(calls[0].url,'https://api.fish.audio/v1/tts');assert.equal(calls[0].options.headers.model,'s2-pro');assert.equal(calls[0].body.reference_id,'fish-id');assert.equal(calls[0].body.text,'[sad][sighing]你好[break]梨梨');assert.equal(calls[0].body.prosody.speed,1.1);
await vm.runInContext("raw({host:'https://api.minimaxi.com',provider:'minimax'},'speak',{text:'原文'},'mini-key')",context);assert.equal(calls[1].url,'https://api.minimaxi.com/v1/t2a_v2');assert.equal(calls[1].body.text,'原文');
assert.equal(vm.runInContext("dateBoundary('2026-10-06',true)-dateBoundary('2026-10-06')",context),86400000);
assert.throws(()=>vm.runInContext("dateBoundary('2026-02-30')",context),/日期无效/);
records.push({id:'old-part',createdAt:1},{id:'keep-part',createdAt:1},{id:'old-mix',createdAt:2,mix:{parts:['old-part']}},{id:'new-mix',createdAt:Date.now()+1e12,mix:{parts:['keep-part']}});
$('deleteBefore').value='2026-10-06';confirms=[false];await handlers.get('deleteOld')();assert.equal(operations.length,0,'cancel causes no writes');confirms=[true];await handlers.get('deleteOld')();assert.equal(operations.length,4);assert(!operations.some(o=>o[1]==='keep-part'),'new mix references survive');
context.rows=[{id:'猫猫语音',title:'梨梨成品'},{id:'第二条',title:'哥哥声音'}];const zip=await vm.runInContext('zipAudio(rows)',context);fs.writeFileSync('/tmp/voice-audio-test.zip',Buffer.from(await zip.arrayBuffer()));
console.log('PASS Fish payload, tag conversion, voice IDs, MiniMax routing, date boundaries, cancel deletion, protected mix references, ZIP generation');
})().catch(e=>{console.error(e);process.exit(1)});
