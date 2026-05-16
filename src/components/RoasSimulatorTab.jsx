import React, { useState } from "react";

export default function RoasSimulatorTab({ settings }) {
  const [dailyBudget, setDailyBudget] = useState(settings.currency === "EGP" ? 2000 : 200);
  const [expectedCpa, setExpectedCpa] = useState(settings.currency === "EGP" ? 150 : 15);
  const [averageOrderValue, setAverageOrderValue] = useState(settings.currency === "EGP" ? 650 : 65);

  // Instant Predictive Calculations
  const expectedConversions = Math.round(dailyBudget / expectedCpa);
  const totalRevenue = expectedConversions * averageOrderValue;
  const netProfit = totalRevenue - dailyBudget;
  const calculatedRoas = (totalRevenue / dailyBudget).toFixed(2);

  // Profitability status
  let statusText = "مربحة جداً 🚀";
  let statusColor = "#00ffaa";
  if (calculatedRoas < 1.0) {
    statusText = "خسارة متوقعة ⚠️";
    statusColor = "#ff4444";
  } else if (calculatedRoas < 1.5) {
    statusText = "هامش ربح ضعيف ⚖️";
    statusColor = "#ffaa00";
  }

  return (
    <div className="tab-pane active">
      <div className="dashboard-header">
        <div className="title-area">
          <h2>📊 محاكي الميزانية التنبؤي وتوزيع العوائد (ROAS Simulator)</h2>
          <p className="subtitle">
            لوحة تفاعلية ذكية لحساب التوقعات المستقبلية والعائد الاستثماري قبل إنفاق الميزانية الفعليا
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem",
        }}
      >
        {/* --- CONTROLS & SLIDERS CARD --- */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ color: "var(--primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🎛️</span> أدوات التحكم والمحاكاة
          </h3>

          {/* Daily Budget Slider */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ margin: 0, fontWeight: "600" }}>الميزانية اليومية (Daily Budget):</label>
              <span className="badge badge-primary" style={{ fontSize: "1rem", padding: "0.3rem 0.6rem" }}>
                {dailyBudget.toLocaleString()} {settings.currencySymbol}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer", accentColor: "var(--primary)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              <span>{settings.currency === "EGP" ? "100" : "10"} {settings.currencySymbol}</span>
              <span>{settings.currency === "EGP" ? "50,000" : "5,000"} {settings.currencySymbol}</span>
            </div>
          </div>

          {/* Expected CPA Slider */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ margin: 0, fontWeight: "600" }}>تكلفة العميل المستهدف (Expected CPA):</label>
              <span className="badge" style={{ fontSize: "1rem", padding: "0.3rem 0.6rem", background: "rgba(255, 170, 0, 0.2)", color: "#ffaa00" }}>
                {expectedCpa} {settings.currencySymbol}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={expectedCpa}
              onChange={(e) => setExpectedCpa(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer", accentColor: "#ffaa00" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              <span>{settings.currency === "EGP" ? "20" : "2"} {settings.currencySymbol}</span>
              <span>{settings.currency === "EGP" ? "1,000" : "100"} {settings.currencySymbol}</span>
            </div>
          </div>

          {/* Average Order Value Slider */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ margin: 0, fontWeight: "600" }}>متوسط قيمة الطلب (Average Order Value):</label>
              <span className="badge" style={{ fontSize: "1rem", padding: "0.3rem 0.6rem", background: "rgba(0, 242, 254, 0.2)", color: "#00f2fe" }}>
                {averageOrderValue.toLocaleString()} {settings.currencySymbol}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={averageOrderValue}
              onChange={(e) => setAverageOrderValue(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer", accentColor: "#00f2fe" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              <span>{settings.currency === "EGP" ? "100" : "10"} {settings.currencySymbol}</span>
              <span>{settings.currency === "EGP" ? "5,000" : "500"} {settings.currencySymbol}</span>
            </div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1rem", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            💡 <strong>كيف تعمل المحاكاة؟</strong> يقوم النظام بحساب العائد المتوقع تلقائياً بناءً على العلاقة المباشرة بين ميزانيتك اليومية وتكلفة اكتساب العميل.
          </div>
        </div>

        {/* --- PREDICTIVE RESULTS CARD --- */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ color: "var(--secondary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📈</span> التوقعات المستقبلية الفورية
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Expected Leads */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "1.25rem", textAlign: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>👥 العملاء / الطلبات المتوقعة</span>
              <span style={{ fontSize: "1.8rem", fontWeight: "700", color: "#00f2fe" }}>{expectedConversions}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>طلب يومياً</span>
            </div>

            {/* Total Revenue */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "1.25rem", textAlign: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>💰 إجمالي المبيعات (Revenue)</span>
              <span style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--primary)" }}>{totalRevenue.toLocaleString()}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>{settings.currencySymbol} / يومياً</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Net Profit */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "1.25rem", textAlign: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>💵 صافي الربح اليومي</span>
              <span style={{ fontSize: "1.8rem", fontWeight: "700", color: netProfit >= 0 ? "#00ffaa" : "#ff4444" }}>
                {netProfit >= 0 ? `+${netProfit.toLocaleString()}` : netProfit.toLocaleString()}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>بعد خصم الإعلانات</span>
            </div>

            {/* ROAS Metric */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "1.25rem", textAlign: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>📊 العائد على الإعلانات (ROAS)</span>
              <span style={{ fontSize: "1.8rem", fontWeight: "700", color: statusColor }}>{calculatedRoas}x</span>
              <span style={{ fontSize: "0.75rem", color: statusColor, display: "block", marginTop: "0.25rem", fontWeight: "600" }}>{statusText}</span>
            </div>
          </div>

          {/* Visual Profitability Gauge */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
              <span>مؤشر الأداء والعائد التنبؤي:</span>
              <span style={{ color: statusColor, fontWeight: "700" }}>{statusText}</span>
            </div>
            <div style={{ width: "100%", height: "12px", background: "rgba(0,0,0,0.4)", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
              <div
                style={{
                  width: `${Math.min(calculatedRoas * 25, 100)}%`,
                  background: `linear-gradient(90deg, ${calculatedRoas < 1 ? "#ff4444" : calculatedRoas < 1.5 ? "#ffaa00" : "#00ffaa"}, var(--primary))`,
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              <span>خسارة (&lt;1x)</span>
              <span>تعادل (1x)</span>
              <span>مربح جداً (&gt;2x)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
