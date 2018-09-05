import "./colorPicker.less";

(function ($) {
  let ColorPicker = function () {
    let
      ids = {},
      inAction,
      charMin = 65,
      visible,
      tpl = '<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>',
      defaults = {
        eventName: 'click',
        onShow: function () {
        },
        onBeforeShow: function () {
        },
        onHide: function () {
        },
        onChange: function () {
        },
        onSetNewColor: function () {
        },
        onSubmit: function () {
        },
        color: 'ff0000',
        livePreview: true,
        flat: false
      },
      fillRGBFields = function (hsb, cal) {
        let rgb = HSBToRGB(hsb);
        $(cal).data('colorpicker').fields
          .eq(1).val(rgb.r).end()
          .eq(2).val(rgb.g).end()
          .eq(3).val(rgb.b).end();
      },
      fillHSBFields = function (hsb, cal) {
        $(cal).data('colorpicker').fields
          .eq(4).val(hsb.h).end()
          .eq(5).val(hsb.s).end()
          .eq(6).val(hsb.b).end();
      },
      fillHexFields = function (hsb, cal) {
        $(cal).data('colorpicker').fields
          .eq(0).val(HSBToHex(hsb)).end();
      },
      setSelector = function (hsb, cal) {
        $(cal).data('colorpicker').selector.css('backgroundColor', '#' + HSBToHex({h: hsb.h, s: 100, b: 100}));
        $(cal).data('colorpicker').selectorIndic.css({
          left: parseInt(150 * hsb.s / 100, 10),
          top: parseInt(150 * (100 - hsb.b) / 100, 10)
        });
      },
      setHue = function (hsb, cal) {
        $(cal).data('colorpicker').hue.css('top', parseInt(150 - 150 * hsb.h / 360, 10));
      },
      setCurrentColor = function (hsb, cal) {
        $(cal).data('colorpicker').currentColor.css('backgroundColor', '#' + HSBToHex(hsb));
      },
      setNewColor = function (hsb, cal) {
        $(cal).data('colorpicker').newColor.css('backgroundColor', '#' + HSBToHex(hsb));
        $(cal).data('colorpicker').onSetNewColor.apply(hsb, [hsb, HSBToHex(hsb), HSBToRGB(hsb)]);
      },
      keyDown = function (ev) {
        let pressedKey = ev.charCode || ev.keyCode || -1;
        if ((pressedKey > charMin && pressedKey <= 90) || pressedKey == 32) {
          return false;
        }
        let cal = $(this).parent().parent();
        if (cal.data('colorpicker').livePreview === true) {
          change.apply(this);
        }
      },
      change = function (ev) {
        let cal = $(this).parent().parent(), col;
        if (this.parentNode.className.indexOf('_hex') > 0) {
          cal.data('colorpicker').color = col = HexToHSB(fixHex(this.value));
        } else if (this.parentNode.className.indexOf('_hsb') > 0) {
          cal.data('colorpicker').color = col = fixHSB({
            h: parseInt(cal.data('colorpicker').fields.eq(4).val(), 10),
            s: parseInt(cal.data('colorpicker').fields.eq(5).val(), 10),
            b: parseInt(cal.data('colorpicker').fields.eq(6).val(), 10)
          });
        } else {
          cal.data('colorpicker').color = col = RGBToHSB(fixRGB({
            r: parseInt(cal.data('colorpicker').fields.eq(1).val(), 10),
            g: parseInt(cal.data('colorpicker').fields.eq(2).val(), 10),
            b: parseInt(cal.data('colorpicker').fields.eq(3).val(), 10)
          }));
        }
        if (ev) {
          fillRGBFields(col, cal.get(0));
          fillHexFields(col, cal.get(0));
          fillHSBFields(col, cal.get(0));
        }
        setSelector(col, cal.get(0));
        setHue(col, cal.get(0));
        setNewColor(col, cal.get(0));
        cal.data('colorpicker').onChange.apply(cal, [col, HSBToHex(col), HSBToRGB(col)]);
      },
      blur = function (ev) {
        let cal = $(this).parent().parent();
        cal.data('colorpicker').fields.parent().removeClass('colorpicker_focus');
      },
      focus = function () {
        charMin = this.parentNode.className.indexOf('_hex') > 0 ? 70 : 65;
        $(this).parent().parent().data('colorpicker').fields.parent().removeClass('colorpicker_focus');
        $(this).parent().addClass('colorpicker_focus');
      },
      downIncrement = function (ev) {
        let field = $(this).parent().find('input').focus();
        let current = {
          el: $(this).parent().addClass('colorpicker_slider'),
          max: this.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (this.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
          y: ev.pageY,
          field: field,
          val: parseInt(field.val(), 10),
          preview: $(this).parent().parent().data('colorpicker').livePreview
        };
        $(document).on('mouseup', current, upIncrement);
        $(document).on('mousemove', current, moveIncrement);
      },
      moveIncrement = function (ev) {
        ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
        if (ev.data.preview) {
          change.apply(ev.data.field.get(0), [true]);
        }
        return false;
      },
      upIncrement = function (ev) {
        change.apply(ev.data.field.get(0), [true]);
        ev.data.el.removeClass('colorpicker_slider').find('input').focus();
        $(document).off('mouseup', upIncrement);
        $(document).off('mousemove', moveIncrement);
        return false;
      },
      downHue = function (ev) {
        let current = {
          cal: $(this).parent(),
          y: $(this).offset().top
        };
        current.preview = current.cal.data('colorpicker').livePreview;
        $(document).on('mouseup', current, upHue);
        $(document).on('mousemove', current, moveHue);
      },
      moveHue = function (ev) {
        change.apply(
          ev.data.cal.data('colorpicker')
            .fields
            .eq(4)
            .val(parseInt(360 * (150 - Math.max(0, Math.min(150, (ev.pageY - ev.data.y)))) / 150, 10))
            .get(0),
          [ev.data.preview]
        );
        return false;
      },
      upHue = function (ev) {
        fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
        fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
        $(document).off('mouseup', upHue);
        $(document).off('mousemove', moveHue);
        return false;
      },
      downSelector = function (ev) {
        let current = {
          cal: $(this).parent(),
          pos: $(this).offset()
        };
        current.preview = current.cal.data('colorpicker').livePreview;
        $(document).on('mouseup', current, upSelector);
        $(document).on('mousemove', current, moveSelector);
      },
      moveSelector = function (ev) {
        change.apply(
          ev.data.cal.data('colorpicker') && ev.data.cal.data('colorpicker')
            .fields
            .eq(6)
            .val(parseInt(100 * (150 - Math.max(0, Math.min(150, (ev.pageY - ev.data.pos.top)))) / 150, 10))
            .end()
            .eq(5)
            .val(parseInt(100 * (Math.max(0, Math.min(150, (ev.pageX - ev.data.pos.left)))) / 150, 10))
            .get(0),
          [ev.data.preview]
        );
        return false;
      },
      upSelector = function (ev) {
        fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
        fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
        $(document).off('mouseup', upSelector);
        $(document).off('mousemove', moveSelector);
        return false;
      },
      enterSubmit = function (ev) {
        $(this).addClass('colorpicker_focus');
      },
      leaveSubmit = function (ev) {
        $(this).removeClass('colorpicker_focus');
      },
      clickSubmit = function (ev) {
        let cal = $(this).parent();
        let col = cal.data('colorpicker').color;
        cal.data('colorpicker').origColor = col;
        setCurrentColor(col, cal.get(0));
        cal.data('colorpicker').onSubmit(col, HSBToHex(col), HSBToRGB(col), cal.data('colorpicker').el);
      },
      show = function (ev) {
        let cal = $('#' + $(this).data('colorpickerId'));
        cal.data('colorpicker').onBeforeShow.apply(this, [cal.get(0)]);
        let pos = $(this).offset();
        let viewPort = getViewport();
        let top = pos.top + this.offsetHeight;
        let left = pos.left;
        if (top + 176 > viewPort.t + viewPort.h) {
          top -= this.offsetHeight + 176;
        }
        // if (left + 356 > viewPort.l + viewPort.w) {
        left -= 356;
        // }
        cal.css({left: left + 'px', top: top + 'px'});
        if (cal.data('colorpicker').onShow.apply(this, [cal.get(0)]) != false) {
          cal.show();
        }
        setTimeout(function () {
          $(document).on('click', {cal: cal}, hide);
        }, 0)
        return true;
      },
      hide = function (ev) {
        if (!isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
          if (ev.data.cal.data('colorpicker') && ev.data.cal.data('colorpicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
            ev.data.cal.hide();
          }
          $(document).off('click', hide);
        }
      },
      isChildOf = function (parentEl, el, container) {
        if (parentEl == el) {
          return true;
        }
        if (parentEl.contains) {
          return parentEl.contains(el);
        }
        if (parentEl.compareDocumentPosition) {
          return !!(parentEl.compareDocumentPosition(el) & 16);
        }
        let prEl = el.parentNode;
        while (prEl && prEl != container) {
          if (prEl == parentEl)
            return true;
          prEl = prEl.parentNode;
        }
        return false;
      },
      getViewport = function () {
        let m = document.compatMode == 'CSS1Compat';
        return {
          l: window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
          t: window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
          w: window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
          h: window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
        };
      },
      fixHSB = function (hsb) {
        return {
          h: Math.min(360, Math.max(0, hsb.h)),
          s: Math.min(100, Math.max(0, hsb.s)),
          b: Math.min(100, Math.max(0, hsb.b))
        };
      },
      fixRGB = function (rgb) {
        return {
          r: Math.min(255, Math.max(0, rgb.r)),
          g: Math.min(255, Math.max(0, rgb.g)),
          b: Math.min(255, Math.max(0, rgb.b))
        };
      },
      fixHex = function (hex) {
        let len = 6 - hex.length;
        if (len > 0) {
          let o = [];
          for (let i = 0; i < len; i++) {
            o.push('0');
          }
          o.push(hex);
          hex = o.join('');
        }
        return hex;
      },
      HexToRGB = function (hex) {
        hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
        return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
      },
      HexToHSB = function (hex) {
        return RGBToHSB(HexToRGB(hex));
      },
      RGBToHSB = function (rgb) {
        let hsb = {
          h: 0,
          s: 0,
          b: 0
        };
        let min = Math.min(rgb.r, rgb.g, rgb.b);
        let max = Math.max(rgb.r, rgb.g, rgb.b);
        let delta = max - min;
        hsb.b = max;
        if (max != 0) {

        }
        hsb.s = max != 0 ? 255 * delta / max : 0;
        if (hsb.s != 0) {
          if (rgb.r == max) {
            hsb.h = (rgb.g - rgb.b) / delta;
          } else if (rgb.g == max) {
            hsb.h = 2 + (rgb.b - rgb.r) / delta;
          } else {
            hsb.h = 4 + (rgb.r - rgb.g) / delta;
          }
        } else {
          hsb.h = -1;
        }
        hsb.h *= 60;
        if (hsb.h < 0) {
          hsb.h += 360;
        }
        hsb.s *= 100 / 255;
        hsb.b *= 100 / 255;
        hsb.h = hsb.h.toFixed(0)
        hsb.s = hsb.s.toFixed(0)
        hsb.b = hsb.b.toFixed(0)
        return hsb;
      },
      HSBToRGB = function (hsb) {
        let rgb = {};
        let h = Math.round(hsb.h);
        let s = Math.round(hsb.s * 255 / 100);
        let v = Math.round(hsb.b * 255 / 100);
        if (s == 0) {
          rgb.r = rgb.g = rgb.b = v;
        } else {
          let t1 = v;
          let t2 = (255 - s) * v / 255;
          let t3 = (t1 - t2) * (h % 60) / 60;
          if (h == 360) h = 0;
          if (h < 60) {
            rgb.r = t1;
            rgb.b = t2;
            rgb.g = t2 + t3
          }
          else if (h < 120) {
            rgb.g = t1;
            rgb.b = t2;
            rgb.r = t1 - t3
          }
          else if (h < 180) {
            rgb.g = t1;
            rgb.r = t2;
            rgb.b = t2 + t3
          }
          else if (h < 240) {
            rgb.b = t1;
            rgb.r = t2;
            rgb.g = t1 - t3
          }
          else if (h < 300) {
            rgb.b = t1;
            rgb.g = t2;
            rgb.r = t2 + t3
          }
          else if (h < 360) {
            rgb.r = t1;
            rgb.g = t2;
            rgb.b = t1 - t3
          }
          else {
            rgb.r = 0;
            rgb.g = 0;
            rgb.b = 0
          }
        }
        return {r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b)};
      },
      RGBToHex = function (rgb) {
        let hex = [
          rgb.r.toString(16),
          rgb.g.toString(16),
          rgb.b.toString(16)
        ];
        $.each(hex, function (nr, val) {
          if (val.length == 1) {
            hex[nr] = '0' + val;
          }
        });
        return hex.join('');
      },
      HSBToHex = function (hsb) {
        return RGBToHex(HSBToRGB(hsb));
      },
      restoreOriginal = function () {
        let cal = $(this).parent();
        let col = cal.data('colorpicker').origColor;
        cal.data('colorpicker').color = col;
        fillRGBFields(col, cal.get(0));
        fillHexFields(col, cal.get(0));
        fillHSBFields(col, cal.get(0));
        setSelector(col, cal.get(0));
        setHue(col, cal.get(0));
        setNewColor(col, cal.get(0));
      };
    return {
      init: function (opt) {
        opt = $.extend({}, defaults, opt || {});
        if (typeof opt.color == 'string') {
          opt.color = HexToHSB(opt.color);
        } else if (opt.color.r != undefined && opt.color.g != undefined && opt.color.b != undefined) {
          opt.color = RGBToHSB(opt.color);
        } else if (opt.color.h != undefined && opt.color.s != undefined && opt.color.b != undefined) {
          opt.color = fixHSB(opt.color);
        } else {
          return this;
        }
        return this.each(function () {
          if (!$(this).data('colorpickerId')) {
            let options = $.extend({}, opt);
            options.origColor = opt.color;
            let id = 'collorpicker_' + parseInt(Math.random() * 1000);
            $(this).data('colorpickerId', id);
            let cal = $(tpl).attr('id', id);
            if (options.flat) {
              cal.appendTo(this).show();
            } else {
              cal.appendTo(document.body);
            }

            options.fields = cal
              .find('input')
              .on('keyup', keyDown)
              .on('change', change)
              .on('blur', blur)
              .on('focus', focus);
            cal
              .find('span').on('mousedown', downIncrement).end()
              .find('>div.colorpicker_current_color').on('click', restoreOriginal);
            options.selector = cal.find('div.colorpicker_color').on('mousedown', downSelector);
            options.selectorIndic = options.selector.find('div div');
            options.el = this;
            options.hue = cal.find('div.colorpicker_hue div');
            cal.find('div.colorpicker_hue').on('mousedown', downHue);
            options.newColor = cal.find('div.colorpicker_new_color');
            options.currentColor = cal.find('div.colorpicker_current_color');
            cal.data('colorpicker', options);
            cal.find('div.colorpicker_submit')
              .on('mouseenter', enterSubmit)
              .on('mouseleave', leaveSubmit)
              .on('click', clickSubmit);
            fillRGBFields(options.color, cal.get(0));
            fillHSBFields(options.color, cal.get(0));
            fillHexFields(options.color, cal.get(0));
            setHue(options.color, cal.get(0));
            setSelector(options.color, cal.get(0));
            setCurrentColor(options.color, cal.get(0));
            // setNewColor(options.color, cal.get(0));
            if (options.flat) {
              cal.css({
                position: 'relative',
                display: 'block'
              });
            } else {
              $(this).on(options.eventName, show);
            }
          }
        });
      },
      showPicker: function () {
        return this.each(function () {
          if ($(this).data('colorpickerId')) {
            show.apply(this);
          }
        });
      },
      hidePicker: function () {
        return this.each(function () {
          if ($(this).data('colorpickerId')) {
            $('#' + $(this).data('colorpickerId')).hide();
          }
        });
      },
      setColor: function (col) {
        if (typeof col == 'string') {
          col = HexToHSB(col);
        } else if (col.r != undefined && col.g != undefined && col.b != undefined) {
          col = RGBToHSB(col);
        } else if (col.h != undefined && col.s != undefined && col.b != undefined) {
          col = fixHSB(col);
        } else {
          return this;
        }
        return this.each(function () {
          if ($(this).data('colorpickerId')) {
            let cal = $('#' + $(this).data('colorpickerId'));
            cal.data('colorpicker').color = col;
            cal.data('colorpicker').origColor = col;
            fillRGBFields(col, cal.get(0));
            fillHSBFields(col, cal.get(0));
            fillHexFields(col, cal.get(0));
            setHue(col, cal.get(0));
            setSelector(col, cal.get(0));
            setCurrentColor(col, cal.get(0));
            setNewColor(col, cal.get(0));
          }
        });
      }
    };
  }();
  $.fn.extend({
    ColorPicker: ColorPicker.init,
    ColorPickerHide: ColorPicker.hidePicker,
    ColorPickerShow: ColorPicker.showPicker,
    ColorPickerSetColor: ColorPicker.setColor
  });
})(jQuery)
