/**@module*/
import io from 'socket.io-client';
import App from './app';
import EditControl from './tool/EditControl.min.js'
import BABYUI from './babyui/babyui';
import createJSON from './tool/createJSON';
import initSceneByJSON from './tool/initSceneByJSON';
import Tool from './tool/tool'

let scene = null;
let app = null;
let multiDebugDom = $(".babylon-material-editor");

/**@Class */
class MultiDebug {
  /**执行UI模块方法,兼容错误处理
   * @param {string} module - 模块名字，"chatModule"||"MenuModule"||"lanModule"||"picModule"||"debugModule"||"socketModule"
   * @param {string} func - 要执行的模块的方法，如"openWindow"
   * @param {Object[]} arg - 传入模块方法的参数
   * */
  static exe(module, func, ...arg) {
    let modules = null;
    if (!(modules = MultiDebug.modules)) {
      console.warn("需要先实例化MultiDebug,才能调用模块");
      return;
    }
    if (modules[module] && modules[module][func] && modules[module][func].apply) {
      return modules[module][func].apply(modules[module], arg);
    }
  }

  /**获取模块数据,兼容错误处理
   * @param {string} module - 模块名字，"chatModule"||"MenuModule"||"lanModule"||"picModule"||"debugModule"||"socketModule"
   * @param {string} pro - 要获取的模块的member
   * */
  static get(module, pro) {
    let modules = null;
    if (!(modules = MultiDebug.modules)) {
      console.warn("需要先实例化MultiDebug,才能调用模块");
      return;
    }
    if (modules[module] && modules[module].hasOwnProperty && modules[module].hasOwnProperty(pro)) {
      return modules[module][pro];
    }
    return null;
  }

  /**设置模块数据,兼容错误处理
   * @param {string} module - 模块名字，"chatModule"||"MenuModule"||"lanModule"||"picModule"||"debugModule"||"socketModule"
   * @param {string} pro - 要设置的模块的属性
   * @param {string} val - 要设置的模块的值
   * */
  static set(module, pro, val) {
    let modules = null;
    if (!(modules = MultiDebug.modules)) {
      console.warn("需要先实例化MultiDebug,才能调用模块");
      return;
    }
    if (modules[module]) {
      modules[module][pro] = val;
    }
    return null;
  }

  /**执行事件接口方法,兼容错误处理
   * @param {string} module - 接口对应模块名字，"chatModule"||"MenuModule"||"lanModule"||"picModule"||"debugModule"||"socketModule"
   * @param {string} func - 要执行的接口的方法，如"openWindow"
   * @param {Object[]} arg... - 传入接口方法的参数
   */
  static exeI(module, func, ...arg) {
    let _module, _func;
    if (MultiDebug.Interface.hasOwnProperty(module)) {
      if ((_module = MultiDebug.Interface[module]).hasOwnProperty(func)) {
        _func = _module[func];
        let returnValue = _func.apply && _func.apply(window, arg);
        let api = MultiDebug.Application;
        try {
          if (api[module] && api[module].hasOwnProperty(func)) {
            MultiDebug.exeA.apply(window, [].concat.call([], module, func, arg))
          }
        } catch (e) {
          console.warn(e)
        }
        return returnValue;
      } else {
        console.warn("没有MultiDebug.Interface." + module + "." + func)
      }
    } else {
      console.warn("没有MultiDebug.Interface." + module)
    }
  }

  /**执行应用层接口方法,兼容错误处理
   * @param {string} module - 应用层对应模块名字，"chatModule"||"MenuModule"||"lanModule"||"picModule"||"debugModule"||"socketModule"
   * @param {string} func - 要执行的应用层接口的方法"
   * @param {Object[]} arg - 传入接口方法的参数
   */
  static exeA(module, func, ...arg) {
    let _module, _func;
    if (MultiDebug.Application.hasOwnProperty(module)) {
      if ((_module = MultiDebug.Application[module]).hasOwnProperty(func)) {
        _func = _module[func];
        return _func.apply && _func.apply(window, arg)
      } else {
        console.warn("没有MultiDebug.Application." + module + "." + func)
      }
    } else {
      console.warn("没有MultiDebug.Application." + module)
    }
  }

  /**事件接口
   * @namespace
   */
  static Interface = {
    /** @namespace
     */
    menuModule: {
      /**调试模式触发的事件*/
      onDebugMode: function () {
        MultiDebug.exe("menuModule", "fadeIn");
        MultiDebug.exe("lanModule", "scale1");
        MultiDebug.exe("picModule", "scale1");
      },
      /**浏览模式触发的事件*/
      onViewMode: function () {
        MultiDebug.exe("menuModule", "fadeOut");
        MultiDebug.exe("lanModule", "scale0");
        MultiDebug.exe("picModule", "scale0");
      },
      /**点击聊天菜单触发的事件,并触发切换频道事件
       * @param {string} userName - 点击的名字*/
      onClickChatMenu: function (userName) {
        //打开聊天窗口
        MultiDebug.exe("chatModule", "openWindow");
        //切换到相应聊天频道
        MultiDebug.exeI("chatModule", "onToggleUserChannel", userName);
      },
      /**点击主菜单触发的事件
       * @param {string} itemName - 选项名字*/
      onClickMainMenu: function (itemName) {

      }
    },
    /** @namespace*/
    lanModule: {
      /**点击刷新场景触发的事件*/
      onRefreshScene: function () {

      },
      /**点击局域网列表触发的事件
       * @param {Object} data -点击的那个选项的信息
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {number} data.button - 选项触发的方式 0:左键，1：中键，2：右键
       * @param {boolean} data.config - 是否是点击配置按钮触发的事件
       * @param {Object} data.dom - 触发的选项DOM元素，jQuery对象
       * @param {Object} data.data - 额外数据
       * */
      onClickLanList: function (data) {
        //点击配置按钮出现单个菜单栏
        if (data.config) {
          MultiDebug.exe("lanModule", "showSubMenu", data.dom, {
            src: data.dom
          })
        }
      },
      /**鼠标划过
       * @param {object} data
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {Object} data.dom - 触发的选项DOM元素，jQuery对象
       * @param {Object} data.data - 额外数据
       */
      onMouseoverLanList: function (data) {

      },
      /**鼠标划过
       * @param {object} data
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {Object} data.dom - 触发的选项DOM元素，jQuery对象
       * @param {Object} data.data - 额外数据
       */
      onMouseoutLanList: function (data) {

      },
      /**点击锁定物体触发的事件
       * @param {Object} itemName - 点击的副菜单栏具体选项
       * @param {Object} subMenu - 副菜单栏对象
       * @param {string} li - 源lan
       * */
      onClickSubMenu: function (itemName, subMenu, li) {

      }
    },
    /**@namespace*/
    picModule: {
      /**切换图片板块触发的事件
       * @param {Object} button -点击的按钮,jqueryDom
       * @param {Object} panel - 点击的按钮对应的picPanel,jqueryDom
       * */
      onTogglePicPanel: function (button, panel) {
        //激活按钮
        MultiDebug.exe("picModule", "activeButton", button);
        //激活picPanel
        MultiDebug.exe("picModule", "showPanel", panel);
      },
      /**点击picPanel中的图片触发的事件
       * @param {Object} data 触发事件对象
       * @param {number} data.button 触发方式:0:左键，1：中键，2：右键
       * @param {number} data.fileName 文件名字
       * @param {number} data.picName 点击的具体图片的名字
       * @param {number} data.path 存放图片的文件夹路径，
       * @param {number} data.type -skybox||texture
       * */
      onClickPic: function (data) {
        console.log(data);
      },
      /**拖动图片触发的事件
       * @param {Object} data - 信息
       * @param {string} data.fileName - 文件名
       * @param {string} data.path - 文件路径
       * @param {string} data.type - "skybox||texture"
       * @param {number} data.panel - 1,2,3,4*/
      onDragPic: function (data) {

      }
    },
    /** @namespace*/
    chatModule: {
      /**改名触发的事件
       * @param {string} userInfo.myName - 本人姓名
       *@param {string} userInfo.myImg - 本人图片路径
       * */
      onRename: function (userInfo) {
        MultiDebug.exe("socketModule", "showRename", userInfo);
      },
      /**切换聊天频道触发的事件
       * @param {string} userName - 切换的频道的名字 */
      onToggleUserChannel: function (userName) {
        if (userName) {
          //高亮显示当前频道
          MultiDebug.exe("chatModule", "highlightUser", userName);
          //更新chatwho
          MultiDebug.exe("chatModule", "updateChatWithWho", userName);
          //更新currentChannel
          MultiDebug.set("chatModule", "currentChannel", userName);
          //更新currentImg
          let userList = MultiDebug.get("socketModule", "userList");
          if (userList.some(function (user) {
            if (user.userName == userName) {
              MultiDebug.set("chatModule", "currentImg", user.userImg);
              return true;
            }
          })) {
            MultiDebug.set("chatModule", "currentImg", null);
          }
          //更新聊天窗口
          let buffer = MultiDebug.exe("chatModule", "getChatContentBuffer");
          let logContentBuffer = MultiDebug.exe("chatModule", "getLogContentBuffer");
          let logRoom = MultiDebug.get("chatModule", "logRoom");
          if (userName == logRoom) {
            MultiDebug.exe("chatModule", "createChatBody", logContentBuffer);
          } else {
            MultiDebug.exe("chatModule", "createChatBody", buffer);
          }
          //消息日志不能输入
          if (userName == MultiDebug.get("chatModule", "logRoom")) {
            MultiDebug.exe("chatModule", "hideSubmit");
          } else {
            MultiDebug.exe("chatModule", "showSubmit");
          }
          //取消消息未读提醒
          MultiDebug.exe("chatModule", "hideContentReminder", userName)
        }
      },
      /**发送聊天信息触发的事件
       * @param {Object} data[] - 聊天数据包
       * @param {string} data.from - 发送者名字
       * @param {string} data.to - 发送对象名字
       * @param {string} data.content - 聊天内容
       * @param {string} data.time - 聊天历史时间
       * */
      onSubmitChatContent: function (data) {
        //追加聊天信息
        MultiDebug.exe("chatModule", "appendChatBody", data);
        //追加聊天缓存
        MultiDebug.exe("chatModule", "appendChatContentBuffer", data);
        //保存到服务器
        MultiDebug.exe("socketModule", "getServerData", "chatContent.length", function (length) {
          if (length == null) {
            MultiDebug.exe("socketModule", "setServerData", "chatContent", [data])
          }
          else {
            MultiDebug.exe("socketModule", "setServerData", "chatContent." + length, data)
          }
        });
        //通知其他用户
        MultiDebug.exe("socketModule", "broadcastOther", "onReceiveChatContent", data)
      },
      /**追加消息日志触发的事件
       * @param {Object} data[] - 聊天数据包
       * @param {string} data.from - 发送者名字
       * @param {string} data.fromImg - 发送者头像
       * @param {string} data.to - 发送对象名字
       * @param {string} data.toImg - 发送对象头像
       * @param {string} data.content - 聊天内容
       * @param {string} data.time - 聊天历史时间
       * */
      onAppendLogContent: function (data) {
        //保存到服务器
        MultiDebug.exe("socketModule", "getServerData", "logContent.length", function (length) {
          if (length == null) {
            MultiDebug.exe("socketModule", "setServerData", "logContent", [data])
          }
          else {
            MultiDebug.exe("socketModule", "setServerData", "logContent." + length, data)
          }
        });
      }
    },
    /**@namespace*/
    debugModule: {
      /**当调试值发生变化时候触发的事件
       * @param {object} mesh -当前正在调试的物体*/
      onChange: function (mesh) {
      }
    },
    /**@namespace*/
    socketModule: {
      /**成功登陆触发的事件
       * */
      onLogin: function () {
        //------处理聊天信息
        MultiDebug.exe("socketModule", "getServerData", "chatContent", function (data) {
          //初始化到缓存
          MultiDebug.exe("chatModule", "initChatContentBuffer", data);
        })
        //------处理日志信息
        MultiDebug.exe("socketModule", "getServerData", "logContent", function (data) {
          //初始化到缓存
          MultiDebug.exe("chatModule", "initLogContentBuffer", data);
        })
        //通知其他人
        MultiDebug.exe("socketModule", "broadcastOther", "onOtherPeopleLogin", {
          name: MultiDebug.get("socketModule", "myName"),
          img: MultiDebug.get("socketModule", "myImg")
        })
      },
      /**有其他用户登触发的事件
       * @param {Object} data - 登陆人信息
       * @param {string} data.name - 登陆人姓名
       * @param {string} data.img - 登陆人头像
       * */
      onOtherPeopleLogin: function (data) {
        let name = data.name
        let img = data.img;
        let content = "尊敬的 " + name + " 上线了...";
        // //桌面通知
        MultiDebug.exe("chatModule", "showDesktopMessage", "", content, img);
      },
      /**其他用户离开房间触发的事件
       * @param {string} userName - 登陆人姓名
       * @param {string} userImg - 登陆人头像
       * */
      onOtherPeopleLogOut: function (userName, userImg) {
        let content = userName + " 离开房间了...";
        //桌面通知
        MultiDebug.exe("chatModule", "showDesktopMessage", "", content, userImg);
      },
      /**用户信息发生变化触发的事件,如登陆，登出，改名，改头像...
       * @param {Object} data.myName - 用户名字,如果有此参数代表事件是由当前客户端触发的，否则是他人触发
       * @param {Object} data.myImg -用户头像路径
       * @param {Object[]} data.userList -当前在线用户列表
       * @param {string} data.userList.userName -用户名字
       * @param {string} data.userList.userImg -用户头像路径
       * */
      onUserInfoChange: function (data) {
        //保存本人信息
        if (data.myName) {
          MultiDebug.set("socketModule", "myName", data.myName);
          MultiDebug.set("socketModule", "myImg", data.myImg);
          //更新聊天窗口本人信息,别人收到信息不进行ajax
          MultiDebug.exe("chatModule", "updateMyUserInfo", {
            userName: data.myName,
            userImg: data.myImg
          })
        }
        //更新用户信息数据
        if (data.userList && data.userList.length > 0) {
          MultiDebug.set("socketModule", "userList", data.userList);
        }
        //更新菜单栏在线列表,自己在最上面
        MultiDebug.exe("menuModule", "updateUserList", data.userList.map(function (user) {
            return user.userName
          }).sort(function (a, b) {
            return b == MultiDebug.get("socketModule", "myName");
          })
        )
        //更新聊天窗口在线列表,自己在最上面
        MultiDebug.exe("chatModule", "updateUserList", data.userList.sort(function (a, b) {
          return b.userName == MultiDebug.get("socketModule", "myName");
        }).map(function (user) {
          return {
            userName: user.userName,
            userImg: user.userImg
          }
        }))
      },
      /**有人发送聊天信息触发的事件
       * @param {Object} data[] - 聊天数据包
       * @param {string} data.from - 发送者名字
       * @param {string} data.fromImg - 发送者头像
       * @param {string} data.to - 发送对象名字
       * @param {string} data.toImg - 发送对象头像
       * @param {string} data.content - 聊天内容
       * @param {string} data.time - 聊天历史时间
       * */
      onReceiveChatContent: function (data) {
        //追加到聊天缓存
        MultiDebug.exe("chatModule", "appendChatContentBuffer", data);
        let myName = MultiDebug.get("socketModule", "myName");
        let currentChannel = MultiDebug.get("chatModule", "currentChannel");
        let publicRoom = MultiDebug.get("chatModule", "publicRoom");
        //根据信息来源决定是否刷新聊天窗口
        if ((currentChannel == publicRoom && data.to == publicRoom) || (data.from == currentChannel && data.to == myName)) {
          MultiDebug.exe("chatModule", "appendChatBody", data);
        }
        //桌面提示
        let blur = MultiDebug.get("chatModule", "blur");
        if (blur) {
          MultiDebug.exe("chatModule", "showDesktopMessage", data.from, data.content, data.fromImg)
        }
        //长短提示
        if (currentChannel == publicRoom && data.to == publicRoom) {
          MultiDebug.exe("chatModule", "showContentReminder", data.to, true)
        } else if (currentChannel != publicRoom && data.to == publicRoom) {
          MultiDebug.exe("chatModule", "showContentReminder", data.to, false)
        }
        if (currentChannel == data.from && data.to == myName) {
          MultiDebug.exe("chatModule", "showContentReminder", data.from, true)
        } else if (currentChannel != data.from && data.to == myName) {
          MultiDebug.exe("chatModule", "showContentReminder", data.from, false)
        }
      },
      /** @param {Object} data -点击的那个选项的信息
       * @param {string} dom -dom名字
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {number} data.button - 选项触发的方式 0:左键，1：中键，2：右键
       * @param {boolean} data.config - 是否是点击配置按钮触发的事件
       * @param {Object} data.dom - 触发的选项DOM元素，jQuery对象
       * */
      onReceiveLanListChange: function (data, dom) {

      },
      /**收到debug信息
       * @param {string} data.lightName
       * @param {string} data.materialId
       * @param {string} data.json
       * */
      onReceiveDebugChange: function (data) {

      }
    }
  }
  /**应用层接口,建议只在此层修改代码
   * @namespace
   */
  static Application = {
    /**@namespace*/
    menuModule: {
      /**调试模式触发的事件*/
      onDebugMode: function () {
        app.debugMode();
      },
      /**浏览模式触发的事件*/
      onViewMode: function () {
        app.viewMode();
      },
      /**点击主菜单触发的事件
       * @param {string} itemName - 选项名字*/
      onClickMainMenu: function (itemName) {
        let myName = MultiDebug.get("socketModule", "myName");

        function lock(noMessage) {
          let lanList = MultiDebug.get("lanModule", "lanList");
          lanList.children("li").each(function (i, dom) {
            let data = dom.data;
            let stat = data.stat;
            let name = data.name;
            if (stat == "success" || stat == "warn") {
              //更新服务器
              MultiDebug.exe("socketModule", "setServerData", "lockInfo." + name, {
                userName: myName,
              });
              //更新本地LANLIST
              MultiDebug.exe("lanModule", "refreshSingleLan", {
                stat: "success",
                config: true,
                title: "您正在调试...",
                data: {stat: "success"}
              }, $(dom));
              //通知其他在线用户
              MultiDebug.exe("socketModule", "broadcastOther", "onReceiveLanListChange", {
                name: data.name,
                meshId: data.meshId,
                stat: "danger",
                config: false,
                title: myName + "正在调试......"
              })
            }
          });

          !noMessage && Tool.showMessage("一键锁定成功......", 1);
          !noMessage && MultiDebug.exe("chatModule", "appendLogContentBuffer", "一键锁定成功......");
        }

        function unlock() {
          let lanList = MultiDebug.get("lanModule", "lanList");
          lanList.children("li").each(function (i, dom) {
            let data = dom.data;
            let stat = data.stat;
            let name = data.name;
            //取消高亮
            MultiDebug.exe("lanModule", "removeHightlightLi", $(dom));
            if (stat == "success") {
              //更新服务器
              MultiDebug.exe("socketModule", "setServerData", "lockInfo." + name, null)
              //更新本地LANLIST
              MultiDebug.exe("lanModule", "refreshSingleLan", {
                stat: "warn",
                config: true,
                data: {stat: "warn"}
              }, $(dom));
              //通知其他在线用户
              MultiDebug.exe("socketModule", "broadcastOther", "onReceiveLanListChange", {
                name: data.name,
                meshId: data.meshId,
                stat: "warn",
                config: true,
                title: "未锁定"
              })
            }
          })
          Tool.showMessage("一键解锁成功......", 1);
          MultiDebug.exe("chatModule", "appendLogContentBuffer", "一键解锁成功......");
          //取消调试框
          MultiDebug.exe("debugModule", "hideDebug");
        }

        function saveVersion() {
          Tool.showPrompt("请输入你要保存的版本的名字", function (data) {
            //没有重名的
            let json = createJSON(scene, {
              appPath: MultiDebug.get("socketModule", "appLibPath"),
              publicPath: MultiDebug.get("socketModule", "publicLibPath"),
              console: false,
              window: false,
              mini: false
            });
            MultiDebug.exe("socketModule", "saveAppFile", "version/" + new Date().getTime() + " " + data, json);
            Tool.showMessage("保存版本" + data + "成功......");
            MultiDebug.exe("chatModule", "appendLogContentBuffer", "保存版本" + data + "成功......")
          });
        }

        function getVersion() {
          MultiDebug.exe("socketModule", "getAppFileList", "version", function (data) {
            let list = data.sort(function (a, b) {
              return parseInt(b) - parseInt(a)
            });
            let map = {};
            list = list.map(function (name) {
              let reg = name.match(/(.*\s)(.*)/g);
              let date = RegExp.$1;
              let versionName = RegExp.$2;
              let showName = versionName;
              for (let i = 0; i < 20 - versionName.length; i++) {
                showName += " - ";
              }
              showName += Tool.getDayTime(date, true);
              map[showName] = name;
              return showName;
            })
            Tool.showSelect("请选择你要回溯的版本", list, function (showName) {
              let fileName = map[showName];
              if (fileName) {
                let appName = MultiDebug.get("socketModule", "appName");
                //自动一键锁定
                lock(true);
                //版本回溯,无缓存
                MultiDebug.exe("socketModule", "getAppFile", "version/" + fileName, (data) => {
                  initSceneByJSON(scene, data);
                  Tool.showMessage("版本已经成功回溯到 " + showName);
                  //Tool.showMessage("请注意，服务器只保存您锁定的物体的数据!他人锁定的物体不会进行保存...", 2, "warn");
                  MultiDebug.exe("chatModule", "appendLogContentBuffer", "版本已经成功回溯到 " + showName)
                  //保存到服务器
                  let lanList = MultiDebug.get("lanModule", "lanList");
                  lanList.children("li").each(function (i, dom) {
                    let data = dom.data;
                    let stat = data.stat;
                    let mesh = data.mesh;
                    if (stat == "success") {
                      MultiDebug.exeA("debugModule", "onChange", mesh);
                    }
                  })
                  //灯光发送到服务器
                  scene.lights.forEach(function (light) {
                    MultiDebug.exeA("debugModule", "onChange", light);
                  })
                  //重置调试UI
                  app.material.refreshDebugUI(MultiDebug.get("debugModule", "currentDebugMesh"));
                })
              }
            })
          })
        }

        function delVersion() {
          MultiDebug.exe("socketModule", "getAppFileList", "version", function (data) {
            let list = data.sort(function (a, b) {
              return parseInt(b) - parseInt(a)
            });
            let map = {};
            list = list.map(function (name) {
              let reg = name.match(/(.*\s)(.*)/g);
              let date = RegExp.$1;
              let versionName = RegExp.$2;
              let showName = versionName;
              for (let i = 0; i < 20 - versionName.length; i++) {
                //showName += "&nbsp;&nbsp;";
                showName += " - ";
              }
              showName += Tool.getDayTime(date, true);
              map[showName] = name;
              return showName;
            })
            Tool.showSelect("请选择你要删除的版本", list, function (showName) {
              let fileName = map[showName];
              if (fileName) {
                let appName = MultiDebug.get("socketModule", "appName");
                MultiDebug.exe("socketModule", "delAppFile", "version/" + fileName);
                Tool.showMessage("成功删除版本" + showName);
                MultiDebug.exe("chatModule", "appendLogContentBuffer", "成功删除版本" + showName)
              }
            })
          })
        }

        function updatePic() {
          app.refreshPicPanel();
        }

        function setOutlineWidth() {
          Tool.showPrompt("设置描边粗细<br>当前:" + app.outline.getOutlineWidth(), function (num) {
            num = Number(num);
            if (typeof num == "number") {
              app.outline.setOutlineWidth(num);
              MultiDebug.exe("socketModule", "setServerData", "outlineWidth", num)
            }
          })
        }

        //1/26 调试所有光源
        function debugLight() {
          app.debugLight()
        }

        function undebugLight() {
          app.undebugLight()
        }

        function setLightBallSize() {
          Tool.showPrompt("设置光球大小<br>当前:" + app.light.getLightBallSize(), function (num) {
            num = Number(num);
            if (typeof num == "number") {
              app.light.setLightBallSize(num);
              MultiDebug.exe("socketModule", "setServerData", "lightBallSize", num)
            }
          })
        }

        switch (itemName) {
          case "一键锁定":
            lock();
            break;
          case "一键解锁":
            unlock();
            break;
          case "显示物体":
            app.showMeshes();
            break;
          case "保存版本":
            saveVersion();
            break;
          case "版本回溯":
            getVersion();
            break;
          case "删除版本":
            delVersion();
            break;
          case "更新图库":
            updatePic();
            break;
          case "描边粗细":
            setOutlineWidth()
            break;
          case "调试光源":
            debugLight()
            break;
          case "关闭光源":
            undebugLight()
            break;
          case "光球大小":
            setLightBallSize()
            break;
        }
      }
    },
    /**@namespace*/
    lanModule: {
      onRefreshScene: function () {
        app.refreshLanList();
      },
      /**点击局域网列表触发的事件
       * @param {Object} data -点击的那个选项的信息
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {number} data.button - 选项触发的方式 0:左键，1：中键，2：右键
       * @param {boolean} data.config - 是否是点击配置按钮触发的事件
       * @param {Object} data.dom - 触发的选项DOM元素，jQuery对象
       * @param {Object} data.data - 额外数据
       * */
      onClickLanList: function (data) {
        //app.renderMesh(data.data.mesh)
      },
      /**鼠标划过
       * @param {object} data
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {Object} data.dom - 触发的选项DOM元素，jQuery对象
       * @param {Object} data.data - 额外数据
       */
      onMouseoverLanList: function (data) {
        app.outline.renderMesh(data.data.mesh)
      },
      /**鼠标划过
       * @param {object} data
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {Object} data.dom - 触发的选项DOM元素，jQuery对象
       * @param {Object} data.data - 额外数据
       */
      onMouseoutLanList: function (data) {
        app.outline.unrenderMesh(data.data.mesh)
      },
      /**点击锁定物体触发的事件
       * @param {Object} itemName - 点击的副菜单栏具体选项
       * @param {Object} subMenu - 副菜单栏对象
       * @param {string} li - 源lan
       * @param {Object} li[0].data - 额外数据
       * @param {string} li[0].data.name
       * @param {Object} li[0].data.stat
       * @param {Object} li[0].data.meshId
       * @param {Object} li[0].data.mesh
       * */
      onClickSubMenu: function (itemName, subMenu, li) {
        let myName = MultiDebug.get("socketModule", "myName");
        let data = li[0].data;

        function lock() {
          MultiDebug.exe("socketModule", "setServerData", "lockInfo." + data.name, {
            userName: myName
          }, function () {
            Tool.showMessage("锁定成功...", 1);
            //更新本地LANLIST
            MultiDebug.exe("lanModule", "refreshSingleLan", {
              stat: "success",
              config: true,
              title: "您正在调试...",
              data: {stat: "success"}
            }, li);
            //通知其他在线用户
            MultiDebug.exe("socketModule", "broadcastOther", "onReceiveLanListChange", {
              name: data.name,
              meshId: data.meshId,
              stat: "danger",
              config: false,
              title: myName + "正在调试......"
            })
          });
        }

        function unlock() {
          //取消高亮
          MultiDebug.exe("lanModule", "removeHightlightLi", li);
          //解锁
          MultiDebug.exe("socketModule", "setServerData", "lockInfo." + data.name, null, function (e) {
            Tool.showMessage("解锁成功...", 1);
            //更新本地LANLIST
            MultiDebug.exe("lanModule", "refreshSingleLan", {
              stat: "warn",
              config: true,
              data: {stat: "warn"}
            }, li);
            //通知其他在线用户
            MultiDebug.exe("socketModule", "broadcastOther", "onReceiveLanListChange", {
              name: data.name,
              meshId: data.meshId,
              stat: "warn",
              config: true,
              title: "未锁定"
            })
          });
          //如果物体正在调试，则取消调试框
          if (MultiDebug.get("debugModule", "currentDebugMesh") == data.mesh) {
            MultiDebug.exe("debugModule", "hideDebug")
          }
        }

        function exportMaterial() {
          if (data.mesh.material) {
            app.exportMaterial(data.mesh.material)
          } else {
            Tool.showMessage("物体没有材质,无法导出...", 1, "danger")
          }
        }

        function importMaterial() {
          if (data.mesh.material) {
            app.importMaterial(data.mesh, data.mesh.material)
          } else {
            Tool.showMessage("物体没有材质,无法导出...", 1, "danger")
          }

        }

        switch (itemName) {
          case "锁定物体": {
            lock();
          }
            break;
          case "解锁物体": {
            unlock();
          }
            break;
          case "隐藏物体": {
            app.hideMesh(data.mesh);
          }
            break;
          case "显示物体": {
            app.showMesh(data.mesh);
          }
            break;
          case "调试材质": {
            //自动锁定
            if (data.stat == "success" || data.stat == "warn") {
              if (data.stat == "warn") {
                lock();
              }
              //检测物体是否有材质
              if (MultiDebug.exe("debugModule", "showDebug", data.mesh)) {
                //显示调试框
                app.material.showDebug(data.mesh);
                //高亮显示
                MultiDebug.exe("lanModule", "highlightLi", li);
              }
            }
          }
            break;
          case "复制材质":
            app.material.copyMaterial(data.mesh.material, data.mesh);
            break;
          case "粘贴材质":
            if (data.stat == "success" || data.stat == "warn") {
              if (data.stat == "warn") {
                lock();
              }
              app.material.pasteMaterial(data.mesh.material, data.mesh);
            }
            break;
          case "导入材质":
            if (data.stat == "success") {
              importMaterial();
            } else {
              Tool.showMessage("请先锁定", 1, "warn")
            }
            break;
          case "导出材质":
            if (data.stat == "success") {
              exportMaterial();
            } else {
              Tool.showMessage("请先锁定", 1, "warn")
            }
            break;
          case "转化材质":
            if (data.stat == "success" || data.stat == "warn") {
              if (data.stat == "warn") {
                lock();
              }
              if (data.mesh.material) {
                let materiaTypeList = app.material.getMaterialTypeList();
                let myMaterialType = data.mesh.material.getClassName();
                let canToggleList = materiaTypeList.filter(function (kind) {
                  return kind != myMaterialType;
                })
                Tool.showSelect("您当前的材质类型为:<br>" + myMaterialType + "<br>请选择您要转换的材质类型", canToggleList, function (type) {
                  app.material.toggleMaterialType(data.mesh, type)
                })
              } else {
                Tool.showMessage("请先给物体赋予材质再进行转化", 1, "warn")
              }
            }
            break;
        }
      },
    },
    picModule: {},
    chatModule: {},
    /**@namespace*/
    debugModule: {
      /**当调试值发生变化时候触发的事件
       * @param {object} mesh -当前正在调试的物体或灯光*/
      onChange: function (mesh) {
        if (mesh && mesh.material) {
          //获取调试的JSON
          let json = createJSON(scene, {meshes: mesh, console: false, window: false});
          json = JSON.parse(json);
          json = json.materials[mesh.material.name]
          //发送到服务器
          MultiDebug.exe("socketModule", "setServerData", "debugInfo.materials." + mesh.material.name, json);
          //发送给其他人材质JSON
          MultiDebug.exe("socketModule", "broadcastOther", "onReceiveDebugChange", {
            materialId: mesh.material.id,
            json: json
          })
        }
        if (mesh && mesh instanceof BABYLON.Light) {
          //获取调试的JSON
          let lightName = mesh.name;
          let json = createJSON(scene, {lights: mesh, console: false});
          json = JSON.parse(json);
          json = json.lights[lightName];
          if (json) {
            //发送灯光JSON到服务器
            MultiDebug.exe("socketModule", "setServerData", "debugInfo.lights." + lightName, json);
            //发送给其他人灯光JSON
            MultiDebug.exe("socketModule", "broadcastOther", "onReceiveDebugChange", {
              lightName: lightName,
              json: json
            })
          }
        }
      }
    },
    /**@namespace*/
    socketModule: {
      /**登陆成功的事件*/
      onLogin: function () {
        //保存初始纹理
        app.storeInitialTexture();
        //更新lanlist
        app.refreshLanList(true);
        //更新图片库
        app.refreshPicPanel(true);
        //自动打开第一个
        MultiDebug.exeI("picModule", "onTogglePicPanel", MultiDebug.get("picModule", "button1"), MultiDebug.get("picModule", "panel1"))
        //更新调试数据
        app.refreshDebug();
        //更新描边数据
        MultiDebug.exe("socketModule", "getServerData", "outlineWidth", function (data) {
          if (typeof data === "number") {
            app.outline.setOutlineWidth(data)
          }
        })
        //更新光源数据
        MultiDebug.exe("socketModule", "getServerData", "lightBallSize", function (data) {
          if (typeof data === "number") {
            app.light.setLightBallSize(data)
          }
        })
        //切换调试模式
        MultiDebug.exeI("menuModule", "onDebugMode");
      },
      /** @param {Object} data -点击的那个选项的信息
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {string} data.meshId - ID
       * @param {boolean} data.config - 是否显示配置图标
       * @param {Object} data.title - 替换的title
       * */
      onReceiveLanListChange: function (data) {
        MultiDebug.exe("lanModule", "refreshSingleLan", data, data.name, {meshId: data.meshId})
      },
      /**收到debug信息
       * @param {string} data.lightName
       * @param {string} data.materialId
       * @param {string} data.json
       * */
      onReceiveDebugChange: function (data) {
        function doLight() {
          let light = scene.getLightByName(data.lightName);
          if (light) {
            let json = {};
            json[light.name] = data.json
            initSceneByJSON(scene, {
              lights: json
            }, null, light);
            // app.refreshLightBall(light);
          }
        }

        function doMaterial() {
          let material = scene.getMaterialByID(data.materialId);
          if (material) {
            let json = {};
            json[material.name] = data.json
            initSceneByJSON(scene, {
              appPath: MultiDebug.get("socketModule", "appLibPath"),
              publicPath: MultiDebug.get("socketModule", "publicLibPath"),
              materials: json
            }, material)
          }
        }

        if (data.lightName) {
          doLight();
        } else {
          doMaterial();
        }
      }
    }
  }
  static modules = null;
  static opt = {
    scene: window.scene,
    ip: window.location.hostname,
    port: 3000
  }
  menuModule = null;
  lanModule = null;
  picModule = null;
  chatModule = null;
  debugModule = null;
  socketModule = null;

  constructor(opt) {
    Object.assign(MultiDebug.opt, opt)
    scene = MultiDebug.opt.scene
    MultiDebug.modules = this;
    app = new App(scene);
    this.menuModule = new this.MenuModule();
    this.lanModule = new this.LanModule();
    this.picModule = new this.PicModule();
    this.chatModule = new this.ChatModule();
    this.debugModule = new this.DebugModule();
    this.socketModule = new this.SocketModule();
  }

  /**开启菜单模块
   * @class*/
  MenuModule() {
    let navTop = multiDebugDom.find(".nav-top");
    this.navTop = navTop;
    let menus = multiDebugDom.find(".nav-top .section .z-menu");
    //ul
    let debugMenu = $("#z_debugMode");
    let mainMenu = $("#z_mainMenu");
    //span
    let debugMenuName = debugMenu.parent().children().eq(1)
    //ul
    let chatMenu = $("#z_online");

    function init() {
      //上拉下拉
      function pull() {
        menus.blur(function (e) {
          let $dom = $(e.srcElement || e.target).children("ul");
          $dom.slideUp({
            duration: 300,
            easing: "easeInOutBack"
          });
          return false;
        }).click(function (e) {
          let $dom = $(e.srcElement || e.target).children("ul");
          $dom.slideToggle({
            duration: 300,
            easing: "easeInOutBack"
          });
          return false;
        }).find("ul").click(function (e) {
          let $dom = $(e.srcElement || e.target);
          if ($dom[0].nodeName.toUpperCase() == "LI") {
            $dom.parent().slideUp({
              duration: 300,
              easing: "easeInOutBack"
            });
          }
          return false;
        })
      }

      pull();
      //切换调试模式;
      debugMenu.children("li").click(function (e) {
        let $dom = $(e.srcElement || e.target);
        debugMenuName.html($dom.html());
        if ($dom.index() === 0) {
          MultiDebug.exeI("menuModule", "onDebugMode");
        } else if ($dom.index() === 1) {
          MultiDebug.exeI("menuModule", "onViewMode");
        }
      })
      //切换聊天列表
      chatMenu.click(function (e) {
        let $dom = $(e.srcElement || e.target);
        if ($dom[0].nodeName.toUpperCase() == "LI") {
          MultiDebug.exeI("menuModule", "onClickChatMenu", $dom.html());
        }
      })
      //工具选项
      mainMenu.children("li").click(function (e) {
        let $dom = $(e.srcElement || e.target);
        let itemName = $dom.html();
        MultiDebug.exeI("menuModule", "onClickMainMenu", itemName)
      })
    }

    init();
    /**更新菜单栏用户列表
     * @param {Object[]} names - 名字数组*/
    this.updateUserList = function (names) {
      chatMenu.html("");
      names.forEach(function (name, i) {
        let li = $("<li " + ((i == 0) ? " " : "class=\"border\" ") + ">" + name + "</li>");
        chatMenu.append(li)
      })
    }
    /**显示模块*/
    this.show = function () {
      navTop.show();
    }
    /**隐藏模块*/
    this.hide = function () {
      navTop.hide();
    }
    /**渐现*/
    this.fadeIn = function () {
      this.navTop.removeClass("opacity");
    }
    /**渐隐,虽然隐藏了，但是鼠标滑过会显示*/
    this.fadeOut = function () {
      this.navTop.addClass("opacity");
    }
  }

  /**开启局域网模块
   * @class*/
  LanModule() {
    let nav = multiDebugDom.find(".nav-lan");
    let bar = multiDebugDom.find(".nav-lan-dragbar");
    let lanTitle = multiDebugDom.find(".nav-lan .title");
    let lanList = multiDebugDom.find(".nav-lan .lan-list");
    let refreshButton = lanTitle.find(".refresh");
    let subMenu = multiDebugDom.find("ul.submenu");
    /**@member*/
    this.lanList = lanList;
    /**
     * 更新局域网状态,同时更新滚动条高度和lanList高度
     * @param {Object[]} json - 用于显示LanList的JSON数据
     * @param {string} json[].name - 显示的名字
     * @param {string} json[].stat - 显示的状态"success"||"warn"||"danger"
     * @param {string} json[].config - 是否添加设置iconfont
     * @param {string} json[].title - li元素title
     * @param {Object} json[].data - 传入li的额外数据
     */
    this.refreshLanList = function (json) {
      if (typeof json == "object") {
        nav.innerHeight(window.innerHeight - 200);
        bar.innerHeight(window.innerHeight - 200);
        nav.css("width", "auto");
        lanList.html("");
        [].concat.call(json).forEach(function (info) {
          if (!info)
            return;
          let stat = info.stat;
          let name = info.name;
          let dom = $("<li>");
          let statSpan = $("<span class=stat>");
          let nameSpan = $("<span>");
          statSpan.addClass("color-" + stat);
          nameSpan.html(name);
          dom.append(statSpan).append(nameSpan);
          //配置按钮点击事件
          if (info.config) {
            let config = $("<span class='iconfont config'>")
            dom.append(config);
            //配置按钮点击事件
            dom[0].config = true;
          } else {
            dom[0].config = false;
          }
          if (info.title) {
            dom[0].title = info.title;
          }
          if (info.data) {
            for (let key in info.data) {
              if (!dom[0].data) {
                dom[0].data = {};
              }
              dom[0].data[key] = info.data[key];
              if (key == "mesh") {
                info.data[key].li = dom;
              }
            }
          }
          lanList.append(dom);
        })
        //更新高度
        lanList.innerHeight(nav.innerHeight() - lanList.position().top);
      }
      //初始化拖拽条
      bar.css("left", nav.innerWidth());
      oriWidth = nav.innerWidth();
    }
    /**
     * 更新单个局域网状态
     * @param {Array} json - 用于显示LanList的JSON数据
     * @param {Array|String} dom - 需要更改状态的的dom
     * @param {Object} data - 需要额外验证的数据,只有DOM为字符串的情况下才开启匹配
     * @param {string} json.name - 显示的名字
     * @param {string} json.stat - 显示的状态"success"||"warn"||"danger"
     * @param {string} json.config - 是否添加设置iconfont
     * @param {string} json.title - li元素title
     * @param {string} json.data - li元素的额外数据
     */
    this.refreshSingleLan = function (json, dom, data) {
      if (dom && json) {
        if (typeof dom == "string") {
          lanList.children().each(function (i, lan) {
            lan = $(lan);
            let name = lan.children().eq(1);
            if (name.html() == dom) {
              dom = lan;
              for (let key in data) {
                if (lan[0].data[key] == data[key]) {
                  dom = lan;
                  break;
                }
              }
            }
          })
        }
        let stat = dom.find(".stat")
        let name = dom.children().eq(1);
        let config = dom.find(".config");
        if (json.title) {
          dom[0].title = json.title;
        }
        if (json.stat) {
          stat.removeClass().addClass("stat color-" + json.stat);
        }
        if (json.name) {
          name.html(json.name);
        }
        if (json.config) {
          if (config.length == 0) {
            let config = $("<span class='iconfont config'>");
            dom.append(config);
          }
          //配置按钮点击事件
          dom[0].config = true;
        } else {
          config.remove();
          dom[0].config = false;
        }
        if (json.data) {
          for (let key in json.data) {
            dom[0].data[key] = json.data[key];
          }
        }
      }
    }
    /**显示子菜单栏在li元素的右边
     * @param {Object} dom - 触发的选项li元素，jQuery对象
     * @param {Object} data - 传入副菜单的额外数据，可选
     * @param {Number} x    - 如果有此参数，则强制修改clientX
     * @param {Number} y    - 如果有此参数，则强制修改clientY
     */
    this.showSubMenu = function (dom, data, x, y) {
      try {
        if (data) {
          subMenu[0].data = data;
        }
        let height = subMenu.innerHeight();
        subMenu.show({
          duration: 300,
          easing: "easeInOutBack"
        });
        let windowHeight = window.innerHeight;
        let top = y || dom.offset().top - window.scrollY;
        let left = x || (lanList.innerWidth() + lanList.offset().left + 15);
        if (height + top > windowHeight) {
          subMenu.css("top", top - height + (y ? 0 : dom.innerHeight()) + "px")
        } else {
          subMenu.css("top", top + "px");
        }
        subMenu.css("left", left + "px")
        subMenu.focus();
      } catch (e) {
        console.warn(e)
      }
    }
    /**高亮显示lanList
     * @param {Object} li -jqueryDom li*/
    this.highlightLi = function (dom) {
      lanList.children().each(function (i, dom) {
        $(dom).removeClass("active")
      })
      $(dom).addClass("active");
    }
    /**取消高亮显示
     * @param {Object} li -jqueryDom li*/
    this.removeHightlightLi = function (li) {
      li.removeClass("active")
    }
    /**滚动到li
     * @param {Object} li -jqueryDom li*/
    this.scrollToLi = function (li) {
      try {
        lanList.children().each(function (i, dom) {
          $(dom).removeClass("current-pick");
        })
        lanList.scrollTop(li.innerHeight() * li.index());
        li.addClass("current-pick");
        //li.on("mousemove", function () {
        //lanList.on("mouseover", function (e) {
        //    if (e.target.nodeName == "LI") {
        //li.removeClass("current-pick");
        //li.off("mousemove");
        //}
        //})
      } catch (e) {
        console.warn(e)
      }
    }
    /**显示模块*/
    this.show = function () {
      nav.stop().show();
      bar.stop().show();
    }
    /**隐藏模块*/
    this.hide = function () {
      nav.stop().hide();
      bar.stop().hide();
    }
    let oriWidth = null;

    function init() {
      let px = null;
      let canDrag = false;
      let width = null;
      //初始化拖拽条
      nav.innerHeight(window.innerHeight - 200);
      bar.innerHeight(window.innerHeight - 200);
      bar.css("left", nav.innerWidth());
      oriWidth = nav.innerWidth();

      function move() {
        function mousedown(e) {
          if (e.target.nodeName.toUpperCase() == "LI") {
            return;
          }
          canDrag = true;
          px = e.clientX;
          width = nav.width();
          bar.removeClass("hide")
        }

        bar.on("mousedown", mousedown);
        nav.on("mousedown", mousedown);
        $(document).on("mousemove", function (e) {
          if (canDrag) {
            let dif = e.clientX - px;
            nav.width(width + dif);
            bar.css("left", nav.innerWidth());
          }
        })
        $(document).on("mouseup", function () {
          canDrag = false;
          if (window.parseInt(bar.css("left")) <= 30) {
            nav.width(0);
            bar.css("left", nav.innerWidth());
            bar.addClass("hide")
          }
        })
      }

      move();
      //更新场景
      refreshButton.click(function () {
        MultiDebug.exeI("lanModule", "onRefreshScene")
      })

      //li点击事件
      function onClickLanList(e) {
        let src = $(e.srcElement || e.target);
        if (src[0].nodeName == "LI") {
          let stat = src[0].data.stat;
          let name = src[0].data.name;
          MultiDebug.exeI("lanModule", "onClickLanList", {
            stat: stat,
            name: name,
            button: e.button,
            config: src[0].config,
            dom: src,
            data: src[0].data
          })
        }
      }

      lanList.on("mouseup", onClickLanList).on("mouseover", onClickLanList).on("mouseover", function (e) {
        let src = $(e.srcElement || e.target);
        if (src[0].nodeName == "LI") {
          MultiDebug.exeI("lanModule", "onMouseoverLanList", {
            stat: src[0].data.stat,
            name: src[0].data.name,
            dom: src,
            data: src[0].data
          })
        }
      }).on("mouseout", function (e) {
        let src = $(e.srcElement || e.target);
        if (src[0].nodeName == "LI") {
          MultiDebug.exeI("lanModule", "onMouseoutLanList", {
            stat: src[0].data.stat,
            name: src[0].data.name,
            dom: src,
            data: src[0].data
          })
        }
      })
      //单个菜单栏失焦消失
      subMenu.blur(function () {
        //console.log("blur")
        subMenu.hide();
      }).click(function () {
        subMenu.hide();
      })
      //初始化submenu事件
      subMenu.children("li").click(function (e) {
        MultiDebug.exeI("lanModule", "onClickSubMenu", (e.srcElement || e.target).innerHTML, subMenu, subMenu[0].data.src);
      })
    }

    init();
    /**大小变为0，但是可以拖拽还原，没有隐藏*/
    this.scale0 = function () {
      nav.innerWidth(0);
      bar.css("left", nav.innerWidth());
      bar.addClass("hide")
    }
    /**还原到原来的大小*/
    this.scale1 = function () {
      if (!oriWidth) {
        return;
      }
      nav.innerWidth(oriWidth);
      bar.css("left", nav.innerWidth());
      bar.removeClass("hide")
    }
  }

  /**开启图片资源模块
   * @class*/
  PicModule() {
    let module = this;
    let bar = multiDebugDom.find(".nav-pic-dragbar");
    let navPic = multiDebugDom.find(".nav-pic");
    let picTitle = multiDebugDom.find(".nav-pic .title")
    let picPanel = multiDebugDom.find(".nav-pic .pic-panel");
    let disableButton = null;
    let activeButton = null;
    let activePanel = null;

    this.button1 = picTitle.find("button").eq(0);
    this.button2 = picTitle.find("button").eq(1);
    this.button3 = picTitle.find("button").eq(2);
    this.button4 = picTitle.find("button").eq(3);
    this.panel1 = picPanel.eq(0);
    this.panel2 = picPanel.eq(1);
    this.panel3 = picPanel.eq(2);
    this.panel4 = picPanel.eq(3);
    /**显示模块*/
    this.show = function () {
      navPic.stop().show();
      bar.stop().show();
    }
    /**隐藏模块*/
    this.hide = function () {
      navPic.stop().hide();
      bar.stop().hide();
    }
    /**
     * 激活相应的按钮,只能有一个按钮处于激活状态,且取消按钮的禁止状态
     * @param {Object} button - 需要激活的按钮,只能是jqueryDom对象
     */
    this.activeButton = function (button) {
      picTitle.children("button").removeClass("color-success");
      button.removeClass("disable").addClass("color-success");
      activeButton = button;
      disableButton = picTitle.children("button.disable");
    }
    /**
     * 禁止相应的按钮,无论按钮是否处于激活状态
     * @param {Object} button - 需要禁止的按钮,只能是jqueryDom对象
     */
    this.disableButton = function (button) {
      button.removeClass("color-success").addClass("disable");
      activeButton = picTitle.children("button.color-success");
      disableButton = picTitle.children("button.disable");
    }
    /**显示picPanel
     * @param {Object} panel - 需要显示的picPanel*/
    this.showPanel = function (panel) {
      picPanel.hide(0);
      panel.show(0);
      activePanel = panel;
    }

    /**清空图片库*/
    this.clearPanel = function () {
      picPanel.hide(0);
      picTitle.children("button").removeClass("color-success disable");
      activeButton = null;
      disableButton = null;
      activePanel = null;
    }
    /**根据数据生成立方体纹理类型板块
     * @param {Array} data - 立方体纹理文件夹名字数组
     * @param {string} path - 存放文件夹的目录
     * @param {Object} panel - 需要显示的picPanel
     */
    this.createCubePanel = function (data, path, panel) {
      if (!data || !panel) {
        return;
      }
      let currentPanel = panel;
      let extend = ["_px.jpg", "_py.jpg", "_pz.jpg", "_nx.jpg", "_ny.jpg", "_nz.jpg"];
      if (currentPanel.hasClass("pic-panel-cube")) {
        currentPanel.html("");
        [].concat(data).forEach(function (fileName) {
          let file = $("<div class=file draggable=true>");
          let name = $("<span class=name>");
          name.html(fileName);
          for (let i = 0; i < 6; i++) {
            let img = $("<img class=mini title=" + (fileName + extend[i]) + ">")
            img[0].src = path + fileName + "/" + fileName + extend[i];
            file.append(img);
          }
          file.append(name);
          currentPanel.append(file);
          file.click(function (e) {
            let target = e.srcElement || e.target;
            let picName = null;
            if ((target.nodeName).toUpperCase() == "IMG") {
              picName = fileName + extend[$(target).index()];
            }
            MultiDebug.exeI("picModule", "onClickPic", {
              button: e.button,
              fileName: fileName,
              picName: picName,
              path: path,
              type: "skybox"
            })
          })
          file.on("dragstart", function (e) {
            let info = {
              fileName: fileName,
              path: path,
              type: "skybox",
              panel: panel.index()
            }
            let data = e.originalEvent.dataTransfer;
            data.setData("picData", JSON.stringify(info));
            MultiDebug.exeI("picModule", "onDragPic", info)
          })
        })
      }
    }
    /**根据数据生成平面纹理类型板块
     * @param {Array} data - 图片名字数组
     * @param {string} path - 存放图片的目录
     * @param {Object} panel - 需要显示的picPanel
     */
    this.createTexturePanel = function (data, path, panel) {
      if (!data || !panel) {
        return;
      }
      let currentPanel = panel;
      if (currentPanel.hasClass("pic-panel-texture")) {
        currentPanel.html("");
        [].concat(data).forEach(function (fileName) {
          if (fileName == "Thumbs.db")
            return;
          let file = $("<div class=file draggable=true>");
          let name = $("<span class=name>");
          name.html(fileName);
          let img = $("<img class=mini title=" + fileName + ">");
          img[0].src = path + fileName;
          file.append(img).append(name);
          currentPanel.append(file);
          file.click(function (e) {
            MultiDebug.exeI("picModule", "onClickPic", {
              button: e.button,
              fileName: fileName,
              picName: fileName,
              path: path,
              type: "texture",
            })
          })
          file.on("dragstart", function (e) {
            let info = {
              fileName: fileName,
              path: path,
              type: "texture",
              panel: panel.index()
            }
            let data = e.originalEvent.dataTransfer;
            data.setData("picData", JSON.stringify(info))
            MultiDebug.exeI("picModule", "onDragPic", info)
          })

        })
      }
    }
    /**滚动到相应的图片，高亮显示
     * @param {number} panelIndex 第1,2,3,4个panel
     * @param {string} fileName 文件名字*/
    this.scrollToPic = function (panelIndex, fileName) {
      let panel = module["panel" + panelIndex];
      let button = module["button" + panelIndex];
      //显示
      module.showPanel(panel);
      //按钮
      module.activeButton(button);
      //滚动
      panel.children(".file").each(function (i, dom) {
        dom = $(dom);
        let name = dom.find("span.name").html();
        if (name == fileName) {
          dom.addClass("short-tip");
          let currentScrollTop = panel.scrollTop();
          let dif = dom.position().top;
          panel.scrollTop(currentScrollTop + dif)
          dom.on("mouseout", function () {
            dom.removeClass("short-tip");
            dom.off("mouseout")
          })
        } else {
          dom.removeClass("short-tip");
        }
      })
    }

    function init() {
      let py = null;
      let canDrag = false;
      let height = null;
      //初始化滚动条、拖拽条、picPanel的位置;
      bar.css("bottom", navPic.innerHeight());
      picPanel.css("top", picTitle.outerHeight() + "px");
      picPanel.innerHeight(navPic.innerHeight() - picTitle.innerHeight());

      function move() {
        function mousedown(e) {
          canDrag = true;
          bar.removeClass("hide");
          py = e.clientY;
          height = navPic.innerHeight();
        }

        bar.on("mousedown", mousedown)
        picTitle.on("mousedown", mousedown);
        //动态更新拖拽条和滚动条的位置
        $(document).on("mousemove", function (e) {
          if (canDrag) {
            let dif = py - e.clientY;
            navPic.height(height + dif);
            bar.css("bottom", navPic.innerHeight());
            picPanel.innerHeight(navPic.innerHeight() - picTitle.innerHeight())
          }
        })
        $(document).on("mouseup", function () {
          if (window.parseInt(bar.css("bottom")) <= 30) {
            navPic.height(0);
            bar.css("bottom", navPic.innerHeight());
            picPanel.innerHeight(navPic.innerHeight() - picTitle.innerHeight())
            bar.addClass("hide");
          }
          canDrag = false;
        })
      }

      move();
      //切换picPanel
      picTitle.children("button").click(function (e) {
        let $dom = $(e.srcElement || e.target);
        let panel = module["panel" + ($dom.index() + 1)]
        //禁止状态的按钮不能触发事件
        if ($dom.hasClass("disable")) {
          return;
        }
        MultiDebug.exeI("picModule", "onTogglePicPanel", $dom, panel)
      })

    }

    init();
    /**大小变为0，但是可以拖拽还原，没有隐藏*/
    this.scale0 = function () {
      navPic.innerHeight(0);
      picPanel.innerHeight(navPic.innerHeight() - picTitle.innerHeight())
      bar.css("bottom", navPic.innerHeight());
      bar.addClass("hide");
    }
    /**还原到原来的大小*/
    this.scale1 = function () {
      navPic.innerHeight(200);
      picPanel.innerHeight(navPic.innerHeight() - picTitle.innerHeight())
      bar.css("bottom", navPic.innerHeight());
      bar.removeClass("hide");
    }
  }

  /**开启聊天模块
   * @class*/
  ChatModule() {
    let module = this;
    this.MAXCONTENT = 10;//最大预加载聊天信息，向上滚动懒加载
    let navChat = multiDebugDom.find(".nav-chat");
    let chatTop = $(".nav-chat .chat-top");
    let chatWho = chatTop.find(".chat-who")
    let myName = $(".nav-chat .chat-top .user-info .myname");
    let myImg = $(".nav-chat .chat-top .user-info .user-img.user-me");
    let chatList = $(".nav-chat .chat-list");
    //拖拽条
    let dragBarTop = $(".nav-chat .dragbar-top");
    let dragBarBottom = $(".nav-chat .dragbar-bottom");
    let dragBarLeft = $(".nav-chat .dragbar-left");
    let dragBarRight = $(".nav-chat .dragbar-right");
    let dragBarLeftTop = $(".nav-chat .dragbar-left-top");
    let dragBarLeftBottom = $(".nav-chat .dragbar-left-bottom");
    let dragBarRightTop = $(".nav-chat .dragbar-right-top");
    let dragBarRightBottom = $(".nav-chat .dragbar-right-bottom");
    //信息主体
    let chatBody = $(".nav-chat .chat-body");
    let close = chatTop.find(".user-info .close");
    let rename = chatTop.find(".user-info .config");
    //发送
    let chatInput = $(".nav-chat .chat-input");
    let submit = $(".nav-chat .chat-input .send");
    let textarea = $(".nav-chat .chat-input textarea");
    /**当前聊天频道，默认公共频道*/
    this.currentChannel = chatList.find(".user.public .user-name").html();
    /**当前聊天频道图片路径*/
    this.currentImg = null;
    /**公共频道*/
    this.publicRoom = this.currentChannel;
    /**消息日志频道*/
    this.logRoom = chatList.find(".user.log .user-name").html();
    /**窗口是否激活状态*/
    this.blur = false;

    //图片缓存
    let imgBuffer = {}
    //正在ajax请求的url
    let ajaxing = {};

    function setImgBuffer(imgPath, base64) {
      imgBuffer[imgPath] = base64;
    }

    /**显示模块*/
    this.show = function () {
      navChat.show();
    }
    /**隐藏模块*/
    this.hide = function () {
      navChat.hide();
    }
    /**
     * 显示聊天窗口，位置居中屏幕
     * */
    this.openWindow = function () {
      navChat.show();
      navChat.css("margin-left", -navChat.innerWidth() / 2 + "px");
      navChat.css("margin-top", -navChat.innerHeight() / 2 + "px");
    }
    /**关闭聊天窗口*/
    this.closeWindow = function () {
      navChat.fadeOut();
    }
    /**隐藏输入框*/
    this.hideSubmit = function () {
      chatInput.hide();
    }
    /**显示输入框*/
    this.showSubmit = function () {
      chatInput.show();
    }
    /**消息提醒
     * @param {string} userName - 需要显示消息未读提醒的频道名字
     * @param {booean} once - 需要只提示一次，true：一次，false:一直提示
     * */
    this.showContentReminder = function (userName, once) {
      module.hideContentReminder(userName);
      window.setTimeout(function () {
        if (once) {
          chatList.find(`.user-name:contains(${userName})`).addClass("reminder-once")
          $("#z_chatMenu").addClass("reminder-once")
          $("#z_chatMenu").find(`#z_online li:contains(${userName})`).addClass("reminder-once")
        } else {
          chatList.find(`.user-name:contains(${userName})`).addClass("reminder-infinite")
          $("#z_chatMenu").addClass("reminder-infinite")
          $("#z_chatMenu").find(`#z_online li:contains(${userName})`).addClass("reminder-infinite")
        }
      }, 100)
    }
    /**取消消息提醒
     * @param {string} userName - 需要取消消息未读提醒的频道名字
     * */
    this.hideContentReminder = function (userName) {
      chatList.find(`.user-name:contains(${userName})`).removeClass("reminder-once reminder-infinite")
      $("#z_chatMenu").removeClass("reminder-once reminder-infinite")
      $("#z_chatMenu").find(`#z_online li:contains(${userName})`).removeClass("reminder-once reminder-infinite")
    }

    /**显示桌边提醒
     * @param {string} title - 需要显示在桌面的标题
     * @param {string} message - 需要显示在桌面的文字
     * @param {string} img - 需要显示在桌面的图片base64
     * @param {number} time -   消息显示的时间,默认3s
     * @return {object} notification -   消息对象，可以通过hideDesktopMessage（notification）来关闭
     * */
    this.showDesktopMessage = function (title, message, img, time) {
      // if (Notification.permission == "default") {
      Notification.requestPermission && Notification.requestPermission()
      // }
      let body = {
        body: message
      }
      if (img) {
        body.icon = img;
      }
      let notification = new Notification(title, body);
      Tool.showMessage(message, 1, "success");
      window.setTimeout(function () {
        notification.close()
      }, time ? time * 1000 : 3000)
      return notification;
    }

    /**关闭桌面消息提醒
     * @param {object} notification - 消息对象，通过showDesktopMessage返回*/
    this.hideDesktopMessage = function (notification) {
      try {
        notification.close && notification.close();
      } catch (e) {
        console.warn(e)
      }
    }

    let logContentBuffer = [];
    /**消息日志 初始化，以后的操作都是基于缓存
     * @param {Object[]} data - 消息记录数据包
     * @param {string} data[].from - 发送者名字
     * @param {string} data[].fromImg - 发送者头像
     * @param {string} data[].to - 发送对象名字
     * @param {string} data[].toImg - 发送对象头像
     * @param {string} data[].content - 聊天内容
     * @param {string} data[].time - 聊天历史时间
     * */
    this.initLogContentBuffer = function (data) {
      if (data && data instanceof Array) {
        logContentBuffer = data;
      }
    }
    /**追加信息到消息日志
     * @param {string} content - 需要追加到消息日志的信息
     * */
    this.appendLogContentBuffer = function (content) {
      let data = {};
      data.from = MultiDebug.get("socketModule", "myName");
      data.fromImg = MultiDebug.get("socketModule", "myImg");
      data.content = content;
      data.to = module.logRoom;
      data.time = new Date().getTime();
      logContentBuffer.push(data);
      if (module.currentChannel == module.logRoom) {
        module.appendChatBody(data);
      }
      //保存到服务器
      MultiDebug.exeI("chatModule", "onAppendLogContent", data);
    }
    /**获取消息日志缓存
     * @return {object[]} 日志缓存数据包*/
    this.getLogContentBuffer = function () {
      return logContentBuffer;
    }
    /**更新聊天框在线人员
     * @param {Object[]} users
     * @param {string} users[].userName -用户名字
     * @param {string} users[].userImg  - 用户头像base64
     * */
    this.updateUserList = function (users) {
      //删除用户列表,除了公共聊天室和消息日志
      chatList.children().each(function (i, dom) {
        dom = $(dom);
        if (i > 1) {
          dom.remove();
        }
      })
      let one = true;
      users.forEach(function (userInfo) {
        let user = $("<div class=user>");
        let img = $("<div class=user-img>");
        let name = $("<div class=user-name >" + userInfo.userName + "</div>");
        if (userInfo.userImg) {
          img.css("background-image", "url(" + userInfo.userImg + ")");
          //刷新一次聊天窗口，防止用户昵称和头像的变化
          if (one) {
            one = false;
            MultiDebug.exeI("chatModule", "onToggleUserChannel", module.currentChannel);
          }
        }
        user.append(img).append(name)
        chatList.append(user)
      })
    }
    /**更新右上角本人用户信息
     * @param {Object} myInfo - 本人用户信息
     * @param {string} myInfo.userName
     * @param {string} myInfo.userImg
     * */
    this.updateMyUserInfo = function (myInfo) {
      myName.html(myInfo.userName);
      if (myInfo.userImg) {
        myImg.css("background-image", "url(" + myInfo.userImg + ")");
      }
    }
    /**更新聊天窗口顶部chatwho 内容
     * @param {string} userName - 要显示正在跟谁聊天*/
    this.updateChatWithWho = function (userName) {
      chatWho.html(userName)
    }
    /**高亮显示用户，用来显示正在跟谁聊天,只能高亮一个
     * @param {string} userName - 正在聊天的用户名字
     * */
    this.highlightUser = function (userName) {
      chatList.children().each(function (i, user) {
        user = $(user);
        if (user.find("div:last-child").html() == userName) {
          user.addClass("active")
        } else {
          user.removeClass("active");
        }
      })
    }
    //聊天内容数据结构
    let chatContentBuffer = []

    /**聊天缓存 初始化，以后的操作都是基于缓存
     * @param {Object[]} data - 聊天记录数据包
     * @param {string} data[].from - 发送者名字
     * @param {string} data[].fromImg - 发送者头像
     * @param {string} data[].to - 发送对象名字
     * @param {string} data[].toImg - 发送对象头像
     * @param {string} data[].content - 聊天内容
     * @param {string} data[].time - 聊天历史时间
     * */
    this.initChatContentBuffer = function (data) {
      if (data && data instanceof Array) {
        chatContentBuffer = data;
      }
    }
    /**获取聊天缓存
     * @return {Object} 缓存数据包
     * */
    this.getChatContentBuffer = function () {
      return chatContentBuffer;
    }
    /**追加聊天内容到缓存
     * @param {Object} data - 聊天记录数据包
     * @param {string} data.from - 发送者名字
     * @param {string} data.fromImg - 发送者头像
     * @param {string} data.to - 发送对象名字
     * @param {string} data.toImg - 发送对象头像
     * @param {string} data.content - 聊天内容
     * @param {string} data.time - 聊天历史时间
     */
    this.appendChatContentBuffer = function (data) {
      try {
        chatContentBuffer.push(data);
      } catch (e) {
        console.log(e)
      }
    }
    /**根据传进来的JSON初始化聊天窗口,默认滚屏到底部
     * @param {Object[]} data - 聊天记录数据包
     * @param {string} data[].from - 发送者名字
     * @param {string} data[].to - 发送对象名字
     * @param {string} data[].content - 聊天内容
     * @param {string} data[].time - 聊天历史时间
     * @param {function} onsuccess - 初始化成功后的回调函数
     */
    this.createChatBody = function (data, onsuccess) {
      if (!data) {
        return;
      }
      chatBody.html("");
      let userList = MultiDebug.get("socketModule", "userList");
      let myImg = MultiDebug.get("socketModule", "myImg");
      let myName = MultiDebug.get("socketModule", "myName");
      [].concat(data).forEach(function (data) {
        let isPublic = module.currentChannel === module.publicRoom;
        let isPublicMe = isPublic && data.from === myName && data.to === module.publicRoom;
        let isPublicOther = isPublic && data.from !== myName && data.to === module.publicRoom;
        let isMe = !isPublic && data.from === myName && data.to === module.currentChannel;
        let isOther = !isPublic && data.from === module.currentChannel && data.to === myName;
        //过滤其他频道信息
        if (!isMe && !isOther && !isPublicMe && !isPublicOther) {
          return;
        }
        //start
        let wrapper = $("<div class=chat-content>");
        let imgWrapper = $("<div class=user-img-wrapper>");
        let userImg = $("<div class=user-img>");
        imgWrapper.append(userImg);
        let contentWrapper = $("<div class=content-wrapper>");
        let name = $("<span class=username>");
        let content = $("<div class=content>");
        contentWrapper.append(name).append(content);
        let time = $("<div class=time>");
        wrapper.append(imgWrapper).append(contentWrapper).append(time);
        content.html(data.content);
        name.html(data.from);
        if (data.time) {
          time.html(Tool.getDayTime(data.time));
        }
        if (isMe || isPublicMe) {
          wrapper.addClass("me");
          userImg.css("background-image", "url(" + myImg + ")");
        } else {
          wrapper.addClass("other");
          userList.some((user) => {
            if (user.userName === data.from) {
              userImg.css("background-image", "url(" + user.userImg + ")");
              return true;
            }
          })
        }
        chatBody.append(wrapper);
      })
      onsuccess && onsuccess();
      let children = null;
      if ((children = chatBody.children()).length > 0) {
        chatBody.scrollTop(children.last().position().top - children.first().position().top)
      }
    }
    /**根据传进来的JSON追加聊天信息,默认滚屏到底部
     * @param {Object[]} data - 聊天记录数据包
     * @param {string} data[].from - 发送者名字
     * @param {string} data[].to - 发送对象名字
     * @param {string} data[].content - 聊天内容
     * @param {string} data[].time - 聊天历史时间
     * @param {function} onsuccess - 初始化成功后的回调函数
     */
    this.appendChatBody = function (data, onsuccess) {
      if (!data) {
        return;
      }
      let userList = MultiDebug.get("socketModule", "userList");
      let myImg = MultiDebug.get("socketModule", "myImg");
      let myName = MultiDebug.get("socketModule", "myName");
      [].concat(data).forEach(function (data) {
        let isPublic = module.currentChannel == module.publicRoom;
        let isPublicMe = isPublic && data.from == myName && data.to == module.publicRoom;
        let isPublicOther = isPublic && data.from != myName && data.to == module.publicRoom;
        let isMe = !isPublic && data.from == myName && data.to == module.currentChannel;
        let isOther = !isPublic && data.from == module.currentChannel && data.to == myName;
        //过滤其他频道信息
        if (!isMe && !isOther && !isPublicMe && !isPublicOther) {
          return;
        }
        //start
        let wrapper = $("<div class=chat-content>");
        let imgWrapper = $("<div class=user-img-wrapper>");
        let userImg = $("<div class=user-img>");
        imgWrapper.append(userImg);
        let contentWrapper = $("<div class=content-wrapper>");
        let name = $("<span class=username>");
        let content = $("<div class=content>");
        contentWrapper.append(name).append(content);
        let time = $("<div class=time>");
        wrapper.append(imgWrapper).append(contentWrapper).append(time);
        content.html(data.content);
        name.html(data.from);
        if (data.time) {
          time.html(Tool.getDayTime(data.time));
        }
        if (isMe || isPublicMe) {
          wrapper.addClass("me");
          userImg.css("background-image", "url(" + myImg + ")");
        } else {
          wrapper.addClass("other");
          userList.some((user) => {
            if (user.userName === data.from) {
              userImg.css("background-image", "url(" + user.userImg + ")");
              return true;
            }
          })
        }
        chatBody.append(wrapper);
      })
      onsuccess && onsuccess();
      let children = null;
      if ((children = chatBody.children()).length > 0) {
        chatBody.scrollTop(children.last().position().top - children.first().position().top)
      }
    }

    //初始化UI和UI事件
    function init() {
      let py = 0;
      let px = 0;
      let marginLeft = navChat.css("margin-left");
      let marginTop = navChat.css("margin-top");
      let height = 0;
      let width = 0;
      let canDrag = false;
      let canMove = false;

      //拖拽拉伸
      function move() {
        let zIndex = $(".multi-debug").css("z-index");

        chatTop.on("mousedown", function (e) {
          canMove = true;
          py = e.clientY;
          px = e.clientX;
          marginLeft = navChat.css("margin-left");
          marginTop = navChat.css("margin-top");
        }).dblclick(function () {
          if (navChat.innerHeight() != window.innerHeight || navChat.innerWidth() != window.innerWidth) {
            navChat.innerHeight(window.innerHeight).innerWidth(window.innerWidth);
            navChat.css("margin-left", -window.innerWidth / 2).css("margin-top", -window.innerHeight / 2)
            $(".multi-debug").css("z-index", 65560);
          } else {
            navChat.innerHeight(400).innerWidth(700);
            $(".multi-debug").css("z-index", zIndex);
          }
          chatBody.css("height", navChat.innerHeight() - 140 + "px");

        })
        //drag
        dragBarLeftTop.add(dragBarLeftBottom).add(dragBarRightTop).add(dragBarRightBottom).add(dragBarTop).add(dragBarBottom).add(dragBarLeft).add(dragBarRight).on("mousedown", function (e) {
          let dom = e.srcElement || e.target;
          if (dom == dragBarTop[0]) {
            canDrag = "top";
          } else if (dom == dragBarBottom[0]) {
            canDrag = "bottom";
          } else if (dom == dragBarLeft[0]) {
            canDrag = "left";
          } else if (dom == dragBarRight[0]) {
            canDrag = "right";
          } else if (dom == dragBarLeftTop[0]) {
            canDrag = "left top"
          } else if (dom == dragBarLeftBottom[0]) {
            canDrag = "left bottom"
          } else if (dom == dragBarRightTop[0]) {
            canDrag = "right top"
          } else if (dom == dragBarRightBottom[0]) {
            canDrag = "right bottom"
          }
          height = navChat.innerHeight();
          width = navChat.innerWidth();
          px = e.clientX;
          py = e.clientY;
          marginLeft = navChat.css("margin-left");
          marginTop = navChat.css("margin-top");
        })

        $(document).on("mousemove", function (e) {
          if (canMove) {
            let difY = py - e.clientY;
            let difX = px - e.clientX;
            navChat.css("margin-left", window.parseFloat(marginLeft) - difX + "px")
              .css("margin-top", window.parseFloat(marginTop) - difY + "px")
          } else if (canDrag) {
            let difX = px - e.clientX;
            let difY = py - e.clientY;
            if (canDrag.search("top") != -1) {
              navChat.innerHeight(height + difY);
              navChat.css("margin-top", window.parseFloat(marginTop) - difY + "px");
              chatBody.css("height", navChat.innerHeight() - 140 + "px");
            }
            if (canDrag.search("bottom") != -1) {
              navChat.innerHeight(height - difY);
              chatBody.css("height", navChat.innerHeight() - 140 + "px");
            }
            if (canDrag.search("left") != -1) {
              let difX = px - e.clientX;
              navChat.innerWidth(width + difX);
              navChat.css("margin-left", window.parseFloat(marginLeft) - difX + "px");
            }
            if (canDrag.search("right") != -1) {
              let difX = px - e.clientX;
              navChat.innerWidth(width - difX);
            }
          }
        })
        $(document).on("mouseup", function () {
          canMove = false;
          canDrag = false;
          let offset = navChat.offset();
          let dif = 50;
          if (offset.top < -20 || offset.top > window.innerHeight - 20 || offset.left > window.innerWidth - dif || offset.left < -chatTop.innerWidth() + dif) {
            //navChat.css("margin-left", marginLeft).css("margin-top", marginTop);
            navChat.fadeOut(600);
          }
        })
      }

      move();
      //关闭窗口
      close.click(function () {
        module.closeWindow();
        module.currentChannel = null;
      })
      //改名
      rename.click(function () {
        MultiDebug.exeI("chatModule", "onRename", {
          myName: MultiDebug.get("socketModule", "myName"),
          myImg: MultiDebug.get("socketModule", "myImg")
        })
      })
      //切换聊天频道，更新currentChannel,currentImg
      chatList.click(function (e) {
        let $dom = $(e.srcElement || e.target);
        let userName = $dom.filter(".user").find(" div:last-child").html()
        MultiDebug.exeI("chatModule", "onToggleUserChannel", userName);
      })

      //发送信息
      function submitEvent() {
        let content = textarea.val();
        textarea.val("");
        let data = {
          from: MultiDebug.get("socketModule", "myName"),
          // fromImg: MultiDebug.get("socketModule", "myImg"),
          to: module.currentChannel,
          // toImg: module.currentImg,
          content: content,
          time: new Date().getTime()
        }
        MultiDebug.exeI("chatModule", "onSubmitChatContent", data);
      }

      submit.click(submitEvent);
      chatInput.on("keydown", function (e) {
        if ((e.key == "Enter" || e.keyCode == 13) && !e.shiftKey) {
          submitEvent();
          return false;
        }
      })
      //桌边提醒
      $(document.body).one("click", function () {
        //请求打开桌边提醒服务
        Notification.requestPermission && Notification.requestPermission()
      })
      //判断桌边是否隐藏
      $(window).on("blur", function () {
        //console.log("blur")
        module.blur = true;
      }).on("focus", function () {
        //console.log("focus")
        module.blur = false;
      })
    }

    init();
  }

  /** 开启BABYUI调试模块
   * @class*/
  DebugModule() {
    /**BABYUI debug*/
    let module = this;
    /**当前正在调试的物体
     * @member*/
    this.currentDebugMesh = null;
    /**隐藏调试框*/
    this.hideDebug = function () {
      BABYUI.destroy();
      module.currentDebugMesh = null;
    }
    /**显示调试框，数据进行联机调试
     * @param {Object} mesh 要调试的物体*/
    this.showDebug = function (mesh) {
      if (!mesh) {
        return;
      }
      if (!mesh.material) {
        Tool.showMessage(mesh.name + "没有材质...", 2, "danger");
        return;
      }
      if (!mesh.geometry) {
        Tool.showMessage(mesh.name + "没有顶点数据...", 2, "danger");
        return;
      }
      module.hideDebug();
      module.currentDebugMesh = mesh;
      return true;
    }
    /**显示灯光调试框*/
    this.showLightDebug = function (light) {
      if (!light) {
        return;
      }
      module.hideDebug();
      module.currentDebugMesh = light;
      return true;
    }
    BABYUI.onChange = function () {
      window.setTimeout(function () {
        MultiDebug.exeI("debugModule", "onChange", module.currentDebugMesh)
      }, 110)
    }
  }

  /** 开启socket模块
   * @class*/
  SocketModule() {
    let module = this;
    /**用户姓名*/
    this.myName = null;
    /**用户头像*/
    this.myImg = null;
    /**在线用户列表l*/
    this.userList = [];
    /**私有库路径*/
    this.appPath = "";
    /**公有库路径*/
    this.publicPath = "";
    /**私有库材质库路径*/
    this.appLibPath = "";
    /**公有库材质库路径*/
    this.publicLibPath = "";
    /**客户端socket*/
    let socket = null;
    /**注册socket的事件
     * @param {Object} events - 接收的所有socket事件
     * @param {string} events.eventName - socket事件
     * @param {string} events.func - socket触发的事件
     * @param {Object} socket - 需要绑定的socket对象
     * */
    this.registerEvents = function (events, socket) {
      events.forEach(function (func, eventName) {
        if (typeof eventName == "string" && typeof func == "function") {
          socket.on(eventName, func);
          try {
            if (MultiDebug.Application.socketModule[eventName]) {
              socket.on(eventName, MultiDebug.Application.socketModule[eventName]);
            }
          } catch (e) {
            console.warn(e);
          }
        }
      })
    }
    /**获取服务器端数据
     * @param {string} key - 要获取的服务器的数据的键值,可以.连接，如a.b.c
     * @param {function} onsuccess - 获取成功后的回调函数 (info:服务器返回的数据)
     * */
    this.getServerData = function (key, onsuccess) {
      socket.emit("onGetServerData", key, onsuccess);
    }
    /**设置服务器端数据
     * @param {string} key - 要设置的服务器的数据的键值,可以.连接，如a.b.c
     * @param {string} data - 要设置的服务器的数据的数据
     * @param {function} onsuccess - 获取成功后的回调函数 (ori:服务器本来的数据,overwrite:覆盖后的数据)
     * */
    this.setServerData = function (key, data, onsuccess) {
      socket.emit("onSetServerData", key, data, onsuccess);
    }
    /**重命名界面
     *@param {string} data.myName - 本人姓名
     *@param {string} data.myImg - 本人图片路径
     */
    this.showRename = function (data) {
      Tool.showPromptWithFile("当前昵称:【" + data.myName + "】<br><br>新昵称:", "您可以重新上传头像<br>", function (text, file, base64) {
        socket.emit("onSaveUserInfo", {
          // userName: text,
          userImg: base64
          // logining: false
        })
      }, false, data.myImg ? data.myImg : null, true);
    }
    /**通知其他在线用户
     * @param {string} eventName - 通知的事件名字
     * @param {Object} data - 需要发送的数据
     * */
    this.broadcastOther = function (eventName, data) {
      socket.emit("onBroadcastOther", eventName, data);
    }
    /**获取公私图片库文件列表
     * @param {function} onsuccess 成功回调函数 (data:Object,data.publicTexture,data.publicSkybox,data.privateTexture,data.privateSkybox,data.appName)*/
    this.getPicFileList = function (onsuccess) {
      socket.emit("onGetPicFileList", onsuccess);
    }
    /**获取APP相对路径下的文件列表数组
     * @param {string} path - 相对APP项目的相对路径*/
    this.getAppFileList = function (path, onsuccess) {
      socket.emit("onGetAppFileList", path, onsuccess);
    }
    /**获取APP相对路径下的文件内容
     * @param {string} path - 相对APP项目的相对路径*/
    this.getAppFile = function (path, onsuccess) {
      socket.emit("onGetAppFile", path, onsuccess);
    }
    /**删除APP相对路径下的文件
     * @param {string} path - 路径*/
    this.delAppFile = function (path) {
      socket.emit("onDelAppFile", path);
    }
    /**保存文件到APP相对路径下*/
    this.saveAppFile = function (path, content) {
      socket.emit("onSaveAppFile", path, content);
    }
    /**获取材质库路径下的文件列表
     * @param {string} path
     * @param {function} onsuccess (dirList)*/
    this.getMaterialLibFileList = function (path, onsuccess) {
      socket.emit("onGetMaterialLibFileList", path);
      socket.on("onGetMaterialLibFileList", function (data) {
        socket.off("onGetMaterialLibFileList");
        onsuccess && onsuccess(data);
      })
    }
    /**写文件到材质库路径下
     * @param {string} path - 路径
     * @param {string} content - 文件内容*/
    this.saveMaterialLibFile = function (path, content) {
      socket.emit("onSaveMaterialLibFile", path, content);
    }
    /**登录系统，用来显示当前系统调试人数，谁在调试，用户聊天，用户头像，版本信息等功能*/
    this.login = () => {
      let loginWrapper = $(".mul-login")
      let regWrapper = $(".mul-register")
      let curMode = "login"
      let logAccount = loginWrapper.find("[data-type='account']")
      let logPassword = loginWrapper.find("[data-type='password']")
      let regAccount = regWrapper.find("[data-type='account']")
      let regPassword = regWrapper.find("[data-type='password']")
      let regPassword2 = regWrapper.find("[data-type='password2']")
      let login = regWrapper.find("[data-type='login']")
      let reg = loginWrapper.find("[data-type='register']")

      //resolve({account,password})
      function check(account, password, password2) {
        return new Promise((resolve) => {
          if (!/[\u4e00-\u9fa5a-zA-Z]+/.test(account.val())) {
            Tool.showMessage("昵称格式要求至少1位中文或英文！", 1, "danger")
          } else if (!/.+/.test(password.val())) {
            Tool.showMessage("密码格式要求至少1位任意字符！", 1, "danger")
          } else if (arguments.length == 3 && password2.val() != password.val()) {
            Tool.showMessage("两次输入的密码不一致！", 1, "danger")
          } else if (arguments.length == 3 || arguments.length == 2) {
            resolve({
              account: account.val(),
              password: password.val()
            })
          }
        })
      }

      //获取myName,myImg,appName
      function onLogin(press) {
        regWrapper.fadeOut();
        loginWrapper.fadeIn();
        curMode = "login"
        let click = () => {
          check(logAccount, logPassword).then((data) => {
            socket.emit("login", data.account, data.password, (userInfo) => {
              if (typeof userInfo === "string") {
                Tool.showMessage(userInfo, 1, "danger")
              } else {
                Tool.showMessage("欢迎登录！ " + userInfo.userName, 1, "success")
                loginWrapper.fadeOut();
                module.myName = userInfo.userName;
                module.myImg = userInfo.userImg;
                module.appPath = userInfo.appPath;
                module.publicPath = userInfo.publicPath;
                module.appLibPath = userInfo.appLibPath;
                module.publicLibPath = userInfo.publicLibPath;
                MultiDebug.exe("socketModule", "setServerData", "debugInfo.publicPath", module.publicLibPath);
                MultiDebug.exe("socketModule", "setServerData", "debugInfo.appPath", module.appLibPath);
              }
            })
          })
        }
        if (typeof press == "boolean") {
          click();
        } else {
          loginWrapper.find("button.color-success").off().click(click)
        }
      }

      function onReg(press) {
        loginWrapper.fadeOut();
        regWrapper.fadeIn();
        curMode = "reg"
        let click = () => {
          check(regAccount, regPassword, regPassword2).then((data) => {
            socket.emit("register", data.account, data.password, (userInfo) => {
              if (typeof userInfo === "string") {
                Tool.showMessage(userInfo, 1, "danger")
              } else {
                Tool.showMessage("注册成功！ " + data.account, 1, "success")
                onLogin();
              }
            })
          })
        }
        if (typeof press == "boolean") {
          click();
        } else {
          regWrapper.find("button.color-success").off().click(click)
        }
      }

      function enter(e) {
        if (e.key == "Enter") {
          if (curMode == "login") {
            onLogin(true);
          } else if (curMode == "reg") {
            onReg(true);
          }
        }
      }

      $(document)
        .off("keydown", $(document).data("mul-login"))
        .data("mul-login", enter)
        .on("keydown", enter)
      login.off().on("click", onLogin)
      reg.off().on("click", onReg)
      onLogin();
    }

    //socket连接成功才显示页面
    function connectSocket() {
      return new Promise((resolve, reject) => {
        let times = 0;
        let hostname = MultiDebug.opt.ip + ":" + MultiDebug.opt.port;
        socket = io.connect('ws://' + hostname);

        function wait() {
          if (!socket.connected) {
            if (times++ < 50) {
              console.log("正在连接socket:" + hostname + "...请耐心等待");
              window.setTimeout(wait, 100)
            } else {
              console.log("超过5秒未连接成功，已自动断开连接......")
              socket.disconnect();
              reject();
            }
          } else {
            console.log("已成功连接socket:" + hostname + "...");
            resolve()
          }
        }

        wait();
      })

    }

    connectSocket().then(() => {
      this.login();
      this.registerEvents(MultiDebug.Interface.socketModule, socket);
    });
  }
}

export default MultiDebug;
