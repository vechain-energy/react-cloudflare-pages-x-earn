import {
    Contract,
    ThorClient,
    VeChainProvider,
    ProviderInternalBaseWallet,
    ProviderInternalHDWallet,
} from '@vechain/sdk-network';
import { Units } from '@vechain/sdk-core
import { Addresses, ABI, CONTRACTS_NODE_URL } from '../src/config'

export async function ensureTablesExist(db) {
    const tables = ['oauth_sessions', 'oauth_states', 'users', 'user_sessions'];
    const placeholders = tables.map(() => '?').join(',');
    const { results } = await db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`)
        .bind(...tables)
        .all();

    const existingTables = new Set(results.map(row => row.name));

    for (const table of tables) {
        if (!existingTables.has(table)) {
            switch (table) {
                case 'users':
                    await db.prepare(`
                        CREATE TABLE users (
                            id TEXT PRIMARY KEY,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        );
                    `).run();
                    break;
                case 'oauth_sessions':
                    await db.prepare(`
                        CREATE TABLE oauth_sessions (
                            state TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            service_id TEXT NOT NULL,
                            service_user_id TEXT NOT NULL,
                            access_token TEXT NOT NULL,
                            refresh_token TEXT NOT NULL,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        );
                    `).run();
                    break;
                case 'oauth_states':
                    await db.prepare(`
                        CREATE TABLE oauth_states (
                            state TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL UNIQUE,
                            service_id TEXT NOT NULL,
                            redirect_uri TEXT NOT NULL,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        );
                    `).run();
                    break;
                case 'user_sessions':
                    await db.prepare(`
                        CREATE TABLE user_sessions (
                            id TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            session_token TEXT NOT NULL UNIQUE,
                            expires_at DATETIME NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        );
                    `).run();
                    break;
            }
        }
    }
}


export async function validateSession(env, authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Invalid or missing Authorization header', status: 401 };
    }

    const sessionId = authHeader.split(' ')[1];
    const { results: sessionResults } = await env.DB.prepare("SELECT * FROM user_sessions WHERE id = ? AND expires_at > datetime('now')")
        .bind(sessionId)
        .all();

    if (!sessionResults || sessionResults.length === 0) {
        return { valid: false, error: 'Invalid or expired session', status: 401 };
    }

    return { valid: true, session: sessionResults[0] };
}

// the default signer is a solo node seeded account
const DEFAULT_MNEMONIC = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross'
const DEFAULT_REWARDER_MNEMONIC_CHILD = 3

export async function sendReward(amount: number, receiver: string, env: any) {
    try {
        const mnemonic = (env.MNEMONIC ?? DEFAULT_MNEMONIC).split(' ')
        const mnemonicIndex = Number(env.REWARDER_MNEMONIC_CHILD ?? DEFAULT_REWARDER_MNEMONIC_CHILD)
        const nodeUrl = env.NODE_URL ?? CONTRACTS_NODE_URL

        const thor = ThorClient.fromUrl(nodeUrl)
        const signerWallet = new ProviderInternalHDWallet(mnemonic, mnemonicIndex + 1)
        const signerAccount = await signerWallet.getAccount(mnemonicIndex)
        const provider = new VeChainProvider(
            thor,
            new ProviderInternalBaseWallet([signerAccount]),
        );
        const signer = await provider.getSigner(signerAccount.address);

        const x2App = new Contract(Addresses.X2EarnApp, ABI, thor, signer)
        const result = await x2App.transact.rewardAmountTo(Units.parseUnits(String(amount), 18), receiver)

        return {
            nodeUrl,
            rewarderAddress: signerAccount?.address,
            txId: result.id
        }
    } catch (error) {
        console.error('Error in sendReward:', error);
        throw error;
    }
}