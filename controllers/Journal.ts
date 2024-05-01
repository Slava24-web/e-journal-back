import { Request, Response } from "express";

import ErrorsUtils from "../utils/Errors";
import JournalService from "../services/Journal";

class JournalController {
    static async uploadGroupWordFile(req: Request, res: Response) {
        try {
            // @ts-ignore
            const { group } = req.files as { [fieldname: string]: Express.Multer.File };

            await JournalService.uploadGroup(group)
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }
}

export default JournalController