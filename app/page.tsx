"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Star, Trash2, Archive, Plus, PanelRight, 
  Layout, Briefcase, FileText, Search, Globe, ChevronRight
} from "lucide-react";

type Tab = {
  id: string;
  title: string;
  isFavorite: boolean;
  memo: string;
  iconType: "layout" | "briefcase" | "file" | "globe";
};

const initialTabs: Tab[] = [
  { id: "1", title: "제곡교회 성전건축", isFavorite: true, memo: "제곡교회 성전건축 관련 일정 및 예산 관리 페이지. 현재 GitHub에 리포지토리 구성 완료.", iconType: "briefcase" },
  { id: "2", title: "주간 업무 보고", isFavorite: true, memo: "이번 주 주간 업무 보고 작성 중.", iconType: "file" },
  { id: "3", title: "신규 디자인 시안", isFavorite: false, memo: "메인 페이지 시안 검토 필요.", iconType: "layout" },
  { id: "4", title: "거래처 리서치", isFavorite: false, memo: "A회사와 B회사의 단가 비교표 확인.", iconType: "globe" },
];

export default function WorkPortal() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      let newWidth = e.clientX;
      if (newWidth < 220) newWidth = 220;
      if (newWidth > 600) newWidth = 600;
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
    const newTab: Tab = {
      id: newId,
      title: `새 업무 탭 ${tabs.length + 1}`,
      isFavorite: false,
      memo: "",
      iconType: "file"
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(tabs.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id && newTabs.length > 0) setActiveTabId(newTabs[0].id);
  };

  const handleMemoChange = (val: string) => {
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, memo: val } : t));
  };

  const getIcon = (type: string, size = 18) => {
    switch (type) {
      case "layout": return <Layout size={size} strokeWidth={2.5} />;
      case "briefcase": return <Briefcase size={size} strokeWidth={2.5}  />;
      case "globe": return <Globe size={size} strokeWidth={2.5}  />;
      default: return <FileText size={size} strokeWidth={2.5}  />;
    }
  };

  return (
    <div className="layout-container">
      {/* 1. Left Sidebar */}
      <aside className="sidebar" style={{ width: sidebarWidth }}>
        <div 
          className="resizer"
          onMouseDown={() => {
            isResizing.current = true;
            document.body.style.cursor = "col-resize";
          }}
        />
        <div className="title-area">
          <div className="logo"><Briefcase size={14} strokeWidth={3} /></div>
          이경진 업무포털
        </div>

        {favorites.length > 0 && (
          <>
            <div className="section-title">자주 찾는 업무</div>
            <div className="favorites-container">
              {favorites.map(tab => (
                <div 
                  key={tab.id} 
                  className={`favorite-icon ${activeTabId === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTabId(tab.id)}
                  title={tab.title}
                >
                  {getIcon(tab.iconType, 22)}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="section-title">스페이스 및 폴더</div>
        <div className="tabs-container">
          {regularTabs.map(tab => (
            <div 
              key={tab.id} 
              className={`tab-item ${activeTabId === tab.id ? "active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: activeTabId === tab.id ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {getIcon(tab.iconType, 18)}
                </div>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: sidebarWidth - 110 }}>
                  {tab.title}
                </span>
              </div>
              
              <div className="tab-actions">
                <button className="action-btn" title="즐겨찾기로 이동 (위로 올리기)" onClick={(e) => handleToggleFavorite(tab.id, e)}>
                  <Star size={16} />
                </button>
                <button className="action-btn" title="보관함" onClick={(e) => { e.stopPropagation(); alert('보관됨'); }}>
                  <Archive size={16} />
                </button>
                <button className="action-btn" title="탭 닫기" onClick={(e) => handleDelete(tab.id, e)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="add-btn" onClick={handleAddTab}>
          <Plus size={20} /> 새 탭 만들기
        </button>
      </aside>

      {/* 2. Main View */}
      <main className="main-view" key={activeTabId}>
        <header className="top-bar">
          <div className="view-title">
            <div style={{ padding: '6px', background: 'var(--accent-light)', borderRadius: '8px', color: 'var(--accent)' }}>
               {getIcon(activeTab?.iconType || 'file', 20)}
            </div>
            {activeTab ? activeTab.title : "선택된 업무가 없습니다"}
          </div>
          <button 
            className={`chelsea-btn ${isRightPanelOpen ? 'active' : ''}`} 
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          >
            <PanelRight size={18} />
            {isRightPanelOpen ? '첼시 닫기' : '첼시 열기'}
          </button>
        </header>

        <div className="content-area">
          {activeTab ? (
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginTop: '60px' }}>
              <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ padding: '40px', backgroundColor: 'var(--sidebar-hover)', borderRadius: '30px', color: 'var(--accent)' }}>
                  {getIcon(activeTab.iconType, 80)}
                </div>
              </div>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-title)', marginBottom: '16px', fontWeight: '700', letterSpacing: '-0.03em' }}>
                {activeTab.title}
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                이 공간은 <b>{activeTab.title}</b>의 메인 뷰어입니다.
                <br/>실제 서비스 연동 시 Iframe이나 실시간 데이터가 여기에 표시됩니다.
              </p>
              
              <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', background: 'var(--sidebar-hover)', 
                  border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px 20px', width: '100%',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                  <Search size={20} style={{ marginRight: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search or enter URL (e.g. google.com)" 
                    style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--text-title)', fontSize: '1rem' }} 
                  />
                  <div style={{ background: 'var(--center-bg)', padding: '4px', borderRadius: '6px', marginLeft: '8px' }}>
                     <ChevronRight size={18} color="var(--text-muted)"/>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>
              왼쪽에서 새 업무 탭을 추가해보세요.
            </div>
          )}
        </div>
      </main>

      {/* 3. Right Panel (Chelsea) */}
      <aside className={`right-panel ${!isRightPanelOpen ? "closed" : ""}`}>
        <div className="panel-header">
          <PanelRight size={20} color="var(--accent)" />
          <span>첼시 <span style={{fontSize:'0.85rem', color:'var(--text-muted)', fontWeight:'500'}}>(추가 정보 & 메모)</span></span>
        </div>
        <div className="panel-body">
          {activeTab ? (
            <>
              <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14}/> 현재 타겟: <b style={{color: 'var(--text-title)'}}>{activeTab.title}</b>
              </div>
              <textarea 
                className="memo-textarea"
                placeholder={`이곳에 ${activeTab.title}에 관련된 영감, 할 일, 혹은 요약 정보를 유연하게 기록하세요.\n자동으로 저장됩니다.`}
                value={activeTab.memo}
                onChange={(e) => handleMemoChange(e.target.value)}
              />
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
              먼저 좌측 탭을 선택하세요.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
