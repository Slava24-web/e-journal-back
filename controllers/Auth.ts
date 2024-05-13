import { Request, Response } from "express"

import AuthService from "../services/Auth.ts";
import ErrorsUtils from "../utils/Errors.ts";
import { COOKIE_SETTINGS } from "../constants.ts";

class AuthController {
    /** Авторизация */
    static async signIn(req: Request, res: Response) {
        const { email, password } = req.body
        const { fingerprint } = req

        try {
            const {
                user,
                accessToken,
                refreshToken,
                accessTokenExpiration
            } = await AuthService.signIn({ email, password, fingerprint })

            // Запись refresh-токена в cookie
            res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)

            return res.status(200).json({ user, accessToken, accessTokenExpiration });
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }

    /** Регистрация */
    static async signUp(req: Request, res: Response) {
        const { email, password, username } = req.body
        const { fingerprint } = req;

        try {
            const {
                user,
                accessToken,
                refreshToken,
                accessTokenExpiration
            } = await AuthService.signUp({ email, password, username, fingerprint })

            // Запись refresh-токена в cookie
            res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)

            return res.status(200).json({ user, accessToken, accessTokenExpiration });
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }

    /** Выход из аккаунта */
    static async logOut(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken

        try {
            await AuthService.logOut(refreshToken)

            res.clearCookie('refreshToken')

            return res.sendStatus(200);
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }

    /** Обновление сессии */
    static async refresh(req: Request, res: Response) {
        const { fingerprint } = req;
        const currentRefreshToken = req.cookies.refreshToken

        try {
            const { user, accessToken, refreshToken, accessTokenExpiration } = await AuthService.refresh({
                fingerprint,
                currentRefreshToken,
            })

            res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)

            return res.status(200).json({ user, accessToken, accessTokenExpiration });
        } catch (err: unknown) {
            return ErrorsUtils.catchError(res, err);
        }
    }
}

export default AuthController;