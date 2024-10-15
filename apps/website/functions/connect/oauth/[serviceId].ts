import { ensureTablesExist } from "../../utils";

export async function onRequestGet({ request, env, params }): Promise<Response> {
    // Load session from authorization header and verify it
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Error: Invalid or missing Authorization header', {
            status: 401,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    const sessionId = authHeader.split(' ')[1];
    const { results: sessionResults } = await env.DB.prepare("SELECT * FROM user_sessions WHERE id = ? AND expires_at > datetime('now')")
        .bind(sessionId)
        .all();

    if (!sessionResults || sessionResults.length === 0) {
        return new Response('Error: Invalid or expired session', {
            status: 401,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    const session = sessionResults[0];
    const userId = session.user_id;

    const redirectUri = encodeURIComponent(`https://${request.headers.get('host')}/connect/oauth/callback`);
    const state = `${params.serviceId}:${Math.random().toString(36).substring(2)}`;

    const url = new URL(request.url);

    const userRedirectUri = (url.searchParams.get('redirect_uri') ?? '').toLowerCase();

    if (!userId) {
        return new Response('Error: user_id is required', {
            status: 400,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    await ensureTablesExist(env.DB)

    // Create user on demand if not exists
    const { results: existingUser } = await env.DB.prepare("SELECT id FROM users WHERE id = ?")
        .bind(userId)
        .all();

    if (!existingUser || existingUser.length === 0) {
        const { results: newUser } = await env.DB.prepare("INSERT INTO users (id) VALUES (?)")
            .bind(userId)
            .run();

        if (!newUser) {
            return new Response('Error: Failed to create user', { status: 500, headers: { 'Content-Type': 'text/plain' } });
        }
    }

    switch (params.serviceId) {
        case 'withings':
            if (!env.WITHINGS_CLIENT_ID || !env.WITHINGS_SECRET) { return new Response('Error: Withings app not configured', { status: 500, headers: { 'Content-Type': 'text/plain' } }); }

            const authorizationUrl = `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${env.WITHINGS_CLIENT_ID}&scope=user.info,user.metrics,user.activity&redirect_uri=${redirectUri}&state=${state}`;
            const { results } = await env.DB.prepare("INSERT OR REPLACE INTO oauth_states (state, user_id, service_id, redirect_uri, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+1 hour'))")
                .bind(state, userId, params.serviceId, userRedirectUri)
                .run();

            if (!results) { return new Response('Error: Failed to store OAuth state', { status: 500, headers: { 'Content-Type': 'text/plain' } }); }

            return Response.redirect(authorizationUrl, 302);

        default:
            return new Response(`Error: App ID '${params.appId}' not found`, {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
    }
}