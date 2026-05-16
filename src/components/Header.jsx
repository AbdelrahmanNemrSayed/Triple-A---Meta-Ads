import React from "react";

export default function Header({
  activeTab,
  activeAccountId,
  setActiveAccountId,
  settings,
  fetchData,
  isTriggering,
  handleTriggerCheck,
  setNewRule,
  setShowModal,
}) {
  return (
    <header className="page-header animate-fade-in" style={{ marginBottom: '2rem' }}>
      <div className="page-title">
        {activeTab === "dashboard" && (
          <>
            <h2>لوحة قياس الأداء المباشرة</h2>
            <p>مراقبة الحملات وتدفق العملاء الفعلي مع Meta Ads API</p>
          </>
        )}
        {activeTab === "rules" && (
          <>
            <h2>محرك القواعد والسيناريوهات الذكية</h2>
            <p>
              قم بصياغة قواعد صارمة للتحكم في الميزانية وإيقاف الهدر تلقائياً
            </p>
          </>
        )}
        {activeTab === "logs" && (
          <>
            <h2>طرفية السجلات والأتمتة الآلية</h2>
            <p>تتبع تفصيلي لحظة بلحظة لكافة قرارات الذكاء الاصطناعي والإرسال</p>
          </>
        )}
        {activeTab === "leads-tracker" && (
          <>
            <h2>لوحة المتابعة الفورية والمراسلة السريعة</h2>
            <p>
              متابعة لحظية وتحديث لحالات العملاء المحتملين مع إمكانية بدء محادثة
              واتساب مخصصة فوراً
            </p>
          </>
        )}
        {activeTab === "brand-battle" && (
          <>
            <h2>لوحة المقارنة وتحليل الأداء التسويقي (Battle)</h2>
            <p>
              مقارنة مالية وإعلانية مباشرة لتحديد العلامة التجارية الأكثر كفاءة
            </p>
          </>
        )}
        {activeTab === "ai-writer" && (
          <>
            <h2>مساعد الإعلانات الذكي (AI Studio)</h2>
            <p>
              صياغة نصوص إعلانية ممتازة وسيناريوهات فيديوهات تيك توك وريلز حصرية
            </p>
          </>
        )}
        {activeTab === "settings" && (
          <>
            <h2>بوابة التكامل وقنوات التواصل</h2>
            <p>اربط لوحتك بفيسبوك، تيليجرام، وجداول بيانات جوجل بلحظات</p>
          </>
        )}
        {activeTab === "roas-simulator" && (
          <>
            <h2>محاكي الميزانية التنبؤي (Budget Simulator)</h2>
            <p>محاكاة دقيقة للنتائج المتوقعة بناءً على تغيير الميزانية والـ CPA</p>
          </>
        )}
        {activeTab === "ab-test-generator" && (
          <>
            <h2>مُنشئ اختبارات التباين (A/B Wizard)</h2>
            <p>اختبار عدة نسخ إبداعية وتحديد الفائز تلقائياً لتعظيم العائد</p>
          </>
        )}
        {activeTab === "competitor-spy" && (
          <>
            <h2>رادار إعلانات المنافسين (Ad Spy)</h2>
            <p>مكتبة حفظ واستلهام الأفكار الإعلانية الناجحة في السوق</p>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: 'wrap' }}>
        {/* Account Switcher Dropdown */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-glass)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: '600' }}>
             الحساب:
          </span>
          <select
            value={activeAccountId}
            onChange={(e) => {
              const newId = e.target.value;
              setActiveAccountId(newId);
              fetchData(newId);
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary)",
              padding: "0.2rem 0.5rem",
              fontSize: "0.95rem",
              fontWeight: "800",
              outline: "none",
              cursor: "pointer",
              dir: "rtl",
            }}
          >
            {(
              settings.metaAdAccountsList || [
                { id: "26739674035671488", name: "HBrand" },
                { id: "965194625872456", name: "HForLess" },
              ]
            ).map((acc) => (
              <option
                key={acc.id}
                value={acc.id}
                style={{ background: "var(--surface-dark-solid)", color: "#fff" }}
              >
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`btn btn-secondary ${isTriggering ? "disabled" : ""}`}
          onClick={handleTriggerCheck}
          disabled={isTriggering}
          style={{ padding: '0.6rem 1.5rem' }}
          data-tooltip="فحص فوري لكافة القواعد النشطة الآن"
        >
          {isTriggering ? (
            <>
               جاري الفحص...
            </>
          ) : (
            <>
              ⚡ فحص القواعد
            </>
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
          }}
          style={{ padding: '0.6rem 1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="تبديل الوضع المضيء/الداكن"
        >
          🌓
        </button>

        {activeTab === "rules" && (
          <button
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.5rem' }}
            onClick={() => {
              setNewRule({
                id: "",
                name: "",
                description: "",
                targetType: "ad",
                metric: "cpa",
                operator: "greater_than",
                threshold: 5.0,
                minSpent: 10.0,
                minLeads: 3,
                action: "pause",
                percentValue: 10,
                scheduleTime: "12:00",
                isActive: true,
              });
              setShowModal(true);
            }}
          >
            ➕ قاعدة جديدة
          </button>
        )}
      </div>
    </header>
  );
}
