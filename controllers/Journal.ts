import { Request, Response } from "express";

import ErrorsUtils from "../utils/Errors";
import JournalService from "../services/Journal";

class JournalController {
    static async getAllGroups(req: Request, res: Response) {
        console.log("Запрос списка групп")

        try {
            const groups = await JournalService.getAllGroups()
            return res.status(200).json(groups)
        } catch (err) {
            return ErrorsUtils.catchError(res, err)
        }
    }

    static async uploadGroupWordFile(req: Request, res: Response) {
        try {
            // @ts-ignore
            const { group } = req.files as { [fieldname: string]: Express.Multer.File }
            const spec_id = req.query.spec_id ? Number(req.query.spec_id) : null
            const level_id = req.query.level_id ? Number(req.query.level_id) : null
            const course = req.query.course ? Number(req.query.course) : null

            await JournalService.uploadGroup(group, spec_id, level_id, course)
            return res.sendStatus(200);
        } catch (err) {
            return ErrorsUtils.catchError(res, err)
        }
    }

    static async getStudentsByGroupId(req: Request, res: Response) {
        try {
            const group_id = req.query.group_id
            if (group_id) {
                const students = await JournalService.getStudentsByGroupId(Number(group_id))
                return res.status(200).json(students)
            }
        } catch (err) {
            return ErrorsUtils.catchError(res, err)
        }
    }
}

export default JournalController