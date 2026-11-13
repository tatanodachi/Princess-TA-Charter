/* Princess TA Charter - offline support */
var CACHE='pta-98d0a94765';
var FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
function timeout(ms){return new Promise(function(_,rej){setTimeout(function(){rej(new Error('timeout'));},ms);});}
self.addEventListener('fetch',function(e){
  var r=e.request; if(r.method!=='GET') return;
  var u=new URL(r.url); if(u.origin!==location.origin) return;
  if(r.mode==='navigate'){
    e.respondWith(
      Promise.race([fetch(r),timeout(3500)]).then(function(res){
        var cp=res.clone(); caches.open(CACHE).then(function(c){c.put('index.html',cp);}); return res;
      }).catch(function(){return caches.match('index.html').then(function(m){return m||caches.match('./');});})
    );
    return;
  }
  e.respondWith(caches.match(r).then(function(m){
    if(m) return m;
    return fetch(r).then(function(res){var cp=res.clone(); caches.open(CACHE).then(function(c){c.put(r,cp);}); return res;});
  }));
});
