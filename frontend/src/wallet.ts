import { useState, useEffect, useCallback } from 'react';
import freighterApi from '@stellar/freighter-api';

interface WalletState {
  address: string | null;
  signXDR: ((xdr: string) => Promise<string>) | null;
  connect: () => Promise<void>;
  connecting: boolean;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(() => {
    const envAddr = import.meta.env.VITE_WALLET_ADDRESS as string | undefined;
    return envAddr && envAddr.trim().length > 0 ? envAddr.trim() : null;
  });
  const [connecting, setConnecting] = useState(false);
  const [signFn, setSignFn] = useState<((xdr: string) => Promise<string>) | null>(null);

  /* Listen for IDE-injected wallet address */
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.type === 'soroban-ide:wallet-address' &&
        typeof event.data.address === 'string'
      ) {
        setAddress(event.data.address);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /* Freighter signTransaction wrapper */
  const freighterSign = useCallback(async (xdr: string): Promise<string> => {
    const result = await freighterApi.signTransaction(xdr, {
      networkPassphrase: 'Test SDF Network ; September 2015',
    });
    if (typeof result === 'string') return result;
    if (typeof result === 'object' && result !== null && 'signedTxXdr' in result) {
      return (result as { signedTxXdr: string }).signedTxXdr;
    }
    throw new Error('Freighter returned an unexpected sign result');
  }, []);

  /* Connect via Freighter */
  const connect = useCallback(async () => {
    if (address) return;
    setConnecting(true);
    try {
      // Use the universally supported requestAccess method
      const accessResponse = await freighterApi.requestAccess();
      
      let pubKey = '';
      if (typeof accessResponse === 'string') {
        pubKey = accessResponse;
      } else if (typeof accessResponse === 'object' && accessResponse !== null) {
        // Handle newer API responses
        pubKey = (accessResponse as any).address || (accessResponse as any).publicKey || '';
      }

      if (!pubKey) {
        throw new Error("Could not retrieve wallet address from Freighter. Make sure you approved the connection.");
      }
      
      setAddress(pubKey);
      setSignFn(() => freighterSign);
    } catch (err) {
      console.error('[KlassPay] Freighter connect failed:', err);
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [address, freighterSign]);

  /* Auto-set sign function when address comes from env/IDE */
  useEffect(() => {
    if (address && !signFn) {
      setSignFn(() => freighterSign);
    }
  }, [address, signFn, freighterSign]);

  return {
    address,
    signXDR: signFn,
    connect,
    connecting,
  };
}