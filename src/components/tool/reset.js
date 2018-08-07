if (!Object.forEach) {
  Object.prototype.forEach = function (callback) {
    let keyArr = Object.keys(this).sort();
    keyArr.some((key) => {
      return callback(this[key], key, keyArr);
    })
  };
  Object.defineProperty(Object.prototype, "forEach", {"enumerable": false});
}
if (!Object.assign) {
  Object.assign = function () {
    let json = {};
    try {
      json = arguments[0];
      for (let i = 1; i < arguments.length; i++) {
        for (let key in arguments[i]) {
          json[key] = arguments[i][key]
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return json;
  }
  Object.defineProperty(Object.prototype, "assign", {"enumerable": false});
}