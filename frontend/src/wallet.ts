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

      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.type === 'soroban-ide:sign-response' &&
        typeof event.data.signedXDR === 'string'
      ) {
        /* handled by the sign request promise — kept for potential future use */
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
    if (typeof result === 'object' && 'signedTxXdr' in result) {
      return (result as { signedTxXdr: string }).signedTxXdr;
    }
    throw new Error('Freighter returned an unexpected sign result');
  }, []);

  /* Connect via Freighter */
  const connect = useCallback(async () => {
    if (address) return;
    setConnecting(true);
    try {
      const isAllowed = await freighterApi.isAllowed();
      if (!isAllowed) {
        await freighterApi.setAllowed();
      }
      const pubKey = await freighterApi.getPublicKey();
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
      /* If the address was injected (not from Freighter), we still try to
         use Freighter for signing if available. */
      (async () => {
        try {
          const connected = await freighterApi.isConnected();
          if (connected) {
            setSignFn(() => freighterSign);
          }
        } catch {
          /* Freighter not available — signXDR stays null.
             Writes will fail but reads still work. */
        }
      })();
    }
  }, [address, signFn, freighterSign]);

  return {
    address,
    signXDR: signFn,
    connect,
    connecting,
  };
}