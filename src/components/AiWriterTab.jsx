import React from "react";

export default function AiWriterTab({
  productName,
  setProductName,
  selectedBrand,
  setSelectedBrand,
  offerText,
  setOfferText,
  selectedTone,
  setSelectedTone,
  isGenerating,
  handleGenerateAdCopy,
  generatedResults,
  isGeneratingImage,
  handleGenerateAdImage,
}) {
  return (
    <div className="tab-pane active animated fadeIn">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Form Input Section */}
        <div
          className="glass-card"
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <h3
            style={{
              color: "var(--primary)",
              fontSize: "1.25rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>🧠</span> صياغة إعلان ممول جديد
          </h3>
          <form
            onSubmit={handleGenerateAdCopy}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div className="form-group">
              <label style={{ fontWeight: "600" }}>
                اسم المنتج أو الخدمة (Product Name)
              </label>
              <input
                type="text"
                required
                placeholder="مثال: تيشيرت صيفي قطن 100% أو كوتشي جلد كاجوال"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-glass)",
                  color: "#fff",
                }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label style={{ fontWeight: "600" }}>الماركة / المتجر</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-glass)",
                    color: "#fff",
                  }}
                >
                  <option value="HBrand" style={{ background: "#0c0d12" }}>
                    HBrand Outlet (ملابس فاخرة)
                  </option>
                  <option value="HForLess" style={{ background: "#0c0d12" }}>
                    HForLess Store (موضة شبابية)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: "600" }}>
                  العرض أو الخصم الخاص (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: خصم 20% أو قطعتين عليهم قطعة مجاناً"
                  value={offerText}
                  onChange={(e) => setOfferText(e.target.value)}
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-glass)",
                    color: "#fff",
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: "600" }}>
                أسلوب الكتابة ونبرة الصوت (Tone)
              </label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-glass)",
                  color: "#fff",
                }}
              >
                <option value="egyptian" style={{ background: "#0c0d12" }}>
                  🇪🇬 العامية المصرية (جذابة وقريبة للشباب)
                </option>
                <option value="urgent" style={{ background: "#0c0d12" }}>
                  🚨 أسلوب حماسي وتصفيات مستعجلة (FOMO)
                </option>
                <option value="formal" style={{ background: "#0c0d12" }}>
                  💼 لغة عربية فصحى احترافية وأنيقة
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isGenerating}
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background:
                  "linear-gradient(135deg, var(--primary) 0%, #00b3ff 100%)",
                boxShadow: "0 4px 15px rgba(0, 255, 170, 0.2)",
              }}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span> جاري صياغة إعلاناتك
                  الإبداعية...
                </>
              ) : (
                <>
                  <span>✨</span> صياغة نصوص الإعلان الآن
                </>
              )}
            </button>
          </form>

          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px dashed rgba(255,255,255,0.05)",
              marginTop: "0.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                lineHeight: "1.5",
              }}
            >
              <strong>💡 ملحوظة ذكية:</strong> في حال إدخال مفتاح{" "}
              <strong>Google Gemini API</strong> في صفحة الإعدادات، سيقوم
              المساعد بالاتصال المباشر بالذكاء الاصطناعي لكتابة أفكار حصرية
              ومميزة. في حالة عدم توفره، سيعمل المحرك المحلي المدمج المدرب على
              السوق المصري للملابس والأحذية أوتوماتيكياً!
            </p>
          </div>
        </div>

        {/* Outputs display panel */}
        <div
          className="glass-card"
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <h3
            style={{
              color: "var(--secondary)",
              fontSize: "1.25rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>📢</span> النماذج الإعلانية المقترحة
          </h3>

          {!generatedResults && !isGenerating && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                padding: "3rem 1rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✍️</div>
              <h4>أدخل تفاصيل منتجك باليسار</h4>
              <p
                style={{
                  fontSize: "0.8rem",
                  maxWidth: "300px",
                  marginTop: "0.5rem",
                }}
              >
                وسيقوم مساعد الذكاء الاصطناعي بكتابة نماذج جاهزة للنشر فوراً
                لفيسبوك وإنستقرام وتيك توك!
              </p>
            </div>
          )}

          {isGenerating && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 1rem",
                textAlign: "center",
              }}
            >
              <div
                className="spinner"
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid rgba(0,255,170,0.1)",
                  borderTop: "4px solid var(--primary)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "1.5rem",
                }}
              ></div>
              <h4 className="glowing-text">جاري الصياغة الإبداعية...</h4>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                نقوم باختيار أفضل العبارات التسويقية الجذابة والمناسبة لعلامتك
                التجارية
              </p>
            </div>
          )}

          {generatedResults && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                maxHeight: "550px",
                overflowY: "auto",
                paddingLeft: "0.5rem",
              }}
            >
              {/* Facebook Copy */}
              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      color: "#1877F2",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    🔵 بوست فيسبوك (Facebook Post)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedResults.facebook);
                      alert("📋 تم نسخ نص الفيسبوك بنجاح!");
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    نسخ النص 📋
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    whiteSpace: "pre-line",
                    lineHeight: "1.6",
                    color: "#e4e6eb",
                    textAlign: "right",
                  }}
                >
                  {generatedResults.facebook}
                </p>
              </div>

              {/* Instagram Copy */}
              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      color: "#E1306C",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    📸 كابشن إنستقرام (Instagram Caption)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedResults.instagram);
                      alert("📋 تم نسخ نص الإنستقرام بنجاح!");
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    نسخ النص 📋
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    whiteSpace: "pre-line",
                    lineHeight: "1.6",
                    color: "#e4e6eb",
                    textAlign: "right",
                  }}
                >
                  {generatedResults.instagram}
                </p>
              </div>

              {/* TikTok Scenario */}
              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      color: "#00f2fe",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    🎵 سيناريو فيديو قصير (TikTok / Reels)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedResults.tiktok);
                      alert("📋 تم نسخ سيناريو الفيديو بنجاح!");
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    نسخ السيناريو 📋
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    whiteSpace: "pre-line",
                    lineHeight: "1.6",
                    color: "#e4e6eb",
                    textAlign: "right",
                  }}
                >
                  {generatedResults.tiktok}
                </p>
              </div>

              {/* Snapchat Ad */}
              {generatedResults.snapchat && (
                <div
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        color: "#FFFC00",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      👻 إعلان سناب شات (Snapchat Ad)
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResults.snapchat);
                        alert("📋 تم نسخ إعلان سناب شات بنجاح!");
                      }}
                      className="btn btn-secondary"
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    >
                      نسخ النص 📋
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      whiteSpace: "pre-line",
                      lineHeight: "1.6",
                      color: "#e4e6eb",
                      textAlign: "right",
                    }}
                  >
                    {generatedResults.snapchat}
                  </p>
                </div>
              )}

              {/* Banner Design Concept */}
              {generatedResults.designIdea && (
                <div
                  style={{
                    background: "rgba(0, 255, 170, 0.05)",
                    border: "1px solid rgba(0, 255, 170, 0.2)",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      borderBottom: "1px solid rgba(0, 255, 170, 0.1)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      🎨 فكرة وتصميم البانر الإعلاني (Ad Banner Concept)
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResults.designIdea);
                        alert("📋 تم نسخ فكرة التصميم بنجاح!");
                      }}
                      className="btn btn-primary"
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", background: "var(--primary)", color: "#000" }}
                    >
                      نسخ الفكرة 📋
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      whiteSpace: "pre-line",
                      lineHeight: "1.6",
                      color: "#e4e6eb",
                      textAlign: "right",
                    }}
                  >
                    {generatedResults.designIdea}
                  </p>
                </div>
              )}

              {/* AI Image Generation Prompt & Studio */}
              {generatedResults.imagePrompt && (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px dashed rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        color: "#ffaa00",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      🤖 استوديو التصميم الذكي (AI Creative Studio)
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={handleGenerateAdImage}
                        disabled={isGeneratingImage}
                        className="btn btn-primary"
                        style={{ 
                          padding: "0.25rem 0.6rem", 
                          fontSize: "0.75rem",
                          background: "linear-gradient(135deg, #ffaa00 0%, #ff6600 100%)",
                          color: "#fff",
                          border: "none"
                        }}
                      >
                        {isGeneratingImage ? "جاري التصميم... ⏳" : "توليد صورة الإعلان 🎨"}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedResults.imagePrompt);
                          alert("📋 تم نسخ الموجه الإنجليزي بنجاح!");
                        }}
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        نسخ الموجه 📋
                      </button>
                    </div>
                  </div>

                  {generatedResults.adImage && (
                    <div style={{ marginBottom: "1rem", position: "relative" }}>
                      <img 
                        src={generatedResults.adImage} 
                        alt="AI Generated Ad" 
                        style={{ 
                          width: "100%", 
                          borderRadius: "8px", 
                          border: "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                        }} 
                      />
                      <div style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        background: "rgba(0,0,0,0.7)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        color: "var(--primary)"
                      }}>
                        تم التوليد بواسطة MetaFlow AI ✨
                      </div>
                    </div>
                  )}

                  <p
                    style={{
                      fontSize: "0.85rem",
                      whiteSpace: "pre-line",
                      lineHeight: "1.6",
                      color: "#a0aEC0",
                      textAlign: "left",
                      fontFamily: "monospace",
                      direction: "ltr",
                      background: "rgba(0,0,0,0.4)",
                      padding: "0.75rem",
                      borderRadius: "6px",
                    }}
                  >
                    {generatedResults.imagePrompt}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
