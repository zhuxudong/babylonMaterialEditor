function App(scene) {
  var _this = this;
  var initialTexture = {};
  var canvas = scene.getEngine().getRenderingCanvas();

  //物体材质灯光冲突检测
  function detectConfilict() {
    var existMesh = {};
    var existMaterial = {};
    var existLights = {};
    window.scene.meshes.forEach(function (mesh) {
      if (mesh._debug) {
        if (mesh.material) {
          mesh.material._debug = true;
        }
        return;
      }
      if (existMesh.hasOwnProperty(mesh.name)) {
        existMesh[mesh.name]++;
      } else {
        existMesh[mesh.name] = 1
      }
    })
    window.scene.materials.forEach(function (material) {
      if (material._debug) {
        return;
      }
      if (existMaterial.hasOwnProperty(material.name)) {
        existMaterial[material.name]++;
      } else {
        existMaterial[material.name] = 1
      }
    })
    window.scene.lights.forEach(function (light) {
      if (existLights.hasOwnProperty(light.name)) {
        existLights[light.name]++;
      } else {
        existLights[light.name] = 1;
      }
    })
    existMesh.forEach(function (number, meshName) {
      if (number > 1) {
        var message = "物体名字冲突:[" + meshName + "]存在 " + number + " 个";
        MultiDebug.Tool.showMessage(message, 2, "warn", null, null, 200);
        console.warn(message)
      }
    })
    existMaterial.forEach(function (number, materialName) {
      if (number > 1) {
        var message = "材质名字冲突:[" + materialName + "]存在 " + number + " 个";
        MultiDebug.Tool.showMessage(message, 2, "danger", null, null, 200);
        console.warn(message)
      }
    })
    existLights.forEach(function (number, lightName) {
      if (number > 1) {
        var message = "灯光名字冲突:[" + lightName + "]存在 " + number + " 个";
        MultiDebug.Tool.showMessage(message, 2, "danger", null, null, 200);
        console.warn(message);
      }
    })
  }

  //保存初始纹理
  this.storeInitialTexture = function () {
    if (!window.scene || !window.scene.materials) {
      return;
    }
    window.scene.materials.forEach(function (material) {
      texturePro.forEach(function (info) {
        var textureName = info.name;
        if (material[textureName]) {
          //保存初始纹理
          if (!initialTexture[material.name]) {
            initialTexture[material.name] = {}
          }
          initialTexture[material.name][textureName] = material[textureName];
        }
      })
    })
    console.log("初始纹理：", initialTexture)
  }
  //更新局域网列表，并更新debugInfo
  this.refreshLanList = function (noMessage, onsuccess) {
    var myName = MultiDebug.get("socketModule", "myName");
    var myIP = MultiDebug.get("socketModule", "myIP");
    var lockInfo = {};
    //获取锁定信息
    MultiDebug.exe("socketModule", "getServerData", "lockInfo", function (data) {
      lockInfo = data;
      //获取BABYLON当前mesh，刷新lanList
      if (BABYLON && window.scene) {
        MultiDebug.exe("lanModule", "refreshLanList", window.scene.meshes.map(function (mesh) {
          if (mesh._debug) {
            return null;
          }
          var name = mesh.name;
          var stat = null;
          var config = false;
          var title = null;
          if (lockInfo[mesh.name]) {
            if (lockInfo[mesh.name].userIP == myIP) {
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
        !noMessage && MultiDebug.Tool.showMessage("refresh success......", 1);
      }
      if (typeof onsuccess == "function") {
        onsuccess();
      }
    })

    _this.refreshDebug();
    detectConfilict();
  }
  //重新获取服务器调试信息，更新场景
  this.refreshDebug = function () {
    MultiDebug.exe("socketModule", "getServerData", "debugInfo", function (data) {
      console.log("服务器调试信息:", data)
      initSceneByJSON(data)
    })
  }
  //更新图库
  this.refreshPicPanel = function (noMessage) {
    MultiDebug.exe("socketModule", "getPicFileList", function (data) {
      console.log("图片库：", data);
      var publicTexture = data.publicTexture;
      var publicSkybox = data.publicSkybox;
      var privateTexture = data.privateTexture;
      var privateSkybox = data.privateSkybox;
      var appName = data.appName;
      //设置当前app名字
      MultiDebug.set("socketModule", "appName", appName);
      var panel1 = MultiDebug.get("picModule", "panel1");
      var panel2 = MultiDebug.get("picModule", "panel2");
      var panel3 = MultiDebug.get("picModule", "panel3");
      var panel4 = MultiDebug.get("picModule", "panel4");
      var publicTextureFix = MATERIALLIBFIX + "textures/";
      var publicSkyboxFix = MATERIALLIBFIX + "skyboxs/";
      var privateFix = APPFIX + appName + "/materialLib/";
      var privateTextureFix = privateFix + "textures/";
      var privateSkyboxFix = privateFix + "skyboxs/";
      MultiDebug.exe("picModule", "createTexturePanel", publicTexture, publicTextureFix, panel1);
      MultiDebug.exe("picModule", "createCubePanel", publicSkybox, publicSkyboxFix, panel2);
      MultiDebug.exe("picModule", "createTexturePanel", privateTexture, privateTextureFix, panel3);
      MultiDebug.exe("picModule", "createCubePanel", privateSkybox, privateSkyboxFix, panel4);
      !noMessage && MultiDebug.Tool.showMessage("更新图库成功...", 1)
    })
  }
  //更新BABYUI界面,默认更新所有，如果有current参数，则只更新current调试界面
  this.refreshDebugUI = function (current) {
    var currentDebugMesh = MultiDebug.get("debugModule", "currentDebugMesh");
    if (currentDebugMesh) {
      var light = currentDebugMesh instanceof BABYLON.Light;
      if (light) {
        if (!current || (current && current == currentDebugMesh)) {
          MultiDebug.exe("debugModule", "showLightDebug", currentDesaveDebugInfobugMesh);
          _this.showLightDebug(currentDebugMesh);
        }
      } else {
        if (!current || (current && current == currentDebugMesh)) {
          MultiDebug.exe("debugModule", "showDebug", currentDebugMesh)
          _this.showDebug(currentDebugMesh);
        }
      }
    }
  }
  //将当前调试的物体或者灯光的数据信息保存到服务器
  this.saveDebugInfo = function (debugMesh) {
    MultiDebug.exeA("debugModule", "onChange", debugMesh)
  }

  function resize() {
    window.scene.getEngine().resize();
  }

  //浏览模式，调试模式
  var debugMode = false;
  this.debugMode = null;
  this.viewMode = null;
  this.setOutlineWidth = null;
  this.getOutlineWidth = null;
  this.renderMesh = null;
  this.unrenderMesh = null;

  function debugModeModule() {
    var press = false;
    var currentOutlineMesh = null;
    var hightlight = new BABYLON.HighlightLayer("debug", window.scene);
    var outlineColor = new BABYLON.Color3.FromHexString("#ff254c");
    var outlineWidth = 1;

    function onmousemove() {
      if (press) {
        return;
      }
      var pickInfo = window.scene.pick(window.scene.pointerX, window.scene.pointerY);

      var pickedMesh = pickInfo.pickedMesh;
      if (!pickedMesh && currentOutlineMesh) {
        _this.unrenderMesh(currentOutlineMesh);
      }
      if (pickedMesh) {
        _this.renderMesh(pickedMesh);
      }
    }

    function onmouseup(e) {
      var button = e.event.button;//0,1,2
      press = false;
      var pickedMesh = e.pickInfo.pickedMesh;
      if (pickedMesh) {
        if (pickedMesh.li) {
          MultiDebug.exe("lanModule", "scrollToLi", pickedMesh.li);
          if (pickedMesh.li[0].data.stat != "danger") {
            //左键将副菜单栏显示在局域网栏
            //if (button == 0) {
            //    MultiDebug.exe("lanModule", "showSubMenu", pickedMesh.li, {
            //        src: pickedMesh.li
            //    })
            //} else
            if (button == 2) {
              //右键将副菜单栏显示在物体上面；
              MultiDebug.exe("lanModule", "showSubMenu", pickedMesh.li, {
                src: pickedMesh.li
              }, e.event.clientX + 20, e.event.clientY)
            }
          }
        }
      }
    }

    function onmousedown() {
      press = true;
    }

    function unregisterEvents() {
      window.scene.onPointerObservable.removeCallback(onmousemove);
      window.scene.onPointerObservable.removeCallback(onmousedown);
      window.scene.onPointerObservable.removeCallback(onmouseup);
    }

    _this.debugMode = function () {
      resize();
      unregisterEvents();
      window.scene.onPointerObservable.add(onmousemove, 4);
      window.scene.onPointerObservable.add(onmousedown, 1);
      window.scene.onPointerObservable.add(onmouseup, 2);
      //还原
      MultiDebug.exe("lanModule", "scale1");
      MultiDebug.exe("picModule", "scale1");
      MultiDebug.get("menuModule", "navTop") && MultiDebug.get("menuModule", "navTop").removeClass("opacity");
      debugMode = true;
    }
    _this.viewMode = function () {
      _this.unrenderMesh(currentOutlineMesh);
      unregisterEvents();
      //关闭调试窗口
      disposeLightDebug();
      //缩小
      MultiDebug.exe("lanModule", "scale0");
      MultiDebug.exe("picModule", "scale0");
      MultiDebug.get("menuModule", "navTop").addClass("opacity");
      debugMode = false;

    }
    _this.setOutlineWidth = function (num) {
      outlineWidth = Number(num);
      MultiDebug.Tool.showMessage("描边粗细已经调整到 " + num, 1);
    }
    _this.getOutlineWidth = function () {
      return outlineWidth;
    }
    _this.renderMesh = function (mesh) {
      if (!mesh || !mesh.geometry) {
        return;
      }
      hightlight.blurHorizontalSize = outlineWidth;
      hightlight.blurVerticalSize = outlineWidth;
      if (mesh != currentOutlineMesh) {
        hightlight.addMesh(mesh, outlineColor)
        if (currentOutlineMesh) {
          hightlight.removeMesh(currentOutlineMesh)
        }
        currentOutlineMesh = mesh;

      }
    }
    _this.unrenderMesh = function (mesh) {
      if (!mesh) {
        return;
      }
      hightlight.removeMesh(mesh);
      currentOutlineMesh = null;
      if (currentOutlineMesh) {
        hightlight.removeMesh(currentOutlineMesh)
      }
    }
  }

  debugModeModule();

  //标准材质
  function getPicPath(str) {
    if (!str) {
      return {};
    }
    //var path = str.match(/(?<=path:).*(?=,)/g);
    //var picName = str.match(/(?<=name:).*$/g);
    var path = str.match(/path:.*?(?=,)/g);
    var picName = str.match(/name:.*?$/g);
    if (path && path.length == 1) {
      path = path[0].slice(5);
    } else {
      path = null;
    }
    if (picName && picName.length == 1) {
      picName = picName[0].slice(5);
    } else {
      picName = null;
    }
    return {
      path: path,
      picName: picName
    }
  }

  //立方体纹理
  function createCubeTexture(path, picName, textureName) {
    var texture = null;
    var type = "skybox";//"skybox,dds,hdr,ktx"
    var index = picName.lastIndexOf(".");
    if (index != -1) {
      type = picName.slice(index + 1);
    }
    if (type == "skybox") {
      texture = new BABYLON.CubeTexture(path + picName + "/" + picName, window.scene);
    } else if (type == "dds") {
      try {
        if (BABYLON.CubeTexture.CreateFromPrefilteredData) {
          texture = BABYLON.CubeTexture.CreateFromPrefilteredData(path + picName, window.scene);
        } else {
          MultiDebug.Tool.showMessage("您当前的BABYLON版本并不支持DDS格式，请更换最新版本的BABYLON", 2, "danger");
        }
      } catch (e) {
        console.warn(e);
      }
    } else if (type == "hdr") {
      texture = new BABYLON.HDRCubeTexture(path + picName, window.scene, 256)
    } else {
      MultiDebug.Tool.showMessage(picName + ":立方体纹理不支持这种格式", 2, "warn");
    }
    if (texture) {
      texture.name = textureName;
    }
    return texture;
  }

  //平面纹理
  function createTexture(path, picName, textureName) {
    var texture = new BABYLON.Texture(path + picName, window.scene);
    if (texture) {
      texture.name = textureName;
    }
    return texture;
  }

  function showTitle(control, par, exp) {
    control.title = (par ? ("参数介绍:" + par) : "") + (exp ? ("\n调试经验:" + exp) : "");
    return control.title;
  }

  //标准材质
  this.showStandardMaterial = function (material, folderTop, uvNum) {

    function initBase() {
      var folder = new BABYUI.Folder(material.getClassName(), folderTop);
      showTitle(new BABYUI.Color(baseProCN.diffuseColor.cn, material.diffuseColor.toHexString(), function (value) {
        material.diffuseColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder), baseProCN.diffuseColor.par, baseProCN.diffuseColor.exp);
      showTitle(new BABYUI.Color(baseProCN.emissiveColor.cn, material.emissiveColor.toHexString(), function (value) {
        material.emissiveColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder), baseProCN.emissiveColor.par, baseProCN.emissiveColor.exp)
      showTitle(new BABYUI.Color(baseProCN.specularColor.cn, material.specularColor.toHexString(), function (value) {
        material.specularColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder), baseProCN.specularColor.par, baseProCN.specularColor.exp);
      showTitle(new BABYUI.Color(baseProCN.ambientColor.cn, material.ambientColor.toHexString(), function (value) {
        material.ambientColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder), baseProCN.ambientColor.par, baseProCN.ambientColor.exp);
      showTitle(new BABYUI.Slider(baseProCN.specularPower.cn, material.specularPower, 0, 100, 1, function (value) {
        material.specularPower = value;
      }, folder), baseProCN.specularPower.par, baseProCN.specularPower.exp);
      showTitle(new BABYUI.Slider("模糊度", material.roughness, 0, 10, .1, function (value) {
        material.roughness = value;
      }, folder), baseProCN.roughness.par, baseProCN.roughness.exp);
      showTitle(new BABYUI.Slider(baseProCN.alpha.cn, material.alpha, 0, 1, .01, function (value) {
        material.alpha = value;
      }, folder), baseProCN.alpha.par, baseProCN.alpha.exp);
    }

    function initTexture() {
      //贴图
      var folder = new BABYUI.Folder("贴图", folderTop);
      texturePro.forEach(function (info) {
        var list = ["diffuseTexture", "reflectionTexture", "refractionTexture", "opacityTexture", "emissiveTexture", "specularTexture", "bumpTexture", "ambientTexture"]
        if (list.indexOf(info.name) == -1) {
          return;
        }
        var cube = info.cube;
        var other = info.other;
        //属性中文版本
        var intro = textureProCN[info.name].cn || info.name;
        var fresnel = info.fresnel;
        var textureNameOri = material[info.name] ? material[info.name].name : "";
        var picNameOri = null;
        if (material[info.name]) {
          picNameOri = getPicPath(textureNameOri).picName || "自带";
        } else {
          picNameOri = "无"
        }
        var levelOri = material[info.name] ? material[info.name].level : 0;
        var usOri = material[info.name] ? material[info.name].uScale : 0;
        var vsOri = material[info.name] ? material[info.name].vScale : 0;
        var indexOri = material[info.name] ? material[info.name].coordinatesIndex : 0;
        var indexSelect = [0, 1, 2].filter(function (cor, index) {
          return index < uvNum;
        })
        var fresnelOri = material[fresnel] ? (material[fresnel].isEnabled ? "开" : "关") : "关";
        var biasOri = material[fresnel] ? material[fresnel].bias : 0;
        var powerOri = material[fresnel] ? material[fresnel].power : 0;

        var textureFolder = new BABYUI.Folder(intro, folder, true, function (data, control) {
          var path = data.path;// "/3ds/assets/materialLib/textures/"
          var picName = data.fileName;//"test.jpg"
          var type = data.type;// "skybox||texture"
          var panel = data.panel; //1,2,3,4
          var textureName = "path:" + path + ",name:" + picName;
          if (!material[info.name] || material[info.name].name != textureName) {
            if (cube) {
              var texture = createCubeTexture(path, picName, textureName);
              if (texture) {
                material[info.name] = texture;
                textureControl.value = picName;
              }
            } else {
              if (type == "texture") {
                var texture = createTexture(path, picName, textureName);
                if (texture) {
                  material[info.name] = texture;
                  textureControl.value = picName;
                }
              } else {
                MultiDebug.Tool.showMessage(intro + "不能贴天空盒...", 2, "danger");
              }
            }
            if (material[info.name]) {
              show();
            }
          }
        });
        showTitle(textureFolder, textureProCN[info.name].par, textureProCN[info.name].exp);
        var textureControl = new BABYUI.Message("贴图", picNameOri, textureFolder, true, null, function (control) {
          var picName = control.dom.find(".baby-message-box").html();
          var path = getPicPath(textureNameOri).path;
          if (!path) {
            return;
          }
          var panel = null;
          if (path == MATERIALLIBFIX + "textures/") {
            panel = 1;
          } else if (path == MATERIALLIBFIX + "skyboxs/") {
            panel = 2;
          } else if (path.indexOf("/textures/")) {
            panel = 3;
          } else if (path.indexOf("/skyboxs/")) {
            panel = 4;
          }
          if (panel) {
            MultiDebug.exe("picModule", "scrollToPic", panel, picName)
          }
        }, function (control) {
          material[info.name] = null;
          control.value = "无";
          hide();
        }, function (control) {
          var texture = null;
          if (!initialTexture[material.name]) {
            MultiDebug.Tool.showMessage("该材质没有自带纹理,您贴不上", 1, "warn");
          }
          if (texture = initialTexture[material.name][info.name]) {
            material[info.name] = texture;
            control.value = "自带";
            show();
            MultiDebug.Tool.showMessage("您成功贴上了自带纹理" + texture.name);
          } else {
            MultiDebug.Tool.showMessage("该材质没有自带纹理,您贴不上", 1, "warn");
          }
        })
        textureControl.title = "点击事件：单击查看图片位置，双击删除纹理贴图，三击回到材质自带贴图(如果有的话)\n" + showTitle(textureControl, textureProCN[info.name].par, textureProCN[info.name].exp);
        textureFolder.dom.on("dragenter", function () {
          textureFolder.alert();
        })
        textureControl.dom.on("dragenter", function () {
          textureFolder.alert();
        })
        var levelControl = new BABYUI.Slider(otherProCN.level.cn, levelOri, 0, 5, .1, function (value) {
          if (!material[info.name]) {
            return;
          }
          material[info.name].level = value;
        }, textureFolder)
        showTitle(levelControl, otherProCN.level.par, otherProCN.level.exp);
        if (!cube) {
          var usControl = new BABYUI.Slider(otherProCN.uScale.cn, usOri, 0, 10, .1, function (value) {
            if (!material[info.name]) {
              return;
            }
            material[info.name].uScale = value;
          }, textureFolder)
          showTitle(usControl, otherProCN.uScale.par, otherProCN.uScale.exp);
          var vsControl = new BABYUI.Slider(otherProCN.vScale.cn, vsOri, 0, 10, .1, function (value) {
            if (!material[info.name]) {
              return;
            }
            material[info.name].vScale = value;
          }, textureFolder)
          showTitle(vsControl, otherProCN.vScale.par, otherProCN.vScale.exp);
        }
        var indexControl = new BABYUI.Select(otherProCN.coordinatesIndex.cn, indexOri, indexSelect, function (value) {
          if (!material[info.name]) {
            return;
          }
          //BABYLON当UVscale为1时候切换通道没反应
          var utemp = material[info.name].uScale;
          var vtemp = material[info.name].vScale;
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
        showTitle(indexControl, otherProCN.coordinatesIndex.par, otherProCN.coordinatesIndex.exp);
        //菲涅尔
        if (fresnel) {
          var fresnelControl = new BABYUI.Select(otherProCN.fresnel.cn, fresnelOri, ["开", "关"], function (value) {
            if (value == "开") {
              material[fresnel] = material[fresnel] || new BABYLON.FresnelParameters();
              material[fresnel].isEnabled = true;
              showFresnel();
            } else {
              material[fresnel].isEnabled = false;
              hideFresnel();
            }
          }, textureFolder)
          showTitle(fresnelControl, otherProCN.fresnel.par, otherProCN.fresnel.exp);
          var biasControl = new BABYUI.Slider(otherProCN.bias.cn, biasOri, 0, 1, .01, function (value) {
            if (material[fresnel]) {
              material[fresnel].bias = value;
            }
          }, textureFolder)
          showTitle(biasControl, otherProCN.bias.par, otherProCN.bias.exp);
          var powerControl = new BABYUI.Slider(otherProCN.power.cn, powerOri, 0, 30, .01, function (value) {
            if (material[fresnel]) {
              material[fresnel].power = value;
            }
          }, textureFolder)
          showTitle(powerControl, otherProCN.power.par, otherProCN.power.exp);
        }
        //法线贴图
        if (other) {
          var useParallaxControl = new BABYUI.Select(otherProCN.useParallax.cn, material.useParallax, [false, true], function (value) {
            if (!material[info.name]) {
              return;
            }
            material.useParallax = value == "false" ? false : true;
          }, textureFolder)
          showTitle(useParallaxControl, otherProCN.useParallax.par, otherProCN.useParallax.exp);
          var useParallaxOcclusionControl = new BABYUI.Select(otherProCN.useParallaxOcclusion.cn, material.useParallaxOcclusion, [false, true], function (value) {
            if (!material[info.name]) {
              return;
            }
            material.useParallaxOcclusion = value == "false" ? false : true;
          }, textureFolder)
          showTitle(useParallaxOcclusionControl, otherProCN.useParallaxOcclusion.par, otherProCN.useParallaxOcclusion.exp);
          var parallaxScaleBiasControl = new BABYUI.Slider(otherProCN.parallaxScaleBias.cn, material.parallaxScaleBias, 0, .5, .001, function (value) {
            if (!material[info.name]) {
              return;
            }
            material.parallaxScaleBias = value;
          }, textureFolder)
          showTitle(parallaxScaleBiasControl, otherProCN.parallaxScaleBias.par, otherProCN.parallaxScaleBias.exp);
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

    function initWater() {
      var folder = new BABYUI.Folder("水", folderTop);
      showTitle(new BABYUI.Color("waterColor", material.waterColor.toHexString(), function (value) {
        material.waterColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
      }, folder));
      showTitle(new BABYUI.Slider("windForce", material.windForce, 0, 10, .01, function (value) {
        material.windForce = value;
      }, folder));
      showTitle(new BABYUI.Slider("waveSpeed", material.waveSpeed, 0, 100, .01, function (value) {
        material.waveSpeed = value;
      }, folder));
      showTitle(new BABYUI.Slider("bumpHeight", material.bumpHeight, 0, 10, .01, function (value) {
        material.bumpHeight = value;
      }, folder));
      showTitle(new BABYUI.Slider("waveLength", material.waveLength, 0, 1000, .01, function (value) {
        material.waveLength = value;
      }, folder))
      showTitle(new BABYUI.Slider("colorBlendFactor", material.colorBlendFactor, 0, 1, .01, function (value) {
        material.colorBlendFactor = value;
      }, folder));
      showTitle(new BABYUI.Slider(baseProCN.alpha.cn, material.alpha, 0, 1, .01, function (value) {
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
  this.showPBRMaterial = function (material, folderTop, uvNum) {
    var materialType = material.getClassName();
    var textureList = null;
    var baseList = {};
    var boolList = [];
    var reflectivityColorControl = null;
    var metallicControl = null;
    var roughnessControl = null;
    var microSurfaceControl = null;
    var currentMetallic = null;
    var currentRoughness = null;

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

    function initBase() {
      var PBRFolder = new BABYUI.Folder(materialType, folderTop);
      PBRFolder.open();
      //颜色
      if (material.diffuseColor && material.diffuseColor.toHexString) {
        showTitle(new BABYUI.Color(baseProCN.diffuseColor.cn, material.diffuseColor.toHexString(), function (value) {
          material.diffuseColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.diffuseColor.par, baseProCN.diffuseColor.exp);
      }
      if (material.specularColor && material.specularColor.toHexString) {
        showTitle(new BABYUI.Color(baseProCN.specularColor.cn, material.specularColor.toHexString(), function (value) {
          material.specularColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.specularColor.par, baseProCN.specularColor.exp);
      }
      if (material.baseColor && material.baseColor.toHexString) {
        showTitle(new BABYUI.Color(baseProCN.baseColor.cn, material.baseColor.toHexString(), function (value) {
          material.baseColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.baseColor.par, baseProCN.baseColor.exp);
      }
      if (material.albedoColor && material.albedoColor.toHexString) {
        showTitle(new BABYUI.Color(baseProCN.albedoColor.cn, material.albedoColor.toHexString(), function (value) {
          material.albedoColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.albedoColor.par, baseProCN.albedoColor.exp);
      }
      if (material.reflectivityColor && material.reflectivityColor.toHexString) {
        reflectivityColorControl = new BABYUI.Color(baseProCN.reflectivityColor.cn, material.reflectivityColor.toHexString(), function (value) {
          material.reflectivityColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder);
        showTitle(reflectivityColorControl, baseProCN.reflectivityColor.par, baseProCN.reflectivityColor.exp)
      }
      if (material.reflectionColor && material.reflectionColor.toHexString) {
        showTitle(new BABYUI.Color(baseProCN.reflectionColor.cn, material.reflectionColor.toHexString(), function (value) {
          material.reflectionColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.reflectionColor.par, baseProCN.reflectionColor.exp);
      }
      if (material.emissiveColor && material.emissiveColor.toHexString) {
        showTitle(new BABYUI.Color(baseProCN.emissiveColor.cn, material.emissiveColor.toHexString(), function (value) {
          material.emissiveColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.emissiveColor.par, baseProCN.emissiveColor.exp);
      }
      if (material.ambientColor && material.ambientColor.toHexString) {
        showTitle(new BABYUI.Color(baseProCN.ambientColor.cn, material.ambientColor.toHexString(), function (value) {
          material.ambientColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        }, PBRFolder), baseProCN.ambientColor.par, baseProCN.ambientColor.exp);
      }
      //数值
      baseList.forEach(function (range, baseName) {
        var control = new BABYUI.Slider(baseProCN[baseName].cn, material[baseName], range[0], range[1], range[2], function (value) {
          material[baseName] = value;
        }, PBRFolder)
        showTitle(control, baseProCN[baseName].par, baseProCN[baseName].exp);
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
      boolList.forEach(function (boolName) {
        var control = new BABYUI.Select(baseProCN[boolName].cn, material[boolName], [false, true], function (value) {
          material[boolName] = value == "true" ? true : false;
        }, PBRFolder);
        showTitle(control, baseProCN[boolName].par, baseProCN[boolName].exp);
      })
    }

    function initTexture() {
      //贴图
      var folder = new BABYUI.Folder("贴图", folderTop);
      textureList.forEach(function (textureName) {
        var info = texturePro.filter(function (json) {
          return json.name == textureName;
        })[0];
        if (!info) {
          console.warn(textureName);
          return;
        }
        var cube = info.cube;
        var other = info.other;
        var intro = textureProCN[textureName].cn || textureName;
        var fresnel = info.fresnel;
        var textureNameOri = material[textureName] ? material[textureName].name : "";
        var picNameOri = null;
        if (material[textureName]) {
          picNameOri = getPicPath(textureNameOri).picName || "自带";
        } else {
          picNameOri = "无"
        }
        var levelOri = material[textureName] ? material[textureName].level : 0;
        var usOri = material[textureName] ? material[textureName].uScale : 0;
        var vsOri = material[textureName] ? material[textureName].vScale : 0;
        var indexOri = material[textureName] ? material[textureName].coordinatesIndex : 0;
        var indexSelect = [0, 1, 2].filter(function (cor, index) {
          return index < uvNum;
        })
        var fresnelOri = material[fresnel] ? (material[fresnel].isEnabled ? "开" : "关") : "关";
        var biasOri = material[fresnel] ? material[fresnel].bias : 0;
        var powerOri = material[fresnel] ? material[fresnel].power : 0;
        var textureFolder = new BABYUI.Folder(intro, folder, true, function (data, control) {
          var picName = data.fileName;//"test.jpg"
          var path = data.path;// "/3ds/assets/materialLib/textures/"
          var type = data.type;// "skybox||texture"
          var panel = data.panel; //1,2,3,4
          var textureName = "path:" + path + ",name:" + picName;
          if (!material[info.name] || material[info.name].name != textureName) {
            if (cube) {
              var texture = createCubeTexture(path, picName, textureName);
              if (texture) {
                material[info.name] = texture;
                textureControl.value = picName;
              }
            } else {
              if (type == "texture") {
                var texture = createTexture(path, picName, textureName);
                if (texture) {
                  material[info.name] = texture;
                  textureControl.value = picName;
                }
              } else {
                MultiDebug.Tool.showMessage(intro + "不能贴天空盒...", 2, "danger");
              }
            }
            if (material[info.name]) {
              show();
            }
          }
        });
        showTitle(textureFolder, textureProCN[textureName].par, textureProCN[textureName].exp);
        var textureControl = new BABYUI.Message("贴图", picNameOri, textureFolder, true, null, function (control) {
          var picName = control.dom.find(".baby-message-box").html();
          var path = getPicPath(textureNameOri).path;
          if (!path) {
            return;
          }
          var panel = null;
          if (path == MATERIALLIBFIX + "textures/") {
            panel = 1;
          } else if (path == MATERIALLIBFIX + "skyboxs/") {
            panel = 2;
          } else if (path.indexOf("/textures/") != -1) {
            panel = 3;
          } else if (path.indexOf("/skyboxs/") != -1) {
            panel = 4;
          }
          if (panel) {
            MultiDebug.exe("picModule", "scrollToPic", panel, picName)
          }
        }, function (control) {
          material[info.name] = null;
          control.value = "无";
          hide();
        }, function (control) {
          var texture = null;
          if (texture = initialTexture[material.name][info.name]) {
            material[info.name] = texture;
            control.value = "自带";
            show();
            MultiDebug.Tool.showMessage("您成功贴上了自带纹理" + texture.name);
          } else {
            MultiDebug.Tool.showMessage("该材质没有自带纹理,您贴不上", 1, "warn");
          }
        })
        textureControl.title = "点击事件：单击查看图片位置，双击删除纹理贴图，三击回到材质自带贴图(如果有的话)\n" + showTitle(textureControl, textureProCN[info.name].par, textureProCN[info.name].exp);
        //高亮提示
        textureFolder.dom.on("dragenter", function () {
          textureFolder.alert();
        })
        textureControl.dom.on("dragenter", function () {
          textureFolder.alert();
        })
        var levelControl = new BABYUI.Slider(otherProCN.level.cn, levelOri, 0, 5, .1, function (value) {
          if (!material[textureName]) {
            return;
          }
          material[textureName].level = value;
        }, textureFolder)
        showTitle(levelControl, otherProCN.level.par, otherProCN.level.exp);
        if (!cube) {
          var usControl = new BABYUI.Slider(otherProCN.uScale.cn, usOri, 0, 10, .1, function (value) {
            if (!material[textureName]) {
              return;
            }
            material[textureName].uScale = value;
          }, textureFolder)
          showTitle(usControl, otherProCN.uScale.par, otherProCN.uScale.exp);
          var vsControl = new BABYUI.Slider(otherProCN.vScale.cn, vsOri, 0, 10, .1, function (value) {
            if (!material[textureName]) {
              return;
            }
            material[textureName].vScale = value;
          }, textureFolder)
          showTitle(vsControl, otherProCN.vScale.par, otherProCN.vScale.exp);
        }
        var indexControl = new BABYUI.Select(otherProCN.coordinatesIndex.cn, indexOri, indexSelect, function (value) {
          if (!material[textureName]) {
            return;
          }
          var utemp = material[textureName].uScale;
          var vtemp = material[textureName].vScale;
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
        showTitle(indexControl, otherProCN.coordinatesIndex.par, otherProCN.coordinatesIndex.exp);
        //菲涅尔
        if (fresnel) {
          var fresnelControl = new BABYUI.Select(otherProCN.fresnel.cn, fresnelOri, ["开", "关"], function (value) {
            if (value == "开") {
              material[fresnel] = material[fresnel] || new BABYLON.FresnelParameters();
              material[fresnel].isEnabled = true;
              showFresnel();
            } else {
              material[fresnel].isEnabled = false;
              hideFresnel();
            }
          }, textureFolder);
          showTitle(fresnelControl, otherProCN.fresnel.par, otherProCN.fresnel.exp);
          var biasControl = new BABYUI.Slider(otherProCN.bias.cn, biasOri, 0, 1, .01, function (value) {
            if (material[fresnel]) {
              material[fresnel].bias = value;
            }
          }, textureFolder)
          showTitle(biasControl, otherProCN.bias.par, otherProCN.bias.exp);
          var powerControl = new BABYUI.Slider(otherProCN.power.cn, powerOri, 0, 30, .01, function (value) {
            if (material[fresnel]) {
              material[fresnel].power = value;
            }
          }, textureFolder)
          showTitle(powerControl, otherProCN.power.par, otherProCN.power.exp);
        }
        //法线贴图
        if (other) {
          var useParallaxControl = new BABYUI.Select(otherProCN.useParallax.cn, material.useParallax, [false, true], function (value) {
            if (!material[textureName]) {
              return;
            }
            material.useParallax = value == "false" ? false : true;
          }, textureFolder)
          showTitle(useParallaxControl, otherProCN.useParallax.par, otherProCN.useParallax.exp);
          var useParallaxOcclusionControl = new BABYUI.Select(otherProCN.useParallaxOcclusion.cn, material.useParallaxOcclusion, [false, true], function (value) {
            if (!material[textureName]) {
              return;
            }
            material.useParallaxOcclusion = value == "false" ? false : true;
          }, textureFolder)
          showTitle(useParallaxOcclusionControl, otherProCN.useParallaxOcclusion.par, otherProCN.useParallaxOcclusion.exp);
          var parallaxScaleBiasControl = new BABYUI.Slider(otherProCN.parallaxScaleBias.cn, material.parallaxScaleBias, 0, .5, .001, function (value) {
            if (!material[textureName]) {
              return;
            }
            material.parallaxScaleBias = value;
          }, textureFolder)
          showTitle(parallaxScaleBiasControl, otherProCN.parallaxScaleBias.par, otherProCN.parallaxScaleBias.exp);
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
      var modeControl = new BABYUI.Select("当前PBR模式", checkPBRMode() ? "金属/粗糙度 模式" : "高光/光泽度 模式", ["高光/光泽度 模式", "金属/粗糙度 模式"], function (value) {
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
  //显示调试框
  this.showDebug = function (mesh) {
    if (!mesh || !mesh.material) {
      return;
    }
    var materialType = mesh.material.getClassName();
    var folder = new BABYUI.Folder("物体:[" + mesh.name + "]  材质:[" + mesh.material.name + "]");
    var uvNum = mesh.getVerticesDataKinds().join().match(/uv/g);
    uvNum = uvNum ? uvNum.length : 0;
    if (materialType == "StandardMaterial" || materialType == "WaterMaterial") {
      _this.showStandardMaterial(mesh.material, folder, uvNum);
    } else if (mesh.material instanceof BABYLON.PBRBaseMaterial) {
      _this.showPBRMaterial(mesh.material, folder, uvNum);
    }
  }
  var currentCopyMaterial = null;
  var currentCopyJSON = null;
  var currentCopyMesh = null;
  //复制粘贴材质
  this.copyMaterial = function (material, mesh) {
    if (material) {
      currentCopyMaterial = material;
      currentCopyMesh = mesh;
      MultiDebug.Tool.showMessage("您已成功复制 [" + mesh.name + "] 的材质 [" + material.name + "]", 1);
      MultiDebug.exe("chatModule", "appendLogContentBuffer", "您已成功复制 [" + mesh.name + "] 的材质 [" + material.name + "]");
      currentCopyJSON = JSON.parse(createJSON({material: material, console: false})).materials[material.name];
    } else {
      MultiDebug.Tool.showMessage(mesh.name + "没有材质...", 1, "danger");
    }
  }
  this.pasteMaterial = function (material, mesh) {
    if (currentCopyMaterial) {
      if (material) {
        MultiDebug.Tool.showConfirm("您确定要将 [" + currentCopyMaterial.name + "] 复制给 [" + material.name + "] ?", function () {
          initSceneByJSON(currentCopyJSON, material);
          //更新调试框
          if (MultiDebug.get("debugModule", "currentDebugMesh") == mesh) {
            MultiDebug.exe("debugModule", "showDebug", mesh);
            _this.showDebug(mesh);
          }
          //更新日志
          MultiDebug.Tool.showMessage("您成功将 [" + currentCopyMaterial.name + "] 复制给 [" + material.name + "]", 3);
          MultiDebug.exe("chatModule", "appendLogContentBuffer", "您成功将 [" + currentCopyMaterial.name + "] 复制给 [" + material.name + "]");
          //保存到服务器
          MultiDebug.exeA("debugModule", "onChange", mesh)
        })
      } else {
        MultiDebug.Tool.showMessage("该物体没有材质...", 1, "danger");
      }
    } else {
      MultiDebug.Tool.showMessage("您还没有复制材质...", 1, "danger");
    }
  }
  //获取材质类型列表
  var materialTypeList = ["StandardMaterial", "PBRMaterial", "PBRMetallicRoughnessMaterial", "PBRSpecularGlossinessMaterial"]
  this.getMaterialTypeList = function () {
    return materialTypeList
  }
  //转换物体的材质类型
  this.toggleMaterialType =  function (mesh, materialType) {
    if (BABYLON[materialType]) {
      var oriMaterial = mesh.material;
      mesh.material = new BABYLON[materialType](mesh.material.name, window.scene);
      var currentMaterial = mesh.material;
      //删除原来的材质
      window.scene.meshes.forEach(function (mesh) {
        if (mesh.material && mesh.material == oriMaterial) {
          mesh.material = currentMaterial;
          return true;
        }
      })
      oriMaterial.dispose();
      //更新调试窗口
      _this.refreshDebugUI(mesh);
      //保存当前调试物体的数据到服务器
      _this.saveDebugInfo(mesh);
      MultiDebug.Tool.showMessage("成功转化成 " + materialType + " 材质类型")
    } else {
      MultiDebug.Tool.showMessage("您当前BABYLON版本不支持 " + materialType + " 材质类型", 1, "warn");
    }
  }
  //导出材质
  this.exportMaterial = function (material) {
    if (!material) {
      return;
    }
    //获取材质库列表
    MultiDebug.exe("socketModule", "getMaterialLibFileList", "lib", function (dirList) {
      show(dirList);
    })

    //显示导出材质库界面
    function show(dirList) {
      MultiDebug.Tool.showDoublePrompt("材质库名字:", "材质库类别:", function (name, tag) {
        save(name, tag);
        end();
      }, function () {
        end();
      }, false, dirList)
    }

    //保存材质库文件
    function save(name, tag) {
      var json = createJSON({material: material, console: false})
      json = JSON.parse(json);
      json = json.materials[material.name];
      json.name = name;
      json.tag = tag;
      json = JSON.stringify(json);
      MultiDebug.exe("socketModule", "saveMaterialLibFile", "lib/lib_" + name, json);
      MultiDebug.Tool.showMessage("成功导出材质库 [" + name + "] 分类: [" + tag + "]");
      MultiDebug.exe("chatModule", "appendLogContentBuffer", "成功导出材质库 [" + name + "] 分类: [" + tag + "]");
    }

    var oriCamera = window.scene.activeCamera;
    var oriActiveCameras = window.scene.activeCameras;
    var camera = null;
    var matBall = null;
    var light = null;
    var skybox = null

    function start() {
      //隐藏multidebug
      multiDebug.hideModules();
      resize();
      //天空盒
      //skybox = BABYLON.Mesh.CreateBox("debugMatSkybox", 10000000, window.scene);
      //skybox.isPickable = false;
      //skybox.infiniteDistance = false;
      //skybox.material = new BABYLON.StandardMaterial("debugMatSkyboxMat", window.scene);
      //skybox.material.backFaceCulling = false;
      //skybox.material.reflectionTexture = new BABYLON.CubeTexture(MATERIALLIBFIX + "skyboxs/rainbow/rainbow", window.scene);
      //skybox.material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      //skybox.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
      //skybox.material.specularColor = new BABYLON.Color3(0, 0, 0);
      //skybox.material.disableLighting = true;
      matBall = BABYLON.Mesh.CreateSphere("debugMatBall", 32, 500, window.scene);
      matBall.setVerticesData("uv2", matBall.getVerticesData("uv"));
      matBall.setVerticesData("uv3", matBall.getVerticesData("uv"));
      matBall.material = material;
      matBall.position = new BABYLON.Vector3(100000, 100000, 100000);
      camera = new BABYLON.ArcRotateCamera("exportMaterialCamera", 0, Math.PI / 2, 2000, matBall.position, window.scene);
      camera.lowerBetaLimit = .1;
      camera.upperBetaLimit = Math.PI - .1;
      camera.maxZ = 1000000000;
      camera.wheelPrecision = 1;
      window.scene.activeCameras = [];
      window.scene.activeCamera = camera;
      camera.attachControl(canvas, false);
      //排除光影响
      window.scene.lights.forEach(function (light) {
        light.excludedMeshes.push(matBall);
      })
      light = new BABYLON.HemisphericLight("testLight", new BABYLON.Vector3(0, 1, 0), window.scene);
      light.intensity = .5;
      //只照亮材质球
      light.includedOnlyMeshes.push(matBall);
    }

    start();

    function end() {
      window.scene.activeCameras = oriActiveCameras;
      window.scene.activeCamera = oriCamera;
      matBall.dispose();
      camera.dispose();
      light.setEnabled(false);
      light.dispose();
      //skybox.dispose();
      //skybox.material.dispose();
      multiDebug.showModules();
      resize();
    }
  }
  //导入材质,设置缓存
  var materialLib = {};

  this.importMaterial = function (srcMesh, material) {
    var tagBalls = {
      "全部": [],
      "未定义": []
    };
    var materialLibReady = {};
    var appName = MultiDebug.get("socketModule", "appName");
    if (!material) {
      return;
    }
    var difPosition = new BABYLON.Vector3(100000, 100000, 100000);
    var row = 5;//每行显示的列数
    var gap = 100;
    //初始化场景
    var oriCamera = window.scene.activeCamera;
    var oriActiveCameras = window.scene.activeCameras;
    var oriViewport = oriCamera.viewport;
    var engine = window.scene.getEngine();
    var canvas = engine.getRenderingCanvas();
    var camera = null;
    var light = null;
    //var skybox = null;
    var ballParent = null;
    var balls = [];
    var ballMaterials = [];
    var doms = [];

    function onmousedown(e) {
      if (e.event.clientX > window.innerWidth / 2) {
        camera.attachControl(canvas, false);
        oriCamera.detachControl(canvas)
      } else {
        oriCamera.attachControl(canvas, false);
        camera.detachControl(canvas)
      }
      return false;
    }

    function adjustDom() {
      var width = engine.getRenderWidth() / 100;
      var height = engine.getRenderHeight() / 100;
      balls.forEach(function (mesh) {
        if (camera.isActiveMesh(mesh)) {
          mesh.dom.show();
          var mesh2d = BABYLON.Vector3.Project(mesh.position.add(difPosition),
            BABYLON.Matrix.Identity(),
            window.scene.getTransformMatrix(),
            camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight()));
          mesh.dom.css("left", mesh2d.x / width + "%").css("top", mesh2d.y / height + "%")
        } else {
          mesh.dom.hide();
        }
      })
    }

    function getMaterialLib(fileList) {
      fileList.forEach(function (name) {
        if (materialLib.hasOwnProperty(name)) {
          materialLibReady[name] = true;
        } else if (!materialLibReady[name]) {
          materialLibReady[name] = true;
          $.get(MATERIALLIBFIX + "lib/" + name, function (data) {
            materialLib[name] = data;
          })
        }
      })
      checkReady(fileList)
    }

    //等待所有材质球加载完毕才进入展示页面.
    function checkReady(fileList) {
      if (fileList.every(function (name) {
        return materialLib[name]
      })) {
        start();
      } else {
        window.setTimeout(function () {
          checkReady(fileList)
        }, 500);
      }
    }

    //材质球加载完毕，开始初始化,并且可以双击退出
    function start() {
      //天空盒
      //skybox = BABYLON.Mesh.CreateBox("debugMatSkybox", 10000000, window.scene);
      //skybox.isPickable = false;
      //skybox.infiniteDistance = false;
      //skybox.material = new BABYLON.StandardMaterial("debugMatSkyboxMat", window.scene);
      //skybox.material.backFaceCulling = false;
      //skybox.material.reflectionTexture = new BABYLON.CubeTexture(MATERIALLIBFIX + "skyboxs/rainbow/rainbow", window.scene);
      //skybox.material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      //skybox.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
      //skybox.material.specularColor = new BABYLON.Color3(0, 0, 0);
      //skybox.material.disableLighting = true;
      camera = new BABYLON.ArcRotateCamera("importMaterialCamera", Math.PI / 2, Math.PI / 2, 1100, difPosition, window.scene);
      camera.lowerBetaLimit = .1;
      camera.upperBetaLimit = Math.PI - .1;
      camera.lowerRadiusLimit = 1;
      camera.maxZ = 1000000000;
      camera.wheelPrecision = 1;
      window.scene.activeCameras = [oriCamera, camera];
      //viewport
      oriCamera.viewport = new BABYLON.Viewport(0, 0, .5, 1);
      camera.viewport = new BABYLON.Viewport(0.5, 0, .5, 1);
      light = new BABYLON.HemisphericLight("testLight", new BABYLON.Vector3(1, 1, 0), window.scene);
      light.groundColor = new BABYLON.Color3(.5, .5, .5);
      light.intensity = .7;
      _this.showLightDebug(light, false, true);
      resize();
      //显示材质球
      showMaterialLib();
      //相机分别控制
      window.scene.onPointerObservable.add(onmousedown, 1);
      //双击取消材质库
      $(document.body).on("dblclick", end);
      //调整位置
      window.scene.registerBeforeRender(adjustDom);
    }

    //显示材质球
    function showMaterialLib() {
      ballParent = new BABYLON.Mesh("z_debugParent", window.scene);
      ballParent.position = difPosition;
      materialLib.forEach(function (json, materialLibName) {
        json = JSON.parse(json);
        var name = json.name;
        var tag = json.tag;
        var materialLibType = json.materialType;
        //生成球球
        var ball = BABYLON.Mesh.CreateSphere("z_" + materialLibName, 32, 50, window.scene);
        ball.parent = ballParent;
        ball.position = new BABYLON.Vector3(Math.random() * 200, Math.random() * 200, 0)
        ball.setVerticesData("uv2", ball.getVerticesData("uv"));
        ball.setVerticesData("uv3", ball.getVerticesData("uv"));
        //赋予材质
        try {
          ball.material = new BABYLON[materialLibType]("zm_" + materialLibName, window.scene);
          initSceneByJSON(json, ball.material);
        } catch (e) {
          console.warn(e)
        }
        //防止到分类中
        if (tag) {
          if (!tagBalls[tag]) {
            tagBalls[tag] = [];
          }
          tagBalls[tag].push(ball);
        } else {
          tagBalls["未定义"].push(ball);
        }
        tagBalls["全部"].push(ball);
        balls.push(ball);
        ballMaterials.push(ball.material);
        ball.dom = $("<div style=\"position:fixed;padding:3px 10px;background:rgba(1,1,1,.4);color:#fff;border-radius:5px;transform:translate(-50%,50%);font-size:16px;cursor:pointer;z-index:10000\">")
        ball.dom.html(name);
        $(document.body).append(ball.dom);
        doms.push(ball.dom);
        //添加事件
        ball.dom.click(function () {
          MultiDebug.Tool.showConfirm("您确定要将材质库中的 [" + materialLibName + "] 复制给 [" + material.name + "] ?", function () {
            initSceneByJSON(json, srcMesh.material);
            MultiDebug.Tool.showMessage("您已成功将材质库中的 [" + materialLibName + "] 复制给 [" + material.name + "]", 2);
            MultiDebug.exe("chatModule", "appendLogContentBuffer", "您已成功将材质库中的 [" + materialLibName + "] 复制给 [" + material.name + "]");
            //保存到服务器
            MultiDebug.exeA("debugModule", "onChange", srcMesh);
            var currentDebugMesh = MultiDebug.get("debugModule", "currentDebugMesh");
            if (currentDebugMesh == srcMesh) {
              MultiDebug.exe("debugModule", "showDebug", srcMesh);
              _this.showDebug(srcMesh);
            }
          })
        })

        //排除光影响
        window.scene.lights.forEach(function (l) {
          if (l != light) {
            l.excludedMeshes.push(ball);
          }
        })
        //只照亮材质球
        light.includedOnlyMeshes.push(ball);
      })
      //展示下拉框
      showList();
      //展现全部
      showBalls(balls);
    }

    function showList() {
      var div = $("<div class=z-select>");
      div.css("margin-left", "0").css("left", "0").css("top", "0").css("padding", "10px")
      var select = $("<select>");
      //排序
      tagBalls.forEach(function (balls, name) {
        var option = $("<option value=" + name + ">" + name + " : " + balls.length + "</option>");
        select.append(option);
      })
      select.val("全部");
      div.append(select);
      $(document.body).append(div);
      select.on("change", function () {
        var tag = select.val();
        showBalls(tagBalls[tag]);
      })
    }

    function showBalls(shows) {
      balls.forEach(function (ball) {
        window.scene.removeMesh(ball);
      })
      shows.forEach(function (mesh, i) {
        window.scene.addMesh(mesh);
        var currentRow = window.parseInt(i / row);
        var currentCol = i % row;
        mesh.position = new BABYLON.Vector3(-gap * currentCol, -gap * currentRow, 0);
      })
      //更新相机target
      var x, y;
      if (shows.length >= row) {
        x = -row / 2 * gap;
      } else {
        x = -(shows.length - 1) % row * gap / 2;
      }
      y = -window.parseInt(shows.length / row) * gap / 2;
      camera.target = difPosition.add(new BABYLON.Vector3(x, y, 0));
    }


    function end() {
      tagBalls = {
        "全部": [],
        "未定义": []
      }
      window.scene.activeCameras = oriActiveCameras;
      camera.dispose();
      light.setEnabled(false);
      light.dispose();
      //skybox.dispose();
      //skybox.material.dispose();
      window.scene.activeCamera = oriCamera;
      oriCamera.attachControl(canvas, false);
      oriCamera.viewport = oriViewport;
      multiDebug.showModules();
      //删除事件
      window.scene.onPointerObservable.removeCallback(onmousedown);
      $(document.body).off("dblclick", end);
      window.scene.unregisterBeforeRender(adjustDom);
      resize();
      //删除球
      ballParent.dispose && ballParent.dispose()
      balls.forEach(function (mesh) {
        mesh.dispose()
      })
      //删除材质
      ballMaterials.forEach(function (material) {
        material.dispose()
      })
      //删除DOM
      doms.forEach(function (dom) {
        dom.remove()
      })
      //删除下拉框
      $(".z-select").remove();
      if (beforeDebugMode) {
        _this.debugMode();
      }
    }

    multiDebug.hideModules();
    //获取材质库文件列表
    MultiDebug.exe("socketModule", "getMaterialLibFileList", "lib", function (fileList) {
      console.log("材质库：", fileList)
      getMaterialLib(fileList);
    })
    //提示
    MultiDebug.Tool.showMessage("双击取消导入材质界面......");

    var beforeDebugMode = debugMode;
    _this.viewMode();
  }

  //调试灯光
  var lightBallSize = 10;
  var lightTypeZh = {
    "HemisphericLight": "半球光",
    "PointLight": "点光源",
    "DirectionalLight": "方向光",
    "SpotLight": "聚光灯"
  }
  var lightBalls = [];
  var currentLightBall;
  var editControl = null;
  this.getLightBallSize = function () {
    return lightBallSize;
  }
  this.setLightBallSize = function (num) {
    lightBallSize = num;
    MultiDebug.Tool.showMessage("光球大小已经调整到 " + num, 1);
    if (lightBalls.length) {
      _this.debugLight();
    }

  }
  this.getLightBalls = function () {
    return lightBalls;
  }

  this.refreshLightBall = function (light) {
    if (currentLightBall && currentLightBall._light == light) {
      var type = light.getClassName();
      //if (type == "HemisphericLight") {
      //    currentLightBall.rotation = dirToEular(light.direction.negate())
      //} else if (type == "DirectionalLight" || type == "SpotLight") {
      //    currentLightBall.rotation = dirToEular(light.direction)
      //}
      if (type == "PointLight" || type == "SpotLight") {
        if (pX[light.name]) {
          pX[light.name].value = light.position.x;
          pY[light.name].value = light.position.y;
          pZ[light.name].value = light.position.z;
        }
      }
      if (type == "HemisphericLight" || type == "DirectionalLight" || type == "SpotLight") {
        if (axisX[light.name]) {
          axisX[light.name].value = light.direction.x;
          axisY[light.name].value = light.direction.y;
          axisZ[light.name].value = light.direction.z;
        }
      }
    }
  }

  //灯光方向转换成欧拉角
  function dirToEular(dir) {
    try {
      dir.normalize();
      var rotation = new BABYLON.Vector3(0, 0, 0);
      var x = dir.x;
      var y = dir.y;
      var z = dir.z;
      var xy = new BABYLON.Vector2(x, y).normalize();
      var xz = new BABYLON.Vector2(x, z).normalize();
      var deltaZ = Math.acos(xy.x);
      var deltaY = Math.acos(xz.x);
      rotation.z = xy.length() == 0 ? 0 : (xy.y > 0 ? deltaZ : -deltaZ);
      rotation.y = xz.length() == 0 ? 0 : (xz.z < 0 ? deltaY : -deltaY);
      return rotation;
    } catch (e) {
      console.warn(e);
    }

  }

  //创建光源球,初始化位置和方向light._lightBall,lightBall._light
  function showLightBall(light) {
    var lightBall = BABYLON.Mesh.CreateSphere(light.name, 32, lightBallSize, window.scene);
    //lightBall不会生成调试JSON
    lightBall._debug = true;
    lightBall._light = light;
    light._lightBall = lightBall;
    lightBalls.push(lightBall);
    lightBall.renderingGroupId = 1;

    var type = light.getClassName();
    if (type == "PointLight" || type == "SpotLight") {
      //映射
      lightBall.position = light.position;
    }
    //光源球位置随机
    if (type == "HemisphericLight") {
      lightBall.position = new BABYLON.Vector3(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10)
      //lightBall.rotation = dirToEular(light.direction.negate())
    }
    if (type == "DirectionalLight" || type == "SpotLight") {
      lightBall.position = new BABYLON.Vector3(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10)
      //lightBall.rotation = dirToEular(light.direction);
    }
  }

  //删除光源球
  function removeLightBall() {
    lightBalls.forEach(function (ball) {
      ball.dispose();
    })
    lightBalls = [];
    currentLightBall = null;
  }

  //关闭调试灯光
  function disposeLightDebug() {
    editControl && editControl.detach();
    unregisterLightEvent();
    removeLightBall();
    //隐藏当前正在调试的物体，准备开始调试灯光
    MultiDebug.exe("debugModule", "hideDebug");
  }

  //方向调试
  var currentDirDebug = null;
  var currentDir = null;
  var currentDirEvent = null;

  function dirDebug(lightBall) {
    detachDirDebug();
    var light = lightBall._light;
    var dir = null;
    var type = light.getClassName();
    if (type == "HemisphericLight") {
      dir = light.direction.normalize().negate();
    } else if (type == "DirectionalLight" || type == "SpotLight") {
      dir = light.direction.normalize();
    } else {
      return;
    }
    var dirLine = BABYLON.Mesh.CreateDashedLines(lightBall.name + "DirLine", [lightBall.position, lightBall.position.add(dir.scale(lightBallSize * 3))], 3, 1, 10, window.scene);
    dirLine._debug = true;
    dirLine.color = new BABYLON.Color3(1, 0, 0);
    currentDirDebug = dirLine;
    currentDir = light.direction.clone();
    currentDirEvent = function () {
      if (!light.direction.equals(currentDir)) {
        dirDebug(lightBall);
      }
    }
    window.scene.registerBeforeRender(currentDirEvent)
  }

  function detachDirDebug() {
    if (currentDirDebug) {
      currentDirDebug.dispose();
    }
    window.scene.unregisterBeforeRender(currentDirEvent)
  }

  var pX = {}, pY = {}, pZ = {}, axisX = {}, axisY = {}, axisZ = {};
  //注册灯光调试事件
  var toggleLightBall = function () {
    console.log("还没有注册事件哦")
  };

  function registerLightEvent() {
    //点击切换调试光源
    function toggle(mesh) {
      if (mesh != currentLightBall) {
        editControl && editControl.detach();
        detachDirDebug();
        var EditControl = org.ssatguru.babylonjs.component.EditControl;
        editControl = new EditControl(mesh, window.scene.activeCamera, canvas, .75, true);
        editControl.enableTranslation();
        editControl.setRotGuideFull(false);
        editControl.setLocal(true);
        editControl && editControl.addActionListener(actionMove);
        editControl && editControl.addActionEndListener(actionEnd);
        var currentDebugMesh = MultiDebug.get("debugModule", "currentDebugMesh");
        var hasShow = currentDebugMesh && currentDebugMesh instanceof BABYLON.Light;
        if (hasShow) {
          MultiDebug.set("debugModule", "currentDebugMesh", mesh._light);
        } else {
          MultiDebug.exe("debugModule", "showLightDebug", mesh._light);
        }
        _this.showLightDebug(mesh._light, hasShow);
      }
      currentLightBall = mesh;
    }

    //如果已经有调试窗口不会重新生成
    var onmousedown = function (lightBall) {
      if (lightBall && lightBall._light) {
        toggle(lightBall);
      } else {
        var pickInfos = window.scene.multiPick(window.scene.pointerX, window.scene.pointerY);
        pickInfos.some(function (pickInfo) {
          var mesh = pickInfo.pickedMesh;
          if (mesh && lightBalls.indexOf(mesh) != -1) {
            toggle(mesh);
            return true;
          }
        })
      }
    }
    toggleLightBall = onmousedown;
    //w调试位置，E调试旋转角度
    var onkeydown = function (e) {
      if (e.code == "KeyW" || e.keyCode == 87) {
        //editControl && editControl.enableTranslation()
        editControl && editControl.show();
        detachDirDebug();
      } else if (e.code == "KeyE" || e.keyCode == 69) {
        //editControl && editControl.enableRotation();
        editControl && editControl.hide();
        dirDebug(editControl.mesh)
      }
    }
    window.scene.onPointerObservable.add(onmousedown, 1);
    document.body.addEventListener("keydown", onkeydown);

    function actionMove() {
      var mesh = editControl.mesh;
      var light = mesh._light;
      var type = light.getClassName();
      if (type == "PointLight" || type == "SpotLight") {
        //映射
        light.position = mesh.position;
        if (pX[light.name]) {
          pX[light.name].value = light.position.x;
          pY[light.name].value = light.position.y;
          pZ[light.name].value = light.position.z;
        }
      }
      //暂时不开启方向调试
      if (type == "HemisphericLight") {
        //light.direction = editControl.localX.negate();
        //if (axisX) {
        //    axisX.value = light.direction.x;
        //    axisY.value = light.direction.y;
        //    axisZ.value = light.direction.z;
        //}
      }
      if (type == "DirectionalLight" || type == "SpotLight") {
        //light.direction = editControl.localX;
        //if (axisX) {
        //    axisX.value = light.direction.x;
        //    axisY.value = light.direction.y;
        //    axisZ.value = light.direction.z;
        //}
      }
    }

    function actionEnd() {
      var mesh = editControl.mesh;
      var light = mesh._light;
      MultiDebug.exeA("debugModule", "onChange", light);
    }

    editControl && editControl.addActionListener(actionMove);
    editControl && editControl.addActionEndListener(actionEnd);

    //注销事件
    unregisterLightEvent = function () {
      window.scene.onPointerObservable.removeCallback(onmousedown);
      document.body.removeEventListener("keydown", onkeydown);
      editControl && editControl.removeAllActionListeners()
      detachDirDebug();
    }
  }

  //注销事件
  function unregisterLightEvent() {

  }

  this.debugLight = function () {
    var engine = window.scene.getEngine();
    var canvas = engine.getRenderingCanvas();
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

  this.undebugLight = function () {
    disposeLightDebug();
  }
  //BABYUI调试框
  //1/26 改为显示所有灯光调试
  var currentLightDebugFolder = null;
  var lightDebugFolders = {};
  this.showLightDebug = function (currentLight, hasShow, onlyOne) {
    if (!currentLight) {
      return;
    }

    function adjustPosition() {
      if (!currentLightDebugFolder) {
        console.warn("没有找到正在调试的灯光文件夹")
        return;
      }
      //调整滚动条
      var babybox = $(".baby-box");
      var dif = currentLightDebugFolder.dom.offset().top - babybox.offset().top
      if (dif > babybox.innerHeight() || dif < 0) {
        babybox.scrollTop(currentLightDebugFolder.dom.position().top)
      }
    }

    if (hasShow) {
      try {
        currentLightDebugFolder = lightDebugFolders[currentLight.name];
        currentLightDebugFolder && currentLightDebugFolder.alert();
        adjustPosition();
        return;
      } catch (e) {
        console.warn(e);
      }
    }
    if (onlyOne) {
      var folderTop = new BABYUI.Folder("材质库调试灯光");
    } else {
      var folderTop = new BABYUI.Folder("灯光调试:" + window.scene.lights.length + "个光源");
    }
    lightDebugFolders = {};
    window.scene.lights.forEach(function (light) {
      if (onlyOne) {
        if (light != currentLight) {
          return;
        }
      }
      var type = light.getClassName();
      var lightBall = light._lightBall;
      var folder = new BABYUI.Folder("名字 : [ " + light.name + " ] 类型:[" + lightTypeZh[type] + "]", folderTop);
      lightDebugFolders[light.name] = folder;
      //当前调试的灯光高亮显示
      if (currentLight == light) {
        folder.alert();
        currentLightDebugFolder = folder;
      }

      new BABYUI.Slider("光强", light.intensity, 0, 5, 0.1, function (value) {
        light.intensity = value;
        toggleLightBall(lightBall);
      }, folder);
      new BABYUI.Color("漫射光颜色", light.diffuse.toHexString(), function (value) {
        light.diffuse = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        toggleLightBall(lightBall);
      }, folder);
      new BABYUI.Color("高光颜色", light.specular.toHexString(), function (value) {
        light.specular = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
        toggleLightBall(lightBall);
      }, folder);
      if (type == "HemisphericLight") {
        new BABYUI.Color("地面光颜色", light.groundColor.toHexString(), function (value) {
          light.groundColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
          toggleLightBall(lightBall);
        }, folder);
      }
      //方向调试
      if (type == "HemisphericLight" || type == "DirectionalLight" || type == "SpotLight") {
        var folderAxis = new BABYUI.Folder("方向", folder);
        light.direction.normalize();
        axisX[light.name] = new BABYUI.Slider("x", light.direction.x, -1, 1, .01, function (value) {
          light.direction.x = value - 0;
          toggleLightBall(lightBall);
          //_this.refreshLightBall(light);
        }, folderAxis);
        axisY[light.name] = new BABYUI.Slider("y", light.direction.y, -1, 1, .01, function (value) {
          light.direction.y = value - 0;
          toggleLightBall(lightBall);
          //_this.refreshLightBall(light);
        }, folderAxis);
        axisZ[light.name] = new BABYUI.Slider("z", light.direction.z, -1, 1, .01, function (value) {
          light.direction.z = value - 0;
          toggleLightBall(lightBall);
          //_this.refreshLightBall(light);
        }, folderAxis);
      }
      //位置
      if (type == "PointLight" || type == "SpotLight") {
        var folderP = new BABYUI.Folder("位置", folder);
        pX[light.name] = new BABYUI.Slider("x", light.position.x, -10000, 10000, 1, function (value) {
          light.position.x = value - 0;
          toggleLightBall(lightBall);
        }, folderP);
        pY[light.name] = new BABYUI.Slider("y", light.position.y, -10000, 10000, 1, function (value) {
          light.position.y = value - 0;
          toggleLightBall(lightBall);
        }, folderP);
        pZ[light.name] = new BABYUI.Slider("z", light.position.z, -10000, 10000, 1, function (value) {
          light.position.z = value - 0;
          toggleLightBall(lightBall);
        }, folderP);
      }
    })
    //单个光源调试，代码备份，请勿删除

    //var type = light.getClassName();
    //var folderTop = new BABYUI.Folder("灯光名字 : [ " + light.name + " ]");
    //var folder = new BABYUI.Folder("类型:[" + lightTypeZh[type] + "]", folderTop);
    //new BABYUI.Slider("光强", light.intensity, 0, 5, 0.1, function (value) {
    //    light.intensity = value;
    //}, folder);
    //new BABYUI.Color("漫射光颜色", light.diffuse.toHexString(), function (value) {
    //    light.diffuse = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
    //}, folder);
    //new BABYUI.Color("高光颜色", light.specular.toHexString(), function (value) {
    //    light.specular = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
    //}, folder);
    //if (type == "HemisphericLight") {
    //    new BABYUI.Color("地面光颜色", light.groundColor.toHexString(), function (value) {
    //        light.groundColor = new BABYLON.Color3.FromInts(value.r, value.g, value.b);
    //    }, folder);
    //}
    ////方向
    //if (type == "HemisphericLight" || type == "DirectionalLight" || type == "SpotLight") {
    //    var folderAxis = new BABYUI.Folder("方向", folderTop);
    //    light.direction.normalize();
    //    axisX = new BABYUI.Slider("x", light.direction.x, -1, 1, .01, function (value) {
    //        light.direction.x = value - 0;
    //        //_this.refreshLightBall(light);
    //    }, folderAxis);
    //    axisY = new BABYUI.Slider("y", light.direction.y, -1, 1, .01, function (value) {
    //        light.direction.y = value - 0;
    //        //_this.refreshLightBall(light);
    //    }, folderAxis);
    //    axisZ = new BABYUI.Slider("z", light.direction.z, -1, 1, .01, function (value) {
    //        light.direction.z = value - 0;
    //        //_this.refreshLightBall(light);
    //    }, folderAxis);
    //}
    ////位置
    //if (type == "PointLight" || type == "SpotLight") {
    //    var folderP = new BABYUI.Folder("位置", folderTop);
    //    pX = new BABYUI.Slider("x", light.position.x, -10000, 10000, 1, function (value) {
    //        light.position.x = value - 0;
    //    }, folderP);
    //    pY = new BABYUI.Slider("y", light.position.y, -10000, 10000, 1, function (value) {
    //        light.position.y = value - 0;
    //    }, folderP);
    //    pZ = new BABYUI.Slider("z", light.position.z, -10000, 10000, 1, function (value) {
    //        light.position.z = value - 0;
    //    }, folderP);
    //}
    adjustPosition();
  }

  //18/1/20 添加有隐藏物体功能
  var hideMeshes = [];

  function showMesh(mesh) {
    if (!mesh) {
      return;
    }
    mesh.isVisible = true;
    hideMeshes = hideMeshes.filter(function (hideMesh) {
      return hideMesh != mesh;
    })
  }

  this.hideMesh = function (mesh) {
    if (!mesh) {
      return;
    }
    if (hideMeshes.indexOf(mesh) == -1) {
      hideMeshes.push(mesh)
      MultiDebug.Tool.showMessage("您已经成功隐藏了" + mesh.name + "~~~", 1);
      MultiDebug.exe("chatModule", "appendLogContentBuffer", "您已经成功隐藏了" + mesh.name + "~~~");
    } else {
      MultiDebug.Tool.showMessage("您之前已经隐藏了该物体~~~~", 1);
    }
    mesh.isVisible = false;
  }
  this.showMeshes = function () {
    if (hideMeshes.length == 0) {
      MultiDebug.Tool.showMessage("您还没有隐藏任何物体，没有什么好显示的~~~", 1, "danger")
    } else {
      MultiDebug.Tool.showSelect("显示全部您手动隐藏的物体", ["显示全部您手动隐藏的物体"].concat(hideMeshes.map(function (mesh) {
        return mesh.name;
      })), function (value, index) {
        if (index == 0) {
          [].slice.call(hideMeshes).forEach(function (mesh) {
            showMesh(mesh);
          })
          MultiDebug.Tool.showMessage("您已经复原了你所有手动隐藏的物体~~~~", 1);
          MultiDebug.exe("chatModule", "appendLogContentBuffer", "您已经复原了你所有手动隐藏的物体~~~~");
        } else {
          MultiDebug.Tool.showMessage("您已经复原了" + hideMeshes[index - 1].name, 1);
          MultiDebug.exe("chatModule", "appendLogContentBuffer", "您已经复原了" + hideMeshes[index - 1].name);
          showMesh(hideMeshes[index - 1]);
        }
      })
    }
  }
}

export default App;