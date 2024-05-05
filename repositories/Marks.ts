import { MarkInfo } from "../models/Marks";
import pool from "../db";

class MarksRepository {
    /** Добавление оценки */
    static async addMark({ student_id, event_id, mark, note }: MarkInfo) {
        const response = await pool.query(
            'INSERT INTO marks (student_id, event_id, mark, note) VALUES ($1, $2, $3, $4) RETURNING *',
            [student_id, event_id, mark, note]
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

        return Boolean(response.rows)
    }
}

export default MarksRepository