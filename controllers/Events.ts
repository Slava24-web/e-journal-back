import { Request, Response } from "express"
import ErrorsUtils from "../utils/Errors";
import EventsService from "../services/Events";

class EventsController {
    /** Добавление события в календарь */
    static async addEvents(req: Request, res: Response) {
        const { events, user_id } = req.body

        const { fingerprint } = req

        try {
            await EventsService.addEvents(events, user_id)
            console.log("Успешное добавление событий календаря")
            return res.status(200).json({ isCreated: true })
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }

    static async updateEvents(req: Request, res: Response) {
        const { events } = req.body

        const { fingerprint } = req

        try {
            const allEvents = await EventsService.updateEvents(events)
            console.log("Успешное обновление календаря")
            return res.status(200).json({
                events: allEvents
            })
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }

    /** Получение всех событий календаря по id пользователя */
    static async getAllEvents(req: Request, res: Response) {
        const user_id = Number.parseInt(req.params.user_id, 10)
        console.log("user_id", user_id)
        console.log("Запрос событий календаря")

        try {
            return res.status(200).json({
                events: await EventsService.getAllEvents(user_id)
            })
        } catch (err) {
            return ErrorsUtils.catchError(res, err);
        }
    }
}

export default EventsController