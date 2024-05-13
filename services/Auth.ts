import bcrypt from "bcryptjs";
import TokenService from "./Token.ts";
import { NotFound, Forbidden, Conflict, Unauthorized } from "../utils/Errors.ts";
import RefreshSessionRepository from "../repositories/RefreshSession.ts";
import UserRepository from "../repositories/User.ts";
import { ACCESS_TOKEN_EXPIRATION } from "../constants.ts";
import { FingerprintResult } from "../common/models.ts";
import { TokenPayloadData } from "../models/User.ts";

class AuthService {
    /**
     * Сервис авторизации
     * @param {string} email
     * @param {string} password
     * @param {FingerprintResult | undefined} fingerprint
     * @description
     * Проверка существования пользователя с введённым email, получение данных о пользователе из БД, генерация токенов, создание сессии
     */
    static async signIn({ email, password, fingerprint }: { email: string; password: string; fingerprint: FingerprintResult | undefined }) {
        const userData = await UserRepository.getUserData(email)

        if (!userData) {
            throw new NotFound('Пользователь с данным email не найден!')
        }

        const isPasswordValid = bcrypt.compareSync(password, userData.password)
        if (!isPasswordValid) {
            throw new Unauthorized('Неверный email или пароль!')
        }

        const { id, username } = userData

        const payload: TokenPayloadData = { id, email, username }
        const accessToken = await TokenService.generateAccessToken(payload)
        const refreshToken = await TokenService.generateRefreshToken(payload)

        // Создание refresh-сессии для пользователя
        await RefreshSessionRepository.createRefreshSession({ id, refreshToken, fingerprint })

        console.log('Успешная авторизация!')

        return {
            user: {
                id,
                email,
                username
            },
            accessToken,
            refreshToken,
            accessTokenExpiration: ACCESS_TOKEN_EXPIRATION
        }
    }

    /**
     * Сервис регистрации
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {FingerprintResult | undefined} fingerprint
     * @description
     * Проверка существования пользователя с введённым email, создание пользователя, генерация токенов, создание сессии
     */
    static async signUp(
        { email, password, username, fingerprint }: { email: string; password: string; username: string; fingerprint: FingerprintResult | undefined }
    ) {
        const userData = await UserRepository.getUserData(email)

        if (userData) {
            throw new Conflict('Пользователь с таким email уже существует!')
        }

        const hashedPassword = bcrypt.hashSync(password, 8)
        const { id } = await UserRepository.createUser({ email, hashedPassword, username })

        const payload: TokenPayloadData = { id, email, username }
        const accessToken = await TokenService.generateAccessToken(payload)
        const refreshToken = await TokenService.generateRefreshToken(payload)

        // Создание refresh-сессии для пользователя
        await RefreshSessionRepository.createRefreshSession({ id, refreshToken, fingerprint })

        console.log('Успешная регистрация!')

        return {
            user: {
                id,
                email,
                username
            },
            accessToken,
            refreshToken,
            accessTokenExpiration: ACCESS_TOKEN_EXPIRATION
        }
    }

    /**
     * Сервис выхода из аккаунта
     * @param {string} refreshToken
     * @description
     * Удаление данных о сессии
     */
    static async logOut(refreshToken: string) {
        await RefreshSessionRepository.deleteRefreshSession(refreshToken)
        console.log('Успешный выход из аккаунта!')
    }

    /**
     * Сервис обновления refresh-токена
     * @param {FingerprintResult} fingerprint
     * @param {string} currentRefreshToken
     */
    static async refresh({ fingerprint, currentRefreshToken }: { fingerprint: FingerprintResult | undefined; currentRefreshToken: string }) {
        if (!currentRefreshToken) {
            throw new Unauthorized('Вы не авторизованы!')
        }

        const refreshSession = await RefreshSessionRepository.getRefreshSession(currentRefreshToken)

        if (!refreshSession) {
            throw new Unauthorized('Вы не авторизованы!')
        }

        if (refreshSession.finger_print !== fingerprint?.hash) {
            console.log('Попытка несанкционированного обновления токенов!')
            throw new Forbidden('Нет доступа!')
        }

        // Удаление текущей сессии
        await RefreshSessionRepository.deleteRefreshSession(currentRefreshToken)

        let payload: TokenPayloadData

        try {
            payload = <TokenPayloadData>await TokenService.verifyRefreshToken(currentRefreshToken)
        } catch (error: unknown) {
            throw new Forbidden(error)
        }

        const { id, email, username } = await UserRepository.getUserData(payload.email)
        const accessToken = await TokenService.generateAccessToken({ id, email, username })
        const refreshToken = await TokenService.generateRefreshToken({ id, email, username })

        // Создание refresh-сессии для пользователя
        await RefreshSessionRepository.createRefreshSession({ id, refreshToken, fingerprint })

        console.log('Успешное обновление токена!')

        return {
            user: {
                id,
                email,
                username
            },
            accessToken,
            refreshToken,
            accessTokenExpiration: ACCESS_TOKEN_EXPIRATION
        }
    }
}

export default AuthService;