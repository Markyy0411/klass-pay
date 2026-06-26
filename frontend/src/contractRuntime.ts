import { useState, useEffect } from 'react';

/** Read contract ID from VITE_CONTRACT_ID env var */
export function getContractId(): string | null {
  const envId = import.meta.env.VITE_CONTRACT_ID as string | undefined;
  if (envId && envId.trim().length > 0) {
    return envId.trim();
  }
  return null;
}

/**
 * React hook that provides the active contract ID.
 * Listens for `soroban-ide:contract-id` postMessage events so the IDE
 * can inject the contract address at runtime.
 */
export function useContractId(): string | null {
  const [contractId, setContractId] = useState<string | null>(getContractId);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.type === 'soroban-ide:contract-id' &&
        typeof event.data.contractId === 'string'
      ) {
        setContractId(event.data.contractId);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return contractId;
}