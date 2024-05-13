import validateRequest from "../utils/ValidateRequest.ts";
import * as Yup from "yup";
import { Request, Response, NextFunction } from "express"

export const signInSchema = Yup.object({
    body: Yup.object({
        password: Yup.string()
            .required("Поле обязательно!")
            .min(3, "Пароль слишком короткий - минимум 3 символа")
            .max(50, "Максимальная длина - 50 символов"),
    }),
});

export const signUpSchema = Yup.object({
    body: Yup.object({
        username: Yup.string()
            .required("Поле обязательно!")
            .max(25, "Максимальная длина - 25 символов"),
        password: Yup.string()
            .required("Поле обязательно!")
            .min(3, "Пароль слишком короткий - минимум 3 символа")
            .max(50, "Максимальная длина - 50 символов"),
        // role: Yup.number()
        //     .required("Поле обязательно!")
        //     .typeError("Значение должно быть числом!")
        //     .min(1, "Минимальное значение - 1")
        //     .max(3, "Максимальное значение - 3"),
    }),
});

export const logoutSchema = Yup.object({
    cookies: Yup.object({
        refreshToken: Yup.string().required("Поле обязательно!"),
    }),
});

class AuthValidator {
    static async signIn(req: Request, res: Response, next: NextFunction) {
        return validateRequest(req, res, next, signInSchema);
    }

    static async signUp(req: Request, res: Response, next: NextFunction) {
        return validateRequest(req, res, next, signUpSchema);
    }

    static async logOut(req: Request, res: Response, next: NextFunction) {
        return validateRequest(req, res, next, logoutSchema);
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        // @ts-ignore
        return validateRequest(req, res, next);
    }
}

export default AuthValidator;