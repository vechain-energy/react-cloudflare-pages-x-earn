import { validateSession } from "../../../../utils";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export const onRequestDelete = async ({ request, env, params }) => {
    const sessionValidation = await validateSession(env, request.headers.get('Authorization'));

    if (!sessionValidation.valid) {
        return new Response(`Error: ${sessionValidation.error}`, {
            status: sessionValidation.status,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
    }
    const userId = sessionValidation.session.user_id;
    const serviceId = params.serviceId;

    if (!userId) { 
        return new Response('User ID is required', { 
            status: 400,
            headers: corsHeaders
        }); 
    }

    if (!serviceId) {
        return new Response('Service ID is required', { 
            status: 400,
            headers: corsHeaders
        }); 
    }

    try {
        // Delete OAuth states for the user and service
        await env.DB.prepare('DELETE FROM oauth_states WHERE user_id = ? AND service_id = ?')
            .bind(userId, serviceId)
            .run();

        // Delete OAuth sessions for the user and service
        await env.DB.prepare('DELETE FROM oauth_sessions WHERE user_id = ? AND service_id = ?')
            .bind(userId, serviceId)
            .run();

        return new Response(JSON.stringify({ message: 'OAuth states and sessions deleted successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error deleting OAuth states and sessions:', error);
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
