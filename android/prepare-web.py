from pathlib import Path
import shutil
root=globals()['root'] if 'root' in globals() else Path(__file__).resolve().parent.parent
web=root/'android/web'
s=(root/'index.js').read_text()
hook='''if(W.PearStandalone)W.PearVoiceCore={ready:profilesReady,profile:()=>structuredClone(apiProfiles.mini.find(p=>p.id===apiProfiles.activeMini)||null),voices:()=>structuredClone(config.voices),busy:()=>!!(pending||translationPending||profilesBusy||syncBusy||$('test').disabled||$('fetchModels').disabled),setBusy:locked=>lockProfiles(locked),saveVoice:v=>{const before=structuredClone(config);const at=config.voices.findIndex(x=>x.id===v.id);if(at<0)config.voices.push(v);else config.voices[at]=v;if(!store()){config=before;throw Error('音色保存失败。');}renderVoices();},useVoice:id=>{if(!config.voices.some(v=>v.id===id))throw Error('音色不存在。');config.selected=id;store();renderVoices();tab('read');},savePreview:saveRecording,historyBlob,saveFile,status,safe,stopAll:()=>{stop();stopHistory();stopMusic();},showTab:tab};
'''
s=s.replace('W[NS]={destroy};',hook+'W[NS]={destroy};')
(web/'index.js').write_text(s)
shutil.copyfile(root/'style.css',web/'style.css')
