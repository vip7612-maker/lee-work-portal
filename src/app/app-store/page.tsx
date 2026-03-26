"use client";
import { ExternalLink } from "lucide-react";

const apps = [
  {
    name: "이경진 업무포털",
    repo: "lee-work-portal",
    url: "https://lee-work-portal.vercel.app",
    desc: "Dia 브라우저 스타일의 업무 관리 포털. 프로젝트 관리, 체크리스트, 메모, 링크 관리 기능 제공.",
    tech: "Next.js · Turso · NextAuth",
    color: "#3B82F6",
    emoji: "🖥️",
  },
  {
    name: "The Next Fellowship",
    repo: "the-next-fellowship",
    url: "https://the-next-fellowship.vercel.app",
    desc: "차세대 펠로우십 신청·관리 플랫폼. AI 기반 지원자 평가 및 프로그램 운영.",
    tech: "Next.js · Turso · AI",
    color: "#8B5CF6",
    emoji: "🎓",
  },
  {
    name: "차량운행일지",
    repo: "vehicle-log",
    url: "https://vehicle-log-eta.vercel.app",
    desc: "차량 운행 및 정비 기록을 관리하는 웹 앱. 일일 운행 기록, 정비 이력 추적.",
    tech: "Next.js · Turso",
    color: "#10B981",
    emoji: "🚗",
  },
  {
    name: "사랑 부동산",
    repo: "sarang-realestate",
    url: "https://sarang-realestate.vercel.app",
    desc: "부동산 매물 관리 및 공유 플랫폼. 매물 등록, 검색, 상세 정보 제공.",
    tech: "Next.js · Vercel",
    color: "#F59E0B",
    emoji: "🏠",
  },
  {
    name: "몽글몽글",
    repo: "monglemongle",
    url: "https://mongle-mongle-project.vercel.app",
    desc: "몽글몽글 프로젝트. 교육 콘텐츠 및 커뮤니티 기반 학습 플랫폼.",
    tech: "Next.js · TypeScript",
    color: "#EC4899",
    emoji: "☁️",
  },
  {
    name: "CW 대회 플랫폼",
    repo: "cw-contest-platform",
    url: "https://cw-contest-platform.vercel.app",
    desc: "대회 개최·참가·심사를 위한 통합 플랫폼. 실시간 점수 및 순위 관리.",
    tech: "Next.js · TypeScript",
    color: "#EF4444",
    emoji: "🏆",
  },
  {
    name: "제곡교회 건축 캠페인",
    repo: "jegok-church-campaign",
    url: "https://vip7612-maker.github.io/jegok-church-campaign/",
    desc: "제곡교회 새 성전 건축 모금 캠페인. '새로운 40년의 벽돌을 쌓다' 홍보 사이트.",
    tech: "HTML · CSS · GitHub Pages",
    color: "#6366F1",
    emoji: "⛪",
  },
  {
    name: "빛과소금",
    repo: "light-and-salt",
    url: "https://github.com/vip7612-maker/light-and-salt",
    desc: "기독교 세계관 유튜브 토론 플랫폼. 영상 기반 신앙 토론 및 나눔.",
    tech: "JavaScript",
    color: "#F97316",
    emoji: "✨",
  },
];

export default function AppStore() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f3e8ff 100%)",
      padding: "40px 32px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h1 style={{
            fontSize:"2rem", fontWeight:700, color:"#1e293b",
            letterSpacing:"-0.02em", marginBottom:8,
          }}>
            🚀 Web App Store
          </h1>
          <p style={{ color:"#64748b", fontSize:".95rem" }}>
            vip7612-maker 의 배포된 프로젝트 모음
          </p>
        </div>

        {/* App Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {apps.map(app => (
            <div key={app.repo} style={{
              background: "white",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              transition: "transform .2s, box-shadow .2s",
              cursor: "default",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(0,0,0,.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; }}
            >
              {/* Color banner + emoji */}
              <div style={{
                height: 100,
                background: `linear-gradient(135deg, ${app.color}, ${app.color}88)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2.5rem",
              }}>
                {app.emoji}
              </div>
              {/* Content */}
              <div style={{ padding: "16px 20px 20px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                  {app.name}
                </h3>
                <p style={{ fontSize: ".8rem", color: "#64748b", lineHeight: 1.5, marginBottom: 12, minHeight:48 }}>
                  {app.desc}
                </p>
                <p style={{ fontSize: ".72rem", color: "#94a3b8", marginBottom: 14 }}>
                  {app.tech}
                </p>
                <a href={app.url} target="_blank" rel="noreferrer" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "8px 0", borderRadius: 8,
                    background: app.color, color: "white",
                    fontSize: ".8rem", fontWeight: 500, textDecoration: "none",
                    transition: "opacity .15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = ".85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    <ExternalLink size={13}/> 열기
                  </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 40, color: "#94a3b8", fontSize: ".78rem" }}>
          총 {apps.length}개 앱 · vip7612-maker GitHub
        </p>
      </div>
    </div>
  );
}
