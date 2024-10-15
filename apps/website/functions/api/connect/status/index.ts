import { validateSession } from "../../../utils";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export const onRequestPost = async ({ request, env }) => {
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
        const { serviceId } = await request.json();

        if (!serviceId) {
            return new Response('Service ID is required', { 
                status: 400,
                headers: corsHeaders
            });
        }

        const query = `DELETE FROM oauth_sessions WHERE user_id = ? AND service_id = ?`;

        const result = await env.DB.prepare(query)
            .bind(userId, serviceId)
            .run();

        if (result.changes > 0) {
            return new Response(JSON.stringify({ message: 'Service disconnected successfully' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        } else {
            return new Response(JSON.stringify({ message: 'No matching service found to disconnect' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            });
        }
    } catch (error) {
        console.error('Error disconnecting service:', error);
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
