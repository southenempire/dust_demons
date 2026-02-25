import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';

export const fetchWalletAssets = async (publicKeyString) => {
    try {
        const connection = new Connection(RPC_ENDPOINT, 'confirmed');
        const publicKey = new PublicKey(publicKeyString);

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID,
        });

        const assets = tokenAccounts.value.map(account => {
            const info = account.account.data.parsed.info;
            const mint = info.mint;
            const amount = info.tokenAmount.uiAmount;

            // We'll use a mock name if we can't find it easily, 
            // in a real app we'd fetch metadata from Metaplex
            return {
                id: mint,
                mint,
                amount,
                tokenName: mint.slice(0, 4).toUpperCase(), // Placeholder for token name
                isDust: amount < 1, // Simple dust heuristic
            };
        });

        // Add some "Ghost" dust if the wallet is empty for demo purposes
        if (assets.length === 0) {
            return [
                { id: 'ghost1', tokenName: 'DUSK', amount: 0.05, isDust: true },
                { id: 'ghost2', tokenName: 'SCAM', amount: 0.12, isDust: true },
                { id: 'ghost3', tokenName: 'RUG', amount: 0.01, isDust: true },
            ];
        }

        return assets;
    } catch (error) {
        console.error('Failed to fetch assets:', error);
        return [];
    }
};
