/**@module*/

import "./components/tool/reset";
import {editMesh, unEditMesh, editMaterial, unEditMaterial} from "./components/tool/edit"
import initSceneByJSON from './components/tool/initSceneByJSON';

/** 调用openDebug()开启调试
 *  不开启的时候文档不会加载相关文件,节省线上资源
 *  @param {object} opt
 *  @param {BABYLON.Scene} opt.scene 场景
 *  @param {string} opt.ip IP,默认浏览器location中的ip
 *  @param {number} opt.port socket端口，以服务器端开启为准,默认3000
 *  */
function openDebug(opt) {
  require.ensure([], (require) => {
    //导入页面
    require("@/page/main");
    //client入口文件
    let MultiDebug = require("@/index").default;
    new MultiDebug(opt)
  })
}
export {openDebug, editMesh, unEditMesh, editMaterial, unEditMaterial, initSceneByJSON};
