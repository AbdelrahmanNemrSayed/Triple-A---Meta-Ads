import React, { useState } from 'react';
import axios from 'axios';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      if (response.data.success) {
        localStorage.setItem('triple_a_token', response.data.token);
        localStorage.setItem('triple_a_user', response.data.username);
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#0a0b1e',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Triple A" style={{ width: '80px', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: 0 }}>Triple A</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>بوابة أتمتة إعلانات ميتا المتطورة</p>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid rgba(255, 68, 68, 0.2)',
              borderRadius: '6px',
              color: '#ff4444',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseOver={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !isLoading && (e.target.style.transform = 'translateY(0)')}
          >
            {isLoading ? 'جاري التحقق...' : 'دخول للمنصة'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.75rem' }}>
          &copy; 2026 Triple A - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
