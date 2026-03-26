"use client";
import { Send, Bot, Sparkles, Zap, ShieldCheck } from "lucide-react";

export default function AaronAI() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #eff6ff 100%)",
      padding: "32px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <div style={{ maxWidth: 840, width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ 
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 16, 
            background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
            color: "white", marginBottom: 16,
            boxShadow: "0 8px 24px rgba(14, 165, 233, 0.25)"
          }}>
            <Bot size={32}/>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 8 }}>
            Aaron AI 비서 <span style={{ fontSize: "1rem", fontWeight: 500, color: "#0ea5e9", background: "#e0f2fe", padding: "4px 10px", borderRadius: 20, verticalAlign: "middle", marginLeft: 8 }}>Beta</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.05rem", fontWeight: 500 }}>
            업무 효율을 극대화하는 나만의 지능형 워크스페이스 파트너
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          {[
            { icon: <Sparkles size={18} color="#8b5cf6"/>, title: "자동 문서 요약", desc: "긴 회의록과 문서를 핵심만 3줄로 요약해 드립니다." },
            { icon: <Zap size={18} color="#f59e0b"/>, title: "일정 및 태스크 관리", desc: "대화형으로 일정을 등록하고 체크리스트를 자동 생성합니다." },
            { icon: <ShieldCheck size={18} color="#10b981"/>, title: "업무 메일 초안", desc: "목적만 입력하면 예의 바르고 명확한 비즈니스 메일을 작성합니다." }
          ].map((feat, i) => (
            <div key={i} style={{
              flex: 1, background: "white", padding: 20, borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.02)"
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>{feat.title}</h3>
              <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Chat Interface Mockup */}
        <div style={{
          flex: 1, background: "white", borderRadius: 20,
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.04)"
        }}>
          {/* Chat header */}
          <div style={{
            padding: "16px 24px", borderBottom: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px #d1fae5" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>아론이 언제든 대기 중입니다</span>
          </div>
          
          {/* Chat Body */}
          <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 20, background: "#f8fafc" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9, #3b82f6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={18} color="white"/>
              </div>
              <div style={{ background: "white", padding: "14px 18px", borderRadius: "4px 16px 16px 16px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)", fontSize: "0.92rem", color: "#334155", lineHeight: 1.5, maxWidth: "80%" }}>
                안녕하세요! 이경진 님의 업무 비서 <b>아론(Aaron)</b>입니다. <br/>
                오늘 어떤 업무를 도와드릴까요?
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12, alignSelf: "flex-end" }}>
              <div style={{ background: "#0ea5e9", padding: "14px 18px", borderRadius: "16px 4px 16px 16px", boxShadow: "0 2px 6px rgba(14,165,233,0.15)", fontSize: "0.92rem", color: "white", lineHeight: 1.5, maxWidth: "80%" }}>
                다음 주 전체 회의 안건 좀 정리해 줄래?
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9, #3b82f6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }}>
                <Bot size={18} color="white"/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, background: "white", padding: "14px 18px", borderRadius: "4px 16px 16px 16px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)", fontSize: "0.92rem", color: "#64748b" }}>
                <div style={{ display:"flex", gap:4 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#cbd5e1" }}></span>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#cbd5e1" }}></span>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#cbd5e1" }}></span>
                </div>
                분석 중...
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div style={{ padding: 20, background: "white", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", gap: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 12px", alignItems: "center" }}>
              <input 
                disabled
                placeholder="현재 이 데모 화면은 가상 목업(Mockup) UI입니다..." 
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "0.9rem", color: "#64748b" }}
              />
              <button disabled style={{ background: "#0ea5e9", color: "white", border: "none", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
