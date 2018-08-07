/** @author 祝旭东 <callzhuxudong@163.com>*/
/** 英文版本
 * name:BABYLON材质属性
 * fresnel:菲涅尔简写
 * simple:JSON简写
 * cube:立方体纹理
 * */

let basePro = [
    "diffuseColor",
    "emissiveColor",
    "specularColor",
    "specularPower",
    "alpha",
    "baseColor",
    "albedoColor",
    "reflectivityColor",
    "reflectionColor",
    "ambientColor",
    "metallic",
    "roughness",
    "glossiness",
    "microSurface",
    "indexOfRefraction",
    "directIntensity",
    "emissiveIntensity",
    "environmentIntensity",
    "specularIntensity",
    "ambientTextureStrength",
    "occlusionStrength",
    "useRoughnessFromMetallicTextureAlpha",
    "useRoughnessFromMetallicTextureGreen",
    "useMetallnessFromMetallicTextureBlue",
    "useAmbientOcclusionFromMetallicTextureRed",
    "useAmbientInGrayScale",
    "useAlphaFromAlbedoTexture",
    "useMicroSurfaceFromReflectivityMapAlpha",
    "useRadianceOverAlpha",
    "useSpecularOverAlpha"
];
let texturePro = [
    {
        name: "diffuseTexture",
        fresnel: "diffuseFresnelParameters",
        simple: "diff",
    },
    {
        name: "reflectionTexture",
        fresnel: "reflectionFresnelParameters",
        simple: "ref",
        cube: true
    },
    {
        name: "refractionTexture",
        fresnel: "refractionFresnelParameters",
        simple: "refra",
        cube: true
    },
    {
        name: "opacityTexture",
        fresnel: "opacityFresnelParameters",
        simple: "opa",
    },
    {
        name: "emissiveTexture",
        fresnel: "emissiveFresnelParameters",
        simple: "emi",
    },
    {
        name: "specularTexture",
        simple: "spe",
    },
    {
        name: "bumpTexture",
        simple: "bump",
        other: [
            "useParallaxOcclusion",
            "useParallax",
            "parallaxScaleBias"
        ]
    },
    {
        name: "albedoTexture",
        simple: "albedo"
    },
    {
        name: "ambientTexture",
        simple: "ambient"
    },
    {
        name: "reflectivityTexture",
        simple: "relectivity"
    },
    {
        name: "metallicTexture",
        simple: "metallic"
    },
    {
        name: "environmentTexture",
        simple: "environment",
        cube: true
    },
    {
        name: "baseTexture",
        simple: "base"
    },
    {
        name: "occlusionTexture",
        simple: "occlusion"
    },
    {
        name: "normalTexture",
        simple: "normal",
        other: [
            "useParallaxOcclusion",
            "useParallax",
            "parallaxScaleBias"
        ]
    },
    {
        name: "microSurfaceTexture",
        simple: "micro"
    },
    {
        name: "metallicRoughnessTexture",
        simple: "mr"
    },
    {
        name: "specularGlossinessTexture",
        simple: "sg"
    }
];
export {basePro, texturePro}
