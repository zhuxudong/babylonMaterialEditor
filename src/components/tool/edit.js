/** @module*/

/**为了防止调试不想调试的物体,所以必须先editMesh(mesh)才能进行调试这个物体*/
function editMesh(mesh) {
  mesh && [].concat(mesh).forEach((mesh) => {
    mesh._babylonMaterialEditor = true;
  })
}

/**取消调试物体*/
function unEditMesh(mesh) {
  mesh && [].concat(mesh).forEach((mesh) => {
    mesh._babylonMaterialEditor = false;
  })
}

/**为了防止生成不想要的材质JSON,所以必须editMaterial(material)才会生成相应的材质JSON*/
function editMaterial(material) {
  material && [].concat(material).forEach((material) => {
    material._babylonMaterialEditor = true;
  })
}

/**取消调试物体*/
function unEditMaterial(material) {
  material && [].concat(material).forEach((material) => {
    material._babylonMaterialEditor = false;
  })
}

export {editMesh, unEditMesh, editMaterial, unEditMaterial}