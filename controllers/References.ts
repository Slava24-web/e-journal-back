import { Request, Response } from "express";
import ErrorsUtils from "../utils/Errors";
import ReferencesService from "../services/ReferencesService";

class ReferencesController {
    static async getAllSpecs(req: Request, res: Response) {
        try {
            const specs = await ReferencesService.getAllSpecs()
            console.log("Успешное получение списка специальностей")
            return res.status(200).json(specs)
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }

    static async getAllLevels(req: Request, res: Response) {
        try {
            const levels = await ReferencesService.getAllLevels()
            console.log("Успешное получение списка уровней обучения")
            return res.status(200).json(levels)
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }

    static async getAllLessonTypes(req: Request, res: Response) {
        try {
            const types = await ReferencesService.getAllLessonTypes()
            console.log("Успешное получение списка типов занятий")
            return res.status(200).json(types)
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }

    static async getAllDisciplines(req: Request, res: Response) {
        try {
            const disciplines = await ReferencesService.getAllDisciplines()
            console.log("Успешное получение списка дисциплин")
            return res.status(200).json(disciplines)
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }
}

export default ReferencesController
