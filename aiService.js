import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getAiConsultantResponse = async (userMessage, contextData) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "⚠️ عذراً، يجب إعداد GEMINI_API_KEY في ملف .env لتفعيل المستشار الذكي.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { targetRegion, currency, campaignsPerformance, leadsSummary } = contextData;
    const regionName = targetRegion === 'SA' ? 'المملكة العربية السعودية' : targetRegion === 'AE' ? 'الإمارات' : 'مصر';
    const dialect = targetRegion === 'SA' ? 'الخليجي/السعودي' : targetRegion === 'AE' ? 'الخليجي/الإماراتي' : 'المصري';
    
    const prompt = `
      أنت "MetaFlow AI Consultant"، خبير استراتيجي في إدارة إعلانات ميتا متخصص في السوق ${dialect}. 
      هدفك هو تحليل أداء الحملات وتقديم نصائح ذكية لزيادة المبيعات وتقليل تكلفة العميل (CPA) في ${regionName}.

      بيانات السياق الحالي:
      - المنطقة: ${regionName} (${targetRegion})
      - العملة: ${currency}
      - ملخص العملاء (CRM Kanban): ${leadsSummary.total} عملاء إجمالي.
      - تفاصيل الحالات: ${JSON.stringify(leadsSummary.last10)}
      - أداء الحملات: ${JSON.stringify(campaignsPerformance)}

      سؤال المستخدم:
      ${userMessage}

      إرشادات الرد:
      1. تحدث باللغة العربية بأسلوب مهني جذاب (يمكن استخدام نبرة ${dialect} خفيفة).
      2. إذا سُئلت عن "الاستهداف" أو "الجمهور"، اقترح مدن محددة في ${regionName} (مثل ${targetRegion === 'SA' ? 'الرياض، جدة، الدمام' : targetRegion === 'AE' ? 'دبي، أبوظبي، الشارقة' : 'القاهرة، الإسكندرية، المنصورة'}).
      3. اعتمد على الأرقام (CPA, Spend, ROI) في تحليلك.
      4. كن مختصراً ومباشراً.
      5. اهتم بنصائح تحويل العملاء من حالة "مهتم" إلى "تم البيع" لتعظيم العائد.
      6. شجع دائماً على تفعيل قواعد الأتمتة (Automation Rules) للتحكم اللحظي.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Consultant Error:", error);
    return "❌ عذراً، حدث خطأ أثناء معالجة طلبك عبر الذكاء الاصطناعي.";
  }
};
