import pool from "../db.ts";
import { GroupInfo } from "../models/Group.ts";

class GroupsRepository {
    /** Получение group_id по номеру группы */
    static async getGroupIdByGroupNumber(number: string) {
        const response = await pool.query('SELECT * FROM groups WHERE number = $1', [number])

        if (!response.rows.length) {
            return null
        }

        return response.rows[0].id
    }

    /** Добавление новой группы */
    static async addGroup({ level_id, spec_id, course, number }: GroupInfo) {
        const response = await pool.query(
            'INSERT INTO groups (level_id, spec_id, course, number) VALUES ($1, $2, $3, $4) RETURNING *',
            [level_id, spec_id, course, number]
        )

        return response.rows[0]
    }

    /** Получение всех групп */
    static async getAllGroups() {
        const response = await pool.query('SELECT * FROM groups')

        if (!response.rows.length) {
            return null
        }

        return response.rows
    }
}

export default GroupsRepository
