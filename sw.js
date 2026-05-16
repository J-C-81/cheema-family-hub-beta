const CACHE='cfh-beta-v1-0-2';
const ASSETS=[
  '/cheema-family-hub-beta/manifest.json',
  '/cheema-family-hub-beta/icon-v2.png',
  '/cheema-family-hub-beta/apple-touch-icon-v2.png'
];

self.addEventListener('install',e=>{
  // Pre-cache the small set of static assets that never change between
  // versions so the PWA shell can boot fully offline.
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(ASSETS).catch(()=>null))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  // Drop any old cache buckets from previous SW versions, then take over.
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  // Cache-first only for the small set of static assets we pre-cached.
  // index.html is intentionally NOT cached so version bumps roll out instantly.
  if(!ASSETS.some(a=>url.pathname===a))return;
  e.respondWith((async()=>{
    const cached=await caches.match(e.request);
    if(cached)return cached;
    try{
      const resp=await fetch(e.request);
      if(resp&&resp.ok){const c=await caches.open(CACHE);c.put(e.request,resp.clone());}
      return resp;
    }catch(err){
      if(cached)return cached;
      throw err;
    }
  })());
});

self.addEventListener('push',e=>{
  console.log('[SW BETA] Push received');
  let title='Cheema Family Hub (Beta)';
  let body='Something new added';
  try{
    if(e.data){
      const d=e.data.json();
      if(d.title)title=d.title;
      if(d.body)body=d.body;
    }
  }catch(err){
    try{body=e.data.text();}catch(e2){}
  }

  // Supermarket mode handling — identical to prod, but tags carry the
  // -beta suffix so beta notifs never group with the live app's.
  const isShopMode = /at the shops/i.test(title);
  const options={
    body,
    icon:'https://j-c-81.github.io/cheema-family-hub-beta/icon-v2.png',
    badge:'https://j-c-81.github.io/cheema-family-hub-beta/icon-v2.png',
    tag: isShopMode ? 'cfh-beta-shop-mode' : 'cfh-beta-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
    renotify:true,
    requireInteraction: isShopMode,
    vibrate: isShopMode ? [180,80,180,80,180,80,360] : undefined,
    data:{url:'https://j-c-81.github.io/cheema-family-hub-beta/'}
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
      .then(()=>console.log('[SW BETA] Notification shown'))
      .catch(err=>console.log('[SW BETA] Notification error:',err))
  );
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const c of list){if('focus' in c)return c.focus();}
      return clients.openWindow('https://j-c-81.github.io/cheema-family-hub-beta/');
    })
  );
});
