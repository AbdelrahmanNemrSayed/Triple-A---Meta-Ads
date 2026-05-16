import React from "react";

export default function SettingsTab({
  settings,
  setSettings,
  handleSaveSettings,
  handleDiscoverAccounts,
  isDiscovering,
  setActiveAccountId,
  handleTestNotifications,
  isTriggering,
  handleExchangeToken,
  shortLivedToken,
  setShortLivedToken,
  exchangeAppId,
  setExchangeAppId,
  exchangeAppSecret,
  setExchangeAppSecret,
  isExchanging,
}) {
  return (
    <div className="content-grid-2">
      {/* Main Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.15rem",
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "0.75rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>🔗 إعدادات الربط وحسابات ميتا وقنوات الإرسال</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ 
              fontSize: "0.7rem", 
              padding: "0.2rem 0.6rem", 
              borderRadius: "20px", 
              background: settings.metaAccessToken ? "rgba(0, 255, 170, 0.1)" : "rgba(255, 0, 0, 0.1)",
              color: settings.metaAccessToken ? "var(--success)" : "var(--danger)",
              border: `1px solid ${settings.metaAccessToken ? "rgba(0, 255, 170, 0.2)" : "rgba(255, 0, 0, 0.2)"}`
            }}>
              Meta: {settings.metaAccessToken ? "متصل ✅" : "غير مفعل ❌"}
            </span>
            <span style={{ 
              fontSize: "0.7rem", 
              padding: "0.2rem 0.6rem", 
              borderRadius: "20px", 
              background: settings.telegramBotToken ? "rgba(0, 255, 170, 0.1)" : "rgba(255, 0, 0, 0.1)",
              color: settings.telegramBotToken ? "var(--success)" : "var(--danger)",
              border: `1px solid ${settings.telegramBotToken ? "rgba(0, 255, 170, 0.2)" : "rgba(255, 0, 0, 0.2)"}`
            }}>
              Telegram: {settings.telegramBotToken ? "نشط 🔔" : "غير مفعل ❌"}
            </span>
          </div>
        </h3>

        <div className="form-group">
          <label>مفتاح الوصول لحساب ميتا (Meta Graph Access Token)</label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input
              type="password"
              placeholder="EAAZB..."
              value={settings.metaAccessToken || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  metaAccessToken: e.target.value,
                })
              }
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className={`btn btn-secondary ${isDiscovering ? "disabled" : ""}`}
              onClick={handleDiscoverAccounts}
              disabled={isDiscovering}
              style={{ whiteSpace: "nowrap", minWidth: "150px" }}
            >
              {isDiscovering ? "🔄 جاري البحث..." : "🔍 استكشاف الحسابات"}
            </button>
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.25rem",
            }}
          >
            يتيح السكربت الاتصال الآمن مع Meta Business Manager. اضغط على{" "}
            <strong>استكشاف الحسابات</strong> لسحب كافة الحسابات الإعلانية
            المرتبطة بتلقائية تامة!
          </p>
        </div>

        <div className="form-group">
          <label>الحساب الإعلاني الافتراضي (Meta Ad Account ID)</label>
          <select
            value={settings.metaAdAccountId || ""}
            onChange={(e) => {
              const val = e.target.value;
              setSettings({ ...settings, metaAdAccountId: val });
              setActiveAccountId(val);
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
                style={{ background: "#0c0d12" }}
              >
                {acc.name} ({acc.id})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>مفتاح بوت تيليجرام (Telegram Bot Token)</label>
            <input
              type="password"
              placeholder="123456:ABC-DEF..."
              value={settings.telegramBotToken || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  telegramBotToken: e.target.value,
                })
              }
            />
          </div>
          <div className="form-group">
            <label>معرّف المحادثة بتيليجرام (Chat ID)</label>
            <input
              type="text"
              placeholder="987654321"
              value={settings.telegramChatId || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  telegramChatId: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>فترة تكرار الفحص التلقائي بالدقائق</label>
            <select
              value={settings.checkInterval || "30"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  checkInterval: e.target.value,
                })
              }
            >
              <option value="5">كل 5 دقائق (أداء مكثف)</option>
              <option value="15">كل 15 دقيقة</option>
              <option value="30">كل 30 دقيقة (موصى به)</option>
              <option value="60">كل ساعة</option>
            </select>
          </div>
          <div className="form-group">
            <label>العملة ورمزها المستخدم</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="USD"
                style={{ flex: 1 }}
                value={settings.currency || ""}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="$"
                style={{ width: "60px" }}
                value={settings.currencySymbol || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    currencySymbol: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>
            معرّف جدول بيانات جوجل (Google Sheet ID - لتسجيل التقارير)
          </label>
          <input
            type="text"
            placeholder="1aBcDeFgHiJkLmNoP..."
            value={settings.googleSheetId || ""}
            onChange={(e) =>
              setSettings({ ...settings, googleSheetId: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>
            مفتاح جوجل جيميناي (Google Gemini API Key - لتوليد الإعلانات الذكية)
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={settings.geminiApiKey || ""}
            onChange={(e) =>
              setSettings({ ...settings, geminiApiKey: e.target.value })
            }
          />
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border-glass)",
            margin: "1rem 0",
            padding: "1.5rem 0",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <h4
            style={{
              color: "#00ffaa",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>✉️</span> إعدادات البريد الإلكتروني المتقدم (التقارير اليومية
            والتنبيهات)
          </h4>

          <div className="form-group" style={{ margin: 0 }}>
            <label>البريد الإلكتروني المستلم للتنبيهات والتقارير</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={settings.notificationEmail || ""}
              onChange={(e) =>
                setSettings({ ...settings, notificationEmail: e.target.value })
              }
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "0.25rem",
              }}
            >
              ستصلك التقارير اليومية وتنبيهات الإيقاف / التعديل تلقائياً على هذا
              البريد.
            </p>
          </div>

          <div className="form-row" style={{ marginTop: "0.5rem" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>خادم إرسال البريد (SMTP Host)</label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                value={settings.smtpHost || "smtp.gmail.com"}
                onChange={(e) =>
                  setSettings({ ...settings, smtpHost: e.target.value })
                }
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>المنفذ (SMTP Port)</label>
              <input
                type="text"
                placeholder="465"
                value={settings.smtpPort || "465"}
                onChange={(e) =>
                  setSettings({ ...settings, smtpPort: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label>بريد الإرسال (SMTP Username)</label>
              <input
                type="email"
                placeholder="sender@gmail.com"
                value={settings.smtpUser || ""}
                onChange={(e) =>
                  setSettings({ ...settings, smtpUser: e.target.value })
                }
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>كلمة المرور / App Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={settings.smtpPass || ""}
                onChange={(e) =>
                  setSettings({ ...settings, smtpPass: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <button type="submit" className="btn btn-primary">
            💾 حفظ الإعدادات والتكاملات
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${isTriggering ? "disabled" : ""}`}
            onClick={handleTestNotifications}
            disabled={isTriggering}
            style={{
              background: "rgba(0, 255, 170, 0.15)",
              color: "#00ffaa",
              borderColor: "rgba(0, 255, 170, 0.3)",
            }}
          >
            {isTriggering
              ? "🔄 جاري إرسال التنبيه..."
              : "🔔 إرسال تنبيه تجريبي تفاعلي الآن (Telegram & Email)"}
          </button>
        </div>
      </form>

      {/* Quick Tutorial Help Panel */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          className="glass-card"
          style={{ borderRight: "4px solid var(--primary)" }}
        >
          <h4
            style={{
              marginBottom: "0.75rem",
              color: "var(--primary)",
              fontSize: "1rem",
            }}
          >
            💡 كيف أحصل على معطيات الربط؟
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <li>
              <strong>1. مفتاح Meta Token:</strong>
              <p>
                ادخل إلى Meta Developers Console واصنع تطبيق Business، ثم من
                واجهة Graph API Explorer قم بطلب Token طويل المدى بصلاحيات{" "}
                <code>ads_management</code> و <code>ads_read</code>.
              </p>
            </li>
            <li>
              <strong>2. معرّف حساب الإعلانات:</strong>
              <p>
                ستجده في رابط مدير الإعلانات (Ads Manager) الخاص بك، يبدأ بـ{" "}
                <code>act_</code> متبوعاً بسلسلة أرقام.
              </p>
            </li>
            <li>
              <strong>3. تنبيهات تيليجرام:</strong>
              <p>
                قم بمراسلة <code>@BotFather</code> على تيليجرام لتنشئ بوت جديد
                وتحصل على Token البوت، ثم ابعث رسالة للبوت واستخدم{" "}
                <code>@userinfobot</code> لتعرف الـ Chat ID الخاص بك.
              </p>
            </li>
          </ul>
        </div>

        <div
          className="glass-card"
          style={{ borderRight: "4px solid var(--secondary)" }}
        >
          <h4
            style={{
              marginBottom: "0.75rem",
              color: "var(--secondary)",
              fontSize: "1rem",
            }}
          >
            🛡️ أمن وسرية بياناتك الإعلانية
          </h4>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              lineHeight: "1.5",
            }}
          >
            جميع مفاتيحك الإعلانية ورموز الوصول تُحفظ محلياً وبشكل مشفر وسري
            داخل السكربت الخاص بك، ولا يتم إرسالها لأي خوادم خارجية مطلقاً. تحكم
            كامل 100% في أمان ميزانيتك وحملاتك.
          </p>
        </div>

        <div
          className="glass-card"
          style={{
            borderRight: "4px solid var(--success)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <h4
            style={{
              color: "var(--success)",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ⚡ مساعد تمديد وتوليد الرموز لـ 60 يوماً تلقائياً
          </h4>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              lineHeight: "1.4",
            }}
          >
            بدلاً من التمديد اليدوي المتعب، الصق التوكن القصير ومعلومات تطبيقك
            ليقوم النظام بطلب تمديد الرمز تلقائياً من فيسبوك وحفظه!
          </p>
          <form
            onSubmit={handleExchangeToken}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem" }}>
                الرمز المؤقت (Short-Lived Token)
              </label>
              <input
                type="password"
                placeholder="EAAZB..."
                value={shortLivedToken}
                onChange={(e) => setShortLivedToken(e.target.value)}
                style={{
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.8rem",
                  width: "100%",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "4px",
                  color: "#fff",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label style={{ fontSize: "0.75rem" }}>
                  معرف التطبيق (App ID)
                </label>
                <input
                  type="text"
                  placeholder="123456789..."
                  value={exchangeAppId}
                  onChange={(e) => setExchangeAppId(e.target.value)}
                  style={{
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.8rem",
                    width: "100%",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "4px",
                    color: "#fff",
                  }}
                />
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label style={{ fontSize: "0.75rem" }}>
                  مفتاح السر (App Secret)
                </label>
                <input
                  type="password"
                  placeholder="abc123xyz..."
                  value={exchangeAppSecret}
                  onChange={(e) => setExchangeAppSecret(e.target.value)}
                  style={{
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.8rem",
                    width: "100%",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "4px",
                    color: "#fff",
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              className={`btn btn-success ${isExchanging ? "disabled" : ""}`}
              disabled={isExchanging}
              style={{
                marginTop: "0.4rem",
                padding: "0.5rem",
                fontSize: "0.85rem",
                width: "100%",
              }}
            >
              {isExchanging
                ? "🔄 جاري تمديد الرمز..."
                : "🔑 تمديد وحفظ الرمز لـ 60 يوم تلقائياً"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
