let io = require('socket.io-client');
import "babylonjs"
declare let window:any

let socket = io('ws://localhost:2049/socket.io');
console.log(socket)
// socket.emit("test", "test")
window.socket=socket
window.io=io