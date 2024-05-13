import { EventInfo, IEvent } from "../models/Events.ts";
import EventsRepository from "../repositories/Events.ts";
import { Conflict } from "../utils/Errors.ts";
import DisciplinesRepository from "../repositories/Disciplines.ts";

class EventsService {
    static async addEvents(events: EventInfo[], user_id: number) {
        for (const eventInfo of events) {
            const hasEventByDatetime: boolean = await EventsRepository.getEventByDatetime(eventInfo.start_datetime, eventInfo.end_datetime)

            if (hasEventByDatetime) {
                throw new Conflict('Такое событие уже существует!')
            }

            let discipline_id: number = eventInfo.discipline_id

            if (eventInfo.discipline_name) {
                const newDiscipline = await DisciplinesRepository.addDiscipline(eventInfo.discipline_name)
                discipline_id = newDiscipline.id
                console.log("Создана новая дисциплина: ", eventInfo.discipline_name)
            }

            await EventsRepository.addEvent({ ...eventInfo, discipline_id }, user_id)
        }
    }

    static async updateEvents(events: IEvent[]) {
        for (const event of events) {
            await EventsRepository.updateEvent(event)
        }

        return await this.getAllEvents(events[0]?.user_id)
    }

    static async getAllEvents(user_id: number) {
        return await EventsRepository.getAllEvents(user_id)
    }
}

export default EventsService