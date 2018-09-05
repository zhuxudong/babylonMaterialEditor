/**@module*/
import MultiDebug from "./index"
import {basePro, texturePro} from "./lang/en";
import {baseProCN, textureProCN, otherProCN} from "./lang/cn"
import Tool from './tool/tool'
import BABYUI from './babyui/babyui';
import initSceneByJSON from './tool/initSceneByJSON';
import createJSON from './tool/createJSON';

let scene = null;

/**描边*/
class Outline {
  outlineWidth = 1;
  hightlight = null;
  currentOutlineMesh = null;
  outlineColor = new BABYLON.Color3.FromHexString("#ff254c");

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

  //editMesh过的物体才会进行描边
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
    scene.lights.forEach(function (light) {
      showLightBall(light);
    })
    //显示调试框
    if (lightBalls.length) {
      let mesh = lightBalls[0];
      //默认调试第一个灯光
      //注册事件
      registerLightEvent();
      toggleLightBall(mesh);
    }
    //进行按键提示
    MultiDebug.Tool.showMessage("按键 w 进行位置调试 ，按键 e 进行方向调试，红色轴为灯光的方向");
  }

}

/**材质类*/
class Material {
  initialTexture = {};
  currentCopyMaterial = null;
  currentCopyMesh = null;
  currentCopyJSON = null;

  showTitle(control, par, exp) {
    control.title = (par ? ("参数介绍:" + par) : "") + (exp ? ("\n调试经验:" + exp) : "");
    return control.title;
  }

  getPicName(picStr) {
    if (!picStr) {
      return {
        picName: null,
        path: null
      }
    } else if (picStr.indexOf("private,") === 0) {
      return {
        picName: picStr.slice(8),
        path: "private"
      }
    } else if (picStr.indexOf("public,") === 0) {
      return {
        picName: picStr.slice(7),
        path: "public"
      }
    }
    return {
      picName: "自带",
      path: null
    };
  }

  //显示调试框
  showDebug(mesh) {
    if (!mesh || !mesh.material) {
      return;
    }
    let materialType = mesh.material.getClassName();
    let folder = new BABYUI.Folder("物体:[" + mesh.name + "]  材质:[" + mesh.material.name + "]");
    let uvNum = mesh.getVerticesDataKinds().join().match(/uv/g);
    uvNum = uvNum ? uvNum.length : 0;
    if (materialType === "StandardMaterial" || materialType === "WaterMaterial") {
      this.showStandardMaterial(mesh.material, folder, uvNum);
    } else if (mesh.material instanceof BABYLON.PBRBaseMaterial) {
      this.showPBRMaterial(mesh.material, folder, uvNum);
    }
  }

  //立方体纹理
  createCubeTexture(path, picName, textureName) {
    let texture = null;
    let type = "skybox";//"skybox,dds,hdr,ktx"
    let index = picName.lastIndexOf(".");
    if (index != -1) {
      type = picName.slice(index + 1);
    }
    if (type == "skybox") {
      texture = new BABYLON.CubeTexture(path + picName + "/" + picName, scene);
    } else if (type == "dds") {
      try {
        if (BABYLON.CubeTexture.CreateFromPrefilteredData) {
          texture = BABYLON.CubeTexture.CreateFromPrefilteredData(path + picName, scene);
        } else {
          Tool.showMessage("您当前的BABYLON版本并不支持DDS格式，请更换最新版本的BABYLON", 2, "danger");
        }
      } catch (e) {
        console.warn(e);
      }
    } else if (type == "hdr") {
      texture = new BABYLON.HDRCubeTexture(path + picName, scene, 256)
    } else {
      Tool.showMessage(picName + ":立方体纹理不支持这种格式", 2, "warn");
    }
    if (texture) {
      texture.name = textureName;
    }
    return texture;
  }

  //平面纹理
  createTexture(path, picName, textureName) {
    let texture = new BABYLON.Texture(path + picName, scene);
    if (texture) {
      texture.name = textureName;
    }
    return texture;
  }

  //标准材质
  showStandardMaterial(material, folderTop, uvNum) {
    let initBase = () => {
      let folder = new BABYUI.Folder(material.getClassName(), folderTop);
      this.showTitle(new BABYUI.Color(baseProCN.diffuseColor.cn, material.diffuseColor.toHexString(), function (value) {
        material.diffuseColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder), baseProCN.diffuseColor.par, baseProCN.diffuseColor.exp);
      this.showTitle(new BABYUI.Color(baseProCN.emissiveColor.cn, material.emissiveColor.toHexString(), function (value) {
        material.emissiveColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder), baseProCN.emissiveColor.par, baseProCN.emissiveColor.exp)
      this.showTitle(new BABYUI.Color(baseProCN.specularColor.cn, material.specularColor.toHexString(), function (value) {
        material.specularColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder), baseProCN.specularColor.par, baseProCN.specularColor.exp);
      this.showTitle(new BABYUI.Color(baseProCN.ambientColor.cn, material.ambientColor.toHexString(), function (value) {
        material.ambientColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder), baseProCN.ambientColor.par, baseProCN.ambientColor.exp);
      this.showTitle(new BABYUI.Slider(baseProCN.specularPower.cn, material.specularPower, 0, 100, 1, function (value) {
        material.specularPower = value;
      }, folder), baseProCN.specularPower.par, baseProCN.specularPower.exp);
      this.showTitle(new BABYUI.Slider("模糊度", material.roughness, 0, 10, .1, function (value) {
        material.roughness = value;
      }, folder), baseProCN.roughness.par, baseProCN.roughness.exp);
      this.showTitle(new BABYUI.Slider(baseProCN.alpha.cn, material.alpha, 0, 1, .01, function (value) {
        material.alpha = value;
      }, folder), baseProCN.alpha.par, baseProCN.alpha.exp);
    }

    let initTexture = () => {
      //贴图
      let folder = new BABYUI.Folder("贴图", folderTop);
      texturePro.forEach((info) => {
        let list = ["diffuseTexture", "reflectionTexture", "refractionTexture", "opacityTexture", "emissiveTexture", "specularTexture", "bumpTexture", "ambientTexture"]
        if (list.indexOf(info.name) === -1) {
          return;
        }
        let cube = info.cube;
        let other = info.other;
        //属性中文版本
        let intro = textureProCN[info.name].cn || info.name;
        let fresnel = info.fresnel;
        let textureNameOri = material[info.name] ? material[info.name].name : "";
        let picNameOri = null;
        if (material[info.name]) {
          picNameOri = this.getPicName(textureNameOri).picName;
        } else {
          picNameOri = "无"
        }
        let levelOri = material[info.name] ? material[info.name].level : 0;
        let usOri = material[info.name] ? material[info.name].uScale : 0;
        let vsOri = material[info.name] ? material[info.name].vScale : 0;
        let indexOri = material[info.name] ? material[info.name].coordinatesIndex : 0;
        let indexSelect = [0, 1, 2].filter(function (cor, index) {
          return index < uvNum;
        })
        let fresnelOri = material[fresnel] ? (material[fresnel].isEnabled ? "开" : "关") : "关";
        let biasOri = material[fresnel] ? material[fresnel].bias : 0;
        let powerOri = material[fresnel] ? material[fresnel].power : 0;
        let textureFolder = new BABYUI.Folder(intro, folder, true, (data, control) => {
          let path = data.path;// "/3ds/assets/materialLib/textures/"
          let picName = data.fileName;//"test.jpg"||"skybox"
          let type = data.type;// "skybox||texture"
          let panel = data.panel; //1,2,3,4
          let textureName = "private," + picName;
          if (panel === 1 || panel === 2) {
            textureName = "public," + picName
          }
          if (!material[info.name] || material[info.name].name !== textureName) {
            if (cube) {
              let texture = this.createCubeTexture(path, picName, textureName);
              if (texture) {
                material[info.name] = texture;
                textureControl.value = picName;
                textureNameOri = texture.name;
              }
            } else {
              if (type === "texture") {
                let texture = this.createTexture(path, picName, textureName);
                if (texture) {
                  material[info.name] = texture;
                  textureControl.value = picName;
                  textureNameOri = texture.name;
                }
              } else {
                Tool.showMessage(intro + "不能贴天空盒...", 2, "danger");
              }
            }
            if (material[info.name]) {
              show();
            }
          }
        });
        this.showTitle(textureFolder, textureProCN[info.name].par, textureProCN[info.name].exp);
        let textureControl = new BABYUI.Message("贴图", picNameOri, textureFolder, true, null, (control) => {
          let picName = control.dom.find(".baby-message-box").html();
          let path = this.getPicName(textureNameOri);
          if (!path.path) {
            return;
          }
          let panel = null;
          if (path.path === "public" && path.picName.indexOf(".") !== -1) {
            panel = 1;
          } else if (path.path === "public" && path.picName.indexOf(".") === -1) {
            panel = 2;
          } else if (path.path === "private" && path.picName.indexOf(".") !== -1) {
            panel = 3;
          } else if (path.path === "private" && path.picName.indexOf(".") === -1) {
            panel = 4;
          }
          if (panel) {
            MultiDebug.exe("picModule", "scrollToPic", panel, picName)
          }
        }, function (control) {
          material[info.name] = null;
          control.value = "无";
          hide();
        }, (control) => {
          let texture = null;
          if (!this.initialTexture[material.name]) {
            Tool.showMessage("该材质没有自带纹理,您贴不上", 1, "warn");
          }
          if (texture = this.initialTexture[material.name][info.name]) {
            material[info.name] = texture;
            control.value = "自带";
            show();
            Tool.showMessage("您成功贴上了自带纹理" + texture.name);
          } else {
            Tool.showMessage("该材质没有自带纹理,您贴不上", 1, "warn");
          }
        })
        textureControl.title = "点击事件：单击查看图片位置，双击删除纹理贴图，三击回到材质自带贴图(如果有的话)\n" + this.showTitle(textureControl, textureProCN[info.name].par, textureProCN[info.name].exp);
        textureFolder.dom.on("dragenter", function () {
          textureFolder.alert();
        })
        textureControl.dom.on("dragenter", function () {
          textureFolder.alert();
        })
        let levelControl = new BABYUI.Slider(otherProCN.level.cn, levelOri, 0, 5, .1, function (value) {
          if (!material[info.name]) {
            return;
          }
          material[info.name].level = value;
        }, textureFolder)
        this.showTitle(levelControl, otherProCN.level.par, otherProCN.level.exp);
        if (!cube) {
          var usControl = new BABYUI.Slider(otherProCN.uScale.cn, usOri, 0, 10, .1, function (value) {
            if (!material[info.name]) {
              return;
            }
            material[info.name].uScale = value;
          }, textureFolder)
          this.showTitle(usControl, otherProCN.uScale.par, otherProCN.uScale.exp);
          var vsControl = new BABYUI.Slider(otherProCN.vScale.cn, vsOri, 0, 10, .1, function (value) {
            if (!material[info.name]) {
              return;
            }
            material[info.name].vScale = value;
          }, textureFolder)
          this.showTitle(vsControl, otherProCN.vScale.par, otherProCN.vScale.exp);
        }
        let indexControl = new BABYUI.Select(otherProCN.coordinatesIndex.cn, indexOri, indexSelect, function (value) {
          if (!material[info.name]) {
            return;
          }
          //BABYLON当UVscale为1时候切换通道没反应
          let utemp = material[info.name].uScale;
          let vtemp = material[info.name].vScale;
          if (utemp == 1 && vtemp == 1) {
            material[info.name].uScale = 2;
            window.setTimeout(function () {
              material[info.name].coordinatesIndex = value - 0;
              material[info.name].uScale = utemp;
            }, 100)
          } else {
            material[info.name].coordinatesIndex = value - 0;
          }
        }, textureFolder)
        this.showTitle(indexControl, otherProCN.coordinatesIndex.par, otherProCN.coordinatesIndex.exp);
        //菲涅尔
        if (fresnel) {
          let fresnelControl = new BABYUI.Select(otherProCN.fresnel.cn, fresnelOri, ["开", "关"], function (value) {
            if (value === "开") {
              material[fresnel] = material[fresnel] || new BABYLON.FresnelParameters();
              material[fresnel].isEnabled = true;
              showFresnel();
            } else {
              material[fresnel].isEnabled = false;
              hideFresnel();
            }
          }, textureFolder)
          this.showTitle(fresnelControl, otherProCN.fresnel.par, otherProCN.fresnel.exp);
          var biasControl = new BABYUI.Slider(otherProCN.bias.cn, biasOri, 0, 1, .01, function (value) {
            if (material[fresnel]) {
              material[fresnel].bias = value;
            }
          }, textureFolder)
          this.showTitle(biasControl, otherProCN.bias.par, otherProCN.bias.exp);
          var powerControl = new BABYUI.Slider(otherProCN.power.cn, powerOri, 0, 30, .01, function (value) {
            if (material[fresnel]) {
              material[fresnel].power = value;
            }
          }, textureFolder)
          this.showTitle(powerControl, otherProCN.power.par, otherProCN.power.exp);
        }
        //法线贴图
        if (other) {
          var useParallaxControl = new BABYUI.Select(otherProCN.useParallax.cn, material.useParallax, [false, true], function (value) {
            if (!material[info.name]) {
              return;
            }
            material.useParallax = value == "false" ? false : true;
          }, textureFolder)
          this.showTitle(useParallaxControl, otherProCN.useParallax.par, otherProCN.useParallax.exp);
          var useParallaxOcclusionControl = new BABYUI.Select(otherProCN.useParallaxOcclusion.cn, material.useParallaxOcclusion, [false, true], function (value) {
            if (!material[info.name]) {
              return;
            }
            material.useParallaxOcclusion = value == "false" ? false : true;
          }, textureFolder)
          this.showTitle(useParallaxOcclusionControl, otherProCN.useParallaxOcclusion.par, otherProCN.useParallaxOcclusion.exp);
          var parallaxScaleBiasControl = new BABYUI.Slider(otherProCN.parallaxScaleBias.cn, material.parallaxScaleBias, 0, .5, .001, function (value) {
            if (!material[info.name]) {
              return;
            }
            material.parallaxScaleBias = value;
          }, textureFolder)
          this.showTitle(parallaxScaleBiasControl, otherProCN.parallaxScaleBias.par, otherProCN.parallaxScaleBias.exp);
        }

        function hide() {
          levelControl.hide();
          indexControl.hide();
          if (usControl) {
            usControl.hide();
          }
          if (vsControl) {
            vsControl.hide();
          }
          if (other) {
            useParallaxControl.hide();
            useParallaxOcclusionControl.hide();
            parallaxScaleBiasControl.hide();
          }
        }

        function show() {
          levelControl.show(material[info.name].level)
          indexControl.show(material[info.name].coordinatesIndex)
          if (usControl) {
            usControl.show(material[info.name].uScale)
          }
          if (vsControl) {
            vsControl.show(material[info.name].vScale)
          }
          if (other) {
            useParallaxControl.show(material.useParallax)
            useParallaxOcclusionControl.show(material.useParallaxOcclusion)
            parallaxScaleBiasControl.show(material.parallaxScaleBias)
          }
        }

        function hideFresnel() {
          biasControl && biasControl.hide();
          powerControl && powerControl.hide();
        }

        function showFresnel() {
          biasControl && biasControl.show(material[fresnel].bias);
          powerControl && powerControl.show(material[fresnel].power);
        }

        //如果没有贴图
        if (!material[info.name]) {
          hide();
        }
        //如果没有反射菲涅尔
        if (!material[fresnel] || !material[fresnel].isEnabled) {
          hideFresnel();
        }
      })
    }

    let initWater = () => {
      let folder = new BABYUI.Folder("水", folderTop);
      this.showTitle(new BABYUI.Color("waterColor", material.waterColor.toHexString(), function (value) {
        material.waterColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder));
      this.showTitle(new BABYUI.Slider("windForce", material.windForce, 0, 10, .01, function (value) {
        material.windForce = value;
      }, folder));
      this.showTitle(new BABYUI.Slider("waveSpeed", material.waveSpeed, 0, 100, .01, function (value) {
        material.waveSpeed = value;
      }, folder));
      this.showTitle(new BABYUI.Slider("bumpHeight", material.bumpHeight, 0, 10, .01, function (value) {
        material.bumpHeight = value;
      }, folder));
      this.showTitle(new BABYUI.Slider("waveLength", material.waveLength, 0, 1000, .01, function (value) {
        material.waveLength = value;
      }, folder))
      this.showTitle(new BABYUI.Slider("colorBlendFactor", material.colorBlendFactor, 0, 1, .01, function (value) {
        material.colorBlendFactor = value;
      }, folder));
      this.showTitle(new BABYUI.Slider(baseProCN.alpha.cn, material.alpha, 0, 1, .01, function (value) {
        material.alpha = value;
      }, folder));
    }

    if (material.getClassName() === "WaterMaterial") {
      initWater();
    } else {
      initBase();
      initTexture();
    }

  }

  //PBR材质
  showPBRMaterial(material, folderTop, uvNum) {
    let materialType = material.getClassName();
    let textureList = null;
    let baseList = {};
    let boolList = [];
    let reflectivityColorControl = null;
    let metallicControl = null;
    let roughnessControl = null;
    let microSurfaceControl = null;
    let modeControl = null;
    let currentMetallic = null;
    let currentRoughness = null;
    //0-Specular/Glossiness
    //1-Metallic/Roughness mode
    //0模式能调试reflectivityColor，microSurface，光泽度贴图，金属贴图
    //1模式能调试metallic，roughness，光泽度贴图,金属贴图
    function checkPBRMode() {
      if (typeof material.metallic == "number" || typeof material.roughness == "number" /*|| material.metallicTexture*/) {
        return 1;
      } else {
        return 0;
      }
    }

    //Specular/Glossiness mode
    function showMode0() {
      if (materialType != "PBRMaterial") {
        return;
      }
      currentMetallic = material.metallic;
      currentRoughness = material.roughness;
      material.metallic = null;
      material.roughness = null;
      metallicControl.hide();
      roughnessControl.hide();
      microSurfaceControl.show(material.microSurface);
      reflectivityColorControl.show(material.reflectivityColor && material.reflectivityColor.toHexString());
      modeControl.value = "高光/光泽度 模式";
    }

    //Metallic/Roughness mode
    function showMode1() {
      if (materialType != "PBRMaterial") {
        return;
      }
      if (material.metallic == null && material.roughness == null) {
        material.metallic = currentMetallic;
        material.roughness = currentRoughness;
        if (currentMetallic == null && currentRoughness == null) {
          material.metallic = 0;
        }
      }
      metallicControl.show(material.metallic);
      roughnessControl.show(material.roughness);
      microSurfaceControl.hide();
      reflectivityColorControl.hide();
      modeControl.value = "金属/粗糙度 模式";
    }

    if (materialType == "PBRMaterial") {
      textureList = ["albedoTexture", "ambientTexture", "opacityTexture", "reflectionTexture", "emissiveTexture", "reflectivityTexture", "metallicTexture", "microSurfaceTexture", "bumpTexture" /*"refractionTexture"*/]
      baseList = {
        directIntensity: [0, 10, .001],
        emissiveIntensity: [0, 10, .001],
        environmentIntensity: [0, 10, .001],
        specularIntensity: [0, 100, .1],
        ambientTextureStrength: [0, 2, .001],
        metallic: [0, 1, .001],
        roughness: [0, 1, .001],
        microSurface: [0, 1, .001],
        indexOfRefraction: [0, 10, .001],
        alpha: [0, 1, .01]
      };
      boolList = ["useRoughnessFromMetallicTextureAlpha",
        "useRoughnessFromMetallicTextureGreen",
        "useMetallnessFromMetallicTextureBlue",
        "useAmbientOcclusionFromMetallicTextureRed",
        "useAmbientInGrayScale",
        "useAlphaFromAlbedoTexture",
        "useMicroSurfaceFromReflectivityMapAlpha",
        "useRadianceOverAlpha",
        "useSpecularOverAlpha"]
    } else if (materialType == "PBRMetallicRoughnessMaterial") {
      textureList = ["baseTexture", "metallicRoughnessTexture", "environmentTexture", "normalTexture", "emissiveTexture", "occlusionTexture"];
      baseList = {
        metallic: [0, 1, .001],
        roughness: [0, 1, .001],
        occlusionStrength: [0, 2, .001],
        alpha: [0, 1, .01]
      }
    } else if (materialType == "PBRSpecularGlossinessMaterial") {
      textureList = ["diffuseTexture", "specularGlossinessTexture", "environmentTexture", "normalTexture", "emissiveTexture", "occlusionTexture"];
      baseList = {
        glossiness: [0, 1, .001],
        occlusionStrength: [0, 2, .001],
        alpha: [0, 1, .01],
        _specularIntensity: [0, 100, .1]
      }
    }

    let initBase = () => {
      let PBRFolder = new BABYUI.Folder(materialType, folderTop);
      PBRFolder.open();
      //颜色
      if (material.diffuseColor && material.diffuseColor.toHexString) {
        this.showTitle(new BABYUI.Color(baseProCN.diffuseColor.cn, material.diffuseColor.toHexString(), function (value) {
          material.diffuseColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.diffuseColor.par, baseProCN.diffuseColor.exp);
      }
      if (material.specularColor && material.specularColor.toHexString) {
        this.showTitle(new BABYUI.Color(baseProCN.specularColor.cn, material.specularColor.toHexString(), function (value) {
          material.specularColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.specularColor.par, baseProCN.specularColor.exp);
      }
      if (material.baseColor && material.baseColor.toHexString) {
        this.showTitle(new BABYUI.Color(baseProCN.baseColor.cn, material.baseColor.toHexString(), function (value) {
          material.baseColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.baseColor.par, baseProCN.baseColor.exp);
      }
      if (material.albedoColor && material.albedoColor.toHexString) {
        this.showTitle(new BABYUI.Color(baseProCN.albedoColor.cn, material.albedoColor.toHexString(), function (value) {
          material.albedoColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.albedoColor.par, baseProCN.albedoColor.exp);
      }
      if (material.reflectivityColor && material.reflectivityColor.toHexString) {
        reflectivityColorControl = new BABYUI.Color(baseProCN.reflectivityColor.cn, material.reflectivityColor.toHexString(), function (value) {
          material.reflectivityColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder);
        this.showTitle(reflectivityColorControl, baseProCN.reflectivityColor.par, baseProCN.reflectivityColor.exp)
      }
      if (material.reflectionColor && material.reflectionColor.toHexString) {
        this.showTitle(new BABYUI.Color(baseProCN.reflectionColor.cn, material.reflectionColor.toHexString(), function (value) {
          material.reflectionColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.reflectionColor.par, baseProCN.reflectionColor.exp);
      }
      if (material.emissiveColor && material.emissiveColor.toHexString) {
        this.showTitle(new BABYUI.Color(baseProCN.emissiveColor.cn, material.emissiveColor.toHexString(), function (value) {
          material.emissiveColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.emissiveColor.par, baseProCN.emissiveColor.exp);
      }
      if (material.ambientColor && material.ambientColor.toHexString) {
        this.showTitle(new BABYUI.Color(baseProCN.ambientColor.cn, material.ambientColor.toHexString(), function (value) {
          material.ambientColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.ambientColor.par, baseProCN.ambientColor.exp);
      }
      //数值
      baseList.forEach((range, baseName) => {
        let control = new BABYUI.Slider(baseProCN[baseName].cn, material[baseName], range[0], range[1], range[2], function (value) {
          material[baseName] = value;
        }, PBRFolder)
        this.showTitle(control, baseProCN[baseName].par, baseProCN[baseName].exp);
        switch (baseName) {
          case "metallic":
            metallicControl = control;
            break;
          case "roughness":
            roughnessControl = control;
            break;
          case "microSurface":
            microSurfaceControl = control;
            break;
        }
      })

      //布尔
      boolList.forEach((boolName) => {
        let control = new BABYUI.Select(baseProCN[boolName].cn, material[boolName], [false, true], function (value) {
          material[boolName] = value == "true" ? true : false;
        }, PBRFolder);
        this.showTitle(control, baseProCN[boolName].par, baseProCN[boolName].exp);
      })
    }

    let initTexture = () => {
      //贴图
      let folder = new BABYUI.Folder("贴图", folderTop);
      textureList.forEach((textureName) => {
        let info = texturePro.filter(function (json) {
          return json.name == textureName;
        })[0];
        if (!info) {
          console.warn(textureName);
          return;
        }
        let cube = info.cube;
        let other = info.other;
        let intro = textureProCN[textureName].cn || textureName;
        let fresnel = info.fresnel;
        let textureNameOri = material[textureName] ? material[textureName].name : "";
        let picNameOri = null;
        if (material[textureName]) {
          picNameOri = this.getPicName(textureNameOri).picName;
        } else {
          picNameOri = "无"
        }
        let levelOri = material[textureName] ? material[textureName].level : 0;
        let usOri = material[textureName] ? material[textureName].uScale : 0;
        let vsOri = material[textureName] ? material[textureName].vScale : 0;
        let indexOri = material[textureName] ? material[textureName].coordinatesIndex : 0;
        let indexSelect = [0, 1, 2].filter(function (cor, index) {
          return index < uvNum;
        })
        let fresnelOri = material[fresnel] ? (material[fresnel].isEnabled ? "开" : "关") : "关";
        let biasOri = material[fresnel] ? material[fresnel].bias : 0;
        let powerOri = material[fresnel] ? material[fresnel].power : 0;
        let textureFolder = new BABYUI.Folder(intro, folder, true, (data, control) => {
          let picName = data.fileName;//"test.jpg"
          let path = data.path;// "/3ds/assets/materialLib/textures/"
          let type = data.type;// "skybox||texture"
          let panel = data.panel; //1,2,3,4
          let textureName = "private," + picName;
          if (panel === 1 || panel === 2) {
            textureName = "public," + picName
          }
          if (!material[info.name] || material[info.name].name != textureName) {
            if (cube) {
              let texture = this.createCubeTexture(path, picName, textureName);
              if (texture) {
                material[info.name] = texture;
                textureControl.value = picName;
                textureNameOri = texture.name
              }
            } else {
              if (type == "texture") {
                let texture = this.createTexture(path, picName, textureName);
                if (texture) {
                  material[info.name] = texture;
                  textureControl.value = picName;
                  textureNameOri = texture.name
                }
              } else {
                Tool.showMessage(intro + "不能贴天空盒...", 2, "danger");
              }
            }
            if (material[info.name]) {
              show();
            }
          }
        });
        this.showTitle(textureFolder, textureProCN[textureName].par, textureProCN[textureName].exp);
        let textureControl = new BABYUI.Message("贴图", picNameOri, textureFolder, true, null, (control) => {
          let picName = control.dom.find(".baby-message-box").html();
          let path = this.getPicName(textureNameOri);
          if (!path.path) {
            return;
          }
          let panel = null;
          if (path.path === "public" && path.picName.indexOf(".") !== -1) {
            panel = 1;
          } else if (path.path === "public" && path.picName.indexOf(".") === -1) {
            panel = 2;
          } else if (path.path === "private" && path.picName.indexOf(".") !== -1) {
            panel = 3;
          } else if (path.path === "private" && path.picName.indexOf(".") === -1) {
            panel = 4;
          }
          if (panel) {
            MultiDebug.exe("picModule", "scrollToPic", panel, picName)
          }
        }, (control) => {
          material[info.name] = null;
          control.value = "无";
          hide();
        }, (control) => {
          let texture = null;
          if (texture = this.initialTexture[material.name][info.name]) {
            material[info.name] = texture;
            control.value = "自带";
            show();
            Tool.showMessage("您成功贴上了自带纹理" + texture.name);
          } else {
            Tool.showMessage("该材质没有自带纹理,您贴不上", 1, "warn");
          }
        })
        textureControl.title = "点击事件：单击查看图片位置，双击删除纹理贴图，三击回到材质自带贴图(如果有的话)\n" + this.showTitle(textureControl, textureProCN[info.name].par, textureProCN[info.name].exp);
        //高亮提示
        textureFolder.dom.on("dragenter", function () {
          textureFolder.alert();
        })
        textureControl.dom.on("dragenter", function () {
          textureFolder.alert();
        })
        let levelControl = new BABYUI.Slider(otherProCN.level.cn, levelOri, 0, 5, .1, function (value) {
          if (!material[textureName]) {
            return;
          }
          material[textureName].level = value;
        }, textureFolder)
        this.showTitle(levelControl, otherProCN.level.par, otherProCN.level.exp);
        if (!cube) {
          var usControl = new BABYUI.Slider(otherProCN.uScale.cn, usOri, 0, 10, .1, function (value) {
            if (!material[textureName]) {
              return;
            }
            material[textureName].uScale = value;
          }, textureFolder)
          this.showTitle(usControl, otherProCN.uScale.par, otherProCN.uScale.exp);
          var vsControl = new BABYUI.Slider(otherProCN.vScale.cn, vsOri, 0, 10, .1, function (value) {
            if (!material[textureName]) {
              return;
            }
            material[textureName].vScale = value;
          }, textureFolder)
          this.showTitle(vsControl, otherProCN.vScale.par, otherProCN.vScale.exp);
        }
        let indexControl = new BABYUI.Select(otherProCN.coordinatesIndex.cn, indexOri, indexSelect, function (value) {
          if (!material[textureName]) {
            return;
          }
          let utemp = material[textureName].uScale;
          let vtemp = material[textureName].vScale;
          if (utemp == 1 && vtemp == 1) {
            material[textureName].uScale = 2;
            window.setTimeout(function () {
              material[textureName].coordinatesIndex = value - 0;
              material[textureName].uScale = utemp;
            }, 100)
          } else {
            material[textureName].coordinatesIndex = value - 0;
          }
        }, textureFolder)
        this.showTitle(indexControl, otherProCN.coordinatesIndex.par, otherProCN.coordinatesIndex.exp);
        //菲涅尔
        if (fresnel) {
          let fresnelControl = new BABYUI.Select(otherProCN.fresnel.cn, fresnelOri, ["开", "关"], function (value) {
            if (value == "开") {
              material[fresnel] = material[fresnel] || new BABYLON.FresnelParameters();
              material[fresnel].isEnabled = true;
              showFresnel();
            } else {
              material[fresnel].isEnabled = false;
              hideFresnel();
            }
          }, textureFolder);
          this.showTitle(fresnelControl, otherProCN.fresnel.par, otherProCN.fresnel.exp);
          var biasControl = new BABYUI.Slider(otherProCN.bias.cn, biasOri, 0, 1, .01, function (value) {
            if (material[fresnel]) {
              material[fresnel].bias = value;
            }
          }, textureFolder)
          this.showTitle(biasControl, otherProCN.bias.par, otherProCN.bias.exp);
          var powerControl = new BABYUI.Slider(otherProCN.power.cn, powerOri, 0, 30, .01, function (value) {
            if (material[fresnel]) {
              material[fresnel].power = value;
            }
          }, textureFolder)
          this.showTitle(powerControl, otherProCN.power.par, otherProCN.power.exp);
        }
        //法线贴图
        if (other) {
          var useParallaxControl = new BABYUI.Select(otherProCN.useParallax.cn, material.useParallax, [false, true], function (value) {
            if (!material[textureName]) {
              return;
            }
            material.useParallax = value == "false" ? false : true;
          }, textureFolder)
          this.showTitle(useParallaxControl, otherProCN.useParallax.par, otherProCN.useParallax.exp);
          var useParallaxOcclusionControl = new BABYUI.Select(otherProCN.useParallaxOcclusion.cn, material.useParallaxOcclusion, [false, true], function (value) {
            if (!material[textureName]) {
              return;
            }
            material.useParallaxOcclusion = value == "false" ? false : true;
          }, textureFolder)
          this.showTitle(useParallaxOcclusionControl, otherProCN.useParallaxOcclusion.par, otherProCN.useParallaxOcclusion.exp);
          var parallaxScaleBiasControl = new BABYUI.Slider(otherProCN.parallaxScaleBias.cn, material.parallaxScaleBias, 0, .5, .001, function (value) {
            if (!material[textureName]) {
              return;
            }
            material.parallaxScaleBias = value;
          }, textureFolder)
          this.showTitle(parallaxScaleBiasControl, otherProCN.parallaxScaleBias.par, otherProCN.parallaxScaleBias.exp);
        }

        function hide() {
          levelControl.hide();
          indexControl.hide();
          if (usControl) {
            usControl.hide();
          }
          if (vsControl) {
            vsControl.hide();
          }
          if (other) {
            useParallaxControl.hide();
            useParallaxOcclusionControl.hide();
            parallaxScaleBiasControl.hide();
          }
        }

        function show() {
          levelControl.show(material[textureName].level)
          indexControl.show(material[textureName].coordinatesIndex)
          if (usControl) {
            usControl.show(material[textureName].uScale)
          }
          if (vsControl) {
            vsControl.show(material[textureName].vScale)
          }
          if (other) {
            useParallaxControl.show(material.useParallax)
            useParallaxOcclusionControl.show(material.useParallaxOcclusion)
            parallaxScaleBiasControl.show(material.parallaxScaleBias)
          }
        }

        function hideFresnel() {
          biasControl && biasControl.hide();
          powerControl && powerControl.hide();
        }

        function showFresnel() {
          biasControl && biasControl.show(material[fresnel].bias);
          powerControl && powerControl.show(material[fresnel].power);
        }

        //如果没有贴图
        if (!material[textureName]) {
          hide();
        }
        //如果没有反射菲涅尔
        if (!material[fresnel] || !material[fresnel].isEnabled) {
          hideFresnel();
        }
      })
    }

    if (materialType == "PBRMaterial") {
      modeControl = new BABYUI.Select("当前PBR模式", checkPBRMode() ? "金属/粗糙度 模式" : "高光/光泽度 模式", ["高光/光泽度 模式", "金属/粗糙度 模式"], function (value) {
        if (value == "高光/光泽度 模式") {
          showMode0();
        } else {
          showMode1();
        }
      }, folderTop)
    }
    initBase();
    initTexture();
    if (materialType == "PBRMaterial") {
      if (checkPBRMode() == 0) {
        showMode0();
      } else {
        showMode1();
      }
    }
  }

  //复制粘贴材质
  copyMaterial(material, mesh) {
    if (material) {
      this.currentCopyMaterial = material;
      this.currentCopyMesh = mesh;
      Tool.showMessage("您已成功复制 [" + mesh.name + "] 的材质 [" + material.name + "]", 1);
      MultiDebug.exe("chatModule", "appendLogContentBuffer", "您已成功复制 [" + mesh.name + "] 的材质 [" + material.name + "]");
      this.currentCopyJSON = JSON.parse(createJSON(scene, {
        material: material,
        console: false,
        window: false
      })).materials[material.name]
    } else {
      Tool.showMessage(mesh.name + "没有材质...", 1, "danger");
    }
  }

  pasteMaterial(material, mesh) {
    if (this.currentCopyMaterial) {
      if (material) {
        Tool.showConfirm("您确定要将 [" + this.currentCopyMaterial.name + "] 复制给 [" + material.name + "] ?", () => {
          let json = {}
          json[material.name] = this.currentCopyJSON
          initSceneByJSON(scene, {
            appPath: MultiDebug.get("socketModule", "appLibPath"),
            publicPath: MultiDebug.get("socketModule", "publicLibPath"),
            materials: json
          }, material);
          //更新调试框
          if (MultiDebug.get("debugModule", "currentDebugMesh") == mesh) {
            MultiDebug.exe("debugModule", "showDebug", mesh);
            this.showDebug(mesh);
          }
          //更新日志
          Tool.showMessage("您成功将 [" + this.currentCopyMaterial.name + "] 复制给 [" + material.name + "]", 3);
          MultiDebug.exe("chatModule", "appendLogContentBuffer", "您成功将 [" + this.currentCopyMaterial.name + "] 复制给 [" + material.name + "]");
          //保存到服务器
          MultiDebug.exeI("debugModule", "onChange", mesh)
        })
      } else {
        Tool.showMessage("该物体没有材质...", 1, "danger");
      }
    } else {
      Tool.showMessage("您还没有复制材质...", 1, "danger");
    }
  }
}

class App {
  engine = null;
  canvas = null;
  hideMeshes = [];
  //class Outline
  outline = null;
  //class Light
  light = null;
  //class Material
  material = null;

  constructor(s) {
    scene = s;
    this.engine = scene.getEngine();
    this.canvas = this.engine.getRenderingCanvas();
    this.outline = new Outline();
    this.light = new Light();
    this.material = new Material();
  }

  //保存初始纹理
  storeInitialTexture() {
    scene.materials.forEach((material) => {
      texturePro.forEach((info) => {
        let textureName = info.name;
        if (material[textureName]) {
          //保存初始纹理
          if (!this.material.initialTexture[material.name]) {
            this.material.initialTexture[material.name] = {}
          }
          this.material.initialTexture[material.name][textureName] = material[textureName];
        }
      })
    })
    console.log("初始纹理：", this.material.initialTexture)
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
            title = "您正在调试..."
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

  showMesh(mesh) {
    if (!mesh) {
      return;
    }
    mesh.isVisible = true;
    this.hideMeshes = this.hideMeshes.filter(function (hideMesh) {
      return hideMesh != mesh;
    })
  }

  hideMesh(mesh) {
    if (!mesh) {
      return;
    }
    if (this.hideMeshes.indexOf(mesh) == -1) {
      this.hideMeshes.push(mesh)
      Tool.showMessage("您已经成功隐藏了" + mesh.name + "~~~", 1);
      MultiDebug.exe("chatModule", "appendLogContentBuffer", "您已经成功隐藏了" + mesh.name + "~~~");
    } else {
      Tool.showMessage("您之前已经隐藏了该物体~~~~", 1);
    }
    mesh.isVisible = false;
  }
}

export default App;