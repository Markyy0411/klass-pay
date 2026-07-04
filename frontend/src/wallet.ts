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
  network: string | null;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [signFn, setSignFn] = useState<((xdr: string) => Promise<string>) | null>(null);
  const [connecting, setConnecting] = useState(false);

  const [network, setNetwork] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        if (await freighterApi.isConnected()) {
          const net = await freighterApi.getNetworkDetails();
          setNetwork(net.network);
        }
      } catch (e) {
        // Ignore
      }
    };
    if (address) {
      fetchNetwork();
    }
  }, [address]);

   /* Freighter signTransaction wrapper */
  const freighterSign = useCallback(async (xdr: string): Promise<string> => {
    let activeNetwork = 'PUBLIC';
    let passphrase = 'Public Global Stellar Network ; September 2015';
    
    try {
      const net = await freighterApi.getNetworkDetails();
      if (net.network === 'TESTNET') {
        activeNetwork = 'TESTNET';
        passphrase = 'Test SDF Network ; September 2015';
      }
    } catch(e) {}

    const result = await freighterApi.signTransaction(xdr, {
      network: activeNetwork,
      networkPassphrase: passphrase,
    } as any);

    if (typeof result === 'string') {
      if (!result || result.includes('error')) throw new Error(result);
      return result;
    }
    
    if (typeof result === 'object' && result !== null) {
      if ('error' in result && (result as any).error) {
        const errObj = (result as any).error;
        const msg = typeof errObj === 'string' ? errObj : (errObj.message || "Transaction declined");
        throw new Error(msg);
      }
      if ('signedTxXdr' in result && typeof (result as any).signedTxXdr === 'string' && (result as any).signedTxXdr.length > 0) {
        return (result as any).signedTxXdr;
      }
    }
    throw new Error('Freighter returned an empty or invalid signature.');
  }, []);

  /* Connect via Freighter (Supports BOTH new and old API versions) */
  const connect = useCallback(async () => {
    if (address) return;
    setConnecting(true);
    try {
      let pubKey = '';
      
      if (typeof freighterApi.requestAccess === 'function') {
        // New Freighter v6 standard
        const result = await freighterApi.requestAccess();
        if (typeof result === 'string') {
          pubKey = result;
        } else if (result && typeof result === 'object') {
          if ((result as any).error) throw new Error((result as any).error);
          pubKey = (result as any).address;
        }
      } else if (typeof (freighterApi as any).getPublicKey === 'function') {
        // Fallback for older versions
        const isAllowed = await freighterApi.isAllowed();
        if (!isAllowed) await freighterApi.setAllowed();
        pubKey = await (freighterApi as any).getPublicKey();
      } else {
        throw new Error('Freighter wallet API not found. Please install the extension.');
      }

      if (pubKey) {
        setAddress(pubKey);
        setSignFn(() => freighterSign);
      }
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

  // ... earlier code ...

  return {
    address,
    signXDR: signFn,
    connect,
    connecting,
    network,
  };
}