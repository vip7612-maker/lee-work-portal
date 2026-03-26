"use client";
import { useEffect, useState } from "react";
import { CheckSquare, Link2, MessageSquare, FolderOpen, Star, Clock, TrendingUp } from "lucide-react";

interface ProjectStat {
  id: string; label: string; url: string; color: string; pinned: number;
  checks_total: number; checks_done: number; links_count: number; memos_count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<ProjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totalProjects = stats.length;
  const totalChecks = stats.reduce((a, p) => a + (p.checks_total || 0), 0);
  const doneChecks = stats.reduce((a, p) => a + (p.checks_done || 0), 0);
  const totalLinks = stats.reduce((a, p) => a + (p.links_count || 0), 0);
  const totalMemos = stats.reduce((a, p) => a + (p.memos_count || 0), 0);
  const completionRate = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;

  return (
    <div style={{
      minHeight: "100%", padding: "32px 28px",
      background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflow: "auto",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.02em", marginBottom: 4 }}>
          📊 대시보드
        </h1>
        <p style={{ fontSize: ".82rem", color: "#94a3b8" }}>프로젝트 현황 한눈에 보기</p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12, marginBottom: 28,
      }}>
        {[
          { icon: <FolderOpen size={18}/>, label: "프로젝트", value: totalProjects, color: "#3B82F6", bg: "#EFF6FF" },
          { icon: <CheckSquare size={18}/>, label: "체크리스트", value: `${doneChecks}/${totalChecks}`, color: "#10B981", bg: "#ECFDF5" },
          { icon: <TrendingUp size={18}/>, label: "완료율", value: `${completionRate}%`, color: "#8B5CF6", bg: "#F5F3FF" },
          { icon: <Link2 size={18}/>, label: "링크", value: totalLinks, color: "#F59E0B", bg: "#FFFBEB" },
          { icon: <MessageSquare size={18}/>, label: "메모", value: totalMemos, color: "#EF4444", bg: "#FEF2F2" },
        ].map((c, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 12, padding: "16px 14px",
            boxShadow: "0 1px 4px rgba(0,0,0,.04)", display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: c.bg, color: c.color, borderRadius: 8, padding: 6, display: "flex" }}>{c.icon}</div>
              <span style={{ fontSize: ".72rem", color: "#94a3b8", fontWeight: 500 }}>{c.label}</span>
            </div>
            <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1e293b" }}>{c.value}</span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        background: "white", borderRadius: 12, padding: "16px 18px", marginBottom: 28,
        boxShadow: "0 1px 4px rgba(0,0,0,.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: ".82rem", fontWeight: 600, color: "#1e293b" }}>전체 진행률</span>
          <span style={{ fontSize: ".82rem", fontWeight: 600, color: "#8B5CF6" }}>{completionRate}%</span>
        </div>
        <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "linear-gradient(90deg, #8B5CF6, #3B82F6)",
            width: `${completionRate}%`, transition: "width .6s ease",
          }} />
        </div>
      </div>

      {/* Project List */}
      <h2 style={{ fontSize: ".9rem", fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>
        프로젝트별 현황
      </h2>
      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: ".82rem" }}>로딩 중...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.map(p => {
            const pct = p.checks_total > 0 ? Math.round((p.checks_done / p.checks_total) * 100) : 0;
            return (
              <div key={p.id} style={{
                background: "white", borderRadius: 10, padding: "14px 16px",
                boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 8, height: 36, borderRadius: 4,
                  background: p.color || "#94a3b8", flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {p.pinned ? <Star size={12} fill="#F59E0B" color="#F59E0B"/> : null}
                    <span style={{
                      fontSize: ".82rem", fontWeight: 600, color: "#1e293b",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{p.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: ".72rem", color: "#94a3b8" }}>
                    <span>✅ {p.checks_done}/{p.checks_total}</span>
                    <span>🔗 {p.links_count}</span>
                    <span>💬 {p.memos_count}</span>
                  </div>
                </div>
                {p.checks_total > 0 && (
                  <div style={{ width: 60, textAlign: "right" }}>
                    <div style={{ fontSize: ".78rem", fontWeight: 600, color: pct === 100 ? "#10B981" : "#64748b" }}>
                      {pct}%
                    </div>
                    <div style={{ height: 4, background: "#F1F5F9", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        background: pct === 100 ? "#10B981" : "#3B82F6",
                        width: `${pct}%`,
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
