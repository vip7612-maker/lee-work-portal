"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Star, 
  Trash2, 
  Archive, 
  Plus, 
  PanelRight, 
  Layout, 
  Briefcase,
  FileText,
  Search,
  Globe
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
  { id: "3", title: "신규 웹사이트 디자인", isFavorite: false, memo: "메인 페이지 시안 검토 필요.", iconType: "layout" },
  { id: "4", title: "거래처 리서치", isFavorite: false, memo: "A회사와 B회사의 단가 비교표 확인.", iconType: "globe" },
];

export default function WorkPortal() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  // Resize logic
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
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

  // Actions
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
      case "layout": return <Layout size={size} />;
      case "briefcase": return <Briefcase size={size} />;
      case "globe": return <Globe size={size} />;
      default: return <FileText size={size} />;
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
        <div className="title">
          이경진 업무포털
        </div>

        {/* 즐겨찾기 (아이콘) */}
        {favorites.length > 0 && (
          <>
            <div className="section-title">최근 & 즐겨찾기</div>
            <div className="favorites-container">
              {favorites.map(tab => (
                <div 
                  key={tab.id} 
                  className={`favorite-icon ${activeTabId === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTabId(tab.id)}
                  title={tab.title}
                >
                  {getIcon(tab.iconType, 20)}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 업무 리스트 (탭) */}
        <div className="section-title" style={{ marginTop: '16px' }}>진행 중인 업무</div>
        <div className="tabs-container">
          {regularTabs.map(tab => (
            <div 
              key={tab.id} 
              className={`tab-item ${activeTabId === tab.id ? "active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getIcon(tab.iconType)}
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: sidebarWidth - 100 }}>
                  {tab.title}
                </span>
              </div>
              
              <div className="tab-actions">
                <button className="action-btn" title="즐겨찾기로 올리기" onClick={(e) => handleToggleFavorite(tab.id, e)}>
                  <Star size={14} />
                </button>
                <button className="action-btn" title="보관" onClick={(e) => { e.stopPropagation(); alert('보관됨'); }}>
                  <Archive size={14} />
                </button>
                <button className="action-btn" title="삭제" onClick={(e) => handleDelete(tab.id, e)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 탭 추가 버튼 */}
        <button className="add-btn" onClick={handleAddTab}>
          <Plus size={18} /> 새 탭 추가
        </button>
      </aside>

      {/* 2. Center View */}
      <main className="main-view">
        <header className="top-bar">
          <div className="view-title">
            {activeTab ? activeTab.title : "선택된 업무가 없습니다"}
          </div>
          <button 
            className="chelsea-btn" 
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          >
            <PanelRight size={16} />
            첼시 (추가 메모)
          </button>
        </header>

        <div className="content-area">
          {activeTab ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ padding: '30px', backgroundColor: 'var(--bg-app)', borderRadius: '50%', color: 'var(--accent)' }}>
                  {getIcon(activeTab.iconType, 64)}
                </div>
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-title)', marginBottom: '12px' }}>{activeTab.title}</h2>
              <p>이곳에 대상 홈페이지나 사내 시스템, 캔버스 등 실질적인 업무 화면이 노출됩니다.</p>
              
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', background: 'var(--bg-app)', 
                  border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 16px', width: '60%' 
                }}>
                  <Search size={16} style={{ marginRight: '8px' }} />
                  <input 
                    type="text" 
                    placeholder="Search or enter URL" 
                    style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--text-title)' }} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>새 탭을 추가해보세요.</div>
          )}
        </div>
      </main>

      {/* 3. Right Panel (Collapsible Memo/Info) */}
      <aside className={`right-panel ${!isRightPanelOpen ? "closed" : ""}`}>
        <div className="panel-header">
          <FileText size={18} />
          추가 메모 및 보조 정보 (디아 브라우저 첼시)
        </div>
        <div className="panel-body">
          {activeTab ? (
            <textarea 
              className="memo-textarea"
              placeholder={`${activeTab.title}에 대한 추가 메모나 정보를 기록하세요...\n(좌측 탭을 바꾸면 해당 탭의 메모로 변경됩니다)`}
              value={activeTab.memo}
              onChange={(e) => handleMemoChange(e.target.value)}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>메모를 작성할 탭을 선택하세요.</div>
          )}
        </div>
      </aside>
    </div>
  );
}
