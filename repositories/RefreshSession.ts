import pool from "../db.ts";
import { FingerprintResult } from "../common/models";

class RefreshSessionRepository {
    static async getRefreshSession(refreshToken: string) {
        const response = await pool.query('SELECT * FROM refresh_sessions WHERE refresh_token=$1', [refreshToken])

        if (!response.rows[0]) {
            return null
        }

        return response.rows[0]
    }

    static async createRefreshSession({ id, refreshToken, fingerprint }: { id: string; refreshToken: string; fingerprint: FingerprintResult | undefined }) {
        await pool.query(
            'INSERT INTO refresh_sessions (user_id, refresh_token, finger_print) VALUES ($1, $2, $3)',
            [id, refreshToken, fingerprint?.hash]
        )
    }

    static async deleteRefreshSession(refreshToken: string) {
        await pool.query('DELETE FROM refresh_sessions WHERE refresh_token=$1', [refreshToken])
    }
}

export default RefreshSessionRepository;