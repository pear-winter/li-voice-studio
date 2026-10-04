const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [], calls = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('http://tavern.test/**', r => r.fulfill({ contentType: 'text/html; charset=utf-8', body: '<div id="extensionsMenu"></div><div id="chat"><div class="mes" mesid="0"><div class="mes_text">前文。<b>你好梨梨。</b>中间。你好梨梨。后文。</div></div></div>' }));
  // A real WAV exercises the browser audio pipeline without any paid API call.
  const wav = Buffer.alloc(44 + 16000 * 20);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
  await page.route('https://api.minimaxi.com/**', r => { calls.push(r.request().postDataJSON()); return r.fulfill({ contentType: 'audio/wav', body: wav }); });
  await page.addInitScript(() => {
    window.testContext = { chatId: 'chat-a', characterId: 0, characters: [{ avatar: 'test.png' }], chat: [{ mes: '前文。**你好梨梨。**中间。你好梨梨。后文。', send_date: '2026-10-04', name: '角色', swipe_id: 0 }] };
    window.SillyTavern = { getContext: () => window.testContext };
  });
  const $ = id => page.locator(`[data-id="${id}"]`);
  async function load() { await page.goto('http://tavern.test'); await page.addStyleTag({ path: path.join(root, 'style.css') }); await page.addScriptTag({ path: path.join(root, 'index.js') }); }
  async function selectSecond() {
    await page.evaluate(() => { const n = document.querySelector('.mes_text').lastChild; const r = document.createRange(); const start = n.textContent.indexOf('你好梨梨。'); r.setStart(n, start); r.setEnd(n, start + 5); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.dispatchEvent(new Event('selectionchange')); });
    await page.locator('#lv-selection').click();
  }
  async function generate() { const before = calls.length; await $('speak').click(); await page.waitForFunction(() => !document.querySelector('[data-id=speak]').disabled); assert.equal(calls.length, before + 1); }
  await load(); await selectSecond();
  await $('tabConfig').click(); await $('key').fill('mock-key'); await $('saveConfig').click(); await page.waitForFunction(() => !document.querySelector('[data-id=saveConfig]').disabled); await $('tabRead').click();
  await generate(); await $('close').click();
  await page.locator('.lv-inline-audio').waitFor();
  assert.equal(await page.locator('.lv-inline-audio').count(), 1);
  assert.equal(await page.locator('.lv-inline-audio').evaluate(e => e.previousSibling.textContent), '中间。你好梨梨。');
  assert.equal(await page.locator('.lv-inline-audio button').count(), 3);
  await page.locator('.lv-inline-audio button').first().click(); await page.waitForFunction(() => document.querySelector('.lv-inline-audio button').getAttribute('aria-pressed') === 'true');
  await page.locator('.lv-inline-audio button').first().click(); assert.equal(await page.locator('.lv-inline-audio button').first().getAttribute('aria-pressed'), 'false');
  await page.locator('#lv-menu').click(); await generate(); await $('close').click();
  await page.waitForFunction(() => document.querySelectorAll('.lv-inline-audio button').length === 4);
  await page.locator('.lv-inline-audio button').last().click(); assert.equal(await page.locator('.lv-version-menu button').count(), 2);
  await page.locator('.lv-version-menu button').first().click(); assert.match(await page.locator('.lv-inline-audio button').first().getAttribute('aria-label'), /第 1 版/);
  assert.equal(calls.length, 2, 'playback must not synthesize again');
  await load(); await page.locator('.lv-inline-audio').waitFor(); assert.match(await page.locator('.lv-inline-audio button').first().getAttribute('aria-label'), /第 1 版/);
  await page.evaluate(() => { window.testContext.chatId = 'chat-b'; });
  await page.waitForFunction(() => !document.querySelector('.lv-inline-audio'));
  await page.evaluate(() => { window.testContext.chatId = 'chat-a'; }); await page.locator('.lv-inline-audio').waitFor();
  await page.evaluate(() => { window.testContext.chat[0].swipe_id = 1; document.querySelector('.mes_text').textContent = '另一分支。'; });
  await page.waitForFunction(() => !document.querySelector('.lv-inline-audio'));
  await page.evaluate(() => { window.testContext.chat[0].swipe_id = 0; document.querySelector('.mes_text').innerHTML = '前文。<b>你好梨梨。</b>中间。你好梨梨。后文。'; }); await page.locator('.lv-inline-audio').waitFor();
  // Streaming edits are not allowed to leave a stale button attached to different text.
  await page.evaluate(() => { document.querySelector('.lv-inline-audio').previousSibling.textContent = '内容变化。'; }); await page.waitForFunction(() => !document.querySelector('.lv-inline-audio'));
  await load(); await page.locator('.lv-inline-audio').waitFor();
  await page.locator('#lv-menu').click(); await $('tabHistory').click(); await $('historyList').locator('summary').first().click(); await $('historyList').getByRole('button', { name: '删除', exact: true }).first().click(); await $('historyList').getByRole('button', { name: '确认删除', exact: true }).click(); await $('close').click(); await page.waitForFunction(() => document.querySelectorAll('.lv-inline-audio button').length === 3);
  assert.equal(await page.evaluate(() => window.testContext.chat[0].mes), '前文。**你好梨梨。**中间。你好梨梨。后文。');
  await page.evaluate(() => window.__liliMiniVoiceV1.destroy()); assert.equal(await page.locator('.lv-inline-audio,.lv-version-menu').count(), 0);
  // Formatted selections and same-origin status frames retain their original anchors.
  await load(); await page.evaluate(() => { const b = document.querySelector('.mes_text b'); const range = document.createRange(); range.selectNodeContents(b); const s = getSelection(); s.removeAllRanges(); s.addRange(range); }); await page.locator('#lv-selection').click();
  await $('text').fill('Hello, Ririshiko.'); await generate(); await $('close').click();
  await page.waitForFunction(() => document.querySelectorAll('.lv-inline-audio').length === 2);
  assert.equal(await page.locator('.mes_text b .lv-inline-audio').count(), 1);
  await page.evaluate(() => { const f = document.createElement('iframe'); f.srcdoc = '<p>状态里的句子。</p>'; document.querySelector('.mes').append(f); });
  await page.frameLocator('iframe').locator('p').waitFor();
  await page.frameLocator('iframe').locator('p').evaluate(el => { el.ownerDocument.defaultView.frameElement.focus(); el.focus(); const r = el.ownerDocument.createRange(); r.selectNodeContents(el); const s = el.ownerDocument.getSelection(); s.removeAllRanges(); s.addRange(r); el.ownerDocument.dispatchEvent(new Event('selectionchange')); });
  await page.locator('#lv-selection').click(); assert.equal(await $('text').inputValue(), '状态里的句子。'); await generate(); await $('close').click();
  await page.frameLocator('iframe').locator('.lv-inline-audio').waitFor();
  await page.frameLocator('iframe').locator('.lv-inline-audio button').first().click();
  await page.waitForFunction(() => document.querySelector('iframe').contentDocument.querySelector('.lv-inline-audio button').getAttribute('aria-pressed') === 'true');
  const beforeReplay = calls.length;
  await page.evaluate(() => { const f = document.querySelector('iframe'); f.srcdoc = '<p>状态里的句子。</p>'; });
  await page.frameLocator('iframe').locator('.lv-inline-audio').waitFor(); assert.equal(calls.length, beforeReplay);
  await page.evaluate(() => window.__liliMiniVoiceV1.destroy());
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('PASS: exact repeated sentence, version menu, real playback/pause, no synthesis on replay, reload + preferred version, chat/swipe isolation, rerender, stale-anchor removal, deletion and cleanup.');
})().catch(e => { console.error(e); process.exit(1); });
