import React from "react";

export default function RulesTab({
  rules,
  handleToggleRule,
  handleDeleteRule,
  settings,
  setNewRule,
  setShowModal,
}) {
  const ruleTemplates = [
    {
      name: "زيادة الميزانية الذكية (Scale Up)",
      description: "زيادة ميزانية المجموعة بنسبة 15% إذا كانت تكلفة العميل أقل من 50 ج.م",
      data: {
        name: "زيادة الميزانية الذكية (Scale Up)",
        description: "زيادة ميزانية المجموعة بنسبة 15% إذا كانت تكلفة العميل أقل من 50 ج.م",
        targetType: "adset",
        metric: "cpa",
        operator: "less_than",
        threshold: 50.0,
        minLeads: 3,
        action: "increase_budget",
        percentValue: 15,
        isActive: true
      }
    },
    {
      name: "إيقاف الخسارة (Stop Loss)",
      description: "إيقاف الإعلان فوراً إذا صرف أكثر من 300 ج.م بدون أي مبيعات",
      data: {
        name: "إيقاف الخسارة (Stop Loss)",
        description: "إيقاف الإعلان فوراً إذا صرف أكثر من 300 ج.م بدون أي مبيعات",
        targetType: "ad",
        metric: "leads",
        operator: "less_than",
        threshold: 1,
        minSpent: 300.0,
        action: "pause",
        isActive: true
      }
    },
    {
      name: "جدولة التشغيل الصباحية (Prime Time)",
      description: "تشغيل كافة الإعلانات تلقائياً في تمام الساعة 9 صباحاً لبدء يوم العمل",
      data: {
        name: "جدولة التشغيل الصباحية (Prime Time)",
        description: "تشغيل كافة الإعلانات تلقائياً في تمام الساعة 9 صباحاً لبدء يوم العمل",
        targetType: "account",
        action: "dayparting_start",
        scheduleTime: "09:00",
        isActive: true
      }
    }
  ];

  const applyTemplate = (template) => {
    setNewRule({
      ...template,
      id: "" // New rule
    });
    setShowModal(true);
  };
  return (
    <section className="glass-card">
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "1rem", 
          marginBottom: "2rem",
          padding: "1rem",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        {ruleTemplates.map((template, idx) => (
          <div 
            key={idx}
            className="glass-card"
            style={{ 
              padding: "1rem", 
              border: "1px solid rgba(0, 255, 170, 0.1)",
              transition: "transform 0.2s"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <strong style={{ color: "var(--primary)", fontSize: "0.9rem" }}>{template.name}</strong>
              <span style={{ fontSize: "1.2rem" }}>⚡</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem" }}>{template.description}</p>
            <button 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem" }}
              onClick={() => applyTemplate(template.data)}
            >
              تطبيق القالب سرياً
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: "1.25rem", fontSize: "1.15rem" }}>
        ⚙️ قواعد الأتمتة المبرمجة النشطة
      </h3>

      <div className="rules-list">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`rule-item ${rule.action === "pause" || rule.action === "dayparting_pause" ? "rule-warning" : "rule-info"}`}
          >
            <div className="rule-header">
              <div className="rule-info">
                <div className="rule-icon">
                  {rule.action === "pause"
                    ? "🛑"
                    : rule.action === "increase_budget"
                      ? "📈"
                      : rule.action === "dayparting_pause"
                        ? "⏰"
                        : rule.action === "dayparting_start"
                          ? "☀️"
                          : "📊"}
                </div>
                <div>
                  <div className="rule-title">{rule.name}</div>
                  <div className="rule-desc">{rule.description}</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                >
                  آخر تنفيذ:{" "}
                  {rule.lastExecuted
                    ? new Date(rule.lastExecuted).toLocaleTimeString("ar-EG")
                    : "لم ينفذ بعد"}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={() => handleToggleRule(rule)}
                  />
                  <span className="slider"></span>
                </label>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Conditions metadata details */}
            <div className="rule-meta">
              <div className="rule-param">
                <span>الهدف:</span>
                <span className="badge badge-system">
                  {rule.targetType === "ad"
                    ? "الإعلانات الفردية (Ads)"
                    : rule.targetType === "adset"
                      ? "المجموعات الإعلانية"
                      : "الحساب بالكامل"}
                </span>
              </div>

              {rule.metric && (
                <div className="rule-param">
                  <span>المقياس:</span>
                  <strong>{rule.metric.toUpperCase()}</strong>
                </div>
              )}

              {rule.threshold && (
                <div className="rule-param">
                  <span>قيمة الشرط:</span>
                  <strong>
                    {rule.operator === "greater_than"
                      ? "أكبر من "
                      : "أصغر من "}
                    {settings?.currencySymbol}
                    {rule.threshold}
                  </strong>
                </div>
              )}

              {rule.minSpent && (
                <div className="rule-param">
                  <span>الحد الأدنى للصرف:</span>
                  <strong>
                    {settings?.currencySymbol}
                    {rule.minSpent}
                  </strong>
                </div>
              )}

              {rule.percentValue && (
                <div className="rule-param">
                  <span>نسبة الزيادة:</span>
                  <strong>+{rule.percentValue}%</strong>
                </div>
              )}

              {rule.scheduleTime && (
                <div className="rule-param">
                  <span>وقت الجدولة اليومي:</span>
                  <strong style={{ color: "var(--primary)" }}>{rule.scheduleTime}</strong>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
