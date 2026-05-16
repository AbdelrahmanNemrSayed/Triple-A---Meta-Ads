import React, { useState } from "react";

export default function CompetitorSpyTab({ setActiveTab, setOfferText, targetRegion, regions }) {
  // Initial Mock Competitor Ads based on Region
  const getRegionalAds = (region) => {
    const commonAds = [
      {
        id: 1,
        brandName: region === "SA" ? "Saudi Style (منافس محلي)" : region === "AE" ? "Dubai Fashion" : "FashionPro",
        platform: "instagram",
        adType: "فيديو ريلز (Reels)",
        dateSpied: "منذ يومين",
        adCopy: region === "SA" ? "أحدث تشكيلة عبايات وملابس كاجوال وصلت الرياض! خصم 40% وتوصيل مجاني لكل مدن المملكة." : "خصم حصري 50% على الكولكشن الشتوي لفترة محدودة! اطلب قبل نفاد الكمية وشحن مجاني اليوم.",
        hook: region === "SA" ? "وصلت الرياض! (استهداف محلي)" : "خصم حصري 50% (عرض سعري مباشر ومغرٍ جداً)",
        offer: "شحن مجاني + خصم خاص",
        cta: "اطلب الآن عبر الموقع",
        engagementScore: "🔥 9.8 / 10",
        strengths: ["وضوح العرض", "استهداف جغرافي دقيق", "تصميم جذاب"]
      },
      {
        id: 2,
        brandName: region === "SA" ? "Riyadh Boutique" : "TrendyStyle",
        platform: "tiktok",
        adType: "فيديو UGC",
        dateSpied: "منذ 4 أيام",
        adCopy: "جودة القماش خيالية والسعر ولا أحلى! طلبت من المتجر ووصلني في يومين، بجد أفضل خيار في السعودية.",
        hook: "جودة القماش خيالية (إثارة الفضول)",
        offer: "جودة خامات ممتازة بسعر تنافسي",
        cta: "تسوق الآن",
        engagementScore: "📈 9.2 / 10",
        strengths: ["محتوى UGC", "ثقة عالية", "تركيز على الجودة"]
      }
    ];

    if (region === "SA") {
      commonAds.push({
        id: 3,
        brandName: "KSA Mega Store",
        platform: "facebook",
        adType: "صورة كاروسيل",
        dateSpied: "منذ أسبوع",
        adCopy: "عروض اليوم الوطني مستمرة! اشتري قطعتين واحصل على الثالثة مجاناً، الدفع عند الاستلام متاح في جميع مدن المملكة.",
        hook: "اشتري 2 وخد 1 هدية (باندل قوي)",
        offer: "قطعة مجانية + دفع عند الاستلام",
        cta: "اطلب الآن",
        engagementScore: "💡 8.5 / 10",
        strengths: ["عرض حزمة (Bundle)", "إزالة مخاطر الشراء", "تنوع المنتجات"]
      });
    } else if (region === "EG") {
      commonAds.push({
        id: 3,
        brandName: "MegaStore Egypt",
        platform: "facebook",
        adType: "صورة كاروسيل",
        dateSpied: "منذ أسبوع",
        adCopy: "اشتري قطعتين واحصل على الثالثة مجاناً! تشكيلة متنوعة تناسب كل الأذواق، المعاينة قبل الاستلام مجاناً.",
        hook: "اشتري 2 وخد 1 هدية",
        offer: "قطعة مجانية + معاينة قبل الاستلام",
        cta: "تسوق الآن",
        engagementScore: "💡 8.5 / 10",
        strengths: ["عرض حزمة", "معاينة قبل الاستلام", "تنوع"]
      });
    }
    
    return commonAds;
  };

  const [competitorAds, setCompetitorAds] = useState(getRegionalAds(targetRegion));

  // Sync state when region changes
  React.useEffect(() => {
    setCompetitorAds(getRegionalAds(targetRegion));
  }, [targetRegion]);

  // Form state for archiving new competitor ad
  const [newBrand, setNewBrand] = useState("");
  const [newPlatform, setNewPlatform] = useState("facebook");
  const [newAdType, setNewAdType] = useState("فيديو (Video)");
  const [newCopy, setNewCopy] = useState("");
  const [newHook, setNewHook] = useState("");
  const [newOffer, setNewOffer] = useState("");
  const [newCta, setNewCta] = useState("");
  const [newStrength, setNewStrength] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const handleArchiveAd = (e) => {
    e.preventDefault();
    if (!newBrand || !newCopy) {
      alert("⚠️ يرجى إدخال اسم المنافس والنص الإعلاني على الأقل.");
      return;
    }

    const newAdObj = {
      id: Date.now(),
      brandName: newBrand,
      platform: newPlatform,
      adType: newAdType,
      dateSpied: "الآن (حديث جداً)",
      adCopy: newCopy,
      hook: newHook || "خطاف مباشر لجذب الانتباه",
      offer: newOffer || "عرض تنافسي مقترح",
      cta: newCta || "تسوق الآن / اطلب اليوم",
      engagementScore: "🔥 9.0 / 10 (جديد ومبشر)",
      strengths: newStrength ? newStrength.split("،") : ["صياغة تسويقية حديثة", "عرض مباشر للجمهور المستهدف"]
    };

    setCompetitorAds([newAdObj, ...competitorAds]);
    setNewBrand("");
    setNewCopy("");
    setNewHook("");
    setNewOffer("");
    setNewCta("");
    setNewStrength("");
    setShowAddForm(false);
  };

  const handleInspireCampaign = (ad) => {
    // Pass the winning offer/copy to AI Writer tab for inspiration
    if (setOfferText) {
      setOfferText(`بناءً على إعلان المنافس (${ad.brandName}): ${ad.offer} - الخطاف: ${ad.hook}`);
    }
    if (setActiveTab) {
      setActiveTab("ai-writer");
    }
  };

  return (
    <div className="tab-pane active">
      <div className="dashboard-header">
        <div className="title-area">
          <h2>🕵️♂️ رادار إعلانات المنافسين (Competitor Ad Spy & Inspiration Hub)</h2>
          <p className="subtitle">
            مكتبة أرشفة وتحليل ذكية لرصد إعلانات السوق الناجحة وتفكيك عناصر قوتها لاستلهام حملاتك الإعلانية القادمة
          </p>
        </div>

        <div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontWeight: "bold", fontSize: "1rem" }}>
            {showAddForm ? "✖ إغلاق نافذة الرصد" : "➕ رصد وأرشفة إعلان منافس جديد"}
          </button>
        </div>
      </div>

      {/* --- ADD NEW COMPETITOR AD FORM --- */}
      {showAddForm && (
        <div className="glass-card" style={{ marginTop: "1.5rem", borderLeft: "4px solid var(--primary)", animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ color: "var(--primary)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📌</span> نموذج رصد وأرشفة إعلان جديد في الرادار
          </h3>

          <form onSubmit={handleArchiveAd}>
            <div className="form-row">
              <div className="form-group">
                <label>اسم المنافس / العلامة التجارية (Brand Name):</label>
                <input type="text" required placeholder="مثال: BrandX Egypt" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
              </div>

              <div className="form-group">
                <label>منصة العرض (Platform):</label>
                <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)}>
                  <option value="facebook" style={{ background: "#0c0d12" }}>فيسبوك (Facebook)</option>
                  <option value="instagram" style={{ background: "#0c0d12" }}>إنستغرام (Instagram Reels/Stories)</option>
                  <option value="tiktok" style={{ background: "#0c0d12" }}>تيك توك (TikTok)</option>
                </select>
              </div>

              <div className="form-group">
                <label>نوع التصميم (Ad Format):</label>
                <input type="text" placeholder="فيديو ريلز، صورة، كاروسيل، UGC..." value={newAdType} onChange={(e) => setNewAdType(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>النص الإعلاني المرصود (Ad Copy):</label>
              <textarea rows="2" required placeholder="انسخ نص إعلان المنافس هنا..." value={newCopy} onChange={(e) => setNewCopy(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>تحليل الخطاف (The Hook):</label>
                <input type="text" placeholder="الجملة أو المشهد الخاطف للانتباه في البداية..." value={newHook} onChange={(e) => setNewHook(e.target.value)} />
              </div>

              <div className="form-group">
                <label>تحليل العرض (The Offer):</label>
                <input type="text" placeholder="الخصم، الباندل، أو القيمة المضافة المقدمة..." value={newOffer} onChange={(e) => setNewOffer(e.target.value)} />
              </div>

              <div className="form-group">
                <label>تحليل الدعوة للإجراء (CTA):</label>
                <input type="text" placeholder="اطلب الآن، سجل اليوم، الشحن المجاني..." value={newCta} onChange={(e) => setNewCta(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>عناصر القوة والتميز (Strengths - افصل بينها بفاصلة):</label>
              <input type="text" placeholder="مثال: جودة تصوير عالية، عرض لا يقاوم، مصداقية شديدة" value={newStrength} onChange={(e) => setNewStrength(e.target.value)} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">إلغاء</button>
              <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem 2.5rem", fontWeight: "bold" }}>
                💾 حفظ وأرشفة الإعلان في الرادار
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- ARCHIVED ADS GRID --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "2rem", marginTop: "2rem" }}>
        {competitorAds.map((ad) => (
          <div key={ad.id} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            {/* Top Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>
                  {ad.platform === "facebook" ? "📘" : ad.platform === "instagram" ? "📸" : "🎵"}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#fff" }}>{ad.brandName}</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{ad.adType} • رُصد {ad.dateSpied}</span>
                </div>
              </div>

              <span className="badge" style={{ background: "rgba(0, 255, 170, 0.1)", color: "var(--primary)", fontWeight: "bold", fontSize: "0.8rem" }}>
                {ad.engagementScore}
              </span>
            </div>

            {/* Ad Copy Box */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>النص الإعلاني (Ad Copy):</span>
              <p style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#e4e6eb", margin: 0 }}>"{ad.adCopy}"</p>
            </div>

            {/* Breakdown Analysis */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #ff4a4a", padding: "0.5rem 0.75rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>🎯 الخطاف (Hook):</span>
                <strong style={{ fontSize: "0.85rem", color: "#ff4a4a" }}>{ad.hook}</strong>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #00ffaa", padding: "0.5rem 0.75rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>🎁 العرض المقدم (Offer):</span>
                <strong style={{ fontSize: "0.85rem", color: "var(--primary)" }}>{ad.offer}</strong>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #1877f2", padding: "0.5rem 0.75rem", borderRadius: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>📣 الدعوة لاتخاذ إجراء (CTA):</span>
                <strong style={{ fontSize: "0.85rem", color: "#1877f2" }}>{ad.cta}</strong>
              </div>
            </div>

            {/* Strengths List */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#fff", display: "block", marginBottom: "0.5rem" }}>💪 أسرار قوة الإعلان:</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {ad.strengths.map((s, idx) => (
                  <li key={idx}>✅ {s}</li>
                ))}
              </ul>
            </div>

            {/* CTA Synergy Button */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "auto" }}>
              <button onClick={() => handleInspireCampaign(ad)} className="btn btn-primary" style={{ width: "100%", padding: "0.75rem", fontWeight: "bold", background: "linear-gradient(90deg, rgba(0,255,170,0.2), rgba(0,255,170,0.05))", border: "1px solid var(--primary)", color: "var(--primary)" }}>
                ✨ استلهام وتوليد حملة مشابهة بالذكاء الاصطناعي
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
