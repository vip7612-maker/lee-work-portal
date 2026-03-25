"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Plus, MoreHorizontal, FileText, ChevronLeft, ChevronRight, RotateCw, 
  Lock, ArrowUp, X, Sparkles, Pin, LayoutList, Search, MessageSquare, Zap
} from "lucide-react";

type Tab = {
  id: string;
  title: string;
  url: string;
  isFavorite: boolean;
  memo: string;
  iconType: string;
};

const initialTabs: Tab[] = [
  { id: "fav1", title: "Gmail", url: "mail.google.com", isFavorite: true, memo: "", iconType: "mail" },
  { id: "fav2", title: "Drive", url: "drive.google.com", isFavorite: true, memo: "", iconType: "drive" },
  { id: "fav3", title: "Calendar", url: "calendar.google.com", isFavorite: true, memo: "", iconType: "calendar" },
  { id: "fav4", title: "Portal", url: "portal.local", isFavorite: true, memo: "", iconType: "portal" },
  { id: "fav5", title: "Tools", url: "tools.local", isFavorite: true, memo: "", iconType: "tools" },
  
  { id: "1", title: "해밀학교 대상 연구 참여자 정보 (2026", url: "docs.google.com", isFavorite: false, memo: "해밀학교 연구 대상자 스프레드시트", iconType: "file" },
  { id: "2", title: "vip7612-maker/lee-work-portal", url: "github.com/vip7612-maker/lee-work-portal", isFavorite: false, memo: "업무포털 리포지토리", iconType: "github" },
  { id: "3", title: "Create Next App", url: "localhost:3000", isFavorite: false, memo: "로컬 개발 환경", iconType: "next" },
  { id: "4", title: "lee-work-portal.vercel.app", url: "lee-work-portal.vercel.app", isFavorite: false, memo: "프로덕션 배포 사이트", iconType: "vercel" },
  { id: "5", title: "사학연금공단 대문페이지", url: "tp.or.kr", isFavorite: false, memo: "사학연금공단 벤치마킹", iconType: "globe" },
];

export default function WorkPortal() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>("5");
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 400) newWidth = 400;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const favorites = tabs.filter((t) => t.isFavorite);
  const regularTabs = tabs.filter((t) => !t.isFavorite);

  const handleAddTab = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, title: "New Tab", url: "", isFavorite: false, memo: "", iconType: "file" }]);
    setActiveTabId(newId);
  };

  const handleMoveToFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(tabs.map(t => t.id === id ? { ...t, isFavorite: true } : t));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(tabs.filter(t => t.id !== id));
  };

  const getSidebarIcon = (type: string) => {
    // Return simple colors or generic shapes representing icons
    const colorMap: Record<string, string> = {
      mail: "#ea4335", drive: "#34a853", calendar: "#fbbc04", portal: "#4285f4", tools: "#8ab4f8",
      file: "#4285f4", github: "#24292e", next: "#000000", vercel: "#000000", globe: "#9aa0a6"
    };
    return (
      <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: colorMap[type] || "#cccccc" }} />
    );
  };

  const getFavIcon = (type: string) => {
    const colorMap: Record<string, string> = {
      mail: "#ea4335", drive: "#34a853", calendar: "#fbbc04", portal: "#4285f4", tools: "#8ab4f8"
    };
    return (
      <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: colorMap[type] || "#cccccc" }} />
    );
  };

  return (
    <div className="layout-container">
      {/* 1. Left Sidebar (Dia Style) */}
      <aside className="sidebar" style={{ width: sidebarWidth }}>
        <div 
          className="resizer"
          onMouseDown={() => {
            isResizing.current = true;
            document.body.style.cursor = "col-resize";
          }}
        />
        
        {/* Mac Controls and Profile */}
        <div className="mac-controls">
          <div className="mac-btn mac-close"></div>
          <div className="mac-btn mac-min"></div>
          <div className="mac-btn mac-max"></div>
          <div className="profile-area">
             <div style={{width: 20, height: 20, borderRadius: '50%', background: '#ccc', display: 'flex', alignItems:'center', justifyContent:'center'}}>
                <span style={{fontSize: '10px', color: '#333'}}>DL</span>
             </div>
             David_Lee
          </div>
        </div>

        {/* Favorites Grid (4x2 style) */}
        <div className="favorites-grid">
          {favorites.map(tab => (
            <div 
              key={tab.id} 
              className={`fav-icon ${activeTabId === tab.id ? "active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
              title={tab.title}
            >
              {getFavIcon(tab.iconType)}
            </div>
          ))}
          {/* Empty slots to match screenshot grid feel */}
          <div className="fav-icon" style={{opacity: 0.5}}>+</div>
        </div>

        {/* Regular Tabs List */}
        <div className="tabs-container">
          {regularTabs.map((tab, i) => (
            <div 
              key={tab.id} 
              className={`tab-item ${activeTabId === tab.id ? "active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {getSidebarIcon(tab.iconType)}
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tab.title}
                </span>
              </div>
              <div className="tab-actions">
                <button className="action-btn" title="Add to Favorites" onClick={(e) => handleMoveToFavorite(tab.id, e)}>
                  <ArrowUp size={12} />
                </button>
                <button className="action-btn" title="Close Tab" onClick={(e) => handleDelete(tab.id, e)}>
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
          <button className="add-tab-btn" onClick={handleAddTab}>
             <Plus size={14} /> New Tab
          </button>
        </div>
      </aside>

      {/* 2. Main Center View */}
      <main className="main-view">
        <header className="browser-top-bar">
          <div className="nav-buttons">
            <ChevronLeft size={18} />
            <ChevronRight size={18} color="#cccccc" />
            <RotateCw size={16} />
          </div>
          <div className="url-bar">
            <Lock size={12} />
            {activeTab?.url.split('/')[0]} <span>/ {activeTab?.url.split('/').slice(1).join('/') || activeTab?.title}</span>
          </div>
          <div className="ext-buttons">
            <div style={{width:16,height:16,borderRadius:'50%',background:'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)'}}></div>
            <div style={{width:16,height:16,borderRadius:'50%',background:'linear-gradient(45deg, #84fab0 0%, #8fd3f4 100%)'}}></div>
            <LayoutList size={18} color={isRightPanelOpen ? "var(--accent)" : "#86868b"} style={{cursor:'pointer'}} onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} />
          </div>
        </header>

        <div className="content-area">
          {/* MOCKUP CONTENT OF TP.OR.KR IF TAB IS 5 */}
          {activeTab?.id === "5" ? (
             <div style={{padding: '40px', fontFamily: 'sans-serif'}}>
                <div style={{textAlign: 'center', marginBottom: '40px'}}>
                   <span style={{background: '#2b2a65', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem'}}>대문페이지</span>
                   <h1 style={{color: '#2b2a65', fontSize: '2rem', marginTop: '20px'}}>교직원과 함께하는 연금·복지 전문기관</h1>
                   <p style={{color: '#666'}}>안녕하세요, 사립학교교직원연금공단입니다.<br/>원하시는 서비스를 선택하세요.</p>
                </div>
                <div style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
                   <div style={{border: '1px solid #eee', padding: '24px', borderRadius: '16px', width: '250px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <h3>연금 서비스</h3>
                      <p style={{fontSize: '0.9rem', color: '#666', marginTop:'40px'}}>조회·신청·확인서 발급 등 연금과 관련된 서비스를 이용하세요</p>
                   </div>
                   <div style={{border: '1px solid #eee', padding: '24px', borderRadius: '16px', width: '250px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <h3>대표 홈페이지</h3>
                      <p style={{fontSize: '0.9rem', color: '#666', marginTop:'40px'}}>사학연금과 관련된 다양한 정보를 확인하세요</p>
                   </div>
                   <div style={{border: '1px solid #eee', padding: '24px', borderRadius: '16px', width: '250px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <h3>통합복지 플랫폼</h3>
                      <p style={{fontSize: '0.9rem', color: '#666', marginTop:'40px'}}>사학연금의 교직원 복지와 맞춤형 서비스를 확인해 보세요</p>
                   </div>
                </div>
             </div>
          ) : (
            <div style={{padding: '40px', textAlign: 'center', color: '#888'}}>
              <h1 style={{color: '#333'}}>{activeTab?.title}</h1>
              <p>{activeTab?.url}</p>
            </div>
          )}
        </div>
      </main>

      {/* 3. Right Panel (Chelsea/AI) */}
      <aside className={`right-panel ${!isRightPanelOpen ? "closed" : ""}`}>
        <div className="rp-header">
           <div style={{display:'flex', gap:'12px'}}>
             <MessageSquare size={16} />
           </div>
           <div style={{display:'flex', gap:'12px'}}>
             <Pin size={16} />
             <X size={16} style={{cursor:'pointer'}} onClick={() => setIsRightPanelOpen(false)} />
           </div>
        </div>
        
        <div className="rp-body">
           <div className="skill-card">
              <h3><Zap size={16} fill="var(--text-title)" /> Browse Skills</h3>
              <p>Make complex tasks simple and repeatable.</p>
           </div>
           
           <div className="rp-shortcuts">
              <span style={{fontWeight: 600}}>Shortcuts for complex tasks</span><br/>
              <span style={{color: '#b0b0b5'}}>Type / to use a skill</span>
           </div>
        </div>

        <div className="rp-footer">
           <div className="prompt-actions">
              <button className="prompt-btn"><Search size={12}/> Explain</button>
              <button className="prompt-btn"><Search size={12}/> Analyze</button>
              <button className="prompt-btn"><Search size={12}/> Summarize</button>
           </div>
           <div className="chat-input-box">
              <div style={{color: 'var(--accent)', fontWeight: 'bold'}}>tp</div>
              <input type="text" placeholder="Ask a question about this page..." />
              <div className="chat-submit"><ArrowUp size={14} /></div>
           </div>
        </div>
      </aside>
    </div>
  );
}
