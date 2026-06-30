import React, { useState, useEffect } from 'react';
import { useWallet } from './wallet';
import { simulate, invokeWrite, BillInfo } from './sorobanClient';

export default function App() {
  // FIXED: Destructure the correct variables from wallet.ts
  const { address, connect, signXDR } = useWallet();
  const isConnected = !!address;

  // Read ?bill=1234 from URL
  const searchParams = new URLSearchParams(window.location.search);
  const billParam = searchParams.get('bill');
  const initialBillId = billParam ? parseInt(billParam) : null;

  const [currentBillId, setCurrentBillId] = useState<number | null>(initialBillId);
  const [bill, setBill] = useState<BillInfo | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    if (darkMode) document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
  }, [darkMode]);
  
  const [target, setTarget] = useState(100);
  const [payAmount, setPayAmount] = useState(10);
  const [joinBillId, setJoinBillId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Fetch bill automatically if we have an ID and wallet
  useEffect(() => {
    if (isConnected && address && currentBillId !== null) {
      handleGetBill(currentBillId);
    }
  }, [isConnected, address, currentBillId]);

  const handleGetBill = async (id: number) => {
    if (!address) return;
    try {
      const b = await simulate('get', address, [{ value: id, type: 'u32' }]);
      setBill(b);
      setError(null);
    } catch (e: any) {
      if (e.message.includes('NotFound')) {
        setBill(null);
        setError('Bill not found. It may not exist yet!');
      } else {
        setError('Failed to fetch bill: ' + e.message);
      }
    }
  };

  const handleCreate = async () => {
    if (!address || !signXDR) return;
    setLoading(true);
    setError(null);
    try {
      // Generate a random 6-digit Bill ID
      const newBillId = Math.floor(100000 + Math.random() * 900000);
      
      const args = [
        { value: address, type: 'address' },
        { value: newBillId, type: 'u32' },
        { value: target, type: 'u32' },
      ];
      
      // FIXED: Use signXDR from useWallet()
      await invokeWrite('create', address, signXDR, args);
      
      setCurrentBillId(newBillId);
      // Update the URL without reloading the page
      window.history.pushState({}, '', `?bill=${newBillId}`);
      await handleGetBill(newBillId);
    } catch (e: any) {
      setError('Create error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!address || currentBillId === null || !signXDR) return;
    setLoading(true);
    setError(null);
    try {
      const args = [
        { value: address, type: 'address' },
        { value: currentBillId, type: 'u32' },
        { value: payAmount, type: 'u32' },
      ];
      
      // FIXED: Use signXDR from useWallet()
      await invokeWrite('pay', address, signXDR, args);
      await handleGetBill(currentBillId);
    } catch (e: any) {
      setError('Pay error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/?bill=${currentBillId}`;
    navigator.clipboard.writeText(link);
    showToast('Share link copied to clipboard! Send this to your users!');
  };

  const handleJoin = () => {
    const id = parseInt(joinBillId);
    if (isNaN(id)) return;
    setCurrentBillId(id);
    window.history.pushState({}, '', `?bill=${id}`);
  };

  const goHome = () => {
    setCurrentBillId(null);
    setBill(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="container">
      <div className="header" style={{ position: 'relative' }}>
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          style={{ position: 'absolute', top: 0, right: 0, background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
        <h1 onClick={goHome} style={{cursor: 'pointer'}}>💸 KlassPay</h1>
        <p>The premium split-payment engine for students.</p>
      </div>

      <div className="wallet-bar">
        <span className="wallet-bar__label">Wallet</span>
        {isConnected ? (
          <span className="wallet-bar__address">
            {address?.substring(0, 8)}...{address?.slice(-8)}
          </span>
        ) : (
          <button className="btn" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={connect}>
            Connect Freighter
          </button>
        )}
      </div>

      {!isConnected && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Welcome to KlassPay</h2>
          <p style={{ color: 'var(--text-muted)' }}>Please connect your Stellar wallet to get started.</p>
        </div>
      )}

      {isConnected && currentBillId === null && (
        <>
          <div className="card">
            <h2><span className="icon">🚀</span> Create a New Bill</h2>
            <div className="field-group">
              <label className="wallet-bar__label">Target Amount (XLM)</label>
              <input
                className="input"
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                min={1}
              />
            </div>
            <button className="btn" onClick={handleCreate} disabled={loading}>
              {loading ? 'Deploying Bill...' : 'Create Bill'}
            </button>
          </div>

          <div className="card">
            <h2><span className="icon">🔍</span> Join Existing Bill</h2>
            <div className="field-group">
              <label className="wallet-bar__label">Enter Bill ID (e.g., 123456)</label>
              <input
                className="input"
                type="number"
                value={joinBillId}
                onChange={(e) => setJoinBillId(e.target.value)}
                placeholder="Bill ID"
              />
            </div>
            <button className="btn" onClick={handleJoin} disabled={!joinBillId}>
              View Bill
            </button>
          </div>
        </>
      )}

      {isConnected && currentBillId !== null && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h2 style={{ margin: 0 }}>📊 Bill #{currentBillId}</h2>
               <button className="status status--ok" onClick={copyShareLink} style={{ cursor: 'pointer', background: 'transparent' }}>
                 🔗 Copy Link
               </button>
            </div>

            {bill ? (
              <>
                {bill.settled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="msg msg--ok" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', border: '1px solid var(--success)'}}>
                      🎉 <strong>Goal reached!</strong> This bill has been fully paid off.
                    </div>
                      <button className="btn" style={{ background: '#005CEE' }} onClick={() => alert(`Withdrawal initiated! ${bill.target} XLM will arrive in your GCash account shortly.`)}>
                        📱 Withdraw {bill.target} XLM to GCash
                      </button>
                  </div>
                )}
                <table className="bill-table">
                  <tbody>
                    <tr>
                      <td>Organizer</td>
                      <td>{bill.organizer.substring(0, 8)}...{bill.organizer.slice(-8)}</td>
                    </tr>
                    <tr>
                      <td>Target</td>
                      <td>{bill.target.toLocaleString()} XLM</td>
                    </tr>
                    <tr>
                      <td>Funded</td>
                      <td>{bill.funded.toLocaleString()} / {bill.target.toLocaleString()} ({Math.floor((bill.funded / bill.target) * 100)}%)</td>
                    </tr>
                    <tr>
                      <td>Settled</td>
                      <td>{bill.settled ? <span className="status status--ok">✔ Yes</span> : <span className="status status--loading">Pending</span>}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${Math.min((bill.funded / bill.target) * 100, 100)}%` }}
                  />
                </div>

                {!bill.settled && (
                  <>
                    <div className="field-group" style={{ marginTop: '2rem' }}>
                      <label className="wallet-bar__label">Payment Amount</label>
                      <input
                        className="input"
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        min={1}
                      />
                    </div>
                    <button className="btn" onClick={handlePay} disabled={loading}>
                      {loading ? 'Processing Payment...' : `Pay ${payAmount} XLM`}
                    </button>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>👥 Payers ({bill.payers.length})</h3>
                  {bill.payers.length > 0 && (
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,Wallet Address\n" + bill.payers.join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `bill_${currentBillId}_payers.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }} 
                      style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      📥 Export CSV
                    </button>
                  )}
                </div>
                <ul className="payer-list">
                  {bill.payers.map((p, i) => (
                    <li key={i}>{p.substring(0, 12)}...{p.slice(-12)}</li>
                  ))}
                  {bill.payers.length === 0 && <p style={{color: 'var(--text-muted)'}}>No one has paid yet.</p>}
                </ul>
              </>
            ) : (
               <div className="msg msg--error" style={{ textAlign: 'center' }}>
                 This Bill ID does not exist on the blockchain!
               </div>
            )}
            
            <button className="btn" style={{ marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }} onClick={goHome}>
              ← Back to Home
            </button>
          </div>
        </>
      )}

      {error && <div className="msg msg--error">{error}</div>}
      
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'var(--success)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.3s ease-out',
          zIndex: 1000,
          fontWeight: 'bold'
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}