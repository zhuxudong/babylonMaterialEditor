/**@module*/
import MultiDebug from "./index"
import {basePro, texturePro} from "./lang/en";
import Tool from './tool/tool'
import initSceneByJSON from './tool/initSceneByJSON';

let scene = null;

/**描边*/
class Outline {
  outlineWidth = 1;
  hightlight = null;
  outlineColor = new BABYLON.Color3.FromHexString("#ff254c");
  currentOutlineMesh = null;

  onmousemove = () => {
    let pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    let pickedMesh = pickInfo.pickedMesh;
    if (!pickedMesh && this.currentOutlineMesh) {
      this.unrenderMesh(this.currentOutlineMesh);
    }
    if (pickedMesh) {
      this.renderMesh(pickedMesh);
    }
  };

  constructor() {
    this.hightlight = new BABYLON.HighlightLayer("debug", scene);
  }

  setOutlineWidth(width) {
    this.outlineWidth = width;
    Tool.showMessage("描边粗细已经调整到 " + width, 1);
  }

  getOutlineWidth() {
    return this.outlineWidth;
  }

  renderMesh(mesh) {
    if (!mesh || !mesh.geometry) {
      return;
    }
    this.hightlight.blurHorizontalSize = this.outlineWidth;
    this.hightlight.blurVerticalSize = this.outlineWidth;
    if (mesh !== this.currentOutlineMesh) {
      if (mesh._babylonMaterialEditor) {
        this.hightlight.addMesh(mesh, this.outlineColor)
      }
      if (this.currentOutlineMesh) {
        this.hightlight.removeMesh(this.currentOutlineMesh)
      }
      this.currentOutlineMesh = mesh;
    }
  }

  unrenderMesh(mesh) {
    if (!mesh) {
      return;
    }
    this.hightlight.removeMesh(mesh);
    this.currentOutlineMesh = null;
    if (this.currentOutlineMesh) {
      this.hightlight.removeMesh(this.currentOutlineMesh)
    }
  }

  init() {
    this.dispose();
    scene.onPointerObservable.add(this.onmousemove, 4);
  }

  dispose() {
    this.unrenderMesh(this.currentOutlineMesh)
    scene.onPointerObservable.removeCallback(this.onmousemove);
  }
}

/**灯光类*/
class Light {
  lightBallSize = 10;
  lightBalls = []

  constructor() {
  }

  getLightBallSize() {
    return this.lightBallSize;
  }

  setLightBallSize(num) {
    this.lightBallSize = num;
    Tool.showMessage("光球大小已经调整到 " + num, 1);
    if (this.lightBalls.length) {
      this.debugLight();
    }
  }

  debugLight() {
    let engine = scene.getEngine();
    let canvas = engine.getRenderingCanvas();
    //防止多次创建事件
    disposeLightDebug();
    //显示所有光源球
    window.scene.lights.forEach(function (light) {
      showLightBall(light);
    })
    //显示调试框
    if (lightBalls.length) {
      var mesh = lightBalls[0];
      //默认调试第一个灯光
      //注册事件
      registerLightEvent();
      toggleLightBall(mesh);
    }
    //进行按键提示
    MultiDebug.Tool.showMessage("按键 w 进行位置调试 ，按键 e 进行方向调试，红色轴为灯光的方向");
  }

}

class App {
  engine = null;
  canvas = null;
  initialTexture = {};
  //class Outline
  outline = null;
  //class Light
  light = null;

  constructor(s) {
    scene = s;
    this.engine = scene.getEngine();
    this.canvas = this.engine.getRenderingCanvas();
    this.outline = new Outline();
    this.light = new Light();
  }

  //保存初始纹理
  storeInitialTexture() {
    scene.materials.forEach((material) => {
      texturePro.forEach((info) => {
        let textureName = info.name;
        if (material[textureName]) {
          //保存初始纹理
          if (!this.initialTexture[material.name]) {
            this.initialTexture[material.name] = {}
          }
          this.initialTexture[material.name][textureName] = material[textureName];
        }
      })
    })
    console.log("初始纹理：", this.initialTexture)
  }

  //更新局域网列表，并更新debugInfo
  refreshLanList(noMessage, onsuccess) {
    let myName = MultiDebug.get("socketModule", "myName")
    //获取锁定信息
    MultiDebug.exe("socketModule", "getServerData", "lockInfo", (lockInfo) => {
      //获取BABYLON当前mesh，刷新lanList
      MultiDebug.exe("lanModule", "refreshLanList", scene.meshes.map((mesh) => {
        if (!mesh._babylonMaterialEditor) {
          return null;
        }
        let name = mesh.name;
        let stat = null;
        let config = false;
        let title = null;
        if (lockInfo[mesh.name]) {
          if (lockInfo[mesh.name].userName === myName) {
            stat = "success";
            config = true;
            title = "..."
          } else {
            stat = "danger";
            title = lockInfo[mesh.name].userName + "正在调试......";
          }
        } else {
          stat = "warn";
          config = true;
          title = "未锁定"
        }
        return {
          name: name,
          stat: stat,
          config: config,
          title: title,
          data: {
            name: name,
            stat: stat,
            meshId: mesh.id,
            mesh: mesh
          }
        }
      }))
      !noMessage && Tool.showMessage("refresh success......", 1);
      if (typeof onsuccess === "function") {
        onsuccess();
      }
    })

    this.refreshDebug();
    this.detectConfilict();
  }

  //重新获取服务器调试信息，更新场景
  refreshDebug() {
    MultiDebug.exe("socketModule", "getServerData", "debugInfo", (data) => {
      console.log("服务器调试信息:", data)
      if (data) {
        initSceneByJSON(scene, data)
      }
    })
  }

  //物体材质灯光冲突检测
  detectConfilict() {
    let existMesh = {};
    let existMaterial = {};
    let existLights = {};
    scene.meshes.forEach((mesh) => {
      if (existMesh.hasOwnProperty(mesh.name)) {
        existMesh[mesh.name]++;
      } else {
        existMesh[mesh.name] = 1
      }
    })
    scene.materials.forEach(function (material) {
      if (existMaterial.hasOwnProperty(material.name)) {
        existMaterial[material.name]++;
      } else {
        existMaterial[material.name] = 1
      }
    })
    scene.lights.forEach(function (light) {
      if (existLights.hasOwnProperty(light.name)) {
        existLights[light.name]++;
      } else {
        existLights[light.name] = 1;
      }
    })
    existMesh.forEach(function (number, meshName) {
      if (number > 1) {
        let message = "物体名字冲突:[" + meshName + "]存在 " + number + " 个";
        Tool.showMessage(message, 2, "warn", null, null, 200);
        console.warn(message)
      }
    })
    existMaterial.forEach(function (number, materialName) {
      if (number > 1) {
        let message = "材质名字冲突:[" + materialName + "]存在 " + number + " 个";
        Tool.showMessage(message, 2, "danger", null, null, 200);
        console.warn(message)
      }
    })
    existLights.forEach(function (number, lightName) {
      if (number > 1) {
        let message = "灯光名字冲突:[" + lightName + "]存在 " + number + " 个";
        Tool.showMessage(message, 2, "danger", null, null, 200);
        console.warn(message);
      }
    })
  }

  //更新图库
  refreshPicPanel(noMessage) {
    MultiDebug.exe("socketModule", "getPicFileList", function (data) {
      console.log("图片库：", data);
      let publicTexture = data.publicTexture;
      let publicSkybox = data.publicSkybox;
      let privateTexture = data.privateTexture;
      let privateSkybox = data.privateSkybox;
      let panel1 = MultiDebug.get("picModule", "panel1");
      let panel2 = MultiDebug.get("picModule", "panel2");
      let panel3 = MultiDebug.get("picModule", "panel3");
      let panel4 = MultiDebug.get("picModule", "panel4");
      let publicTextureFix = MultiDebug.get("socketModule", "publicLibPath") + "/textures/";
      let publicSkyboxFix = MultiDebug.get("socketModule", "publicLibPath") + "/skyboxes/";
      let privateFix = MultiDebug.get("socketModule", "appLibPath");
      let privateTextureFix = privateFix + "/textures/";
      let privateSkyboxFix = privateFix + "/skyboxes/";
      MultiDebug.exe("picModule", "createTexturePanel", publicTexture, publicTextureFix, panel1);
      MultiDebug.exe("picModule", "createCubePanel", publicSkybox, publicSkyboxFix, panel2);
      MultiDebug.exe("picModule", "createTexturePanel", privateTexture, privateTextureFix, panel3);
      MultiDebug.exe("picModule", "createCubePanel", privateSkybox, privateSkyboxFix, panel4);
      !noMessage && Tool.showMessage("更新图库成功...", 1)
    })
  }

  debugMode() {
    this.outline.init();
  }

  viewMode() {
    this.outline.dispose();
  }
}

export default App;