import pool from "../db.ts";

class LevelsRepository {
    static async getAllLevels() {
        const response = await pool.query('SELECT * FROM levels')

        return response.rows
    }
}

export default LevelsRepository
