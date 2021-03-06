import "../client.js"
// import createJSON from "@/tool/createJSON"
// import initSceneByJSON from "@/tool/initSceneByJSON"
import * as client from '../client';

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
      client.editMesh(meshes)
      setTimeout(() => {
        client.editMaterial(this.scene.materials)
      }, 1000)
      client.openDebug({
        scene: this.scene
      })
      // editMaterial(this.scene.materials)
      // let json = createJSON(this.scene)
      // initSceneByJSON(this.scene, json)
    })
  }


}

let demo = new Demo()
window.d = demo;
window.scene=demo.scene;