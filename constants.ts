export const COOKIE_SETTINGS = {
    REFRESH_TOKEN: {
        httpOnly: true,
        maxAge: 2592e6, // 30 * 24 * 3600 * 1000 (30 дней)
    },
};

export const ACCESS_TOKEN_EXPIRATION = 18e5; // 1800 * 1000 (30 минут)