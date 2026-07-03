import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Zap, Shield, ChevronRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Navbar */}
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          💸 KlassPay
        </h1>
        <button className="btn" style={{ width: 'auto', padding: '0.5rem 1.5rem', borderRadius: '20px' }} onClick={() => navigate('/app')}>
          Launch App
        </button>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'inline-block', padding: '0.3rem 1rem', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Built for APAC Stellar Hackathon
          </div>
          <h2 style={{ fontSize: '4rem', margin: '0 0 1rem 0', lineHeight: 1.1, maxWidth: '800px' }}>
            Decentralized Split Payments. <br/>
            <span style={{ color: 'var(--text-muted)' }}>Zero Gas Fees.</span>
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
            KlassPay is a trustless pooling engine built on Soroban. Easily collect funds from friends, roommates, or classmates without ever forcing them to buy XLM for gas.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/app')}>
              Get Started <ChevronRight size={20} />
            </button>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text)' }}>
                View GitHub
              </button>
            </a>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px', marginTop: '5rem' }}
        >
          <div className="card" style={{ textAlign: 'left', background: 'var(--glass-bg)' }}>
            <Zap size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3>Gasless UX</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Powered by FeeBumpTransactions. Your users never need to hold native tokens to pay their share.
            </p>
          </div>
          <div className="card" style={{ textAlign: 'left', background: 'var(--glass-bg)' }}>
            <Shield size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
            <h3>Trustless Pooling</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Funds are locked securely in a Soroban smart contract until the target goal is met.
            </p>
          </div>
          <div className="card" style={{ textAlign: 'left', background: 'var(--glass-bg)' }}>
            <Wallet size={32} color="#10B981" style={{ marginBottom: '1rem' }} />
            <h3>Fiat Integration</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Directly withdraw pooled XLM to your local e-wallet via Stellar SEP-24 Anchors.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
