// let io = require('socket.io-client');
// import "babylonjs"
//
// declare let window: any
//
// let socket = io('ws://localhost:3000/socket.io');
// window.socket = socket
// window.io = io

/** 调用openDebug()开启调试
 *  不开启的时候文档不会加载相关文件,节省线上资源*/
function openDebug() {
  require.ensure([], (require) => {
    require("@/tool/reset");
    require("@/babyui/babyui").default;
  })
}

/**为了防止调试不想调试的物体,所以必须先editMesh(mesh)才能进行调试这个物体*/
function editMesh(mesh) {
  mesh && (mesh._babylonMaterialEditor = true);
}

/**取消调试物体*/
function unEditMesh(mesh) {
  mesh && (mesh._babylonMaterialEditor = false);
}

export {openDebug, editMesh, unEditMesh};
