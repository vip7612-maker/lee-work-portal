"use client";
import React, { useState } from "react";
import { Bot, FileText, Calendar, Mail, Search, MessageSquare, Zap, Target, BarChart2, CheckCircle, Database, X, Smartphone } from "lucide-react";

type AgentFeature = {
  id: string;
  title: string;
  icon: React.ReactNode;
  bgGrad: string;
  desc: string;
  setupGuide: React.ReactNode;
};

const features: AgentFeature[] = [
  {
    id: "iphone-voice-memo",
    title: "아이폰 음성 메모 전송 (Action Button)",
    icon: <Smartphone size={32} color="white" />,
    bgGrad: "linear-gradient(135deg, #0284c7, #0369a1)",
    desc: "아이폰 16의 동작 버튼을 활용해 언제 어디서나 내 AI 에이전트에게 텍스트/음성 메모를 실시간 전송합니다.",
    setupGuide: (
      <div style={{ lineHeight: 1.6, color: "#475569", fontSize: "0.95rem" }}>
        <p style={{ marginBottom: 16 }}>아이폰 16의 <strong>'동작 버튼(Action Button)'</strong>을 길게 누르고 말하는 것만으로, 맥(Mac)에서 구동 중인 AI 에이전트(안티그래비티)에게 실시간 데이터를 전송하는 파이프라인 구축 방법입니다.</p>
        <p style={{ marginBottom: 16 }}>단축어 앱의 기본 텔레그램 연동 기능에서 발생하는 주소록 버그를 완벽하게 우회하고, <strong>텔레그램 API를 활용해 백그라운드에서 조용하고 신속하게 메시지를 전달</strong>하는 것이 이 가이드의 핵심입니다.</p>

        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 24 }}>🛠️ 사전 준비물</h4>
        <ul style={{ paddingLeft: 20, marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>아이폰 (동작 버튼이 있는 모델 권장)</li>
          <li>텔레그램(Telegram) 앱</li>
          <li>텔레그램 봇 토큰 (BotFather를 통해 발급받은 <code>12345:ABCDE...</code> 형태의 키)</li>
          <li>맥(Mac) 등에서 구동되며 텔레그램 메시지를 수신할 수 있는 안티그래비티 에이전트 환경</li>
        </ul>

        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 32 }}>1단계: 텔레그램 수신방(단톡방) 세팅</h4>
        <p style={{ marginBottom: 8 }}>아이폰에서 보낸 메시지를 AI 에이전트가 엿들을 수 있는 '중간 기착지'를 만듭니다.</p>
        <ol style={{ paddingLeft: 20, marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>텔레그램 앱에서 <strong>새로운 그룹(단톡방)</strong>을 생성합니다. (예: '에이전트 메모장')</li>
          <li>해당 단톡방에 내가 발급받은 <strong>텔레그램 봇(예: 아론봇)</strong>을 멤버로 초대합니다.</li>
          <li><strong>[핵심]</strong> 봇이 일반 대화를 모두 수집할 수 있도록, 단톡방 설정에서 해당 봇의 권한을 <strong>'관리자(Admin)'</strong>로 승급시킵니다.</li>
          <li>단톡방에 "테스트"라고 아무 메시지나 하나 전송해 둡니다.</li>
        </ol>

        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 32 }}>2단계: 단톡방 고유 주소(chat_id) 추출하기</h4>
        <p style={{ marginBottom: 8 }}>단축어에서 API를 쏘기 위해서는 이 단톡방의 고유 시스템 번호를 알아야 합니다.</p>
        <ol style={{ paddingLeft: 20, marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>PC나 스마트폰의 인터넷 브라우저 주소창에 아래 URL을 입력합니다. (대괄호를 제외하고 본인의 봇 토큰을 넣으세요)<br/>
              <code style={{ background:"#f1f5f9", padding:"3px 8px", borderRadius:6, fontSize:"0.85em", wordBreak:"break-all", display:"inline-block", marginTop:4 }}>https://api.telegram.org/bot[본인의봇토큰]/getUpdates</code>
          </li>
          <li>화면에 복잡한 코드가 나타나면, 1단계에서 보낸 "테스트" 메시지 주변을 찾아봅니다.</li>
          <li><code>"chat": {"{"}"id": -100...{"}"}</code> 형태로 적힌 부분을 찾습니다.</li>
          <li><strong>마이너스(-) 기호로 시작하는 13~14자리 숫자</strong>(예: <code>-1001234567890</code>)를 기호까지 모두 포함하여 복사해 둡니다. 이것이 그룹방의 고유 chat_id 입니다.</li>
        </ol>

        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 32 }}>3단계: 아이폰 단축어(Shortcuts) API 구축</h4>
        <p style={{ marginBottom: 8 }}>애플 기본 연동의 오류를 피하기 위해, 직접 HTTP 요청(POST)을 보내는 단축어를 만듭니다.</p>
        <ol style={{ paddingLeft: 20, marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <li>아이폰에서 '단축어' 앱을 열고 우측 상단 <strong>+</strong> 버튼을 눌러 새 단축어를 생성합니다.</li>
          <li><strong>첫 번째 동작:</strong> 하단 검색창에 <strong>텍스트 받아쓰기</strong>를 검색하여 추가합니다. (음성을 텍스트로 변환)</li>
          <li><strong>두 번째 동작:</strong> 검색창에 <strong>URL</strong>을 검색하여 추가하고, 빈칸에 아래 주소를 입력합니다.<br/>
              <code style={{ background:"#f1f5f9", padding:"3px 8px", borderRadius:6, fontSize:"0.85em", wordBreak:"break-all", display:"inline-block", marginTop:4 }}>https://api.telegram.org/bot[본인의봇토큰]/sendMessage</code>
          </li>
          <li><strong>세 번째 동작:</strong> 검색창에 <strong>URL 콘텐츠 가져오기</strong>를 검색하여 추가합니다. 이때 반드시 이전 동작인 <code>[URL]</code> 변수가 연결되어 있어야 합니다.</li>
          <li>세 번째 동작의 <code>&gt; (더 보기)</code> 화살표를 눌러 아래와 같이 세부 세팅을 진행합니다.
            <ul style={{ paddingLeft: 24, marginTop: 8, display: "flex", flexDirection: "column", gap: 6, listStyleType: "circle", background:"#f8fafc", padding:"12px 12px 12px 32px", borderRadius:8 }}>
              <li>메서드: <strong>POST</strong> 로 변경</li>
              <li>본문 요청: <strong>양식(Form)</strong> 으로 설정</li>
              <li>새로운 필드 추가 (텍스트) 첫 번째:<br/><span style={{ color:"#64748b" }}>키(Key)</span>: <code>chat_id</code> <br/><span style={{ color:"#64748b" }}>텍스트(Value)</span>: 2단계에서 찾은 마이너스(-) 포함 고유 숫자</li>
              <li>새로운 필드 추가 (텍스트) 두 번째:<br/><span style={{ color:"#64748b" }}>키(Key)</span>: <code>text</code> <br/><span style={{ color:"#64748b" }}>텍스트(Value)</span>: 키보드 상단 변수에서 <strong>[받아쓰기한 텍스트]</strong> 선택</li>
            </ul>
          </li>
          <li>단축어 이름을 '에이전트 전송' 등으로 알아보기 쉽게 변경 후 저장합니다.</li>
        </ol>

        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 32 }}>4단계: 동작 버튼 매핑 및 테스트</h4>
        <ol style={{ paddingLeft: 20, marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>아이폰 홈 <strong>설정 &gt; 동작 버튼</strong> 메뉴로 진입합니다.</li>
          <li>기능을 <strong>단축어</strong>로 스와이프한 뒤, 방금 만든 단축어를 지정합니다.</li>
          <li>이제 아이폰의 동작 버튼을 길게 누르고 음성으로 메모를 남겨보세요. <strong>화면 전환 없이 백그라운드에서 텔레그램 단톡방으로 메시지가 즉시 전송되며, 안티그래비티 에이전트가 이를 성공적으로 수집합니다. 🎉</strong></li>
        </ol>
      </div>
    )
  },
  {
    id: "doc-summary",
    title: "자동 문서 요약",
    icon: <FileText size={32} color="white" />,
    bgGrad: "linear-gradient(135deg, #3b82f6, #1e40af)",
    desc: "길고 복잡한 회의록, 기획서, 보고서를 업로드하면 핵심 3줄로 즉시 요약해줍니다.",
    setupGuide: (
      <div style={{ lineHeight: 1.6, color: "#475569", fontSize: "0.95rem" }}>
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>이 기능은 무엇인가요?</h4>
        <p style={{ marginBottom: 12 }}>업무 포고나 회의록의 방대한 분량을 AI가 분석해 핵심 액션 아이템과 요약본을 자동으로 생성합니다.</p>
        
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>설정 방법</h4>
        <ol style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li>우측 상단 <strong>[API 연동]</strong> 탭에서 구글 드라이브(혹은 노션) 접근 권한을 허용합니다.</li>
          <li>요약 스타일을 <strong>[글머리 기호]</strong> 또는 <strong>[서술형]</strong> 중에서 선택합니다.</li>
          <li>특정 키워드(예: '결정사항', '다음 일정')를 집중적으로 추출할지 키워드 사전을 등록합니다.</li>
        </ol>
      </div>
    )
  },
  {
    id: "calendar-sync",
    title: "일정 및 태스크 캘린더 연동",
    icon: <Calendar size={32} color="white" />,
    bgGrad: "linear-gradient(135deg, #10b981, #047857)",
    desc: "대화형으로 일정을 등록하고, Google 캘린더와 실시간으로 동기화합니다.",
    setupGuide: (
      <div style={{ lineHeight: 1.6, color: "#475569", fontSize: "0.95rem" }}>
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>이 기능은 무엇인가요?</h4>
        <p style={{ marginBottom: 12 }}>자연어로 된 대화 내용("다음 주 수요일 2시에 디자인팀 회의 잡아줘")을 인식해 자동으로 구글 캘린더 일정을 생성 및 체크리스트를 등록합니다.</p>
        
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>설정 방법</h4>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li>아론 AI 프로필에서 <strong>[Calendar API 활성화]</strong>를 누릅니다.</li>
          <li>주로 사용하는 회의 템플릿(장소 화상회의 여부 등)을 기본값으로 지정합니다.</li>
        </ul>
      </div>
    )
  },
  {
    id: "email-draft",
    title: "비즈니스 이메일 초안 작성",
    icon: <Mail size={32} color="white" />,
    bgGrad: "linear-gradient(135deg, #f59e0b, #b45309)",
    desc: "송신 목적만 간략히 입력하면, 수신자에 맞는 톤앤매너로 이메일 초안을 작성합니다.",
    setupGuide: (
      <div style={{ lineHeight: 1.6, color: "#475569", fontSize: "0.95rem" }}>
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>이 기능은 무엇인가요?</h4>
        <p style={{ marginBottom: 12 }}>상대방의 직급이나 업무 파트너 관계를 고려하여 상황에 맞는 전문적인 비즈니스 이메일 초안을 생성해 줍니다.</p>
        
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>설정 방법</h4>
        <ol style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li>이메일 하단에 들어갈 본인의 <strong>이메일 서명(Signature)</strong>을 미리 등록해 둡니다.</li>
          <li>톤앤매너 설정에서 평소 사용하는 문맥(<strong>[격식있게]</strong> / <strong>[친근하게]</strong> / <strong>[간결하게]</strong>)을 세팅합니다.</li>
          <li>상용구(인사말 등)를 미리 프리셋에 추가하면 더 자연스러운 문장이 출력됩니다.</li>
        </ol>
      </div>
    )
  },
  {
    id: "web-research",
    title: "스마트 웹 리서치",
    icon: <Search size={32} color="white" />,
    bgGrad: "linear-gradient(135deg, #8b5cf6, #5b21b6)",
    desc: "특정 키워드나 제품명에 대한 최신 뉴스, 리뷰를 스크랩하고 정리하여 보고합니다.",
    setupGuide: (
      <div style={{ lineHeight: 1.6, color: "#475569", fontSize: "0.95rem" }}>
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>이 기능은 무엇인가요?</h4>
        <p style={{ marginBottom: 12 }}>주제를 입력하면 여러 웹사이트를 스크랩한 뒤 교차 검증을 거쳐, 신뢰도 높은 최신 정보와 출처 링크를 하나의 정리된 보고서 형태로 제공합니다.</p>
        
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>설정 방법</h4>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li>정보 검색 시 우선적으로 확인할 <strong>신뢰할 수 있는 도메인 리스트</strong>를 등록합니다.</li>
          <li>주기능(매일/매주/특정 시간)을 켜면 리서치 스케줄링이 활성화됩니다.</li>
        </ul>
      </div>
    )
  },
  {
    id: "auto-response",
    title: "CS / 슬랙 자동 응답",
    icon: <MessageSquare size={32} color="white" />,
    bgGrad: "linear-gradient(135deg, #ec4899, #be185d)",
    desc: "자주 묻는 질문(FAQ) 및 업무 규칙을 기반으로 Slack이나 메신저에 자동 답글을 남깁니다.",
    setupGuide: (
      <div style={{ lineHeight: 1.6, color: "#475569", fontSize: "0.95rem" }}>
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>이 기능은 무엇인가요?</h4>
        <p style={{ marginBottom: 12 }}>사내 업무 매뉴얼이나 슬랙 컨텍스트를 학습해, 특정 채널에 질문이 올라오면 아론 AI가 1차적으로 알맞은 답변을 제시합니다.</p>
        
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>설정 방법</h4>
        <ol style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li>회사의 기본 FAQ 문서 또는 사내 위키(Notion 등) 주소를 연결하여 아론에게 권한을 줍니다.</li>
          <li>Slack 앱 설정에서 아론 AI 봇을 채널에 초대합니다.</li>
          <li>아론이 답변할 때 붙일 <strong>AI 답변 안내 문구</strong>를 세팅합니다.</li>
        </ol>
      </div>
    )
  },
  {
    id: "data-analysis",
    title: "업무 생산성 분석",
    icon: <BarChart2 size={32} color="white" />,
    bgGrad: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    desc: "주간 업무 완료율, 작업 집중 시간 등을 시각화하여 개인 및 팀 생산성 리포트를 제공합니다.",
    setupGuide: (
      <div style={{ lineHeight: 1.6, color: "#475569", fontSize: "0.95rem" }}>
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>이 기능은 무엇인가요?</h4>
        <p style={{ marginBottom: 12 }}>메모와 체크리스트 사용 로그를 분석하여, 업무 패턴과 남은 일정을 효율적으로 관리할 수 있도록 인사이트를 제공합니다.</p>
        
        <h4 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, marginTop: 16 }}>설정 방법</h4>
        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
          <li>데이터 제공에 동의하고 <strong>대시보드 보기 권한</strong>을 승인합니다.</li>
          <li>월요일 아침마다 주간 리포트를 받을지 주기에 대한 알림을 설정합니다.</li>
        </ul>
      </div>
    )
  }
];

export default function AaronAIGallery() {
  const [selectedFeature, setSelectedFeature] = useState<AgentFeature | null>(null);

  // Close modal when clicking escape
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFeature(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      padding: "40px 32px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative"
    }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ 
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: 20, 
            background: "linear-gradient(135deg, #0f172a, #334155)",
            color: "white", marginBottom: 20,
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.2)"
          }}>
            <Bot size={36}/>
          </div>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 12 }}>
            Aaron Agent <span style={{ color: "#0ea5e9" }}>Gallery</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.05rem", fontWeight: 500, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            아론(Aaron) AI 비서의 다양한 에이전트 기능을 갤러리 형태로 확인하고, 각 기능을 클릭해 설정 방법과 활용 가이드를 알아보세요.
          </p>
        </div>

        {/* Gallery Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24,
        }}>
          {features.map((feat) => (
            <div 
              key={feat.id} 
              onClick={() => setSelectedFeature(feat)}
              style={{
                background: "white", border: "1px solid rgba(0,0,0,0.04)", borderRadius: 20,
                overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 32px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
              }}
            >
              <div style={{ height: 120, background: feat.bgGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ transform: "scale(1.2)", opacity: 0.9 }}>
                  {feat.icon}
                </div>
              </div>
              <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{feat.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, flex: 1 }}>{feat.desc}</p>
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", color: "#0ea5e9", fontSize: "0.82rem", fontWeight: 600, gap: 4 }}>
                  상세 가이드 보기 &rarr;
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Modal */}
        {selectedFeature && (
          <div 
            onClick={() => setSelectedFeature(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)", zIndex: 9999,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
              animation: "fadeIn 0.2s ease-out"
            }}
          >
            <div 
              onClick={e => e.stopPropagation()}
              style={{
                background: "white", borderRadius: 24, width: "100%", maxWidth: 640,
                overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
                display: "flex", flexDirection: "column", maxHeight: "90vh"
              }}
            >
              {/* Modal Header */}
              <div style={{ 
                height: 140, background: selectedFeature.bgGrad, padding: "32px 32px 0",
                display: "flex", alignItems: "flex-end", position: "relative" 
              }}>
                <button 
                  onClick={() => setSelectedFeature(null)}
                  style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", color: "white", border: "none", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                >
                  <X size={18}/>
                </button>
                <div style={{ 
                  background: "white", width: 72, height: 72, borderRadius: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "translateY(24px)", boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ transform: "scale(1.2)" }}>
                    {React.cloneElement(selectedFeature.icon as any, { color: selectedFeature.bgGrad.split(',')[1].trim() })}
                  </div>
                </div>
              </div>
              
              {/* Modal Body */}
              <div style={{ padding: "48px 32px 32px", overflowY: "auto", flex: 1 }}>
                <div style={{ display: "inline-block", background: "#f1f5f9", padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: 12 }}>
                  에이전트 기능 가이드
                </div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0f172a", marginBottom: 12, letterSpacing: "-0.02em" }}>
                  {selectedFeature.title}
                </h2>
                <div style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
                  {selectedFeature.desc}
                </div>
                
                <div style={{ width: "100%", height: 1, background: "#e2e8f0", marginBottom: 24 }} />
                
                {/* Guide content */}
                <div className="setup-guide">
                  {selectedFeature.setupGuide}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div style={{ padding: "20px 32px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => setSelectedFeature(null)}
                  style={{ background: "#0f172a", color: "white", border: "none", padding: "10px 24px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                  onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}
                >
                  확인 완료
                </button>
              </div>
            </div>
          </div>
        )}
        
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}} />
      </div>
    </div>
  );
}
