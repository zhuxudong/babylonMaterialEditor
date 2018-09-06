/** @module*/

/**@namespace Tool*/
let Tool = {
  /**加载文件，返回base64
   * @param {file} file - input[type=file].files[0,1,2]
   * @param {function} onsuccess - (data::base64数据)
   */
  loadFile: function (file, onsuccess) {
    if (!file) {
      return;
    }
    let oFReader = new FileReader();
    oFReader.onload = function (oFREvent) {
      onsuccess(oFREvent.target.result);
      oFReader.onload = null;
    };
    let rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
    if (!rFilter.test(file.type)) {
      alert("You must select a valid image file!");
      return;
    }
    oFReader.readAsDataURL(file);
  },
  /**生成临时URL
   * @param {String|Object} obj -要转化成临时URL的对象*/
  createURL: function (obj) {
    try {
      let blob = new Blob([obj]);
      let url = URL.createObjectURL(blob);
      return url;
    } catch (e) {
      console.warn(e);
    }
  },
  /**弹出模态输入框
   * @param {string}text -文字
   * @param {function} callback - (text::输入框内的文字)
   * @param {boolean} noCancel - true:没有取消键，强制输入
   */
  showPrompt: function (text, callback, noCancel) {
    let parent = $(".babylon-material-editor");
    let $document = $(document);
    let cover = $("<div class='z-cover'>");
    let dialog = $(`<div class='z-prompt'><span class='text'>${text}</span><input> <div class='button-group'><button class='btn color-success'>确定</button><button  class='btn color-danger'>取消</button></div></div>`)
    $(".z-prompt").remove();
    $(".z-cover").remove();
    parent.append(cover);
    parent.append(dialog);
    if (noCancel) {
      $(".z-prompt .color-danger").remove();
    }
    let input = $(".z-prompt input");

    function clear() {
      $document.off("keydown", enter);
      $document.off("keydown", exit);
    }

    function enter(e) {
      if (e.key == "Enter" || e.keyCode == 13)
        success()
    }

    function exit(e) {
      if (e.key == "Escape" || e.keyCode == 27) {
        $(".z-prompt").remove();
        $(".z-cover").remove();
        clear();
      }
    }

    $document.on("keydown", enter)
    $document.on("keydown", exit)

    function success() {
      if (!input.val()) {
        input.addClass("alert");
        return;
      }
      callback && callback(input.val());
      $(".z-prompt").remove();
      $(".z-cover").remove();
      clear();
    }

    input.on("input", function (e) {
      let target = $(e.srcElement || e.target)
      if (!target.val()) {
        target.addClass("alert")
      } else {
        target.removeClass("alert")
      }
    })
    $(".z-prompt .color-success").click(function () {
      success();
    })
    $(".z-prompt .color-danger").click(function () {
      $(".z-prompt").remove();
      $(".z-cover").remove();
      clear();
    })
  },
  /**弹出双输入框
   * @param {string}text1 -文字
   * @param {string}text2 -文字
   * @param {function} callback - (text1,text2)
   * @param {boolean} noCancel - true:没有取消键，强制输入
   * @param {Array} disable1 - 禁止输入框1输入的内容
   * @param {Array} disable2 - 禁止输入框2输入的内容
   */
  showDoublePrompt: function (text1, text2, callback, onCancel, noCancel, disable1, disable2) {
    $(".z-prompt").remove();
    $(".z-cover").remove();
    let dialog = $("<div class='z-prompt'><span class='text'>" + text1 + "</span><input><span class='text'>" + text2 + "</span><input> <div class='button-group'><button class='btn color-success'>确定</button><button  class='btn color-danger'>取消</button></div></div>")
    $(".babylon-material-editor").append(dialog);
    if (noCancel) {
      $(".z-prompt .color-danger").remove();
    }
    let input = $(".z-prompt input");

    function success() {
      let fail = false;
      let text1, text2;
      input.each(function (i, dom) {
        if (i == 0) {
          if (disable1) {
            disable1 = [].concat.call(disable1);
            if (disable1.indexOf(dom.value) != -1) {
              $(dom).addClass("alert")
              fail = true;
              dom.value = "有重名的[" + dom.value + "]";
            }
          }
          text1 = dom.value;
        } else if (i == 1) {
          text2 = dom.value;
        }
        if (!dom.value) {
          $(dom).addClass("alert")
          fail = true;
        }
      })
      if (!fail) {
        callback && callback(text1, text2);
        $(".z-prompt").remove();
        $(".z-cover").remove();
      }
    }

    input.on("input", function (e) {
      let target = $(e.srcElement || e.target)
      if (!target.val()) {
        target.addClass("alert")
      } else {
        target.removeClass("alert")
      }
    })
    $(".z-prompt .color-success").click(function () {
      success();
    })
    $(".z-prompt .color-danger").click(function () {
      $(".z-prompt").remove();
      $(".z-cover").remove();
      onCancel && onCancel()
    })
  }
  ,
  /**弹出模态确认框
   * @param {string}text -文字
   * @param {function} callback - (text::输入框内的文字)
   */
  showConfirm: function (text, callback) {
    $(".z-prompt").remove();
    $(".z-cover").remove();
    let cover = $("<div class='z-cover'>");
    let dialog = $("<div class='z-prompt'><span class='text'>" + text + "</span><br><div class='button-group'><button class='btn color-success'>确定</button><button  class='btn color-danger'>取消</button></div></div>")
    $(".babylon-material-editor").append(cover);
    $(".babylon-material-editor").append(dialog);

    function clear() {
      $(document).off("keydown", enter);
      $(document).off("keydown", exit);
    }

    function success() {
      callback && callback();
      $(".z-prompt").remove();
      $(".z-cover").remove();
      clear();
    }

    $(".z-prompt .color-success").click(function () {
      success();
    })

    function enter(e) {
      if (e.key == "Enter" || e.keyCode == 13) {
        success()
      }
    }

    function exit(e) {
      if (e.key == "Escape" || e.keyCode == 27) {
        $(".z-prompt").remove();
        $(".z-cover").remove();
        clear();
      }
    }

    $(document).on("keydown", enter)
    $(document).on("keydown", exit)
    $(".z-prompt .color-danger").click(function () {
      $(".z-prompt").remove();
      $(".z-cover").remove();
      clear();
    })
  }
  ,
  /**弹出模态下拉框
   * @param {string}text -文字
   * @param {string[]}data -文字数组，用于下拉框
   * @param {showSelect~test} callback - (text::选中的下拉框内的文字,index::索引，0~)
   */
  showSelect: function (text, data, callback) {
    $(".z-cover").remove();
    $(".z-select").remove();
    let cover = $("<div class='z-cover'>");
    let dialog = $("<div class='z-select'><span class='text'>" + text + "</span><select></select> <div class='button-group'><button class='btn color-success'>确定</button><button  class='btn color-danger'>取消</button></div></div>")
    $(".babylon-material-editor").append(cover);
    $(".babylon-material-editor").append(dialog);
    [].slice.call(data).forEach(function (text) {
      $(".z-select select").append($("<option value='" + text + "'>" + text + "</option>"))
    })

    function clear() {
      $(document).off("keydown", enter);
      $(document).off("keydown", exit);
    }

    function success() {
      callback && callback($(".z-select select").val(), $(".z-select select")[0].selectedIndex);
      $(".z-cover").remove();
      $(".z-select").remove();
      clear()
    }

    $(".z-select .color-success").click(function () {
      success()
    })
    $(".z-select .color-danger").click(function () {
      $(".z-cover").remove();
      $(".z-select").remove();
      clear()
    })

    function enter(e) {
      if (e.key == "Enter" || e.keyCode == 13) {
        success()
      }
    }

    function exit(e) {
      if (e.key == "Escape" || e.keyCode == 27) {
        $(".z-cover").remove();
        $(".z-select").remove();
        clear()
      }
    }

    $(document).on("keydown", enter)
    $(document).on("keydown", exit)
  }
  ,
  /**弹出模态输入框和图片上传框
   * @param {string} text1 -prompt文字
   * @param {string} text2 - file文字
   * @param {function} callback - (text::输入框内的文字,file:input[type=file].files[0],base64:图片数据)
   * @param {boolean} noCancel - true:没有取消键，强制输入
   * @param {string} filePath - 如果设置可以初始化显示img
   * @param {boolean} canValid - 输入框可以为空
   */
  showPromptWithFile: function (text1, text2, callback, noCancel, filePath, canValid) {
    $(".z-prompt-file").remove();
    $(".z-cover").remove();
    let cover = $("<div class='z-cover'>");
    // let dialog = $("<div class='z-prompt-file'><span class='text'>" + text1 + "</span><input type='text'><span>" + text2 + "</span><div class='wrapper'><div class='iconfont upload'></div><input type='file'></div><div class='button-group'><button class='btn color-success'>确定</button><button  class='btn color-danger'>取消</button>")
    let dialog = $("<div class='z-prompt-file'><span>" + text2 + "</span><div class='wrapper'><div class='iconfont upload'></div><input type='file'></div><div class='button-group'><button class='btn color-success'>确定</button><button  class='btn color-danger'>取消</button>")
    $(".babylon-material-editor").append(cover);
    $(".babylon-material-editor").append(dialog);
    if (noCancel) {
      $(".z-prompt-file .color-danger").remove();
    }
    let inputs = $(".z-prompt-file input");
    let upload = $(".z-prompt-file .upload");
    let fileDom = $(".z-prompt-file input[type=file]");
    let base64 = null;
    if (filePath) {
      // $.get(filePath, function (data) {
      upload.css("background-image", "url(" + filePath + ")");
      upload.removeClass("iconfont");
      // })
    }
    inputs.on("input", function (e) {
      let target = $(e.srcElement || e.target)
      if (!target.val()) {
        target.addClass("alert")
      } else {
        target.removeClass("alert")
      }
    })

    fileDom.on("change", function () {
      let file = fileDom[0].files[0];
      console.log(file)
      Tool.loadFile(file, function (data) {
        upload.css("background-image", "url(" + data + ")");
        upload.removeClass("iconfont");
        base64 = data;
      });
    })

    $(".z-prompt-file .color-success").click(function () {
      let text = $(".z-prompt-file input[type=text]");
      if (!canValid && !text.val()) {
        text.addClass("alert");
        return;
      }
      callback && callback(text.val(), fileDom[0].files[0], base64);
      $(".z-prompt-file").remove();
      $(".z-cover").remove();
    })
    $(".z-prompt-file .color-danger").click(function () {
      $(".z-prompt-file").remove();
      $(".z-cover").remove();
    })
  }
  ,
  /**
   * 以队列形式弹出提示框，second秒后会消失,鼠标悬浮时候不会消失
   * @param {string} text - 提示的信息
   * @param {number} second - 几秒后消失,默认2s
   * @param {string} type - 内置类型,"success","warn","danger" 默认success
   * @param {string} bgColor - CSS格式的背景颜色,默认#5FB95F
   * @param {string} color - CSS格式的字体颜色，默认#fff
   */
  showMessage: function (text, second, type, bgColor, color, leftDif, topDif) {
    second = second || 2;
    color = color || "#fff";
    bgColor = bgColor || "#5FB95F";
    let dom = $("<div class='z-message'>" + text + "</div>");

    function checkOther() {
      if (leftDif || topDif) {
        return true;
      }
    }

    if (checkOther()) {
      dom.attr("other", "true");
    }
    let lastDom = $(".z-message:not([other])").last();
    let lastOtherDom = $(".z-message[other]").last();
    $(".babylon-material-editor").append(dom);

    if (checkOther()) {
      lastDom = lastOtherDom;
      if ($(".z-message[other]").length == 1) {
        dom.css("left", window.parseInt(dom.css("left")) + (leftDif || 0));
        dom.css("top", window.parseInt(dom.css("top")) + (topDif || 0));
      }
    }
    if (lastDom.length) {
      dom.css("left", window.parseInt(lastDom.css("left")) + 10 + "px");
      dom.css("top", window.parseInt(lastDom.css("top")) + 20 + "px");
    }

    if (type) {
      switch (type) {
        case "success": {
          dom.addClass("color-success");
        }
          break;
        case "warn": {
          dom.addClass("color-warn");
        }
          break;
        case "danger": {
          dom.addClass("color-danger");
        }
          break;
      }
    } else {
      dom.css("background", bgColor).css("color", color);
    }
    let timeout = null;
    timeout = window.setTimeout(function () {
      dom.fadeOut(1000, function () {
        dom.remove();
      });
    }, second * 1000)
    dom.on("mouseover", function () {
      dom.css("z-index", "1");
      window.clearTimeout(timeout);
    })
    dom.on("mouseout", function () {
      dom.css("z-index", "0");
      timeout = window.setTimeout(function () {
        dom.fadeOut(1000, function () {
          dom.remove();
        });
      }, second * 1000)
    })

  }
  ,
  /**根据time获取标准格式,如13:23 PM
   * @param {number}time  - new Date().getTime*(*/
  getDayTime: function (time, full) {
    time = time - 0;
    let date = new Date(time);
    let year = (date.getFullYear() + "").slice(2);
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let PM = hour < 12 ? "AM" : "PM";
    if (full) {
      return year + "-" + month + "-" + day + " " +
        hour + ":" + (minute < 10 ? "0" + minute : minute) + " " + PM
    } else {
      return month + "-" + day + " " +
        hour + ":" + (minute < 10 ? "0" + minute : minute) + " " + PM
    }

  }

}
export default Tool;