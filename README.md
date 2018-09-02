(旧版本支持功能)[https://github.com/zhuxudong/BABYLON-MUL]
# 支持功能
* mesh
	* 隐藏物体
	* 显示物体
* 材质
	* 标准材质
	* PBR材质
	* 高光/光泽度
	* 金属/粗糙度
* 灯光
	* 点光源
	* 平行光
	* 环境光
	* 聚光灯(暂不支持)
* 版本
	* 版本保存
	* 版本删除
	* 版本回溯
	* 版本导出
* 材质库
	* 导入
	* 导出
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
### 调试
```
import * as editor from babylonMaterialEditor;
editor.openDebug(option...)
```