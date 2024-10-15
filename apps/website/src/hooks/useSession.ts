import { useWallet } from '@vechain/dapp-kit-react';
import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '~/config';

interface SessionResponse {
    sessionId: string;
    address: string;
}

export function useSession() {
    const { account, connectionCertificate } = useWallet();

    const session = useQuery<SessionResponse>({
        queryKey: ['session', account, connectionCertificate],
        queryFn: async () => {
            if (!account || !connectionCertificate) {
                return { sessionId: '', address: '' };
            }
            const response = await fetch(`${BACKEND_URL}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ certificate: connectionCertificate }),
            });
            if (!response.ok) {
                throw new Error('Failed to create session');
            }
            return response.json();
        },
        enabled: !!account && !!connectionCertificate,
    });

    return session
}
