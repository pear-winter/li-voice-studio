const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../index.js'),'utf8'),lines=source.split('\n');
let calls=[],response=()=>new Response(Uint8Array.from([1,2,3]),{headers:{'content-type':'audio/mpeg'}});
const W={location:{origin:'http://localhost:8000'},SillyTavern:{getContext:()=>({getRequestHeaders:()=>({'X-CSRF-Token':'csrf-test','Extra':'never-forward'})})},fetch:async(url,options)=>{calls.push({url,options});return response(url,options)}};
const c=vm.createContext({W,URL,TextDecoder,AbortController,setTimeout,clearTimeout,tasks:new Set(),Object,JSON,Error});
for(const name of ['fishRequestRoute','request'])vm.runInContext(lines.find(l=>l.startsWith((name==='request'?'async ':'')+'function '+name+'(')),c);
(async()=>{
const run=()=>vm.runInContext("request('https://api.fish.audio/v1/tts',{reference_id:'test',text:'梨梨'},{key:'fish-key',service:'鱼声',headers:{model:'s2-pro'}})",c);
const r=await run();assert.equal(r.bytes.byteLength,3);assert.equal(calls.length,1);assert.equal(calls[0].url,'http://localhost:8000/proxy/https://api.fish.audio/v1/tts');assert.equal(calls[0].options.headers.Authorization,'Bearer fish-key');assert.equal(calls[0].options.headers.model,'s2-pro');assert.equal(calls[0].options.headers['X-CSRF-Token'],'csrf-test');assert.equal(calls[0].options.headers.Extra,undefined);assert.equal(calls[0].options.credentials,'same-origin');
calls=[];response=()=>new Response('CORS proxy is disabled. Enable it in config.yaml',{status:404});await assert.rejects(run(),/enableCorsProxy/);assert.equal(calls.length,1,'never retry billable requests');
calls=[];response=()=>new Response(Uint8Array.from([5]),{headers:{'content-type':'audio/mpeg'}});await vm.runInContext("request('https://api.fish.audio/v1/tts',{}, {service:'鱼声',transport:'direct'})",c);assert.equal(calls[0].url,'https://api.fish.audio/v1/tts');assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.headers['X-CSRF-Token'],undefined);
W.pearFetch=W.fetch;assert.equal(vm.runInContext("fishRequestRoute('https://api.fish.audio/v1/tts','auto').proxy",c),false);delete W.pearFetch;
W.SillyTavern.getContext=()=>({});calls=[];response=url=>url.endsWith('/csrf-token')?Response.json({token:'fresh'}):new Response(Uint8Array.from([1]));await run();assert.equal(calls.length,2);assert.equal(calls[1].options.headers['X-CSRF-Token'],'fresh');
response=()=>{throw new TypeError('Failed to fetch')};calls=[];await assert.rejects(run(),/酒馆/);assert.equal(calls.length,1);assert.equal(c.tasks.size,0);
console.log('PASS same-origin Fish proxy, CSRF fallback, model/auth forwarding, binary response, disabled-proxy guidance, direct/native route, no synthesis retries, cleanup');
})().catch(e=>{console.error(e);process.exit(1)});
