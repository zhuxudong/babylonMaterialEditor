/** @module*/

import {basePro, texturePro} from "../lang/en";

/**根据JSON初始化场景
 * @param {Object} scene 需要初始化的场景
 * @param {Object|String} json 全部数据
 * @param {Object} material - 如果有此参数,材质中只初始化这个材质球
 * @param {Object} light - 如果有此参数,灯光中只初始化这个灯光
 * */

function initSceneByJSON(scene, json, material = null, light = null) {
  if (!json) {
    console.warn("请输入JSON");
    return;
  }
  if (typeof json === "string") {
    json = JSON.parse(json);
  }

  //立方体纹理
  function createCubeTexture(path, picName, textureName) {
    let texture = null;
    let type = "skybox";//"skybox,dds,hdr,ktx"
    let index = picName.lastIndexOf(".");
    if (index !== -1) {
      type = picName.slice(index + 1);
    }
    if (type === "skybox") {
      texture = new BABYLON.CubeTexture(path + "/skyboxes/" + picName + "/" + picName, scene);
    } else if (type === "dds") {
      try {
        if (BABYLON.CubeTexture.CreateFromPrefilteredData) {
          texture = BABYLON.CubeTexture.CreateFromPrefilteredData(path + "/textures/" + picName, scene);
        } else {
          console.error("您当前的BABYLON版本并不支持DDS格式，请更换最新版本的BABYLON");
        }
      } catch (e) {
        console.warn(e);
      }
    } else if (type === "hdr") {
      texture = new BABYLON.HDRCubeTexture(path + "/textures/" + picName, scene, 256)
    } else {
      console.warn(picName + ":立方体纹理不支持这种格式");
    }
    texture.name = textureName;
    return texture;
  }

  //平面纹理
  function createTexture(path, picName, textureName) {
    let texture = new BABYLON.Texture(path + "/textures/" + picName, scene);
    texture.name = textureName;
    return texture;
  }

  function initMaterial(json, material, publicPath, appPath) {
    let materialType = json.materialType;
    if (!materialType) {
      materialType = "StandardMaterial";
    }
    if (!BABYLON[materialType]) {
      console.warn("您的BABYLON不支持" + materialType + "材质类型，请更新到最新版本的BABYLON版本...");
      materialType = "StandardMaterial";
    }
    //材质转换
    if (material.getClassName() !== materialType) {
      let newMaterial = new BABYLON[materialType](material.name, scene);
      newMaterial._babylonMaterialEditor = material._babylonMaterialEditor;
      scene.meshes.forEach(function (mesh) {
        if (mesh.material && mesh.material === material) {
          mesh.material = newMaterial;
        }
      })
      material.dispose();
      material = newMaterial;
    }
    //基础属性
    basePro.forEach(function (key) {
      //json中没有的不做处理
      if (!json.hasOwnProperty(key)) {
        return;
      }
      let value = json[key];
      //颜色
      if (material[key] && material[key].copyFrom) {
        material[key].copyFrom(value)
      } else {
        material[key] = value;
      }
    })
    //纹理
    texturePro.forEach(function (info) {
      let texture = info.name;
      let simple = info.simple;
      let other = info.other;
      let fresnel = info.fresnel;
      let cube = info.cube;
      let level = simple + "Level";
      let us = simple + "US";
      let vs = simple + "VS";
      let index = simple + "Index";
      let bias = simple + "Bias";
      let power = simple + "Power";
      let noTexture = "no" + simple;
      let noFre = "nofre" + simple;

      //createJSON生成的数据中是否存在相应的键值
      function exist(key) {
        return json.hasOwnProperty(key);
      }

      //新版本
      function getPicPath(picStr) {
        if (!picStr) {
          return {
            picName: null,
            path: null
          }
        } else if (picStr.indexOf("private,") === 0) {
          return {
            picName: picStr.slice(8),
            path: appPath
          }
        } else if (picStr.indexOf("public,") === 0) {
          return {
            picName: picStr.slice(7),
            path: publicPath
          }
        }
        return {
          picName: "自带",
          path: null
        };
      }

      //纹理
      if (exist(texture)) {
        let textureName = json[texture];
        //如果没有纹理或者纹理的名字和JSON不一样
        if (!material[texture] || material[texture].name !== textureName) {
          let picPath = getPicPath(textureName);
          let path = picPath.path;
          let picName = picPath.picName;
          if (!path || !picName) {
            // console.warn("请检查材质JSON:" + material.name + "[" + textureName + "]");
          } else {
            if (cube) {
              material[texture] = createCubeTexture(path, picName, textureName);
            } else {
              material[texture] = createTexture(path, picName, textureName);
            }
          }
        }
      }
      //level,uScale,vScale,coordinatesIndex
      if (material[texture]) {
        if (exist(level)) {
          material[texture].level = json[level];
        }
        if (exist(us)) {
          material[texture].uScale = json[us];
        }
        if (exist(vs)) {
          material[texture].vScale = json[vs];
        }
        if (exist(index)) {
          material[texture].coordinatesIndex = json[index];
        }
      }
      //other    "useParallaxOcclusion","useParallax","parallaxScaleBias"
      if (other) {
        other.forEach(function (key) {
          if (exist(key)) {
            material[key] = json[key];
          }
        })
      }
      //fresnel
      if (exist(bias)) {
        if (!material[fresnel]) {
          material[fresnel] = new BABYLON.FresnelParameters();
        }
        material[fresnel].bias = json[bias];
      }
      if (exist(power)) {
        if (!material[fresnel]) {
          material[fresnel] = new BABYLON.FresnelParameters();
        }
        material[fresnel].power = json[power];
      }
      //no
      if (exist(noTexture)) {
        material[texture] = null;
      }
      if (exist(noFre)) {
        material[fresnel] ? material[fresnel].isEnabled = false : null;
      }
    })
  }

  function initLight(json, light) {
    json.forEach(function (jsonValue, key) {
      switch (key) {
        case "intensity":
          light.intensity = jsonValue;
          break;
        case "diffuse":
          light.diffuse && light.diffuse.copyFrom && light.diffuse.copyFrom(jsonValue);
          break;
        case "specular":
          light.specular && light.specular.copyFrom && light.specular.copyFrom(jsonValue);
          break;
        case "groundColor":
          light.groundColor && light.groundColor.copyFrom && light.groundColor.copyFrom(jsonValue);
          break;
        case "position":
          light.position && light.position.copyFrom && light.position.copyFrom(jsonValue);
          break;
        case "direction":
          light.direction && light.direction.copyFrom && light.direction.copyFrom(jsonValue);
          break;
        //case "lightBallRotation":
        //    let lightBall = light.lightBall;
        //    if (lightBall) {
        //        lightBall.rotation && lightBall.rotation.copyFrom(jsonValue);
        //    }
        //    break;
      }
    })
  }

  json.lights && json.lights.forEach(function (lightJSON, lightName) {
    let _light = scene.getLightByName(lightName);
    if ((light && light === _light) || (!light && _light)) {
      initLight(lightJSON, _light);
    }
  })
  json.materials && json.materials.forEach(function (materialJSON, materialName) {
    let _material = scene.getMaterialByName(materialName);
    if ((material && material === _material) || (!material && _material)) {
      initMaterial(materialJSON, _material, json.publicPath, json.appPath);
    }
  })
}

export default initSceneByJSON