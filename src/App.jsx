import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import DashboardTab from "./components/DashboardTab";
import RulesTab from "./components/RulesTab";
import LogsTab from "./components/LogsTab";
import SettingsTab from "./components/SettingsTab";
import LeadsTab from "./components/LeadsTab";
import BrandBattleTab from "./components/BrandBattleTab";
import AiWriterTab from "./components/AiWriterTab";
import RoasSimulatorTab from "./components/RoasSimulatorTab";
import AbTestGeneratorTab from "./components/AbTestGeneratorTab";
import CompetitorSpyTab from "./components/CompetitorSpyTab";
import RuleModal from "./components/RuleModal";
import LoginPage from "./components/LoginPage";
import AiConsultant from "./components/AiConsultant";
import axios from "axios";

// Configure axios to include token
const token = localStorage.getItem('triple_a_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeChartMetric, setActiveChartMetric] = useState("roi");
  const [campaigns, setCampaigns] = useState([]);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({
    metaAccessToken: "",
    metaAdAccountId: "26739674035671488",
    metaAdAccountsList: [
      { id: "26739674035671488", name: "HBrand" },
      { id: "965194625872456", name: "HForLess" },
    ],
    telegramBotToken: "",
    telegramChatId: "",
    googleSheetId: "",
    geminiApiKey: "",
    checkInterval: "30",
    currency: "EGP",
    currencySymbol: "ج.م",
    notificationEmail: "",
    smtpHost: "smtp.gmail.com",
    smtpPort: "465",
    smtpUser: "",
    smtpPass: "",
  });

  const [activeAccountId, setActiveAccountId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState({});
  const [targetRegion, setTargetRegion] = useState("SA");
  const regions = {
    SA: { name: "السعودية", currency: "SAR", symbol: "ر.س", flag: "🇸🇦" },
    EG: { name: "مصر", currency: "EGP", symbol: "ج.م", flag: "🇪🇬" },
    AE: { name: "الإمارات", currency: "AED", symbol: "د.إ", flag: "🇦🇪" },
    US: { name: "عالمي", currency: "USD", symbol: "$", flag: "🌍" },
  };

  const handleRegionChange = (regionCode) => {
    const reg = regions[regionCode];
    setTargetRegion(regionCode);
    setSettings(prev => ({
      ...prev,
      currency: reg.currency,
      currencySymbol: reg.symbol
    }));
  };

  const [logFilter, setLogFilter] = useState("all");

  // New Rule Form State
  const [newRule, setNewRule] = useState({
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

  const consoleEndRef = useRef(null);

  const handleLogin = (newToken) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setIsLoggedIn(true);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('triple_a_token');
    localStorage.removeItem('triple_a_user');
    delete axios.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
  };

  const fetchData = async (selectedAccId = null) => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    const targetAccId = selectedAccId || activeAccountId || "26739674035671488";
    try {
      const campRes = await fetch(`/api/campaigns?accountId=${targetAccId}&region=${targetRegion}`);
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData);
      }

      const rulesRes = await fetch("/api/rules");
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData);
      }

      const logsRes = await fetch("/api/logs");
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }

      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        // Sync active account selection if available in settings
        if (settingsData.metaAdAccountId && !selectedAccId && !activeAccountId) {
          setActiveAccountId(settingsData.metaAdAccountId);
        }
      }

      const leadsRes = await fetch(`/api/leads?region=${targetRegion}`);
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData);
      }

      const compareRes = await fetch(`/api/brands/compare?region=${targetRegion}`);
      if (compareRes.ok) {
        const compareData = await compareRes.json();
        setBrandComparison(compareData);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!activeAccountId) return;
    // Auto-poll logs and campaign stats every 10 seconds to keep the simulator feeling alive
    const interval = setInterval(() => {
      fetch("/api/logs").then((r) => r.ok && r.json().then(setLogs));
      fetch(`/api/leads?region=${targetRegion}`).then((r) => r.ok && r.json().then(setLeads));
      fetch(`/api/brands/compare?region=${targetRegion}`).then((r) => r.ok && r.json().then(setBrandComparison));
      fetch(`/api/campaigns?accountId=${activeAccountId}&region=${targetRegion}`).then(
        (r) => r.ok && r.json().then(setCampaigns),
      );
    }, 10000);
    return () => clearInterval(interval);
  }, [activeAccountId]);

  // Scroll to bottom of terminal when logs update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Token exchange assistant states
  const [shortLivedToken, setShortLivedToken] = useState("");
  const [exchangeAppId, setExchangeAppId] = useState("");
  const [exchangeAppSecret, setExchangeAppSecret] = useState("");
  const [isExchanging, setIsExchanging] = useState(false);

  // Lead tracking states
  const [leads, setLeads] = useState([]);
  const [brandComparison, setBrandComparison] = useState(null);
  const [manualLeadName, setManualLeadName] = useState("");
  const [manualLeadPhone, setManualLeadPhone] = useState("");
  const [manualLeadProduct, setManualLeadProduct] = useState("");
  const [manualLeadBrand, setManualLeadBrand] = useState("HBrand");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadBrandFilter, setLeadBrandFilter] = useState("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");

  // AI Ad Copy Generator states
  const [productName, setProductName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("HBrand");
  const [offerText, setOfferText] = useState("");
  const [selectedTone, setSelectedTone] = useState("egyptian");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedResults, setGeneratedResults] = useState(null);

  const handleGenerateAdCopy = async (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert("⚠️ من فضلك قم بكتابة اسم المنتج المراد صياغة الإعلان له.");
      return;
    }
    setIsGenerating(true);
    setGeneratedResults(null);
    try {
      const response = await fetch("/api/ai-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          brand: selectedBrand,
          offer: offerText,
          tone: selectedTone
        })
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedResults(data);
      } else {
        const errorData = await response.json();
        alert(`❌ فشل التوليد: ${errorData.error || "خطأ غير معروف"}`);
      }
    } catch (err) {
      alert(`❌ خطأ أثناء الاتصال بالخادم الذكي: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAdImage = async () => {
    if (!generatedResults?.imagePrompt) {
      alert("⚠️ يرجى توليد النص الإعلاني أولاً للحصول على وصف للصورة.");
      return;
    }
    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: generatedResults.imagePrompt,
          productName
        })
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedResults(prev => ({ ...prev, adImage: data.imageUrl }));
      } else {
        alert("❌ فشل توليد الصورة حالياً. يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle manual trigger of automation rules check
  const handleTriggerCheck = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: activeAccountId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setCampaigns(data.mockCampaigns);
        alert(
          "🎯 تم تشغيل فحص القواعد الذكية وجدولة الحساب الإعلاني المختار بنجاح! تفقد التنبيهات وسجل السجلات.",
        );
      } else {
        alert("❌ عذراً، حدث خطأ أثناء تشغيل عملية الفحص.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggering(false);
    }
  };

  // Trigger automatic accounts discovery
  const handleDiscoverAccounts = async () => {
    if (!settings.metaAccessToken) {
      alert(
        "⚠️ يرجى إدخال مفتاح الوصول لحساب ميتا (Access Token) أولاً قبل بدء الاستكشاف.",
      );
      return;
    }
    setIsDiscovering(true);
    try {
      const res = await fetch("/api/settings/discover-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metaAccessToken: settings.metaAccessToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings((prev) => ({
          ...prev,
          metaAdAccountsList: data.accountsList,
          metaAdAccountId: data.selectedId,
          metaAccessToken: settings.metaAccessToken,
        }));
        setActiveAccountId(data.selectedId);
        fetchData(data.selectedId);
        alert(
          `🎉 نجاح! تم استكشاف واستيراد ${data.accountsList.length} حساب إعلاني مرتبط تلقائياً بنجاح!`,
        );
      } else {
        alert(
          `❌ فشل استكشاف الحسابات: ${data.error || "تأكد من صلاحية الـ Access Token وصلاحيات التطبيق."}`,
        );
      }
    } catch (err) {
      alert(`❌ خطأ أثناء الاتصال بالخادم: ${err.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleExchangeToken = async (e) => {
    e.preventDefault();
    if (!shortLivedToken.trim() || !exchangeAppId.trim() || !exchangeAppSecret.trim()) {
      alert("⚠️ يرجى ملء كافة حقول مساعد تمديد الرموز (التوكن المؤقت، معرف التطبيق، ومفتاح السر).");
      return;
    }
    setIsExchanging(true);
    try {
      const res = await fetch("/api/settings/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortLivedToken,
          appId: exchangeAppId,
          appSecret: exchangeAppSecret
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(prev => ({
          ...prev,
          metaAccessToken: data.longLivedToken
        }));
        alert("🎉 مبروك! تم تمديد صلاحية رمز الوصول لـ 60 يوماً وتحديثه في لوحة التحكم بنجاح!");
        setShortLivedToken("");
        setExchangeAppId("");
        setExchangeAppSecret("");
      } else {
        alert(`❌ فشل التمديد: ${data.error || "تأكد من صحة البيانات والمفاتيح المدخلة وصلاحيتها."}`);
      }
    } catch (err) {
      alert(`❌ خطأ أثناء الاتصال بالخادم: ${err.message}`);
    } finally {
      setIsExchanging(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const res = await fetch("/api/leads/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Error updating lead status:", err);
    }
  };

  const handleCreateManualLead = async (e) => {
    e.preventDefault();
    if (!manualLeadName || !manualLeadPhone || !manualLeadProduct) {
      alert("❌ يرجى ملء كافة البيانات المطلوبة للمشترك أو العميل المحتمل.");
      return;
    }
    setIsSubmittingLead(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualLeadName,
          phone: manualLeadPhone,
          product: manualLeadProduct,
          brand: manualLeadBrand
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setManualLeadName("");
        setManualLeadPhone("");
        setManualLeadProduct("");
        alert("🎉 تم إضافة العميل المحتمل بنجاح وتفعيل إشعار تيليجرام وتوثيق السجل!");
      } else {
        alert("❌ حدث خطأ أثناء إضافة العميل.");
      }
    } catch (err) {
      console.error(err);
      alert(`❌ خطأ أثناء الاتصال بالخادم: ${err.message}`);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Toggle single rule status
  const handleToggleRule = async (rule) => {
    const updatedRule = { ...rule, isActive: !rule.isActive };
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRule),
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
        fetch("/api/logs").then((r) => r.ok && r.json().then(setLogs));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Rule
  const handleDeleteRule = async (id) => {
    if (!confirm("هل أنت متأكد من حذف قاعدة الأتمتة هذه؟")) return;
    try {
      const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
        fetch("/api/logs").then((r) => r.ok && r.json().then(setLogs));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create/Update Rule Save
  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
        setShowModal(false);
        fetch("/api/logs").then((r) => r.ok && r.json().then(setLogs));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Ad status manually (Pause/Active)
  const handleToggleAdStatus = async (
    campaignId,
    adsetId,
    adId,
    currentStatus,
  ) => {
    const targetStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch("/api/ads/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: activeAccountId,
          campaignId,
          adsetId,
          adId,
          status: targetStatus,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.mockCampaigns);
        fetch("/api/logs").then((r) => r.ok && r.json().then(setLogs));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save integration settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        alert(
          "💾 تم حفظ كافة إعدادات الربط وتحديث فترات المراقبة الآلية بنجاح!",
        );
        fetch("/api/logs").then((r) => r.ok && r.json().then(setLogs));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotifications = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: settings.telegramBotToken,
          telegramChatId: settings.telegramChatId,
          notificationEmail: settings.notificationEmail,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        let msg = "🔔 تم إرسال التنبيه التجريبي التفاعلي بنجاح!\n\n";
        if (settings.telegramBotToken && settings.telegramChatId) {
          msg += data.telegramSuccess ? "✅ تليجرام: تم إرسال التنبيه اللحظي مع الأزرار التفاعلية\n" : "⚠️ تليجرام: تأكد من التوكن ومعرف المحادثة\n";
        }
        if (settings.notificationEmail) {
          msg += data.emailSuccess ? "✅ البريد الإلكتروني: تم الإرسال بنجاح إلى البريد المدخل\n" : "⚠️ البريد الإلكتروني: تم تفعيل وضع المحاكاة اللحظية\n";
        }
        alert(msg);
        fetch("/api/logs").then((r) => r.ok && r.json().then(setLogs));
      } else {
        alert("❌ حدث خطأ أثناء إرسال التنبيه التجريبي.");
      }
    } catch (err) {
      console.error(err);
      alert(`❌ خطأ أثناء الاتصال: ${err.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  // Clear log visualizer
  const handleClearLogs = async () => {
    if (!confirm("هل تريد تفريغ لوحة السجلات بالكامل؟")) return;
    try {
      const res = await fetch("/api/logs/clear", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle campaign accordion
  const toggleAccordion = (id) => {
    setActiveAccordion((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculate high level KPI totals
  const totalSpend = campaigns.reduce(
    (sum, c) => sum + (c.status === "ACTIVE" ? c.spend : 0),
    0,
  );
  const totalLeads = campaigns.reduce(
    (sum, c) => sum + (c.status === "ACTIVE" ? c.leads : 0),
    0,
  );
  const avgCpa =
    totalLeads > 0 ? parseFloat((totalSpend / totalLeads).toFixed(2)) : 0;
  const activeAdsCount = campaigns.reduce(
    (sum, c) =>
      sum +
      (c.status === "ACTIVE"
        ? c.adsets.reduce(
            (sSum, s) =>
              sSum + s.ads.filter((a) => a.status === "ACTIVE").length,
            0,
          )
        : 0),
    0,
  );

  // Filter logs for the console
  const filteredLogs = logs.filter((log) => {
    if (logFilter === "all") return true;
    return log.type === logFilter;
  });

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* --- SIDEBAR NAVIGATION --- */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        activeAccountId={activeAccountId}
        handleLogout={handleLogout}
        targetRegion={targetRegion}
        regions={regions}
        handleRegionChange={handleRegionChange}
      />

      <main className="main-content animate-fade-in">
        {/* --- TOP ACCOUNT HEADER BAR --- */}
        <Header
          activeTab={activeTab}
          settings={settings}
          activeAccountId={activeAccountId}
          setActiveAccountId={setActiveAccountId}
          fetchData={fetchData}
          handleTriggerCheck={handleTriggerCheck}
          isTriggering={isTriggering}
          setShowModal={setShowModal}
        />

        {/* --- CAMPAIGNS DASHBOARD TAB --- */}
        {activeTab === "dashboard" && (
          <div className="tab-content animate-fade-in delay-100">
            <DashboardTab
              totalSpend={totalSpend}
              totalLeads={totalLeads}
              avgCpa={avgCpa}
              activeAdsCount={activeAdsCount}
              settings={settings}
              campaigns={campaigns}
              activeAccordion={activeAccordion}
              toggleAccordion={toggleAccordion}
              handleToggleAdStatus={handleToggleAdStatus}
              activeAccountId={activeAccountId}
            />
          </div>
        )}

        {/* --- AUTOMATION RULES TAB --- */}
        {activeTab === "rules" && (
          <div className="tab-content animate-fade-in delay-100">
            <RulesTab
              rules={rules}
              handleToggleRule={handleToggleRule}
              handleDeleteRule={handleDeleteRule}
              settings={settings}
              setNewRule={setNewRule}
              setShowModal={setShowModal}
            />
          </div>
        )}

        {/* --- TERMINAL LOGS TAB --- */}
        {activeTab === "logs" && (
          <div className="tab-content animate-fade-in delay-100">
            <LogsTab
              logFilter={logFilter}
              setLogFilter={setLogFilter}
              filteredLogs={filteredLogs}
              fetchData={fetchData}
              handleClearLogs={handleClearLogs}
              consoleEndRef={consoleEndRef}
            />
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === "settings" && (
          <div className="tab-content animate-fade-in delay-100">
            <SettingsTab
              settings={settings}
              setSettings={setSettings}
              handleSaveSettings={handleSaveSettings}
              handleDiscoverAccounts={handleDiscoverAccounts}
              isDiscovering={isDiscovering}
              setActiveAccountId={setActiveAccountId}
              handleTestNotifications={handleTestNotifications}
              isTriggering={isTriggering}
              shortLivedToken={shortLivedToken}
              setShortLivedToken={setShortLivedToken}
              exchangeAppId={exchangeAppId}
              setExchangeAppId={setExchangeAppId}
              exchangeAppSecret={exchangeAppSecret}
              setExchangeAppSecret={setExchangeAppSecret}
              handleExchangeToken={handleExchangeToken}
              isExchanging={isExchanging}
            />
          </div>
        )}

        {/* --- LEADS TRACKER TAB --- */}
        {activeTab === "leads-tracker" && (
          <div className="tab-content animate-fade-in delay-100">
            <LeadsTab
              leads={leads}
              manualLeadName={manualLeadName}
              setManualLeadName={setManualLeadName}
              manualLeadPhone={manualLeadPhone}
              setManualLeadPhone={setManualLeadPhone}
              manualLeadProduct={manualLeadProduct}
              setManualLeadProduct={setManualLeadProduct}
              manualLeadBrand={manualLeadBrand}
              setManualLeadBrand={setManualLeadBrand}
              isSubmittingLead={isSubmittingLead}
              handleCreateManualLead={handleCreateManualLead}
              leadBrandFilter={leadBrandFilter}
              setLeadBrandFilter={setLeadBrandFilter}
              leadStatusFilter={leadStatusFilter}
              setLeadStatusFilter={setLeadStatusFilter}
              handleUpdateLeadStatus={handleUpdateLeadStatus}
            />
          </div>
        )}

        {/* --- BRAND BATTLE TAB --- */}
        {activeTab === "brand-battle" && (
          <div className="tab-content animate-fade-in delay-100">
            <BrandBattleTab
              brandComparison={brandComparison}
              activeChartMetric={activeChartMetric}
              setActiveChartMetric={setActiveChartMetric}
              settings={settings}
            />
          </div>
        )}

        {/* --- AI WRITER TAB --- */}
        {activeTab === "ai-writer" && (
          <div className="tab-content animate-fade-in delay-100">
            <AiWriterTab
              productName={productName}
              setProductName={setProductName}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              offerText={offerText}
              setOfferText={setOfferText}
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              isGenerating={isGenerating}
              handleGenerateAdCopy={handleGenerateAdCopy}
              generatedResults={generatedResults}
              isGeneratingImage={isGeneratingImage}
              handleGenerateAdImage={handleGenerateAdImage}
            />
          </div>
        )}

        {/* --- ROAS SIMULATOR TAB --- */}
        {activeTab === "roas-simulator" && (
          <div className="tab-content animate-fade-in delay-100">
            <RoasSimulatorTab settings={settings} />
          </div>
        )}

        {/* --- AB TEST GENERATOR TAB --- */}
        {activeTab === "ab-test-generator" && (
          <div className="tab-content animate-fade-in delay-100">
            <AbTestGeneratorTab settings={settings} />
          </div>
        )}

        {/* --- COMPETITOR SPY TAB --- */}
        {activeTab === "competitor-spy" && (
          <div className="tab-content animate-fade-in delay-100">
            <CompetitorSpyTab
              setActiveTab={setActiveTab}
              setOfferText={setOfferText}
              targetRegion={targetRegion}
              regions={regions}
            />
          </div>
        )}

        {/* --- FOOTER / COPYRIGHT --- */}
        <footer style={{
          marginTop: "auto",
          padding: "2rem 0",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem"
        }}>
          <div>
            &copy; 2026 <strong>Triple A</strong>. جميع الحقوق محفوظة.
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span style={{ color: "var(--primary)", fontWeight: "bold" }}>Powered by MetaFlow Engine</span>
          </div>
        </footer>
        <AiConsultant 
          activeAccountId={activeAccountId} 
          targetRegion={targetRegion}
          regions={regions}
        />
      </main>

      {/* --- ADD NEW CUSTOM RULE MODAL --- */}
      {showModal && (
        <RuleModal
          showModal={showModal}
          setShowModal={setShowModal}
          newRule={newRule}
          setNewRule={setNewRule}
          handleSaveRule={handleSaveRule}
          settings={settings}
        />
      )}
    </div>
  );
}

export default App;
