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
    // this.test();
    this.test2();
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

    function start(onChange) {
      let two = false;
      let oriAlpha = 0;
      let oriDir = 0;
      scene.onPointerObservable.add(() => {
        two = false;
      }, 1)
      camera.onViewMatrixChangedObservable.add(() => {
        let alphaDif = camera.alpha - oriAlpha;
        oriAlpha = camera.alpha;
        if (Math.abs(alphaDif) < 0.00001)
          return;
        let dir = alphaDif > 0 ? 1 : -1;
        if (oriDir !== dir) {
          if (two) {
            onChange && onChange();
          } else {
            two = true;
          }
        }
        oriDir = dir;
      })
    }

    start(()=>{
      console.log(1)
    });
  }
  test2(){
    let scene = this.scene;
    let camera = this.camera;
    var startX,
      endX,
      startY,
      endY,
      startAlpha,
      endAlpha,
      startBeta,
      endBeta,
      timeStart,
      dir,
      oriAlpha,
      timeEnd;
    scene.onPointerObservable.add(function(e){
      e = window.event || event;
      startX = e.clientX;
      startY = e.clientY;
      startAlpha = camera.alpha;
      startBeta = camera.beta;
      oriAlpha = 0;
      timeStart = new Date().getTime();
    }, BABYLON.PointerEventTypes.POINTERDOWN);

    scene.onPointerObservable.add(function (e) {
      e = window.event || event;
      endX = e.clientX;
      endY = e.clientY;
      endAlpha = camera.alpha;
      endBeta = camera.beta;
      timeEnd = new Date().getTime();
      if(timeEnd - timeStart >500){
        camera.onViewMatrixChangedObservable.add(function () {
          var alphaDif = camera.alpha- oriAlpha;
          dir = alphaDif>0?1:-1;
          oriAlpha = camera.alpha;
          if(dir>0){
            console.log("左滑")
          } else if (dir < 0) {
            console.log("右滑")
          }else{
            console.log("没动")
          }
        })
        return
      }
      if (Math.abs((endY - startY) / (endX - startX)) <= 1.732){
        if (endAlpha - startAlpha < 0){
          console.log("右滑："+ (180 / Math.PI * Math.abs((endAlpha - startAlpha))).toFixed(0) + "°")
        }else{
          console.log("左滑：" + (180 / Math.PI * (endAlpha - startAlpha)).toFixed(0) + "°")
        }
      }else{
        if (endBeta - startBeta > 0){
          console.log("上滑：" + (180 / Math.PI * (endBeta - startBeta)).toFixed(0) + "°")
        } else if (endBeta - startBeta < 0) {
          console.log("下滑：" + (180 / Math.PI * Math.abs((endBeta - startBeta))).toFixed(0) + "°")
        }else{
          console.log("相机被限制了，傻逼")
        }
      }
      console.log("旋转时长：" + (timeEnd-timeStart)/1000 + "秒")

    }, BABYLON.PointerEventTypes.POINTERUP);
  }
}

let demo = new Demo()
window.d = demo;