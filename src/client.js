// let io = require('socket.io-client');
// import "babylonjs"
//
// declare let window: any
//
// let socket = io('ws://localhost:3000/socket.io');
// window.socket = socket
// window.io = io
import "@/tool/reset";
import {editMesh, unEditMesh, editMaterial, unEditMaterial} from "@/tool/edit"
import initSceneByJSON from '@/tool/initSceneByJSON';

/** 调用openDebug()开启调试
 *  不开启的时候文档不会加载相关文件,节省线上资源*/
function openDebug() {
  require.ensure([], (require) => {
    require("@/babyui/babyui").default;
  })
}

export {openDebug, editMesh, unEditMesh, editMaterial, unEditMaterial, initSceneByJSON};
