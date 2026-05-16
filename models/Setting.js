import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  metaAccessToken: { type: String, default: '' },
  metaAdAccountId: { type: String, default: '' },
  telegramBotToken: { type: String, default: '' },
  telegramChatId: { type: String, default: '' },
  googleSheetId: { type: String, default: '' },
  checkInterval: { type: String, default: '30' },
  currency: { type: String, default: 'EGP' },
  currencySymbol: { type: String, default: 'ج.م' },
  notificationEmail: { type: String, default: '' },
  smtpHost: { type: String, default: 'smtp.gmail.com' },
  smtpPort: { type: String, default: '465' },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' }
});

export default mongoose.model('Setting', SettingSchema);
