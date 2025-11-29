"use strict";(()=>{var c="rico-ouro-cache-v18",s=["/","/manifest.webmanifest"];self.addEventListener("install",e=>{console.log("Service Worker: Installing..."),e.waitUntil(caches.open(c).then(async r=>{console.log("Service Worker: Caching App Shell");let t=s.map(async a=>{try{await r.add(a),console.log(`Service Worker: Cached ${a}`)}catch(n){console.warn(`Service Worker: Failed to cache ${a}`,n)}});await Promise.all(t)})),self.skipWaiting()});self.addEventListener("activate",e=>{console.log("Service Worker: Activating..."),e.waitUntil(caches.keys().then(r=>Promise.all(r.map(t=>{if(t!==c)return console.log("Service Worker: Removing old cache",t),caches.delete(t)})))),self.clients.claim()});self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||e.request.url.startsWith("chrome-extension"))return;let r=new URL(e.request.url);if(e.request.mode==="navigate"||e.request.headers.get("accept")?.includes("text/html")){e.respondWith(fetch(e.request).then(t=>{if(t&&t.status===200){let a=t.clone();caches.open(c).then(n=>{n.put(e.request,a)})}return t}).catch(()=>caches.match(e.request).then(t=>t||caches.match("/").then(a=>a||new Response(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - INDI Ouro</title>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      margin: 0;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      text-align: center;
                      padding: 20px;
                    }
                    .container {
                      max-width: 400px;
                    }
                    h1 { font-size: 48px; margin: 0 0 20px 0; }
                    p { font-size 18px; line-height: 1.6; }
                    a {
                      display: inline-block;
                      margin-top: 20px;
                      padding: 12px 24px;
                      background: white;
                      color: #667eea;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: 600;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>\u{1F4F4}</h1>
                    <h2>Voc\xEA est\xE1 offline</h2>
                    <p>Esta p\xE1gina n\xE3o est\xE1 dispon\xEDvel no cache. Por favor, conecte-se \xE0 internet e tente novamente.</p>
                    <a href="/">Voltar para Home</a>
                  </div>
                </body>
                </html>
                `,{status:503,statusText:"Service Unavailable",headers:new Headers({"Content-Type":"text/html; charset=utf-8"})})))));return}if(e.request.url.includes("/_next/")||r.pathname.endsWith(".js")){e.respondWith(fetch(e.request).then(t=>{if(t&&t.status===200&&t.type==="basic"){let a=t.clone();caches.open(c).then(n=>{n.put(e.request,a)})}return t}).catch(()=>caches.match(e.request).then(t=>t||new Response("Offline",{status:503}))));return}e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request).then(a=>{if(!a||a.status!==200||a.type!=="basic")return a;let n=a.clone();return caches.open(c).then(i=>{i.put(e.request,n)}),a}).catch(()=>new Response("Offline",{status:503}))))});self.addEventListener("sync",e=>{console.log("Service Worker: Sync event fired",e.tag),e.tag==="sync-data"&&e.waitUntil(o())});async function o(){console.log("Service Worker: Executing background sync...")}})();
