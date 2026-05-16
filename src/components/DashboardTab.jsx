import React from "react";

export default function DashboardTab({
  activeAccountId,
  campaigns,
  totalSpend,
  totalLeads,
  avgCpa,
  activeAdsCount,
  isLoading,
  activeAccordion,
  toggleAccordion,
  handleToggleAdStatus,
  settings,
}) {
  return (
    <>
      {/* Active Brand Information and Page Links */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.5rem",
          marginBottom: "1.5rem",
          background:
            "linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
          borderRight: "4px solid var(--primary)",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--primary)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "#fff",
              boxShadow: "0 8px 16px rgba(var(--primary-rgb), 0.2)",
            }}
          >
            {activeAccountId === "26739674035671488" ? "HB" : "HFL"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: "0.2rem",
                }}
              >
                {activeAccountId === "26739674035671488"
                  ? "HBrand Outlet"
                  : "HForLess Store"}
              </h3>
              <span style={{ 
                fontSize: "0.6rem", 
                padding: "0.1rem 0.4rem", 
                borderRadius: "4px", 
                background: settings.metaAccessToken ? "rgba(0, 255, 170, 0.1)" : "rgba(255, 170, 0, 0.1)",
                color: settings.metaAccessToken ? "var(--success)" : "#ffaa00",
                border: `1px solid ${settings.metaAccessToken ? "rgba(0, 255, 170, 0.2)" : "rgba(255, 170, 0, 0.2)"}`,
                marginLeft: "0.5rem"
              }}>
                {settings.metaAccessToken ? "LIVE ⚡" : "SIMULATION 🛠️"}
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
              {activeAccountId === "26739674035671488"
                ? "العلامة التجارية الفاخرة لملابس الأوتلت الكلاسيكية والكاجوال"
                : "وجهتك الأولى لتصفيات ملابس الموضة العصرية والعملية بأسعار منافسة"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.9rem" }}>
                {settings.currency === 'SAR' ? '🇸🇦' : settings.currency === 'AED' ? '🇦🇪' : '🇪🇬'}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: "600", textTransform: "uppercase" }}>
                نطاق الاستهداف: {settings.currency === 'SAR' ? 'السعودية' : settings.currency === 'AED' ? 'الإمارات' : 'مصر'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a
            href={
              activeAccountId === "26739674035671488"
                ? "https://www.facebook.com/profile.php?id=61574914810697"
                : "https://www.facebook.com/hforless/?locale=ar_AR"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
              border: "1px solid rgba(24, 119, 242, 0.3)",
              background: "rgba(24, 119, 242, 0.05)",
            }}
          >
            <span style={{ fontSize: "1rem" }}>🔵</span> فيسبوك
          </a>
          <a
            href={
              activeAccountId === "26739674035671488"
                ? "https://www.instagram.com/hbrand_outlet/?hl=ar"
                : "https://www.instagram.com/hforless.work/"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
              border: "1px solid rgba(225, 48, 108, 0.3)",
              background: "rgba(225, 48, 108, 0.05)",
            }}
          >
            <span style={{ fontSize: "1rem" }}>📸</span> إنستغرام
          </a>
          <a
            href={
              activeAccountId === "26739674035671488"
                ? "https://www.tiktok.com/@hbrand.outlet"
                : "https://www.tiktok.com/@file"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <span style={{ fontSize: "1rem" }}>🎵</span> تيك توك
          </a>
          <a
            href={
              activeAccountId === "26739674035671488"
                ? "https://hbrandoutlet.com/ar/"
                : "http://www.hforless.com"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
            }}
          >
            <span style={{ fontSize: "1rem" }}>🌐</span> زيارة المتجر الإلكتروني
          </a>
          <button
            onClick={() => window.print()}
            className="btn btn-success"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
              background: "linear-gradient(135deg, #00ffaa 0%, #00cc88 100%)",
              color: "#000",
              fontWeight: "bold",
              border: "none"
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>📊</span> تحميل تقرير الأداء (One-Click)
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <section className="stats-grid">
        <div className="glass-card stat-card primary animate-fade-in delay-100">
          <div className="stat-header">
            <span className="stat-title">إجمالي الميزانية المصروفة اليوم</span>
            <div className="stat-icon">📈</div>
          </div>
          <div className="stat-value">
            {settings?.currencySymbol}
            {totalSpend.toFixed(2)}
          </div>
          <div className="stat-trend trend-up">
            <span>+12.4%</span>
            <span>مقارنة بأمس</span>
          </div>
        </div>

        <div className="glass-card stat-card secondary animate-fade-in delay-200">
          <div className="stat-header">
            <span className="stat-title">
              العملاء المحتملين الفعليين (Leads)
            </span>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-value">{totalLeads}</div>
          <div className="stat-trend trend-up">
            <span>+34%</span>
            <span>معدل تحويل متصاعد</span>
          </div>
        </div>

        <div className="glass-card stat-card success animate-fade-in delay-300">
          <div className="stat-header">
            <span className="stat-title">متوسط سعر العميل (CPA)</span>
            <div className="stat-icon">🎯</div>
          </div>
          <div className="stat-value">
            {settings?.currencySymbol}
            {avgCpa.toFixed(2)}
          </div>
          <div className="stat-trend trend-down">
            <span>-18.2%</span>
            <span>تكلفة ممتازة ومثالية</span>
          </div>
        </div>

        <div className="glass-card stat-card warning animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="stat-header">
            <span className="stat-title">إعلانات نشطة تحت الأتمتة</span>
            <div className="stat-icon">🤖</div>
          </div>
          <div className="stat-value">{activeAdsCount}</div>
          <div className="stat-trend" style={{ color: "var(--text-muted)" }}>
            <span>نظام الأتمتة نشط</span>
          </div>
        </div>
      </section>
      {/* Budget Forecasting Section */}
      <section className="glass-card animate-fade-in" style={{ animationDelay: '0.5s', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📉</span> متنبئ الميزانية (AI Forecast)
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>معدل الصرف اليومي: {settings?.currencySymbol}{(totalSpend || 1200).toFixed(0)}</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>الأيام المتبقية التقريبية</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', textShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)' }}>12</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>بناءً على رصيد 15,000 {settings?.currencySymbol}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>توقعات الصرف لـ 7 أيام قادمة</span>
              <span style={{ fontWeight: 'bold' }}>{settings?.currencySymbol}{((totalSpend || 1200) * 7).toFixed(0)}</span>
            </div>
            
            {/* Simple Forecast Chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '100px', padding: '0 0.5rem' }}>
              {[0.4, 0.5, 0.45, 0.6, 0.8, 0.75, 0.9].map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ 
                    width: '100%', 
                    height: (h * 100) + '%', 
                    background: i === 6 ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.2)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.5s ease-out',
                    position: 'relative'
                  }}>
                    {i === 6 && <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem' }}>PEAK</div>}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
              💡 تنبيه: من المتوقع زيادة الصرف يوم الجمعة القادم بنسبة 15% بناءً على سلوك السوق.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-card animate-fade-in" style={{ animationDelay: '0.5s', marginBottom: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🗺️</span> تحليل الاستهداف والجمهور الإقليمي
          </h3>
          <span className="badge badge-active">نشط الآن</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--secondary)' }}>📍 المناطق والأحياء الأعلى تحويلاً</div>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {settings.currency === 'SAR' ? (
                <>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>الرياض (وسط المدينة)</span> <span style={{ color: 'var(--success)' }}>9.4%</span></li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>جدة (حي الروضة)</span> <span style={{ color: 'var(--success)' }}>8.2%</span></li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>الدمام / الخبر</span> <span style={{ color: 'var(--success)' }}>7.1%</span></li>
                </>
              ) : settings.currency === 'AED' ? (
                <>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>دبي (داون تاون)</span> <span style={{ color: 'var(--success)' }}>10.1%</span></li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>أبوظبي (ياس)</span> <span style={{ color: 'var(--success)' }}>8.5%</span></li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>الشارقة</span> <span style={{ color: 'var(--success)' }}>6.8%</span></li>
                </>
              ) : (
                <>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>القاهرة (التجمع/المعادي)</span> <span style={{ color: 'var(--success)' }}>7.5%</span></li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>الإسكندرية (سموحة)</span> <span style={{ color: 'var(--success)' }}>6.2%</span></li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>المنصورة / طنطا</span> <span style={{ color: 'var(--success)' }}>5.4%</span></li>
                </>
              )}
            </ul>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--primary)' }}>💎 اهتمامات الجمهور الذهبية</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(settings.currency === 'SAR' || settings.currency === 'AED' ? 
                ['الماركات العالمية', 'السياحة والسفر', 'السيارات الفاخرة', 'تطبيقات التوصيل', 'عروض المواسم'] : 
                ['خصومات الجمعة', 'الأوتلت', 'تطبيقات التقسيط (Valu)', 'الموضة العصرية', 'عروض التوفير']
              ).map(tag => (
                <span key={tag} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'rgba(var(--primary-rgb), 0.1)', border: '1px solid rgba(var(--primary-rgb), 0.2)', borderRadius: '100px' }}>{tag}</span>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
              💡 نصيحة AI: استهداف "الجمهور المشابه" (Lookalike 1%) في {settings.currency === 'SAR' ? 'المملكة' : 'هذه المنطقة'} يحقق حالياً أفضل ROI.
            </p>
          </div>
        </div>
      </section>


      {/* Live Campaigns and Ad Control panel */}
      <section className="glass-card">
        <h3
          style={{
            marginBottom: "1.25rem",
            fontSize: "1.15rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>🎯</span> هيكل الحملات النشطة وإدارة الحالات
        </h3>

        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <span className="spinner"></span> جاري جلب أحدث بيانات الحملات من
            Meta Ads API...
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                style={{
                  border: "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "rgba(255, 255, 255, 0.005)",
                }}
              >
                {/* Campaign Accordion Header */}
                <div
                  onClick={() => toggleAccordion(camp.id)}
                  style={{
                    padding: "1.25rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>
                      {activeAccordion[camp.id] ? "▼" : "▶"}
                    </span>
                    <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                      {camp.name}
                    </span>
                    <span
                      className={`badge ${camp.status === "ACTIVE" ? "badge-active" : "badge-paused"}`}
                    >
                      {camp.status === "ACTIVE" ? "نشط" : "موقف"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      fontFamily: "var(--font-english)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div>
                      المصروف:{" "}
                      <strong>
                        {settings?.currencySymbol}
                        {camp.spend.toFixed(2)}
                      </strong>
                    </div>
                    <div>
                      العملاء:{" "}
                      <strong style={{ color: "var(--secondary)" }}>
                        {camp.leads}
                      </strong>
                    </div>
                    <div>
                      سعر العميل:{" "}
                      <strong
                        style={{
                          color:
                            camp.cpa > 5 ? "var(--danger)" : "var(--primary)",
                        }}
                      >
                        {settings?.currencySymbol}
                        {camp.cpa.toFixed(2)}
                      </strong>
                    </div>
                    <div>
                      الميزانية اليومية:{" "}
                      <strong>
                        {settings?.currencySymbol}
                        {camp.budget.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Campaign Content - Adsets & Ads */}
                {activeAccordion[camp.id] && (
                  <div
                    style={{
                      padding: "1rem",
                      background: "#090a0f",
                      borderTop: "1px solid var(--border-glass)",
                    }}
                  >
                    {camp.adsets.map((adset) => (
                      <div
                        key={adset.id}
                        style={{
                          border: "1px solid rgba(255,255,255,0.04)",
                          borderRadius: "12px",
                          padding: "1rem",
                          marginBottom: "1rem",
                          background: "rgba(255,255,255,0.01)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1rem",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            paddingBottom: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span style={{ color: "var(--secondary)" }}>
                              📁
                            </span>
                            <span
                              style={{ fontWeight: "600", fontSize: "0.85rem" }}
                            >
                              {adset.name}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              fontFamily: "var(--font-english)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            ميزانية المجموعة:{" "}
                            <strong style={{ color: "#fff" }}>
                              {settings?.currencySymbol}
                              {adset.budget.toFixed(2)}/يومياً
                            </strong>
                          </div>
                        </div>

                        {/* Ads Table */}
                        <div className="table-container">
                          <table className="modern-table">
                            <thead>
                              <tr>
                                <th>اسم الإعلان الفردي (Ad)</th>
                                <th>الحالة</th>
                                <th>المبلغ المصروف</th>
                                <th>العملاء (Leads)</th>
                                <th>سعر العميل الحالي (CPA)</th>
                                <th style={{ textAlign: "center" }}>
                                  التحكم اليدوي
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {adset.ads.map((ad) => (
                                <tr key={ad.id}>
                                  <td style={{ fontWeight: "600" }}>
                                    <span
                                      style={{
                                        marginRight: "0.5rem",
                                        color: "var(--primary)",
                                      }}
                                    >
                                      🖼️
                                    </span>
                                    {ad.name}
                                    {ad.fatigue && (
                                      <span
                                        style={{
                                          marginRight: "0.5rem",
                                          background: "rgba(255, 71, 87, 0.2)",
                                          color: "#ff4757",
                                          padding: "0.15rem 0.4rem",
                                          borderRadius: "4px",
                                          fontSize: "0.7rem",
                                          fontWeight: "700",
                                          border: "1px solid rgba(255, 71, 87, 0.3)",
                                          display: "inline-flex",
                                          alignItems: "center"
                                        }}
                                      >
                                        ⚠️ مجهد
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <span
                                      className={`badge ${ad.status === "ACTIVE" ? "badge-active" : "badge-paused"}`}
                                    >
                                      {ad.status === "ACTIVE"
                                        ? "نشط"
                                        : "موقف"}
                                    </span>
                                  </td>
                                  <td
                                    className="english-font"
                                    style={{
                                      fontFamily: "var(--font-english)",
                                    }}
                                  >
                                    {settings?.currencySymbol}
                                    {ad.spend.toFixed(2)}
                                  </td>
                                  <td
                                    className="english-font"
                                    style={{
                                      fontFamily: "var(--font-english)",
                                      color: "var(--secondary)",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {ad.leads}
                                  </td>
                                  <td
                                    className="english-font"
                                    style={{
                                      fontFamily: "var(--font-english)",
                                      fontWeight: "700",
                                      color:
                                        ad.cpa > 5
                                          ? "var(--danger)"
                                          : "var(--primary)",
                                    }}
                                  >
                                    {settings?.currencySymbol}
                                    {ad.cpa.toFixed(2)}
                                    <div className="bar-indicator">
                                      <div
                                        className="bar-fill"
                                        style={{
                                          width: `${Math.min((ad.cpa / 10) * 100, 100)}%`,
                                          background:
                                            ad.cpa > 5
                                              ? "var(--danger)"
                                              : "var(--primary)",
                                        }}
                                      ></div>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <button
                                      className={`btn btn-secondary`}
                                      style={{
                                        padding: "0.4rem 0.8rem",
                                        fontSize: "0.75rem",
                                      }}
                                      onClick={() =>
                                        handleToggleAdStatus(
                                          camp.id,
                                          adset.id,
                                          ad.id,
                                          ad.status,
                                        )
                                      }
                                    >
                                      {ad.status === "ACTIVE"
                                        ? "🛑 إيقاف مؤقت"
                                        : "▶️ إعادة تشغيل"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
