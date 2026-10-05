const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),version=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'))).version;
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
for(const mode of ['extension','helper']){
 const context=await browser.newContext(),page=await context.newPage(),errors=[],calls=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://tavern.test/**',r=>r.fulfill({contentType:'text/html',body:'<div id="extensionsMenu"></div>'}));
 await page.route('https://api.minimaxi.com/**',r=>{calls.push(r.request().postDataJSON());return r.fulfill({contentType:'audio/wav',body:Buffer.from('RIFFmock-wave')});});
 await page.goto('http://tavern.test');
 await page.evaluate(()=>{window.SillyTavern={getContext:()=>({chat:[]})};localStorage.setItem('lili-minimax-voice-v1',JSON.stringify({selected:'a',voices:[{id:'a',name:'哥哥',voiceId:'voice-a',speed:1,volume:1,pitch:0},{id:'b',name:'梨梨',voiceId:'voice-b',speed:1,volume:1,pitch:0}]}));});
 async function load(){
  if(mode==='extension')await page.addScriptTag({path:path.join(root,'index.js')});
  else await page.evaluate(code=>{const f=document.createElement('iframe');document.body.append(f);f.contentWindow.eval(code);},JSON.parse(fs.readFileSync(path.join(root,`helper/酒馆助手脚本-梨梨配音室-v${version}.json`))).content);
  await page.waitForFunction(()=>window.__liVoiceStudio?.speech);
  await page.waitForFunction(()=>!document.querySelector('[data-id=saveConfig]').disabled);
 }
 await load();
 assert.deepEqual(await page.evaluate(()=>Object.keys(window.__liVoiceStudio.speech).sort()),['find','model','openConfig','ready','speak','url','version','voices']);
 assert.equal(await page.evaluate(()=>window.__liVoiceStudio.speech.ready()),false);
 await page.evaluate(()=>window.__liVoiceStudio.speech.openConfig());
 await page.locator('[data-id=key]').fill('mock-key');await page.locator('[data-id=saveConfig]').click();
 await page.waitForFunction(()=>!document.querySelector('[data-id=saveConfig]').disabled);
 assert.equal(await page.evaluate(()=>window.__liVoiceStudio.speech.ready()),true);
 assert.deepEqual(await page.evaluate(()=>window.__liVoiceStudio.speech.voices()),[{id:'a',name:'哥哥',voiceId:'voice-a'},{id:'b',name:'梨梨',voiceId:'voice-b'}]);
 const record=await page.evaluate(()=>window.__liVoiceStudio.speech.speak('小剧场台词。','b'));
 assert.equal(record.voiceId,'voice-b');assert.equal(calls.length,1);assert.equal(calls[0].text,'小剧场台词。');
 assert.equal((await page.evaluate(()=>window.__liVoiceStudio.speech.find('小剧场台词。')))[0].id,record.id);
 const bytes=await page.evaluate(async id=>{const api=window.__liVoiceStudio.speech,u=await api.url(id);try{return Array.from(new Uint8Array(await (await fetch(u)).arrayBuffer()));}finally{URL.revokeObjectURL(u);}},record.id);
 assert.deepEqual(Buffer.from(bytes),Buffer.from('RIFFmock-wave'));assert.equal(calls.length,1,'find/url reuse without synthesis');
 await load();assert.equal(await page.evaluate(()=>window.__liVoiceStudio.speech.ready()),true,'saved API remains');
 assert.equal((await page.evaluate(()=>window.__liVoiceStudio.speech.find('小剧场台词。')))[0].id,record.id,'saved recording remains');
 assert.equal((await page.evaluate(()=>window.__liVoiceStudio.speech.voices())).length,2,'voice profiles remain');
 assert.deepEqual(errors,[]);console.log('PASS',mode,'speech contract, selected voice, recording reuse, reload and stored settings');
 await context.close();
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
