(() => {
 const pending=new Map();let serial=0;
 window.__pearNativeResult=(id,result)=>{const job=pending.get(id);if(!job)return;pending.delete(id);job.cleanup();if(result.error)job.reject(new Error(result.error));else job.resolve(result);};
 function call(method,payload,signal){return new Promise((resolve,reject)=>{if(signal?.aborted)return reject(new DOMException('Aborted','AbortError'));const id=String(++serial),cleanup=()=>signal?.removeEventListener('abort',abort),abort=()=>{pending.delete(id);cleanup();window.PearAndroid.cancel(id);reject(new DOMException('Aborted','AbortError'));};pending.set(id,{resolve,reject,cleanup});signal?.addEventListener('abort',abort,{once:true});try{window.PearAndroid[method](id,JSON.stringify(payload));}catch(error){pending.delete(id);cleanup();reject(error);}});}
 const toBase64=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('读取文件失败'));reader.readAsDataURL(blob);});
 window.pearFetch=async(url,options={})=>{if(!window.PearAndroid)return fetch(url,options);const headers=Object.fromEntries(new Headers(options.headers||{}).entries());const payload={url,method:options.method||'GET',headers:{},body:options.body||''};for(const [key,value] of Object.entries(headers)){const name={'authorization':'Authorization','content-type':'Content-Type','accept':'Accept'}[key];if(name)payload.headers[name]=value;}
 if(options.body instanceof FormData){const packed=new Response(options.body);payload.headers['Content-Type']=packed.headers.get('content-type');payload.bodyBase64=await toBase64(await packed.blob());delete payload.body;}
 const data=await call('request',payload,options.signal);const bytes=Uint8Array.from(atob(data.body||''),c=>c.charCodeAt(0));if(/\/v1\/(t2a_v2|voice_clone|voice_design)(\?|$)/.test(url))window.dispatchEvent(new Event('pear-minimax-used'));return new Response([204,205,304].includes(data.status)?null:bytes,{status:data.status,headers:{'content-type':data.contentType||'application/octet-stream'}});};
 window.pearSaveBlob=async(blob,name)=>call('save',{name,mime:blob.type||'application/octet-stream',data:await toBase64(blob)});
 window.pearSave=async(url,name)=>window.pearSaveBlob(await(await fetch(url)).blob(),name);
 window.pearAccount=payload=>call('account',payload);
 window.pearBalance=payload=>call('balance',payload);
 window.addEventListener('error',event=>{const startup=document.getElementById('startup');if(startup)startup.textContent='配音室未能打开：'+event.message+'。请更新 Android System WebView。';});
})();
