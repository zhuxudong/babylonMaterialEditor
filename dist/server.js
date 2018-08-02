/**
 * @author zhuxudong <callzhuxudong@163.com>
 */
const fs = require('fs-extra');
const path = require('path');
const portfinder = require('portfinder')
const io = require("socket.io")()

const config = {
  // create public material library
  public: {
    context: "./static",
    materialLibPath: "materialLib",
    skyboxPath: "skyboxs",
    texturePath: "textures"
  },
  // create private material library
  app: {
    context: "./static/model",
    // finalPath = private.app+private.app.appName
    appName: "demo",
    materialLibPath: "materialLib",
    skyboxPath: "skyboxs",
    texturePath: "textures",
    // data contanis version and log
    dataPath: 'editorData'
  },
  // save userInfo on config.userInfoPath
  // userInfo contains account,password,userImg
  userInfoPath: "./static/users",
  // socket port
  port: 2049
}
const finalPath = {
  appPath: '',
  appSkyboxPath: '',
  appTexturePath: '',
  appDataPath: '',
  publicPath: '',
  publicSkyboxPath: '',
  publicTexturePath: '',
  userInfoPath: ''
}

/**
 * change default config by node's args...
 * node server.js -p 2048 -a demo
 * */
function checkArgs() {
  return new Promise((resolve, reject) => {
    //exclude node server.js
    const args = process.argv.slice(2)
    const presets = {
      port: ["-p", "-port"],
      "app.appName": ["-a", "app"]
    }
    args.forEach((arg, index) => {
      for (let item in presets) {
        // -p
        let short = presets[item]
        let shortIndex = 0
        if ((shortIndex = short.indexOf(arg)) !== -1) {
          //***
          // -p 2049
          let newArg = args[index + 1]
          if (index + 1 > args.length - 1) {
            reject("please input correct arg after " + presets[item][shortIndex])
          }
          if (item === "port") {
            newArg -= 0
          }
          //split
          let dst = config
          let split = item.split(".")
          split.forEach((item, index) => {
            if (index + 1 === split.length) {
              dst[item] = newArg
            } else {
              dst = dst[item]
            }
          })
          //***
        }
      }
    })
    resolve()
  })
}

/**
 * ensure the valid socket port
 * */
function checkPort(port) {
  return new Promise((resolve, reject) => {
    portfinder.basePort = port;
    portfinder.getPortPromise().then((port) => {
      // `port` is guaranteed to be a free port
      config.port = port;
      resolve()
    }).catch((err) => {
      // Could not get a free port, `err` contains the reason.
      reject(err)
    })
  })
}

function initFinalPath() {
  finalPath.appPath = path.resolve(__dirname, config.app.context, config.app.appName);
  finalPath.appSkyboxPath = path.resolve(finalPath.appPath, config.app.materialLibPath, config.app.skyboxPath);
  finalPath.appTexturePath = path.resolve(finalPath.appPath, config.app.materialLibPath, config.app.texturePath);
  finalPath.appDataPath = path.resolve(finalPath.appPath, config.app.dataPath);
  finalPath.publicPath = path.resolve(__dirname, config.public.context, config.public.materialLibPath);
  finalPath.publicSkyboxPath = path.resolve(finalPath.publicPath, config.public.skyboxPath);
  finalPath.publicTexturePath = path.resolve(finalPath.publicPath, config.public.texturePath);
  finalPath.userInfoPath = path.resolve(__dirname, config.userInfoPath)
}

function listen(port) {
  io.listen(port)
  io.on('connection', (socket) => {
    console.log("连接成功!")
    socket.on("test", (msg) => {
      console.log(msg)
    })
  })
}

function consolePath() {
  console.log("----------------------start--------------------------")
  for (let item in finalPath) {
    let path = finalPath[item];
    console.log("*** " + item + ": [" + path + "]")
  }
  console.log("\n*** socket is listening " + config.port + "......")

  // console.log("------------------------------------------------")

}

checkArgs()
  .then(() => checkPort(config.port))
  .then(() => initFinalPath())
  .then(() => listen(config.port))
  .then(() => consolePath())
  .catch((err) => {
    console.log("*** something unexpected happened,exit......")
    console.log(err)
  })

// var server = require('http').createServer().listen(PORT);
// var io = require("socket.io").listen(server);
//
// //项目路径
// var APPFIX = PATH.join(config.CLIENTFIX, APPNAME);
// var APPDATAFIX = PATH.join(APPFIX, "multidebug.bak");
// //材质库路径
// var MATERIALLIBFIX = config.MATERIALLIBFIX
// var SKYBOX = config.SKYBOX
// var TEXTURE = config.TEXTURE
// //用户信息路径
// var USERINFOFIX = config.USERINFOFIX
//
//
// function MultiDebug() {
//   var serverData = {};
//   var _this = this;
//   var socketList = [];
//
//   function pre() {
//     Object.prototype.forEach = function (callback) {
//       var _this = this;
//       var keyArr = Object.keys(_this).sort();
//       keyArr.some(function (key) {
//         return callback(_this[key], key, keyArr);
//       })
//     };
//     Object.defineProperty(Object.prototype, "forEach", {"enumerable": false});
//     if (!Object.assign) {
//       Object.assign = function () {
//         var json = {};
//         try {
//           json = arguments[0];
//           for (var i = 1; i < arguments.length; i++) {
//             for (var key in arguments[i]) {
//               json[key] = arguments[i][key]
//             }
//           }
//         } catch (e) {
//           console.warn(e);
//         }
//         return json;
//       }
//       Object.defineProperty(Object.prototype, "assign", {"enumerable": false});
//     }
//   }
//
//   pre();
//
//   function registerEvents(events, socket) {
//     events.forEach(function (func, eventName) {
//       if (typeof eventName == "string" && typeof func == "function") {
//         socket.on(eventName, func.bind(socket));
//       }
//     })
//   }
//
//   function getLocalIP() {
//     var IP = null;
//     var netInterfaces = os.networkInterfaces();
//     netInterfaces.forEach(function (netInterface) {
//       netInterface.forEach(function (info) {
//         if (info.family === 'IPv4' && info.address !== '127.0.0.1' && !info.internal) {
//           IP = info.address;
//           return true;
//         }
//       })
//     })
//     return IP;
//   }
//
//   function getIP(socket) {
//     var IP = socket.conn.remoteAddress.slice(7);
//     if (!IP) {
//       IP = "127.0.0.1";
//     }
//     if (!IP || IP == "127.0.0.1") {
//       IP = getLocalIP();
//     }
//     return IP;
//   }
//
//   //是否存在文件
//   function exists(path) {
//     if (fs.existsSync(path)) {
//       return true;
//     }
//   }
//
//   //创建多重目录
//   function mkdir(dirname) {
//     if (exists(dirname)) {
//       return true;
//     } else {
//       if (mkdir(PATH.dirname(dirname))) {
//         fs.mkdirSync(dirname);
//         return true;
//       }
//     }
//   }
//
//   this.mkdir = mkdir;
//
//   //是否目录
//   function isDir(path) {
//     try {
//       if (exists(path)) {
//         var stat = fs.lstatSync(path);
//         return stat.isDirectory();
//       }
//     } catch (e) {
//       console.log(e);
//     }
//   }
//
//   //是否文件
//   function isFile(path) {
//     try {
//       if (exists(path)) {
//         var stat = fs.lstatSync(path);
//         return stat.isFile();
//       }
//     } catch (e) {
//       console.log(e);
//     }
//   }
//
//   //读取文件
//   function readFile(path) {
//     try {
//       if (isFile(path)) {
//         return fs.readFileSync(path, "utf-8");
//       }
//     } catch (e) {
//       console.log(e)
//     }
//   }
//
//   //写文件并覆盖文件
//   function writeFile(path, text) {
//     try {
//       if (exists(PATH.dirname(path))) {
//         fs.writeFileSync(path, text);
//       }
//     } catch (e) {
//       console.log(e)
//     }
//   }
//
//   function removeFile(path) {
//     if (exists(path)) {
//       if (isFile(path)) {
//         fs.unlinkSync(path);
//       }
//     }
//   }
//
//   //追加文件
//   function appendFile(path, text) {
//     if (exists(PATH.dirname(path))) {
//       fs.appendFileSync(path, text)
//     }
//   }
//
//   //发送用户信息保存成功信息
//   function sendUserInfoChange(socket) {
//     //发送本人的信息
//     socket.emit("onUserInfoChange", {
//       myName: socket.info.userName,
//       myImg: socket.info.userImg,
//       userList: socketList.map(function (socket) {
//         return {
//           userName: socket.info.userName,
//           userImg: socket.info.userImg,
//           userIP: socket.info.IP
//         }
//       })
//     })
//     //不发送本人的信息
//     socket.broadcast.emit("onUserInfoChange", {
//       userList: socketList.map(function (socket) {
//         return {
//           userName: socket.info.userName,
//           userImg: socket.info.userImg,
//           userIP: socket.info.IP
//         }
//       })
//     });
//   }
//
//   //注册新连接的socket，确保唯一性，防止握手不成功或者退出不正常的情况
//   function registerSocket(socket) {
//     socketList.push(socket);
//     socket.info = {}
//     socket.info.IP = getIP(socket);
//     socket.info.userInfoPath = PATH.join(USERINFOFIX, socket.info.IP);
//     socket.info.userNamePath = PATH.join(socket.info.userInfoPath, "userName");
//     socket.info.userImgPath = PATH.join(socket.info.userInfoPath, "userImg");
//     socket.info.userName = null;
//     socket.info.userImg = null;
//     //排除重名的socket
//     socketList = socketList.filter(function (_socket) {
//       return !(socket.info.IP == _socket.info.IP && socket != _socket)
//     })
//   }
//
//   //加密
//   function encode(code) {
//     code = code + "";
//     var c = String.fromCharCode(code.charCodeAt(0) + code.length);
//     for (var i = 1; i < code.length; i++) {
//       c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
//     }
//     return escape(c);
//   }
//
//   //解密
//   function decode(code) {
//     code = code + "";
//     code = unescape(code);
//     var c = String.fromCharCode(code.charCodeAt(0) - code.length);
//     for (var i = 1; i < code.length; i++) {
//       c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
//     }
//     return c;
//   }
//
//   /**根据用户IP获取用户信息
//    * @param {Object} socket - socket
//    * @return {Object||null} info - 存在则返回用户信息
//    * @return {string} - info.userName 用户名字
//    * @return {string} - info.userImg 用户头像
//    * */
//   this.getUserInfo = function (socket) {
//     var userName = socket.info.userNamePath;
//     var userImg = socket.info.userImgPath;
//     var path = USERINFOFIX;
//     if (exists(path)) {
//       if (exists(userName)) {
//         socket.info.userName = decode(readFile(userName));
//       }
//       if (exists(userImg)) {
//         socket.info.userImg = userImg;
//       }
//     }
//     return {
//       userName: socket.info.userName,
//       userImg: socket.info.userImg
//     }
//   }
//   /**存储用户信息，并排重，除了自己
//    * @param {string} userName - 用户姓名
//    * @param {string} userImg - base64
//    * @param {boolean} logining - 是否在登陆
//    * @param {Object} socket - 需要存储的客户端socket
//    * */
//   this.saveUserInfo = function (userName, userImg, logining, socket) {
//     mkdir(socket.info.userInfoPath);
//     var dirList = fs.readdirSync(USERINFOFIX);
//     var haveRepeat = dirList.some(function (name) {
//       try {
//         //自己可以重命名
//         if (name == socket.info.IP)
//           return;
//         if (userName === decode(readFile(PATH.join(USERINFOFIX, name, "userName")))) {
//           return true
//         }
//       } catch (e) {
//         console.log(e)
//       }
//     })
//     if (haveRepeat) {
//       socket.emit("onNameRepeat", userName)
//     } else {
//       if (userName) {
//         writeFile(socket.info.userNamePath, encode(userName));
//         //更新用户数据
//         socket.info.userName = userName;
//       }
//       if (userImg) {
//         writeFile(socket.info.userImgPath, userImg);
//         socket.info.userImg = socket.info.userImgPath;
//       }
//       sendUserInfoChange(socket);
//       if (logining) {
//         socket.emit("onLoginSuccess", socket.info.userName, socket.info.userImg, socket.info.IP);
//       }
//     }
//   }
//   /**断开socket连接，逻辑上的*/
//   this.removeSocket = function (socket) {
//     //排除退出的socket和IP重复的socket
//     socketList = socketList.filter(function (_socket) {
//       return !(_socket == socket || socket.info.IP == _socket.info.IP)
//     })
//     //用户信息变化
//     sendUserInfoChange(socket);
//   }
//   /**获取服务器数据
//    * @param {string} key - 键值*/
//   this.getServerData = function (key) {
//     var string = String(key);
//     var keys = string.split(".");
//     //服务器存放数据的位置
//     var location = serverData;
//     var exists = keys.every(function (key) {
//       if (location.hasOwnProperty(key)) {
//         location = location[key];
//         return true;
//       } else {
//         return false;
//       }
//     })
//     if (exists) {
//       return location;
//     }
//   }
//   /**设置服务器数据
//    * @param {string} key -键值
//    * @param data - 任意值，将覆盖服务器数据
//    */
//   this.setServerData = function (key, data, onsuccess) {
//     var string = String(key);
//     var keys = string.split(".");
//     //服务器存放数据的位置
//     var location = serverData;
//     var ori = null;
//     keys.forEach(function (key, i) {
//       if (location.hasOwnProperty(key)) {
//         ori = location[key];
//       } else {
//         location[key] = {};
//         ori = null;
//       }
//       if (i == keys.length - 1) {
//         location[key] = data;
//       } else {
//         location = location[key];
//       }
//     })
//     onsuccess && onsuccess(ori, data);
//   }
//   /**加载文件，保存在服务器
//    * @param {string} filePath -存放数据的文件
//    * @param {string} key - 数据读取来后的存放位置
//    * @param {boolean} toObject - 是否转化为对象，true:将字符串转化为对象，如果失败则使用原来字符串
//    * */
//   this.loadFileToServerData = function (filePath, key, toObject) {
//     var text = readFile(filePath);
//     if (!text) {
//       return;
//     }
//     if (toObject) {
//       try {
//         text = JSON.parse(text)
//       } catch (e) {
//         console.log(e)
//       }
//     }
//     _this.setServerData(key, text);
//   }
//   /**保存文件到指定路径，路径不存在会自动创建
//    * @param {string} filePath -存放数据的文件路径
//    * @param {string} key - 存放数据的键值
//    * @param {boolean} toStr - 是否转化为字符串
//    * */
//   this.saveFileFromServerData = function (filePath, key, toStr) {
//     var text = _this.getServerData(key);
//     if (text) {
//       //创建路径
//       mkdir(PATH.dirname(filePath));
//       if (toStr) {
//         writeFile(filePath, JSON.stringify(text))
//       } else {
//         writeFile(filePath, text)
//       }
//
//     }
//   }
//   this.saveFile = function (path, content) {
//     mkdir(PATH.dirname(path));
//     writeFile(path, content)
//   }
//   this.saveAppFile = function (path, content) {
//     path = PATH.join(APPDATAFIX, path)
//     _this.saveFile(path, content);
//   }
//   this.delAppFile = function (path) {
//     path = PATH.join(APPDATAFIX, path);
//     removeFile(path);
//   }
//   /**读取路径的所有文件，返回文件列表数组，排除文件夹
//    * @parawm {string} dirPath - 文件夹路径
//    * */
//   this.getFileList = function (dirPath) {
//     var dirList = [];
//     if (exists(dirPath)) {
//       dirList = fs.readdirSync(dirPath).filter(function (path) {
//         return isFile(PATH.join(dirPath, path));
//       });
//     }
//     return dirList;
//   }
//   /**读取路径的所有文件夹，返回文件列表数组，排除文件夹
//    * @parawm {string} dirPath - 文件夹路径
//    * */
//   this.getDirList = function (dirPath) {
//     var dirList = [];
//     if (exists(dirPath)) {
//       dirList = fs.readdirSync(dirPath).filter(function (path) {
//         return isDir(PATH.join(dirPath, path));
//       });
//     }
//     return dirList;
//   }
//
//   this.start = function () {
//     io.sockets.on('connection', function (socket) {
//       //注册socket事件
//       registerEvents(MultiDebug.Interface, socket);
//       //注册socket
//       registerSocket(socket)
//       //获取用户信息，进行相应处理
//       var userInfo = _this.getUserInfo(socket);
//       console.log(userInfo)
//       //直接登陆成功
//       if (userInfo.userName) {
//         sendUserInfoChange(socket);
//         socket.emit("onLoginSuccess", userInfo.userName, userInfo.userImg, socket.info.IP);
//       }
//       //需要注册
//       else {
//         socket.emit("onRegister");
//       }
//     })
//   }
//
// }
//
// var multiDebug = new MultiDebug();
// multiDebug.start()
// console.log("开启服务器" + PORT + "端口" + "成功...");
// console.log("正在与客户端[" + APPFIX + "]进行联机调试");
// //读取聊天记录保存到chatContent下
// multiDebug.loadFileToServerData(PATH.join(APPDATAFIX, "chatContent"), "chatContent", true);
// //读取日志记录保存到logContent下
// multiDebug.loadFileToServerData(PATH.join(APPDATAFIX, "logContent"), "logContent", true);
// //初始化锁定信息
// multiDebug.setServerData("lockInfo", {});
// //初始化调试JSON
// multiDebug.setServerData("debugInfo", {
//   lights: {},
//   materials: {}
// })
//
// //--------事件接口--------
//
// MultiDebug.Interface = {
//   /**退出联机调试系统*/
//   disconnect: function () {
//     var socket = this;
//     //通知其他人下线
//     socket.broadcast.emit("onOtherPeopleLogOut", socket.info.userName, socket.info.userImg);
//     //存放聊天记录
//     multiDebug.saveFileFromServerData(PATH.join(APPDATAFIX, "chatContent"), "chatContent", true);
//     //存放日志记录
//     multiDebug.saveFileFromServerData(PATH.join(APPDATAFIX, "logContent"), "logContent", true);
//     multiDebug.removeSocket(socket);
//
//   },
//   /**客户端请求 存储用户信息到服务器
//    * @param data.userName - 用户名字
//    * @param data.userImg - 用户头像base64
//    * @param data.logining - 是否在注册的时候请求服务器
//    * */
//   onSaveUserInfo: function (data) {
//     var socket = this;
//     multiDebug.saveUserInfo(data.userName, data.userImg, data.logining, socket);
//   },
//   /**客户端请求 获取服务器端数据
//    * @param {string} key - 要获取的服务器的数据的键值,可以.连接，如a.b.c
//    * */
//   onGetServerData: function (key) {
//     var socket = this;
//     var eventName = "onGetServerData__" + key;
//     var data = multiDebug.getServerData(key)
//     socket.emit(eventName, data);
//   },
//   /**客户端请求 设置服务器端数据
//    * @param {string} key - 要设置的服务器的数据的键值,可以.连接，如a.b.c
//    * @param {Object} data - 键值数据
//    * */
//   onSetServerData: function (key, data) {
//     var socket = this;
//     var eventName = "onSetServerData__" + key;
//     multiDebug.setServerData(key, data, function (ori, data) {
//       socket.emit(eventName, ori, data);
//     })
//   },
//   /**客户端请求 通知其他在线用户
//    * @param {string} eventName - 通知的事件名字
//    * @param {Object} data - 需要发送的数据
//    * */
//   onBroadcastOther: function (eventName, data) {
//     var socket = this;
//     socket.broadcast.emit(eventName, data)
//   },
//   /**获取公私图片库文件列表*/
//   onGetPicFileList: function () {
//     var socket = this;
//     var publicTextureFix = PATH.join(MATERIALLIBFIX, TEXTURE);
//     var publicSkyboxFix = PATH.join(MATERIALLIBFIX, SKYBOX);
//     var privateFix = PATH.join(APPFIX, "materialLib/");
//     var privateTextureFix = PATH.join(privateFix, TEXTURE);
//     var privateSkyboxFix = PATH.join(privateFix, SKYBOX);
//     //初始化创建文件夹
//     multiDebug.mkdir(publicTextureFix);
//     multiDebug.mkdir(publicSkyboxFix);
//     multiDebug.mkdir(privateSkyboxFix);
//     multiDebug.mkdir(privateTextureFix);
//     var publicTexture = multiDebug.getFileList(publicTextureFix);
//     var publicSkybox = multiDebug.getDirList(publicSkyboxFix);
//     var privateTexture = multiDebug.getFileList(privateTextureFix);
//     var privateSkybox = multiDebug.getDirList(privateSkyboxFix);
//     socket.emit("onGetPicFileList", {
//       publicTexture: publicTexture,
//       publicSkybox: publicSkybox,
//       privateTexture: privateTexture,
//       privateSkybox: privateSkybox,
//       appName: APPNAME
//     });
//
//   },
//   /**获取APP相对路径的文件列表数组*/
//   onGetAppFileList: function (path) {
//     var socket = this;
//     var dirList = multiDebug.getFileList(PATH.join(APPDATAFIX, path));
//     socket.emit("onGetAppFileList", dirList);
//   },
//   /**保存文件到app相对路径*/
//   onSaveAppFile: function (path, content) {
//     multiDebug.saveAppFile(path, content);
//   },
//   /**删除文件,app相对路径*/
//   onDelAppFile: function (path) {
//     multiDebug.delAppFile(path);
//   },
//   /**获取材质库文件列表*/
//   onGetMaterialLibFileList: function (path) {
//     path = PATH.join(MATERIALLIBFIX, path);
//     var dirList = multiDebug.getFileList(path);
//     var socket = this;
//     socket.emit("onGetMaterialLibFileList", dirList)
//   },
//   /**写文件到材质库路径*/
//   onSaveMaterialLibFile: function (path, content) {
//     path = PATH.join(MATERIALLIBFIX, path);
//     multiDebug.saveFile(path, content);
//   }
// }
//
//
//
