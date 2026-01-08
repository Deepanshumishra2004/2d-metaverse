import type { OutgoingMessage } from "./types.js";
import type { User } from "./user.js";

interface Room {
    users : User[],
    mapMatrix : number[][]
}


export class roomManager {
    rooms : Map<string,User[]>=new Map();
    

    static interface : roomManager;

    private constructor(){
        this.rooms = new Map();
    }

    static getInterface(){
        if(!this.interface){
            this.interface = new roomManager()
        }
        return this.interface;
    }

    public removeUser(user : User, spaceId : string){
        if(!this.rooms.has(spaceId)){
            return;
        }
        this.rooms.set(spaceId,(this.rooms.get(spaceId)?.filter((u)=>u.id !== user.id) ?? []))
    }

    public addUser(spaceId : string, user : User){
        if(!this.rooms.has(spaceId)){
            this.rooms.set(spaceId,[user]);
            return;
        }
        this.rooms.set(spaceId,[...(this.rooms.get(spaceId) ?? []),user]);

    }

    public broadcast(message: OutgoingMessage, user: User, roomId: string) {
        if (!this.rooms.has(roomId)) {
            return;
        }
        this.rooms.get(roomId)?.forEach((u) => {
            console.log(u.id)
            console.log(user.id)
            if (u.id !== user.id) {
                console.log("send---------------------------------")
                console.log(JSON.stringify(message))
                u.send(message);
            }
        });
    }
}