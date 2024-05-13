import pool from "../db.ts";

class SpecsRepository {
    static async getAllSpecs() {
        const response = await pool.query('SELECT * FROM specs')

        return response.rows
    }
}

export default SpecsRepository
