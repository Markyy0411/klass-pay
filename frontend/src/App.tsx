import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from './wallet';
import { useContractId } from './contractRuntime';
import { simulate, invokeWrite, BillInfo } from './sorobanClient';
import { logAction, ensureConnected, applyContractError, Status } from './previewActions';
import './ui.css'; // <--- THIS WAS THE MISSING LINE!

const DEPLOY_HINT = 'contracts/klass-pay';

const App: React.FC = () => {
  const { address, signXDR, connect, connecting } = useWallet();
  const contractId = useContractId();

  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [billInfo, setBillInfo] = useState<BillInfo | null>(null);

  const [createAmount, setCreateAmount] = useState('');
  const [payAmount, setPayAmount] = useState('');

  const loadBill = useCallback(async () => {
    if (!contractId || !address) return;
    setStatus('loading');
    setMessage('');
    try {
      const info = await simulate('get', address);
      setBillInfo(info);
      setStatus('ok');
      setMessage('Bill loaded');
    } catch (err) {
      const result = applyContractError(err);
      setStatus(result.status);
      if (result.message.includes('#2') || result.message.includes('NotFound')) {
        setMessage('No active bill. You can create one!');
        setStatus('ok');
      } else {
        setMessage(result.message);
      }
      setBillInfo(null);
    }
  }, [contractId, address]);

  useEffect(() => {
    loadBill();
  }, [loadBill]);

  const handleCreate = async () => {
    try {
      const addr = ensureConnected(address);
      if (!signXDR) throw new Error('Wallet signer not available. Connect Freighter.');
      const amount = parseInt(createAmount, 10);
      if (isNaN(amount) || amount <= 0) throw new Error('Enter a valid amount greater than 0');

      setStatus('loading');
      setMessage('Creating bill… please approve in wallet.');
      await invokeWrite('create', addr, signXDR, [
        { value: addr, type: 'address' },
        { value: amount, type: 'u32' },
      ]);
      setStatus('ok');
      setMessage(`Bill created for ${amount} units!`);
      setCreateAmount('');
      await loadBill();
    } catch (err) {
      const result = applyContractError(err);
      setStatus(result.status);
      setMessage(result.message);
    }
  };

  const handlePay = async () => {
    try {
      const addr = ensureConnected(address);
      if (!signXDR) throw new Error('Wallet signer not available. Connect Freighter.');
      const amount = parseInt(payAmount, 10);
      if (isNaN(amount) || amount <= 0) throw new Error('Enter a valid amount greater than 0');
      
      if (billInfo && (billInfo.funded + amount > billInfo.target)) {
         throw new Error(`Amount too high! Only ${billInfo.target - billInfo.funded} remaining.`);
      }

      setStatus('loading');
      setMessage('Submitting payment… please approve in wallet.');
      await invokeWrite('pay', addr, signXDR, [
        { value: addr, type: 'address' },
        { value: amount, type: 'u32' },
      ]);
      setStatus('ok');
      setMessage(`Successfully paid ${amount} units!`);
      setPayAmount('');
      await loadBill();
    } catch (err) {
      const result = applyContractError(err);
      setStatus(result.status);
      setMessage(result.message);
    }
  };

  const handleConnect = async () => {
    try {
      setStatus('loading');
      setMessage('Connecting wallet…');
      await connect();
      setStatus('ok');
      setMessage('Wallet connected!');
    } catch (err) {
      const result = applyContractError(err);
      setStatus(result.status);
      setMessage(result.message);
    }
  };

  const progressPct = billInfo && billInfo.target > 0
      ? Math.min(100, Math.round((billInfo.funded / billInfo.target) * 100))
      : 0;

  const isLoading = status === 'loading';
  const showSetup = status === 'setup';
  
  const hasBill = billInfo !== null;
  const isSettled = billInfo?.settled === true;

  return (
    <div className="container">
      <header className="header">
        <h1>💸 KlassPay</h1>
        <p>Campus split billing for Filipino college students</p>
      </header>
      
      {!address ? (
        <div className="tutorial-banner">
          <h3>Welcome to KlassPay! 👋</h3>
          <p>This app lets you easily split bills with your classmates using the Stellar blockchain.</p>
          <p><strong>Step 1:</strong> Connect your Freighter wallet to get started.</p>
        </div>
      ) : (
        <div className="tutorial-banner">
          {hasBill ? (
            isSettled ? (
              <p>🎉 <strong>Goal reached!</strong> This bill has been fully paid off.</p>
            ) : (
              <p>💰 <strong>Step 3: Pay Shares.</strong> A bill is currently active! Enter your contribution below to pay your share.</p>
            )
          ) : (
            <p>📝 <strong>Step 2: Create a Bill.</strong> There are no active bills right now. Create one below to start collecting funds!</p>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span className={`status status--${status}`}>
          {status === 'idle' && '● Idle'}
          {status === 'loading' && '◌ Loading…'}
          {status === 'ok' && '✓ Ready'}
          {status === 'error' && '✕ Error'}
          {status === 'setup' && '⚙ Setup Required'}
        </span>
      </div>

      {address ? (
        <div className="wallet-bar">
          <span className="wallet-bar__label">Wallet</span>
          <span className="wallet-bar__address">
            {address.slice(0, 8)}…{address.slice(-8)}
          </span>
        </div>
      ) : (
        <div className="card">
          <h2><span className="icon">🔗</span> Connect Wallet</h2>
          <button
            id="btn-connect-wallet"
            className="btn"
            onClick={handleConnect}
            disabled={connecting || isLoading}
          >
            {connecting ? 'Connecting…' : 'Connect Freighter'}
          </button>
        </div>
      )}

      {showSetup && (
        <div className="card">
          <h2><span className="icon">⚙</span> Deploy Contract</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
            No contract found. Deploy <strong>{DEPLOY_HINT}</strong> via Soroban IDE
            and set <code style={{ color: '#a78bfa' }}>VITE_CONTRACT_ID</code> in your <code style={{ color: '#a78bfa' }}>.env</code> file.
          </p>
        </div>
      )}

      {address && !hasBill && !showSetup && (
        <div className="card">
          <h2><span className="icon">📝</span> Create a New Bill</h2>
          <p className="helper-text">Set the total amount you need to collect from the group.</p>
          <div className="field-group">
            <input
              id="input-create-amount"
              className="input"
              type="number"
              min="1"
              placeholder="e.g. 5000"
              value={createAmount}
              onChange={(e) => setCreateAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            id="btn-create-bill"
            className="btn"
            onClick={handleCreate}
            disabled={isLoading || !address || !contractId}
          >
            {isLoading ? '⏳ Processing…' : 'Create Bill'}
          </button>
        </div>
      )}

      {address && hasBill && !isSettled && (
        <div className="card">
          <h2><span className="icon">💰</span> Pay Your Share</h2>
          <p className="helper-text">Enter the amount you want to contribute. Only {billInfo!.target - billInfo!.funded} units left!</p>
          <div className="field-group">
            <input
              id="input-pay-amount"
              className="input"
              type="number"
              min="1"
              max={billInfo!.target - billInfo!.funded}
              placeholder={`Remaining: ${billInfo!.target - billInfo!.funded}`}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            id="btn-pay-share"
            className="btn"
            onClick={handlePay}
            disabled={isLoading || !address || !contractId}
          >
            {isLoading ? '⏳ Processing…' : 'Pay Share'}
          </button>
        </div>
      )}

      {hasBill && (
        <div className="card">
          <h2>
            <span className="icon">📊</span> Bill Status
            <button
              id="btn-refresh-bill"
              className="btn"
              style={{ marginLeft: 'auto', width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
              onClick={loadBill}
              disabled={isLoading}
            >
              ↻ Refresh
            </button>
          </h2>

          <table className="bill-table">
            <tbody>
              <tr>
                <td>Organizer</td>
                <td>{billInfo.organizer.slice(0, 8)}…{billInfo.organizer.slice(-8)}</td>
              </tr>
              <tr>
                <td>Target</td>
                <td>{billInfo.target.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Funded</td>
                <td>
                  {billInfo.funded.toLocaleString()} / {billInfo.target.toLocaleString()}
                  {' '}({progressPct}%)
                </td>
              </tr>
              <tr>
                <td>Settled</td>
                <td>
                  <span className={`status ${billInfo.settled ? 'status--ok' : 'status--loading'}`}>
                    {billInfo.settled ? '✓ Yes' : '○ No'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${progressPct}%` }} />
          </div>

          <h2 style={{ marginTop: '2rem' }}>
            <span className="icon">👥</span> Payers ({billInfo.payers.length})
          </h2>
          {billInfo.payers.length > 0 ? (
            <ul className="payer-list">
              {billInfo.payers.map((payer, i) => (
                <li key={i}>{payer.slice(0, 8)}…{payer.slice(-8)}</li>
              ))}
            </ul>
          ) : (
            <p className="helper-text">No payments yet</p>
          )}
        </div>
      )}

      {message && (
        <div className={`msg ${status === 'error' || status === 'setup' ? 'msg--error' : 'msg--ok'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default App;