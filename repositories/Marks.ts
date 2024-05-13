import { IMark, MarkInfo } from "../models/Marks";
import pool from "../db.ts";
import { IEvent } from "../models/Events";

class MarksRepository {
    /** Добавление оценки */
    static async addMark({ student_id, event_id, discipline_id, mark, note, is_control, pks }: MarkInfo) {
        const response = await pool.query(
            'INSERT INTO marks (student_id, event_id, discipline_id, mark, note, is_control, pks) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [student_id, event_id, discipline_id, mark, note, is_control, pks]
        )

        return response.rows[0]
    }

    /** Получение всех оценок по событию */
    static async getMarksByEventId(event_id: number) {
        const response = await pool.query('SELECT * FROM marks WHERE event_id = $1', [event_id])

        if (!response.rows.length) {
            return null
        }

        return response.rows
    }

    /** Получение всех оценок по событию и студенту */
    static async getMarksByEventIdAndStudentId(event_id: number, student_id: number) {
        const response = await pool.query('SELECT * FROM marks WHERE event_id = $1 AND student_id = $2', [event_id, student_id])

        if (!response.rows.length) {
            return null
        }

        return response.rows
    }

    static async updateMark(imark: IMark) {
        const { student_id, event_id, note, is_control, pks } = imark

        const response = await pool.query(
            'UPDATE marks SET note = $1, is_control = $2, pks = $3 WHERE student_id = $4 AND event_id = $5',
            [note, is_control ? 1 : 0, pks, student_id, event_id]
        )

        return response.rows[0]
    }
}

export default MarksRepository