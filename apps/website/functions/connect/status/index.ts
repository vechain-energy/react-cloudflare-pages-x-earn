import { validateSession } from "../../utils";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export const onRequestGet = async ({ request, env }) => {
    const sessionValidation = await validateSession(env, request.headers.get('Authorization'));

    if (!sessionValidation.valid) {
        return new Response(`Error: ${sessionValidation.error}`, {
            status: sessionValidation.status,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
    }
    const userId = sessionValidation.session.user_id

    if (!userId) { 
        return new Response('User ID is required', { 
            status: 400,
            headers: corsHeaders
        }); 
    }

    try {
        const query = `SELECT DISTINCT service_id FROM oauth_sessions WHERE user_id = ?`;

        const result = await env.DB.prepare(query)
            .bind(userId)
            .all();

        const connectedServices = result.results.map(row => row.service_id);

        return new Response(JSON.stringify(connectedServices), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error fetching connected services:', error);
        return new Response('Internal Server Error', { 
            status: 500,
            headers: corsHeaders
        });
    }
};

export const onRequestOptions = () => {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
};
