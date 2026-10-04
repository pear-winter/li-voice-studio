window.PearStandalone=true;
window.PearVoice={back(){const dialog=document.getElementById('lv-dialog');const page=dialog?.querySelector('[data-id=readPage]');if(page?.hidden){dialog.querySelector('[data-id=tabRead]').click();return true;}return false;}};
window.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('lv-dialog'))document.getElementById('startup')?.remove();});
