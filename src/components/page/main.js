import page from "./main.html";
import "./css/less/main.less"

export default () => {
  $("<div class='babylon-material-editor'>").appendTo($(document.body)).html(page);
}
