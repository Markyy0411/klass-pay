/**
 * wallet.ts
 * Provides the useWallet() hook — resolves the user's Stellar address from
 * VITE_WALLET_ADDRESS env, Soroban IDE postMessage, or Freighter extension.
 */
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
    // Vercel's version of Freighter requires BOTH of these network settings
    const result = await freighterApi.signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: 'Test SDF Network ; September 2015',
    } as any);

    if (typeof result === 'string') {
      if (!result || result.includes('error')) throw new Error(result);
      return result;
    }
    
    if (typeof result === 'object' && result !== null) {
      if ('error' in result && (result as any).error) {
        throw new Error((result as any).error);
      }
      if ('signedTxXdr' in result && typeof (result as any).signedTxXdr === 'string' && (result as any).signedTxXdr.length > 0) {
        return (result as any).signedTxXdr;
      }
    }
    throw new Error('Freighter returned an empty or invalid signature.');
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
      (async () => {
        try {
          const connected = await freighterApi.isConnected();
          if (connected) {
            setSignFn(() => freighterSign);
          }
        } catch {
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