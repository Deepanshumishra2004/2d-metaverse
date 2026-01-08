import Jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import type { Request,Response, NextFunction } from "express";

interface AuthRequest extends Request{
    userId? : string
}

interface CustomJwtPayload extends JwtPayload{
    userId : string,
    role : string
}

export const userMiddleware=(req : AuthRequest ,res : Response, next : NextFunction)=>{

    const header = req.headers['authorization'] as string;
    console.log("header : ",header);
    const token = header.split(' ')[1] as string;

    console.log("token user : ",token);

    if(!token){
        res.status(403).json({message : "this token is not found"})
    }

    try {
        const decoded = Jwt.verify(token, JWT_SECRET) as CustomJwtPayload
        console.log("decoded : ",decoded)
        req.userId = decoded.userId
        next()
    } catch (error) {
        console.log("failed")
        res.status(403).json({message : "Unauthorized"})
        return;
    }
}