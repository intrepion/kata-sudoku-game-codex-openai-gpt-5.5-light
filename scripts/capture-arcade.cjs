'use strict';
const {chromium}=require('playwright');const {mkdir,readFile,writeFile}=require('node:fs/promises');const {createHash}=require('node:crypto');const path=require('node:path');
(async()=>{const output=process.env.CAPTURE_OUTPUT||'/tmp/ninefold-captures',site=process.env.CAPTURE_SITE||'capture-site';await mkdir(output,{recursive:true});const inputs={};for(const f of ['index.html','file-dist/assets/app.css','file-dist/assets/app.js'])inputs[f]=createHash('sha256').update(await readFile(path.join(site,f))).digest('hex');const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1,locale:'en-US',reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4222/',{waitUntil:'domcontentloaded'});
 await page.locator('[data-difficulty="easy"]').click(); await page.waitForTimeout(300);
 await page.locator('[data-cell]:not([disabled])').first().click(); await page.locator('[data-digit="6"]').click();
 await page.locator('main').screenshot({path:path.join(output,'ninefold-01.png'),animations:'disabled'});
 await page.locator('[data-action="change-puzzle"]').click(); await page.locator('[data-difficulty="hard"]').click(); await page.waitForTimeout(300);
 await page.locator('[data-action="note-mode"]').click(); await page.locator('[data-cell]:not([disabled])').first().click(); await page.locator('[data-digit="2"]').click();
 await page.locator('main').screenshot({path:path.join(output,'ninefold-02.png'),animations:'disabled'});
 await writeFile(path.join(output,'capture.json'),JSON.stringify({schemaVersion:1,workflowCommit:process.env.GITHUB_SHA||null,sourceCommit:process.env.GAME_SOURCE_COMMIT||null,runId:process.env.GITHUB_RUN_ID||null,url:'http://127.0.0.1:4222/',inputs,browser:browser.version(),viewport:{width:1280,height:1000},screenshots:['ninefold-01.png','ninefold-02.png']},null,2)+'\n');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
