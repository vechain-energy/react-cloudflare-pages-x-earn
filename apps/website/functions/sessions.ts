import { Certificate } from '@vechain/sdk-core';
import { uuid } from '@cfworker/uuid';
import { ensureTablesExist } from './utils';

const SESSION_EXPIRY_SECONDS = 24 * 60 * 60

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestOptions() {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    });
}

export async function onRequestPost({ request, env }) {
    try {
        const { certificate } = await request.json();

        if (!certificate) {
            return new Response(JSON.stringify({ error: 'Certificate is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const vechainCertificate = Certificate.of(certificate)
        vechainCertificate.verify()

        const address = vechainCertificate.signer.toLowerCase();

        await ensureTablesExist(env.DB)

        // Create or get user
        let user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(address).first();
        if (!user) {
            await env.DB.prepare('INSERT INTO users (id) VALUES (?)').bind(address).run();
            user = { id: address };
        }

        // Create user session
        const sessionId = uuid();
        const sessionToken = uuid();
        const expiresAt = new Date(Date.now() + SESSION_EXPIRY_SECONDS);
        // Delete old sessions for the user
        await env.DB.prepare('DELETE FROM user_sessions WHERE user_id = ?')
            .bind(user.id)
            .run();

        // Create new session
        await env.DB.prepare('INSERT INTO user_sessions (id, user_id, session_token, expires_at) VALUES (?, ?, ?, ?)')
            .bind(sessionId, user.id, sessionToken, expiresAt.toISOString())
            .run();

        return new Response(JSON.stringify({ sessionId, address }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in onRequestPost:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
