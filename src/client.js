import "./components/tool/reset";
import {editMesh, unEditMesh, editMaterial, unEditMaterial} from "./components/tool/edit"
import initSceneByJSON from './components/tool/initSceneByJSON';

/** 调用openDebug()开启调试
 *  不开启的时候文档不会加载相关文件,节省线上资源*/
function openDebug() {
  require.ensure([], (require) => {
    //导入页面
    require("@/page/main");
  })
}

openDebug()
export {openDebug, editMesh, unEditMesh, editMaterial, unEditMaterial, initSceneByJSON};
