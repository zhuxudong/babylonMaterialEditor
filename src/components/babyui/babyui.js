/** @module*/

import "./colorPicker/colorPicker";
import "./babyui.less";

let isInit = false;

function Base(title, parent) {
  if (!isInit) {
    initBox();
    isInit = true;
  }
  this.title = title;
  this.parent = parent;
  if (parent) {
    this.parent.dom.append(this.dom);
  } else {
    $(".baby-box").append(this.dom);
  }
  Object.defineProperty(this, "title", {
    set: (val) => {
      title = val;
      if (this.dom.hasClass("baby-folder")) {
        this.dom.find("span").eq(0).attr("title", val);
      } else {
        this.dom.attr("title", val);
      }
      //_this.dom.children("span").eq(0).html(val);
    },
    get: function () {
      return title;
    }
  })
  Object.defineProperty(this, "parent", {
    set: (val) => {
      if (val && val.dom) {
        parent = val;
        parent.dom.append(this.dom)
      } else {
        $(".baby-box").append(this.dom);
      }
    },
    get: function () {
      return parent;
    }
  })
  //重置拖拽条的位置和长度,因为增加或者减少了元素
  let box = $(".baby-box");
  let bar = $(".baby-dragbar");

  function locateBar() {
    bar.css("right", box.innerWidth() + parseInt(box.css("right")) - bar.width() / 2)
      .css("top", box.css("top"))
      .css("height", box.innerHeight());
  }

  locateBar();
  //hide时，就算folder进行close,open操作，都不会展示这个元素了;
  this.hide = function () {
    this.dom[0].dataset.hide = true;
    this.dom.hide();
    return this;
  }
  this.show = function (value) {
    this.dom[0].dataset.hide = false;
    if (typeof value === "boolean") {
      this.value = String(value);
    } else {
      this.value = value;
    }
    this.dom.show();
    return this;
  }
  //高亮
  this.alert = () => {
    if (BABYUI.alertDOM) {
      BABYUI.alertDOM.removeClass("alert");
    }
    if (this.dom.hasClass("baby-folder")) {
      BABYUI.alertDOM = this.dom.children().eq(0);
      BABYUI.alertDOM.addClass("alert");
    } else {
      this.dom.addClass("alert");
      BABYUI.alertDOM = this.dom;
    }
  }
  this.stopAlert = () => {
    if (this.dom.hasClass("baby-folder")) {
      this.dom.children().eq(0).removeClass("alert");
    } else {
      this.dom.removeClass("alert");
    }
  }
}

function initBox() {
  let box = $("<div class='baby-box'>")
  let bar = $("<div class='baby-dragbar'>");
  let px = null;
  let width = null;
  let canDrag = false;
  $("body").append(box).append(bar);
  setTimeout(() => {
    box.css("max-height", window.innerHeight - 200);
    locateBar();
  }, 0)

  //重新定位拖拽条的位置
  function locateBar() {
    bar.css("right", box.width() + parseInt(box.css("right")) - bar.width() / 2)
      .css("top", box.css("top"))
      .css("height", box.innerHeight());
  }

  //伸缩
  function mousemoveBar(e) {
    if (canDrag) {
      let dif = px - e.clientX;
      box.width(width + dif);
    }
  }

  function mouseupBar() {
    canDrag = false;
    $(document).off("mousemove", mousemoveBar);
    locateBar();
  }

  bar.on("mousedown", function (e) {
    canDrag = true;
    px = e.clientX;
    width = box.width();
    $(document).on("mousemove", mousemoveBar).one("mouseup", mouseupBar);
    return false;
  });


  //拖拽
  let boxCanDrag = false;
  let bp = {
    x: 0,
    y: 0,
    t: 0,
    r: 0
  }

  function boxMove(e) {
    if (boxCanDrag) {
      let difX = e.clientX - bp.x;
      let difY = e.clientY - bp.y;
      box.css("top", bp.t + difY);
      box.css("right", bp.r - difX);
    }
  }

  function boxUp() {
    boxCanDrag = false;
    let width = box.innerWidth();
    let right = parseInt(box.css("right"))
    let top = parseInt(box.css("top"))
    if (right < 0) {
      box.css("right", 0)
    } else if (right + width > window.innerWidth) {
      box.css("right", window.innerWidth - width)
    }
    if (top < 0) {
      box.css("top", 0)
    } else if (top > window.innerHeight - 26) {
      box.css("top", window.innerHeight - 26)
    }
    locateBar();
    $(document).off("mousemove", boxMove)

  }

  box.on("mousedown", function (e) {
    if (e.target == box.find(".baby-folder:first-child > span:first-child")[0]) {
      boxCanDrag = true;
      bp.x = e.clientX;
      bp.y = e.clientY;
      bp.t = window.parseInt(box.css("top"))
      bp.r = window.parseInt(box.css("right"))
      $(document).on("mousemove", boxMove).one("mouseup", boxUp)
    }
  })
}

/** @namespace BABYUI*/
let BABYUI = {
  /** 当有控件发生变化的时候将会触发这个回调*/
  onChange: function () {
  },
  /** 销毁控件及其所有事件*/
  destroy: function () {
    $(".baby-box").remove();
    $(".colorpicker").remove();
    $(".baby-dragbar").remove();
    isInit = false;
  },
  /**文件夹控件
   * @example let folder = new BABYUI.Folder("根文件夹")
   * let folder2 = new BABYUI.Folder("子文件夹",folder)
   * */
  Folder: function (title, parent, canDrag, onDrop) {
    this.dom = $("<div class='baby-folder '><span class='open' title=\"" + title + "\">" + title + "</span></div>");
    Base.call(this, title, parent);
    //默认开启
    let span = this.dom.children().eq(0);
    this.close = function () {
      let box = $(".baby-box")
      let bar = $(".baby-dragbar");
      let width = box.innerWidth();
      this.dom.children().not(span).stop().slideUp(200, function () {
        bar.css("height", box.innerHeight());
      });
      span.removeClass("open");
      span.addClass("close");
      box.innerWidth(width);
    }
    this.open = function () {
      let box = $(".baby-box")
      let bar = $(".baby-dragbar");
      //下拉显示非隐藏的元素，本来hide()的元素即使open()了也不会显示
      this.dom.children().not(span).filter("[data-hide!=true]").stop().slideDown(200, function () {
        bar.css("height", box.innerHeight());
      });
      span.removeClass("close");
      span.addClass("open");
    }
    //注册点击事件
    let x, y
    span.on("mousedown", (e) => {
      x = e.clientX;
      y = e.clientY;
    })
    span.on("mouseup", (e) => {
      if (e.clientX !== x || e.clientY !== y) {
        return;
      }
      if (span.hasClass("close")) {
        this.open();
      } else if (span.hasClass("open")) {
        this.close();
      }
    })
    if (canDrag) {
      let picData = null;
      //只要冒泡途径中有dom，都重点显示dom.
      this.dom.on("dragenter", function () {
        return false;
      }).on("dragover", function () {
        return false;
      }).on("drop", (e) => {
        this.dom.animate({left: 0}, {
          duration: 300,
          // easing: "easeInOutBack"
        })
        let data = e.originalEvent.dataTransfer;
        picData = data.getData("picData");
        if (picData) {
          try {
            picData = JSON.parse(data.getData("picData"))
          } catch (e) {
            console.warn(e)
          }
        }
        typeof onDrop == "function" && onDrop(picData, this);
      })
    }
  },
  Color: function (title, value, onChange, parent) {
    let strVar = "";
    strVar += " <div class=\"baby-color\" title=\"" + title + "\">\n";
    strVar += "<span>" + title + "<\/span>\n";
    strVar += "<span class=\"baby-color-box\"> <\/span>\n";
    strVar += "        <\/div>\n";
    this.dom = $(strVar);
    Base.call(this, title, parent);
    this.value = value;
    this.onChange = onChange;
    let colorBox = this.dom.find("span.baby-color-box");

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
    this.min = min;
    this.max = max;
    this.step = step;
    value = (value == undefined) ? 0 : value;
    this.value = value;
    this.onChange = onChange;

    let strVar = "";
    strVar += " <div class=\"baby-slider\" title=\"" + title + "\">\n";
    strVar += "            <span \">" + title + "<\/span>\n";
    strVar += "            <input type=\"range\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\"  value=\"" + value + "\" class=\"range\" />\n";
    strVar += "            <input type=\"number\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\"  value=\"" + value + "\" class=\"number\"/>\n";
    strVar += "        <\/div>";
    this.dom = $(strVar);

    Base.call(this, title, parent)

    let sliderRange = this.dom.children().eq(1);
    let sliderNumber = this.dom.children().eq(2);


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

    sliderRange.add(sliderNumber).on("input", (e) => {
      let $dom = $(e.srcElement || e.target);
      this.value = $dom.val();
      onChange && onChange(Number(value))
    }).on("change", function () {
      if (BABYUI.onChange) {
        BABYUI.onChange();
      }
    })

  },
  Select: function (title, value, values, onChange, parent) {
    this.values = values;
    this.value = value;
    this.onChange = onChange;
    let strVar = "";
    strVar += "<div class=\"baby-select\" title=\"" + title + "\">\n";
    strVar += "            <span>" + title + "<\/span>\n";
    strVar += "            <select></select></div>";

    this.dom = $(strVar);
    Base.call(this, title, parent)

    let select = this.dom.children().eq(1);

    for (let i = 0; i < values.length; i++) {
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
    let _this = this;
    let strVar = "";
    strVar += " <div class=\"baby-message\" title=\"" + title + "\">\n";
    strVar += "<span>" + title + "<\/span>\n";
    strVar += "<span class=\"baby-message-box\">" + value + "<\/span>\n";
    strVar += "        <\/div>\n";
    this.dom = $(strVar);
    Base.call(this, title, parent);
    this.value = value;
    let messageBox = this.dom.find("span.baby-message-box");
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
    let picData = null;
    if (canDrag) {
      this.dom.on("dragenter", function () {
        return false;
      }).on("dragover", function () {
        return false;
      }).on("drop", function (e) {
        let data = e.originalEvent.dataTransfer;
        picData = data.getData("picData");
        if (picData) {
          try {
            picData = JSON.parse(data.getData("picData"))
          } catch (e) {
            console.warn(e)
          }
        }
        typeof onDrop == "function" && onDrop(picData, _this)
      })
    }
    let timeout1 = null;
    let timeout2 = null;
    let timeout3 = null;
    let gap = 300;//300ms;
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
};

function demo() {
  let folder = new BABYUI.Folder("123");
  new BABYUI.Color("颜色", "#123", function (value) {
  }, folder)
  new BABYUI.Slider("滑动条", 10, 1, 100, 1, () => {
  }, folder)
  new BABYUI.Select("选择", 1, [1, 2], null, folder)
  new BABYUI.Message("message", 123, folder)
}

export default BABYUI;