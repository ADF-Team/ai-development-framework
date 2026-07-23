self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // ネットワークをそのまま通す（キャッシュ戦略は持たない）。
  // PWAのインストール可否判定にService Workerの存在が必要なブラウザ向けの最小実装。
})
