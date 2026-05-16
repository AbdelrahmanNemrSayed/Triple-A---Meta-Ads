import React from "react";
import * as XLSX from "xlsx";

export default function LeadsTab({
  leads,
  manualLeadName,
  setManualLeadName,
  manualLeadPhone,
  setManualLeadPhone,
  manualLeadProduct,
  setManualLeadProduct,
  manualLeadBrand,
  setManualLeadBrand,
  isSubmittingLead,
  handleCreateManualLead,
  leadBrandFilter,
  setLeadBrandFilter,
  leadStatusFilter,
  setLeadStatusFilter,
  handleUpdateLeadStatus,
}) {
  const [viewMode, setViewMode] = React.useState("list"); // 'list' or 'kanban'

  const handleExportExcel = () => {
    const filteredLeads = leads.filter((l) => {
      const brandMatch =
        leadBrandFilter === "all" || l.brand === leadBrandFilter;
      const statusMatch =
        leadStatusFilter === "all" || l.status === leadStatusFilter;
      return brandMatch && statusMatch;
    });

    const worksheet = XLSX.utils.json_to_sheet(
      filteredLeads.map((l) => ({
        الاسم: l.name,
        الهاتف: l.phone,
        البريد: l.email || "N/A",
        المنتج: l.product,
        "العلامة التجارية": l.brand,
        الحالة: l.status,
        التاريخ: new Date(l.timestamp).toLocaleString("ar-EG"),
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(
      workbook,
      `Triple_A_Leads_${new Date().toLocaleDateString()}.xlsx`,
    );
  };

  return (
    <div className="tab-pane active animated fadeIn">
      {/* Quick Metrics of leads */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="glass-card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderRight: "4px solid var(--primary)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              إجمالي العملاء المحتملين
            </span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {leads.length}
            </span>
          </div>
          <div style={{ fontSize: "1.8rem" }}>👥</div>
        </div>
        <div
          className="glass-card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderRight: "4px solid #1877f2",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              بانتظار التواصل (جديد)
            </span>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#1877f2",
              }}
            >
              {leads.filter((l) => l.status === "جديد").length}
            </span>
          </div>
          <div style={{ fontSize: "1.8rem" }}>⚡</div>
        </div>
        <div
          className="glass-card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderRight: "4px solid #f2a118",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              قيد المتابعة والتواصل
            </span>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#f2a118",
              }}
            >
              {leads.filter((l) => l.status === "تم التواصل").length}
            </span>
          </div>
          <div style={{ fontSize: "1.8rem" }}>💬</div>
        </div>
        <div
          className="glass-card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderRight: "4px solid var(--success)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              مبيعات مكتملة (تم البيع)
            </span>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--success)",
              }}
            >
              {leads.filter((l) => l.status === "تم البيع").length}
            </span>
          </div>
          <div style={{ fontSize: "1.8rem" }}>🏆</div>
        </div>
      </div>

      <div
        className="leads-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2.2fr",
          gap: "1.5rem",
        }}
      >
        {/* Left Column: Manual Lead Simulation form */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            height: "fit-content",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--primary)",
            }}
          >
            <span>🚀</span> محاكي تسجيل العملاء
          </h3>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              lineHeight: "1.4",
            }}
          >
            هذا القسم يُحاكي وصول عميل جديد من استمارات فيسبوك الإعلانية أو API
            أو جداول البيانات. سيقوم النظام بحفظه تلقائياً وإرسال إشعار تيليجرام
            وتحديث السجل!
          </p>

          <form
            onSubmit={handleCreateManualLead}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.8rem" }}>اسم العميل بالكامل</label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد عبد الله"
                value={manualLeadName}
                onChange={(e) => setManualLeadName(e.target.value)}
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "rgba(0,0,0,0.15)",
                  color: "#fff",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.8rem" }}>
                رقم الواتساب بالرمز الدولي
              </label>
              <input
                type="text"
                required
                placeholder="مثال: +201012345678"
                value={manualLeadPhone}
                onChange={(e) => setManualLeadPhone(e.target.value)}
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "rgba(0,0,0,0.15)",
                  color: "#fff",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  outline: "none",
                  direction: "ltr",
                  textAlign: "right",
                }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.8rem" }}>
                المنتج أو الخدمة المهتم بها
              </label>
              <input
                type="text"
                required
                placeholder="مثال: تيشيرت صيفي قطن"
                value={manualLeadProduct}
                onChange={(e) => setManualLeadProduct(e.target.value)}
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "rgba(0,0,0,0.15)",
                  color: "#fff",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.8rem" }}>
                الحساب الإعلاني / العلامة التجارية
              </label>
              <select
                value={manualLeadBrand}
                onChange={(e) => setManualLeadBrand(e.target.value)}
                style={{
                  padding: "0.5rem",
                  background: "rgba(0,0,0,0.15)",
                  color: "#fff",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  outline: "none",
                }}
              >
                <option value="HBrand" style={{ background: "#0c0d12" }}>
                  HBrand Outlet (ملابس فاخرة الأوتلت)
                </option>
                <option value="HForLess" style={{ background: "#0c0d12" }}>
                  HForLess Store (تصفية كبرى صيفية)
                </option>
              </select>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${isSubmittingLead ? "disabled" : ""}`}
              disabled={isSubmittingLead}
              style={{
                padding: "0.6rem",
                fontSize: "0.9rem",
                marginTop: "0.5rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {isSubmittingLead
                ? "🔄 جاري المعالجة..."
                : "➕ تسجيل وتفعيل الإشعارات"}
            </button>
          </form>
        </div>

        {/* Right Column: Filterable list of leads */}
        <div
          className="glass-card"
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "0.75rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>👥</span> العملاء المتفاعلون والمبيعات الحالية
            </h3>

            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <div
                className="glass-card"
                style={{
                  display: "flex",
                  padding: "0.2rem",
                  gap: "0.2rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                }}
              >
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    padding: "0.3rem 0.6rem",
                    fontSize: "0.75rem",
                    background:
                      viewMode === "list" ? "var(--primary)" : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  📝 قائمة
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  style={{
                    padding: "0.3rem 0.6rem",
                    fontSize: "0.75rem",
                    background:
                      viewMode === "kanban" ? "var(--primary)" : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  🗂️ كانبان
                </button>
              </div>

              <button
                onClick={() => {
                  alert("📊 تحليل اعتراضات العملاء بالذكاء الاصطناعي:\n\n1. السعر المرتفع (65%): يرى معظم العملاء أن السعر مرتفع مقارنة بالمنافسين. ننصح بإبراز قيمة المنتج أو تقديم خيارات تقسيط.\n2. تكلفة الشحن (20%): بعض العملاء تراجعوا بسبب تكلفة الشحن للمحافظات البعيدة. نقترح تقديم شحن مجاني للطلبات فوق قيمة معينة.\n3. التردد في المقاسات (15%): هناك قلق بشأن المقاسات. ننصح بإضافة جدول مقاسات دقيق في الإعلان.");
                }}
                className="btn btn-secondary"
                style={{
                  padding: "0.45rem 0.8rem",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(0, 242, 254, 0.1)",
                  border: "1px solid rgba(0, 242, 254, 0.2)",
                  color: "#00f2fe",
                }}
              >
                🧠 تحليل الاعتراضات
              </button>

              <button
                onClick={handleExportExcel}
                className="btn btn-secondary"
                style={{
                  padding: "0.45rem 0.8rem",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(0, 255, 170, 0.1)",
                  border: "1px solid rgba(0, 255, 170, 0.2)",
                  color: "var(--success)",
                }}
              >
                📥 Excel
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <select
                value={leadBrandFilter}
                onChange={(e) => setLeadBrandFilter(e.target.value)}
                style={{
                  padding: "0.3rem 0.5rem",
                  fontSize: "0.8rem",
                  background: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "6px",
                  outline: "none",
                }}
              >
                <option value="all" style={{ background: "#0c0d12" }}>
                  تصفية بالبراند (الكل)
                </option>
                <option value="HBrand" style={{ background: "#0c0d12" }}>
                  HBrand Outlet
                </option>
                <option value="HForLess" style={{ background: "#0c0d12" }}>
                  HForLess Store
                </option>
              </select>

              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                style={{
                  padding: "0.3rem 0.5rem",
                  fontSize: "0.8rem",
                  background: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "6px",
                  outline: "none",
                }}
              >
                <option value="all" style={{ background: "#0c0d12" }}>
                  تصفية بالحالة (الكل)
                </option>
                <option value="جديد" style={{ background: "#0c0d12" }}>
                  بانتظار التواصل (جديد)
                </option>
                <option value="تم التواصل" style={{ background: "#0c0d12" }}>
                  قيد التواصل
                </option>
                <option value="تم البيع" style={{ background: "#0c0d12" }}>
                  مكتمل (تم البيع)
                </option>
              </select>
            </div>
          </div>

          {/* Leads Scroll Zone / Kanban Board */}
          {viewMode === "list" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                maxHeight: "650px",
                overflowY: "auto",
                paddingRight: "0.25rem",
              }}
            >
              {leads.filter((l) => {
                const brandMatch =
                  leadBrandFilter === "all" || l.brand === leadBrandFilter;
                const statusMatch =
                  leadStatusFilter === "all" || l.status === leadStatusFilter;
                return brandMatch && statusMatch;
              }).length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "3rem",
                    color: "var(--text-muted)",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "2.5rem" }}>📥</span>
                  <p style={{ fontSize: "0.9rem" }}>
                    لا توجد أي بيانات تطابق عوامل التصفية الحالية.
                  </p>
                </div>
              ) : (
                leads
                  .filter((l) => {
                    const brandMatch =
                      leadBrandFilter === "all" || l.brand === leadBrandFilter;
                    const statusMatch =
                      leadStatusFilter === "all" ||
                      l.status === leadStatusFilter;
                    return brandMatch && statusMatch;
                  })
                  .map((lead) => {
                    const greeting =
                      lead.brand === "HBrand"
                        ? "HBrand Outlet"
                        : "HForLess Store";
                    const msg = `أهلاً أ/ ${lead.name}،\n\nشكراً لاهتمامك بمنتجاتنا في ${greeting}! 👋\n\nلقد تلقينا استفسارك بخصوص: *"${lead.product}"*.\nمعك ممثل خدمة العملاء، كيف يمكننا مساعدتك اليوم؟ 😊`;
                    const waUrl = `https://wa.me/${lead.phone.replace("+", "")}?text=${encodeURIComponent(msg)}`;

                    return (
                      <div
                        key={lead.id}
                        className="glass-card lead-card animate-row"
                        style={{
                          padding: "1.25rem",
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          alignItems: "center",
                          background: "rgba(255,255,255,0.01)",
                          borderRight:
                            lead.brand === "HBrand"
                              ? "4px solid var(--primary)"
                              : "4px solid var(--secondary)",
                          gap: "1.5rem",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.4rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <h4
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: "bold",
                                color: "#fff",
                              }}
                            >
                              {lead.name}
                            </h4>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "4px",
                                background:
                                  lead.brand === "HBrand"
                                    ? "rgba(var(--primary-rgb), 0.15)"
                                    : "rgba(var(--secondary-rgb), 0.15)",
                                color:
                                  lead.brand === "HBrand"
                                    ? "var(--primary)"
                                    : "var(--secondary)",
                                fontWeight: "700",
                              }}
                            >
                              {lead.brand === "HBrand"
                                ? "HBrand Outlet"
                                : "HForLess Store"}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                              display: "flex",
                              gap: "0.25rem",
                            }}
                          >
                            <span>🛍️ المنتج:</span>
                            <strong style={{ color: "var(--text-muted)" }}>
                              {lead.product}
                            </strong>
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            📅 تم تسجيله:{" "}
                            {new Date(lead.timestamp).toLocaleTimeString(
                              "ar-EG",
                              { hour: "2-digit", minute: "2-digit" },
                            )}{" "}
                            -{" "}
                            {new Date(lead.timestamp).toLocaleDateString(
                              "ar-EG",
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.65rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              تحديث حالة العميل:
                            </span>
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleUpdateLeadStatus(lead.id, e.target.value)
                              }
                              style={{
                                padding: "0.3rem 0.5rem",
                                fontSize: "0.8rem",
                                background: "rgba(255,255,255,0.05)",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "6px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                outline: "none",
                              }}
                            >
                              <option value="جديد">بانتظار التواصل</option>
                              <option value="تم التواصل">جاري التواصل</option>
                              <option value="مهتم">مهتم / متابعة</option>
                              <option value="تم البيع">تم البيع والتحويل</option>
                            </select>
                          </div>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              padding: "0.45rem 0.75rem",
                              fontSize: "0.8rem",
                              borderRadius: "8px",
                              textDecoration: "none",
                            }}
                          >
                            <span style={{ fontSize: "1.05rem" }}>🟢</span>{" "}
                            واتساب
                          </a>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          ) : (
            /* KANBAN VIEW */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
                minHeight: "550px",
                overflowX: "auto",
                padding: "0.5rem",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "16px",
              }}
            >
              {["جديد", "تم التواصل", "مهتم", "تم البيع"].map((columnStatus) => (
                <div
                  key={columnStatus}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const leadId = e.dataTransfer.getData("leadId");
                    handleUpdateLeadStatus(leadId, columnStatus);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    minWidth: "260px",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "12px",
                    padding: "1rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "2px solid " + (
                        columnStatus === "جديد" ? "var(--primary)" : 
                        columnStatus === "تم التواصل" ? "#f2a118" : 
                        columnStatus === "مهتم" ? "var(--secondary)" : 
                        "var(--success)"
                      ),
                      paddingBottom: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h4 style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      {columnStatus === "جديد" ? "🆕 جديد" : 
                       columnStatus === "تم التواصل" ? "📞 جاري التواصل" : 
                       columnStatus === "مهتم" ? "⭐ مهتم" : "💰 تم البيع"}
                    </h4>
                    <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                      {leads.filter((l) => l.status === columnStatus).length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '600px' }}>
                    {leads.filter(l => l.status === columnStatus).map(lead => (
                      <div 
                        key={lead.id} 
                        className="glass-card" 
                        draggable="true"
                        onDragStart={(e) => {
                          e.dataTransfer.setData("leadId", lead.id);
                        }}
                        style={{ 
                          padding: '0.75rem', 
                          fontSize: '0.8rem', 
                          position: 'relative', 
                          borderLeft: `3px solid ${lead.brand === 'HBrand' ? 'var(--primary)' : 'var(--secondary)'}`,
                          cursor: 'grab'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{lead.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>🛍️ {lead.product}</div>
                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <a href={`https://wa.me/${lead.phone.replace('+', '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--success)', fontSize: '0.75rem' }}>💬 واتساب</a>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⋮ سحب لنقل</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
