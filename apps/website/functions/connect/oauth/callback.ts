// @TODO: add process validation

export async function onRequestGet({ request, env }): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code') ?? '';
    const state = url.searchParams.get('state') ?? '';
    const serviceId = state.split(':')[0]

    if (!code) {
        return new Response('Authorization code not found', { status: 400 });
    }

    await ensureTablesExist(env.DB)

    // Verify state and expiration
    const { results } = await env.DB.prepare(
        "SELECT * FROM oauth_states WHERE state = ? AND expires_at > datetime('now') AND service_id = ?"
    )
        .bind(state, serviceId)
        .all();

    if (!results || results.length === 0) {
        return new Response('Invalid or expired state', { status: 400 });
    }

    // State is valid, clean up the used state
    await env.DB.prepare(
        "DELETE FROM oauth_states WHERE state = ?"
    )
        .bind(state)
        .run();


    switch (serviceId) {
        case 'withings':
            // Exchange the code for an access token
            const tokenResponse = await fetch('https://wbsapi.withings.net/v2/oauth2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    action: 'requesttoken',
                    grant_type: 'authorization_code',
                    client_id: env.WITHINGS_CLIENT_ID,
                    client_secret: env.WITHINGS_SECRET,
                    code: code,
                    redirect_uri: `${url.origin}${url.pathname}`
                })
            });

            const tokenData = await tokenResponse.json();

            if (!tokenData.body.access_token) {
                return new Response('Failed to obtain access token', { status: 500 });
            }

            const serviceUserId = `withings://${tokenData.body.userid}`

            // Store user and session information in oauth_sessions
            const { results: insertResults } = await env.DB.prepare(
                "INSERT OR REPLACE INTO oauth_sessions (state, user_id, service_user_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+' || ? || ' seconds'))"
            )
                .bind(state, '0x', serviceUserId, tokenData.body.access_token, tokenData.body.refresh_token, tokenData.body.expires_in)
                .run();

            if (!insertResults) {
                return new Response('Error: Failed to store OAuth session', {
                    status: 500,
                    headers: { 'Content-Type': 'text/plain' }
                });
            }

            // Fetch activity data for the last day
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const startDate = yesterday.toISOString().split('T')[0];
            const endDate = today.toISOString().split('T')[0];

            const activityResponse = await fetch('https://wbsapi.withings.net/v2/measure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${tokenData.body.access_token}`
                },
                body: new URLSearchParams({
                    action: 'getactivity',
                    startdateymd: startDate,
                    enddateymd: endDate
                })
            });

            const activityData = await activityResponse.json();
            console.log('Activity Data:', activityData);

            if (activityData.status !== 0) {
                console.error('Failed to fetch activity data:', activityData);
            }


            const responseData = {
                serviceUserId,
                activityData,
                accessToken: tokenData.body.access_token,
                refreshToken: tokenData.body.refresh_token,
                expiresIn: tokenData.body.expires_in
            };

            return new Response(JSON.stringify(responseData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        default:
            return new Response(`Error: App ID '${serviceId}' not found`, {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
    }
}


async function ensureTablesExist(db) {
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
                        )
                    `);
                    break;
                case 'oauth_sessions':
                    await db.exec(`
                        CREATE TABLE oauth_sessions (
                            state TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            service_user_id TEXT NOT NULL,
                            access_token TEXT NOT NULL,
                            refresh_token TEXT NOT NULL,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        )
                    `);
                    break;
                case 'oauth_states':
                    await db.exec(`
                        CREATE TABLE oauth_states (
                            state TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            service_id TEXT NOT NULL,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        )
                    `);
                    break;
            }
        }
    }
}
