export async function ensureTablesExist(db) {
    const tables = ['oauth_sessions', 'oauth_states', 'users', 'user_sessions'];
    for (const table of tables) {
        const { results } = await db
            .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
            .bind(table)
            .all();

        if (results.length === 0) {
            switch (table) {
                case 'users':
                    await db.prepare(`
                        CREATE TABLE users (
                            id TEXT PRIMARY KEY,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        );
                    `).all()
                    break;
                case 'oauth_sessions':
                    await db.prepare(`
                        CREATE TABLE oauth_sessions (
                            state TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            service_id TEXT NOT NULL,
                            service_user_id TEXT NOT NULL,
                            access_token TEXT NOT NULL,
                            refresh_token TEXT NOT NULL,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        );
                    `).all()
                    break;
                case 'oauth_states':
                    await db.prepare(`
                        CREATE TABLE oauth_states (
                            state TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL UNIQUE,
                            service_id TEXT NOT NULL,
                            redirect_uri TEXT NOT NULL,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        );
                    `).all()
                    break;
                case 'user_sessions':
                    await db.prepare(`
                        CREATE TABLE user_sessions (
                            id TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            session_token TEXT NOT NULL UNIQUE,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        );
                    `).all()
                    break;
            }
        }
    }
}


export async function validateSession(env, authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Invalid or missing Authorization header', status: 401 };
    }

    const sessionId = authHeader.split(' ')[1];
    const { results: sessionResults } = await env.DB.prepare("SELECT * FROM user_sessions WHERE id = ? AND expires_at > datetime('now')")
        .bind(sessionId)
        .all();

    if (!sessionResults || sessionResults.length === 0) {
        return { valid: false, error: 'Invalid or expired session', status: 401 };
    }

    return { valid: true, session: sessionResults[0] };
}