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
                _this.dom.attr("title", val);
                _this.dom.children("span").eq(0).html(val);
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
            this.dom.hide();
            return this;
        }
        this.show = function (value) {
            this.dom[0].dataset.hide = false;
            if (typeof value == "boolean") {
                this.value = String(value);
            } else {
                this.value = value;
            }
            this.dom.show();
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
        })
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

        span.on("click", onclick);
        if (canDrag) {
            var picData = null;
            //只要冒泡途径中有dom，都重点显示dom.
            this.dom.on("dragenter", function () {
                return false;
            }).on("dragover", function () {
                return false;
            }).on("drop", function (e) {
                _this.dom.animate({left: 0}, {
                    duration: 300,
                    easing: "easeInOutBack"
                })
                var data = e.originalEvent.dataTransfer;
                picData = data.getData("picData");
                if (picData) {
                    try {
                        picData = JSON.parse(data.getData("picData"))
                    } catch (e) {
                        console.warn(e)
                    }
                }
                typeof onDrop == "function" && onDrop(picData, _this);
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
    Message: function (title, value, parent, canDrag, onDrop, onclick, ondblclick) {
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
                var data = e.originalEvent.dataTransfer;
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
        var timeout = null;
        if (onclick) {
            this.dom.click(function () {
                window.clearTimeout(timeout);
                timeout = window.setTimeout(function () {
                    onclick(picData, _this);
                }, 300)
            })
        }
        if (ondblclick) {
            this.dom.on("dblclick", function () {
                window.clearTimeout(timeout);
                ondblclick(picData, _this);
            })
        }
    }
}
