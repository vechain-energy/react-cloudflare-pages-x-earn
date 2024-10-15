import { sendReward } from "../../../utils";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestOptions(): Promise<Response> {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    });
}

export async function onRequestPost({ params, env }): Promise<Response> {
    const { serviceId, userId } = params

    // Load service and user for the given serviceId & userId
    const { results: serviceResults } = await env.DB.prepare(
        "SELECT * FROM oauth_sessions WHERE service_id = ? AND user_id = ?"
    )
        .bind(serviceId, userId)
        .all();

    if (!serviceResults || serviceResults.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid or expired service connection' }), {
            status: 404,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }

    const serviceConnection = serviceResults[0];
    const receiver = serviceConnection.user_id;

    if (!receiver) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }


    switch (serviceConnection.service_id) {
        case "withings":

            // Check if the access token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime >= serviceConnection.expires_at) {
                // Token is expired, refresh it
                const refreshResponse = await fetch('https://wbsapi.withings.net/v2/oauth2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        action: 'requesttoken',
                        grant_type: 'refresh_token',
                        client_id: env.WITHINGS_CLIENT_ID,
                        client_secret: env.WITHINGS_CLIENT_SECRET,
                        refresh_token: serviceConnection.refresh_token
                    })
                });

                const refreshData = await refreshResponse.json();

                if (refreshData.status !== 0) {
                    console.error('Failed to refresh token:', refreshData);
                    return new Response(JSON.stringify({ error: 'Failed to refresh access token' }), {
                        status: 500,
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        }
                    });
                }

                // Update the database with the new tokens
                await env.DB.prepare(`
                    UPDATE oauth_sessions 
                    SET access_token = ?, refresh_token = ?, expires_at = ?
                    WHERE service_id = ? AND service_user_id = ?
                `)
                    .bind(
                        refreshData.body.access_token,
                        refreshData.body.refresh_token,
                        Math.floor(Date.now() / 1000) + refreshData.body.expires_in,
                        serviceId,
                        userId
                    )
                    .run();

                // Update the serviceConnection object with new token
                serviceConnection.access_token = refreshData.body.access_token;
            }


            // Fetch activity data for the current year
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);

            const startDate = startOfYear.toISOString().split('T')[0];
            const endDate = today.toISOString().split('T')[0];

            const activityResponse = await fetch('https://wbsapi.withings.net/v2/measure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${serviceConnection.access_token}`
                },
                body: new URLSearchParams({
                    action: 'getactivity',
                    startdateymd: startDate,
                    enddateymd: endDate
                })
            });

            const activityData = await activityResponse.json();

            if (activityData.status !== 0) {
                console.error('Failed to fetch activity data:', activityData);
                return new Response(JSON.stringify({ error: 'Failed to fetch activity data' }), {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Count total steps for the year
            let totalSteps = 0;
            if (activityData.body && activityData.body.activities) {
                totalSteps = activityData.body.activities.reduce((sum, activity) => sum + (activity.steps || 0), 0);
            }

            const responseData = {
                userId: serviceConnection.user_id,
                serviceUserId: serviceConnection.service_user_id,
                totalStepsThisYear: totalSteps
            };

            // @TODO: extend logic, this is so far just a basic example
            const result = totalSteps > 0 ? await sendReward(totalSteps, receiver, env) : {}

            return new Response(JSON.stringify({
                reward: result,
                data: responseData
            }), {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });

        default:
            return new Response(`Error: App ID '${params.serviceId}' not found`, {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
    }
}