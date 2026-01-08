import { WebSocketServer } from "ws";
import { User } from "./user.js";

const wss = new WebSocketServer({port : 8080})

wss.on('connection',function(ws){
    console.log("connecting start")
    let user = new User(ws);

    ws.on('error',console.error);
    
    // ws.on('close',()=>{
    //     user.destory();
    // })
})