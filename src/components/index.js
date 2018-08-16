/**@module*/
import io from 'socket.io-client';
import EditControl from './tool/EditControl.min.js'
import BABYUI from './babyui/babyui';
import createJSON from './tool/createJSON';
import initSceneByJSON from './tool/initSceneByJSON';
import Tool from './tool/tool'

let scene = window.scene;
let multiDebugDom = $(".babylon-material-editor");

/**@Class */
class MultiDebug {
  /**暴露的Applicationcent层接口*/
  static exportAPI = {
    "menuModule": ["onDebugMode", "onViewMode", "onClickMainMenu"],
    "lanModule": ["onClickLanList", "onMouseoverLanList", "onMouseoutLanList", "onRefreshScene", "onClickSubMenu"],
    "debugModule": ["onChange"]
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
        MultiDebug.get("menuModule", "navTop").removeClass("opacity");
      },
      /**浏览模式触发的事件*/
      onViewMode: function () {
        MultiDebug.get("menuModule", "navTop").addClass("opacity");
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
       * @param {string} data.fromImg - 发送者头像
       * @param {string} data.to - 发送对象名字
       * @param {string} data.toImg - 发送对象头像
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
    socketModule: {
      /**成功登陆触发的事件
       * @param {string} userName 用户姓名
       * @param {string} userImg 用户头像路径
       * */
      onLoginSuccess: function (userName, userImg, myIP) {
        //保存我的信息
        MultiDebug.set("socketModule", "myName", userName);
        MultiDebug.set("socketModule", "myImg", userImg);
        MultiDebug.set("socketModule", "myIP", myIP);
        //提示
        MultiDebug.Tool.showMessage("您好， " + userName + " ，欢迎登陆......", 5);
        //------处理聊天信息
        MultiDebug.exe("socketModule", "getServerData", "chatContent", function (data) {
          //初始化到缓存
          MultiDebug.exe("chatModule", "initChatContentBuffer", data);
          //通知其他人
          MultiDebug.exe("socketModule", "broadcastOtherMylogin");
        })
        //------处理日志信息
        MultiDebug.exe("socketModule", "getServerData", "logContent", function (data) {
          //初始化到缓存
          MultiDebug.exe("chatModule", "initLogContentBuffer", data);
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
        MultiDebug.exe("chatModule", "getServerImg", img, function (base64) {
          let content = "尊敬的 " + name + " 上线了...";
          //桌面通知
          MultiDebug.exe("chatModule", "showDesktopMessage", "", content, base64);
          //追加到日志
          //MultiDebug.exe("chatModule", "appendLogContentBuffer", content);
        })
      },
      /**其他用户离开房间触发的事件
       * @param {string} userName - 登陆人姓名
       * @param {string} userImg - 登陆人头像
       * */
      onOtherPeopleLogOut: function (userName, userImg) {
        MultiDebug.exe("chatModule", "getparamServerImg", userImg, function (base64) {
          let content = userName + " 离开房间了...";
          //桌面通知
          MultiDebug.exe("chatModule", "showDesktopMessage", "", content, base64);
          //追加到日志
          //MultiDebug.exe("chatModule", "appendLogContentBuffer", content);
        })
      },
      /**用户需要注册时 触发的事件，此事件发生在服务器找不到客户端IP信息时*/
      onRegister: function () {
        MultiDebug.exe("socketModule", "showLogin");
      },
      /**用户昵称重名触发的事件
       * @param {string} userName - 重复的名字*/
      onNameRepeat: function (userName) {
        MultiDebug.exe("socketModule", "showNameRepeat", userName)
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
          MultiDebug.exe("chatModule", "getServerImg", data.fromImg, function (base64) {
            MultiDebug.exe("chatModule", "showDesktopMessage", data.from, data.content, base64)
          })
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
    },
    /**@namespace*/
    debugModule: {
      /**当调试值发生变化时候触发的事件
       * @param {object} mesh -当前正在调试的物体*/
      onChange: function (mesh) {
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
        // app.debugMode();
      },
      /**浏览模式触发的事件*/
      onViewMode: function () {
        // app.viewMode();
      },
      /**点击主菜单触发的事件
       * @param {string} itemName - 选项名字*/
      onClickMainMenu: function (itemName) {
        let myName = MultiDebug.get("socketModule", "myName");
        let myIP = MultiDebug.get("socketModule", "myIP");

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
                userIP: myIP
              });
              //更新本地LANLIST
              MultiDebug.exe("lanModule", "refreshSingleLan", {
                stat: "success",
                config: true,
                title: "...",
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

          !noMessage && MultiDebug.Tool.showMessage("一键锁定成功......", 1);
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
          MultiDebug.Tool.showMessage("一键解锁成功......", 1);
          MultiDebug.exe("chatModule", "appendLogContentBuffer", "一键解锁成功......");
          //取消调试框
          MultiDebug.exe("debugModule", "hideDebug");
        }

        function saveVersion() {
          MultiDebug.Tool.showPrompt("请输入你要保存的版本的名字", function (data) {
            //没有重名的
            let json = createJSON({console: false});
            MultiDebug.exe("socketModule", "saveAppFile", "version/" + new Date().getTime() + " " + data, json);
            MultiDebug.Tool.showMessage("保存版本" + data + "成功......");
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
              showName += MultiDebug.Tool.getDayTime(date, true);
              map[showName] = name;
              return showName;
            })
            MultiDebug.Tool.showSelect("请选择你要回溯的版本", list, function (showName) {
              let fileName = map[showName];
              if (fileName) {
                let appName = MultiDebug.get("socketModule", "appName");
                //自动一键锁定
                lock(true);
                //版本回溯,无缓存
                $.get(APPFIX + appName + "/multidebug.bak/version/" + fileName, function (data) {
                  initSceneByJSON(data);
                  MultiDebug.Tool.showMessage("版本已经成功回溯到 " + showName);
                  //MultiDebug.Tool.showMessage("请注意，服务器只保存您锁定的物体的数据!他人锁定的物体不会进行保存...", 2, "warn");
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
                  window.scene.lights.forEach(function (light) {
                    MultiDebug.exeA("debugModule", "onChange", light);
                  })
                  //重置调试UI
                  app.refreshDebugUI();
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
              showName += MultiDebug.Tool.getDayTime(date, true);
              map[showName] = name;
              return showName;
            })
            MultiDebug.Tool.showSelect("请选择你要删除的版本", list, function (showName) {
              let fileName = map[showName];
              if (fileName) {
                let appName = MultiDebug.get("socketModule", "appName");
                MultiDebug.exe("socketModule", "delAppFile", "version/" + fileName);
                MultiDebug.Tool.showMessage("成功删除版本" + showName);
                MultiDebug.exe("chatModule", "appendLogContentBuffer", "成功删除版本" + showName)
              }
            })
          })
        }

        function updatePic() {
          app.refreshPicPanel();
        }

        function setOutlineWidth() {
          MultiDebug.Tool.showPrompt("设置描边粗细<br>当前:" + app.getOutlineWidth(), function (num) {
            num = Number(num);
            if (typeof num == "number") {
              app.setOutlineWidth(num);
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
          MultiDebug.Tool.showPrompt("设置光球大小<br>当前:" + app.getLightBallSize(), function (num) {
            num = Number(num);
            if (typeof num == "number") {
              app.setLightBallSize(num);
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
        app.renderMesh(data.data.mesh)
      },
      /**鼠标划过
       * @param {object} data
       * @param {string} data.stat - 选项状态 -"danger"||"warn"||"success"
       * @param {string} data.name - 选项名字
       * @param {Object} data.dom - 触发的选项DOM元素，jQuery对象
       * @param {Object} data.data - 额外数据
       */
      onMouseoutLanList: function (data) {
        app.unrenderMesh(data.data.mesh)
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
        let myIP = MultiDebug.get("socketModule", "myIP");
        let data = li[0].data;

        function lock() {
          MultiDebug.exe("socketModule", "setServerData", "lockInfo." + data.name, {
            userName: myName,
            userIP: myIP
          }, function () {
            MultiDebug.Tool.showMessage("锁定成功...", 1);
            //更新本地LANLIST
            MultiDebug.exe("lanModule", "refreshSingleLan", {
              stat: "success",
              config: true,
              title: "...",
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
            MultiDebug.Tool.showMessage("解锁成功...", 1);
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
            MultiDebug.Tool.showMessage("物体没有材质,无法导出...", 1, "danger")
          }
        }

        function importMaterial() {
          if (data.mesh.material) {
            app.importMaterial(data.mesh, data.mesh.material)
          } else {
            MultiDebug.Tool.showMessage("物体没有材质,无法导出...", 1, "danger")
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
          case "调试材质": {
            //自动锁定
            if (data.stat == "success" || data.stat == "warn") {
              if (data.stat == "warn") {
                lock();
              }
              //检测物体是否有材质
              if (MultiDebug.exe("debugModule", "showDebug", data.mesh)) {
                //显示调试框
                app.showDebug(data.mesh);
                //高亮显示
                MultiDebug.exe("lanModule", "highlightLi", li);
              }
            }
            // else {
            //    MultiDebug.Tool.showMessage("请先锁定...", 2, "danger");
            //}
          }
            break;
          case "复制材质":
            app.copyMaterial(data.mesh.material, data.mesh);
            break;
          case "粘贴材质":
            if (data.stat == "success") {
              app.pasteMaterial(data.mesh.material, data.mesh);
            } else {
              MultiDebug.Tool.showMessage("请先锁定", 1, "warn")
            }
            break;
          case "导入材质":
            if (data.stat == "success") {
              importMaterial();
            } else {
              MultiDebug.Tool.showMessage("请先锁定", 1, "warn")
            }
            break;
          case "导出材质":
            if (data.stat == "success") {
              exportMaterial();
            } else {
              MultiDebug.Tool.showMessage("请先锁定", 1, "warn")
            }
            break;
          case "转化材质":
            if (data.stat == "success") {
              if (data.mesh.material) {
                let materiaTypeList = app.getMaterialTypeList();
                let myMaterialType = data.mesh.material.getClassName();
                let canToggleList = materiaTypeList.filter(function (kind) {
                  return kind != myMaterialType;
                })
                MultiDebug.Tool.showSelect("您当前的材质类型为:<br>" + myMaterialType + "<br>请选择您要转换的材质类型", canToggleList, function (type) {
                  app.toggleMaterialType(data.mesh, type)
                })
              } else {
                MultiDebug.Tool.showMessage("请先给物体赋予材质再进行转化", 1, "warn")
              }
            } else {
              MultiDebug.Tool.showMessage("请先锁定", 1, "warn")
            }
            break;
        }
      },
    },
    picModule: {},
    chatModule: {},
    /**@namespace*/
    socketModule: {
      /**登陆成功的事件*/
      onLoginSuccess: function () {
        //保存初始纹理
        app.storeInitialTexture();
        //更新lanlist
        app.refreshLanList(true);
        //更新图片库
        app.refreshPicPanel(true);
        //自动打开第一个
        MultiDebug.exeI("picModule", "onTogglePicPanel", MultiDebug.get("picModule", "button1"), MultiDebug.get("picModule", "panel1"))
        //更新调试数据
        //app.refreshDebug();
        //更新描边数据
        MultiDebug.exe("socketModule", "getServerData", "outlineWidth", function (data) {
          if (typeof data == "number") {
            app.setOutlineWidth(data)
          }
        })
        //更新光源数据
        MultiDebug.exe("socketModule", "getServerData", "lightBallSize", function (data) {
          if (typeof data == "number") {
            app.setLightBallSize(data)
          }
        })
        //切换调试模式
        MultiDebug.exeA("menuModule", "onDebugMode");
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
          let light = window.scene.getLightByName(data.lightName);
          if (light) {
            initSceneByJSON(data.json, null, light);
            app.refreshLightBall(light);
          }
        }

        function doMaterial() {
          let material = window.scene.getMaterialByID(data.materialId);
          if (material) {
            initSceneByJSON(data.json, material)
          }
        }

        if (data.lightName) {
          doLight();
        } else {
          doMaterial();
        }
      }
    },
    /**@namespace*/
    debugModule: {
      /**当调试值发生变化时候触发的事件
       * @param {object} mesh -当前正在调试的物体或灯光*/
      onChange: function (mesh) {
        if (mesh && mesh.material) {
          //获取调试的JSON
          let json = createJSON({meshes: mesh, console: false});
          json = JSON.parse(json);
          json = json.materials[mesh.material.name];
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
          let json = createJSON({lights: mesh, console: false});
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
    }
  }
  static modules = null;
  menuModule = null;
  lanModule = null;
  picModule = null;
  chatModule = null;
  debugModule = null;
  socketModule = null;
  socket = null;
  opt = null;

  constructor(opt) {
    scene = opt.scene;
    MultiDebug.modules = this;
    this.opt = opt;
    this.menuModule = new this.MenuModule();
  }

  /**执行UI模块方法,兼容错误处理
   * @param {string} module - 模块名字，"chatModule"||"MenuModule"||"lanModule"||"picModule"||"debugModule"||"socketModule"
   * @param {string} func - 要执行的模块的方法，如"openWindow"
   * @param {Object[]} argv1 - 传入模块方法的参数
   * @param {Object[]} argv2 - 传入模块方法的参数
   * @param {Object[]} argv.... - 传入模块方法的参数
   * */
  static exe(module, func, argv1, argv2) {
    let modules = null;
    if (!(modules = MultiDebug.modules)) {
      console.warn("需要先实例化MultiDebug,才能调用模块");
      return;
    }
    if (modules[module] && modules[module][func] && modules[module][func].apply) {
      let arg = [];
      for (let i = 2; i <= arguments.length; i++) {
        arg.push(arguments[i])
      }
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
   * @param {Object[]} argv1 - 传入接口方法的参数
   * @param {Object[]} argv2 - 传入接口方法的参数
   * @param {Object[]} argv... - 传入接口方法的参数
   */
  static exeI(module, func, argv1, argv2) {
    let _module, _func;
    if (MultiDebug.Interface.hasOwnProperty(module)) {
      if ((_module = MultiDebug.Interface[module]).hasOwnProperty(func)) {
        _func = _module[func];
        let arg = [];
        for (let i = 2; i < arguments.length; i++) {
          arg.push(arguments[i])
        }
        let returnValue = _func.apply && _func.apply(window, arg);
        let api = MultiDebug.exportAPI;
        try {
          if (api && api[module] && api[module].indexOf && api[module].indexOf(func) != -1) {
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
   * @param {Object[]} argv1 - 传入接口方法的参数
   * @param {Object[]} argv2 - 传入接口方法的参数
   * @param {Object[]} argv... - 传入接口方法的参数
   */
  static exeA(module, func, argv1, argv2) {
    let _module, _func;
    if (MultiDebug.Application.hasOwnProperty(module)) {
      if ((_module = MultiDebug.Application[module]).hasOwnProperty(func)) {
        _func = _module[func];
        let arg = [];
        for (let i = 2; i < arguments.length; i++) {
          arg.push(arguments[i])
        }
        return _func.apply && _func.apply(window, arg)
      } else {
        console.warn("没有MultiDebug.Application." + module + "." + func)
      }
    } else {
      console.warn("没有MultiDebug.Application." + module)
    }
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
      //禁止右键默认事件
      window.oncontextmenu = function () {
        return false;
      }
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

  }
}

export default MultiDebug;
