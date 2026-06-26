import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from './wallet';
import { useContractId } from './contractRuntime';
import { simulate, invokeWrite, BillInfo } from './sorobanClient';
import { logAction, ensureConnected, applyContractError, Status } from './previewActions';

const DEPLOY_HINT = 'contracts/split_pay';

const App: React.FC = () => {
  const { address, signXDR, connect, connecting } = useWallet();
  const contractId = useContractId();

  /* ── UI State ── */
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [billInfo, setBillInfo] = useState<BillInfo | null>(null);

  /* Create Bill form */
  const [createAmount, setCreateAmount] = useState('');

  /* Pay Share form */
  const [payAmount, setPayAmount] = useState('');

  /* ── Load bill info on mount / when contract or address changes ── */
  const loadBill = useCallback(async () => {
    if (!contractId || !address) return;

    setStatus('loading');
    setMessage('');
    logAction('simulate:get', { address, contractId });

    try {
      const info = await simulate('get', address);
      setBillInfo(info);
      setStatus('ok');
      setMessage('Bill loaded');
      logAction('simulate:get:ok', { info });
    } catch (err) {
      const result = applyContractError(err);
      setStatus(result.status);
      setMessage(result.message);
      setBillInfo(null);
      logAction('simulate:get:error', { error: result.message });
    }
  }, [contractId, address]);

  useEffect(() => {
    loadBill();
  }, [loadBill]);

  /* ── Create Bill Handler ── */
  /* Maps to: create(organizer: Address, amount: u32) — write */
  const handleCreate = async () => {
    try {
      const addr = ensureConnected(address);
      if (!signXDR) throw new Error('Wallet signer not available. Connect Freighter.');
      const amount = parseInt(createAmount, 10);
      if (isNaN(amount) || amount <= 0) throw new Error('Enter a valid amount greater than 0');

      setStatus('loading');
      setMessage('Creating bill…');
      logAction('invokeWrite:create', { organizer: addr, amount });

      await invokeWrite('create', addr, signXDR, [
        { value: addr, type: 'address' },
        { value: amount, type: 'u32' },
      ]);

      setStatus('ok');
      setMessage(`Bill created for ${amount} units`);
      setCreateAmount('');
      logAction('invokeWrite:create:ok', { amount });

      /* Refresh bill state */
      await loadBill();
    } catch (err) {
      const result = applyContractError(err);
      setStatus(result.status);
      setMessage(result.message);
      logAction('invokeWrite:create:error', { error: result.message });
    }
  };

  /* ── Pay Share Handler ── */
  /* Maps to: pay(payer: Address, amount: u32) — write */
  const handlePay = async () => {
    try {
      const addr = ensureConnected(address);
      if (!signXDR) throw new Error('Wallet signer not available. Connect Freighter.');
      const amount = parseInt(payAmount, 10);
      if (isNaN(amount) || amount <= 0) throw new Error('Enter a valid amount greater than 0');

      setStatus('loading');
      setMessage('Submitting payment…');
      logAction('invokeWrite:pay', { payer: addr, amount });

      await invokeWrite('pay', addr, signXDR, [
        { value: addr, type: 'address' },
        { value: amount, type: 'u32' },
      ]);

      setStatus('ok');
      setMessage(`Paid ${amount} units`);
      setPayAmount('');
      logAction('invokeWrite:pay:ok', { amount });

      /* Refresh bill state */
      await loadBill();
    } catch (err) {
      const result = applyContractError(err);
      setStatus(result.status);
      setMessage(result.message);
      logAction('invokeWrite:pay:error', { error: result.message });
    }
  };

  /* ── Wallet connect ── */
  const handleConnect = async () => {
    try {
      setStatus('loading');
      setMessage('Connecting wallet…');
      logAction('wallet:connect');
      await connect();
      setStatus('ok');
      setMessage('Wallet connected');
      logAction('wallet:connect:ok');
    } catch (err) {
      const result = applyContractError(err);
      setStatus(result.status);
      setMessage(result.message);
      logAction('wallet:connect:error', { error: result.message });
    }
  };

  /* ── Computed values ── */
  const progressPct =
    billInfo && billInfo.target > 0
      ? Math.min(100, Math.round((billInfo.funded / billInfo.target) * 100))
      : 0;

  const isLoading = status === 'loading';
  const showSetup = status === 'setup';

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>💸 KlassPay</h1>
        <p>Campus split billing for Filipino college students</p>
      </header>

      {/* Status Badge */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span className={`status status--${status}`}>
          {status === 'idle' && '● Idle'}
          {status === 'loading' && '◌ Loading…'}
          {status === 'ok' && '✓ Ready'}
          {status === 'error' && '✕ Error'}
          {status === 'setup' && '⚙ Setup Required'}
        </span>
      </div>

      {/* Wallet Bar */}
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

      {/* Setup Hint */}
      {showSetup && (
        <div className="card">
          <h2><span className="icon">⚙</span> Deploy Contract</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
            No contract found. Deploy <strong>{DEPLOY_HINT}</strong> via Soroban IDE
            and set <code style={{ color: '#a78bfa' }}>VITE_CONTRACT_ID</code> in your{' '}
            <code style={{ color: '#a78bfa' }}>.env</code> file.
          </p>
        </div>
      )}

      {/* ── Create Bill Section ── */}
      {/* Maps to: create(organizer: Address, amount: u32) — write */}
      <div className="card">
        <h2><span className="icon">📝</span> Create Bill</h2>
        <div className="field-group">
          <input
            id="input-create-amount"
            className="input"
            type="number"
            min="1"
            placeholder="Target amount (u32)"
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

      {/* ── Pay Share Section ── */}
      {/* Maps to: pay(payer: Address, amount: u32) — write */}
      <div className="card">
        <h2><span className="icon">💰</span> Pay Share</h2>
        <div className="field-group">
          <input
            id="input-pay-amount"
            className="input"
            type="number"
            min="1"
            placeholder="Payment amount (u32)"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button
          id="btn-pay-share"
          className="btn btn--secondary"
          onClick={handlePay}
          disabled={isLoading || !address || !contractId}
        >
          {isLoading ? '⏳ Processing…' : 'Pay Share'}
        </button>
      </div>

      {/* ── Bill Status Section ── */}
      {/* Maps to: get() -> BillInfo { organizer, target, funded, settled, payers } — read */}
      <div className="card">
        <h2>
          <span className="icon">📊</span> Bill Status
          {billInfo && (
            <button
              id="btn-refresh-bill"
              className="btn"
              style={{
                marginLeft: 'auto',
                width: 'auto',
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
              }}
              onClick={loadBill}
              disabled={isLoading}
            >
              ↻ Refresh
            </button>
          )}
        </h2>

        {billInfo ? (
          <>
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
                    <span
                      className={`settled-badge ${
                        billInfo.settled ? 'settled-badge--yes' : 'settled-badge--no'
                      }`}
                    >
                      {billInfo.settled ? '✓ Yes' : '○ No'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Progress Bar */}
            <div className="progress-bar">
              <div
                className="progress-bar__fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Payers */}
            <h2 style={{ marginTop: '1rem' }}>
              <span className="icon">👥</span> Payers ({billInfo.payers.length})
            </h2>
            {billInfo.payers.length > 0 ? (
              <ul className="payer-list">
                {billInfo.payers.map((payer, i) => (
                  <li key={i}>
                    {payer.slice(0, 8)}…{payer.slice(-8)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No payments yet</p>
            )}
          </>
        ) : (
          <p className="empty-state">
            {contractId
              ? 'No bill data loaded. Create a bill or refresh.'
              : 'Set VITE_CONTRACT_ID to view bill status.'}
          </p>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`msg ${
            status === 'error' || status === 'setup' ? 'msg--error' : 'msg--ok'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default App;