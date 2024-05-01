import { EventInfo, IEvent } from "../models/Events";
import EventsRepository from "../repositories/Events";
import { Conflict } from "../utils/Errors";

class EventsService {
    static async addEvents(events: EventInfo[], user_id: number) {
        for (const eventInfo of events) {
            const hasEventByDatetime: boolean = await EventsRepository.getEventByDatetime(eventInfo.start_datetime, eventInfo.end_datetime)

            if (hasEventByDatetime) {
                throw new Conflict('Такое событие уже существует!')
            }

            await EventsRepository.addEvent(eventInfo, user_id)
        }
    }

    static async updateEvents(events: IEvent[]) {
        for (const event of events) {
            await EventsRepository.updateEvent(event)
        }

        return await this.getAllEvents(events[0].user_id)
    }

    static async getAllEvents(user_id: number) {
        return await EventsRepository.getAllEvents(user_id)
    }
}

export default EventsService