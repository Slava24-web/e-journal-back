import { Request, Response } from "express";

import ErrorsUtils from "../utils/Errors.ts";
import GeneratorService from "../services/Generator.ts";

class GeneratorController {
    /** Генерация контрольных заданий */
    static async generateControlWorks(req: Request, res: Response) {
        try {
            // @ts-ignore файл с заданиями
            const excel = req.files['files[]']
            const { difficult, group_id, theme_number } = req.body

            const info = {
                difficult: Number(difficult),
                group_id: Number(group_id),
                theme_number: theme_number
                    .split(',')
                    .map((id: string) => Number.parseInt(id, 10)),
            }

            const base64string = await GeneratorService.generateControlWorks(excel, info)

            res.set('Content-Type', 'text/plain');
            res.send(base64string)
        } catch (err) {
            return ErrorsUtils.catchError(res, err)
        }
    }

    /** Генерация домашних заданий */
    static async generateHomeWorks(req: Request, res: Response) {
        try {
            // @ts-ignore файл с заданиями
            const excel = req.files['files[]']
            const { difficult, group_id, theme_number, event_id } = req.body

            const info = {
                difficult: Number(difficult),
                group_id: Number(group_id),
                theme_number: theme_number
                    .split(',')
                    .map((id: string) => Number.parseInt(id, 10)),
                event_id: Number.parseInt(event_id, 10)
            }

            const base64string = await GeneratorService.generateHomeWorks(excel, info)

            res.set('Content-Type', 'text/plain');
            res.send(base64string)
        } catch (err) {
            return ErrorsUtils.catchError(res, err)
        }
    }
}

export default GeneratorController