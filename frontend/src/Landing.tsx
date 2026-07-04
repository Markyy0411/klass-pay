import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Zap, Shield, ChevronRight, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ Name: '', Email: '', Message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    
    try {
      const url = 'https://script.google.com/macros/s/AKfycbxBhXHyJt1_oh2KXvnNrasHn19CKDU9MTSlnVltZAeS__gZCwsB_YCsBD1uwhqyAKtP/exec';
      const formBody = new URLSearchParams();
      formBody.append('Name', formData.Name);
      formBody.append('Email', formData.Email);
      formBody.append('Message', formData.Message);

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });
      
      setStatus('Message Sent!');
      setFormData({ Name: '', Email: '', Message: '' });
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error sending message.');
    }
  };

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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: '2rem' }}
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

        {/* The Problem Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%', maxWidth: '1000px', marginTop: '8rem', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <AlertTriangle size={36} color="#EF4444" />
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>The Problem</h2>
          </div>
          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
              Collecting money for group projects, trips, or class funds is a nightmare. 
            </p>
            <ul style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.8, paddingLeft: '1.5rem', margin: 0 }}>
              <li><strong>The Awkwardness:</strong> Constantly reminding friends to pay you back ruins relationships.</li>
              <li><strong>The Mess:</strong> Tracking who paid via messy spreadsheets leads to lost funds and confusion.</li>
              <li><strong>The Crypto Friction:</strong> Traditional Web3 payment splits force non-crypto native friends to figure out how to buy native tokens just to pay for network gas fees.</li>
            </ul>
          </div>
        </motion.div>

        {/* The Solution Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%', maxWidth: '1000px', marginTop: '6rem', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <CheckCircle size={36} color="#10B981" />
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>The KlassPay Solution</h2>
          </div>
          <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
              We rebuilt split-payments from the ground up on the Stellar network to be entirely trustless and frictionless.
            </p>
            <ul style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.8, paddingLeft: '1.5rem', margin: 0 }}>
              <li><strong>Instant Bill Creation:</strong> One click deploys a dedicated Soroban smart contract to securely hold the group's funds.</li>
              <li><strong>Transparent Tracking:</strong> Everyone sees exactly who paid and what percentage of the goal is funded directly on-chain.</li>
              <li><strong>100% Gasless:</strong> Thanks to FeeBumpTransactions, your friends just click "Pay" and the network fees are magically sponsored by the protocol.</li>
            </ul>
          </div>
        </motion.div>

        {/* Contact Us Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%', maxWidth: '600px', marginTop: '8rem', marginBottom: '4rem', textAlign: 'center' }}
        >
          <div style={{ display: 'inline-block', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '50%', marginBottom: '1rem' }}>
            <MessageSquare size={32} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>Get in Touch</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Have feedback, found a bug, or want to integrate KlassPay? We'd love to hear from you.
          </p>
          
          <form className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--glass-bg)' }} onSubmit={handleSubmit}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Name</label>
              <input type="text" value={formData.Name} onChange={e => setFormData({...formData, Name: e.target.value})} required placeholder="John Doe" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email</label>
              <input type="email" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} required placeholder="john@example.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Message</label>
              <textarea placeholder="How can we help?" value={formData.Message} onChange={e => setFormData({...formData, Message: e.target.value})} required rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text)', resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={status === 'Sending...'} className="btn" style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}>
              {status || 'Send Message'}
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Or follow us on <a href="#" style={{ color: 'var(--primary)' }}>Twitter</a> and <a href="#" style={{ color: 'var(--primary)' }}>Discord</a>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
