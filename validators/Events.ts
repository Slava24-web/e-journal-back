import { NextFunction, Request, Response } from "express";
import validateRequest from "../utils/ValidateRequest";
import * as Yup from "yup";

export const addEventSchema = Yup.object({
    body: Yup.object({
        title: Yup.string()
            .required("Поле title обязательно!"),
        start_datetime: Yup.number()
            .required("Поле start_datetime обязательно!"),
        end_datetime: Yup.number()
            .required("Поле end_datetime обязательно!"),
    }),
})

class EventsValidator {
    static async add(req: Request, res: Response, next: NextFunction) {
        return validateRequest(req, res, next, addEventSchema);
    }
}

export default EventsValidator;