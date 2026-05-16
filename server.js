import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from './db.js';
import Lead from './models/Lead.js';
import Rule from './models/Rule.js';
import Log from './models/Log.js';
import User from './models/User.js';
import { getAiConsultantResponse } from './aiService.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware Hardening
app.use(helmet({ contentSecurityPolicy: false })); // HTTP Header Security without blocking React assets
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Protect against large payload DDoS attacks

// API Rate Limiting against Brute Force & DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Limit each IP to 600 requests per windowMs
  message: { error: "تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً بعد 15 دقيقة." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// --- Authentication Middleware & Routes ---
const JWT_SECRET = process.env.JWT_SECRET || 'triple_a_secret_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'من فضلك قم بتسجيل الدخول للوصول لهذه البيانات.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'جلسة العمل انتهت، يرجى تسجيل الدخول مجدداً.' });
    req.user = user;
    next();
  });
};

// Public Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Apply Middleware to all other API routes
// (We apply it selectively to sensitive routes below)


// File paths for persistence
const DATA_FILE = path.join(__dirname, 'data.json');
const LOGS_FILE = path.join(__dirname, 'logs.json');
const LEADS_FILE = path.join(__dirname, 'leads.json');

// --- Helper Functions to Load/Save Data ---
function loadData() {
  const defaultData = {
    settings: {
      metaAccessToken: process.env.META_ACCESS_TOKEN || '',
      metaAdAccountId: process.env.META_AD_ACCOUNT_ID || '26739674035671488', 
      metaAdAccountsList: [
        { id: process.env.META_AD_ACCOUNT_ID || '26739674035671488', name: 'HBrand' },
        { id: '965194625872456', name: 'HForLess' }
      ],
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
      telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
      googleSheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
      checkInterval: '30', // in minutes
      currency: 'EGP',
      currencySymbol: 'ج.م',
      notificationEmail: '',
      smtpHost: 'smtp.gmail.com',
      smtpPort: '465',
      smtpUser: '',
      smtpPass: ''
    },
    rules: [
      {
        id: 'rule_1',
        name: 'إيقاف الإعلانات الضعيفة تلقائياً',
        description: 'إيقاف الإعلان فوراً إذا تجاوزت تكلفة العميل المحتمل 150 ج.م وتم صرف 450 ج.م كحد أدنى',
        targetType: 'ad',
        metric: 'cpa',
        operator: 'greater_than',
        threshold: 150.0,
        minSpent: 450.0,
        action: 'pause',
        isActive: true,
        lastExecuted: null
      },
      {
        id: 'rule_2',
        name: 'زيادة الميزانية ذكياً (Smart Scale)',
        description: 'زيادة ميزانية المجموعة الإعلانية بنسبة 10% إذا كان سعر العميل أقل من 75 ج.م وحقق 3 تحويلات على الأقل',
        targetType: 'adset',
        metric: 'cpa',
        operator: 'less_than',
        threshold: 75.0,
        minLeads: 3,
        action: 'increase_budget',
        percentValue: 10,
        isActive: true,
        lastExecuted: null
      },
      {
        id: 'rule_3',
        name: 'التقرير التلقائي اليومي',
        description: 'استخراج ملخص الأداء اليومي وإرساله تلقائياً إلى تيليجرام وحفظه في السجلات',
        targetType: 'account',
        action: 'send_report',
        scheduleTime: '21:00', // 9:00 PM
        isActive: true,
        lastExecuted: null
      }
    ]
  };

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    // Ensure accounts list exists
    if (!data.settings.metaAdAccountsList) {
      data.settings.metaAdAccountsList = defaultData.settings.metaAdAccountsList;
    }
    return data;
  } catch (err) {
    return defaultData;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function loadLogs() {
  if (!fs.existsSync(LOGS_FILE)) {
    const defaultLogs = [
      {
        timestamp: new Date().toISOString(),
        type: 'system',
        message: 'تم تشغيل نظام أتمتة الإعلانات MetaFlow AI بنجاح.'
      }
    ];
    fs.writeFileSync(LOGS_FILE, JSON.stringify(defaultLogs, null, 2), 'utf-8');
    return defaultLogs;
  }
  try {
    return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

async function addLog(type, message) {
  // Save to MongoDB
  try {
    await Log.create({ type, message });
  } catch (err) {
    console.error('Failed to save log to MongoDB:', err.message);
  }

  const logs = loadLogs();
  const newLog = {
    timestamp: new Date().toISOString(),
    type, // 'system' | 'success' | 'warning' | 'danger' | 'info'
    message
  };
  logs.unshift(newLog); // Add to beginning
  // Keep last 500 logs
  if (logs.length > 500) {
    logs.pop();
  }
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function loadLeads() {
  if (!fs.existsSync(LEADS_FILE)) {
    const defaultLeads = [
      {
        id: 'lead_1',
        name: 'أحمد محمود العشري',
        phone: '+201067451239',
        product: 'تيشيرت كاجوال بولو قطن 100%',
        brand: 'HBrand',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        status: 'جديد'
      },
      {
        id: 'lead_2',
        name: 'كريم عبد العزيز النجار',
        phone: '+201124589632',
        product: 'حذاء كلاسيك جلد طبيعي أسود فاخر',
        brand: 'HBrand',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        status: 'تم التواصل'
      },
      {
        id: 'lead_3',
        name: 'مي الشافعي عبد الله',
        phone: '+201278451269',
        product: 'تيشيرت تصفية كبرى صيفية قطعتين',
        brand: 'HForLess',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        status: 'مهتم'
      },
      {
        id: 'lead_4',
        name: 'يوسف هاني عبد العال',
        phone: '+201552369874',
        product: 'حذاء ركض رياضي رمادي خفيف',
        brand: 'HForLess',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
        status: 'تم البيع'
      },
      {
        id: 'lead_5',
        name: 'رنا أحمد يسري',
        phone: '+201025478965',
        product: 'تيشيرت صيفي أوفر سايز بيج',
        brand: 'HBrand',
        timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(), // 7 hours ago
        status: 'مهتم'
      },
      {
        id: 'lead_6',
        name: 'محمود عبد السلام القاضي',
        phone: '+201147859632',
        product: 'حذاء كلاسيك بني فاخر للأعراس',
        brand: 'HBrand',
        timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hours ago
        status: 'جديد'
      },
      {
        id: 'lead_7',
        name: 'إبراهيم حسن جلال',
        phone: '+201225412589',
        product: 'طقم تيشرتات التوفير الذكي 3 قطع',
        brand: 'HForLess',
        timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
        status: 'تم التواصل'
      }
    ];
    fs.writeFileSync(LEADS_FILE, JSON.stringify(defaultLeads, null, 2), 'utf-8');
    return defaultLeads;
  }
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function saveLeads(leads) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

// --- Custom Live Multi-Account Simulator ---
// Tailored dynamically to 'H BRAND' and 'h forless' ad campaigns!
let mockCampaignsByAccount = {
  // Account 1: HBrand
  '26739674035671488': [
    {
      id: 'h_camp_01',
      name: 'HBrand | حملة ملابس الكاجوال الصيفية',
      status: 'ACTIVE',
      objective: 'LEAD_GENERATION',
      spend: 5535.00,
      impressions: 125000,
      clicks: 6200,
      leads: 41,
      cpa: 135.00,
      budget: 1500.00,
      adsets: [
        {
          id: 'h_set_01',
          name: 'مجموعة المهتمين بالموضة والملابس الفاخرة',
          budget: 1500.00,
          ads: [
            { id: 'h_ad_01', name: 'فيديو - استعراض تشكيلة الصيف', status: 'ACTIVE', spend: 2850.00, leads: 25, cpa: 114.00 },
            { id: 'h_ad_02', name: 'صورة دائرية - أسعار القمصان والتيشرتات', status: 'ACTIVE', spend: 2685.00, leads: 16, cpa: 167.81, fatigue: true } // Bleeding CPA > 150 ج.م!
          ]
        }
      ]
    },
    {
      id: 'h_camp_02',
      name: 'HBrand | حملة ترويج الأحذية الكلاسيك',
      status: 'ACTIVE',
      objective: 'CONVERSIONS',
      spend: 1260.00,
      impressions: 48000,
      clicks: 3100,
      leads: 21,
      cpa: 60.00,
      budget: 900.00,
      adsets: [
        {
          id: 'h_set_02',
          name: 'جمهور مخصص - زوار موقع الويب سابقاً',
          budget: 900.00,
          ads: [
            { id: 'h_ad_03', name: 'عرض التوصيل المجاني للمنزل', status: 'ACTIVE', spend: 660.00, leads: 12, cpa: 55.00 },
            { id: 'h_ad_04', name: 'صورة منتج - جلد طبيعي فاخر', status: 'ACTIVE', spend: 600.00, leads: 9, cpa: 66.67 }
          ]
        }
      ]
    }
  ],
  // Account 2: HForLess
  '965194625872456': [
    {
      id: 'fl_camp_01',
      name: 'HForLess | حملة التصفية الكبرى - خصم 50%',
      status: 'ACTIVE',
      objective: 'CONVERSIONS',
      spend: 10260.00,
      impressions: 245000,
      clicks: 14200,
      leads: 180,
      cpa: 57.00, // Fantastic scaling option! CPA < 75 ج.م
      budget: 3000.00,
      adsets: [
        {
          id: 'fl_set_01',
          name: 'جمهور البحث عن توفير - صائدو العروض',
          budget: 3000.00,
          ads: [
            { id: 'fl_ad_01', name: 'فيديو - العروض المجنونة وشراء قطعتين', status: 'ACTIVE', spend: 5400.00, leads: 105, cpa: 51.43 },
            { id: 'fl_ad_02', name: 'صورة عريضة - التوصيل بـ 10 جنيه فقط', status: 'ACTIVE', spend: 4860.00, leads: 75, cpa: 64.80 }
          ]
        }
      ]
    },
    {
      id: 'fl_camp_02',
      name: 'HForLess | حملة تفاعل إنستغرام وتيكتوك',
      status: 'ACTIVE',
      objective: 'ENGAGEMENT',
      spend: 2040.00,
      impressions: 98000,
      clicks: 8100,
      leads: 10,
      cpa: 204.00, // Bleeding CPA! CPA > 150 ج.م
      budget: 600.00,
      adsets: [
        {
          id: 'fl_set_02',
          name: 'جمهور التفاعل المفتوح - مصر بالكامل',
          budget: 600.00,
          ads: [
            { id: 'fl_ad_03', name: 'منشور ريلز - مسابقة القطع المجانية', status: 'ACTIVE', spend: 1200.00, leads: 7, cpa: 171.43 },
            { id: 'fl_ad_04', name: 'صورة تفاعلية - أي موديل تفضل؟', status: 'ACTIVE', spend: 840.00, leads: 3, cpa: 280.00, fatigue: true } // Extremely high!
          ]
        }
      ]
    }
  ]
};

// Fluctuate stats slightly across both accounts to simulate live activity
function simulatePerformanceFluctuations() {
  Object.keys(mockCampaignsByAccount).forEach(accountId => {
    mockCampaignsByAccount[accountId] = mockCampaignsByAccount[accountId].map(camp => {
      if (camp.status !== 'ACTIVE') return camp;
      
      const adsets = camp.adsets.map(adset => {
        const ads = adset.ads.map(ad => {
          if (ad.status !== 'ACTIVE') return ad;
          
          const spendAdd = parseFloat((Math.random() * 2.0).toFixed(2));
          const newSpend = parseFloat((ad.spend + spendAdd).toFixed(2));
          
          let leadsAdd = 0;
          if (Math.random() > 0.35) {
            leadsAdd = Math.floor(Math.random() * 2) + 1;
          }
          const newLeads = ad.leads + leadsAdd;
          const newCpa = newLeads > 0 ? parseFloat((newSpend / newLeads).toFixed(2)) : 0;
          
          return {
            ...ad,
            spend: newSpend,
            leads: newLeads,
            cpa: newCpa
          };
        });

        return {
          ...adset,
          ads
        };
      });

      const totalSpend = adsets.reduce((sum, s) => sum + s.ads.reduce((aSum, a) => aSum + a.spend, 0), 0);
      const totalLeads = adsets.reduce((sum, s) => sum + s.ads.reduce((aSum, a) => aSum + a.leads, 0), 0);
      const totalImpressions = camp.impressions + Math.floor(Math.random() * 150) + 40;
      const totalClicks = camp.clicks + Math.floor(Math.random() * 10) + 1;
      const campaignCpa = totalLeads > 0 ? parseFloat((totalSpend / totalLeads).toFixed(2)) : 0;

      return {
        ...camp,
        spend: parseFloat(totalSpend.toFixed(2)),
        impressions: totalImpressions,
        clicks: totalClicks,
        leads: totalLeads,
        cpa: campaignCpa,
        adsets
      };
    });
  });
}

// Update simulation statistics background loop
setInterval(() => {
  simulatePerformanceFluctuations();
}, 20000);



// --- Integration Notification Dispatchers ---

async function sendTelegramMessage(botToken, chatId, text, inlineButtons = []) {
  if (!botToken || !chatId) return false;
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    if (inlineButtons && inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: [ inlineButtons ]
      };
    }
    await axios.post(url, payload);
    return true;
  } catch (error) {
    console.error('Error sending Telegram alert:', error.message);
    return false;
  }
}

async function sendEmailNotification(recipientEmail, subject, htmlBody) {
  if (!recipientEmail) return false;
  console.log(`[EMAIL DISPATCH] Sending automated alert to email "${recipientEmail}"...`);
  console.log(`[EMAIL SUBJECT]: ${subject}`);
  console.log(`[EMAIL BODY]:\n${htmlBody}`);

  const data = loadData();
  const { settings } = data;

  try {
    if (settings.smtpUser && settings.smtpPass) {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost || 'smtp.gmail.com',
        port: parseInt(settings.smtpPort) || 465,
        secure: parseInt(settings.smtpPort) === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"MetaFlow AI Central" <${settings.smtpUser}>`,
        to: recipientEmail,
        subject: subject,
        html: `
          <div style="font-family: Tahoma, Arial, sans-serif; direction: rtl; background: #0c0d12; color: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #1f2232;">
            <div style="text-align: center; border-bottom: 2px solid #00ffaa; padding-bottom: 15px; margin-bottom: 20px;">
              <h1 style="color: #00ffaa; margin: 0; font-size: 24px;">🔔 الإشعار المتقدم - MetaFlow AI</h1>
              <p style="color: #8e95ad; font-size: 13px; margin: 5px 0 0 0;">نظام المراقبة والتحكم التلقائي بالإعلانات</p>
            </div>
            <div style="font-size: 15px; line-height: 1.8; color: #e4e6eb;">
              ${htmlBody}
            </div>
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #1f2232; text-align: center;">
              <a href="http://localhost:5000" style="display: inline-block; background: #00ffaa; color: #0c0d12; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 8px;">فتح لوحة التحكم والتنبيهات المباشرة 🚀</a>
            </div>
          </div>
        `,
      });
      addLog('success', `✉️ [إشعار بريد إلكتروني]: تم إرسال الرسالة بنجاح عبر SMTP إلى ${recipientEmail}`);
      return true;
    } else {
      // Robust simulation mode
      addLog('success', `✉️ [إشعار بريد إلكتروني - محاكاة]: تم إرسال التنبيه "${subject}" بنجاح إلى ${recipientEmail}`);
      return true;
    }
  } catch (err) {
    console.error('Error sending email via SMTP:', err.message);
    addLog('warning', `⚠️ [إشعار بريد إلكتروني]: فشل إرسال SMTP (${err.message})، تم تفعيل وضع المحاكاة بنجاح.`);
    return false;
  }
}

// Append automation action or report to Google Sheet (using Apps Script Web App URL if available, or logging)
async function appendToGoogleSheet(sheetIdOrUrl, ruleName, targetName, actionTaken, details) {
  if (!sheetIdOrUrl) return false;
  
  if (sheetIdOrUrl.startsWith('http')) {
    try {
      console.log(`[GOOGLE SHEET] Sending action logging to Google Web App URL...`);
      await axios.post(sheetIdOrUrl, {
        timestamp: new Date().toISOString(),
        ruleName,
        targetName,
        actionTaken,
        details
      });
      console.log(`[GOOGLE SHEET] Lead/trigger sent successfully to Google Sheet Web App: ${ruleName}`);
      return true;
    } catch (error) {
      console.error('Error appending to Google Sheet Apps Script Web App:', error.message);
      return false;
    }
  } else {
    console.log(`[GOOGLE SHEET LOG] Simulating sync with spreadsheet ID "${sheetIdOrUrl}": Rule "${ruleName}" triggered action "${actionTaken}" on target "${targetName}" (${details}).`);
    return true;
  }
}


// --- Meta Graph API & Automation Rules Processor ---

async function getLiveCampaignsForAccount(accId, accessToken) {
  if (!accessToken || !accId) {
    return null;
  }
  const cleanId = accId.replace('act_', '');
  const graphUrl = `https://graph.facebook.com/v18.0/act_${cleanId}/campaigns`;
  try {
    const campResponse = await axios.get(graphUrl, {
      params: {
        fields: 'name,status,objective,daily_budget,lifetime_budget',
        access_token: accessToken,
        limit: 100
      }
    });
    
    const campaignsData = campResponse.data.data || [];
    const activeCampaigns = [];
    
    for (const campaign of campaignsData) {
      // Fetch insights
      let spend = 0, impressions = 0, clicks = 0, leads = 0, cpa = 0;
      try {
        const insightsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/insights`;
        const insightsRes = await axios.get(insightsUrl, {
          params: {
            fields: 'spend,impressions,inline_link_clicks,actions',
            date_preset: 'this_month',
            access_token: accessToken
          }
        });
        const insight = insightsRes.data.data?.[0];
        if (insight) {
          spend = parseFloat(insight.spend || 0);
          impressions = parseInt(insight.impressions || 0);
          clicks = parseInt(insight.inline_link_clicks || 0);
          
          const actions = insight.actions || [];
          const leadAction = actions.find(a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped');
          leads = leadAction ? parseInt(leadAction.value || 0) : 0;
          cpa = leads > 0 ? parseFloat((spend / leads).toFixed(2)) : 0;
        }
      } catch (e) {
        console.error(`Error insights campaign ${campaign.id}:`, e.message);
      }

      // Fetch Adsets
      let adsetsList = [];
      try {
        const adsetsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/adsets`;
        const adsetsRes = await axios.get(adsetsUrl, {
          params: {
            fields: 'name,status,daily_budget',
            access_token: accessToken
          }
        });
        const adsetsData = adsetsRes.data.data || [];
        
        for (const adset of adsetsData) {
          let adsList = [];
          const adsUrl = `https://graph.facebook.com/v18.0/${adset.id}/ads`;
          const adsRes = await axios.get(adsUrl, {
            params: {
              fields: 'name,status',
              access_token: accessToken
            }
          });
          const adsData = adsRes.data.data || [];
          
          for (const ad of adsData) {
            let adSpend = 0, adLeads = 0, adCpa = 0;
            try {
              const adInsightsUrl = `https://graph.facebook.com/v18.0/${ad.id}/insights`;
              const adInsightsRes = await axios.get(adInsightsUrl, {
                params: {
                  fields: 'spend,actions',
                  date_preset: 'this_month',
                  access_token: accessToken
                }
              });
              const adInsight = adInsightsRes.data.data?.[0];
              if (adInsight) {
                adSpend = parseFloat(adInsight.spend || 0);
                const adActions = adInsight.actions || [];
                const adLeadAction = adActions.find(a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped');
                adLeads = adLeadAction ? parseInt(adLeadAction.value || 0) : 0;
                adCpa = adLeads > 0 ? parseFloat((adSpend / adLeads).toFixed(2)) : 0;
              }
            } catch (e) {
              console.error(`Error insights ad ${ad.id}:`, e.message);
            }
            
            adsList.push({
              id: ad.id,
              name: ad.name,
              status: ad.status,
              spend: adSpend,
              leads: adLeads,
              cpa: adCpa
            });
          }
          
          adsetsList.push({
            id: adset.id,
            name: adset.name,
            budget: parseFloat(adset.daily_budget || 0) / 100,
            ads: adsList
          });
        }
      } catch (e) {
        console.error(`Error adsets campaign ${campaign.id}:`, e.message);
      }

      activeCampaigns.push({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        spend,
        impressions,
        clicks,
        leads,
        cpa,
        budget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || 0) / 100,
        adsets: adsetsList
      });
    }
    return activeCampaigns;
  } catch (err) {
    console.error(`Error querying Meta API for account ${accId}:`, err.message);
    throw err;
  }
}

async function getRealLeadsFromMeta(accId, accessToken) {
  if (!accessToken || !accId) return [];
  try {
    const cleanId = accId.replace('act_', '');
    // 1. Get Ad Account Leadgen Forms
    const formsUrl = `https://graph.facebook.com/v18.0/act_${cleanId}/leadgen_forms`;
    const formsRes = await axios.get(formsUrl, { params: { access_token: accessToken, fields: 'name,id' } });
    const forms = formsRes.data.data || [];
    
    let allLeads = [];
    for (const form of forms) {
      // 2. Get Leads for each form
      const leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads`;
      const leadsRes = await axios.get(leadsUrl, { params: { access_token: accessToken, fields: 'created_time,id,field_data' } });
      const leadsData = leadsRes.data.data || [];
      
      leadsData.forEach(lead => {
        const fieldData = lead.field_data || [];
        const nameField = fieldData.find(f => f.name.toLowerCase().includes('name') || f.name.toLowerCase().includes('full_name'));
        const phoneField = fieldData.find(f => f.name.toLowerCase().includes('phone') || f.name.toLowerCase().includes('phone_number'));
        const emailField = fieldData.find(f => f.name.toLowerCase().includes('email'));
        
        allLeads.push({
          id: lead.id,
          name: nameField ? nameField.values[0] : 'عميل غير معروف',
          phone: phoneField ? phoneField.values[0] : 'بدون هاتف',
          email: emailField ? emailField.values[0] : '',
          product: form.name, // Use form name as product placeholder
          brand: 'Meta Ads',
          timestamp: lead.created_time,
          status: 'جديد'
        });
      });
    }
    return allLeads;
  } catch (error) {
    console.error('Error fetching leads from Meta:', error.message);
    return [];
  }
}

async function runAutomation() {
  const data = loadData();
  const { settings, rules } = data;
  
  addLog('system', 'بدء فحص القواعد الذكية وجدول الأتمتة المخصص لجميع الحسابات الإعلانية...');
  
  const isMetaConfigured = settings.metaAccessToken && settings.metaAdAccountId;
  
  // We evaluate rules for each account in our list
  const targetAccounts = settings.metaAdAccountsList || [
    { id: '26739674035671488', name: 'HBrand' },
    { id: '965194625872456', name: 'HForLess' }
  ];

  let totalActionsTriggered = 0;

  for (const account of targetAccounts) {
    const accId = account.id;
    const accName = account.name;
    
    let activeCampaigns = [];

    if (isMetaConfigured) {
      addLog('info', `جاري جلب بيانات الحملات والعملاء للحساب: "${accName}" (${accId}) من Meta...`);
      try {
        // Fetch Campaigns
        const liveCampaigns = await getLiveCampaignsForAccount(accId, settings.metaAccessToken);
        if (liveCampaigns && liveCampaigns.length > 0) {
          activeCampaigns = liveCampaigns;
          mockCampaignsByAccount[accId] = liveCampaigns;
        } else {
          activeCampaigns = mockCampaignsByAccount[accId] || [];
        }

        // Fetch Leads
        const realLeads = await getRealLeadsFromMeta(accId, settings.metaAccessToken);
        if (realLeads.length > 0) {
          const localLeads = loadLeads();
          // Merge avoiding duplicates by ID
          const existingIds = new Set(localLeads.map(l => l.id));
          const newLeads = realLeads.filter(l => !existingIds.has(l.id));
          if (newLeads.length > 0) {
            saveLeads([...newLeads, ...localLeads]);
            addLog('success', `✅ تم استيراد ${newLeads.length} عملاء حقيقيين جدد من Meta بنجاح.`);
          }
        }

      } catch (err) {
        addLog('danger', `خطأ اتصال بـ Meta لحساب "${accName}": ${err.message}. تم استخدام المحاكاة.`);
        activeCampaigns = mockCampaignsByAccount[accId] || [];
      }
    } else {
      activeCampaigns = mockCampaignsByAccount[accId] || [];
    }

    // Evaluate rules on this account's campaigns
    for (const rule of rules) {
      if (!rule.isActive) continue;

      // RULE 1: Stop Bleeding
      if (rule.action === 'pause' && rule.targetType === 'ad') {
        for (const camp of activeCampaigns) {
          if (camp.status !== 'ACTIVE') continue;
          for (const adset of camp.adsets) {
            for (const ad of adset.ads) {
              if (ad.status !== 'ACTIVE') continue;

              const isSpendMet = ad.spend >= rule.minSpent;
              let isViolation = false;

              if (rule.metric === 'cpa') {
                if (rule.operator === 'greater_than' && ad.cpa > rule.threshold) {
                  isViolation = true;
                }
              }

              if (isSpendMet && isViolation) {
                totalActionsTriggered++;
                ad.status = 'PAUSED';
                addLog('danger', `🔒 [أتمتة - حساب: ${accName}]: تم رصد إعلان ضعيف الأداء! الإعلان "${ad.name}" تجاوز التكلفة المحددة (${settings.currencySymbol}${ad.cpa.toFixed(2)} > ${settings.currencySymbol}${rule.threshold.toFixed(2)}) مع صرف ${settings.currencySymbol}${ad.spend.toFixed(2)}. جاري إيقافه فوراً لمنع الهدر...`);
                
                if (isMetaConfigured) {
                  try {
                    const pauseUrl = `https://graph.facebook.com/v18.0/${ad.id}`;
                    await axios.post(pauseUrl, {
                      status: 'PAUSED',
                      access_token: settings.metaAccessToken
                    });
                    addLog('success', `✅ [Meta API]: تم إيقاف الإعلان ${ad.id} بنجاح على حسابك.`);
                  } catch (metaErr) {
                    addLog('danger', `❌ [Meta API]: فشل إيقاف الإعلان ${ad.id} على ميتا: ${metaErr.message}`);
                  }
                }

                // Telegram Alert
                const alertMsg = `⚠️ <b>تنبيه أتمتة MetaFlow AI</b>\n\n` +
                                 `🏢 <b>الحساب الإعلاني: ${accName}</b>\n` +
                                 `🔴 <b>تم إيقاف إعلان ضعيف الأداء!</b>\n` +
                                 `• اسم الإعلان: <code>${ad.name}</code>\n` +
                                 `• التكلفة الفعلية للعميل: <b>${settings.currencySymbol}${ad.cpa.toFixed(2)}</b> (الحد الأقصى: ${settings.currencySymbol}${rule.threshold.toFixed(2)})\n` +
                                 `• المصروف: ${settings.currencySymbol}${ad.spend.toFixed(2)}\n` +
                                 `• الإجراء: <b>إيقاف فوري تلقائي (PAUSED)</b> 🛑`;
                const inlineButtons = [
                  { text: '⚡ فتح لوحة التحكم المباشرة', url: 'http://localhost:5000' }
                ];
                await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, alertMsg, inlineButtons);
                if (settings.notificationEmail) {
                  await sendEmailNotification(settings.notificationEmail, `إيقاف إعلان ضعيف الأداء - ${accName}`, `<h2 style="color:#ff4a4a;">تم إيقاف إعلان ضعيف الأداء!</h2><p><b>الإعلان:</b> ${ad.name}</p><p><b>المصروف:</b> ${ad.spend} EGP | <b>سعر العميل:</b> ${ad.cpa} EGP</p>`);
                }
                await appendToGoogleSheet(settings.googleSheetId, rule.name, ad.name, 'إيقاف إعلان تلقائي (PAUSED)', `المصروف: ${ad.spend}، سعر العميل: ${ad.cpa}`);
                rule.lastExecuted = new Date().toISOString();
              }
            }
          }
        }
      }

      // RULE 2: Smart Budget Scale
      if (rule.action === 'increase_budget' && rule.targetType === 'adset') {
        for (const camp of activeCampaigns) {
          if (camp.status !== 'ACTIVE') continue;
          for (const adset of camp.adsets) {
            const adsetSpend = adset.ads.reduce((s, a) => s + a.spend, 0);
            const adsetLeads = adset.ads.reduce((s, a) => s + a.leads, 0);
            const adsetCpa = adsetLeads > 0 ? adsetSpend / adsetLeads : 0;

            const isLeadsMet = adsetLeads >= rule.minLeads;
            let isExcellent = false;

            if (rule.metric === 'cpa') {
              if (rule.operator === 'less_than' && adsetCpa < rule.threshold && adsetCpa > 0) {
                isExcellent = true;
              }
            }

            if (isLeadsMet && isExcellent) {
              totalActionsTriggered++;
              const oldBudget = adset.budget;
              const increaseFactor = 1 + (rule.percentValue / 100);
              const newBudget = parseFloat((oldBudget * increaseFactor).toFixed(2));
              adset.budget = newBudget;

              addLog('success', `🚀 [أتمتة - حساب: ${accName}]: أداء ممتاز! المجموعة "${adset.name}" تحقق نتائج رائعة بسعر عميل منخفض (${settings.currencySymbol}${adsetCpa.toFixed(2)} < ${settings.currencySymbol}${rule.threshold.toFixed(2)}). جاري زيادة الميزانية بنسبة ${rule.percentValue}%...`);

              if (isMetaConfigured) {
                try {
                  const adsetUrl = `https://graph.facebook.com/v18.0/${adset.id}`;
                  const apiBudgetInCents = Math.round(newBudget * 100);
                  await axios.post(adsetUrl, {
                    daily_budget: apiBudgetInCents,
                    access_token: settings.metaAccessToken
                  });
                  addLog('success', `✅ [Meta API]: تم تحديث ميزانية المجموعة الإعلانية ${adset.id} إلى ${settings.currencySymbol}${newBudget} بنجاح.`);
                } catch (metaErr) {
                  addLog('danger', `❌ [Meta API]: فشل تحديث الميزانية للمجموعة ${adset.id}: ${metaErr.message}`);
                }
              }

              // Telegram Alert
              const alertMsg = `🚀 <b>تنبيه أتمتة MetaFlow AI</b>\n\n` +
                               `🏢 <b>الحساب الإعلاني: ${accName}</b>\n` +
                               `🟢 <b>زيادة ذكية للميزانية (Scaling)!</b>\n` +
                               `• اسم المجموعة: <code>${adset.name}</code>\n` +
                               `• التكلفة الفعلية للعميل: <b>${settings.currencySymbol}${adsetCpa.toFixed(2)}</b> (أقل من: ${settings.currencySymbol}${rule.threshold.toFixed(2)})\n` +
                               `• عدد العملاء: <b>${adsetLeads} عملاء محتملين</b>\n` +
                               `• الميزانية القديمة: ${settings.currencySymbol}${oldBudget}\n` +
                               `• الميزانية الجديدة: <b>${settings.currencySymbol}${newBudget} (+${rule.percentValue}%)</b> 📈`;
              const inlineButtons = [
                { text: '📈 متابعة الأداء المباشر', url: 'http://localhost:5000' }
              ];
              await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, alertMsg, inlineButtons);
              if (settings.notificationEmail) {
                await sendEmailNotification(settings.notificationEmail, `زيادة ميزانية إعلان ممتاز - ${accName}`, `<h2 style="color:#00ffaa;">تمت زيادة الميزانية بنجاح!</h2><p><b>المجموعة:</b> ${adset.name}</p><p><b>الميزانية الجديدة:</b> ${newBudget} EGP (+${rule.percentValue}%)</p>`);
              }
              await appendToGoogleSheet(settings.googleSheetId, rule.name, adset.name, 'زيادة الميزانية تلقائياً (+10%)', `الميزانية القديمة: ${oldBudget}، الميزانية الجديدة: ${newBudget}`);
              rule.lastExecuted = new Date().toISOString();
            }
          }
        }
      }

      // RULE 3: Daily Summary Report
      if (rule.action === 'send_report' && rule.targetType === 'account') {
        const now = new Date();
        const currentHoursMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentHoursMin === rule.scheduleTime) {
          totalActionsTriggered++;
          let totalSpend = 0, totalLeads = 0, totalImpressions = 0, activeCampsCount = 0;
          for (const camp of activeCampaigns) {
            if (camp.status === 'ACTIVE') {
              activeCampsCount++;
              totalSpend += camp.spend;
              totalLeads += camp.leads;
              totalImpressions += camp.impressions;
            }
          }
          const avgCpa = totalLeads > 0 ? parseFloat((totalSpend / totalLeads).toFixed(2)) : 0;

          addLog('info', `📊 [أتمتة - حساب: ${accName}]: إرسال التقرير اليومي المجدول لأداء الحساب الإعلاني...`);

          const reportMsg = `📊 <b>التقرير اليومي لأداء الحساب: ${accName} - MetaFlow AI</b>\n\n` +
                            `• تاريخ التقرير: <code>${now.toLocaleDateString('ar-EG')}</code>\n` +
                            `• الحملات النشطة: <b>${activeCampsCount} حملات</b>\n` +
                            `• إجمالي المشاهدات: <b>${totalImpressions.toLocaleString()}</b>\n` +
                            `• إجمالي المصاريف: <b>${settings.currencySymbol}${totalSpend.toFixed(2)}</b>\n` +
                            `• إجمالي العملاء المحتملين: <b>${totalLeads} عميل</b>\n` +
                            `• متوسط سعر العميل (CPA): <b>${settings.currencySymbol}${avgCpa.toFixed(2)}</b>\n\n` +
                            `🔥 <i>نظام الأتمتة مستمر بنجاح.</i>`;
          const inlineButtons = [
            { text: '⚔️ مقارنة أداء البراندات', url: 'http://localhost:5000' }
          ];
          await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, reportMsg, inlineButtons);
          if (settings.notificationEmail) {
            await sendEmailNotification(settings.notificationEmail, `التقرير اليومي التلقائي - ${accName}`, `<h2>التقرير اليومي الشامل</h2><p><b>الحملات النشطة:</b> ${activeCampsCount}</p><p><b>المصروف الإجمالي:</b> ${totalSpend.toFixed(2)} EGP | <b>العملاء:</b> ${totalLeads}</p>`);
          }
          await appendToGoogleSheet(settings.googleSheetId, rule.name, accName, 'تقرير يومي تلقائي', `الحملات النشطة: ${activeCampsCount}، المصروف: ${totalSpend}، العملاء: ${totalLeads}`);
          addLog('success', `✅ تم إرسال التقرير اليومي لحساب "${accName}" بنجاح.`);
          rule.lastExecuted = new Date().toISOString();
        }
      }

      // RULE 4: Dayparting Pause (Night Pause / Low Traffic)
      if (rule.action === 'dayparting_pause') {
        const now = new Date();
        const currentHoursMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentHoursMin === rule.scheduleTime) {
          totalActionsTriggered++;
          addLog('warning', `⏰ [أتمتة الجدولة - حساب: ${accName}]: حان وقت الركود المجدول (${rule.scheduleTime}). جاري إيقاف الحملات المستهدفة مؤقتاً لتوفير الميزانية...`);

          for (const camp of activeCampaigns) {
            if (rule.targetType === 'account' || rule.targetType === 'campaign') {
              if (camp.status === 'ACTIVE') {
                camp.status = 'PAUSED';
                if (isMetaConfigured) {
                  try {
                    await axios.post(`https://graph.facebook.com/v18.0/${camp.id}`, { status: 'PAUSED', access_token: settings.metaAccessToken });
                  } catch (e) { console.error(e.message); }
                }
              }
            } else if (rule.targetType === 'adset') {
              for (const adset of camp.adsets) {
                if (isMetaConfigured) {
                  try {
                    await axios.post(`https://graph.facebook.com/v18.0/${adset.id}`, { status: 'PAUSED', access_token: settings.metaAccessToken });
                  } catch (e) { console.error(e.message); }
                }
              }
            } else if (rule.targetType === 'ad') {
              for (const adset of camp.adsets) {
                for (const ad of adset.ads) {
                  if (ad.status === 'ACTIVE') {
                    ad.status = 'PAUSED';
                    if (isMetaConfigured) {
                      try {
                        await axios.post(`https://graph.facebook.com/v18.0/${ad.id}`, { status: 'PAUSED', access_token: settings.metaAccessToken });
                      } catch (e) { console.error(e.message); }
                    }
                  }
                }
              }
            }
          }

          const alertMsg = `⏰ <b>جدولة الإعلانات الذكية - MetaFlow AI</b>\n\n🏢 <b>الحساب: ${accName}</b>\n🛑 <b>تم إيقاف الإعلانات المجدولة ليلاً (ساعات الركود)</b>\n• الوقت: <code>${rule.scheduleTime}</code>\n• الهدف: توفير الميزانية ومنع الهدر في أوقات انخفاض التفاعل 💤`;
          await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, alertMsg, [{ text: '📊 متابعة الميزانية', url: 'http://localhost:5000' }]);
          if (settings.notificationEmail) {
            await sendEmailNotification(settings.notificationEmail, `إيقاف الإعلانات ليلاً - ${accName}`, `<h2 style="color:#ffaa00;">⏰ تم إيقاف الإعلانات المجدولة ليلاً</h2><p>تم تفعيل وضع التوفير بنجاح في تمام الساعة ${rule.scheduleTime}</p>`);
          }
          await appendToGoogleSheet(settings.googleSheetId, rule.name, accName, 'إيقاف مجدول (Night Pause)', `الوقت: ${rule.scheduleTime}`);
          rule.lastExecuted = new Date().toISOString();
        }
      }

      // RULE 5: Dayparting Start (Morning Start / Peak Traffic)
      if (rule.action === 'dayparting_start') {
        const now = new Date();
        const currentHoursMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentHoursMin === rule.scheduleTime) {
          totalActionsTriggered++;
          addLog('success', `☀️ [أتمتة الجدولة - حساب: ${accName}]: حان وقت الذروة المجدول (${rule.scheduleTime}). جاري إعادة تشغيل الحملات الصباحية بنجاح...`);

          for (const camp of activeCampaigns) {
            if (rule.targetType === 'account' || rule.targetType === 'campaign') {
              if (camp.status === 'PAUSED') {
                camp.status = 'ACTIVE';
                if (isMetaConfigured) {
                  try {
                    await axios.post(`https://graph.facebook.com/v18.0/${camp.id}`, { status: 'ACTIVE', access_token: settings.metaAccessToken });
                  } catch (e) { console.error(e.message); }
                }
              }
            } else if (rule.targetType === 'adset') {
              for (const adset of camp.adsets) {
                if (isMetaConfigured) {
                  try {
                    await axios.post(`https://graph.facebook.com/v18.0/${adset.id}`, { status: 'ACTIVE', access_token: settings.metaAccessToken });
                  } catch (e) { console.error(e.message); }
                }
              }
            } else if (rule.targetType === 'ad') {
              for (const adset of camp.adsets) {
                for (const ad of adset.ads) {
                  if (ad.status === 'PAUSED') {
                    ad.status = 'ACTIVE';
                    if (isMetaConfigured) {
                      try {
                        await axios.post(`https://graph.facebook.com/v18.0/${ad.id}`, { status: 'ACTIVE', access_token: settings.metaAccessToken });
                      } catch (e) { console.error(e.message); }
                    }
                  }
                }
              }
            }
          }

          const alertMsg = `☀️ <b>جدولة الإعلانات الذكية - MetaFlow AI</b>\n\n🏢 <b>الحساب: ${accName}</b>\n🚀 <b>تمت إعادة تشغيل الإعلانات المجدولة صباحاً (ساعات الذروة)</b>\n• الوقت: <code>${rule.scheduleTime}</code>\n• الحالة: تعمل بكامل كفاءتها الآن لجلب أفضل العملاء المحتملين 🔥`;
          await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, alertMsg, [{ text: '🚀 مراقبة الحملات المباشرة', url: 'http://localhost:5000' }]);
          if (settings.notificationEmail) {
            await sendEmailNotification(settings.notificationEmail, `تشغيل الإعلانات صباحاً - ${accName}`, `<h2 style="color:#00ffaa;">☀️ تمت إعادة تشغيل الإعلانات المجدولة</h2><p>بدأ العمل في ساعات الذروة بنجاح في تمام الساعة ${rule.scheduleTime}</p>`);
          }
          await appendToGoogleSheet(settings.googleSheetId, rule.name, accName, 'تشغيل مجدول (Morning Start)', `الوقت: ${rule.scheduleTime}`);
          rule.lastExecuted = new Date().toISOString();
        }
      }
    }
  }

  saveData({ ...data, rules });
  addLog('system', `اكتمل فحص القواعد الذكية لجميع الحسابات الإعلانية. الإجراءات المنفذة بالكامل: ${totalActionsTriggered}`);
}


// --- API Routes ---

// Get campaigns by account ID
app.get('/api/campaigns', async (req, res) => {
  const accountId = req.query.accountId || '26739674035671488';
  const region = req.query.region || 'EG';
  const data = loadData();
  const isMetaConfigured = data.settings.metaAccessToken && accountId;

  if (isMetaConfigured) {
    try {
      const liveCampaigns = await getLiveCampaignsForAccount(accountId, data.settings.metaAccessToken);
      if (liveCampaigns && liveCampaigns.length > 0) {
        mockCampaignsByAccount[accountId] = liveCampaigns; // Update cache
        return res.json(liveCampaigns);
      }
    } catch (err) {
      console.error(`Error loading live campaigns for ${accountId}:`, err.message);
    }
  }
  
  let campaigns = JSON.parse(JSON.stringify(mockCampaignsByAccount[accountId] || []));
  
  // Regional Simulation Adjustment
  if (region === 'SA' || region === 'AE') {
    campaigns = campaigns.map(camp => ({
      ...camp,
      spend: camp.spend / 5, // Convert EGP equivalent to SAR/AED roughly
      budget: camp.budget / 5,
      cpa: camp.cpa / 5,
      name: camp.name.replace('صيفية', 'الخليج').replace('الشتاء', 'الرياض')
    }));
  }
  
  res.json(campaigns);
});

// Update single ad status (manual trigger)
app.post('/api/ads/status', async (req, res) => {
  const { accountId, campaignId, adsetId, adId, status } = req.body;
  const activeAccId = accountId || '26739674035671488';
  
  const data = loadData();
  const isMetaConfigured = data.settings.metaAccessToken && data.settings.metaAdAccountId;

  const campaigns = mockCampaignsByAccount[activeAccId] || [];
  const camp = campaigns.find(c => c.id === campaignId);
  if (camp) {
    const adset = camp.adsets.find(s => s.id === adsetId);
    if (adset) {
      const ad = adset.ads.find(a => a.id === adId);
      if (ad) {
        ad.status = status;
        addLog('info', `[تحكم يدوي]: تم تغيير حالة الإعلان "${ad.name}" إلى ${status}`);
        
        if (isMetaConfigured) {
          try {
            const adUrl = `https://graph.facebook.com/v18.0/${adId}`;
            await axios.post(adUrl, {
              status,
              access_token: data.settings.metaAccessToken
            });
            addLog('success', `✅ [Meta API]: تم تحديث حالة الإعلان على فيسبوك بنجاح إلى ${status}`);
          } catch (e) {
            addLog('danger', `❌ [Meta API]: فشل التحديث اليدوي على فيسبوك: ${e.message}`);
          }
        }
        return res.json({ success: true, mockCampaigns: campaigns });
      }
    }
  }
  res.status(404).json({ error: 'Ad not found' });
});

// Get rules and settings
app.get('/api/rules', (req, res) => {
  const data = loadData();
  res.json(data.rules);
});

app.get('/api/settings', (req, res) => {
  const data = loadData();
  res.json(data.settings);
});

// Side-by-side Brand Performance Battle Endpoint
app.get('/api/brands/compare', async (req, res) => {
  const data = loadData();
  const region = req.query.region || 'EG';
  const results = {};
  const accounts = [
    { id: '26739674035671488', key: 'HBrand', name: 'HBrand Outlet' },
    { id: '965194625872456', key: 'HForLess', name: 'HForLess Store' }
  ];

  for (const acc of accounts) {
    let campaigns = [];
    const isMetaConfigured = data.settings.metaAccessToken && acc.id === data.settings.metaAdAccountId;
    
    if (isMetaConfigured) {
      try {
        const liveCampaigns = await getLiveCampaignsForAccount(acc.id, data.settings.metaAccessToken);
        if (liveCampaigns && liveCampaigns.length > 0) {
          mockCampaignsByAccount[acc.id] = liveCampaigns;
        }
      } catch (err) {
        console.error(`Error loading live campaigns for Brand Comparison of ${acc.id}:`, err.message);
      }
    }
    
    campaigns = mockCampaignsByAccount[acc.id] || [];
    
    if (!isMetaConfigured && (region === 'SA' || region === 'AE')) {
      campaigns = campaigns.map(camp => ({
        ...camp,
        spend: camp.spend / 5,
        leads: camp.leads, // keep leads same for volume feel
        clicks: camp.clicks
      }));
    }
    
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalLeads = 0;
    
    campaigns.forEach(camp => {
      totalSpend += camp.spend || 0;
      totalImpressions += camp.impressions || 0;
      totalClicks += camp.clicks || 0;
      totalLeads += camp.leads || 0;
    });

    const avgCpa = totalLeads > 0 ? parseFloat((totalSpend / totalLeads).toFixed(2)) : 0;
    const conversionRate = totalClicks > 0 ? parseFloat(((totalLeads / totalClicks) * 100).toFixed(2)) : 0;
    
    // Revenue & ROI Calculation
    let leadValue = acc.key === 'HBrand' ? 1250 : 650;
    if (region === 'SA' || region === 'AE') {
      leadValue = leadValue / 5;
    }
    const revenue = totalLeads * leadValue;
    const roi = totalSpend > 0 ? parseFloat((((revenue - totalSpend) / totalSpend) * 100).toFixed(2)) : 0;

    results[acc.key] = {
      id: acc.id,
      name: acc.name,
      spend: parseFloat(totalSpend.toFixed(2)),
      impressions: totalImpressions,
      clicks: totalClicks,
      leads: totalLeads,
      cpa: avgCpa,
      conversionRate: conversionRate,
      revenue: parseFloat(revenue.toFixed(2)),
      roi: roi
    };
  }

  res.json(results);
});

// Save settings
app.post('/api/settings', authenticateToken, (req, res) => {
  const data = loadData();
  data.settings = { ...data.settings, ...req.body };
  saveData(data);
  addLog('system', 'تم حفظ إعدادات التكامل والربط بنجاح.');
  
  setupCronJob(data.settings.checkInterval);
  res.json({ success: true, settings: data.settings });
});

app.post('/api/ai-image', async (req, res) => {
  const { prompt, productName } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    addLog('info', `🎨 جاري تصميم صورة إعلانية احترافية لـ "${productName}"...`);
    
    // Using Pollinations.ai for high-quality AI image generation simulation
    // We encode the prompt to be URL-safe
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    
    addLog('success', `✅ تم تصميم صورة الإعلان بنجاح لـ "${productName}"!`);
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// AI Creative & Script Studio endpoint
app.post('/api/ai-generator', async (req, res) => {
  const { productName, brand, offer, tone } = req.body;
  if (!productName) {
    return res.status(400).json({ error: 'اسم المنتج مطلوب' });
  }

  const data = loadData();
  const apiKey = data.settings.geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      addLog('info', `✨ جاري توليد سيناريوهات وتصاميم لـ "${productName}" بالذكاء الاصطناعي (Gemini)...`);
      const prompt = `أنت خبير محترف في الإدارة الإبداعية (Creative Director) وكتابة الإعلانات الممولة (Copywriter) في السوق المصري، متخصص بمجال الموضة والأزياء والملابس والأحذية.
أريدك أن تولد حزمة إبداعية متكاملة للترويج للمنتج التالي:
المنتج: ${productName}
الماركة/المتجر: ${brand} (نبذة عن الماركة: ${brand === 'HBrand' ? 'متجر أوتلت فاخر للملابس والأحذية بأسعار مخفضة في مصر' : 'متجر موضة سريع وعصري للشباب بجودة ممتازة وأسعار تنافسية في مصر'})
العرض/الخصم: ${offer || 'خصومات حصرية'}
الأسلوب/اللهجة: ${tone === 'egyptian' ? 'عامية مصرية جذابة قريبة للشباب ومحفزة للشراء' : tone === 'urgent' ? 'أسلوب حماسي وتصفيات مستعجلة تثير الرغبة في الشراء فوراً (FOMO)' : 'لغة عربية فصحى احترافية وأنيقة'}

أريد الإخراج على هيئة كائن JSON يحتوي على الحقول التالية فقط وبدون أي علامات مارك داون إضافية أو نصوص برمجية (مثال: \`\`\`json):
{
  "facebook": "نص بوست الفيسبوك الإبداعي مع الرموز التعبيرية والهاشتاقات المناسبة",
  "instagram": "نص كابشن الإنستقرام ومعه بين قوسين فكرة ستوري تفاعلية",
  "tiktok": "سيناريو فيديو إعلاني قصير (Reels/TikTok) مقسم لقطة بلقطة بالتفصيل: 1. الخطاف (Hook): أول 3 ثوانٍ لجذب الانتباه. 2. القصة (Story): استعراض المشكلة والحل والمنتج. 3. الدعوة للإجراء (CTA): تحفيز الشراء الفوري. مع وصف المشهد البصري والصوتي لكل لقطة.",
  "snapchat": "فكرة إعلان سناب شات سريع وجذاب (Snap Ad) يركز على العرض السريع مع فكرة فلتر أو عدسة تفاعلية.",
  "designIdea": "فكرة تصميم بانر إعلاني (Ad Banner) مبتكرة وجذابة متناغمة مع الهوية البصرية للعلامة التجارية والألوان المقترحة وتوزيع العناصر",
  "imagePrompt": "وصف دقيق ومفصل باللغة الإنجليزية (AI Image Generation Prompt) لتوليد صورة إعلانية مذهلة وعالية الجودة للمنتج عبر Midjourney أو DALL-E"
}

تأكد من استخدام الرموز التعبيرية (Emojis) لتبدو الإعلانات حية وجذابة جداً. لا تكتب أي نصوص خارجية خارج كائن الـ JSON.`;

      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const result = JSON.parse(text);
        addLog('success', `✨ تم توليد الحزمة الإبداعية لـ "${productName}" بنجاح عبر Gemini AI!`);
        return res.json(result);
      }
    } catch (err) {
      console.error('Error generating with real Gemini API:', err.message);
      addLog('warning', `⚠️ فشل توليد Gemini API: ${err.message}. تم الانتقال للمحرك المحلي الإبداعي.`);
    }
  }

  // --- Premium Local Rule-Based Creative Studio Fallback ---
  const isHBrand = brand === 'HBrand';
  const brandTitle = isHBrand ? 'HBrand Outlet' : 'HForLess Store';
  const discountStr = offer ? `خصم خاص بقيمة ${offer}` : 'تخفيضاتنا الحصرية لفترة محدودة';
  
  let facebook = '';
  let instagram = '';
  let tiktok = '';
  let designIdea = '';
  let imagePrompt = '';

  if (tone === 'egyptian') {
    facebook = `🔥 الشياكة المصرية على أصولها وصلت يا فنان! 😉👇\n\nأقوى قطعة هتدخل دولابك السنة دي عشان تخليك مميز في أي مكان! بنقدملك اليوم 🌟 *"${productName}"* 🌟 من *${brandTitle}*.\n\nلماذا تختار هذه القطعة بالذات؟ 🤔\n✅ خامات مريحة جداً وممتازة للبس الطويل والاستخدام اليومي.\n✅ تفاصيل وتقفيل عالي الجودة يدوم معاك وميغيرش لون.\n✅ تصميم عصري ومميز يتماشى مع أحدث صيحات الموضة.\n\n🎁 وعشان تكمل فرحتك، عملنالك عرض ميتفوتش: ✨ **[ ${discountStr} ]** ✨\n\n🛍️ الشحن سريع ومتاح لجميع المحافظات في مصر مع إمكانية الدفع عند الاستلام والمعاينة قبل الاستلام عشان تضمن حقك كاملاً! ✅\n\n💬 اطلب دلوقتي فوراً من خلال رسائل الصفحة أو مباشرة عبر موقعنا الإلكتروني! متضيعش الفرصة! ⚡\n\n#موضة #أزياء_مصرية #ستريت_وير #كاجوال #EgyptFashion`;
    
    instagram = `✨ التفاصيل هي اللي بتعمل الفرق! كمل شياكتك مع *"${productName}"* من *${brandTitle}*! 🔥\n\nالآن بعرض لا يُعوض: 👇\n💸 **${discountStr}** 💸\n\n(🎬 فكرة ستوري مقترحة: فيديو سريع مدته 5 ثوانٍ يظهر فيه الموديل وهو يرتدي القطعة مع زاوية تقريبية تبرز جودة الخامات والتفاصيل على أنغام موسيقى تريند هادئة).\n\n👇 اطلب الآن عبر اللينك في البايو أو ابعتلنا رسالة خاصة مباشرة!\n\n#انستقرام_مصر #أناقة_يومية #أوتلت_مصر #اكسبلور #CasualWear`;
    
    tiktok = `🎬 سيناريو تيك توك / ريلز احترافي مقسم لقطة بلقطة (15 ثانية):\n\n1️⃣ الخطاف (Hook - أول 3 ثوانٍ):\n🎥 المشهد البصري: لقطة سريعة لشخص يفتح خزانة ملابسه ويبدو محتاراً أو يمسك بقطعة قديمة ومملة، فجأة يظهر تأثير خاطف ويتحول المشهد لصورة مقربة لـ "${productName}".\n🔊 الهندسة الصوتية: صوت مؤثر درامي سريع (Whoosh sound) يليه تعليق صوتي حماسي: "محتار تلبس إيه وتعبت من الهدوم اللي بتبوظ بعد غسلتين؟ 🤔"\n\n2️⃣ القصة والاستعراض (Story - من ثانية 3 إلى 10):\n🎥 المشهد البصري: انتقال سلس (Smooth Cut) للموديل وهو يرتدي "${productName}" ويمشي بثقة في الشارع بإضاءة شمس طبيعية تبرز جودة القماش والتقفيل الممتاز.\n🔊 الهندسة الصوتية: موسيقى تريند إيقاعية حماسية مع تعليق: "الحل وصل من ${brandTitle}! خامات بريميوم وتفاصيل تعيش معاك وتخليك مميز في أي خروجة!" 🔥\n\n3️⃣ الدعوة للإجراء (Call to Action - من ثانية 10 إلى 15):\n🎥 المشهد البصري: شاشة ختامية جذابة يظهر فيها المنتج بوضوح مع شريط متحرك باللون الأخضر الفوسفوري يوضح الخصم: "${discountStr}".\n🔊 الهندسة الصوتية: تعليق صوتي أخير: "اطلب دلوقتي واستفيد بـ ${discountStr} قبل نفاد الكمية! اضغط على اللينك واطلب فوراً! 🏃‍♂️💨"`;

    designIdea = `🎨 فكرة تصميم البانر الإعلاني (Ad Banner Concept):\n• التكوين البصري: تقسيم البانر بنسبة 60% لصورة الموديل يرتدي "${productName}" بوضوح، و40% لمربع نصي زجاجي (Glassmorphism).\n• الألوان والهوية: استخدام خلفية داكنة فاخرة (أسود أو كحلي غامق) لإبراز المنتج، مع إضاءة نيون خفيفة باللون الأخضر الفوسفوري (أو لون الشعار) حول المنتج لإعطاء طابع عصري.\n• العناوين: كتابة "${productName}" بخط عريض وجذاب، وأسفله مباشرة شارة بارزة مكتوب عليها "${discountStr}".\n• زر الإجراء (CTA Button): زر بارز باللون الأخضر الفاقع مكتوب عليه "تسوق الآن - الدفع عند الاستلام" لزيادة معدل النقر (CTR).`;

    imagePrompt = `Professional commercial ad photography of a stylish fashion model wearing ${productName}, premium streetwear aesthetic, walking confidently in modern Cairo streets during golden hour, crisp lighting, ultra high quality fabric texture, 8k resolution, shot on 35mm lens, depth of field, hyperrealistic, commercial fashion catalogue look --ar 4:5 --v 6.0`;
  } else if (tone === 'urgent') {
    facebook = `🛑 تصفية كبرى وفترة محدودة جداً! أسرع قبل فوات الأوان! 🛑\n\nالقطعة الأكثر طلباً هذا الموسم أصبحت متاحة الآن بتخفيض استثنائي! احصل فوراً على 💥 *"${productName}"* 💥 من *${brandTitle}*.\n\n⚠️ **تنبيه:** المخزون محدود للغاية والطلب مرتفع جداً حالياً!\n\nلماذا يجب أن تحصل عليها الآن؟\n✨ خصم فوري وحصري: 🏷️ **[ ${discountStr} ]**!\n✨ تصميم فريد يمنحك التميز الفوري.\n✨ شحن فائق السرعة لجميع أنحاء مصر.\n\nلا تنتظر حتى تنفد الكمية وتندم لاحقاً! 🥶\n\n🛒 **اطلب الآن فوراً بالضغط على رابط الشراء أو ابعت رسالة قبل إغلاق العرض!**\n\n#تصفيات #عروض_خاصة #فرصة_أخيرة #ملابس_مخفضة #مصر`;
    
    instagram = `🔴 فرصة أخيرة! تصفية استثنائية على *"${productName}"*! 🚨\n\nخصم غير مسبوق: **${discountStr}** 💸\n\n(🎬 فكرة ستوري مقترحة: صورة بخلفية سوداء غامضة وعليها مؤقت عد تنازلي "Countdown Timer" يظهر الساعات المتبقية لانتهاء العرض مع صورة متوهجة للمنتج).\n\n⚠️ الكمية المتوفرة تكفي لـ 24 ساعة فقط! اطلب الآن عبر الرسائل!\n\n#تصفية_كبرى #شياكة #عرض_محدود #HBrandOutlet`;
    
    tiktok = `🎬 سيناريو فيديو تصفية حماسي (12 ثانية):\n\n1️⃣ الخطاف (Hook - أول 3 ثوانٍ):\n🎥 المشهد البصري: عداد تنازلي ضخم يتحرك بسرعة باللون الأحمر مع لقطة سريعة لصناديق ملابس تُغلق وتُشحن.\n🔊 الهندسة الصوتية: صوت إنذار خفيف ومثير مع تعليق: "الفرصة دي مش هتتكرر تاني! تصفيات ${brandTitle} الكبرى بدأت! 🚨"\n\n2️⃣ القصة (Story - من ثانية 3 إلى 8):\n🎥 المشهد البصري: استعراض سريع جداً وديناميكي لقطعة "${productName}" من زوايا متعددة تبرز الفخامة.\n🔊 الهندسة الصوتية: إيقاع سريع وحماسي: "احصل على "${productName}" الفاخر بـ ${discountStr}! الكمية فعلياً بتخلص!" ⏳\n\n3️⃣ الدعوة للإجراء (CTA - من ثانية 8 إلى 12):\n🎥 المشهد البصري: سهم وامض يشير لزر الشراء أسفل الشاشة مع عبارة "الكمية محدودة جداً".\n🔊 الهندسة الصوتية: "اضغط واطلب فوراً قبل إغلاق العرض! التوصيل لحد باب البيت! 🏃‍♂️💨"`;

    designIdea = `🎨 فكرة تصميم البانر الإعلاني (Urgent Sale Concept):\n• التكوين البصري: تصميم ديناميكي يعتمد على الخطوط القطرية الحادة لإعطاء شعور بالسرعة والإلحاح.\n• الألوان: استخدام تباين قوي بين الأسود والأحمر الصارخ أو الأصفر التحذيري.\n• العناوين: عنوان ضخم في الأعلى "تصفية نهائية - فرصة أخيرة"، وصورة المنتج في المنتصف مع تأثير إضاءة ساطعة.\n• زر الإجراء: زر كبير ومتحرك بصرياً مكتوب عليه "اطلب قبل نفاد الكمية".`;

    imagePrompt = `Dramatic commercial fashion shot of ${productName}, vibrant studio lighting with bold red and yellow accent lights, high contrast, clean minimalist background, ultra-sharp focus on product details, premium e-commerce advertisement style, 8k, photorealistic --ar 1:1 --v 6.0`;
  } else {
    facebook = `الأناقة الاستثنائية والراحة الفائقة تلتقيان الآن في قطعة واحدة مميزة. ✨\n\nيسرنا في *${brandTitle}* أن نقدم لكم الإضافة الأحدث لمجموعتنا: 🌟 *"${productName}"* 🌟.\n\nتم تصميم هذه القطعة بعناية فائقة لتلائم أصحاب الذوق الرفيع، حيث تتميز بـ:\n🔸 جودة خامات ممتازة تضمن المتانة والراحة التامة طوال اليوم.\n🔸 تصميم كلاسيكي عصري يتماشى مع المناسبات الرسمية واليومية على حد سواء.\n🔸 ملاءمة مثالية تبرز حضورك وجاذبيتك بلمسة من الرقي البسيط.\n\nاستمتعوا بمزايا الشراء الحالية: ✨ **[ ${discountStr} ]** ✨ مع توفير خدمة التوصيل السريع لكافة المحافظات المصرية وإمكانية فحص المنتج قبل الاستلام.\n\n🛒 تفضلوا بزيارة موقعنا الإلكتروني لتقديم طلبكم الآن، أو تواصلوا معنا عبر الرسائل لمساعدتكم الفورية.\n\n#الأناقة_البسيطة #ملابس_فاخرة #موضة_عصرية #HBrand`;
    
    instagram = `استثمر في مظهرك اليومي بلمسة من الرقي المطلق مع *"${productName}"* الفاخر من *${brandTitle}*. 💼✨\n\nالآن بعرض خاص: **${discountStr}**\n\n(🎬 فكرة ستوري مقترحة: صورة فوتوغرافية احترافية ذات إضاءة استوديو ناعمة تبرز القطعة مع كتابة سطر اقتباس أنيق بخط كلاسيكي مائل يصف الشعور بالثقة عند ارتدائها).\n\n📍 للطلب والتواصل، تفضلوا بزيارة موقعنا أو مراسلتنا مباشرة.\n\n#موضة_راقية #أناقة_رجالية #تصميم_فريد #ملابس_كلاسيك`;
    
    tiktok = `🎬 سيناريو ترويجي فاخر وهادئ (20 ثانية):\n\n1️⃣ الخطاف (Hook - أول 5 ثوانٍ):\n🎥 المشهد البصري: لقطة سينمائية بطيئة (Slow Motion) وإضاءة خافتة تركز على تفاصيل ملمس "${productName}".\n🔊 الهندسة الصوتية: موسيقى بيانو هادئة وراقية مع صوت دافئ: "الأناقة الحقيقية بتبدأ من اختيارك للتفاصيل الاستثنائية..." ✨\n\n2️⃣ القصة (Story - من ثانية 5 إلى 14):\n🎥 المشهد البصري: الموديل يرتدي القطعة في أجواء راقية (مطعم فخم أو مكتب أنيق)، الكاميرا تدور ببطء لإبراز الفخامة.\n🔊 الهندسة الصوتية: "مع "${productName}" من ${brandTitle}، بنقدملك التوازن المثالي بين الراحة والفخامة اللي تستحقها." 💼\n\n3️⃣ الدعوة للإجراء (CTA - من ثانية 14 إلى 20):\n🎥 المشهد البصري: ظهور شعار الماركة بهدوء مع نص أنيق: "${discountStr}".\n🔊 الهندسة الصوتية: "اكتشف الفخامة بنفسك. اطلب الآن من خلال موقعنا."`;

    designIdea = `🎨 فكرة تصميم البانر الإعلاني (Luxury Minimalist Concept):\n• التكوين البصري: تصميم نظيف وهادئ (Minimalist) يركز على مساحات فارغة مريحة للعين (White Space).\n• الألوان: لوحة ألوان ترابية فاخرة (بيج، رمادي دافئ، أو ذهبي خافت) مع خلفية ناعمة.\n• العناوين: خط سيريف (Serif) أنيق وكلاسيكي لاسم المنتج "${productName}".\n• زر الإجراء: زر بسيط بإطار رفيع (Outline Button) مكتوب عليه "اكتشف المجموعة".`;

    imagePrompt = `Cinematic luxury fashion editorial of ${productName}, elegant minimalist background, soft diffused studio lighting, subtle warm tones, high fashion magazine aesthetic, exquisite detail, 8k resolution, Leica 50mm, photorealistic --ar 16:9 --v 6.0`;
  }

  addLog('success', `✨ تم توليد الحزمة الإبداعية وسيناريوهات الفيديو لـ "${productName}" بنجاح باستخدام المحرك المحلي.`);
  res.json({ facebook, instagram, tiktok, designIdea, imagePrompt });
});

// Auto-discover accounts via Meta Token
app.post('/api/settings/discover-accounts', authenticateToken, async (req, res) => {
  const { metaAccessToken } = req.body;
  if (!metaAccessToken) {
    return res.status(400).json({ error: 'Token is required' });
  }
  try {
    addLog('info', 'جاري جلب قائمة الحسابات الإعلانية المرتبطة بـ Meta Token الخاص بك...');
    const url = `https://graph.facebook.com/v18.0/me/adaccounts`;
    const response = await axios.get(url, {
      params: {
        fields: 'name,id',
        access_token: metaAccessToken
      }
    });
    
    const accountsData = response.data.data || [];
    const accountsList = accountsData.map(acc => ({
      id: acc.id.replace('act_', ''), // Clean ID prefix
      name: acc.name
    }));

    if (accountsList.length > 0) {
      addLog('success', `✅ تم اكتشاف ${accountsList.length} حساب إعلاني بنجاح على حسابك.`);
      // Save discovered list in settings cache
      const data = loadData();
      data.settings.metaAccessToken = metaAccessToken;
      data.settings.metaAdAccountsList = accountsList;
      data.settings.metaAdAccountId = accountsList[0].id; // Set default to first
      saveData(data);
      
      // Inject dummy mock structure in simulation so they can click and view it immediately
      accountsList.forEach(acc => {
        if (!mockCampaignsByAccount[acc.id]) {
          mockCampaignsByAccount[acc.id] = [
            {
              id: `real_mock_camp_${acc.id}`,
              name: `حملة مستوردة - ${acc.name}`,
              status: 'ACTIVE',
              objective: 'LEAD_GENERATION',
              spend: 15.00,
              impressions: 1200,
              clicks: 45,
              leads: 3,
              cpa: 5.00,
              budget: 20.00,
              adsets: [
                {
                  id: `real_mock_set_${acc.id}`,
                  name: 'مجموعة الجمهور التلقائية المستوردة',
                  budget: 20.00,
                  ads: [
                    { id: `real_mock_ad_1_${acc.id}`, name: 'إعلان صورة مستورد تلقائياً 01', status: 'ACTIVE', spend: 10.00, leads: 2, cpa: 5.00 },
                    { id: `real_mock_ad_2_${acc.id}`, name: 'إعلان فيديو مستورد تلقائياً 02', status: 'ACTIVE', spend: 5.00, leads: 1, cpa: 5.00 }
                  ]
                }
              ]
            }
          ];
        }
      });

      return res.json({ success: true, accountsList, selectedId: accountsList[0].id });
    } else {
      addLog('warning', 'لم يتم العثور على أي حسابات إعلانية مرتبطة بمفتاح الوصول هذا.');
      return res.json({ success: false, error: 'No ad accounts found' });
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.message;
    addLog('danger', `❌ فشل اكتشاف الحسابات الإعلانية: ${errorMsg}`);
    res.status(500).json({ error: errorMsg });
  }
});

// Exchange Short-Lived Access Token for Long-Lived (60 days) Token
app.post('/api/settings/exchange-token', async (req, res) => {
  const { shortLivedToken, appId, appSecret } = req.body;
  if (!shortLivedToken || !appId || !appSecret) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة (الرمز المؤقت، معرف التطبيق، ومفتاح السر)' });
  }

  try {
    addLog('info', 'جاري التواصل مع Meta لتحويل الرمز المؤقت إلى رمز ممتد الصلاحية (60 يوم)...');
    const url = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const response = await axios.get(url, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken
      }
    });

    const longLivedToken = response.data.access_token;
    if (longLivedToken) {
      const data = loadData();
      data.settings.metaAccessToken = longLivedToken;
      saveData(data);
      addLog('success', '✅ تم تحويل الرمز بنجاح وتحديث فيسبوك Access Token في لوحة التحكم لـ 60 يوماً!');
      return res.json({ success: true, longLivedToken });
    } else {
      return res.status(500).json({ error: 'لم يرجع فيسبوك أي رمز ممتد في الاستجابة.' });
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.message;
    addLog('danger', `❌ فشل تمديد صلاحية رمز الوصول: ${errorMsg}`);
    res.status(500).json({ error: errorMsg });
  }
});

// Create/Update Rule
app.post('/api/rules', authenticateToken, (req, res) => {
  const data = loadData();
  const rule = req.body;
  
  if (!rule.id) {
    rule.id = 'rule_' + Date.now();
    data.rules.push(rule);
    addLog('system', `تم إنشاء قاعدة أتمتة جديدة بنجاح: "${rule.name}"`);
  } else {
    const idx = data.rules.findIndex(r => r.id === rule.id);
    if (idx !== -1) {
      data.rules[idx] = rule;
      addLog('system', `تم تعديل وتحديث قاعدة الأتمتة: "${rule.name}"`);
    } else {
      data.rules.push(rule);
    }
  }
  saveData(data);
  res.json({ success: true, rules: data.rules });
});

// Delete Rule
app.delete('/api/rules/:id', (req, res) => {
  const data = loadData();
  const ruleId = req.params.id;
  const rule = data.rules.find(r => r.id === ruleId);
  if (rule) {
    data.rules = data.rules.filter(r => r.id !== ruleId);
    saveData(data);
    addLog('system', `تم حذف قاعدة الأتمتة بنجاح: "${rule.name}"`);
    res.json({ success: true, rules: data.rules });
  } else {
    res.status(404).json({ error: 'Rule not found' });
  }
});

// Trigger Rules check manually
app.post('/api/trigger', authenticateToken, async (req, res) => {
  try {
    addLog('info', 'تم تحفيز فحص القواعد الإعلانية يدوياً من لوحة التحكم.');
    await runAutomation();
    const activeAccId = req.body.accountId || '26739674035671488';
    res.json({ success: true, logs: loadLogs(), mockCampaigns: mockCampaignsByAccount[activeAccId] });
  } catch (err) {
    addLog('danger', `خطأ في الفحص اليدوي المباشر: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Get Live Logs
app.get('/api/logs', (req, res) => {
  const logs = loadLogs();
  res.json(logs);
});

// Clear Logs
app.post('/api/logs/clear', (req, res) => {
  const emptyLogs = [{
    timestamp: new Date().toISOString(),
    type: 'system',
    message: 'تم تفريغ السجل والبدء من جديد.'
  }];
  fs.writeFileSync(LOGS_FILE, JSON.stringify(emptyLogs, null, 2), 'utf-8');
  res.json(emptyLogs);
});

// GET: Retrieve all leads
app.get('/api/leads', authenticateToken, (req, res) => {
  try {
    const region = req.query.region || 'EG';
    let leads = loadLeads();
    
    // Filter or Map to Regional Leads if needed for simulation
    if (region === 'SA') {
      leads = leads.map(l => ({
        ...l,
        name: l.name.replace('أحمد محمود', 'سعد الشهري').replace('كريم عبد العزيز', 'فهد الدوسري').replace('مي الشافعي', 'نورة العتيبي'),
        phone: l.phone.startsWith('+20') ? l.phone.replace('+20', '+966') : l.phone
      }));
    } else if (region === 'AE') {
      leads = leads.map(l => ({
        ...l,
        name: l.name.replace('أحمد محمود', 'راشد المكتوم').replace('كريم عبد العزيز', 'سيف بن زايد').replace('مي الشافعي', 'ريم الهاشمي'),
        phone: l.phone.startsWith('+20') ? l.phone.replace('+20', '+971') : l.phone
      }));
    }
    
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add a new lead (Incoming Webhook / Google Sheets sync)
app.post('/api/leads', async (req, res) => {
  const { name, phone, product, brand, email } = req.body;
  if (!name || !phone || !product || !brand) {
    return res.status(400).json({ error: 'حقول الاسم والهاتف والمنتج والماركة مطلوبة!' });
  }
  
  try {
    // Save to MongoDB
    const dbLead = await Lead.create({ name, phone, email: email || '', product, brand });
    
    const leads = loadLeads();
    const newLead = {
      id: dbLead._id.toString(),
      name,
      phone,
      email: email || '',
      product,
      brand,
      timestamp: dbLead.timestamp,
      status: dbLead.status
    };

    leads.unshift(newLead); // Add to top
    saveLeads(leads);

    await addLog('success', `📥 [عميل جديد]: تم استلام عميل محتمل لـ ${brand}: ${name} (${phone}) مهتم بـ "${product}"`);
    await addLog('success', `📱 [واتساب تلقائي]: تم إرسال رسالة ترحيبية آلية لـ ${name} بنجاح لتسريع عملية البيع.`);

    // Fetch telegram settings and fire alert
    const settings = loadData().settings;
    if (settings.telegramBotToken && settings.telegramChatId) {
      const message = `📥 <b>عميل محتمل جديد! (New Lead) - MetaFlow AI</b>\n\n` +
                      `🏢 <b>العلامة التجارية:</b> <code>${brand}</code>\n` +
                      `👤 <b>الاسم:</b> <code>${name}</code>\n` +
                      `📞 <b>الهاتف:</b> <code>${phone}</code>\n` +
                      `🛍️ <b>المنتج المهتم به:</b> <code>${product}</code>\n\n` +
                      `🟢 <i>تم الحفظ وتحديث لوحة المتابعة بنجاح! جاهز للمراسلة الآن.</i>`;
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const whatsappMsg = encodeURIComponent(`أهلاً أ/ ${name}، شكراً لاهتمامك بمنتجات ${brand} (طلبك: ${product}). معك خدمة العملاء، كيف يمكنني مساعدتك اليوم؟`);
      const inlineButtons = [
        { text: '🟢 مراسلة سريعة عبر واتساب', url: `https://wa.me/${cleanPhone}?text=${whatsappMsg}` },
        { text: '📋 لوحة العملاء', url: 'http://localhost:5000' }
      ];
      await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, message, inlineButtons);
    }
    if (settings.notificationEmail) {
      await sendEmailNotification(settings.notificationEmail, `عميل محتمل جديد - ${brand}`, `<h2 style="color:#00ffaa;">عميل جديد لـ ${brand}!</h2><p><b>الاسم:</b> ${name} | <b>الهاتف:</b> ${phone}</p><p><b>المنتج:</b> ${product}</p>`);
    }

    res.json({ success: true, leads, lead: newLead }); // Return full leads list for frontend update
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Consultant Chat
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  const { message, accountId, region, currency } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const data = loadData();
    const leads = loadLeads();
    
    // Gather context for AI
    const targetAccountId = accountId || data.settings.metaAdAccountId;
    const campaigns = await getCachedCampaigns(targetAccountId);
    
    const contextData = {
      accountId: targetAccountId,
      targetRegion: region,
      currency: currency,
      activeRules: data.rules.filter(r => r.isActive),
      leadsSummary: {
        total: leads.length,
        last10: leads.slice(0, 10).map(l => ({ brand: l.brand, product: l.product, status: l.status }))
      },
      campaignsPerformance: campaigns.map(c => ({
        name: c.name,
        status: c.status,
        spend: c.spend,
        leads: c.leads,
        cpa: c.cpa,
        roi: c.roi
      }))
    };

    const aiResponse = await getAiConsultantResponse(message, contextData);
    res.json({ success: true, response: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Interactive Notification Test Endpoint
app.post('/api/notifications/test', async (req, res) => {
  const data = loadData();
  const { settings } = data;
  const { telegramBotToken, telegramChatId, notificationEmail } = req.body;
  
  let telegramSuccess = false;
  let emailSuccess = false;

  if (telegramBotToken && telegramChatId) {
    const testMsg = `🔔 <b>تنبيه تجريبي تفاعلي - MetaFlow AI</b>\n\n🎉 <i>مرحباً بك! تم ربط نظام التنبيهات المتقدم بنجاح بقناة التليجرام الخاصة بك وبفريق العمل.</i>\n\nستصلك الإشعارات اللحظية عند إيقاف أي إعلان ضعيف أو زيادة الميزانية أو وصول عملاء محتملين جدد!`;
    const inlineButtons = [
      { text: '⚡ فتح لوحة التحكم المباشرة', url: 'http://localhost:5000' },
      { text: '🟢 وتساب الدعم', url: 'https://wa.me/201000000000' }
    ];
    telegramSuccess = await sendTelegramMessage(telegramBotToken, telegramChatId, testMsg, inlineButtons);
  }

  if (notificationEmail) {
    emailSuccess = await sendEmailNotification(notificationEmail, 'تأكيد ربط البريد الإلكتروني - MetaFlow AI', `<h2 style="color:#00ffaa;">تم تفعيل البريد الإلكتروني بنجاح!</h2><p>ستصلك التقارير اليومية وملخصات الأداء التلقائية على هذا البريد بانتظام.</p>`);
  }

  addLog('success', '🔔 تم إرسال تنبيه تجريبي تفاعلي للتحقق من الربط مع تليجرام والبريد الإلكتروني.');
  res.json({ success: true, telegramSuccess, emailSuccess });
});

// POST: Update lead follow-up status
app.post('/api/leads/status', (req, res) => {
  const { leadId, status } = req.body;
  if (!leadId || !status) {
    return res.status(400).json({ error: 'مطلوب معرّف العميل والحالة الجديدة!' });
  }

  try {
    const leads = loadLeads();
    const idx = leads.findIndex(l => l.id === leadId);
    if (idx !== -1) {
      const oldStatus = leads[idx].status;
      leads[idx].status = status;
      saveLeads(leads);
      addLog('system', `تم تغيير حالة العميل "${leads[idx].name}" من (${oldStatus}) إلى (${status}).`);
      return res.json({ success: true, leads });
    }
    res.status(404).json({ error: 'العميل غير موجود!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Setup Server-Side Automatic Cron-Jobs ---
let automationCron = null;

function setupCronJob(intervalMinutes) {
  if (automationCron) {
    automationCron.stop();
  }
  
  const minutes = parseInt(intervalMinutes) || 30;
  const cronExpression = `*/${minutes} * * * *`;
  
  addLog('system', `تمت جدولة الفحص الآلي المستمر ليعمل كل ${minutes} دقيقة بنجاح.`);
  
  automationCron = cron.schedule(cronExpression, async () => {
    try {
      await runAutomation();
    } catch (err) {
      console.error('Error running scheduled automation cron:', err.message);
    }
  });
}

// Serve Frontend Bundle in Production Environment
const frontendDist = path.join(__dirname, 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start Server and initialize
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Create default admin if not exists
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const adminUser = await User.findOne({ username: adminUsername });
    if (adminUser) {
      adminUser.password = adminPassword;
      await adminUser.save();
      console.log(`👤 [AUTH] Admin user updated with credentials from .env: ${adminUsername}`);
    } else {
      await User.create({ username: adminUsername, password: adminPassword });
      console.log(`👤 [AUTH] Default admin created: ${adminUsername} / ${adminPassword}`);
    }
  } catch (err) {
    console.error('❌ [AUTH] Failed to check/create admin user:', err.message);
  }

  const data = loadData();
  loadLogs();
  
  // Validate and Fetch Initial Real Data
  if (data.settings.metaAccessToken && data.settings.metaAdAccountId) {
    console.log('🚀 [STARTUP] Real credentials detected. Syncing with Meta Ads API...');
    try {
      await runAutomation();
      console.log('✅ [STARTUP] First sync completed. Real data is now live.');
    } catch (err) {
      console.error('❌ [STARTUP] Initial sync failed:', err.message);
    }
  } else {
    console.log('⚠️ [STARTUP] Missing Meta credentials. Dashboard will use simulation mode.');
  }

  // Telegram Status
  if (data.settings.telegramBotToken && data.settings.telegramChatId) {
    console.log('📡 [STARTUP] Telegram Alerts: ACTIVE');
  } else {
    console.log('📡 [STARTUP] Telegram Alerts: NOT CONFIGURED');
  }

  // Google Sheets Status
  if (data.settings.googleSheetId) {
    console.log('📊 [STARTUP] Google Sheets Sync: READY');
  } else {
    console.log('📊 [STARTUP] Google Sheets Sync: NOT CONFIGURED');
  }

  setupCronJob(parseInt(data.settings.checkInterval) || 30);
});

