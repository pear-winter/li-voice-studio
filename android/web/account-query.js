(() => {
  const ticket=window.__pearAccountTicket;
  window.__pearAccountSync={pending:true,ticket};
  (async()=>{
    if(location.protocol!=='https:'||!['platform.minimax.cn','platform.minimaxi.com'].includes(location.hostname))throw Error('请先回到 MiniMax 官网控制台。');
    let fallback='';try{const user=JSON.parse(localStorage.getItem('user_detail')||'{}');fallback=String(user.groups?.[0]||user.group_id||'');}catch{}
    const group=new URL(location.href).searchParams.get('group_id')||localStorage.getItem('minimax_current_group_id')||fallback;
    const expected=window.__pearExpectedGroup||'';
    if(expected&&group&&expected!==group)throw Error('官网账户与接口 Group ID 不一致，请在官网切换账户。');
    const groupId=expected||group;
    if(!groupId)throw Error('请先登录，并在官网选好账户后再同步。');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
    let response,data;
    try{response=await fetch('https://www.minimax.cn/account/query_balance',{credentials:'include',headers:{'X-Group-Id':groupId},signal:controller.signal});data=await response.json();}finally{clearTimeout(timer);}
    if(!response.ok||data.base_resp?.status_code!==0)throw Error('余额读取失败，请确认已登录且有账户查看权限。');
    const amount=(data.data||data).available_amount;
    if(!['string','number'].includes(typeof amount)||!String(amount).trim())throw Error('官网未返回可用余额。');
    const value=String(amount).replace(/,/g,'');
    if(!/^-?\d+(\.\d+)?$/.test(value)||!Number.isFinite(Number(value)))throw Error('官网余额格式暂不支持。');
    if(window.__pearAccountTicket===ticket)window.__pearAccountSync={ticket,balance:value,currency:'CNY',groupId,updatedAt:Date.now()};
  })().catch(error=>{if(window.__pearAccountTicket===ticket)window.__pearAccountSync={ticket,error:error.name==='AbortError'?'查询超时，请重试。':error.message};});
})();
