export const onRequestGet = async ({ params, env }) => {
    const userId = params.userId;

    if (!userId) { return new Response('User ID is required', { status: 400 }); }

    try {
        const query = `SELECT DISTINCT service_id FROM oauth_sessions WHERE user_id = ?`;

        const result = await env.DB.prepare(query)
            .bind(userId)
            .all();

        const connectedServices = result.results.map(row => row.service_id);

        return new Response(JSON.stringify(connectedServices), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error fetching connected services:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
