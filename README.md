(旧版本链接)[https://github.com/zhuxudong/BABYLON-MUL]

(新版本使用webpack重构模块,删除了材质库和灯光功能,线上线下更加精简)

# (API文档链接)[https://htmlpreview.github.io/?https://github.com/zhuxudong/babylonMaterialEditor/blob/master/doc/index.html]

# 支持功能
* mesh
	* 隐藏物体
	* 显示物体
* 材质
	* 标准材质
	* PBR材质
	* 高光/光泽度
	* 金属/粗糙度
* 版本
	* 版本保存
	* 版本删除
	* 版本回溯
	* 版本导出
* socket联调
	* F5不清空数据
	* 实时显示他人调试结果
	* 锁定/解锁
* 聊天室

# 开发
```
npm run dev
```

# 发布
```
npm run build
``` 
# 更新文档
```
npm run doc
``` 
# 使用
### 线上
```
import * as editor from babylonMaterialEditor;
editor.initSceneByJSON(scene,json)
```
> 参数里面的json会在调试的时候生成到相应文件夹下面，具体根据server.js的配置来修改
### 调试
```
import * as editor from babylonMaterialEditor;
editor.openDebug(option...)
 /**  调用openDebug()开启调试
   *  不开启的时候文档不会加载相关文件,节省线上资源
   *  @param {object} opt
   *  @param {BABYLON.Scene} opt.scene 场景,默认window.scene
   *  @param {string} opt.ip IP,默认浏览器location中的ip
   *  @param {number} opt.port socket端口，以服务器端开启为准,默认3000
   *  */
```




