import { Keypair, rpc, TransactionBuilder, Contract, nativeToScVal, Networks } from '@stellar/stellar-sdk';

// Use native fetch (Node 18+)
// Bill ID to target (the user will edit this)
const TARGET_BILL_ID = process.argv[2] ? parseInt(process.argv[2], 10) : 757534;
const CONTRACT_ID = 'CBRIH3HBATDNMNKFGTLJ3G3WBGP4DDQTHPX7NOIFZRXRNI75V3EPWWLG';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const PASSPHRASE = Networks.TESTNET;

const server = new rpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

async function fundAccount(publicKey) {
  console.log(`Funding ${publicKey} via Friendbot...`);
  const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!res.ok) throw new Error('Friendbot failed');
}

async function payBill(keypair, billId, amount) {
  console.log(`[${keypair.publicKey()}] Preparing to pay ${amount} XLM to Bill #${billId}...`);
  const account = await server.getAccount(keypair.publicKey());
  
  const args = [
    nativeToScVal(keypair.publicKey(), { type: 'address' }),
    nativeToScVal(billId, { type: 'u32' }),
    nativeToScVal(amount, { type: 'u32' }),
  ];

  const tx = new TransactionBuilder(account, {
    fee: '10000',
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(contract.call('pay', ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }
  
  const assembled = rpc.assembleTransaction(tx, sim).build();
  assembled.sign(keypair);
  
  console.log(`[${keypair.publicKey()}] Submitting transaction...`);
  const sendRes = await server.sendTransaction(assembled);
  
  if (sendRes.status === 'ERROR') {
    throw new Error('Submit failed');
  }
  
  let status = sendRes.status;
  while (status === 'PENDING') {
    await new Promise(r => setTimeout(r, 2000));
    const txRes = await server.getTransaction(sendRes.hash);
    status = txRes.status;
    if (status === 'SUCCESS') {
      console.log(`[${keypair.publicKey()}] ✅ SUCCESS! Transaction Hash: ${sendRes.hash}`);
      return;
    }
    if (status === 'FAILED') {
      throw new Error('Transaction failed on ledger');
    }
  }
}

async function main() {
  console.log(`🚀 Starting Load Test on Bill #${TARGET_BILL_ID}...`);
  console.log(`Generating 50 users and submitting transactions. This may take 2-3 minutes.\n`);
  
  const BATCH_SIZE = 5;
  let successCount = 0;
  
  for (let i = 0; i < 50; i += BATCH_SIZE) {
    const batchPromises = [];
    for (let j = 0; j < BATCH_SIZE; j++) {
      if (i + j >= 50) break;
      const keypair = Keypair.random();
      
      const p = (async () => {
        await fundAccount(keypair.publicKey());
        await new Promise(r => setTimeout(r, 2000));
        await payBill(keypair, TARGET_BILL_ID, 1);
        successCount++;
      })().catch(e => {
        console.error(`[${keypair.publicKey()}] ❌ Failed: ${e.message}`);
      });
      
      batchPromises.push(p);
    }
    await Promise.all(batchPromises);
    console.log(`\n--- Completed ${Math.min(i + BATCH_SIZE, 50)} / 50 ---\n`);
  }
  
  console.log(`🎉 Load Test Complete! Successfully injected ${successCount} transactions into the blockchain.`);
}

main().catch(console.error);
