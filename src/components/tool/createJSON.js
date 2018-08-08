import {basePro, texturePro} from "../lang/en";

/** 生成JSON,用于initSceneByJSON
 * @param {Object} scene - 对应的BABYLON场景
 * @param {Object} option - 默认生成场景中所有灯光和材质的JSON，修改参数可以定制生成的JSON
 * @param {Object|Object[]} option.meshes - materials中只生成相应物体的材质JSON
 * @param {String|String[]} option.meshNames - materials中只根据物体名字生成这些物体的材质JSON
 * @param {Object|Object[]} option.lights - lights中只生成相应灯光的灯光JSON
 * @param {String|String[]} option.lightNames - lights中只根据灯光名字生成这些灯光的灯光JSON
 * @param {Object} option.material - materials只制生成这个材质的JSON
 * @param {boolean} option.console - 是否打印JSON数据到控制台
 * @param {boolean} option.window - 是否打印JSON数据到新窗口
 * @param {boolean} option.mini - 是否生成缩减版JSON，默认false,用于上线，删除了调试用到的JSON
 * @return {string} str - 调试生成的JSON数据
 * */
function createJSON(scene, option) {
  //默认生成场景中所有材质/灯光JSON，打印，并打开新窗口
  let defaultOption = {
    meshes: null,
    meshNames: null,
    lights: null,
    lightNames: null,
    material: null,
    console: true,
    window: true,
    mini: false//最终版本设置mini为true，可以删除大量调试JSON
  }
  let opt = Object.assign(defaultOption, option);
  let json = {
    publicPath: "",
    appPath: "",
    lights: {},
    materials: {}
  };

  function initMaterialJSON(material) {
    json.materials[material.name] = {};
    let keyValue = json.materials[material.name];
    //后面根据materialType来生成相应材质
    if (material.getClassName) {
      keyValue.materialType = material.getClassName();
    }
    else {
      if (material instanceof BABYLON.StandardMaterial) {
        keyValue.materialType = "StandardMaterial"
      } else if (material instanceof BABYLON.PBRMetallicRoughnessMaterial) {
        keyValue.materialType = "PBRMetallicRoughnessMaterial"
      } else if (material instanceof BABYLON.PBRSpecularGlossinessMaterial) {
        keyValue.materialType = "PBRSpecularGlossinessMaterial"
      } else if (material instanceof BABYLON.PBRMaterial) {
        keyValue.materialType = "PBRMaterial"
      } else if (material instanceof BABYLON.PBRBaseMaterial) {
        keyValue.materialType = "PBRBaseMaterial"
      }
    }

    basePro.forEach(function (key) {
      if (material[key] != undefined) {
        keyValue[key] = material[key]
      }
    })
    texturePro.forEach(function (json) {
      let texture = json.name;
      let fresnel = json.fresnel;
      let simple = json.simple;
      let cube = json.cube;
      let other = json.other;
      //纹理
      if (material[texture]) {
        keyValue[texture] = material[texture].name;
        keyValue[simple + "Level"] = material[texture].level;
        if (!cube) {
          keyValue[simple + "US"] = material[texture].uScale;
          keyValue[simple + "VS"] = material[texture].vScale;
        }
        //bumpTexture
        if (other) {
          other.forEach(function (key) {
            keyValue[key] = material[key]
          })
        }
        //通道
        keyValue[simple + "Index"] = material[texture].coordinatesIndex
      } else {
        //mini版JSON不需要调试JSON
        if (!opt.mini) {
          keyValue["no" + simple] = true
        }
      }
      //菲涅尔
      if (fresnel) {
        if (material[fresnel] && material[fresnel].isEnabled) {
          keyValue[simple + "Bias"] = material[fresnel].bias;
          keyValue[simple + "Power"] = material[fresnel].power;
        } else {
          if (!opt.mini) {
            keyValue["nofre" + simple] = true
          }
        }
      }
    })
  }

  function initLightJSON(light) {
    json.lights[light.name] = {};
    let keyValue = json.lights[light.name];
    keyValue.intensity = light.intensity;
    keyValue.diffuse = light.diffuse;
    keyValue.specular = light.specular;
    if (light.groundColor) {
      keyValue.groundColor = light.groundColor;
    }
    if (light.position) {
      keyValue.position = light.position;
    }
    if (light.direction) {
      keyValue.direction = light.direction;
    }
  }

  //生成lightNames对应灯光的JSON
  let lights = scene.lights.filter((light) => {
    if (!opt.lightNames && !opt.lights) {
      return true;
    }
    if (opt.lightNames && [].concat.call(opt.lightNames).indexOf(light.name) !== -1) {
      return true;
    }
    if (opt.lights && [].concat.call(opt.lights).indexOf(light) !== -1) {
      return true;
    }
  })
  lights.forEach(function (light) {
    initLightJSON(light);
  });
  if (opt.material) {
    initMaterialJSON(opt.material);
  } else {
    //生成锁定的meshNames对应材质的JSON
    scene.materials.forEach(function (material) {
      if (material._debug) {
        return;
      }
      if (opt.meshNames) {
        [].concat(opt.meshNames).forEach(function (meshName) {
          let mesh = scene.getMeshByName(meshName);
          //确保有这个物体
          if (!mesh || mesh._debug) {
            //console.warn("未找到" + meshName + "这个物体")
            return;
          }
          //确保mesh一定有material
          if (!mesh.material) {
            console.warn(meshName + "没有被赋予材质");
            return;
          }
          if (mesh.material && mesh.material == material) {
            initMaterialJSON(material);
          }
        })
      } else if (opt.meshes) {
        [].concat(opt.meshes).forEach(function (mesh) {
          let meshName = mesh.name;
          //确保有这个物体
          if (!mesh || mesh._debug) {
            //console.warn("未找到" + meshName + "这个物体")
            return;
          }
          //确保mesh一定有material
          if (!mesh.material) {
            console.warn(meshName + "没有被赋予材质");
            return;
          }
          if (mesh.material && mesh.material == material) {
            initMaterialJSON(material);
          }
        })
      }
      else {
        initMaterialJSON(material);
      }
    });
  }
  let str = JSON.stringify(json);
  if (opt.window) {
    let w = window.open();
    w.document.title = "JSON";
    w.document.body.innerHTML = str;
  }
  if (opt.console) {
    console.log(str)
  }
  return str;
}

export default createJSON;