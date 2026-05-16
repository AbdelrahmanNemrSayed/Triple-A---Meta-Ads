import React from "react";

export default function LogsTab({
  logFilter,
  setLogFilter,
  fetchData,
  handleClearLogs,
  filteredLogs,
  consoleEndRef,
}) {
  return (
    <section className="glass-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ fontSize: "1.15rem" }}>
          💻 وحدة المراقبة وسجل التنفيذ المباشر
        </h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-glass)",
              borderRadius: "8px",
              color: "#fff",
              padding: "0.4rem 0.8rem",
              fontSize: "0.8rem",
              outline: "none",
            }}
          >
            <option value="all">الكل</option>
            <option value="system">النظام</option>
            <option value="success">إجراءات ناجحة (زيادة/تشغيل)</option>
            <option value="warning">تنبيهات</option>
            <option value="danger">إجراءات إيقاف (هدر ميزانية)</option>
            <option value="info">استعلامات</option>
          </select>
          <button
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => fetchData()}
          >
            🔄 تحديث
          </button>
          <button
            className="btn btn-secondary"
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.8rem",
              color: "var(--danger)",
            }}
            onClick={handleClearLogs}
          >
            🗑️ تفريغ السجل
          </button>
        </div>
      </div>

      <div className="console-container">
        <div className="console-header">
          <div className="console-title">
            <span className="console-dot"></span>
            METAFLOW AUTOMATION TERMINAL v1.0.0
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                background: "#ff5f56",
                borderRadius: "50%",
              }}
            ></span>
            <span
              style={{
                width: "12px",
                height: "12px",
                background: "#ffbd2e",
                borderRadius: "50%",
              }}
            ></span>
            <span
              style={{
                width: "12px",
                height: "12px",
                background: "#27c93f",
                borderRadius: "50%",
              }}
            ></span>
          </div>
        </div>

        <div className="console-body">
          {filteredLogs.length === 0 ? (
            <div className="log-line system">
              [SYSTEM] لا توجد سجلات مطابقة للفلتر المختار.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className={`log-line ${log.type}`}>
                <span
                  className="system"
                  style={{
                    fontFamily: "var(--font-english)",
                    marginRight: "0.5rem",
                  }}
                >
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                {log.message}
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </section>
  );
}
