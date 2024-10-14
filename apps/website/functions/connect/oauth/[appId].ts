export async function onRequestGet({ request, env, params }): Promise<Response> {
    const redirectUri = encodeURIComponent(`https://${request.headers.get('host')}/connect/oauth/callback`);
    const state = `${params.appId}:${Math.random().toString(36).substring(7)}`;

    switch (params.appId) {
        case 'withings':
            if (!env.WITHINGS_CLIENT_ID || !env.WITHINGS_SECRET) {
                return new Response('Error: Withings app not configured', {
                    status: 500,
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
            const authorizationUrl = `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${env.WITHINGS_CLIENT_ID}&scope=user.info,user.metrics,user.activity&redirect_uri=${redirectUri}&state=${state}`;
            return Response.redirect(authorizationUrl, 302);

        default:
            return new Response(`Error: App ID '${params.appId}' not found`, {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
    }
}
