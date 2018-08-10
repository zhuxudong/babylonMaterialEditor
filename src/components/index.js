import app from './app.js'
import org from './EditControl.min.js'
import io from 'socket.io-client';

// import io from './socket.io.js';

function MultiDebug(option) {
  var def = {
    ip: window.location.hostname,
    port: 30,
    onlyServer: false,
  }
  var opt = Object.assign(def, option);
  var _this = this;
  var socket = null;
  var multiDebugDom = $(".multi-debug");
  var EXE = MultiDebug.exe;
  var GET = MultiDebug.get;
  var SET = MultiDebug.set;
  var EXEI = MultiDebug.exeI;
  MultiDebug.modules = this;
  /**socket*/
  this.socket = null;
  /**模块实例对象*/
  this.menuModule = null;
  /**模块实例对象*/
  this.lanModule = null;
  /**模块实例对象*/
  this.picModule = null;
  /**模块实例对象*/
  this.chatModule = null;
  /**模块实例对象*/
  this.debugModule = null;
  /**模块实例对象*/
  this.socketModule = null;
  /**暴露的Applicationcent层接口*/
  MultiDebug.exportAPI = {
    "menuModule": ["onDebugMode", "onViewMode", "onClickMainMenu"],
    "lanModule": ["onClickLanList", "onMouseoverLanList", "onMouseoutLanList", "onRefreshScene", "onClickSubMenu"],
    "debugModule": ["onChange"]
  }
  /**开启菜单模块
   * @class*/
  this.MenuModule = function () {
    var module = this;
    var navTop = multiDebugDom.find(".nav-top");
    this.navTop = navTop;
    var menus = multiDebugDom.find(".nav-top .section .z-menu");
    //ul
    var debugMenu = $("#z_debugMode");
    var mainMenu = $("#z_mainMenu");
    //span
    var debugMenuName = debugMenu.parent().children().eq(1)
    //ul
    var chatMenu = $("#z_online");

    function init() {
      //上拉下拉
      function pull() {
        menus.blur(function (e) {
          var $dom = $(e.srcElement || e.target).children("ul");
          $dom.slideUp({
            duration: 300,
            easing: "easeInOutBack"
          });
          return false;
        }).click(function (e) {
          var $dom = $(e.srcElement || e.target).children("ul");
          $dom.slideToggle({
            duration: 300,
            easing: "easeInOutBack"
          });
          return false;
        }).find("ul").click(function (e) {
          var $dom = $(e.srcElement || e.target);
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
        var $dom = $(e.srcElement || e.target);
        debugMenuName.html($dom.html());
        if ($dom.index() == 0) {
          EXEI("menuModule", "onDebugMode");
        } else if ($dom.index() == 1) {
          EXEI("menuModule", "onViewMode");
        }
      })
      //切换聊天列表
      chatMenu.click(function (e) {
        var $dom = $(e.srcElement || e.target);
        if ($dom[0].nodeName.toUpperCase() == "LI") {
          EXEI("menuModule", "onClickChatMenu", $dom.html());
        }
      })
      //工具选项
      mainMenu.children("li").click(function (e) {
        var $dom = $(e.srcElement || e.target);
        var itemName = $dom.html();
        EXEI("menuModule", "onClickMainMenu", itemName)
      })
    }

    init();
    /**更新菜单栏用户列表
     * @param {Object[]} names - 名字数组*/
    this.updateUserList = function (names) {
      chatMenu.html("");
      names.forEach(function (name, i) {
        var li = $("<li " + ((i == 0) ? " " : "class=\"border\" ") + ">" + name + "</li>");
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
  /**开启局域网模块
   * @class*/
  this.LanModule = function () {
    var module = this;
    var nav = multiDebugDom.find(".nav-lan");
    var bar = multiDebugDom.find(".nav-lan-dragbar");
    var lanTitle = multiDebugDom.find(".nav-lan .title");
    var lanList = multiDebugDom.find(".nav-lan .lan-list");
    var refreshButton = lanTitle.find(".refresh");
    var subMenu = multiDebugDom.find("ul.submenu");
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
          var stat = info.stat;
          var name = info.name;
          var dom = $("<li>");
          var statSpan = $("<span class=stat>");
          var nameSpan = $("<span>");
          statSpan.addClass("color-" + stat);
          nameSpan.html(name);
          dom.append(statSpan).append(nameSpan);
          //配置按钮点击事件
          if (info.config) {
            var config = $("<span class='iconfont config'>")
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
            for (var key in info.data) {
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
            var name = lan.children().eq(1);
            if (name.html() == dom) {
              dom = lan;
              for (var key in data) {
                if (lan[0].data[key] == data[key]) {
                  dom = lan;
                  break;
                }
              }
            }
          })
        }
        var stat = dom.find(".stat")
        var name = dom.children().eq(1);
        var config = dom.find(".config");
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
            var config = $("<span class='iconfont config'>");
            dom.append(config);
          }
          //配置按钮点击事件
          dom[0].config = true;
        } else {
          config.remove();
          dom[0].config = false;
        }
        if (json.data) {
          for (var key in json.data) {
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
        var height = subMenu.innerHeight();
        subMenu.show({
          duration: 300,
          easing: "easeInOutBack"
        });
        var windowHeight = window.innerHeight;
        var top = y || dom.offset().top - window.scrollY;
        var left = x || (lanList.innerWidth() + lanList.offset().left + 15);
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
    var oriWidth = null;

    function init() {
      var px = null;
      var canDrag = false;
      var width = null;
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
            var dif = e.clientX - px;
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
        EXEI("lanModule", "onRefreshScene")
      })

      //li点击事件
      function onClickLanList(e) {
        var src = $(e.srcElement || e.target);
        if (src[0].nodeName == "LI") {
          var stat = src[0].data.stat;
          var name = src[0].data.name;
          EXEI("lanModule", "onClickLanList", {
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
        var src = $(e.srcElement || e.target);
        if (src[0].nodeName == "LI") {
          EXEI("lanModule", "onMouseoverLanList", {
            stat: src[0].data.stat,
            name: src[0].data.name,
            dom: src,
            data: src[0].data
          })
        }
      }).on("mouseout", function (e) {
        var src = $(e.srcElement || e.target);
        if (src[0].nodeName == "LI") {
          EXEI("lanModule", "onMouseoutLanList", {
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
        EXEI("lanModule", "onClickSubMenu", (e.srcElement || e.target).innerHTML, subMenu, subMenu[0].data.src);
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
  this.PicModule = function () {
    var module = this;
    var bar = multiDebugDom.find(".nav-pic-dragbar");
    var navPic = multiDebugDom.find(".nav-pic");
    var picTitle = multiDebugDom.find(".nav-pic .title")
    var picPanel = multiDebugDom.find(".nav-pic .pic-panel");
    var disableButton = null;
    var activeButton = null;
    var activePanel = null;

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
      var currentPanel = panel;
      var extend = ["_px.jpg", "_py.jpg", "_pz.jpg", "_nx.jpg", "_ny.jpg", "_nz.jpg"];
      if (currentPanel.hasClass("pic-panel-cube")) {
        currentPanel.html("");
        [].concat(data).forEach(function (fileName) {
          var file = $("<div class=file draggable=true>");
          var name = $("<span class=name>");
          name.html(fileName);
          for (var i = 0; i < 6; i++) {
            var img = $("<img class=mini title=" + (fileName + extend[i]) + ">")
            img[0].src = path + fileName + "/" + fileName + extend[i];
            file.append(img);
          }
          file.append(name);
          currentPanel.append(file);
          file.click(function (e) {
            var target = e.srcElement || e.target;
            var picName = null;
            if ((target.nodeName).toUpperCase() == "IMG") {
              picName = fileName + extend[$(target).index()];
            }
            EXEI("picModule", "onClickPic", {
              button: e.button,
              fileName: fileName,
              picName: picName,
              path: path,
              type: "skybox"
            })
          })
          file.on("dragstart", function (e) {
            var info = {
              fileName: fileName,
              path: path,
              type: "skybox",
              panel: panel.index()
            }
            var data = e.originalEvent.dataTransfer;
            data.setData("picData", JSON.stringify(info));
            EXEI("picModule", "onDragPic", info)
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
      var currentPanel = panel;
      if (currentPanel.hasClass("pic-panel-texture")) {
        currentPanel.html("");
        [].concat(data).forEach(function (fileName) {
          if (fileName == "Thumbs.db")
            return;
          var file = $("<div class=file draggable=true>");
          var name = $("<span class=name>");
          name.html(fileName);
          var img = $("<img class=mini title=" + fileName + ">");
          img[0].src = path + fileName;
          file.append(img).append(name);
          currentPanel.append(file);
          file.click(function (e) {
            EXEI("picModule", "onClickPic", {
              button: e.button,
              fileName: fileName,
              picName: fileName,
              path: path,
              type: "texture",
            })
          })
          file.on("dragstart", function (e) {
            var info = {
              fileName: fileName,
              path: path,
              type: "texture",
              panel: panel.index()
            }
            var data = e.originalEvent.dataTransfer;
            data.setData("picData", JSON.stringify(info))
            EXEI("picModule", "onDragPic", info)
          })

        })
      }
    }
    /**滚动到相应的图片，高亮显示
     * @param {number} panelIndex 第1,2,3,4个panel
     * @param {string} fileName 文件名字*/
    this.scrollToPic = function (panelIndex, fileName) {
      var panel = module["panel" + panelIndex];
      var button = module["button" + panelIndex];
      //显示
      module.showPanel(panel);
      //按钮
      module.activeButton(button);
      //滚动
      panel.children(".file").each(function (i, dom) {
        dom = $(dom);
        var name = dom.find("span.name").html();
        if (name == fileName) {
          dom.addClass("short-tip");
          var currentScrollTop = panel.scrollTop();
          var dif = dom.position().top;
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
      var py = null;
      var canDrag = false;
      var height = null;
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
            var dif = py - e.clientY;
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
        var $dom = $(e.srcElement || e.target);
        var panel = module["panel" + ($dom.index() + 1)]
        //禁止状态的按钮不能触发事件
        if ($dom.hasClass("disable")) {
          return;
        }
        EXEI("picModule", "onTogglePicPanel", $dom, panel)
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
  this.ChatModule = function () {
    var module = this;
    this.MAXCONTENT = 10;//最大预加载聊天信息，向上滚动懒加载
    var navChat = multiDebugDom.find(".nav-chat");
    var chatTop = $(".nav-chat .chat-top");
    var chatWho = chatTop.find(".chat-who")
    var myName = $(".nav-chat .chat-top .user-info .myname");
    var myImg = $(".nav-chat .chat-top .user-info .user-img.user-me");
    var chatList = $(".nav-chat .chat-list");
    //拖拽条
    var dragBarTop = $(".nav-chat .dragbar-top");
    var dragBarBottom = $(".nav-chat .dragbar-bottom");
    var dragBarLeft = $(".nav-chat .dragbar-left");
    var dragBarRight = $(".nav-chat .dragbar-right");
    var dragBarLeftTop = $(".nav-chat .dragbar-left-top");
    var dragBarLeftBottom = $(".nav-chat .dragbar-left-bottom");
    var dragBarRightTop = $(".nav-chat .dragbar-right-top");
    var dragBarRightBottom = $(".nav-chat .dragbar-right-bottom");
    //信息主体
    var chatBody = $(".nav-chat .chat-body");
    var close = chatTop.find(".user-info .close");
    var rename = chatTop.find(".user-info .config");
    //发送
    var chatInput = $(".nav-chat .chat-input");
    var submit = $(".nav-chat .chat-input .send");
    var textarea = $(".nav-chat .chat-input textarea");
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
    var imgBuffer = {}
    //正在ajax请求的url
    var ajaxing = {};

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
    /**获取图片资源，有缓存的话会读取缓存
     * @param {string} imgPath -图片服务器相对路径
     * @param {function} onsuccess - 读取成功的回调函数 (base64:图片数据)
     * @param {boolean} force - 强制读取非缓存内容
     * */
    this.getServerImg = function (imgPath, onsuccess, force) {
      if (!imgPath) {
        return
      }
      if (!force && imgBuffer.hasOwnProperty(imgPath)) {
        onsuccess && onsuccess(imgBuffer[imgPath]);
      } else {
        //如果已经有请求正在发送，则只需要等待请求，最多等待5s.
        if (ajaxing[imgPath]) {
          var time = 0;
          (function () {
            //等待请求完毕
            if (!ajaxing[imgPath]) {
              onsuccess(imgBuffer[imgPath])
            } else {
              if (time++ < 10) {
                window.setTimeout(arguments.callee, 500)
              } else {
                onsuccess && onsuccess(null);
              }
            }
          })();
        } else {
          ajaxing[imgPath] = true;
          $.ajax(SERVERFIX + imgPath, {
            error: function () {
              ajaxing[imgPath] = false;
              onsuccess && onsuccess(null);
            },
            success: function (base64) {
              setImgBuffer(imgPath, base64);
              ajaxing[imgPath] = false;
              onsuccess && onsuccess(base64);
            }
          })
        }

      }
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
        chatList.children().each(function (i, user) {
          user = $(user);
          if (user.find("div:last-child").html() == userName) {
            if (once) {
              user.addClass("reminder-once");
              $("#z_chatMenu").addClass("reminder-once")
            } else {
              user.addClass("reminder-infinite");
              $("#z_chatMenu").addClass("reminder-infinite")
            }
          }
        })
      }, 100)
    }
    /**取消消息提醒
     * @param {string} userName - 需要取消消息未读提醒的频道名字
     * */
    this.hideContentReminder = function (userName) {
      $("#z_chatMenu").removeClass("reminder-infinite")
      chatList.children().each(function (i, user) {
        user = $(user);
        if (user.find("div:last-child").html() == userName) {
          user.removeClass("reminder-infinite reminder-once");
        }
      })
    }

    /**显示桌边提醒
     * @param {string} title - 需要显示在桌面的标题
     * @param {string} message - 需要显示在桌面的文字
     * @param {string} imgURL - 需要显示在桌面的图片URL
     * @param {number} time -   消息显示的时间,默认3s
     * @return {object} notification -   消息对象，可以通过hideDesktopMessage（notification）来关闭
     * */
    this.showDesktopMessage = function (title, message, imgURL, time) {
      if (Notification.permission == "default") {
        Notification.requestPermission && Notification.requestPermission()
      }
      var notification = new Notification(title, {
        body: message,
        icon: imgURL
      });
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

    var logContentBuffer = [];
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
      var data = {};
      data.from = GET("socketModule", "myName");
      data.fromImg = GET("socketModule", "myImg");
      data.content = content;
      data.to = module.logRoom;
      data.time = new Date().getTime();
      logContentBuffer.push(data);
      if (module.currentChannel == module.logRoom) {
        module.appendChatBody(data);
      }
      //保存到服务器
      EXEI("chatModule", "onAppendLogContent", data);
    }
    /**获取消息日志缓存
     * @return {object[]} 日志缓存数据包*/
    this.getLogContentBuffer = function () {
      return logContentBuffer;
    }
    /**更新聊天框在线人员
     * @param {Object[]} users
     * @param {string} users[].userName -用户名字
     * @param {string} users[].userImg  - 用户头像路径
     * */
    this.updateUserList = function (users) {
      //删除用户列表,除了公共聊天室和消息日志
      chatList.children().each(function (i, dom) {
        dom = $(dom);
        if (i > 1) {
          dom.remove();
        }
      })
      var one = true;
      users.forEach(function (userInfo) {
        var user = $("<div class=user>");
        var img = $("<div class=user-img>");
        var name = $("<div class=user-name >" + userInfo.userName + "</div>");
        if (userInfo.userImg) {
          module.getServerImg(userInfo.userImg, function (base64) {
            img.css("background-image", "url(" + base64 + ")");
            //刷新一次聊天窗口，防止用户昵称和头像的变化
            if (one) {
              one = false;
              EXEI("chatModule", "onToggleUserChannel", module.currentChannel);
            }
          }, true)
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
        module.getServerImg(myInfo.userImg, function (base64) {
          myImg.css("background-image", "url(" + base64 + ")");
          //更新聊天信息
        }, true)
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
    var chatContentBuffer = []

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
     * @param {string} data[].fromImg - 发送者头像
     * @param {string} data[].to - 发送对象名字
     * @param {string} data[].toImg - 发送对象头像
     * @param {string} data[].content - 聊天内容
     * @param {string} data[].time - 聊天历史时间
     * @param {function} onsuccess - 初始化成功后的回调函数
     */
    this.createChatBody = function (data, onsuccess) {
      if (!data) {
        return;
      }
      chatBody.html("");
      [].concat(data).forEach(function (data) {
        var myName = GET("socketModule", "myName");
        var isPublic = module.currentChannel == module.publicRoom;
        var isPublicMe = isPublic && data.from == myName && data.to == module.publicRoom;
        var isPublicOther = isPublic && data.from != myName && data.to == module.publicRoom;
        var isMe = !isPublic && data.from == myName && data.to == module.currentChannel;
        var isOther = !isPublic && data.from == module.currentChannel && data.to == myName;
        //过滤其他频道信息
        if (!isMe && !isOther && !isPublicMe && !isPublicOther) {
          return;
        }
        //start
        var wrapper = $("<div class=chat-content>");
        var imgWrapper = $("<div class=user-img-wrapper>");
        var userImg = $("<div class=user-img>");
        imgWrapper.append(userImg);
        var contentWrapper = $("<div class=content-wrapper>");
        var name = $("<span class=username>");
        var content = $("<div class=content>");
        contentWrapper.append(name).append(content);
        var time = $("<div class=time>");
        wrapper.append(imgWrapper).append(contentWrapper).append(time);
        content.html(data.content);
        name.html(data.from);
        if (data.time) {
          time.html(MultiDebug.Tool.getDayTime(data.time));
        }
        if (isMe || isPublicMe) {
          wrapper.addClass("me")
        } else {
          wrapper.addClass("other")
        }
        if (data.fromImg) {
          module.getServerImg(data.fromImg, function (base64) {
            userImg.css("background-image", "url(" + base64 + ")");
          })
        }
        chatBody.append(wrapper);
      })
      onsuccess && onsuccess();
      var children = null;
      if ((children = chatBody.children()).length > 0) {
        chatBody.scrollTop(children.last().position().top - children.first().position().top)
      }
    }
    /**根据传进来的JSON追加聊天信息,默认滚屏到底部
     * @param {Object[]} data - 聊天记录数据包
     * @param {string} data[].from - 发送者名字
     * @param {string} data[].fromImg - 发送者头像
     * @param {string} data[].to - 发送对象名字
     * @param {string} data[].toImg - 发送对象头像
     * @param {string} data[].content - 聊天内容
     * @param {string} data[].time - 聊天历史时间
     * @param {function} onsuccess - 初始化成功后的回调函数
     */
    this.appendChatBody = function (data, onsuccess) {
      if (!data) {
        return;
      }
      [].concat(data).forEach(function (data) {
        var myName = GET("socketModule", "myName");
        var isPublic = module.currentChannel == module.publicRoom;
        var isPublicMe = isPublic && data.from == myName && data.to == module.publicRoom;
        var isPublicOther = isPublic && data.from != myName && data.to == module.publicRoom;
        var isMe = !isPublic && data.from == myName && data.to == module.currentChannel;
        var isOther = !isPublic && data.from == module.currentChannel && data.to == myName;
        //过滤其他频道信息
        if (!isMe && !isOther && !isPublicMe && !isPublicOther) {
          return;
        }
        //start
        var wrapper = $("<div class=chat-content>");
        var imgWrapper = $("<div class=user-img-wrapper>");
        var userImg = $("<div class=user-img>");
        imgWrapper.append(userImg);
        var contentWrapper = $("<div class=content-wrapper>");
        var name = $("<span class=username>");
        var content = $("<div class=content>");
        contentWrapper.append(name).append(content);
        var time = $("<div class=time>");
        wrapper.append(imgWrapper).append(contentWrapper).append(time);
        content.html(data.content);
        name.html(data.from);
        if (data.time) {
          time.html(MultiDebug.Tool.getDayTime(data.time));
        }
        if (isMe || isPublicMe) {
          wrapper.addClass("me")
        } else {
          wrapper.addClass("other")
        }
        if (data.fromImg) {
          module.getServerImg(data.fromImg, function (base64) {
            userImg.css("background-image", "url(" + base64 + ")");
          })
        }
        chatBody.append(wrapper);
      })
      onsuccess && onsuccess();
      var children = null;
      if ((children = chatBody.children()).length > 0) {
        chatBody.scrollTop(children.last().position().top - children.first().position().top)
      }
    }

    //初始化UI和UI事件
    function init() {
      var py = 0;
      var px = 0;
      var marginLeft = navChat.css("margin-left");
      var marginTop = navChat.css("margin-top");
      var height = 0;
      var width = 0;
      var canDrag = false;
      var canMove = false;

      //拖拽拉伸
      function move() {
        var zIndex = $(".multi-debug").css("z-index");

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
          var dom = e.srcElement || e.target;
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
            var difY = py - e.clientY;
            var difX = px - e.clientX;
            navChat.css("margin-left", window.parseFloat(marginLeft) - difX + "px")
              .css("margin-top", window.parseFloat(marginTop) - difY + "px")
          } else if (canDrag) {
            var difX = px - e.clientX;
            var difY = py - e.clientY;
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
              var difX = px - e.clientX;
              navChat.innerWidth(width + difX);
              navChat.css("margin-left", window.parseFloat(marginLeft) - difX + "px");
            }
            if (canDrag.search("right") != -1) {
              var difX = px - e.clientX;
              navChat.innerWidth(width - difX);
            }
          }
        })
        $(document).on("mouseup", function () {
          canMove = false;
          canDrag = false;
          var offset = navChat.offset();
          var dif = 50;
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
        EXEI("chatModule", "onRename", {
          myName: GET("socketModule", "myName"),
          myImg: GET("socketModule", "myImg")
        })
      })
      //切换聊天频道，更新currentChannel,currentImg
      chatList.click(function (e) {
        var $dom = $(e.srcElement || e.target);
        var userName = $dom.filter(".user").find(" div:last-child").html()
        EXEI("chatModule", "onToggleUserChannel", userName);
      })

      //发送信息
      function submitEvent() {
        var content = textarea.val();
        textarea.val("");
        var data = {
          from: MultiDebug.get("socketModule", "myName"),
          fromImg: MultiDebug.get("socketModule", "myImg"),
          to: module.currentChannel,
          toImg: module.currentImg,
          content: content,
          time: new Date().getTime()
        }
        EXEI("chatModule", "onSubmitChatContent", data);
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
  this.DebugModule = function () {
    /**BABYUI debug*/
    var module = this;
    window.BABYUI = {
      Base: function (title, parent) {
        var _this = this;
        if (!BABYUI.isInit) {
          BABYUI.initBox();
          BABYUI.isInit = true;
        }
        this.title = title;
        this.parent = parent;
        if (parent) {
          this.parent.dom.append(this.dom);
        } else {
          $(".baby-box").append(this.dom);
        }
        Object.defineProperty(this, "title", {
          set: function (val) {
            title = val;
            if (_this.dom.hasClass("baby-folder")) {
              _this.dom.find("span").eq(0).attr("title", val);
            } else {
              _this.dom.attr("title", val);
            }
            //_this.dom.children("span").eq(0).html(val);
          },
          get: function () {
            return title;
          }
        })
        Object.defineProperty(this, "parent", {
          set: function (val) {
            parent = val;
            if (parent && parent.dom) {
              parent.dom.append(_this.dom)
            }
          },
          get: function () {
            return parent;
          }
        })
        //重置拖拽条的位置和长度
        var box = $(".baby-box");
        var bar = $(".baby-dragbar");
        bar.css("right", box.innerWidth() + "px");
        bar.css("height", box.innerHeight() + "px");
        this.hide = function () {
          this.dom[0].dataset.hide = true;
          this.dom.hide(0, function () {
            bar.css("right", box.innerWidth() + "px");
            bar.css("height", box.innerHeight() + "px");
          });
          return this;
        }
        this.show = function (value) {
          this.dom[0].dataset.hide = false;
          if (typeof value == "boolean") {
            this.value = String(value);
          } else {
            this.value = value;
          }
          this.dom.show(0, function () {
            bar.css("right", box.innerWidth() + "px");
            bar.css("height", box.innerHeight() + "px");
          });
          return this;
        }
        this.alert = function () {
          if (BABYUI.alertDOM) {
            BABYUI.alertDOM.removeClass("alert");
          }
          if (_this.dom.hasClass("baby-folder")) {
            BABYUI.alertDOM = _this.dom.children().eq(0);
            BABYUI.alertDOM.addClass("alert");
          } else {
            _this.dom.addClass("alert");
            BABYUI.alertDOM = _this.dom;
          }
        }
        this.stopAlert = function () {
          if (_this.dom.hasClass("baby-folder")) {
            _this.dom.children().eq(0).removeClass("alert");
          } else {
            _this.dom.removeClass("alert");

          }
        }
      },
      isInit: false,
      onChange: function () {
      },
      initBox: function () {
        var box = $("<div class='baby-box'>")
        box.css("max-height", window.innerHeight - 200);
        var bar = $("<div class='baby-dragbar'>");
        $("body").append(box).append(bar);
        bar.css("right", box.innerWidth() + "px");
        var px = null;
        var width = null;
        var canDrag = false;
        bar.on("mousedown", function (e) {
          canDrag = true;
          px = e.clientX;
          width = box.width();
        });
        box.on("mousedown", function (e) {
          if ($(e.target).hasClass("baby-folder")) {
            canDrag = true;
            px = e.clientX;
            width = box.width();
          }
        });
        $(document).on("mousemove", function (e) {
          if (canDrag) {
            var dif = px - e.clientX;
            box.width(width + dif);
            bar.css("right", box.innerWidth() + "px")
          }
        }).on("mouseup", function () {
          canDrag = false;
          if (box.width() < 20) {
            box.width(0);
            bar.css("right", box.innerWidth() + "px");
          }

        })
        //拖拽
        var boxCanDrag = false;
        var bp = {
          x: 0,
          y: 0,
          t: 0,
          r: 0
        }
        box.on("mousedown", function (e) {
          if (e.target == box.find(".baby-folder:first-child > span:first-child")[0]) {
            boxCanDrag = true;
            bp.x = e.clientX;
            bp.y = e.clientY;
            bp.t = window.parseInt(box.css("top"))
            bp.r = window.parseInt(box.css("right"))
            $(document.body).on("mousemove", boxMove)
          }
        })

        function boxMove(e) {
          if (boxCanDrag) {
            var difX = e.clientX - bp.x;
            var difY = e.clientY - bp.y;
            box.css("top", bp.t + difY);
            box.css("right", bp.r - difX);
          }
        }

        box.on("mouseup", function () {
          boxCanDrag = false;
          $(document.body).off("mousemove", boxMove);
        })
      },
      destroy: function () {
        $(".baby-box").remove();
        $(".colorpicker").remove();
        $(".baby-dragbar").remove();
        BABYUI.isInit = false;
      },
      Folder: function (title, parent, canDrag, onDrop) {
        var _this = this;
        this.dom = $("<div class='baby-folder '><span class='open' title=\"" + title + "\">" + title + "</span></div>");
        BABYUI.Base.call(this, title, parent);
        //默认关闭
        var span = this.dom.children().eq(0);
        this.close = function () {
          var box = $(".baby-box")
          var bar = $(".baby-dragbar");
          var width = box.width();
          this.dom.children().not(span).slideUp(200, function () {
            bar.css("height", box.innerHeight() + "px");
          });
          span.removeClass("open");
          span.addClass("close");
          box.width(width);
        }
        this.open = function () {
          var box = $(".baby-box")
          var bar = $(".baby-dragbar");
          //下拉显示非隐藏的元素，本来hide()的元素即使open()了也不会显示
          this.dom.children().not(span).filter("[data-hide!=true]").slideDown(200, function () {
            bar.css("height", box.innerHeight() + "px");
          });
          span.removeClass("close");
          span.addClass("open");
        }

        function onclick() {
          if (span.hasClass("close")) {
            _this.open();
          } else if (span.hasClass("open")) {
            _this.close();
          }
        }

        var clientX = 0;
        span.on("mousedown", function (e) {
          clientX = e.clientX;
        })
        span.on("mouseup", function (e) {
          if (e.clientX == clientX) {
            onclick();
          }
        })
        //span.on("click", onclick);
        if (canDrag) {
          var picData = null;
          //只要冒泡途径中有dom，都重点显示dom.
          this.dom.on("dragenter", function () {
            return false;
          }).on("dragover", function () {
            return false;
          }).on("drop", function (e) {
            if (typeof onDrop != "function") {
              return;
            }
            //_this.dom.animate({left: 0}, {
            //    duration: 300,
            //    easing: "easeInOutBack"
            //})
            var data = e.originalEvent.dataTransfer;
            picData = data.getData("picData");
            if (picData) {
              try {
                picData = JSON.parse(data.getData("picData"))
                onDrop(picData, _this);
              } catch (e) {
                console.warn(e)
              }
            }
          })
        }
      },
      Color: function (title, value, onChange, parent) {
        var _this = this;
        var strVar = "";
        strVar += " <div class=\"baby-color\" title=\"" + title + "\">\n";
        strVar += "<span>" + title + "<\/span>\n";
        strVar += "<span class=\"baby-color-box\"> <\/span>\n";
        strVar += "        <\/div>\n";
        this.dom = $(strVar);
        BABYUI.Base.call(this, title, parent);
        this.value = value;
        this.onChange = onChange;
        var colorBox = this.dom.find("span.baby-color-box");

        Object.defineProperty(this, "value", {
          set: function (val) {
            value = val;
            setValue(val)
          },
          get: function () {
            return value;
          }
        })

        //初始化
        setValue(value);

        function setValue(value) {
          colorBox.css('backgroundColor', value);
          colorBox.ColorPickerSetColor(value);
        }

        colorBox.ColorPicker({
          color: value,
          onShow: function (colpkr) {
            $(colpkr).fadeIn(300);
            return false;
          },
          onHide: function (colpkr) {
            $(colpkr).fadeOut(300);
            if (BABYUI.onChange) {
              BABYUI.onChange();
            }
            return false;
          },
          onSetNewColor: function (hsb, hex, rgb) {
            onChange && onChange(rgb, hex, hsb);
            colorBox.css('backgroundColor', '#' + hex);
          }
        });
      },
      Slider: function (title, value, min, max, step, onChange, parent) {
        var _this = this;
        this.min = min;
        this.max = max;
        this.step = step;
        value = (value == undefined) ? 0 : value;
        this.value = value;
        this.onChange = onChange;

        var strVar = "";
        strVar += " <div class=\"baby-slider\" title=\"" + title + "\">\n";
        strVar += "            <span \">" + title + "<\/span>\n";
        strVar += "            <input type=\"range\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\"  value=\"" + value + "\" class=\"range\" />\n";
        strVar += "            <input type=\"number\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\"  value=\"" + value + "\" class=\"number\"/>\n";
        strVar += "        <\/div>";
        this.dom = $(strVar);

        BABYUI.Base.call(this, title, parent)

        var sliderRange = this.dom.children().eq(1);
        var sliderNumber = this.dom.children().eq(2);


        Object.defineProperty(this, "value", {
          set: function (val) {
            value = val;
            sliderRange.val(value)
            sliderNumber.val(value)
          },
          get: function () {
            return value;
          }
        })

        sliderRange.add(sliderNumber).on("input", function (e) {
          var $dom = $(e.srcElement || e.target);
          _this.value = $dom.val();
          onChange && onChange(Number(value))
        }).on("change", function () {
          if (BABYUI.onChange) {
            BABYUI.onChange();
          }
        })

      },
      Select: function (title, value, values, onChange, parent) {
        var _this = this;
        this.values = values;
        this.value = value;
        this.onChange = onChange;
        var strVar = "";
        strVar += "<div class=\"baby-select\" title=\"" + title + "\">\n";
        strVar += "            <span>" + title + "<\/span>\n";
        strVar += "            <select></select></div>";

        this.dom = $(strVar);
        BABYUI.Base.call(this, title, parent)

        var select = this.dom.children().eq(1);

        for (var i = 0; i < values.length; i++) {
          select.append("<option>" + values[i] + "<\/option>");
        }

        Object.defineProperty(this, "value", {
          set: function (val) {
            value = val;
            setValue(val)
          },
          get: function () {
            return value;
          }
        })


        setValue(value)

        function setValue(value) {
          select.children().each(function (index, option) {
            option.removeAttribute("selected");
            if (option.value == String(value)) {
              option.setAttribute("selected", "selected");
            }
          })
        }

        select.on("change", function () {
          onChange && onChange(select[0].value);
          BABYUI.onChange && BABYUI.onChange();
        })

      },
      Message: function (title, value, parent, canDrag, onDrop, onclick, ondblclick, ontribleclick) {
        var _this = this;
        var strVar = "";
        strVar += " <div class=\"baby-message\" title=\"" + title + "\">\n";
        strVar += "<span>" + title + "<\/span>\n";
        strVar += "<span class=\"baby-message-box\">" + value + "<\/span>\n";
        strVar += "        <\/div>\n";
        this.dom = $(strVar);
        BABYUI.Base.call(this, title, parent);
        this.value = value;
        var messageBox = this.dom.find("span.baby-message-box");
        Object.defineProperty(this, "value", {
          set: function (val) {
            value = val;
            messageBox.html(value)
            BABYUI.onChange && BABYUI.onChange();
          },
          get: function () {
            return value;
          }
        })
        if (canDrag) {
          var picData = null;
          this.dom.on("dragenter", function () {
            return false;
          }).on("dragover", function () {
            return false;
          }).on("drop", function (e) {
            if (typeof onDrop != "function") {
              return;
            }
            var data = e.originalEvent.dataTransfer;
            picData = data.getData("picData");
            if (picData) {
              try {
                picData = JSON.parse(data.getData("picData"));
                onDrop(picData, _this)
              } catch (e) {
                console.warn(e)
              }
            }
          })
        }
        var timeout1 = null;
        var timeout2 = null;
        var timeout3 = null;
        var gap = 300;//300ms;
        //1,2,3点击事件
        this.dom.click(function () {
          if (!timeout1 && !timeout2 && !timeout3) {
            timeout1 = window.setTimeout(function () {
              timeout1 = null;
              if (typeof onclick == "function") {
                onclick(_this);
              }
            }, gap)
          } else if (timeout1 && !timeout2 && !timeout3) {
            window.clearTimeout(timeout1);
            timeout1 = null;
            timeout2 = window.setTimeout(function () {
              timeout2 = null;
              if (typeof ondblclick == "function") {
                ondblclick(_this);
              }
            }, gap)
          } else if (!timeout1 && timeout2 && !timeout3) {
            window.clearTimeout(timeout2);
            timeout2 = null;
            timeout3 = window.setTimeout(function () {
              timeout3 = null;
              if (typeof ontribleclick == "function") {
                ontribleclick(_this);
              }
            }, gap)
          }
        })
      }
    }
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
        MultiDebug.Tool.showMessage(mesh.name + "没有材质...", 2, "danger");
        return;
      }
      if (!mesh.geometry) {
        MultiDebug.Tool.showMessage(mesh.name + "没有顶点数据...", 2, "danger");
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
        EXEI("debugModule", "onChange", module.currentDebugMesh)
      }, 110)
    }
  }
  /** 开启socket模块
   * @class*/
  this.SocketModule = function () {
    var module = this;
    /**用户姓名*/
    this.myName = null;
    /**用户头像*/
    this.myImg = null;
    /**IP*/
    this.myIP = null;
    /**在线用户列表l*/
    this.userList = [];
    /**项目名称*/
    this.appName = "";
    var hostname = opt.ip + ":" + opt.port;
    /**客户端socket*/
    socket = this.socket = _this.socket = io.connect('ws://' + hostname);
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
    this.registerEvents(MultiDebug.Interface.socketModule, socket);
    /**显示登陆框*/
    this.showLogin = function () {
      MultiDebug.Tool.showPromptWithFile("请注册您的用户名，用户名将永久有效", "请上传您的头像", function (text, file, base64) {
        socket.emit("onSaveUserInfo", {
          userName: text,
          userImg: base64,
          logining: true
        })
      }, true);
    }
    /**重命名界面
     *@param {string} data.myName - 本人姓名
     *@param {string} data.myImg - 本人图片路径
     */
    this.showRename = function (data) {
      MultiDebug.Tool.showPromptWithFile("当前昵称:【" + data.myName + "】<br><br>新昵称:", "您可以重新上传头像<br>", function (text, file, base64) {
        socket.emit("onSaveUserInfo", {
          userName: text,
          userImg: base64,
          logining: false
        })
      }, false, data.myImg ? SERVERFIX + data.myImg : null, true);
    }
    /**显示重名提示窗口
     * @param {string} userName - 重复的名字*/
    this.showNameRepeat = function (userName) {
      MultiDebug.Tool.showPrompt(userName + " 已被别人注册，请更换昵称", function (text) {
        socket.emit("onSaveUserInfo", {
          userName: text,
          userImg: null,
          logining: true
        })
      }, true);
    }
    /**获取服务器端数据
     * @param {string} key - 要获取的服务器的数据的键值,可以.连接，如a.b.c
     * @param {function} onsuccess - 获取成功后的回调函数 (info:服务器返回的数据)
     * */
    this.getServerData = function (key, onsuccess) {
      key = key + "";
      var eventName = "onGetServerData__" + key;
      socket.off(eventName)
      socket.on(eventName, function (data) {
        socket.off(eventName);
        typeof onsuccess == "function" && onsuccess(data);
      })
      socket.emit("onGetServerData", key);
    }
    /**设置服务器端数据
     * @param {string} key - 要设置的服务器的数据的键值,可以.连接，如a.b.c
     * @param {string} data - 要设置的服务器的数据的数据
     * @param {function} onsuccess - 获取成功后的回调函数 (ori:服务器本来的数据,overwrite:覆盖后的数据)
     * */
    this.setServerData = function (key, data, onsuccess) {
      key = key + "";
      var eventName = "onSetServerData__" + key;
      socket.off(eventName);
      socket.on(eventName, function (ori, overwrite) {
        socket.off(eventName);
        typeof onsuccess == "function" && onsuccess(ori, overwrite);
      })
      socket.emit("onSetServerData", key, data);
    }
    /**通知其他在线用户
     * @param {string} eventName - 通知的事件名字
     * @param {Object} data - 需要发送的数据
     * */
    this.broadcastOther = function (eventName, data) {
      socket.emit("onBroadcastOther", eventName, data);
    }
    /**通知其他人我已经登陆*/
    this.broadcastOtherMylogin = function () {
      var times = 0;

      function reminderOther() {
        var myName = MultiDebug.get("socketModule", "myName");
        var myImg = MultiDebug.get("socketModule", "myImg");
        if (myName) {
          module.broadcastOther("onOtherPeopleLogin", {
            name: myName,
            img: myImg
          })
        } else {
          if (times++ < 10) {
            window.setTimeout(arguments.callee, 500);
          }
        }
      }

      reminderOther();
    }
    /**获取公私图片库文件列表
     * @param {function} onsuccess 成功回调函数 (data:Object,data.publicTexture,data.publicSkybox,data.privateTexture,data.privateSkybox,data.appName)*/
    this.getPicFileList = function (onsuccess) {
      socket.emit("onGetPicFileList");
      socket.on("onGetPicFileList", function (data) {
        socket.off("onGetPicFileList");
        onsuccess && onsuccess(data);
      })
    }
    /**获取APP相对路径下的文件列表数组
     * @param {string} path - 相对APP项目的相对路径*/
    this.getAppFileList = function (path, onsuccess) {
      socket.emit("onGetAppFileList", path);
      socket.on("onGetAppFileList", function (data) {
        socket.off("onGetAppFileList");
        onsuccess && onsuccess(data);
      })
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

    //socket连接成功才显示页面
    function conntectSocket() {
      var times = 0;

      function wait() {
        if (!socket.connected) {
          if (times++ < 50) {
            console.log("正在连接socket:" + hostname + "...请耐心等待");
            window.setTimeout(wait, 100)
          } else {
            console.log("超过5秒未连接成功，已自动断开连接......")
            socket.disconnect();
            _this.hideModules();
          }
        }
      }

      wait();
    }

    conntectSocket();
  }
  /**关闭所有模块*/
  this.hideModules = function () {
    multiDebugDom.hide();
    //$(document.body).css("padding-top", "");
    //EXE("menuModule", "hide")
    //EXE("lanModule", "hide")
    //EXE("picModule", "hide")
    //EXE("chatModule", "hide")
  };
  /**开启所有模块*/
  this.showModules = function () {
    multiDebugDom.show();
    //$(document.body).css("padding-top", "24px");
  }

  function initModules() {
    _this.showModules();
    _this.menuModule = new _this.MenuModule();
    _this.lanModule = new _this.LanModule();
    _this.picModule = new _this.PicModule();
    _this.chatModule = new _this.ChatModule();
    _this.debugModule = new _this.DebugModule();
    _this.socketModule = new _this.SocketModule();
  }

  if (opt.onlyServer) {
    _this.socketModule = new _this.SocketModule();
    _this.debugModule = new _this.DebugModule();
  } else {
    initModules()
  }

}

/**执行UI模块方法,兼容错误处理
 * @param {string} module - 模块名字，"chatModule"||"MenuModule"||"lanModule"||"picModule"||"debugModule"||"socketModule"
 * @param {string} func - 要执行的模块的方法，如"openWindow"
 * @param {Object[]} argv1 - 传入模块方法的参数
 * @param {Object[]} argv2 - 传入模块方法的参数
 * @param {Object[]} argv.... - 传入模块方法的参数
 * */
MultiDebug.exe = function (module, func, argv1, argv2) {
  var modules = null;
  if (!(modules = MultiDebug.modules)) {
    console.warn("需要先实例化MultiDebug,才能调用模块");
    return;
  }
  if (modules[module] && modules[module][func] && modules[module][func].apply) {
    var arg = [];
    for (var i = 2; i <= arguments.length; i++) {
      arg.push(arguments[i])
    }
    return modules[module][func].apply(modules[module], arg);
  }
}
/**获取模块数据,兼容错误处理
 * @param {string} module - 模块名字，"chatModule"||"MenuModule"||"lanModule"||"picModule"||"debugModule"||"socketModule"
 * @param {string} pro - 要获取的模块的member
 * */
MultiDebug.get = function (module, pro) {
  var modules = null;
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
MultiDebug.set = function (module, pro, val) {
  var modules = null;
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
MultiDebug.exeI = function (module, func, argv1, argv2) {
  var _module, _func;
  if (MultiDebug.Interface.hasOwnProperty(module)) {
    if ((_module = MultiDebug.Interface[module]).hasOwnProperty(func)) {
      _func = _module[func];
      var arg = [];
      for (var i = 2; i < arguments.length; i++) {
        arg.push(arguments[i])
      }
      var returnValue = _func.apply && _func.apply(window, arg);
      var api = MultiDebug.exportAPI;
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
MultiDebug.exeA = function (module, func, argv1, argv2) {
  var _module, _func;
  if (MultiDebug.Application.hasOwnProperty(module)) {
    if ((_module = MultiDebug.Application[module]).hasOwnProperty(func)) {
      _func = _module[func];
      var arg = [];
      for (var i = 2; i < arguments.length; i++) {
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


/**事件接口
 * @namespace
 */
MultiDebug.Interface = {
  /** @namespace
   */
  menuModule: {
    /**调试模式触发的事件*/
    onDebugMode: function () {

    },
    /**浏览模式触发的事件*/
    onViewMode: function () {

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
        var userList = MultiDebug.get("socketModule", "userList");
        if (userList.some(function (user) {
          if (user.userName == userName) {
            MultiDebug.set("chatModule", "currentImg", user.userImg);
            return true;
          }
        })) {
          MultiDebug.set("chatModule", "currentImg", null);
        }
        //更新聊天窗口
        var buffer = MultiDebug.exe("chatModule", "getChatContentBuffer");
        var logContentBuffer = MultiDebug.exe("chatModule", "getLogContentBuffer");
        var logRoom = MultiDebug.get("chatModule", "logRoom");
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
      var name = data.name
      var img = data.img;
      MultiDebug.exe("chatModule", "getServerImg", img, function (base64) {
        var content = "尊敬的 " + name + " 上线了...";
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
        var content = userName + " 离开房间了...";
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
      var myName = MultiDebug.get("socketModule", "myName");
      var currentChannel = MultiDebug.get("chatModule", "currentChannel");
      var publicRoom = MultiDebug.get("chatModule", "publicRoom");
      //根据信息来源决定是否刷新聊天窗口
      if ((currentChannel == publicRoom && data.to == publicRoom) || (data.from == currentChannel && data.to == myName)) {
        MultiDebug.exe("chatModule", "appendChatBody", data);
      }
      //桌面提示
      var blur = MultiDebug.get("chatModule", "blur");
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
MultiDebug.Application = {
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
      var myName = MultiDebug.get("socketModule", "myName");
      var myIP = MultiDebug.get("socketModule", "myIP");

      function lock(noMessage) {
        var lanList = MultiDebug.get("lanModule", "lanList");
        lanList.children("li").each(function (i, dom) {
          var data = dom.data;
          var stat = data.stat;
          var name = data.name;
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
        var lanList = MultiDebug.get("lanModule", "lanList");
        lanList.children("li").each(function (i, dom) {
          var data = dom.data;
          var stat = data.stat;
          var name = data.name;
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
          var json = createJSON({console: false});
          MultiDebug.exe("socketModule", "saveAppFile", "version/" + new Date().getTime() + " " + data, json);
          MultiDebug.Tool.showMessage("保存版本" + data + "成功......");
          MultiDebug.exe("chatModule", "appendLogContentBuffer", "保存版本" + data + "成功......")
        });
      }

      function getVersion() {
        MultiDebug.exe("socketModule", "getAppFileList", "version", function (data) {
          var list = data.sort(function (a, b) {
            return parseInt(b) - parseInt(a)
          });
          var map = {};
          list = list.map(function (name) {
            var reg = name.match(/(.*\s)(.*)/g);
            var date = RegExp.$1;
            var versionName = RegExp.$2;
            var showName = versionName;
            for (var i = 0; i < 20 - versionName.length; i++) {
              showName += " - ";
            }
            showName += MultiDebug.Tool.getDayTime(date, true);
            map[showName] = name;
            return showName;
          })
          MultiDebug.Tool.showSelect("请选择你要回溯的版本", list, function (showName) {
            var fileName = map[showName];
            if (fileName) {
              var appName = MultiDebug.get("socketModule", "appName");
              //自动一键锁定
              lock(true);
              //版本回溯,无缓存
              $.get(APPFIX + appName + "/multidebug.bak/version/" + fileName, function (data) {
                initSceneByJSON(data);
                MultiDebug.Tool.showMessage("版本已经成功回溯到 " + showName);
                //MultiDebug.Tool.showMessage("请注意，服务器只保存您锁定的物体的数据!他人锁定的物体不会进行保存...", 2, "warn");
                MultiDebug.exe("chatModule", "appendLogContentBuffer", "版本已经成功回溯到 " + showName)
                //保存到服务器
                var lanList = MultiDebug.get("lanModule", "lanList");
                lanList.children("li").each(function (i, dom) {
                  var data = dom.data;
                  var stat = data.stat;
                  var mesh = data.mesh;
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
          var list = data.sort(function (a, b) {
            return parseInt(b) - parseInt(a)
          });
          var map = {};
          list = list.map(function (name) {
            var reg = name.match(/(.*\s)(.*)/g);
            var date = RegExp.$1;
            var versionName = RegExp.$2;
            var showName = versionName;
            for (var i = 0; i < 20 - versionName.length; i++) {
              //showName += "&nbsp;&nbsp;";
              showName += " - ";
            }
            showName += MultiDebug.Tool.getDayTime(date, true);
            map[showName] = name;
            return showName;
          })
          MultiDebug.Tool.showSelect("请选择你要删除的版本", list, function (showName) {
            var fileName = map[showName];
            if (fileName) {
              var appName = MultiDebug.get("socketModule", "appName");
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
      var myName = MultiDebug.get("socketModule", "myName");
      var myIP = MultiDebug.get("socketModule", "myIP");
      var data = li[0].data;

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
              var materiaTypeList = app.getMaterialTypeList();
              var myMaterialType = data.mesh.material.getClassName();
              var canToggleList = materiaTypeList.filter(function (kind) {
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
        var light = window.scene.getLightByName(data.lightName);
        if (light) {
          initSceneByJSON(data.json, null, light);
          app.refreshLightBall(light);
        }
      }

      function doMaterial() {
        var material = window.scene.getMaterialByID(data.materialId);
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
        var json = createJSON({meshes: mesh, console: false});
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
        var lightName = mesh.name;
        var json = createJSON({lights: mesh, console: false});
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
export {org, MultiDebug};
