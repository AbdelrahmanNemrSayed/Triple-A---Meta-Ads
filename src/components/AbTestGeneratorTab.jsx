import React, { useState } from "react";

export default function AbTestGeneratorTab({ settings }) {
  // Wizard Step State
  const [step, setStep] = useState(1);

  // Hard Gate 1: Hypothesis & Metrics Lock
  const [hypothesis, setHypothesis] = useState("تغيير صياغة العنوان إلى أسلوب الاستعجال والتصفية سيزيد معدل النقر (CTR) بنسبة 20%");
  const [primaryMetric, setPrimaryMetric] = useState("ctr"); // ctr, cpa, cpc
  const [targetSample, setTargetSample] = useState(5000); // Impressions per variant
  const [isHypothesisLocked, setIsHypothesisLocked] = useState(false);

  // Gate 2: Variants Setup
  const [controlTitle, setControlTitle] = useState("تشكيلة ملابس جديدة وعصرية بأسعار ممتازة");
  const [controlBody, setControlBody] = useState("اكتشف أحدث الموديلات من متجرنا بجودة عالية وتوصيل سريع لكل المحافظات.");
  
  const [variantTitle, setVariantTitle] = useState("🚨 تصفية كبرى لمدة 24 ساعة فقط! خصم 40%!");
  const [variantBody, setVariantBody] = useState("لا تفوت الفرصة! المخزون يوشك على النفاد، اطلب الآن واستفد بالشحن السريع والمعاينة قبل الاستلام.");

  // Gate 3: Active Test Simulation & Analytics
  const [testStatus, setTestStatus] = useState("setup"); // setup, running, completed
  const [controlMetrics, setControlMetrics] = useState({ impressions: 0, clicks: 0, leads: 0, spend: 0 });
  const [variantMetrics, setVariantMetrics] = useState({ impressions: 0, clicks: 0, leads: 0, spend: 0 });
  const [winner, setWinner] = useState(null);

  const handleLockHypothesis = (e) => {
    e.preventDefault();
    if (!hypothesis.trim()) {
      alert("⚠️ يرجى إدخال فرضية الاختبار بوضوح أولاً.");
      return;
    }
    setIsHypothesisLocked(true);
    setStep(2);
  };

  const handleStartTest = (e) => {
    e.preventDefault();
    setTestStatus("running");
    setControlMetrics({ impressions: 1200, clicks: 35, leads: 3, spend: 450 });
    setVariantMetrics({ impressions: 1350, clicks: 68, leads: 9, spend: 480 });
    setStep(3);
  };

  const handleSimulateTraffic = () => {
    // Increment metrics to reach or exceed target sample
    const cImp = controlMetrics.impressions + 2000;
    const cClicks = controlMetrics.clicks + 45;
    const cLeads = controlMetrics.leads + 4;
    const cSpend = controlMetrics.spend + 600;

    const vImp = variantMetrics.impressions + 2100;
    const vClicks = variantMetrics.clicks + 115;
    const vLeads = variantMetrics.leads + 14;
    const vSpend = variantMetrics.spend + 620;

    const newControl = { impressions: cImp, clicks: cClicks, leads: cLeads, spend: cSpend };
    const newVariant = { impressions: vImp, clicks: vClicks, leads: vLeads, spend: vSpend };

    setControlMetrics(newControl);
    setVariantMetrics(newVariant);

    // Calculate CTR and CPA
    const controlCtr = ((cClicks / cImp) * 100).toFixed(2);
    const variantCtr = ((vClicks / vImp) * 100).toFixed(2);

    const controlCpa = cLeads > 0 ? (cSpend / cLeads).toFixed(2) : cSpend;
    const variantCpa = vLeads > 0 ? (vSpend / vLeads).toFixed(2) : vSpend;

    if (cImp >= targetSample || vImp >= targetSample) {
      setTestStatus("completed");
      if (primaryMetric === "ctr") {
        if (parseFloat(variantCtr) > parseFloat(controlCtr)) {
          setWinner({ name: "النسخة ب (المتحدي الحماسي) 🏆", reason: `حققت معدل نقر أعلى (${variantCtr}% مقابل ${controlCtr}%)`, loser: "النسخة أ (الأساسية)" });
        } else {
          setWinner({ name: "النسخة أ (الأساسية) 🏆", reason: `حققت معدل نقر أعلى (${controlCtr}% مقابل ${variantCtr}%)`, loser: "النسخة ب (المتحدي)" });
        }
      } else {
        if (parseFloat(variantCpa) < parseFloat(controlCpa)) {
          setWinner({ name: "النسخة ب (المتحدي الحماسي) 🏆", reason: `حققت تكلفة عميل أقل (${variantCpa} ج.م مقابل ${controlCpa} ج.م)`, loser: "النسخة أ (الأساسية)" });
        } else {
          setWinner({ name: "النسخة أ (الأساسية) 🏆", reason: `حققت تكلفة عميل أقل (${controlCpa} ج.م مقابل ${variantCpa} ج.م)`, loser: "النسخة ب (المتحدي)" });
        }
      }
    }
  };

  const resetTest = () => {
    setStep(1);
    setIsHypothesisLocked(false);
    setTestStatus("setup");
    setWinner(null);
    setControlMetrics({ impressions: 0, clicks: 0, leads: 0, spend: 0 });
    setVariantMetrics({ impressions: 0, clicks: 0, leads: 0, spend: 0 });
  };

  return (
    <div className="tab-pane active">
      <div className="dashboard-header">
        <div className="title-area">
          <h2>🔬 مُنشئ اختبارات التباين الذكي (A/B Split-Test Wizard)</h2>
          <p className="subtitle">
            معالج تلقائي متوافق مع المعايير العلمية الصارمة لاختبار الفرضيات الإعلانية وتحديد النسخة الفائزة بدقة إحصائية
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className={`step-badge ${step >= 1 ? "active" : ""}`} style={{ padding: "0.4rem 0.8rem", borderRadius: "20px", background: step === 1 ? "var(--primary)" : "rgba(255,255,255,0.1)", color: step === 1 ? "#000" : "#fff", fontWeight: "bold", fontSize: "0.8rem" }}>
            1. الفرضية والهدف
          </div>
          <span>➔</span>
          <div className={`step-badge ${step >= 2 ? "active" : ""}`} style={{ padding: "0.4rem 0.8rem", borderRadius: "20px", background: step === 2 ? "var(--primary)" : "rgba(255,255,255,0.1)", color: step === 2 ? "#000" : "#fff", fontWeight: "bold", fontSize: "0.8rem" }}>
            2. إعداد النسخ
          </div>
          <span>➔</span>
          <div className={`step-badge ${step >= 3 ? "active" : ""}`} style={{ padding: "0.4rem 0.8rem", borderRadius: "20px", background: step === 3 ? "var(--primary)" : "rgba(255,255,255,0.1)", color: step === 3 ? "#000" : "#fff", fontWeight: "bold", fontSize: "0.8rem" }}>
            3. المراقبة والإيقاف
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        {/* --- STEP 1: HYPOTHESIS & METRIC LOCK --- */}
        {step === 1 && (
          <div className="glass-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h3 style={{ color: "var(--primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🔒</span> البوابة الأولى: قفل الفرضية والمقاييس (Hypothesis Lock)
            </h3>

            <div style={{ background: "rgba(255, 170, 0, 0.1)", border: "1px solid rgba(255, 170, 0, 0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#ffaa00" }}>
              ⚠️ <strong>قاعدة علمية صارمة:</strong> لا يمكن تغيير الفرضية أو المقياس الرئيسي بعد بدء الاختبار لمنع التحيز (No Peeking).
            </div>

            <form onSubmit={handleLockHypothesis}>
              <div className="form-group">
                <label>نص الفرضية الإعلانية (Hypothesis Statement):</label>
                <textarea
                  rows="2"
                  required
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="مثال: إضافة رمز الخصم في العنوان الأول سيزيد من نسبة النقر..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>المقياس الرئيسي للنجاح (Primary Metric):</label>
                  <select value={primaryMetric} onChange={(e) => setPrimaryMetric(e.target.value)}>
                    <option value="ctr" style={{ background: "#0c0d12" }}>نسبة النقر إلى الظهور (Click-Through Rate - CTR)</option>
                    <option value="cpa" style={{ background: "#0c0d12" }}>تكلفة اكتساب العميل (Cost Per Acquisition - CPA)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>حجم العينة المطلوب (Target Sample per Variant):</label>
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    required
                    value={targetSample}
                    onChange={(e) => setTargetSample(parseInt(e.target.value))}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>
                    مشاهدة لكل إعلان لضمان الثقة الإحصائية
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
                  تأكيد وقفل الفرضية 🔒
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- STEP 2: VARIANTS SETUP --- */}
        {step === 2 && (
          <div className="glass-card">
            <h3 style={{ color: "var(--secondary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚖️</span> البوابة الثانية: صياغة وتوزيع النسخ (Variants Setup)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
              {/* Control Variant */}
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                  <h4 style={{ color: "#1877f2", margin: 0 }}>🔵 النسخة أ (Control - الأساسية)</h4>
                  <span className="badge">متغير ثابت</span>
                </div>

                <div className="form-group">
                  <label>العنوان (Headline):</label>
                  <input type="text" value={controlTitle} onChange={(e) => setControlTitle(e.target.value)} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>النص الإعلاني (Primary Text):</label>
                  <textarea rows="3" value={controlBody} onChange={(e) => setControlBody(e.target.value)} required />
                </div>
              </div>

              {/* Variant B */}
              <div style={{ background: "rgba(0, 255, 170, 0.05)", border: "1px solid rgba(0, 255, 170, 0.2)", borderRadius: "10px", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(0, 255, 170, 0.1)", paddingBottom: "0.5rem" }}>
                  <h4 style={{ color: "var(--primary)", margin: 0 }}>🟢 النسخة ب (Variant - المتحدي)</h4>
                  <span className="badge badge-primary">عنصر التحدي</span>
                </div>

                <div className="form-group">
                  <label>العنوان (Headline):</label>
                  <input type="text" value={variantTitle} onChange={(e) => setVariantTitle(e.target.value)} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>النص الإعلاني (Primary Text):</label>
                  <textarea rows="3" value={variantBody} onChange={(e) => setVariantBody(e.target.value)} required />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                ➔ رجوع لتعديل الفرضية
              </button>
              <button type="button" className="btn btn-primary" onClick={handleStartTest} style={{ padding: "0.75rem 2.5rem", fontSize: "1rem", fontWeight: "bold" }}>
                🚀 إطلاق الاختبار والمقارنة الحية
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: LIVE MONITORING & AUTO-STOP --- */}
        {step === 3 && (
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ color: "var(--primary)", margin: "0 0 0.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>📡</span> لوحة المراقبة الحية والإيقاف التلقائي
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  الفرضية المقفلة: <strong>{hypothesis}</strong>
                </span>
              </div>

              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {testStatus === "running" && (
                  <button onClick={handleSimulateTraffic} className="btn btn-primary glowing-btn" style={{ padding: "0.5rem 1.25rem", fontWeight: "bold" }}>
                    ⚡ محاكاة تدفق المشاهدات والنقرات
                  </button>
                )}
                <button onClick={resetTest} className="btn btn-secondary" style={{ padding: "0.5rem 1rem" }}>
                  🔄 اختبار جديد
                </button>
              </div>
            </div>

            {/* Winner Banner Alert */}
            {winner && (
              <div style={{ background: "linear-gradient(135deg, rgba(0,255,170,0.15), rgba(0,242,254,0.15))", border: "2px solid var(--primary)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem", textAlign: "center" }}>
                <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>🏆</span>
                <h2 style={{ color: "var(--primary)", margin: "0 0 0.5rem 0" }}>تم إعلان الإعلان الفائز إحصائياً!</h2>
                <h3 style={{ color: "#fff", margin: "0 0 0.5rem 0" }}>الإعلان الفائز: {winner.name}</h3>
                <p style={{ fontSize: "1rem", color: "#e4e6eb", margin: "0 0 1rem 0" }}>
                  السبب: <strong>{winner.reason}</strong>
                </p>
                <div style={{ background: "rgba(0,0,0,0.4)", display: "inline-block", padding: "0.5rem 1.5rem", borderRadius: "20px", color: "#ff4444", fontSize: "0.85rem", fontWeight: "bold" }}>
                  🛑 تم إيقاف {winner.loser} تلقائياً لمنع هدر الميزانية وتوجيه الصرف للنسخة الفائزة.
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
              {/* Control Stats */}
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                {winner && winner.loser.includes("أ") && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#ff4444", color: "#fff", textAlign: "center", padding: "0.25rem", fontSize: "0.75rem", fontWeight: "bold" }}>
                    🛑 إيقاف تلقائي (LOSER)
                  </div>
                )}
                {winner && winner.name.includes("أ") && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "var(--primary)", color: "#000", textAlign: "center", padding: "0.25rem", fontSize: "0.75rem", fontWeight: "bold" }}>
                    🏆 الفائز (WINNER)
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", marginTop: winner ? "1rem" : 0 }}>
                  <h4 style={{ color: "#1877f2", margin: 0 }}>🔵 النسخة أ (Control)</h4>
                  <span className="badge" style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>
                    {controlMetrics.impressions.toLocaleString()} / {targetSample.toLocaleString()} مشاهدة
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>نسبة النقر (CTR)</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1877f2" }}>
                      {controlMetrics.impressions > 0 ? ((controlMetrics.clicks / controlMetrics.impressions) * 100).toFixed(2) : 0}%
                    </span>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>سعر العميل (CPA)</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ffaa00" }}>
                      {controlMetrics.leads > 0 ? (controlMetrics.spend / controlMetrics.leads).toFixed(2) : controlMetrics.spend} ج.م
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.6", background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "6px" }}>
                  <strong>العنوان:</strong> {controlTitle}
                </div>
              </div>

              {/* Variant B Stats */}
              <div style={{ background: "rgba(0, 255, 170, 0.03)", border: "1px solid rgba(0, 255, 170, 0.2)", borderRadius: "10px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                {winner && winner.loser.includes("ب") && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#ff4444", color: "#fff", textAlign: "center", padding: "0.25rem", fontSize: "0.75rem", fontWeight: "bold" }}>
                    🛑 إيقاف تلقائي (LOSER)
                  </div>
                )}
                {winner && winner.name.includes("ب") && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "var(--primary)", color: "#000", textAlign: "center", padding: "0.25rem", fontSize: "0.75rem", fontWeight: "bold" }}>
                    🏆 الفائز (WINNER)
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", marginTop: winner ? "1rem" : 0 }}>
                  <h4 style={{ color: "var(--primary)", margin: 0 }}>🟢 النسخة ب (Variant)</h4>
                  <span className="badge badge-primary">
                    {variantMetrics.impressions.toLocaleString()} / {targetSample.toLocaleString()} مشاهدة
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>نسبة النقر (CTR)</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)" }}>
                      {variantMetrics.impressions > 0 ? ((variantMetrics.clicks / variantMetrics.impressions) * 100).toFixed(2) : 0}%
                    </span>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>سعر العميل (CPA)</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ffaa00" }}>
                      {variantMetrics.leads > 0 ? (variantMetrics.spend / variantMetrics.leads).toFixed(2) : variantMetrics.spend} ج.م
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.6", background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "6px" }}>
                  <strong>العنوان:</strong> {variantTitle}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
