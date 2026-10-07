const fs=require('node:fs'),vm=require('node:vm'),http=require('node:http'),assert=require('node:assert/strict');
const lines=fs.readFileSync(require('node:path').join(__dirname,'../index.js'),'utf8').split('\n');
(async()=>{
 const received=[];const server=http.createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;received.push({url:req.url,headers:req.headers,body:JSON.parse(body)});if('authorization' in req.headers||req.headers['xi-api-key']!=='wire-test-key'){res.writeHead(400,{'content-type':'application/json'});return res.end(JSON.stringify({detail:'Only one authentication header allowed'}));}res.writeHead(200,{'content-type':'audio/mpeg'});res.end(Buffer.from([73,68,51]));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const origin='http://127.0.0.1:'+server.address().port;
 const W={location:{origin:'http://localhost:8000'},SillyTavern:{getContext:()=>({getRequestHeaders:()=>({'X-CSRF-Token':'t'})})},fetch:(url,opt)=>{const target=new URL(url);assert.equal(target.origin,'https://api.elevenlabs.io');return fetch(origin+target.pathname+target.search,opt);}};
 const c=vm.createContext({W,URL,TextDecoder,AbortController,setTimeout,clearTimeout,tasks:new Set(),safe:s=>s});
 for(const name of ['normalizeElevenHost','fishRequestRoute','fishBridgePayload','isMp3Response','request','elevenRaw'])vm.runInContext(lines.find(l=>l.startsWith((['request','elevenRaw'].includes(name)?'async ':'')+'function '+name+'(')),c);
 for(const transport of ['auto','direct']){const result=await c.elevenRaw({host:'https://api.elevenlabs.io',model:'eleven_multilingual_v2',elevenlabs:{transport}},{text:'hello',voice_setting:{voice_id:'voice-test',speed:1}},'wire-test-key');assert.equal(result.ok,true);assert.equal(result.bytes.byteLength,3);}
 assert.equal(received.length,2);for(const req of received){assert.equal(Object.hasOwn(req.headers,'authorization'),false);assert.equal(req.headers['xi-api-key'],'wire-test-key');assert.equal(req.url,'/v1/text-to-speech/voice-test?output_format=mp3_44100_128');assert.equal(req.body.model_id,'eleven_multilingual_v2');assert.equal(req.body.text,'hello');}assert.equal(c.tasks.size,0);console.log('PASS actual HTTP ElevenLabs auto/direct: xi-api-key only, no empty Authorization, exact route/body, one synthesis per call');
 }finally{await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
