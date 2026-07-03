const { rpc } = require('@stellar/stellar-sdk');

async function check() {
  const server = new rpc.Server('https://soroban-rpc.mainnet.stellar.org');
  try {
    const res = await server.getLedgerEntries(
      rpc.getLedgerKeyForContract('CDQVUENXMPWVLDOJKAW7U3VHDOCMACBIUC7E5TIDIJXEOB4TOKT4KXOE')
    );
    console.log(res);
  } catch(e) {
    console.error(e);
  }
}
check();
