import json, pathlib, uuid
root=pathlib.Path(__file__).resolve().parents[1]
source=(root/'index.js').read_text()
css=(root/'style.css').read_text()
version=json.loads((root/'manifest.json').read_text())['version']
source=source[:source.rindex("if (document.readyState === 'loading')")]
payload='''(() => {
'use strict';
const KEY='__liVoiceHelperStandalone';
const previous=window[KEY];
const existing=window.__liVoiceStudio;
const compatible=String(existing?.version||'0').localeCompare('TARGET_VERSION',undefined,{numeric:true})>=0 && existing?.speech && ['voices','ready','model','find','speak','url','openConfig'].every(name=>typeof existing.speech[name]==='function');
if(existing?.isAvailable?.() && compatible && (!previous || existing!==previous.api))return;
previous?.dispose();
if(existing?.isAvailable?.())existing.destroy?.();
const style=document.createElement('style');
style.id='lv-helper-base-style';
style.textContent=CSS_VALUE;
document.head.append(style);
SOURCE_VALUE
try {
 initLiVoice();
 const api=window.__liVoiceStudio;
 if(!api)throw Error('配音室未能初始化。');
 const originalDestroy=api.destroy;
 let disposed=false;
 const owner={api,dispose(){
  if(disposed)return;
  disposed=true;
  try{originalDestroy();}finally{style.remove();if(window.__liVoiceStudio===api)delete window.__liVoiceStudio;if(window.__liliMiniVoiceV1?.destroy===owner.dispose)delete window.__liliMiniVoiceV1;if(window[KEY]===owner)delete window[KEY];}
 }};
 api.destroy=owner.dispose;
 window.__liliMiniVoiceV1.destroy=owner.dispose;
 window[KEY]=owner;
} catch(error) {
 window.__liliMiniVoiceV1?.destroy?.();
 style.remove();
 console.error('[梨梨配音室·酒馆助手]',error);
 window.toastr?.error('配音室启动失败：'+error.message);
}
})();'''.replace('TARGET_VERSION',version).replace('CSS_VALUE',json.dumps(css,ensure_ascii=False)).replace('SOURCE_VALUE',source)
content='''// ♪梨梨配音室 VERSION · 酒馆助手脚本版（全部代码与样式内置）
(() => {
'use strict';
const frameWindow=window;
const host=window.parent;
let stopped=false,timer=0,attempts=0,owned=null;
function cleanup(){
 if(stopped)return;
 stopped=true;clearTimeout(timer);
 if(owned && host.__liVoiceHelperStandalone===owned)owned.dispose();
 owned=null;
}
frameWindow.addEventListener('pagehide',event=>{if(!event.persisted)cleanup();});
frameWindow.addEventListener('unload',cleanup,{once:true});
function start(){
 if(stopped)return;
 try {
  if(!host.document?.body || !host.SillyTavern?.getContext?.()){
   if(++attempts<150)timer=setTimeout(start,200);
   else host.toastr?.error('请等待酒馆加载完成后重新启用配音室脚本。');
   return;
  }
  const script=host.document.createElement('script');
  script.textContent=PAYLOAD;
  host.document.head.append(script);script.remove();
  owned=host.__liVoiceHelperStandalone||null;
 }catch(error){console.error('[梨梨配音室·酒馆助手]',error);}
}
start();
})();'''.replace('VERSION',version).replace('PAYLOAD',json.dumps(payload,ensure_ascii=False))
artifact={'type':'script','enabled':True,'name':f'♪梨梨配音室 · 酒馆助手版 v{version}','id':'f818b7c2-3c9a-4a6d-8186-d8fc1f3a4d6d','content':content,'info':f'基于 pear-winter/li-voice-studio v{version}，代码和样式全部内置。导入酒馆助手全局脚本库并启用，魔法棒 → ♪梨梨配音室。\n保留 MiniMax 配音、多音色、多接口、独立翻译、选字配音、句尾播放器、录音合成、BGM、多角色台词、收藏、同步文件、工作台联动和小剧场 speech 接口。\n与同一酒馆站点的扩展版共用设置和录音；已有扩展运行时不重复启动。停止脚本清理界面和监听，不删除录音。首次使用在配置页填写接口；配音室不在启动时自动弹出。','button':{'enabled':False,'buttons':[]},'data':{},'export_with':{'data':True,'button':True}}
output=root/'helper'/f'酒馆助手脚本-梨梨配音室-v{version}.json'
output.write_text(json.dumps(artifact,ensure_ascii=False,indent=2)+'\n')
(root/'helper'/'runtime.js').write_text(content)
print(output)

