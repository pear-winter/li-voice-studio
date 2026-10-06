const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../index.js'),'utf8'),lines=source.split('\n');
const elements=new Map(),handlers=new Map(),events=[],statuses=[];
const $=id=>{if(!elements.has(id))elements.set(id,{id,value:''});return elements.get(id)};
const context=vm.createContext({URL,Error,String,JSON,structuredClone,config:{provider:'minimax'},apiProfiles:{mini:[],sub:[]},$,on:(el,e,fn)=>handlers.set(el.id,fn),profileAction:fn=>fn(),persistProfiles:async next=>{context.apiProfiles=next},store:()=>{},drawBatch:()=>{},clearInlineCache:()=>{},W:{Event:class{constructor(type){this.type=type}},dispatchEvent:e=>events.push(e.type)},status:s=>statuses.push(s)});
for(const name of ['normalizeFishHost','normalizeFishVoice','missingVoiceMessage','activateProvider'])vm.runInContext(lines.find(l=>l.startsWith('function '+name+'(')),context);
vm.runInContext(lines.find(l=>l.startsWith("on($('saveFish'),'click'")),context);
(async()=>{
$('fishHost').value='https://api.fish.audio/v1/tts';$('fishKey').value='Bearer mock-key';$('fishModel').value='s2-pro';
await handlers.get('saveFish')();assert.equal(context.config.provider,'fish');assert.equal($('provider').value,'fish');assert.equal(context.apiProfiles.fish.key,'mock-key');assert.equal(context.config.fish.host,'https://api.fish.audio');assert(events.includes('li-voice-studio:change'));
assert.equal(vm.runInContext("normalizeFishVoice('https://fish.audio/m/abc123/')",context),'abc123');
assert.equal(vm.runInContext("normalizeFishHost('https://api.fish.audio/v1/')",context),'https://api.fish.audio');
assert.throws(()=>vm.runInContext("normalizeFishHost('https://user:pass@api.fish.audio')",context));
assert.match(vm.runInContext("missingVoiceMessage({name:'白川'})",context),/鱼声 Reference ID/);
// Both storage entry handlers move the shared controls inside the visible mixer and expand them.
for(const prefix of ["on($('mixSelected'),'click'"," if(row.mix){"]){const line=lines.find(l=>l.startsWith(prefix));assert(line.includes("$('mixOrder').before(mixOptions);mixOptions.open=true;mixer.hidden=false"));}
assert(lines.find(l=>l.startsWith('function tab(')).includes("mixer.querySelector('[data-id=mixOrder]').before(mixOptions)"));
console.log('PASS Fish save-and-use, persisted credentials, provider notification, URL normalization, specific preflight message, visible BGM controls in both storage entry points');
})().catch(e=>{console.error(e);process.exit(1)});
