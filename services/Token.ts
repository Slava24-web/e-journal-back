import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express"
import { Forbidden, Unauthorized } from "../utils/Errors";
import { NextFunction } from "express";
import { TokenPayloadData } from "../models/User";

dotenv.config();

class TokenService {
    static async generateAccessToken(payload: TokenPayloadData) {
        // @ts-ignore
        return await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '30m'
        })
    }

    static async generateRefreshToken(payload: TokenPayloadData) {
        // @ts-ignore
        return await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '30d'
        })
    }

    /** Проверка доступа к запрещённому ресурсу
      * работает как middleware
      */
    static async checkAccess(req: Request, _: Response, next: NextFunction) {
        const authHeaders = req.headers.authorization
        const token = authHeaders?.split('')?.[1]

        if (!token) {
            return next(new Unauthorized(new Error("Вы не авторизованы!")))
        }

        try {
            // @ts-ignore
            req.user = await TokenService.verifyAccessToken(token)
            // @ts-ignore
            console.log(req.user)
        } catch (error: unknown) {
            console.error(error)
            return next(new Forbidden('Нет доступа!'))
        }

        next()
    }

    static async verifyAccessToken(accessToken: string) {
        return await jwt.verify(accessToken, <Secret>process.env.ACCESS_TOKEN_SECRET)
    }

    static async verifyRefreshToken(refreshToken: string) {
        return await jwt.verify(refreshToken, <Secret>process.env.REFRESH_TOKEN_SECRET)
    }
}

export default TokenService;