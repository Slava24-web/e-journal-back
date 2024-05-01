import { EventInfo, IEvent } from "../models/Events";
import pool from "../db";
import { Conflict } from "../utils/Errors";

class EventsRepository {
    static async addEvent(eventInfo: EventInfo, user_id: number){
        const {
            group_id,
            lesson_type_id,
            title,
            start_datetime,
            end_datetime,
            room,
            description,
        } = eventInfo

        const response = await pool.query(
            'INSERT INTO events(user_id, group_id, lesson_type_id, title, start_datetime, end_datetime, room, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [user_id, group_id, lesson_type_id, title, start_datetime, end_datetime, room ?? '', description ?? '']
        )

        return response.rows[0]
    }

    static async updateEvent(event: IEvent) {
        const {
            id,
            group_id,
            lesson_type_id,
            title,
            start_datetime,
            end_datetime,
            room,
            description,
        } = event

        const response = await pool.query(
            'UPDATE events SET group_id = $1, lesson_type_id = $2, title = $3, start_datetime = $4, end_datetime = $5, room = $6, description = $7 WHERE id = $8',
            [group_id, lesson_type_id, title, start_datetime, end_datetime, room, description, id]
        )

        return response.rows[0]
    }

    static async getEventByDatetime(start_datetime: number, end_datetime: number): Promise<boolean> {
        const response = await pool.query(
            'SELECT * FROM events WHERE start_datetime = $1 AND end_datetime = $2', [start_datetime, end_datetime]
        )

        return Boolean(response.rows[0])
    }

    static async getAllEvents(user_id: number) {
        const response = await pool.query('SELECT * FROM events WHERE user_id = $1', [user_id])
        return response.rows.sort((a, b) => b.start_datetime - a.start_datetime)
    }
}

export default EventsRepository