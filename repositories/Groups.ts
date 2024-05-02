import pool from "../db";
import { GroupInfo } from "../models/Group";

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
    static async addGroup(groupInfo: GroupInfo) {
        const { level_id, spec_id, course, number } = groupInfo

        const response = await pool.query(
            'INSERT INTO groups(level_id, spec_id, course, number) VALUES ($1, $2, $3, $4)',
            [level_id, spec_id, course, number]
        )

        return response.rows[0]
    }
}

export default GroupsRepository
