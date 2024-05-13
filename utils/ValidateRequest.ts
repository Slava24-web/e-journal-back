import ErrorUtils, { Unprocessable } from "./Errors.ts";
import { NextFunction, Request, Response } from "express";

// @ts-ignore
export default async (req: Request, res: Response, next: NextFunction, schema) => {
    try {
        if (schema) {
            await schema.validate(req);
        }

        return next();
        // @ts-ignore
    } catch ({ path, errors }) {
        return ErrorUtils.catchError(
            res,
            new Unprocessable(JSON.stringify({ path, errors }))
        );
    }
};