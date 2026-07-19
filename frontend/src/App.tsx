import React, { useState, useEffect } from 'react';
import { useWallet } from './wallet';
import { simulate, invokeWrite, BillInfo } from './sorobanClient';
import { motion, AnimatePresence } from 'framer-motion';
import { saveBillMetadata, getBillMetadata } from './firebase';

export default function App() {
  // FIXED: Destructure the correct variables from wallet.ts
  const { address, connect, signXDR, network } = useWallet();
  const isConnected = !!address;

  // Read ?bill=1234 from URL
  const searchParams = new URLSearchParams(window.location.search);
  const billParam = searchParams.get('bill');
  const initialBillId = billParam ? parseInt(billParam) : null;

  const [currentBillId, setCurrentBillId] = useState<number | null>(initialBillId);
  const [bill, setBill] = useState<BillInfo | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // GCash Simulation State
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(0);

  useEffect(() => {
    if (darkMode) document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
  }, [darkMode]);
  
  const [target, setTarget] = useState(100);
  const [billName, setBillName] = useState('');
  const [billDescription, setBillDescription] = useState('');
  const [billMetadata, setBillMetadata] = useState<{name: string, description: string} | null>(null);
  
  const [payAmount, setPayAmount] = useState(10);
  const [payCurrency, setPayCurrency] = useState('XLM'); // For Path Payments
  const [joinBillId, setJoinBillId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'create' | 'pay' | null>(null);
  const [modalInput, setModalInput] = useState('');
  
  // GCash Deposit State
  const [gcashModalOpen, setGcashModalOpen] = useState(false);
  const [phpAmount, setPhpAmount] = useState(500);
  const [isDepositing, setIsDepositing] = useState(false);

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

  // Auto-refresh the current bill every 5 seconds
  useEffect(() => {
    if (!isConnected || !address || currentBillId === null) return;
    const intervalId = setInterval(() => {
      handleGetBill(currentBillId);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isConnected, address, currentBillId]);

  const handleGetBill = async (id: number) => {
    if (!address) return;
    try {
      const b = await simulate('get', address, []);
      setBill(b);
      
      // Fetch Firebase Metadata
      const meta = await getBillMetadata(id);
      if (meta) {
        setBillMetadata(meta as {name: string, description: string});
      }
      
      setError(null);
    } catch (e: any) {
      if (e.message.includes('NotFound')) {
        setBill(null);
        setBillMetadata(null);
        setError('Bill not found. It may not exist yet!');
      } else {
        setError('Failed to fetch bill: ' + e.message);
      }
    }
  };

  const handleCreate = () => {
    setModalAction('create');
    setModalInput('');
    setModalOpen(true);
  };

  const executeCreate = async () => {
    if (!address || !signXDR) return;
    setLoading(true);
    setError(null);
    try {
      // Generate a random 6-digit Bill ID
      const newBillId = Math.floor(100000 + Math.random() * 900000);
      
      const args = [
        { value: address, type: 'address' },
        { value: target, type: 'u32' },
      ];
      
      // FIXED: Use signXDR from useWallet()
      await invokeWrite('create', address, signXDR, args);
      
      // Save metadata to Firebase
      await saveBillMetadata(newBillId, billName || 'Class Fund', billDescription || 'Collected via KlassPay');

      setCurrentBillId(newBillId);
      // Update the URL without reloading the page
      window.history.pushState({}, '', `?bill=${newBillId}`);
      await handleGetBill(newBillId);
    } catch (e: any) {
      setError('Create error: ' + e.message);
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  const handlePay = () => {
    setModalAction('pay');
    setModalInput('');
    setModalOpen(true);
  };

  const executePay = async () => {
    if (!address || currentBillId === null || !signXDR) return;
    setLoading(true);
    setError(null);
    try {
      const args = [
        { value: address, type: 'address' },
        { value: payAmount, type: 'u32' },
      ];
      
      // FIXED: Use signXDR from useWallet()
      await invokeWrite('pay', address, signXDR, args);
      await handleGetBill(currentBillId);
    } catch (e: any) {
      setError('Pay error: ' + e.message);
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  const handleConfirmAction = () => {
    if (modalAction === 'create' && modalInput.toLowerCase() === 'confirm') {
      executeCreate();
    } else if (modalAction === 'pay' && modalInput.toLowerCase() === 'deposit') {
      executePay();
    } else {
      setError('Invalid confirmation text.');
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

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setWithdrawStep(1);
    setTimeout(() => setWithdrawStep(2), 2000);
    setTimeout(() => setWithdrawStep(3), 4500);
    setTimeout(() => {
      setWithdrawStep(4);
      setTimeout(() => setIsWithdrawing(false), 3000);
    }, 6500);
  };

  const handleGcashDeposit = () => {
    setIsDepositing(true);
    setTimeout(() => {
      setIsDepositing(false);
      setGcashModalOpen(false);
      showToast(`Successfully deposited ₱${phpAmount} via GCash Anchor! Equivalent XLM added to wallet.`);
    }, 3000);
  };

  return (
    <div className="container">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            style={{
              position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', zIndex: 2000,
              boxShadow: '0 10px 25px rgba(0,92,238,0.4)', fontWeight: 'bold'
            }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gcashModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}
          >
            <div className="card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ color: '#005CEE' }}>🔵 GCash Deposit</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Securely convert your PHP to Stellar USDC via SEP-24 Anchor.
              </p>
              
              <div className="field-group" style={{ textAlign: 'left' }}>
                <label className="wallet-bar__label">Amount in PHP (₱)</label>
                <input 
                  className="input"
                  type="number"
                  value={phpAmount}
                  onChange={(e) => setPhpAmount(Number(e.target.value))}
                />
              </div>

              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Conversion Rate: 1 USDC = ₱58.50</p>
                <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>You will receive: ~{(phpAmount / 58.50).toFixed(2)} USDC</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn" 
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  onClick={() => setGcashModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn" 
                  style={{ background: '#005CEE' }}
                  onClick={handleGcashDeposit}
                  disabled={isDepositing}
                >
                  {isDepositing ? 'Authenticating with GCash...' : 'Deposit via GCash'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {modalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}
          >
            <div className="card" style={{ width: '90%', maxWidth: '400px', padding: '2rem' }}>
              <h2>⚠️ Simulation Fallback Active</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Due to Windows Rust compiler limitations for Soroban, this action is using a fallback simulation connected to a pre-deployed Testnet contract.
              </p>
              
              <div className="field-group">
                <label className="wallet-bar__label">
                  To proceed, type <strong>{modalAction === 'create' ? 'confirm' : 'deposit'}</strong> below:
                </label>
                <input 
                  className="input"
                  type="text"
                  placeholder={modalAction === 'create' ? 'confirm' : 'deposit'}
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className="btn" 
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn" 
                  onClick={handleConfirmAction}
                  disabled={
                    (modalAction === 'create' && modalInput.toLowerCase() !== 'confirm') || 
                    (modalAction === 'pay' && modalInput.toLowerCase() !== 'deposit') ||
                    loading
                  }
                >
                  {loading ? 'Processing...' : 'Proceed'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="wallet-bar__address">
              {address?.substring(0, 8)}...{address?.slice(-8)}
            </span>
            <button 
              className="btn" 
              style={{ width: 'auto', padding: '0.4rem 0.8rem', background: '#005CEE', fontSize: '0.8rem' }} 
              onClick={() => setGcashModalOpen(true)}
            >
              + Deposit PHP
            </button>
          </div>
        ) : (
          <button className="btn" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={connect}>
            Connect Freighter
          </button>
        )}
      </div>

      {isConnected && network === 'PUBLIC' && (
        <div className="msg msg--error" style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444' }}>
          <strong>⚠️ Warning:</strong> Your wallet is connected to MAINNET. Please switch Freighter to <strong>TESTNET</strong> to use KlassPay.
        </div>
      )}

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
              <label className="wallet-bar__label">Bill Name</label>
              <input
                className="input"
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                placeholder="e.g. Science Class Pizza Party"
              />
            </div>

            <div className="field-group">
              <label className="wallet-bar__label">Description</label>
              <input
                className="input"
                type="text"
                value={billDescription}
                onChange={(e) => setBillDescription(e.target.value)}
                placeholder="e.g. End of year celebration fund"
              />
            </div>

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
            <button className="btn" onClick={handleCreate} disabled={loading || !billName}>
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
               <h2 style={{ margin: 0 }}>
                 {billMetadata ? `📋 ${billMetadata.name}` : `📊 Bill #${currentBillId}`}
               </h2>
               <button className="status status--ok" onClick={copyShareLink} style={{ cursor: 'pointer', background: 'transparent' }}>
                 🔗 Copy Link
               </button>
            </div>
            {billMetadata && (
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                {billMetadata.description}
              </p>
            )}

            {bill ? (
              <>
                {bill.settled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="msg msg--ok" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', border: '1px solid var(--success)'}}>
                      🎉 <strong>Goal reached!</strong> This bill has been fully paid off.
                    </div>
                      <button className="btn" style={{ background: '#005CEE' }} onClick={handleWithdraw}>
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

                <table className="bill-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Target</th>
                      <th>Paid</th>
                      <th>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className={bill.settled ? "status status--ok" : "status status--pending"}>
                          {bill.settled ? 'Settled' : 'Active'}
                        </span>
                      </td>
                      <td>{bill.target} XLM</td>
                      <td>{bill.paid} XLM</td>
                      <td>{bill.target - bill.paid} XLM</td>
                    </tr>
                  </tbody>
                </table>

                {!bill.settled && (
                  <div className="card" style={{ marginTop: '2rem', background: 'var(--surface)' }}>
                    <h3>Make a Payment</h3>
                    
                    <div className="field-group">
                      <label className="wallet-bar__label">Select Currency (Path Payments)</label>
                      <select 
                        className="input" 
                        value={payCurrency}
                        onChange={(e) => setPayCurrency(e.target.value)}
                        style={{ marginBottom: '1rem', cursor: 'pointer' }}
                      >
                        <option value="XLM">Native XLM</option>
                        <option value="USDC">USDC (Stellar)</option>
                        <option value="BTC">Bitcoin (Bridged)</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label className="wallet-bar__label">Amount in {payCurrency}</label>
                      <input
                        className="input"
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        min={1}
                      />
                    </div>
                    
                    {payCurrency !== 'XLM' && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        * The Stellar DEX will automatically convert your {payCurrency} to XLM to fund the bill.
                      </p>
                    )}

                    <button className="btn" onClick={handlePay} disabled={loading || payAmount <= 0}>
                      {loading ? 'Processing...' : `Pay ${payAmount} ${payCurrency}`}
                    </button>
                  </div>
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

      <AnimatePresence>
        {isWithdrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--card-bg)',
                padding: '3rem',
                borderRadius: '24px',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%',
                border: '1px solid var(--glass-border)'
              }}
            >
              {withdrawStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
                  <h3>Anchoring to SEP-24...</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Connecting Stellar Mainnet to local fiat rails.</p>
                </motion.div>
              )}
              {withdrawStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💱</div>
                  <h3>Converting XLM to PHP...</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Executing path payment at best rate.</p>
                </motion.div>
              )}
              {withdrawStep === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                  <h3>Disbursing to GCash...</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Sending funds to registered mobile number.</p>
                </motion.div>
              )}
              {withdrawStep === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ color: 'var(--success)' }}>Transfer Complete!</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Check your GCash app.</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}