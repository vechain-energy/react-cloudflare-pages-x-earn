// @TODO: add process validation

export async function onRequestGet({ request, env }): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code') ?? '';
    const state = url.searchParams.get('state') ?? '';
    const appId = state.split(':')[0]

    if (!code) {
        return new Response('Authorization code not found', { status: 400 });
    }

    switch (appId) {
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

            const userId = `withings://${tokenData.body.userid}`

            // Fetch user profile
            const profileResponse = await fetch('https://wbsapi.withings.net/v2/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${tokenData.body.access_token}`
                },
                body: new URLSearchParams({
                    action: "get"

                })
            });

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
                userId,
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
            return new Response(`Error: App ID '${appId}' not found`, {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
    }
}
