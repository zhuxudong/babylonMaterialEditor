import "../client.js"
// import createJSON from "@/tool/createJSON"
// import initSceneByJSON from "@/tool/initSceneByJSON"
import * as test from '../client';

console.log(test)

class Demo {
  constructor() {
    this.canvas = document.getElementById("renderCanvas");
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      doNotHandleContextLost: true
    });
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    //俯瞰相机
    this.camera = new BABYLON.ArcRotateCamera("cameraArc", Math.PI / 2, 1.3, 50, new BABYLON.Vector3(0, 5, 0), this.scene);
    this.camera.wheelPrecision = 0.05;
    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = Math.PI / 2;
    this.camera.lowerRadiusLimit = 5;
    this.camera.upperRadiusLimit = 100;
    this.camera.wheelPrecision = 10;
    this.camera.pinchPrecision = 6;
    this.camera.attachControl(this.canvas, true);
    let light0 = new BABYLON.HemisphericLight("hem1", new BABYLON.Vector3(0, 1, 0), this.scene);
    let light1 = new BABYLON.PointLight("point1", new BABYLON.Vector3(0, 1, 0), this.scene);
    light0.intensity = .5;
    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
    this.initBg();
    this.loadMesh();
    this.test();
  }

  initBg() {
    /**skybox*/
    let hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/static/model/demo/environment.dds", this.scene);
    let hdrSkybox = BABYLON.Mesh.CreateBox("bg", 500, this.scene);
    let skyboxMaterial = new BABYLON.PBRMaterial("bgMat", this.scene);
    skyboxMaterial.backFaceCulling = false;
    hdrSkybox.infiniteDistance = true;
    hdrSkybox.material = skyboxMaterial;
    skyboxMaterial.reflectionTexture = hdrTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.microSurface = .65;
    /**ground*/
    let ground = BABYLON.Mesh.CreateGround("ground", 250, 250, 30, this.scene)
    let grdMat = new BABYLON.StandardMaterial("ground_mat", this.scene);
    ground.material = grdMat
    grdMat.opacityTexture = new BABYLON.Texture("/static/model/demo/backgroundGround.png", this.scene);
    grdMat.emissiveColor = new BABYLON.Color3(1, 1, 1)
    grdMat.alpha = .2;
  }

  loadMesh() {
    BABYLON.SceneLoader.ImportMesh("", "/static/model/demo/", "MeetMat.obj", this.scene, (meshes) => {
      console.log(meshes)
      // editMaterial(this.scene.materials)
      // let test = createJSON(this.scene)
      // initSceneByJSON(this.scene, test)
    })
  }

  test() {
    let scene = this.scene;
    let camera = this.camera;

    function start() {
      //相机视图矩阵发生变化时重置original值
      let oriAlpha = 0;
      let oriBeta = 0;
      let oriDirAlpha = 0;
      let oriDirBeta = 0;
      //因为要记录旋转角度,所以需要用变量来保存上次拐点的值
      let turnAlpha = 0;
      let turnBeta = 0;
      //从down时开始记录,每次将变向信息保存进数组,up的时候打印信息
      let infoAlpha = [];
      let infoBeta = [];
      //记录时间
      let timeStart = null;
      scene.onPointerObservable.add(() => {
        //每次down的时候清空所有信息,重新开始记录
        oriAlpha = turnAlpha = camera.alpha;
        oriBeta = turnBeta = camera.beta;
        oriDirAlpha = 0;
        oriDirBeta = 0;
        infoAlpha = [];
        infoBeta = [];
        timeStart = new Date().getTime();
      }, 1)
      scene.onPointerObservable.add(() => {
        infoAlpha.push({
          dir: (camera.alpha - turnAlpha) > 0 ? 1 : -1,
          angle: camera.alpha - turnAlpha
        })
        infoBeta.push({
          dir: (camera.beta - turnBeta) > 0 ? 1 : -1,
          angle: camera.beta - turnBeta
        })
        if (infoAlpha.length === 1) {
          console.log("alpha单向", infoAlpha)
        } else {
          console.log("alpha多向:", infoAlpha)
        }
        if (infoBeta.length === 1) {
          console.log("beta单向:", infoBeta)
        } else {
          console.log("beta多向:", infoBeta)
        }
        console.log("耗时:" + (new Date().getTime() - timeStart) + "毫秒");
      }, 2)
      camera.onViewMatrixChangedObservable.add(() => {
        let alphaDif = camera.alpha - oriAlpha;
        let betaDif = camera.beta - oriBeta;
        oriAlpha = camera.alpha;
        oriBeta = camera.beta;
        //当alpha发生变化
        if (alphaDif) {
          let dir = alphaDif > 0 ? 1 : -1;
          //如果oriDirAlpha为0,代表刚按下,此次不记录转向，而是以它作为一个初始方向
          if (!oriDirAlpha) {
            oriDirAlpha = dir;
          } else {
            //这里发生了转向了
            if (oriDirAlpha !== dir) {
              infoAlpha.push({
                dir: oriDirAlpha,
                angle: camera.alpha - turnAlpha
              })
              oriDirAlpha = dir;
              turnAlpha = camera.alpha;
            }
          }
        }
        //当beta发生变化，同上
        if (betaDif) {
          let dir = betaDif > 0 ? 1 : -1;
          //如果oriDirAlpha为0,代表刚按下,此次不记录转向，而是以它作为一个初始方向
          if (!oriDirBeta) {
            oriDirBeta = dir;
          } else {
            //这里发生了转向了
            if (oriDirBeta !== dir) {
              infoBeta.push({
                dir: oriDirBeta,
                angle: camera.beta - turnBeta
              })
              oriDirBeta = dir;
              turnBeta = camera.beta;
            }
          }
        }
      })
    }

    start();
  }

}

let demo = new Demo()
window.d = demo;