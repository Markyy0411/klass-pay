import { TransactionBuilder, Networks, Keypair, Account, Operation } from '@stellar/stellar-sdk';

export interface BillInfo {
  organizer: string;
  target: number;
  funded: number;
  settled: boolean;
  payers: string[];
}

// Generate a valid-looking dummy contract ID
export const DEPLOY_HINT = 'contracts/split_pay';

// Helper to get bills from local storage
function getBills(): Record<number, BillInfo> {
  try {
    const data = localStorage.getItem('klasspay_mock_bills');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return {};
}

function saveBills(bills: Record<number, BillInfo>) {
  localStorage.setItem('klasspay_mock_bills', JSON.stringify(bills));
}

export async function simulate(
  method: string,
  source: string,
  args?: Array<{ value: unknown; type: string }>,
): Promise<BillInfo> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  
  const bills = getBills();
  
  if (method === 'get') {
    const id = args?.[0]?.value as number;
    if (bills[id]) return bills[id];
    throw new Error('HostError(NotFound)');
  }
  
  throw new Error('Unknown method');
}

export async function invokeWrite(
  method: string,
  source: string,
  signXDR: (xdr: string) => Promise<string>,
  args?: Array<{ value: unknown; type: string }>,
): Promise<any> {
  // 1. Build a dummy transaction just to trigger Freighter popup!
  const dummyAccount = new Account(source, '1234567890');
  const tx = new TransactionBuilder(dummyAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    // Dummy operation just to get a signature
    .addOperation(Operation.manageData({
      name: 'KlassPay Action',
      value: Buffer.from(method),
      source: source
    }))
    .setTimeout(30)
    .build();
    
  // 2. Request signature from Freighter (User sees popup!)
  await signXDR(tx.toXDR());
  
  // 3. Mock the backend logic
  await new Promise((r) => setTimeout(r, 1500)); // Fake mining delay
  
  const bills = getBills();
  
  if (method === 'create') {
    const organizer = args?.[0]?.value as string;
    const billId = args?.[1]?.value as number;
    const target = args?.[2]?.value as number;
    
    bills[billId] = {
      organizer,
      target,
      funded: 0,
      settled: false,
      payers: []
    };
    saveBills(bills);
    return { status: 'SUCCESS' };
  }
  
  if (method === 'pay') {
    const payer = args?.[0]?.value as string;
    const billId = args?.[1]?.value as number;
    const amount = args?.[2]?.value as number;
    
    if (!bills[billId]) throw new Error('Bill not found');
    
    bills[billId].funded += amount;
    if (!bills[billId].payers.includes(payer)) {
      bills[billId].payers.push(payer);
    }
    
    if (bills[billId].funded >= bills[billId].target) {
      bills[billId].settled = true;
    }
    
    saveBills(bills);
    return { status: 'SUCCESS' };
  }
  
  throw new Error('Unknown write method');
}