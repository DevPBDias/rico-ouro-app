"use strict";(()=>{var c="rico-ouro-cache-v23",m="rico-ouro-api-v23",y=["/","/manifest.json","/offline.html","/logo.svg","/splash.png","/login","/home","/animals","/matrizes","/cadastro","/consulta","/reproducao","/vacinas","/nascimentos","/pesagem-ce","/importar","/importar/planilhas","/gerenciar","/gerenciar/fazendas","/gerenciar/classe","/gerenciar/sociedade","/gerenciar/status","/geral","/geral/bois","/geral/relatorios","/geral/relatorios/pdf","/geral/relatorios/planilhas"];async function i(e,a,t){try{t&&t.status===200&&t.type==="basic"&&await(await caches.open(e)).put(a,t.clone())}catch(r){console.warn("Service Worker: Failed to cache response",r)}}async function w(e){let a=await caches.open(c);for(let t of e)try{if(!await a.match(t)){let s=await fetch(t);s&&s.status===200&&(await a.put(t,s),console.log(`Service Worker: Proactively cached ${t}`))}}catch(r){console.warn(`Service Worker: Failed to proactively cache ${t}`,r)}}self.addEventListener("install",e=>{console.log("Service Worker: Installing v23 (App Shell)..."),e.waitUntil(caches.open(c).then(async a=>{console.log("Service Worker: Caching App Shell");let t=y.map(async r=>{try{await a.add(r),console.log(`Service Worker: Cached ${r}`)}catch(s){console.warn(`Service Worker: Failed to cache ${r}`,s)}});await Promise.all(t)})),self.skipWaiting()});self.addEventListener("activate",e=>{console.log("Service Worker: Activating..."),e.waitUntil(caches.keys().then(a=>Promise.all(a.map(t=>{if(!t.includes("v23")&&(t.startsWith("rico-ouro-cache-")||t.startsWith("rico-ouro-api-")||t.startsWith("rico-ouro-dynamic-")))return console.log("Service Worker: Removing old cache",t),caches.delete(t)})))),self.clients.claim()});self.addEventListener("message",e=>{if(e.data&&e.data.type==="CACHE_DYNAMIC_ROUTES"){let a=e.data.urls;console.log(`Service Worker: Received request to cache ${a.length} routes`),e.waitUntil(w(a))}e.data&&e.data.type==="SKIP_WAITING"&&self.skipWaiting(),e.data&&e.data.type==="CLEAR_CACHE"&&e.waitUntil(caches.keys().then(a=>Promise.all(a.map(t=>caches.delete(t)))))});self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||e.request.url.startsWith("chrome-extension"))return;let a=new URL(e.request.url);if(a.pathname.startsWith("/_next/static/")){e.respondWith(caches.match(e.request).then(async t=>{if(t)return t;try{let r=await fetch(e.request);return r&&r.status===200&&await i(c,e.request,r),r}catch{return new Response("Offline",{status:503})}}));return}if(a.pathname.startsWith("/api/")){e.respondWith((async()=>{try{let r=new AbortController,s=setTimeout(()=>r.abort(),5e3),o=await fetch(e.request,{signal:r.signal});return clearTimeout(s),o&&o.status===200&&await i(m,e.request,o),o}catch{let r=await caches.match(e.request);return r?(console.log("Service Worker: Serving API from cache",a.pathname),r):new Response(JSON.stringify({error:"Offline",cached:!1}),{status:503,headers:{"Content-Type":"application/json"}})}})());return}if(e.request.mode==="navigate"||e.request.headers.get("accept")?.includes("text/html")){e.respondWith((async()=>{try{let r=new AbortController,s=setTimeout(()=>r.abort(),3e3),o=await fetch(e.request,{signal:r.signal});return clearTimeout(s),o&&o.status===200&&await i(c,e.request,o),o}catch{let r=await caches.match(e.request);if(r)return console.log("Service Worker: Serving from cache (exact)",a.pathname),r;let s=await caches.match("/");if(s)return console.log("Service Worker: Serving App Shell as fallback",a.pathname),s;let o=await caches.match("/offline.html");return o||new Response(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - INDI Ouro</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1162ae 0%, #0d4d8a 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
    }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; }
    p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; }
    a {
      display: inline-block;
      padding: 14px 28px;
      background: white;
      color: #1162ae;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    a:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="container">
    <h1>\u{1F4F4}</h1>
    <h2>Voc\xEA est\xE1 offline</h2>
    <p>Esta p\xE1gina n\xE3o est\xE1 dispon\xEDvel no momento. Verifique sua conex\xE3o e tente novamente.</p>
    <a href="/home">Ir para In\xEDcio</a>
  </div>
</body>
</html>`,{status:503,statusText:"Service Unavailable",headers:new Headers({"Content-Type":"text/html; charset=utf-8"})})}})());return}if(a.pathname.includes("/_next/data/")){e.respondWith((async()=>{try{let t=await fetch(e.request);return t&&t.status===200&&await i(c,e.request,t),t}catch{let t=await caches.match(e.request);return t||new Response(JSON.stringify({pageProps:{}}),{status:200,headers:{"Content-Type":"application/json"}})}})());return}if(a.pathname.endsWith(".js")){e.respondWith(fetch(e.request).then(async t=>(t&&t.status===200&&t.type==="basic"&&await i(c,e.request,t),t)).catch(async()=>await caches.match(e.request)||new Response("Offline",{status:503})));return}e.respondWith(caches.match(e.request).then(async t=>{if(t)return t;try{let r=await fetch(e.request);return r&&r.status===200&&r.type==="basic"&&await i(c,e.request,r),r}catch{return new Response("Offline",{status:503})}}))});var S="offline-sync-queue",n="requests",E=5;async function h(){return new Promise((e,a)=>{let t=indexedDB.open(S,1);t.onupgradeneeded=r=>{let s=r.target.result;s.objectStoreNames.contains(n)||s.createObjectStore(n,{keyPath:"id"})},t.onsuccess=r=>{e(r.target.result)},t.onerror=()=>{a(new Error("Failed to open sync database"))}})}async function W(){try{let t=(await h()).transaction(n,"readonly").objectStore(n);return new Promise((r,s)=>{let o=t.getAll();o.onsuccess=()=>r(o.result||[]),o.onerror=()=>s(new Error("Failed to get pending requests"))})}catch(e){return console.warn("Service Worker: Could not access sync queue",e),[]}}async function d(e){try{let r=(await h()).transaction(n,"readwrite").objectStore(n);return new Promise((s,o)=>{let l=r.delete(e);l.onsuccess=()=>s(),l.onerror=()=>o(new Error(`Failed to remove ${e}`))})}catch(a){console.warn("Service Worker: Could not remove from queue",a)}}async function g(e){try{let r=(await h()).transaction(n,"readwrite").objectStore(n),s={...e,retries:e.retries+1};return new Promise((o,l)=>{let p=r.put(s);p.onsuccess=()=>o(),p.onerror=()=>l(new Error(`Failed to update ${e.id}`))})}catch(a){console.warn("Service Worker: Could not update retry count",a)}}async function u(e){(await self.clients.matchAll({type:"window"})).forEach(t=>{t.postMessage(e)})}self.addEventListener("sync",e=>{console.log("Service Worker: Sync event fired",e.tag),e.tag==="sync-data"&&e.waitUntil(f())});async function f(){console.log("Service Worker: Executing background sync...");let e=await W();if(e.length===0){console.log("Service Worker: No pending requests to sync"),u({type:"SYNC_COMPLETE",data:{synced:0}});return}console.log(`Service Worker: Found ${e.length} pending requests`),u({type:"SYNC_STARTED",data:{pending:e.length}});let a=0,t=0;for(let r of e)try{if(r.retries>=E){console.warn(`Service Worker: Max retries exceeded for ${r.id}, removing`),await d(r.id),t++;continue}let s=await fetch(r.url,{method:r.method,headers:r.headers,body:r.body?JSON.stringify(r.body):void 0});s.ok?(console.log(`Service Worker: Successfully synced ${r.id}`),await d(r.id),a++):s.status>=400&&s.status<500?(console.warn(`Service Worker: Client error for ${r.id}, removing`),await d(r.id),t++):(console.warn(`Service Worker: Server error for ${r.id}, will retry`),await g(r),t++)}catch(s){console.error(`Service Worker: Network error for ${r.id}`,s),await g(r),t++}console.log(`Service Worker: Sync complete. Success: ${a}, Failed: ${t}`),u({type:"SYNC_COMPLETE",data:{synced:a,failed:t,remaining:t}})}self.addEventListener("periodicsync",e=>{e.tag==="sync-data-periodic"&&(console.log("Service Worker: Periodic sync triggered"),e.waitUntil(f()))});self.addEventListener("online",()=>{console.log("Service Worker: Back online, triggering sync"),f()});})();
