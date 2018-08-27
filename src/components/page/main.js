import page from "./main.html";
import "./css/less/main.less"

//easeOutQuad
function expandJquery() {
  jQuery.easing['jswing'] = jQuery.easing['swing'];
  jQuery.extend(jQuery.easing,
    {
      def: 'easeOutQuad',
      easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
      }
    });
}

expandJquery();
//添加页面
$("<div class='babylon-material-editor'>").appendTo($(document.body)).html(page);
//阻止右键的默认事件
window.oncontextmenu = function () {
  return false;
}
