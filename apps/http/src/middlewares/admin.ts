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

export const adminMiddleware=(req : AuthRequest ,res : Response, next : NextFunction)=>{

    const header = req.headers['authorization'] as string;

    console.log("token : ",header)
    const token = header.split(' ')[1] as string;
    console.log("token admin : ",token);

    if(!token){
        res.status(400).json({message : "this token is not found"})
        return;
    }

    try {
        const decoded = Jwt.verify(token, JWT_SECRET) as CustomJwtPayload
        if(decoded.role !== 'Admin'){
            res.status(400).json({message : "the role is not admin"})
            return;
        }
        console.log(decoded)
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(400).json({message : "Unauthorized"})
        return;
    }
}