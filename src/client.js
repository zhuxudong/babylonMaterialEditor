// let io = require('socket.io-client');
// import "babylonjs"
//
// declare let window: any
//
// let socket = io('ws://localhost:3000/socket.io');
// window.socket = socket
// window.io = io
import "@/tool/reset";

/** 调用openDebug()开启调试
 *  不开启的时候文档不会加载相关文件,节省线上资源*/
function openDebug() {
  require.ensure([], (require) => {
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

/**为了防止生成不想要的材质JSON,所以必须editMaterial(material)才会生成相应的材质JSON*/
function editMaterial(material) {
  material && (material._babylonMaterialEditor = true);
}

/**取消调试物体*/
function unEditMaterial(material) {
  material && (material._babylonMaterialEditor = false);
}

export {openDebug, editMesh, unEditMesh, editMaterial, unEditMaterial};
