import * as BABYLON from "babylonjs"

class Demo {
  canvas: any
  engine: any
  scene: any
  camera: any

  initScene() {
    this.canvas = document.getElementById("renderCanvas");
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      doNotHandleContextLost: true
    });
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color3(0, 0, 0);
    //俯瞰相机
    this.camera = new BABYLON.ArcRotateCamera("cameraArc", Math.PI / 2, 1, 1000, new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.wheelPrecision = 0.05;
    this.camera.minZ = 200;
    this.camera.maxZ = 2000000;
    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = Math.PI / 2
    this.camera.lowerRadiusLimit = 1;
    this.camera.attachControl(this.canvas, false);
  }
}
