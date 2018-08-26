/**@module*/

import "./components/tool/reset";
import {editMesh, unEditMesh, editMaterial, unEditMaterial} from "./components/tool/edit"
import initSceneByJSON from './components/tool/initSceneByJSON';

/** 调用openDebug()开启调试
 *  不开启的时候文档不会加载相关文件,节省线上资源*/
function openDebug(opt) {
  require.ensure([], (require) => {
    //导入页面
    require("@/page/main");
    //client入口文件
    let MultiDebug = require("@/index").default;
    new MultiDebug(Object.assign({
      scene: window.scene,
      ip: window.location.hostname,
      port: 3000,
      onlyServer: false
    }, opt))
  })
}

export {openDebug, editMesh, unEditMesh, editMaterial, unEditMaterial, initSceneByJSON};
