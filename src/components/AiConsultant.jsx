import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AiConsultant({ activeAccountId, targetRegion, regions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'أهلاً بك! أنا مستشارك الذكي Triple A. كيف يمكنني مساعدتك في تحليل حملاتك اليوم؟' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', { 
        message: userMsg, 
        accountId: activeAccountId,
        region: regions[targetRegion]?.name,
        currency: regions[targetRegion]?.currency
      });
      
      setChatHistory(prev => [...prev, { role: 'ai', text: response.data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: '❌ عذراً، فشل الاتصال بالمستشار الذكي. يرجى التأكد من إعداد API Key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {/* Chat Window */}
      {isOpen && (
        <div className="glass-card animate-scale-in" style={{
          width: '380px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '1rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          background: 'rgba(13, 15, 36, 0.95)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>مستشار Triple A الذكي</h4>
                <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.8 }}>يعمل بتقنية Gemini 1.5 Pro</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--primary) transparent'
          }}>
            {chatHistory.map((chat, i) => (
              <div key={i} style={{
                alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                background: chat.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: chat.role === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                textAlign: 'right',
                direction: 'rtl'
              }}>
                {chat.text}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="animate-pulse">🤖 جاري التحليل...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '1rem',
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اسأل المستشار عن أداء إعلاناتك..."
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                direction: 'rtl'
              }}
            />
            <button 
              type="submit"
              disabled={!message.trim() || isLoading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                opacity: (!message.trim() || isLoading) ? 0.5 : 1
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🚀
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          border: 'none',
          boxShadow: '0 8px 32px rgba(var(--primary-rgb), 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          color: '#fff'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.1) rotate(5deg)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1) rotate(0deg)'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
}
