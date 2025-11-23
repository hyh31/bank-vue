# Usage

## 如何新建一个请求器？

因为需要 Web 和 Electron 通用，但是同时不引入过多的复杂代码，因此需要对 Web 进行一定的 polyfill

1. 在 shared/handlers 里头新建一个 handler，写入对应的请求器的代码（具体可以直接查看内部的请求逻辑你就能明白了）
2. 写完过后，先在 shared/fix-electron-api.ts 里头引入对应的 handler，它是作用于 Web 端请求的
3. 而 Electron 端，则是走的 IPC 通道
   1. 前往 main/index.ts 当中的 setupDataFetching function 添加对应的 ipcMain.handle
   2. 前往 preload/index.ts 当中添加对应的 ipcRenderer.invoke
4. 最后，在前端当中就可以安全地使用 `(window.api as any).xxxx` 来获取对应的请求器了
