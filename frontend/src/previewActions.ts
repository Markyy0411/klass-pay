export type Status = 'idle' | 'loading' | 'error' | 'ok' | 'setup';

/** Log a user-facing action to the console (and optionally to an IDE channel) */
export function logAction(
  action: string,
  detail?: Record<string, unknown>,
): void {
  const timestamp = new Date().toISOString();
  console.log(`[KlassPay ${timestamp}] ${action}`, detail ?? '');

  /* Forward to Soroban IDE if embedded */
  try {
    window.parent.postMessage(
      { type: 'soroban-ide:log', action, detail, timestamp },
      '*',
    );
  } catch {
    /* not embedded — ignore */
  }
}

/**
 * Guard that throws a user-friendly error if the wallet is not connected.
 * Returns the address when connected.
 */
export function ensureConnected(address: string | null): string {
  if (!address) {
    throw new Error('Wallet not connected. Please connect your wallet first.');
  }
  return address;
}

/**
 * Converts a contract/RPC error into a human-readable status message.
 * Returns a tuple of [status, message].
 */
export function applyContractError(
  err: unknown,
): { status: Status; message: string } {
  if (err instanceof Error) {
    const msg = err.message;

    /* Contract not deployed or not found */
    if (
      msg.includes('not found') ||
      msg.includes('CONTRACT_NOT_FOUND') ||
      msg.includes('missing') ||
      msg.includes('No contract ID')
    ) {
      return {
        status: 'setup',
        message: `Contract not deployed. Deploy from: contracts/split_pay`,
      };
    }

    /* Simulation-specific errors */
    if (msg.includes('simulation') || msg.includes('HostError')) {
      return {
        status: 'error',
        message: `Contract error: ${msg}`,
      };
    }

    return { status: 'error', message: msg };
  }

  return { status: 'error', message: String(err) };
}