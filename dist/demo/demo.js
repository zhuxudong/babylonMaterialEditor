!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("babylonjs")):"function"==typeof define&&define.amd?define(["babylonjs"],t):"object"==typeof exports?exports.babylonjsMaterialEditor=t(require("babylonjs")):e.babylonjsMaterialEditor=t(e.BABYLON)}("undefined"!=typeof self?self:this,function(e){return function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:i})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=49)}({10:function(t,n){t.exports=e},49:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n(10),r=(n.n(i),new(function(){function e(){var e=this;this.canvas=document.getElementById("renderCanvas"),this.engine=new i.Engine(this.canvas,!0,{preserveDrawingBuffer:!0,stencil:!0,doNotHandleContextLost:!0}),this.scene=new i.Scene(this.engine),this.scene.clearColor=new i.Color4(0,0,0,0),this.camera=new i.ArcRotateCamera("cameraArc",Math.PI/2,1.3,50,new i.Vector3(0,5,0),this.scene),this.camera.wheelPrecision=.05,this.camera.lowerBetaLimit=.1,this.camera.upperBetaLimit=Math.PI/2,this.camera.lowerRadiusLimit=5,this.camera.upperRadiusLimit=100,this.camera.wheelPrecision=10,this.camera.pinchPrecision=6,this.camera.attachControl(this.canvas,!0);var t=new i.HemisphericLight("hem1",new i.Vector3(0,1,0),this.scene);new i.PointLight("point1",new i.Vector3(0,1,0),this.scene);t.intensity=.5,this.engine.runRenderLoop(function(){e.scene.render()}),window.addEventListener("resize",function(){e.engine.resize()}),this.initBg()}return e.prototype.initBg=function(){var e=i.CubeTexture.CreateFromPrefilteredData("/static/model/demo/environment.dds",this.scene),t=i.Mesh.CreateBox("bg",500,this.scene),n=new i.PBRMaterial("bgMat",this.scene);n.backFaceCulling=!1,t.infiniteDistance=!0,t.material=n,n.reflectionTexture=e,n.reflectionTexture.coordinatesMode=i.Texture.SKYBOX_MODE,n.disableLighting=!0,n.microSurface=.5;var r=i.Mesh.CreateGround("ground",250,250,30,this.scene),o=new i.StandardMaterial("ground_mat",this.scene);r.material=o,o.opacityTexture=new i.Texture("/static/model/demo/backgroundGround.png",this.scene),o.emissiveColor=new i.Color3(1,1,1),o.alpha=.2},e.prototype.loadMesh=function(){i.SceneLoader.ImportMesh("","/static/model/demo/","MeetMat.obj",this.scene,function(e){})},e}()));r.loadMesh(),window.demo=r}})});