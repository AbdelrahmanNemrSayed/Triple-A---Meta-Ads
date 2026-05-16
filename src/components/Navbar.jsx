import React from "react";

export default function Navbar({ activeTab, setActiveTab, settings, activeAccountId, handleLogout, targetRegion, regions, handleRegionChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
            <img 
              src="/logo.png" 
              alt="Triple A Logo" 
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} 
            />
        </div>
        <span className="brand-title">Triple A</span>
      </div>

      <ul className="sidebar-menu">
        <li className="menu-category" style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px',
            border: '1px solid var(--border-glass)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>نطاق الاستهداف الإقليمي</div>
            <select 
              value={targetRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'var(--surface-dark-solid)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: '700'
              }}
            >
              {Object.entries(regions).map(([code, reg]) => (
                <option key={code} value={code}>
                  {reg.flag} {reg.name} ({reg.currency})
                </option>
              ))}
            </select>
          </div>
        </li>

        <li className="menu-category">الرئيسية والتحليل</li>
        <li
          className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="menu-icon">📊</span>
          <span>الحملات الإعلانية</span>
        </li>
        <li
          className={`menu-item ${activeTab === "brand-battle" ? "active" : ""}`}
          onClick={() => setActiveTab("brand-battle")}
        >
          <span className="menu-icon">⚔️</span>
          <span>مقارنة الماركات</span>
        </li>
        <li
          className={`menu-item ${activeTab === "leads-tracker" ? "active" : ""}`}
          onClick={() => setActiveTab("leads-tracker")}
        >
          <span className="menu-icon">🟢</span>
          <span>متابعة المبيعات</span>
        </li>

        <li className="menu-category">الأتمتة والذكاء</li>
        <li
          className={`menu-item ${activeTab === "rules" ? "active" : ""}`}
          onClick={() => setActiveTab("rules")}
        >
          <span className="menu-icon">⚙️</span>
          <span>قواعد الأتمتة</span>
        </li>
        <li
          className={`menu-item ${activeTab === "ai-writer" ? "active" : ""}`}
          onClick={() => setActiveTab("ai-writer")}
        >
          <span className="menu-icon">✨</span>
          <span>استوديو الإبداع</span>
        </li>
        <li
          className={`menu-item ${activeTab === "roas-simulator" ? "active" : ""}`}
          onClick={() => setActiveTab("roas-simulator")}
        >
          <span className="menu-icon">📉</span>
          <span>محاكي النتائج</span>
        </li>

        <li className="menu-category">الأدوات المتقدمة</li>
        <li
          className={`menu-item ${activeTab === "ab-test-generator" ? "active" : ""}`}
          onClick={() => setActiveTab("ab-test-generator")}
        >
          <span className="menu-icon">🔬</span>
          <span>اختبار التباين</span>
        </li>
        <li
          className={`menu-item ${activeTab === "competitor-spy" ? "active" : ""}`}
          onClick={() => setActiveTab("competitor-spy")}
        >
          <span className="menu-icon">🕵️‍♂️</span>
          <span>رادار المنافسين</span>
        </li>

        <li className="menu-category">النظام</li>
        <li
          className={`menu-item ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          <span className="menu-icon">💻</span>
          <span>طرفية السجلات</span>
        </li>
        <li
          className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <span className="menu-icon">🔗</span>
          <span>إعدادات الربط</span>
        </li>
      </ul>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', marginTop: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          padding: '0.5rem 0.75rem',
          marginBottom: '1rem',
          background: 'rgba(0, 255, 170, 0.03)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(0, 255, 170, 0.1)'
        }}>
          <div className="status-dot-pulse"></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>النظام نشط ومحمي</span>
        </div>
        
        <div className="user-badge">
          <div className="user-avatar" style={{ border: '2px solid var(--primary)', background: 'var(--surface-dark-solid)' }}>AD</div>
          <div className="user-info">
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>مُعلن محترف</h4>
            <p
              style={{
                fontSize: "0.75rem",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                color: "var(--primary)",
                fontWeight: '600'
              }}
            >
              {settings?.metaAdAccountsList?.find(
                (a) => a.id === activeAccountId,
              )?.name || "غير متصل"}
            </p>
          </div>
        </div>
        
        <div style={{ padding: "0 1rem 1rem" }}>
          <button 
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(255, 68, 68, 0.1)",
              border: "1px solid rgba(255, 68, 68, 0.2)",
              borderRadius: "10px",
              color: "#ff4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255, 68, 68, 0.2)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255, 68, 68, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </div>
    </aside>
  );
}
