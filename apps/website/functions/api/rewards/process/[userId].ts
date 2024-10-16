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
    if (!env.CLAIMS) {
        return new Response(JSON.stringify({ error: 'Queue not configured. Local queues are currently not supported.' }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        const { userId } = params

        const message = {
            method: 'handleUser',
            params: [userId]
        }
        await env.CLAIMS.send(message);

        return new Response(JSON.stringify({ message }), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }

}