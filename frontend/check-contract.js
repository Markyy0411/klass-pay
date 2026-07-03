import { Contract } from '@stellar/stellar-sdk';
try {
  new Contract('CDQVUENXMPWVLDOJKAW7U3VHDOCMACBIUC7ESTIDIJXEOB4TOKT4KXOE');
  console.log('Valid');
} catch (e) {
  console.log('Error:', e.message);
}
