/**
 * sorobanClient.ts
 * Full Soroban RPC client for the KlassPay split_pay contract.
 *
 * Contract crate: contracts/split_pay
 * Functions:
 *   create(organizer: Address, amount: u32) — write
 *   pay(payer: Address, amount: u32)        — write
 *   get() -> BillInfo                       — read
 */
import {
  Contract,
  rpc as SorobanRpc, // <-- This is the fix! We alias the new rpc module to the old name
  TransactionBuilder,
  Networks,
  nativeToScVal,
  Address,
  xdr,
  Keypair,
  Account,
  Horizon,
} from '@stellar/stellar-sdk';
import { getContractId } from './contractRuntime';

export const DEPLOY_HINT = 'contracts/split_pay';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const BASE_FEE = '100';
const TIMEOUT_SECONDS = 30;

// SPONSOR WALLET (For Gasless FeeBump Transactions)
const SPONSOR_SECRET = 'SDMPJ34U4CVIUDFRHOUW6DAV5WAZUAXUBBTEOS55K5RPLD7ZW6SID7K6';
const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);

/** Shared RPC server instance */
function getRpcServer(): SorobanRpc.Server {
  return new SorobanRpc.Server(RPC_URL);
}

/** Ensure a contract ID is available or throw a friendly error */
function requireContract(): string {
  const id = getContractId();
  if (!id) {
    throw new Error(
      `No contract ID configured. Deploy the contract from ${DEPLOY_HINT} and set VITE_CONTRACT_ID.`,
    );
  }
  return id;
}

/** Format an RPC / simulation error into a readable string */
function formatRpcError(err: unknown): string {
  if (err instanceof Error) {
    /* Pull out nested Soroban diagnostic info when available */
    const msg = err.message;
    const match = msg.match(/HostError\(([^)]+)\)/);
    if (match) return `Soroban HostError: ${match[1]}`;
    if (msg.includes('Transaction simulation failed')) {
      return `Simulation failed: ${msg}`;
    }
    return msg;
  }
  return String(err);
}

/** Build ScVal args for contract calls */
function buildArgs(
  method: string,
  args?: Array<{ value: unknown; type: string }>,
): xdr.ScVal[] {
  if (!args || args.length === 0) return [];

  return args.map((arg) => {
    if (arg.type === 'address') {
      return new Address(arg.value as string).toScVal();
    }
    if (arg.type === 'u32') {
      return nativeToScVal(arg.value as number, { type: 'u32' });
    }
    if (arg.type === 'i128') {
      return nativeToScVal(arg.value as number, { type: 'i128' });
    }
    if (arg.type === 'string') {
      return nativeToScVal(arg.value as string, { type: 'string' });
    }
    /* Default: let the SDK infer */
    return nativeToScVal(arg.value);
  });
}

/**
 * Parse BillInfo from the contract's `get()` return value.
 */
export interface BillInfo {
  organizer: string;
  target: number;
  funded: number;
  settled: boolean;
  payers: string[];
}

function parseBillInfo(resultVal: xdr.ScVal): BillInfo {
  const map = resultVal.map();
  if (!map) throw new Error('Expected map result from get()');

  let organizer = '';
  let target = 0;
  let funded = 0;
  let settled = false;
  const payers: string[] = [];

  for (const entry of map) {
    const key = entry.key().sym().toString();
    const val = entry.val();

    switch (key) {
      case 'organizer':
        organizer = Address.fromScVal(val).toString();
        break;
      case 'target': {
        const targetRaw = val.u32?.() ?? val.i128?.();
        if (typeof targetRaw === 'number') {
          target = targetRaw;
        } else if (targetRaw !== undefined && targetRaw !== null) {
          /* i128: combine hi + lo */
          const lo = Number(targetRaw.lo().low) + Number(targetRaw.lo().high) * 2 ** 32;
          target = lo;
        }
        break;
      }
      case 'funded': {
        const fundedRaw = val.u32?.() ?? val.i128?.();
        if (typeof fundedRaw === 'number') {
          funded = fundedRaw;
        } else if (fundedRaw !== undefined && fundedRaw !== null) {
          const lo = Number(fundedRaw.lo().low) + Number(fundedRaw.lo().high) * 2 ** 32;
          funded = lo;
        }
        break;
      }
      case 'settled':
        settled = val.b?.() ?? false;
        break;
      case 'payers': {
        const vec = val.vec();
        if (vec) {
          for (const p of vec) {
            payers.push(Address.fromScVal(p).toString());
          }
        }
        break;
      }
    }
  }

  return { organizer, target, funded, settled, payers };
}

/**
 * Simulate a read-only contract call.
 * @param method  Contract function name (e.g. 'get')
 * @param source  Source account public key
 * @param args    Optional typed arguments
 */
export async function simulate(
  method: string,
  source: string,
  args?: Array<{ value: unknown; type: string }>,
): Promise<BillInfo> {
  const contractId = requireContract();
  const server = getRpcServer();
  const contract = new Contract(contractId);

  const scArgs = buildArgs(method, args);
  
  const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');
  const account = await horizonServer.loadAccount(source).catch(() => {
    /* If account doesn't exist on-chain yet, build a zero-sequence stub */
    return new Account(source, '0');
  });

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(TIMEOUT_SECONDS)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(formatRpcError(new Error(simResult.error)));
  }

  if (!SorobanRpc.Api.isSimulationSuccess(simResult)) {
    throw new Error('Simulation returned no result');
  }

  const resultVal = (simResult.result as SorobanRpc.Api.SimulateHostFunctionResult).retval;
  return parseBillInfo(resultVal);
}

/**
 * Invoke a write (state-changing) contract call.
 * Builds, simulates, signs via provided signXDR, and submits.
 * @param method   Contract function name (e.g. 'create', 'pay')
 * @param source   Source account public key
 * @param signXDR  Callback to sign the transaction XDR (from wallet)
 * @param args     Typed arguments for the call
 */
export async function invokeWrite(
  method: string,
  source: string,
  signXDR: (xdr: string) => Promise<string>,
  args?: Array<{ value: unknown; type: string }>,
): Promise<SorobanRpc.Api.GetTransactionResponse> {
  const contractId = requireContract();
  const server = getRpcServer();
  const contract = new Contract(contractId);

  const scArgs = buildArgs(method, args);
  
  // Use Horizon to fetch account (Soroban RPC testnet sometimes throws Account not found)
  const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');
  const account = await horizonServer.loadAccount(source);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(TIMEOUT_SECONDS)
    .build();

  /* Simulate to get the prepared/assembled transaction */
  const simResult = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(formatRpcError(new Error(simResult.error)));
  }

  const assembled = SorobanRpc.assembleTransaction(tx, simResult).build();
  const xdrString = assembled.toXDR('base64');

  /* Sign */
  const signedXdr = await signXDR(xdrString);
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE) as any;

  /* Level 6 Black Belt Feature: GASLESS FEE SPONSORSHIP */
  /* Wrap the user's signed transaction in a FeeBumpTransaction */
  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    sponsorKeypair,
    BASE_FEE,
    signedTx,
    NETWORK_PASSPHRASE
  );
  
  /* Sponsor pays the network fee */
  feeBumpTx.sign(sponsorKeypair);

  /* Submit the Gasless Transaction */
  const sendResult = await server.sendTransaction(feeBumpTx);

  if (sendResult.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${sendResult.errorResult?.toXDR('base64') ?? 'unknown error'}`);
  }

  /* Poll for confirmation */
  let getResult = await server.getTransaction(sendResult.hash);
  const startTime = Date.now();
  while (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    if (Date.now() - startTime > 30_000) {
      throw new Error('Transaction confirmation timed out after 30 seconds');
    }
    await new Promise((r) => setTimeout(r, 2000));
    getResult = await server.getTransaction(sendResult.hash);
  }

  if (getResult.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    throw new Error('Transaction failed on-chain. Check explorer for details.');
  }

  return getResult;
}