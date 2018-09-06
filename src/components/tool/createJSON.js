/** @module*/


import {basePro, texturePro} from "../lang/en";

/** 生成经过editMaterial()的材质的JSON,用于initSceneByJSON
 * @param {Object} scene - 对应的BABYLON场景
 * @param {Object} option - 默认生成场景中所有灯光和材质的JSON，修改参数可以定制生成的JSON
 * @param {Object|Object[]} option.materials - materials中只生成相应的材质JSON
 * @param {String|String[]} option.materialNames - materials中只根据材质名字生成这些物体的材质JSON
 * @param {Object|Object[]} option.lights - lights中只生成相应灯光的灯光JSON
 * @param {String|String[]} option.lightNames - lights中只根据灯光名字生成这些灯光的灯光JSON
 * @param {String|String[]} option.publicPath - 公有材质库根路径
 * @param {String|String[]} option.appPath - 私有材质库根路径
 * @param {boolean} option.console - 是否打印JSON数据到控制台
 * @param {boolean} option.warn - 是否打印警告信息
 * @param {boolean} option.window - 是否打印JSON数据到新窗口
 * @param {boolean} option.mini - 是否生成缩减版JSON，默认false,用于上线，删除了调试用到的JSON
 * @return {string} str - 调试生成的JSON数据
 * */
function createJSON(scene, option) {
  //默认生成场景中所有材质/灯光JSON，打印，并打开新窗口
  let defaultOption = {
    materials: null,
    materialNames: null,
    lights: null,
    lightNames: null,
    publicPath: "",
    appPath: "",
    console: true,
    warn: true,
    window: true,
    mini: false//最终版本设置mini为true，可以删除大量调试JSON
  }
  let opt = Object.assign(defaultOption, option);
  let json = {
    publicPath: opt.publicPath,
    appPath: opt.appPath,
    lights: {},
    materials: {}
  };

  function initMaterialJSON(material) {
    json.materials[material.name] = {};
    if (!material._babylonMaterialEditor && opt.warn) {
      console.warn("如果你想调试[" + material.name + "]材质,请先进行editMaterial(material)")
      return;
    }
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
      if (material[key] != null) {
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
        //texture
        keyValue[texture] = material[texture].name;
        //level
        keyValue[simple + "Level"] = material[texture].level;
        //uScale,vScale
        if (!cube) {
          keyValue[simple + "US"] = material[texture].uScale;
          keyValue[simple + "VS"] = material[texture].vScale;
        }
        //bumpTexture ...
        if (other) {
          other.forEach(function (key) {
            if (material[key] != null) {
              keyValue[key] = material[key]
            }
          })
        }
        //通道
        keyValue[simple + "Index"] = material[texture].coordinatesIndex
      } else {
        //mini版JSON不需要调试JSON
        if (!opt.mini) {
          //为了某些纹理后来的取消，需要no来进行覆盖操作
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
  let materials = scene.materials.filter((material) => {
    if (!opt.materials && !opt.materialNames) {
      return true;
    }
    if (opt.materialNames && [].concat.call(opt.materialNames).indexOf(material.name) !== -1) {
      return true;
    }
    if (opt.materials && [].concat.call(opt.materials).indexOf(material) !== -1) {
      return true;
    }
  })
  lights.forEach(function (light) {
    initLightJSON(light);
  });
  materials.forEach(function (material) {
    initMaterialJSON(material);
  });
  let str = JSON.stringify(json);
  if (opt.window) {
    //浏览器不允许自动触发，要通过用户手动触发
    let w = window.open();
    if (w) {
      w.document.title = "JSON";
      w.document.body.innerHTML = str;
    }
  }
  if (opt.console) {
    console.log(str)
  }
  return str;
}

export default createJSON;