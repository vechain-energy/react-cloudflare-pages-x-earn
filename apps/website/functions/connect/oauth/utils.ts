export async function ensureTablesExist(db) {
    const tables = ['oauth_sessions', 'oauth_states', 'users'];
    for (const table of tables) {
        const { results } = await db
            .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
            .bind(table)
            .all();

        if (results.length === 0) {
            let query = '';
            switch (table) {
                case 'users':
                    await db.exec(`
                        CREATE TABLE users (
                            id TEXT PRIMARY KEY,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    break;
                case 'oauth_sessions':
                    await db.exec(`
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
                    `);
                    break;
                case 'oauth_states':
                    await db.exec(`
                        CREATE TABLE oauth_states (
                            state TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL UNIQUE,
                            service_id TEXT NOT NULL,
                            redirect_uri TEXT NOT NULL,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        );
                    `);
                    break;
            }
        }
    }
}
