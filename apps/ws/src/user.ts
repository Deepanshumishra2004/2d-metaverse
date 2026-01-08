import WebSocket from "ws";
import {roomManager} from "./roomManager.js";
import type { OutgoingMessage } from "./types.js";
import prisma from "@repo/db/client";
import Jwt from "jsonwebtoken"
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';

function getRandomString(length : number){
    const characters = "SBADJBASDUVAKDBAJSDB821H39012GEDWSKNBDJhjvidwufeuiguebqjwekoui1v2g819";
    let result = '';
    for (let i =0 ; i<length ; i++){
        result += characters.charAt(Math.floor(Math.random()*characters.length)) 
    }
    return result;
}

export const JWT_SECRET = "deepv1";

function userMiddleware(token : string){
    const decoded = Jwt.verify(token,JWT_SECRET) as {userId : string};
    if(decoded && decoded.userId){
        return decoded.userId;
    }
}

type UserSeatType = { userId :string, x : number, y : number }

type  Location = {
    elementId : string,
    type : 'p2p'|'group',
    locations : {
        x : number,
        y : number,
        width : number,
        height : number,
        seatCount : number,
        seatUsers : UserSeatType[]
    }
}


const areaMap = new Map<string, Location>();

export class User {

    public id : string;
    public userId? : string;
    private spaceId? : string;
    private spaceWidth : number;
    private spaceHeight : number;
    public x : number;
    public y : number;
    public prevX : number;
    public prevY : number;
    public avatarUrl : string;
    public currentLocation : { x : number, y : number} | null = null;
    public isCall : boolean;

    constructor (private ws : WebSocket){
        this.id =  getRandomString(10);
        this.x = 0;
        this.y = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.spaceWidth=0;
        this.spaceHeight=0;
        this.ws = ws;
        this.initHandler();
        this.avatarUrl = "";
        this.currentLocation = { x : this.x , y : this.y}
        this.isCall = false;
    }

    initHandler(){
        this.ws.on('message', async(data)=>{
            console.log("------------------- 1");
            const parsedData = JSON.parse(data.toString())
            console.log(parsedData);
            console.log("------------------- 2");
            const scale = 50;
            switch (parsedData.type){
                case "join":
                    console.log("------------------- 1");
                    const spaceId = parsedData.payload.spaceId;
                    this.spaceId = spaceId;
                    const token = parsedData.payload.token;
                    const userId = userMiddleware(token);
                    console.log("userId : ",userId);
                    if(!userId){
                        this.ws.close();
                        return;
                    }
                    this.userId = userId;
                    const space = await prisma.space.findFirst({
                        where : {
                            id : spaceId
                        },
                        include : {
                            elements : {
                                include : {
                                    element : true
                                }
                            },
                            activeAreas : true
                        }
                    })

                    const activeElementIds : string[] = space?.activeAreas.map((e : any)=>e.elementId)!;

                    const activeAreas = space?.elements.filter((e : any)=>activeElementIds.includes(e.elementId))


                    for(const e of activeAreas || []){
                        const type = e.element.width === 2 && e.element.height === 1 ? 'p2p' : 'group';
                        const seatCount = type === 'p2p' ? 2 : 9;

                        const key = `${e.x},${e.y}`;

                        areaMap.set(key ,{
                            elementId : e.elementId,
                            type : type,
                            locations : {
                                x : e.x,
                                y : e.y,
                                width : e.element.width,
                                height : e.element.height,
                                seatCount,
                                seatUsers : []
                            }
                        })
                        
                    }

                    let room = roomManager.getInterface().rooms.get(spaceId);
                    console.log("rooms ; ",room)
                    if (!space) return;

                    const rangeWidth = Math.round(space.width / scale);
                    const rangeHeight = Math.round(space.height / scale);

                    const mapMatrix = Array.from({length : rangeHeight}).fill(0).map(()=>Array(rangeWidth).fill(0))
                    // console.log("mapmartixdsaldnlnasldlasnldnlasnldnlj : ", mapMatrix)

                    // mark elements as occupied
                    space.elements.forEach((el : any) => {
                            const width = Number(el.element.width);
                            const height = Number(el.element.height);
                            const x = Number(el.x);
                            const y = Number(el.y);

                        for (let dx = 0; dx < width; dx++) {
                            for (let dy = 0; dy < height; dy++) {
                                const ry = y + dy;
                                const cx = x + dx;

                                if (mapMatrix[ry]![cx] !== undefined) {
                                    mapMatrix[ry]![cx] += 1;
                                } else {
                                    console.warn(`Out of bounds -> cx: ${cx}, ry: ${ry}`);
                                }
                            }
                        }                          
                    });

                    if (!room) {
                        roomManager.getInterface().addUser(spaceId, this);
                        room = roomManager.getInterface().rooms.get(spaceId)!;
                    } else {
                        roomManager.getInterface().addUser(spaceId, this);
                    }
                        
                    function getWalkingTile(mapMatrix : number[][]){
                        const walkableTitle : {x : number ; y : number}[]= [];
                        const mapHeight = mapMatrix.length;
                        const mapWeight = mapMatrix[0]?.length;

                        for(let dx = 0 ; dx < mapHeight ; dx++){
                            for(let dy=0 ; dy < mapWeight! ; dy++){
                                
                                const isActive = activeAreas?.some(e=>e.x === dx && e.y === dy)
                                if(isActive) continue;

                                if(mapMatrix[dy]![dx] === 1){
                                    walkableTitle.push({x : dx , y : dy})
                                }
                            }
                        }
                        return walkableTitle;
                    }

                    const spawnTile = getWalkingTile(mapMatrix);
                    if (!spawnTile) {
                        console.error("No free tile available!");
                        this.ws.close();
                        return;
                    }
                    
                    // mapMatrix[spawnTile.y][spawnTile.x] = 1;

                    let userRandomLocation : {x : number ; y : number} | undefined = spawnTile[Math.floor(Math.random()* spawnTile.length)]
                    
                    this.x = userRandomLocation?.x!;
                    this.y = userRandomLocation?.y!;

                    if(!space){
                        this.ws.close()
                        return;
                    }

                    this.spaceWidth = space.width;
                    this.spaceHeight = space.height;
                    const avatar = await prisma.user.findFirst({
                        where : {
                            id : this.userId
                        },
                        include : {
                            avatar : true
                        }
                    })

                    this.avatarUrl = avatar?.avatar?.imageUrl!;
                    console.log("x : ",this.x);
                    console.log("y : ",this.y);
                    console.log("total users : ",roomManager.getInterface().rooms.get(spaceId))
                    this.send({
                        type : 'space-joined',
                        payload : {
                            userId : this.userId,
                            spawn : {
                                x : this.x,
                                y : this.y,
                                avatarUrl : avatar?.avatar?.imageUrl
                            },
                        },
                        users: roomManager.getInterface()?.rooms.get(spaceId)?.filter(x => x.id !== this.id).map((u) => ({userId : u.userId, x : u.x , y : u.y, avatarUrl : u.avatarUrl})),
                        space : {
                            width : space.width,
                            height : space.height
                        }
                    })
                    console.log("users  others321312312 : ",roomManager.getInterface()?.rooms.get(spaceId)?.map((u) => ({userId : u.userId, x : u.x , y : u.y})))
                    console.log("sending of user joins")
                    roomManager.getInterface()?.broadcast({
                        type : "user-joined",
                        payload : {
                            userId : this.userId,
                            x : this.x,
                            y : this.y,
                            avatarUrl : avatar?.avatar?.imageUrl
                        }
                    },this, this.spaceId!)
                    break;
            
                case "move":
                    const moveX =Number(parsedData.payload.x);
                    const moveY = Number(parsedData.payload.y);

                    if(this.isCall === false){
                        console.log("___________________________1")
                        const xDisplacement = Math.abs(this.x - moveX);
                        const yDisplacement = Math.abs(this.y - moveY);
    
                        if(((xDisplacement == 1 && yDisplacement == 0) || (xDisplacement == 0 && yDisplacement == 1)) && 
                        moveX < this.spaceWidth &&  moveY < this.spaceHeight-2 && moveX > 0 && moveY > 0 ){
    
                            this.prevX = this.x;
                            this.prevY = this.y;
    
                            console.log("move start")
                            this.x = moveX;
                            this.y = moveY;
    
                            const point = `${moveX},${moveY}`;
                            console.log("area : ",areaMap);
                            const entryInfo = areaMap.get(point);
                            console.log('entryInfo : ',entryInfo);
                            if(!entryInfo){
                                this.boardCast(this.userId!, this.x, this.y, this.spaceId!);
                                return;
                            }
                            
                            const joined =await this.handleMove(this.userId!, this.x , this.y);
                            console.log("joined : ",joined);
                            if(joined){
                                this.boardCast(this.userId!, this.x, this.y , this.spaceId!);
                                this.isCall = true;
                            }else{
                                this.x = this.prevX;
                                this.y = this.prevY;
    
                                this.send({
                                type : 'movement-Rejected',
                                    payload : {
                                        x : this.x,
                                        y : this.y
                                }})
                            }
                        }
                        else{
                            this.send({
                                type : 'movement-Rejected',
                                    payload : {
                                        x : this.x,
                                        y : this.y
                                    },
                            })
                        }
                    }
                    break;

                case "leave-call":
                    const key = parsedData.payload.key;
                    
                    const area = areaMap.get(key);
                    console.log("area : ",area);
                    if(area){
                        area.locations.seatUsers = area.locations.seatUsers.filter(
                            (u) => u.userId !== this.userId!
                        );
                        
                        console.log("area : ",area.locations.seatUsers.map(e=>(e.userId,e.x,e.y)))
                    }
                    this.isCall = false;
                    this.boardCast(this.userId!, this.prevX, this.prevY, this.spaceId!)
                    break;

                case "user-left":
                    this.destory()
                    break;
            }
        })
    }
    
    async joinVideoCall(elementId : string, userId : string){
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/generate-token`,{
            elementId : elementId,
            spaceId : this.spaceId,
            userId : userId
        })
        // console.log("data : ",response.data);
        const token = response.data.token;
        console.log( 'token : ', token)
        if(response.data){
            return token;
        }
    }

    boardCast( userId : string,  x : number , y : number, spaceId : string){
        if(!spaceId) return;
        console.log("space Id  : ",spaceId);
        roomManager.getInterface()?.broadcast({
            type : "movement",
            payload : {
                userId : userId,
                x : x,
                y : y
            }
        },this, spaceId!)
        this.send({
            type : "movement",
            payload : {
                userId : userId,
                x : x,
                y : y
            }
        })
    }

    async handleMove(userId : string, x : number, y : number){

        const key = `${x},${y}`;
        const area = areaMap.get(key);

        if(!area) return false;
        
        const { seatCount, seatUsers, width, height,  } = area.locations;
        if(seatUsers.length >= seatCount) return false;
        
        const allSeat : {x : number, y : number}[] = [];
        for(let i = 0 ; i< width; i ++){
            for (let j = 0 ; j< height ; j++){
                allSeat.push({ x : x + i, y : y + j })
            }
        }

        console.log("allseat : ",allSeat);
        const occupiedKeys = new Set(seatUsers.map(e=>`${e.x},${e.y}`))
        const emptySeat = allSeat.find(seat => !occupiedKeys.has(`${seat.x},${seat.y}`))

        if(!emptySeat){
            return false;
        }

        const joinRoom = seatUsers.push({
            userId : userId,
            x : emptySeat?.x!,
            y : emptySeat?.y!
        });

        console.log("joinroom : ",joinRoom);
        if(joinRoom){
            console.log(`User ${userId} joined ${area.type} at (${x},${y})`);
            const token = await this.joinVideoCall(area.elementId, userId);
            console.log("token : ",token);
            this.boardCast(this.userId! , emptySeat.x, emptySeat.y, this.spaceId!)

            if(token){
                this.send({
                    type : "generate-token",
                    payload : {
                        key : `${area.locations.x},${area.locations.y}`,
                        elementId : area.elementId,
                        userId : userId,
                        token : token
                    }
                })
            }
            return true;
        }
        return false;
    }

    destory(){
        roomManager.getInterface()?.removeUser(this, this.spaceId!);
        roomManager.getInterface()?.broadcast({
            type : 'user-left',
            payload : {
                userId : this.userId
            }
        },this,this.spaceId!)
    }

    send(payload : OutgoingMessage){
        this.ws.send(JSON.stringify(payload))
    }
}