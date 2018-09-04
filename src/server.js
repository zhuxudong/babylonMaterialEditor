/**
 * @author zhuxudong <callzhuxudong@163.com>
 */
/**@module server*/

const fs = require('fs-extra');
const path = require('path');
const portfinder = require('portfinder');
const io = require("socket.io")();
/** 默认配置*/
const config = {
  // 公共材质库相关配置
  public: {
    // context: "./static",
    context: "../dist/static",
    materialLibPath: "materialLib",
  },
  // 项目相关配置
  app: {
    // context: "./static/model",
    context: "../dist/static/model",
    // finalPath = private.app+private.app.appName
    appName: "demo",
    materialLibPath: "materialLib",
    // data contanis version and log
    dataPath: 'editorData'
  },
  // 用户账号密码头像
  // userInfoPath: "./static/users",
  userInfoPath: "../dist/static/users",
  // 根路径,上面的context都是基于此根路径
  root: "./",
  // socket port
  port: 3000
};
/** 最终路径*/
const finalPath = {
  appPath: '',
  appLibPath: '',
  appSkyboxPath: '',
  appTexturePath: '',
  appDataPath: '',
  publicPath: '',
  publicLibPath: '',
  publicSkyboxPath: '',
  publicTexturePath: '',
  userInfoPath: ''
};

/**
 * 通过node args 覆盖默认配置
 * 如: node server.js -p 3000 -a demo
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
          // -p 3000
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
 * 生成一个可用的端口
 * */
function checkPort(port) {
  return new Promise((resolve, reject) => {
    portfinder.basePort = port;
    portfinder.getPortPromise().then((port) => {
      config.port = port;
      resolve()
    }).catch((err) => {
      reject(err)
    })
  })
}

/** 初始化所有最终路径
 * */
function initFinalPath() {
  finalPath.appPath = path.resolve(__dirname, config.root, config.app.context, config.app.appName);
  finalPath.appLibPath = path.resolve(finalPath.appPath, config.app.materialLibPath);
  finalPath.appSkyboxPath = path.resolve(finalPath.appLibPath, "skyboxes");
  finalPath.appTexturePath = path.resolve(finalPath.appLibPath, "textures");
  finalPath.appDataPath = path.resolve(finalPath.appPath, config.app.dataPath);
  finalPath.publicPath = path.resolve(__dirname, config.root, config.public.context);
  finalPath.publicLibPath = path.resolve(finalPath.publicPath, config.public.materialLibPath);
  finalPath.publicSkyboxPath = path.resolve(finalPath.publicLibPath, "skyboxes");
  finalPath.publicTexturePath = path.resolve(finalPath.publicLibPath, "textures");
  finalPath.userInfoPath = path.resolve(__dirname, config.root, config.userInfoPath);
}

/** 生成所有最终路径*/
function createFinalPath() {
  return new Promise((resolve, reject) => {
    let promises = [];
    for (let item in finalPath) {
      let path = finalPath[item];
      promises.push(fs.ensureDir(path))
    }
    Promise.all(promises).then(resolve).catch(reject)
  })
}

/** 打印所有路径*/
function consolePath() {
  console.log("----------------------start--------------------------");
  for (let item in finalPath) {
    let path = finalPath[item];
    console.log("*** " + item + ": [" + path + "]");
  }
  console.log("\n*** socket is listening " + config.port + "......");

  console.log("------------------------------------------------");
  // console.log(path.relative(config.root,finalPath.appPath))
}

/** 监听最终端口*/
function listen(port) {
  io.listen(port);
  server = new Server(io);
}

function polyfill() {
  Object.prototype.forEach = function (callback) {
    let _this = this;
    let keyArr = Object.keys(_this).sort();
    keyArr.some(function (key) {
      return callback(_this[key], key, keyArr);
    })
  };
  Object.defineProperty(Object.prototype, "forEach", {"enumerable": false});
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
}

/**************************************************************************/
/**************************************************************************/

/**************************************************************************/
class Server {
  constructor(io) {
    this.socketList = [];
    this.serverData = {
      lockInfo: {},
      debugInfo: {}
    };
    io.on('connection', (socket) => {
      this.on(socket, socketEvents);
    })
  }

  createUserInfo(socket, userName, userPassword, userImg, appPath, appLibPath, publicPath, publicLibPath) {
    socket.userInfo = {
      userName: userName,
      userPassword: userPassword,
      userImg: userImg,
      appPath: appPath,
      publicPath: publicPath,
      appLibPath: appLibPath,
      publicLibPath: publicLibPath
    }
    return socket;
  }

  updateUserInfo(socket, opt) {
    if (!opt) {
      opt = {}
    }
    opt.forEach((val, key) => {
      socket.userInfo[key] = val;
    })
    return socket;
  }

  getUserInfo(socket) {
    return socket.userInfo;
  }

  on(socket, socketEvents) {
    socketEvents.forEach(function (func, eventName) {
      if (typeof eventName == "string" && typeof func == "function") {
        socket.on(eventName, func.bind(socket));
      }
    })
  }

  //加密
  encode(code) {
    code = code + "";
    let c = String.fromCharCode(code.charCodeAt(0) + code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
    }
    return escape(c);
  }

  //解密
  decode(code) {
    code = code + "";
    code = unescape(code);
    let c = String.fromCharCode(code.charCodeAt(0) - code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
    }
    return c;
  }

  //获取服务器数据
  getServerData(key) {
    let string = String(key);
    let keys = string.split(".");
    //服务器存放数据的位置
    let location = this.serverData;
    let exists = keys.every(function (key) {
      if (location.hasOwnProperty(key)) {
        location = location[key];
        return true;
      } else {
        return false;
      }
    })
    if (exists) {
      return location;
    }
  }

  //设置服务器数据
  setServerData(key, data, onsuccess) {
    let string = String(key);
    let keys = string.split(".");
    //服务器存放数据的位置
    let location = this.serverData;
    let ori = null;
    keys.forEach(function (key, i) {
      if (location.hasOwnProperty(key)) {
        ori = location[key];
      } else {
        location[key] = {};
        ori = null;
      }
      if (i == keys.length - 1) {
        location[key] = data;
      } else {
        location = location[key];
      }
    })
    onsuccess && onsuccess(ori, data);
  }

  //是否目录
  isDir(path) {
    try {
      if (fs.pathExistsSync(path)) {
        let stat = fs.lstatSync(path);
        return stat.isDirectory();
      }
    } catch (e) {
      console.log(e);
    }
  }

  //是否文件
  isFile(path) {
    try {
      if (fs.pathExistsSync(path)) {
        let stat = fs.lstatSync(path);
        return stat.isFile();
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**读取路径的所有文件，返回文件列表数组，排除文件夹
   * @parawm {string} dirPath - 文件夹路径
   * */
  getFileList(dirPath) {
    let dirList = [];
    if (fs.pathExistsSync(dirPath)) {
      dirList = fs.readdirSync(dirPath).filter((p) => {
        return this.isFile(path.join(dirPath, p));
      });
    }
    return dirList;
  }

  /**读取路径的所有文件夹，返回文件列表数组，排除文件夹
   * @parawm {string} dirPath - 文件夹路径
   * */
  getDirList(dirPath) {
    let dirList = [];
    if (fs.pathExistsSync(dirPath)) {
      dirList = fs.readdirSync(dirPath).filter((p) => {
        return this.isDir(path.join(dirPath, p));
      });
    }
    return dirList;
  }
}

let server = null;


//--------事件接口--------
let socketEvents = {
  /**用户登录
   * @param {string} account -昵称
   * @param {string} password -密码
   * @param {function} cb -回调用户信息
   * */
  login(account, password, cb) {
    let socket = this;
    let file = path.resolve(finalPath.userInfoPath, server.encode(account));
    if (fs.pathExistsSync(file)) {
      fs.readJson(file).then((json) => {
        if (server.decode(json.userPassword) !== password) {
          cb("密码输入错误！")
        } else {
          server.socketList.push(server.createUserInfo(socket));
          server.updateUserInfo(socket, {
            userName: account,
            userPassword: password,
            userImg: json.userImg,
            appPath: path.relative(config.root, finalPath.appPath),
            appLibPath: path.relative(config.root, finalPath.appLibPath),
            publicPath: path.relative(config.root, finalPath.publicPath),
            publicLibPath: path.relative(config.root, finalPath.publicLibPath),
          })
          console.log(account + " 已登录...")
          cb(server.getUserInfo(socket));
          //登录成功！
          socket.emit("onLogin")
        }
      })
    } else {
      cb("没有发现有关" + account + "的资料,请先进行注册!")
    }
  },
  /**用户注册
   * @param {string} account -昵称
   * @param {string} password -密码
   * @param {function} cb -回调用户信息
   * */
  register(account, password, cb) {
    let file = path.resolve(finalPath.userInfoPath, server.encode(account));
    if (!fs.pathExistsSync(file)) {
      fs.outputJson(file, {
        userPassword: server.encode(password),
        userImg: null
      }).then(cb)
    } else {
      cb(account + "已经被人注册！请重新起个名字")
    }
  },
  /**退出联机调试系统*/
  disconnect: function () {
    let socket = this;
    server.socketList = server.socketList.filter((s) => {
      if (socket.id === s.id) {
        console.log(server.getUserInfo(socket).userName + " 已退出...")
        return false
      }
      return true;
    })

    // let socket = this;
    // //通知其他人下线
    // socket.broadcast.emit("onOtherPeopleLogOut", socket.info.userName, socket.info.userImg);
    // //存放聊天记录
    // multiDebug.saveFileFromServerData(PATH.join(APPDATAFIX, "chatContent"), "chatContent", true);
    // //存放日志记录
    // multiDebug.saveFileFromServerData(PATH.join(APPDATAFIX, "logContent"), "logContent", true);
    // multiDebug.removeSocket(socket);

  },
  /**客户端请求 获取服务器端数据
   * @param {string} key - 要获取的服务器的数据的键值,可以.连接，如a.b.c
   * @param {function} cb - 回调服务器端数据
   * */
  onGetServerData: function (key, cb) {
    let data = server.getServerData(key)
    cb(data)
  },
  /**获取公私图片库文件列表*/
  onGetPicFileList: function (cb) {
    let publicTexture = server.getFileList(finalPath.publicTexturePath);
    let publicSkybox = server.getDirList(finalPath.publicSkyboxPath);
    let privateTexture = server.getFileList(finalPath.appTexturePath);
    let privateSkybox = server.getDirList(finalPath.appSkyboxPath);
    cb({
      publicTexture: publicTexture,
      publicSkybox: publicSkybox,
      privateTexture: privateTexture,
      privateSkybox: privateSkybox
    });
  },
}
/**************************************************************************/
/**************************************************************************/
/**************************************************************************/
polyfill();

checkArgs()
  .then(() => checkPort(config.port))
  .then(() => initFinalPath())
  .then(() => createFinalPath())
  .then(() => consolePath())
  .then(() => listen(config.port))
  .catch((err) => {
    console.log("*** something unexpected happened,exit......")
    console.log(err)
  })

function main() {
  document.body.innerHTML = "";
  document.oncontextmenu = function () {
    return false
  }
  let target = document.createElement("div")
  target.style.position = "absolute"
  target.style.width = "50px"
  target.style.height = "50px"
  target.style.borderRadius = "50%"
  target.style.background = "#da7373"
  target.style.left = "50%"
  target.style.top = "50%"
  target.style.transform = "translate(-50%,-50%)"
  document.body.appendChild(target)
  let man = document.createElement("div")
  man.style.position = "absolute"
  man.style.width = "50px"
  man.style.height = "50px"
  man.style.borderRadius = "50%"
  man.style.left = "100px"
  man.style.top = "100px"
  man.style.background = "rgb(164, 115, 218)";
  man.style.marginTop = "-25px"
  man.style.marginLeft = "-25px"
  document.body.appendChild(man);


  let interval = null;
  let speed = 3;
  /**鼠标右键事件*/
  document.addEventListener("mousedown", function (e) {
    if (e.button != 2)
      return;
    clearInterval(interval)
    interval = setInterval(function () {
      let oriX = parseFloat(man.style.left);
      let oriY = parseFloat(man.style.top);
      let clientX = parseFloat(e.clientX);
      let clientY = parseFloat(e.clientY);
      let difX = clientX - oriX;
      let difY = clientY - oriY;
      let difAll = Math.sqrt(Math.pow(difX, 2) + Math.pow(difY, 2));
      let angle = Math.atan(Math.abs(difY / difX));
      let dirX = difX > 0 ? 1 : difX === 0 ? 0 : -1;
      let dirY = difY > 0 ? 1 : difY === 0 ? 0 : -1;
      if (difAll <= speed) {
        man.style.left = clientX + "px";
        man.style.top = clientY + "px";
        clearInterval(interval)
      } else {
        man.style.left = oriX + dirX * speed * Math.cos(angle) + "px";
        man.style.top = oriY + dirY * speed * Math.sin(angle) + "px";
      }
    }, 20)
  })
  /**键盘事件*/
  document.addEventListener("keydown", function (e) {
    switch (e.code) {
      case "Keys":
      case "KeyS": {
        clearInterval(interval);
      }
        break;
    }
  })
}