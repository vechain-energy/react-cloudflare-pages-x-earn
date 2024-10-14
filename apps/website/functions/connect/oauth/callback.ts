// @TODO: add process validation

export async function onRequestGet({ request, env }): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code') ?? '';
    const state = url.searchParams.get('state') ?? '';
    const serviceId = state.split(':')[0]

    if (!code) { return new Response('Authorization code not found', { status: 400 }); }

    const { results } = await env.DB.prepare("SELECT * FROM oauth_states WHERE state = ? AND expires_at > datetime('now') AND service_id = ?")
        .bind(state, serviceId)
        .all();

    if (!results || results.length === 0) { return new Response('Invalid or expired state', { status: 400 }); }
    await env.DB.prepare("DELETE FROM oauth_states WHERE state = ?")
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

            if (!tokenData.body.access_token) { return new Response('Failed to obtain access token', { status: 500 }); }

            const serviceUserId = `withings://${tokenData.body.userid}`
            const { results: insertResults } = await env.DB.prepare("INSERT OR REPLACE INTO oauth_sessions (state, user_id, service_id, service_user_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+' || ? || ' seconds'))")
                .bind(state, results[0].user_id, results[0].service_id, serviceUserId, tokenData.body.access_token, tokenData.body.refresh_token, tokenData.body.expires_in)
                .run();

            if (!insertResults) { return new Response('Error: Failed to store OAuth session', { status: 500, headers: { 'Content-Type': 'text/plain' } }); }

            // Redirect to the stored redirect URI
            const redirectUri = results[0].redirect_uri;
            if (redirectUri) {
                return Response.redirect(redirectUri, 302);
            } else {
                return new Response('Redirect URI not found', { status: 400 });
            }

        // // Fetch activity data for the last day
        // const today = new Date();
        // const yesterday = new Date(today);
        // yesterday.setDate(yesterday.getDate() - 1);

        // const startDate = yesterday.toISOString().split('T')[0];
        // const endDate = today.toISOString().split('T')[0];

        // const activityResponse = await fetch('https://wbsapi.withings.net/v2/measure', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //         'Authorization': `Bearer ${tokenData.body.access_token}`
        //     },
        //     body: new URLSearchParams({
        //         action: 'getactivity',
        //         startdateymd: startDate,
        //         enddateymd: endDate
        //     })
        // });

        // const activityData = await activityResponse.json();

        // if (activityData.status !== 0) {
        //     console.error('Failed to fetch activity data:', activityData);
        // }

        // const responseData = {
        //     serviceUserId,
        //     activityData,
        //     accessToken: tokenData.body.access_token,
        //     refreshToken: tokenData.body.refresh_token,
        //     expiresIn: tokenData.body.expires_in
        // };

        // return new Response(JSON.stringify(responseData), {
        //     status: 200,
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // });

        default:
            return new Response(`Error: App ID '${serviceId}' not found`, {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
    }
}