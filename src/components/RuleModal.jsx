import React from "react";

export default function RuleModal({
  showModal,
  setShowModal,
  handleSaveRule,
  newRule,
  setNewRule,
  settings,
}) {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-title">
            ➕ صياغة قاعدة أتمتة وتحكم مخصصة
          </span>
          <button
            type="button"
            className="modal-close"
            onClick={() => setShowModal(false)}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSaveRule}>
          <div className="modal-body">
            <div className="form-group">
              <label>اسم القاعدة (مثال: إيقاف هدر الإعلان)</label>
              <input
                type="text"
                required
                placeholder="مثال: إيقاف فوري عند ارتفاع سعر العميل"
                value={newRule.name}
                onChange={(e) =>
                  setNewRule({ ...newRule, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>وصف وظيفتها</label>
              <textarea
                rows="2"
                placeholder="شرح مبسط لما تفعله هذه القاعدة في الخلفية..."
                value={newRule.description}
                onChange={(e) =>
                  setNewRule({ ...newRule, description: e.target.value })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>المستوى المستهدف بالفحص</label>
                <select
                  value={newRule.targetType}
                  onChange={(e) =>
                    setNewRule({ ...newRule, targetType: e.target.value })
                  }
                >
                  <option value="ad" style={{ background: "#0c0d12" }}>
                    الإعلان الفردي (Ad)
                  </option>
                  <option value="adset" style={{ background: "#0c0d12" }}>
                    المجموعة الإعلانية (Adset)
                  </option>
                  <option value="account" style={{ background: "#0c0d12" }}>
                    كامل الحساب الإعلاني (Account)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>الإجراء المتخذ عند تحقق الشرط</label>
                <select
                  value={newRule.action}
                  onChange={(e) =>
                    setNewRule({ ...newRule, action: e.target.value })
                  }
                >
                  <option value="pause" style={{ background: "#0c0d12" }}>
                    إيقاف مؤقت فوري (Pause)
                  </option>
                  <option
                    value="increase_budget"
                    style={{ background: "#0c0d12" }}
                  >
                    زيادة الميزانية بنسبة % (Scale up)
                  </option>
                  <option
                    value="send_report"
                    style={{ background: "#0c0d12" }}
                  >
                    إرسال تقرير تنبيهي فقط (Alert)
                  </option>
                  <option
                    value="dayparting_pause"
                    style={{ background: "#0c0d12" }}
                  >
                    ⏰ إيقاف الحملات ليلاً (ساعات الركود)
                  </option>
                  <option
                    value="dayparting_start"
                    style={{ background: "#0c0d12" }}
                  >
                    ☀️ تشغيل الحملات صباحاً (ساعات الذروة)
                  </option>
                </select>
              </div>
            </div>

            {newRule.action !== "send_report" && newRule.action !== "dayparting_pause" && newRule.action !== "dayparting_start" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>المقياس الخاضع للشرط</label>
                    <select
                      value={newRule.metric}
                      onChange={(e) =>
                        setNewRule({ ...newRule, metric: e.target.value })
                      }
                    >
                      <option value="cpa" style={{ background: "#0c0d12" }}>
                        تكلفة العميل المحتمل (CPA)
                      </option>
                      <option value="spend" style={{ background: "#0c0d12" }}>
                        إجمالي المصروف (Spent)
                      </option>
                      <option value="leads" style={{ background: "#0c0d12" }}>
                        عدد التحويلات/العملاء (Leads)
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>أداة المقارنة الشرطية</label>
                    <select
                      value={newRule.operator}
                      onChange={(e) =>
                        setNewRule({ ...newRule, operator: e.target.value })
                      }
                    >
                      <option
                        value="greater_than"
                        style={{ background: "#0c0d12" }}
                      >
                        أكبر من (&gt;)
                      </option>
                      <option
                        value="less_than"
                        style={{ background: "#0c0d12" }}
                      >
                        أصغر من (&lt;)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      القيمة المحددة للشرط ({settings?.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newRule.threshold}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          threshold: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  {newRule.action === "increase_budget" ? (
                    <div className="form-group">
                      <label>نسبة زيادة الميزانية (%)</label>
                      <input
                        type="number"
                        required
                        value={newRule.percentValue}
                        onChange={(e) =>
                          setNewRule({
                            ...newRule,
                            percentValue: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>
                        الحد الأدنى للمصروف قبل الفحص (
                        {settings?.currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newRule.minSpent}
                        onChange={(e) =>
                          setNewRule({
                            ...newRule,
                            minSpent: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {(newRule.action === "send_report" || newRule.action === "dayparting_pause" || newRule.action === "dayparting_start") && (
              <div className="form-group">
                <label>الوقت اليومي المجدول للتنفيذ</label>
                <input
                  type="time"
                  value={newRule.scheduleTime}
                  onChange={(e) =>
                    setNewRule({ ...newRule, scheduleTime: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              💾 حفظ القاعدة وتشغيلها
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
