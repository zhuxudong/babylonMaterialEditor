/** 中文版本
 * cn:中文翻译
 * par:参数介绍
 * exp:调试经验
 * */
//基本属性
let baseProCN = {
  "diffuseColor": {
    cn: "漫反射",
    par: "diffuseColor",
    exp: "漫反射受光源影响大，亮度明度偏高时仍然有较明显的明暗关系，主要是物体在光源打到处显示的颜色。可理解为亮部受光处颜色。"
  },
  "emissiveColor": {
    cn: "自发射光",
    par: "emissiveColor",
    exp: "受光源影响较小，亮度明度偏高时比较平面，明暗关系不强，主要是物体本身所散发的颜色。可理解为暗部阴影部分的颜色。"
  },
  "specularColor": {
    cn: "高光",
    par: "specularColor",
    exp: "高光颜色一般情况下为白色-灰色之间进行选择，颜色偏灰会显得比较自然，特定情况下（如阳光下则颜色会稍微偏黄）可对高光颜色或者环境光源球颜色进行微调。"
  },
  "specularPower": {
    cn: "高光强度",
    par: "specularPower",
    exp: "高光强度数值越小，则高光范围越大；数值越大，则高光范围越小。自行微调。高光打到平面上约为圆形，类似点光源。"
  },
  "ambientColor": {
    cn: "环境色",
    par: "ambientColor",
    exp: ""
  },
  "alpha": {
    cn: "透明度",
    par: "alpha",
    exp: "玻璃与塑料等材质会用到透明度，然而目前玻璃与塑料材质不理想，透明贴图等不需要更改此处透明度数值。"
  },
  "baseColor": {
    cn: "漫反射",
    par: "baseColor",
    exp: ""
  },
  "albedoColor": {
    cn: "基色",
    par: "albedoColor",
    exp: ""
  },
  "reflectivityColor": {
    cn: "高光颜色",
    par: "reflectivityColor",
    exp: ""
  },
  "reflectionColor": {
    cn: "镜面反射颜色",
    par: "reflectionColor",
    exp: ""
  },
  "metallic": {
    cn: "金属度",
    par: "metallic",
    exp: "可调整镜面反射的高光大小，金属度越大，反射越强。"
  },
  "roughness": {
    cn: "粗糙度",
    par: "roughness",
    exp: "可使镜面反射贴图变的不清晰，类似于PS中的高斯模糊，可很好的用于模型的磨砂质感。ps:高光光泽度效果更佳"
  },
  "glossiness": {
    cn: "光泽度",
    par: "glossiness",
    exp: ""
  },
  "microSurface": {
    cn: "光泽度",
    par: "microSurface",
    exp: ""
  },
  "indexOfRefraction": {
    cn: "折射率",
    par: "indexOfRefraction",
    exp: ""
  },
  "directIntensity": {
    cn: "受光影响强度",
    par: "directIntensity",
    exp: "在PBR里，光源影响偏弱，则此为常用调试参数，可调节整体模型的亮暗与对比度。"
  },
  "emissiveIntensity": {
    cn: "自发射强度",
    par: "emissiveIntensity",
    exp: ""
  },
  "environmentIntensity": {
    cn: "环境强度",
    par: "environmentIntensity",
    exp: ""
  },
  "specularIntensity": {
    cn: "高光强度",
    par: "specularIntensity",
    exp: ""
  },
  "_specularIntensity": {cn: "高光强度", par: "_specularIntensity", exp: ""},
  "ambientTextureStrength": {
    cn: "阴影贴图强度",
    par: "ambientTextureStrength",
    exp: ""
  },
  "occlusionStrength": {
    cn: "阴影贴图强度",
    par: "occlusionStrength",
    exp: ""
  },
  "useRoughnessFromMetallicTextureAlpha": {
    cn: "金属贴图alpha通道包含粗糙度信息",
    par: "useRoughnessFromMetallicTextureAlpha",
    exp: ""
  },
  "useRoughnessFromMetallicTextureGreen": {
    cn: "金属贴图green通道包含粗糙度信息",
    par: "useRoughnessFromMetallicTextureGreen",
    exp: ""
  },
  "useMetallnessFromMetallicTextureBlue": {
    cn: "金属贴图blue通道包含金属度信息",
    par: "useMetallnessFromMetallicTextureBlue",
    exp: ""
  },
  "useAmbientOcclusionFromMetallicTextureRed": {
    cn: "金属贴图red通道包含阴影度信息",
    par: "useAmbientOcclusionFromMetallicTextureRed",
    exp: ""
  },
  "useAmbientInGrayScale": {
    cn: "阴影度只能从阴影贴图和金属贴图的red通道读取",
    par: "useAmbientInGrayScale",
    exp: ""
  },
  "useAlphaFromAlbedoTexture": {
    cn: "漫反射贴图alpha通道包含透明度信息",
    par: "useAlphaFromAlbedoTexture",
    exp: ""
  },
  "useMicroSurfaceFromReflectivityMapAlpha": {
    cn: "高光贴图alpha通道包含光泽度信息",
    par: "useMicroSurfaceFromReflectivityMapAlpha",
    exp: ""
  },
  "useRadianceOverAlpha": {
    cn: "AKA光芒",
    par: "useRadianceOverAlpha",
    exp: ""
  },
  "useSpecularOverAlpha": {
    cn: "高光亮点",
    par: "useSpecularOverAlpha",
    exp: ""
  }
}
//贴图属性
let textureProCN = {
  diffuseTexture: {
    cn: "漫反射贴图",
    par: "diffuseTexture",
    exp: "在光源已调试完成，模型所有地方均受光时，可将纹理贴图贴至此处。会在模型表面产生没有凹凸感的纹理效果。"
  },
  reflectionTexture: {
    cn: "镜面反射贴图",
    par: "reflectionTexture",
    exp: "给物体增加真实反光感，比较适用于反光较强的物体。使用菲涅尔可在前方增加黑色蒙版，造成轻微磨砂质感与增加明暗对比度。然而若想要镜面反射并磨砂的话，建议转为PBR材质进行调试。"
  },
  refractionTexture: {
    cn: "折射贴图",
    par: "refractionTexture",
    exp: ""
  },
  opacityTexture: {
    cn: "透明贴图",
    par: "opacityTexture",
    exp: "一般用来贴阴影与模型上的贴图，所用图片为png格式。贴贴图时建议在透明贴图上贴一层，再在漫反射贴图上贴一层，并把高光调至最低，贴图不会产生锯齿。"
  },
  emissiveTexture: {
    cn: "自发射贴图",
    par: "emissiveTexture",
    exp: "在模型有地方未受光时，可将纹理贴图贴至此处。"
  },
  specularTexture: {
    cn: "高光贴图",
    par: "specularTexture",
    exp: ""
  },
  bumpTexture: {
    cn: "法线贴图",
    par: "bumpTexture",
    exp: "当模型较复杂时，为了减少模型面数，会采用法线贴图，法线贴图可使模型表面产生凹凸纹理效果。"
  },
  albedoTexture: {
    cn: "漫反射贴图",
    par: "albedoTexture",
    exp: "在光源已调试完成，模型所有地方均受光时，可将纹理贴图贴至此处。会在模型表面产生没有凹凸感的纹理效果。"
  },
  ambientTexture: {
    cn: "阴影贴图",
    par: "ambientTexture",
    exp: "由于场景中环境光源的影响，模型无法直接产生投影与阴影，此处可贴拆分uv后的阴影贴图，复杂场景建议使用，可使模型本身存在投影，明暗对比更强，模型显的更为真实。阴影贴图需向模型提供人员索取。"
  },
  reflectivityTexture: {
    cn: "高光贴图",
    par: "reflectivityTexture",
    exp: ""
  },
  metallicTexture: {
    cn: "金属度贴图",
    par: "metallicTexture,与金属度是相乘关系，像素越白金属度越高",
    exp: ""
  },
  environmentTexture: {
    cn: "镜面反射贴图",
    par: "environmentTexture",
    exp: "给物体增加真实反光感，比较适用于反光较强的物体。pbr材质的好处为贴了镜面反射之后仍然可以调节粗糙度造成磨砂效果，且较为自然。此处可贴后缀为dds的贴图，dds为天空球，类似于天空盒，不受光源影响，能产生自发光，反射效果很好，一般用于模型中受到光源影响而无法有较大明暗对比度时，缺点为图片太大，如不必要请勿使用。"
  },
  baseTexture: {
    cn: "漫反射贴图",
    par: "baseTexture",
    exp: ""
  },
  occlusionTexture: {
    cn: "阴影贴图",
    par: "occlusionTexture",
    exp: ""
  },
  normalTexture: {
    cn: "法线贴图",
    par: "normalTexture",
    exp: "当模型较复杂时，为了减少模型面数，会采用法线贴图，法线贴图可使模型表面产生凹凸纹理效果。"
  },
  microSurfaceTexture: {
    cn: "粗糙度/光泽度贴图",
    par: "microSurfaceTexture,高光/光泽度模式下是光泽度贴图，像素越白越光泽;金属/粗糙度模式下是粗糙度贴图，像素越白越粗糙，与粗糙度/光泽度是相乘关系",
    exp: ""
  },
  metallicRoughnessTexture: {
    cn: "金属加粗糙度贴图",
    par: "metallicRoughnessTexture",
    exp: ""
  },
  specularGlossinessTexture: {
    cn: "高光加光泽度贴图",
    par: "specularGlossinessTexture",
    exp: ""
  }
}
//其他通用属性
let otherProCN = {
  level: {
    cn: "纹理强度",
    par: "level",
    exp: ""
  },
  uScale: {
    cn: "uScale",
    par: "u(x)轴伸缩比，越大越密",
    exp: ""
  },
  vScale: {
    cn: "vScale",
    par: "v(y)轴伸缩比，越大越密",
    exp: ""
  },
  coordinatesIndex: {
    cn: "UV通道",
    par: "UV通道，目前最多3个通道,可以用来贴不同种类的贴图",
    exp: ""
  },
  fresnel: {
    cn: "菲涅尔",
    par: "菲涅尔原理:视线垂直于表面时，反射较弱，而当视线非垂直表面时，夹角越小，反射越明显",
    exp: ""
  },
  bias: {
    cn: "偏差",
    par: "bias,F=max(0,min(1,bias+scale*(1-V*N)^power))",
    exp: ""
  },
  power: {
    cn: "强度",
    par: "bias,F=max(0,min(1,bias+scale*(1-V*N)^power))",
    exp: ""
  },
  useParallax: {
    cn: "开启视差映射",
    par: "",
    exp: ""
  },
  useParallaxOcclusion: {
    cn: "开启视差闭塞",
    par: "",
    exp: ""
  },
  parallaxScaleBias: {
    cn: "视差偏差",
    par: "",
    exp: ""
  }
}
export {baseProCN, textureProCN, otherProCN}
