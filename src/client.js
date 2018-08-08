// let io = require('socket.io-client');
// import "babylonjs"
//
// declare let window: any
//
// let socket = io('ws://localhost:3000/socket.io');
// window.socket = socket
// window.io = io

require.ensure([], (require) => {
  require("@/tool/reset");
  let BABYUI = require("@/babyui/babyui").default;
  let folder = new BABYUI.Folder("123");
  let folder2 = new BABYUI.Folder("123");
  let folder3 = new BABYUI.Folder("123", folder);
  window.f1 = folder;
  window.f2 = folder2;
  window.f3 = folder3;
  new BABYUI.Color("颜色", "#123", function (value) {
  }, folder)
  new BABYUI.Slider("滑动条", 10, 1, 100, 1, () => {
  }, folder2)
  new BABYUI.Select("选择",1,[1,2],null,f1)
  new BABYUI.Message("message",123,f2)
})
