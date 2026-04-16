"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  ChevronLeft, ChevronRight, RotateCw, Lock,
  Plus, X, ChevronDown, Archive, RotateCcw,
  MessageSquare, PanelRight, PanelLeftClose, ArrowUp,
  CheckSquare, Square, Link2, ExternalLink, Trash2, Home
} from "lucide-react";
import Dashboard from "./dashboard/page";
import AppStorePage from "./app-store/page";
import AaronAIPage from "./aaron-ai/page";

/* ── Types ── */
type Tab = {
  id: string; label: string; url: string;
  pinned: boolean; memo: string; color: string;
};
type CheckItem = { id: string; project_id: string; text: string; checked: number; sort_order: number };
type LinkItem  = { id: string; project_id: string; label: string; url: string; sort_order: number };
type Comment   = { id: string; project_id: string; text: string; created_at: string };
type VpTab     = { id: string; project_id: string; name: string; url: string; sort_order: number };

const COLORS = ["#ea4335","#34a853","#fbbc04","#4285f4","#ff6d01","#673ab7","#00bcd4","#8bc34a"];
const DASHBOARD_ID = "__dashboard__";
const APPSTORE_ID = "__appstore__";
const AARON_AI_ID = "__aaron_ai__";

const seed: Tab[] = [
  { id:"p1", label:"Gmail",      url:"mail.google.com",    pinned:true, memo:"", color:"#ea4335" },
  { id:"p2", label:"Drive",      url:"drive.google.com",   pinned:true, memo:"", color:"#34a853" },
  { id:"p3", label:"Calendar",   url:"calendar.google.com",pinned:true, memo:"", color:"#fbbc04" },
  { id:"p4", label:"Portal",     url:"lee-work-portal.vercel.app", pinned:true, memo:"", color:"#4285f4" },
  { id:"p5", label:"Notion",     url:"notion.so",          pinned:true, memo:"", color:"#000" },
  { id:"1", label:"해밀학교 대상 연구 참여자 정보 (2026", url:"docs.google.com",  pinned:false, memo:"", color:"#4285f4" },
  { id:"2", label:"vip7612-maker/lee-work-portal",        url:"github.com",       pinned:false, memo:"", color:"#24292e" },
  { id:"3", label:"Create Next App",                      url:"localhost:3000",    pinned:false, memo:"", color:"#000" },
  { id:"4", label:"lee-work-portal.vercel.app",            url:"lee-work-portal.vercel.app", pinned:false, memo:"", color:"#000" },
  { id:"5", label:"사학연금공단 대문페이지",                url:"tp.or.kr",          pinned:false, memo:"", color:"#2b2a65" },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);

/* Domains that block iframe embedding (X-Frame-Options / CSP) */
const BLOCKED_DOMAINS = [
  'mail.google.com', 'accounts.google.com', 'myaccount.google.com',
  'meet.google.com', 'chat.google.com', 'contacts.google.com',
  'play.google.com', 'photos.google.com', 'maps.google.com',
  'translate.google.com', 'news.google.com', 'drive.google.com',
  'calendar.google.com', 'keep.google.com', 'docs.google.com', 'sheets.google.com', 'slides.google.com',
  'github.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
  'linkedin.com', 'reddit.com', 'amazon.com', 'naver.com', 'daum.net',
  'kakao.com', 'tistory.com', 'notion.so', 'slack.com',
  'localhost', 'tp.or.kr',
];

const api = {
  async fetchJSON(url: string) { const r = await fetch(url); return r.json(); },
  async post(url: string, body: object) { await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }); },
  async put(url: string, body: object)  { await fetch(url, { method:'PUT',  headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }); },
  async del(url: string, body: object)  { await fetch(url, { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }); },
};

/* ── Component ── */
export default function Portal() {
  /* ═══ ALL HOOKS FIRST (React Rules of Hooks compliance) ═══ */
  const { data: session, status } = useSession();

  const [mounted, setMounted]       = useState(false);
  const [tabs, setTabs]             = useState<Tab[]>([]);
  const [activeId, setActiveId]     = useState(DASHBOARD_ID);
  const [sbWidth, setSbWidth]       = useState(240);
  const [sbOpen, setSbOpen]         = useState(false);
  const [panelOpen, setPanelOpen]   = useState(false);
  const [trash, setTrash]           = useState<Tab[]>([]);
  const [trashOpen, setTrashOpen]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editVal, setEditVal]       = useState("");
  const [ctxMenu, setCtxMenu]       = useState<{ id: string; type?: "tab" | "link"; x: number; y: number } | null>(null);
  const [urlEditId, setUrlEditId]   = useState<string | null>(null);
  const [urlEditVal, setUrlEditVal] = useState("");
  const [linkEditId, setLinkEditId] = useState<string | null>(null);
  const [linkEditLabel, setLinkEditLabel] = useState("");
  const [linkEditUrl, setLinkEditUrl] = useState("");
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pinDropHover, setPinDropHover] = useState(false);
  const [dbLoaded, setDbLoaded]     = useState(false);
  const [rpCheckOpen, setRpCheckOpen] = useState(true);
  const [rpLinksOpen, setRpLinksOpen] = useState(true);
  const [rpMemosOpen, setRpMemosOpen] = useState(true);
  const [checks, setChecks]         = useState<CheckItem[]>([]);
  const [newCheck, setNewCheck]     = useState("");
  const [links, setLinks]           = useState<LinkItem[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [memos, setMemos]           = useState<Comment[]>([]);
  const [newMemo, setNewMemo]       = useState("");
  const [vpTabs, setVpTabs]         = useState<VpTab[]>([]);
  const [activeVpTabId, setActiveVpTabId] = useState<string | null>(null);
  const [showVpAdd, setShowVpAdd]   = useState(false);
  const [vpNewName, setVpNewName]   = useState("");
  const [vpNewUrl, setVpNewUrl]     = useState("");

  const editRef = useRef<HTMLInputElement>(null);
  const urlRef  = useRef<HTMLInputElement>(null);
  const resizing = useRef(false);
  const dragId   = useRef<string | null>(null);
  const memosEndRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback(() => { resizing.current = true; }, []);

  /* ── Effects ── */
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { const h = () => setCtxMenu(null); window.addEventListener("click", h); return () => window.removeEventListener("click", h); }, []);

  useEffect(() => {
    if (!mounted) return;
    const move = (e: PointerEvent) => { if (!resizing.current) return; setSbWidth(Math.max(180, Math.min(380, e.clientX))); };
    const up = () => { resizing.current = false; };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    
    // 초기 화면 크기에 따른 패널 상태 설정 (matchMedia 사용)
    const isDesktop = window.matchMedia("(min-width: 1025px)").matches;
    if (isDesktop) {
      setSbOpen(true);
      setPanelOpen(true);
    } else {
      setSbOpen(false);
      setPanelOpen(false);
    }
    
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [mounted]);

  useEffect(() => {
    if (!session) return;
    api.fetchJSON('/api/projects').then((rows: any[]) => {
      if (rows && rows.length > 0) {
        const activeList: Tab[] = [];
        const archivedList: Tab[] = [];
        for (const r of rows) {
          const t: Tab = { id: r.id, label: r.label, url: r.url || '', pinned: !!r.pinned, memo: '', color: r.color || '#000' };
          if (r.archived) archivedList.push(t);
          else activeList.push(t);
        }
        setTabs(activeList);
        setTrash(archivedList);
        if (activeList.length) {
          setActiveId(DASHBOARD_ID);
        }
      } else {
        seed.forEach((t, i) => {
          api.post('/api/projects', { id: t.id, label: t.label, url: t.url, pinned: t.pinned ? 1 : 0, color: t.color, sort_order: i, archived: 0 });
        });
        setTabs(seed);
        setActiveId(seed[0].id);
      }
      setDbLoaded(true);
    }).catch(() => setDbLoaded(true));
  }, [session]);

  useEffect(() => {
    if (!activeId || !session) return;
    api.fetchJSON(`/api/checklists?pid=${activeId}`).then(setChecks).catch(() => {});
    api.fetchJSON(`/api/links?pid=${activeId}`).then(setLinks).catch(() => {});
    api.fetchJSON(`/api/comments?pid=${activeId}`).then(setMemos).catch(() => {});
    api.fetchJSON(`/api/viewport-tabs?pid=${activeId}`).then((rows: VpTab[]) => {
      setVpTabs(rows || []);
      // 항상 가장 좌측 탭(null)이 기본으로 열리도록 설정 변경
      setActiveVpTabId(null);
    }).catch(() => {});
  }, [activeId, session]);

  useEffect(() => { memosEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [memos]);

  /* ═══ AUTH GATE — after ALL hooks ═══ */
  if (!mounted || status === "loading") {
    return <div className="login-screen"><p style={{ color:"var(--ink-3)" }}>로딩 중...</p></div>;
  }
  if (!session) {
    return (
      <div className="login-screen">
        <h1>이경진 업무포털</h1>
        <p style={{ color:"var(--ink-3)", fontSize:".88rem" }}>업무 관리를 시작하려면 로그인하세요</p>
        <button className="login-btn" onClick={() => signIn("google")}>
          <img src="https://www.google.com/s2/favicons?domain=google.com&sz=32" alt="" width={20} height={20} />
          Google로 로그인
        </button>
      </div>
    );
  }

  /* ═══ FUNCTIONS (non-hook, safe after conditional) ═══ */
  const softDelete = (id: string) => {
    const t = tabs.find(x => x.id === id);
    if (t) {
      setTrash(prev => [t, ...prev]);
      setTabs(prev => prev.filter(x => x.id !== id));
      api.put('/api/projects', { id, archived: 1 });
      if (activeId === id) { const r = tabs.filter(x => x.id !== id); if (r.length) setActiveId(r[0].id); }
    }
  };
  const restoreTab = (id: string) => {
    const t = trash.find(x => x.id === id);
    if (t) { setTrash(prev => prev.filter(x => x.id !== id)); setTabs(prev => [...prev, { ...t, pinned: false }]); api.put('/api/projects', { id, archived: 0, pinned: 0 }); }
  };
  const permanentDelete = (id: string) => { setTrash(prev => prev.filter(x => x.id !== id)); api.del('/api/projects', { id }); };

  const startRename = (t: Tab) => { setEditingId(t.id); setEditVal(t.label); setTimeout(() => editRef.current?.focus(), 0); };
  const commitRename = () => { if (editingId && editVal.trim()) { setTabs(p => p.map(t => t.id === editingId ? { ...t, label: editVal.trim() } : t)); api.put('/api/projects', { id: editingId, label: editVal.trim() }); } setEditingId(null); };

  const openCtx = (e: React.MouseEvent, id: string, type: "tab" | "link" = "tab") => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ id, type, x: e.clientX, y: e.clientY }); };
  const startUrlEdit = (id: string) => { const t = tabs.find(x => x.id === id); setUrlEditId(id); setUrlEditVal(t?.url || ""); setCtxMenu(null); setTimeout(() => urlRef.current?.focus(), 0); };
  const commitUrl = () => { if (urlEditId) { setTabs(p => p.map(t => t.id === urlEditId ? { ...t, url: urlEditVal.trim() } : t)); api.put('/api/projects', { id: urlEditId, url: urlEditVal.trim() }); } setUrlEditId(null); };
  
  const startLinkEdit = (l: LinkItem) => { setLinkEditId(l.id); setLinkEditLabel(l.label); setLinkEditUrl(l.url); setCtxMenu(null); };
  const commitLinkEdit = () => { if (linkEditId) { setLinks(p => p.map(l => l.id === linkEditId ? { ...l, label: linkEditLabel.trim(), url: linkEditUrl.trim() } : l)); api.put('/api/links', { id: linkEditId, label: linkEditLabel.trim(), url: linkEditUrl.trim() }); } setLinkEditId(null); };

  const onDragStart = (e: React.DragEvent, id: string) => { dragId.current = id; e.dataTransfer.effectAllowed = "move"; (e.currentTarget as HTMLElement).style.opacity = "0.4"; };
  const onDragEnd = (e: React.DragEvent) => { (e.currentTarget as HTMLElement).style.opacity = "1"; dragId.current = null; setDragOverId(null); setPinDropHover(false); };
  const onTabDragOver = (e: React.DragEvent, tid: string) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dragOverId !== tid) setDragOverId(tid); };
  const onTabDrop = (e: React.DragEvent, tid: string) => { e.preventDefault(); const srcId = dragId.current; if (!srcId || srcId === tid) return; setTabs(prev => { const a = [...prev]; const si = a.findIndex(t => t.id === srcId); const ti = a.findIndex(t => t.id === tid); if (si === -1 || ti === -1) return prev; const [m] = a.splice(si, 1); a.splice(ti, 0, m); return a; }); setDragOverId(null); };
  const onPinBarDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setPinDropHover(true); };
  const onPinBarDragLeave = () => setPinDropHover(false);
  const onPinBarDrop = (e: React.DragEvent) => { e.preventDefault(); const srcId = dragId.current; if (!srcId) return; setTabs(prev => prev.map(t => t.id === srcId ? { ...t, pinned: true } : t)); api.put('/api/projects', { id: srcId, pinned: 1 }); setPinDropHover(false); };
  const onPinDragOver = (e: React.DragEvent, tid: string) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dragOverId !== tid) setDragOverId(tid); };
  const onPinDrop = (e: React.DragEvent, tid: string) => { e.preventDefault(); const srcId = dragId.current; if (!srcId || srcId === tid) return; setTabs(prev => { const a = [...prev]; const si = a.findIndex(t => t.id === srcId); if (si === -1) return prev; a[si] = { ...a[si], pinned: true }; const u = [...a]; const s2 = u.findIndex(t => t.id === srcId); const t2 = u.findIndex(t => t.id === tid); const [m] = u.splice(s2, 1); u.splice(t2, 0, m); return u; }); setDragOverId(null); setPinDropHover(false); };
  const onTabListDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const onTabListDrop = (e: React.DragEvent) => { e.preventDefault(); const srcId = dragId.current; if (!srcId) return; const src = tabs.find(t => t.id === srcId); if (src?.pinned) { setTabs(prev => prev.map(t => t.id === srcId ? { ...t, pinned: false } : t)); api.put('/api/projects', { id: srcId, pinned: 0 }); } };

  /* Derived */
  const active = tabs.find(t => t.id === activeId) ?? tabs[0];
  const pins   = tabs.filter(t => t.pinned);
  const items  = tabs.filter(t => !t.pinned);

  const FAVICON_MAP: Record<string, string> = {
    'mail.google.com':     'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
    'calendar.google.com': 'https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31.ico',
    'drive.google.com':    'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png',
    'docs.google.com':     'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    'meet.google.com':     'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-32dp/logo_meet_2020q4_color_1x_web_32dp.png',
    'chat.google.com':     'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/chat_1.ico',
    'photos.google.com':   'https://ssl.gstatic.com/social/photosui/images/favicon/photos_2022.ico',
    'notion.so':           'https://www.notion.so/images/favicon.ico',
    'github.com':          'https://github.githubassets.com/favicons/favicon-dark.svg',
  };

  const getFavicon = (url: string, size: number) => {
    if (!url) return null;
    const domain = url.replace(/https?:\/\//, '').split("/")[0].replace('www.', '');
    const knownIcon = FAVICON_MAP[domain];
    if (knownIcon) return <img src={knownIcon} alt="" width={size} height={size} style={{ borderRadius: size > 16 ? 4 : 2 }} draggable={false} />;
    return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}`} alt="" width={size} height={size} style={{ borderRadius: size > 16 ? 4 : 2 }} draggable={false} />;
  };

  const addTab = () => {
    const id = uid();
    const newTab: Tab = { id, label:"NEW 프로젝트", url:"", pinned:false, memo:"", color: COLORS[tabs.length % COLORS.length] };
    setTabs(prev => [...prev, newTab]);
    setActiveId(id);
    api.post('/api/projects', { ...newTab, pinned: 0, sort_order: tabs.length, archived: 0 });
  };

  const addBoardProject = async (title: string) => {
    const id = uid();
    const newTab: Tab = { id, label: title, url: "", pinned: false, memo: "", color: COLORS[tabs.length % COLORS.length] };
    setTabs(prev => [...prev, newTab]);
    try {
      await api.post('/api/projects', { ...newTab, pinned: 0, sort_order: tabs.length, archived: 0 });
    } catch (e) { console.error(e); }
    return newTab;
  };

  const navigateToProject = (id: string) => {
    setActiveId(id);
    setActiveVpTabId(null);
  };

  const addCheck = () => { if (!newCheck.trim()) return; const item: CheckItem = { id: uid(), project_id: activeId, text: newCheck.trim(), checked: 0, sort_order: checks.length }; setChecks(p => [...p, item]); setNewCheck(""); api.post('/api/checklists', item); };
  const toggleCheck = (id: string) => { setChecks(p => p.map(c => c.id === id ? { ...c, checked: c.checked ? 0 : 1 } : c)); const c = checks.find(x => x.id === id); api.put('/api/checklists', { id, checked: c?.checked ? 0 : 1 }); };
  const removeCheck = (id: string) => { setChecks(p => p.filter(c => c.id !== id)); api.del('/api/checklists', { id }); };

  const addLink = () => { if (!newLinkLabel.trim() || !newLinkUrl.trim()) return; const item: LinkItem = { id: uid(), project_id: activeId, label: newLinkLabel.trim(), url: newLinkUrl.trim(), sort_order: links.length }; setLinks(p => [...p, item]); setNewLinkLabel(""); setNewLinkUrl(""); api.post('/api/links', item); };
  const removeLink = (id: string) => { setLinks(p => p.filter(l => l.id !== id)); api.del('/api/links', { id }); };

  const addMemo = () => { if (!newMemo.trim()) return; const item: Comment = { id: uid(), project_id: activeId, text: newMemo.trim(), created_at: new Date().toISOString() }; setMemos(p => [...p, item]); setNewMemo(""); api.post('/api/comments', item); };
  const removeMemo = (id: string) => { setMemos(p => p.filter(m => m.id !== id)); api.del('/api/comments', { id }); };

  const addVpTab = () => {
    if (!vpNewName.trim()) return;
    if (activeId !== DASHBOARD_ID && !vpNewUrl.trim()) return;
    const item: VpTab = { id: uid(), project_id: activeId, name: vpNewName.trim(), url: vpNewUrl.trim(), sort_order: vpTabs.length };
    setVpTabs(p => [...p, item]); setActiveVpTabId(item.id);
    setVpNewName(""); setVpNewUrl(""); setShowVpAdd(false);
    api.post('/api/viewport-tabs', item);
  };
  const removeVpTab = (id: string) => {
    setVpTabs(p => p.filter(t => t.id !== id));
    if (activeVpTabId === id) setActiveVpTabId(vpTabs.find(t => t.id !== id)?.id || null);
    api.del('/api/viewport-tabs', { id });
  };

  const isDashboard = activeId === DASHBOARD_ID;
  const isAppStore = activeId === APPSTORE_ID;
  const isAaronAi = activeId === AARON_AI_ID;
  const currentVpUrl = (() => {
    if (isDashboard || isAppStore || isAaronAi) return '';
    if (activeVpTabId) { const vt = vpTabs.find(t => t.id === activeVpTabId); if (vt) return vt.url; }
    return active?.url || '';
  })();

  if (!active && !isDashboard && !isAppStore && !isAaronAi) return <div className="login-screen"><p style={{ color:"var(--ink-3)" }}>프로젝트를 불러오는 중...</p></div>;

  return (
    <div className={`shell ${sbOpen ? 'is-sb-open' : 'is-sb-closed'} ${panelOpen ? 'is-panel-open' : 'is-panel-closed'}`} style={{ "--sb": `${sbWidth}px` } as React.CSSProperties}>

      {/* 모바일 오버레이 */}
      <div 
        className={`mobile-overlay ${(!sbOpen && !panelOpen) ? 'is-hidden' : ''}`}
        onClick={() => { setSbOpen(false); setPanelOpen(false); }}
      />

      {/* ═══ SIDEBAR ═══ */}
      <div className="sb">
        <div className="sb__resize" onPointerDown={onPointerDown} />
        <div className="sb__title">
          <button className="sb__home" onClick={() => { setActiveId(DASHBOARD_ID); setActiveVpTabId(null); }} title="홈 대시보드">
            <Home size={18}/>
          </button>
          <span onClick={() => { setActiveId(DASHBOARD_ID); setActiveVpTabId(null); }} style={{ cursor: "pointer" }} title="홈 대시보드">이경진 업무포털</span>
          <button className="sb__signout" onClick={() => signOut()}>로그아웃</button>
        </div>

        {/* Pinned icons */}
        <div className={`pin-bar ${pinDropHover ? "pin-bar--hover" : ""}`} onDragOver={onPinBarDragOver} onDragLeave={onPinBarDragLeave} onDrop={onPinBarDrop}>
          {pins.map(t => (
            <div key={t.id} className={`pin ${activeId===t.id ? "is-active" : ""} ${dragOverId===t.id ? "pin--drag-over" : ""}`}
              onClick={() => { setActiveId(t.id); setActiveVpTabId(null); }} title={t.label} draggable
              onDragStart={e => onDragStart(e, t.id)} onDragEnd={onDragEnd}
              onDragOver={e => onPinDragOver(e, t.id)} onDrop={e => onPinDrop(e, t.id)}
              onContextMenu={e => openCtx(e, t.id)}
            >
              {getFavicon(t.url, 20) || <div style={{ width:16, height:16, borderRadius:3, background: t.color }} />}
            </div>
          ))}
          {pins.length === 0 && <div style={{ fontSize:".75rem", color:"var(--ink-3)", padding:"8px 0" }}>여기로 드래그하여 즐겨찾기 추가</div>}
        </div>

        <button className="sb__new" onClick={addTab}><Plus size={14}/> NEW 프로젝트</button>

        {/* Tab list */}
        <div className="tab-list" onDragOver={onTabListDragOver} onDrop={onTabListDrop}>
          {items.map(t => (
            <div key={t.id} className={`tab ${activeId===t.id ? "is-active" : ""} ${dragOverId===t.id ? "tab--drag-over" : ""}`}
              onClick={() => { setActiveId(t.id); setActiveVpTabId(null); }} onDoubleClick={() => startRename(t)}
              onContextMenu={e => openCtx(e, t.id)} draggable={editingId !== t.id}
              onDragStart={e => onDragStart(e, t.id)} onDragEnd={onDragEnd}
              onDragOver={e => onTabDragOver(e, t.id)} onDrop={e => onTabDrop(e, t.id)}
            >
              {getFavicon(t.url, 16) || <span className="tab__dot" style={{ background: t.color }} />}
              {editingId === t.id ? (
                <input ref={editRef} className="tab__edit" value={editVal}
                  onChange={e => setEditVal(e.target.value)} onBlur={commitRename}
                  onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingId(null); }}
                  onClick={e => e.stopPropagation()} />
              ) : (
                <span className="tab__label">{t.label}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex:1 }} />

        <button className="sb__new sb__aaronai" onClick={() => {
          setActiveId(AARON_AI_ID); setActiveVpTabId(null);
        }}>🤖 아론 AI비서</button>
        <button className="sb__new sb__appstore" onClick={() => {
          setActiveId(APPSTORE_ID); setActiveVpTabId(null);
        }}>🚀 App Store</button>

        {/* Archived */}
        {trash.length > 0 && (
          <div className="trash-section">
            <button className="trash-toggle" onClick={() => setTrashOpen(v => !v)}>
              <Archive size={13}/><span>보관된 프로젝트 ({trash.length})</span>
              <ChevronDown size={13} style={{ transform: trashOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', marginLeft: 'auto' }}/>
            </button>
            {trashOpen && (
              <div className="trash-list">
                {trash.map(t => (
                  <div key={t.id} className="trash-item"
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ id: t.id, x: e.clientX, y: e.clientY }); }}>
                    {getFavicon(t.url, 14) || <span className="tab__dot" style={{ background: t.color }} />}
                    <span className="trash-item__label">{t.label}</span>
                    <button className="tab__btn" title="복원" onClick={() => restoreTab(t.id)}><RotateCcw size={11}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: "10px 16px", fontSize: "10px", color: "var(--ink-3)", opacity: 0.5 }}>
          Last Build: 2026-04-16 09:50
        </div>

        {/* URL edit overlay */}
        {urlEditId && (
          <div className="url-edit-overlay" onClick={e => e.stopPropagation()}>
            <div className="url-edit-box">
              <label>링크(URL) 변경</label>
              <input ref={urlRef} value={urlEditVal} onChange={e => setUrlEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commitUrl(); if (e.key === "Escape") setUrlEditId(null); }} placeholder="https://example.com" />
              <div className="url-edit-btns">
                <button onClick={() => setUrlEditId(null)}>취소</button>
                <button className="url-edit-save" onClick={commitUrl}>저장</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (() => {
        if (ctxMenu.type === "link") {
          return (
            <div className="ctx-menu" style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={e => e.stopPropagation()}>
              <button onClick={() => { const l = links.find(x => x.id === ctxMenu.id); if(l) startLinkEdit(l); }}>수정</button>
              <div className="ctx-divider" />
              <button className="ctx-danger" onClick={() => { removeLink(ctxMenu.id); setCtxMenu(null); }}>삭제</button>
            </div>
          );
        }
        
        const isArchived = trash.some(t => t.id === ctxMenu.id);
        const isActive = tabs.some(t => t.id === ctxMenu.id);
        return (
          <div className="ctx-menu" style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={e => e.stopPropagation()}>
            {isActive && ctxMenu.id !== DASHBOARD_ID && (<>
              <button onClick={() => { const t = tabs.find(x => x.id === ctxMenu.id); if (t) startRename(t); setCtxMenu(null); }}>이름 변경</button>
              <button onClick={() => startUrlEdit(ctxMenu.id)}>링크 변경</button>
              <button onClick={() => { setTabs(p => p.map(t => t.id === ctxMenu.id ? { ...t, pinned: !t.pinned } : t)); const t = tabs.find(x => x.id === ctxMenu.id); if (t) api.put('/api/projects', { id: t.id, pinned: t.pinned ? 0 : 1 }); setCtxMenu(null); }}>
                {tabs.find(t => t.id === ctxMenu.id)?.pinned ? "즐겨찾기 해제" : "즐겨찾기 등록"}
              </button>
              <div className="ctx-divider" />
              <button onClick={() => { softDelete(ctxMenu.id); setCtxMenu(null); }}>보관</button>
            </>)}
            {isArchived && (<>
              <button onClick={() => { restoreTab(ctxMenu.id); setCtxMenu(null); }}>복원</button>
              <div className="ctx-divider" />
              <button className="ctx-danger" onClick={() => { permanentDelete(ctxMenu.id); setCtxMenu(null); }}>완전 삭제</button>
            </>)}
          </div>
        );
      })()}

      {/* ═══ VIEWPORT ═══ */}
      <div className="vp">
        {/* Tab bar (area 1) */}
        <div className="vp__tabbar">
          <div className="vp__tabbar-list">
            <button className="vp__sb-toggle" onClick={() => setSbOpen(v => !v)} title={sbOpen ? '사이드바 접기' : '사이드바 펼치기'}>
              <PanelLeftClose size={16} style={{ transform: sbOpen ? 'none' : 'scaleX(-1)', transition: 'transform .2s' }} />
            </button>
            <button className={`vp__tab ${!activeVpTabId ? 'is-active' : ''}`}
              onClick={() => setActiveVpTabId(null)}>
              {isDashboard ? '📊 대시보드' : isAppStore ? '🚀 App Store' : isAaronAi ? '🤖 아론 AI비서' : active?.label}
            </button>
            {vpTabs.map(vt => (
              <button key={vt.id} className={`vp__tab ${activeVpTabId===vt.id ? 'is-active' : ''}`}
                onClick={() => setActiveVpTabId(vt.id)}>
                <span>{vt.name}</span>
                <span className="vp__tab-x" onClick={e => { e.stopPropagation(); removeVpTab(vt.id); }}>×</span>
              </button>
            ))}
            <button className="vp__tab-add" onClick={() => setShowVpAdd(v => !v)}><Plus size={12}/></button>
          </div>
          <div className="vp__ext">
            <PanelRight size={16} color={panelOpen ? "var(--tint)" : undefined} onClick={() => setPanelOpen(v => !v)} />
          </div>
        </div>

        {/* Add tab form */}
        {showVpAdd && (
          <div className="vp__tab-form">
            <input value={vpNewName} onChange={e => setVpNewName(e.target.value)} placeholder={isDashboard ? "대시보드 카테고리 이름" : "탭 이름"}
              onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addVpTab(); if (e.key === 'Escape') setShowVpAdd(false); }} />
            {!isDashboard && (
              <input value={vpNewUrl} onChange={e => setVpNewUrl(e.target.value)} placeholder="URL"
                onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addVpTab(); if (e.key === 'Escape') setShowVpAdd(false); }} />
            )}
            <button onClick={addVpTab}><Plus size={12}/></button>
          </div>
        )}

        {/* URL bar */}
        <header className="vp__toolbar">
          <div className="vp__nav">
            <ChevronLeft size={16}/><ChevronRight size={16} opacity={.35}/><RotateCw size={14}/>
          </div>
          <div className="vp__url">
            <Lock size={11}/><b>{(currentVpUrl || '').split("/")[0]}</b>
            {(currentVpUrl || '').includes("/") && <span>/{(currentVpUrl || '').split("/").slice(1).join("/")}</span>}
          </div>
        </header>

        {/* Iframe (area 2) */}
        <div className="vp__body">
          {isDashboard ? <Dashboard boardId={activeVpTabId || '__default__'} projects={tabs} addBoardProject={addBoardProject} navigateToProject={navigateToProject} /> : ((isAppStore || isAaronAi) && !activeVpTabId) ? (isAppStore ? <AppStorePage /> : <AaronAIPage />) : (() => {
            const url = currentVpUrl?.replace(/\s+/g, '');
            if (!url) return (<div style={{ padding:"60px 40px", color:"var(--ink-3)", textAlign:"center" }}><h2 style={{ color:"var(--ink)", marginBottom:8 }}>{active?.label || '대시보드'}</h2><p>링크를 설정하려면 우클릭 → 링크 변경</p></div>);
            let embedUrl = url.startsWith("http") ? url : `https://${url}`;
            
            // Google Drive Auto-embed rewrites
            if (embedUrl.includes("drive.google.com")) {
              const folderMatch = embedUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
              if (folderMatch) {
                embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
              } else if (embedUrl.includes("/file/d/") && embedUrl.includes("/view")) {
                embedUrl = embedUrl.replace(/\/view.*$/, "/preview");
              }
            } else if (embedUrl.includes("docs.google.com/presentation/d/")) {
              embedUrl = embedUrl.replace(/\/edit.*$/, "/embed?start=false&loop=false&delayms=3000");
            } else if (embedUrl.includes("youtube.com/watch")) {
              const vid = new URL(embedUrl).searchParams.get("v"); if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
            } else if (embedUrl.includes("youtu.be/")) {
              const vid = embedUrl.split("youtu.be/")[1]?.split(/[?#]/)[0]; if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
            }

            const domain = embedUrl.replace(/https?:\/\//, '').split('/')[0].replace('www.','');
            
            // Exclude from blocklist if it's specifically an embeddable view
            const isEmbeddableDrive = embedUrl.includes("drive.google.com/embeddedfolderview") || (embedUrl.includes("drive.google.com/file/d/") && embedUrl.includes("/preview"));

            /* Block same-origin (recursive iframe) */
            if (typeof window !== 'undefined' && embedUrl.includes(window.location.hostname)) {
              return (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12, color:'var(--ink-3)' }}>
                  <ExternalLink size={32} />
                  <p style={{ fontSize:'.92rem', fontWeight:500, color:'var(--ink)' }}>{active?.label || ''}</p>
                  <a href={embedUrl} target="_blank" rel="noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 18px', background:'var(--tint)', color:'#fff', borderRadius:6, fontSize:'.82rem', fontWeight:500, textDecoration:'none' }}>
                    <ExternalLink size={14}/> 새 탭에서 열기
                  </a>
                </div>
              );
            }
            if (!isEmbeddableDrive && BLOCKED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
              return (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12, color:'var(--ink-3)' }}>
                  <Lock size={32} />
                  <p style={{ fontSize:'.92rem', fontWeight:500, color:'var(--ink)' }}>{active?.label || '대시보드'}</p>
                  <p style={{ fontSize:'.82rem' }}>이 사이트는 임베드할 수 없습니다</p>
                  <a href={embedUrl} target="_blank" rel="noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 18px', background:'var(--tint)', color:'#fff', borderRadius:6, fontSize:'.82rem', fontWeight:500, textDecoration:'none', marginTop:4 }}>
                    <ExternalLink size={14}/> 새 탭에서 열기
                  </a>
                </div>
              );
            }
            return <iframe src={embedUrl} style={{ width:"100%", height:"100%", border:"none" }} allow="autoplay; encrypted-media" allowFullScreen />;
          })()}
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="rp">
        <div className="rp__header">
          <div className="rp__title" style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--ink)", display: "flex", alignItems: "center" }}>
            {isDashboard ? '📊 대시보드' : isAppStore ? '🚀 App Store' : isAaronAi ? '🤖 아론 AI비서' : active?.label || ''}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <X size={15} style={{ cursor:"pointer" }} onClick={() => setPanelOpen(false)}/>
          </div>
        </div>

        <div className="rp__body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* CHECKLIST */}
          <div className="rp-section">
            <div className="rp-section__title" onClick={() => setRpCheckOpen(v => !v)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><CheckSquare size={13}/> 체크리스트</span>
              <ChevronDown size={14} style={{ transform: rpCheckOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: "var(--ink-3)" }} />
            </div>
            {rpCheckOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {checks.length === 0 && <p className="rp-empty">아직 항목이 없습니다</p>}
                {checks.map(c => (
                  <div key={c.id} className={`check-item ${c.checked ? 'is-done' : ''}`}>
                    <button className="check-item__box" onClick={() => toggleCheck(c.id)}>
                      {c.checked ? <CheckSquare size={16} color="var(--tint)"/> : <Square size={16}/>}
                    </button>
                    <span className="check-item__text">{c.text}</span>
                    <button className="check-item__del" onClick={() => removeCheck(c.id)}><X size={12}/></button>
                  </div>
                ))}
                <div className="check-add">
                  <input value={newCheck} onChange={e => setNewCheck(e.target.value)} placeholder="할 일 추가..."
                    onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addCheck(); }} />
                  <button onClick={addCheck}><Plus size={14}/></button>
                </div>
              </div>
            )}
          </div>

          {/* LINKS */}
          <div className="rp-section">
            <div className="rp-section__title" onClick={() => setRpLinksOpen(v => !v)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><Link2 size={13}/> 링크 바로가기</span>
              <ChevronDown size={14} style={{ transform: rpLinksOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: "var(--ink-3)" }} />
            </div>
            {rpLinksOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {links.length === 0 && <p className="rp-empty">링크 버튼을 추가하세요</p>}
                {links.map(l => (
                  <div key={l.id} className="link-card" onContextMenu={e => openCtx(e, l.id, "link")}>
                    <a href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noreferrer" className="link-card__main">
                      <img src={`https://www.google.com/s2/favicons?domain=${l.url.replace(/https?:\/\//, '').split('/')[0]}&sz=32`} alt="" width={16} height={16} style={{ borderRadius:2 }}/>
                      <span>{l.label}</span>
                      <ExternalLink size={12}/>
                    </a>
                    <button className="link-card__del" onClick={() => removeLink(l.id)}><X size={12}/></button>
                  </div>
                ))}
                <div className="link-add">
                  <input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="버튼 이름" />
                  <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="URL"
                    onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addLink(); }} />
                  <button onClick={addLink}><Plus size={14}/></button>
                </div>
              </div>
            )}
          </div>

          {/* MEMOS */}
          <div className="rp-section rp-section--memos">
            <div className="rp-section__title" onClick={() => setRpMemosOpen(v => !v)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><MessageSquare size={13}/> 메모</span>
              <ChevronDown size={14} style={{ transform: rpMemosOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: "var(--ink-3)" }} />
            </div>
            {rpMemosOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                <div className="memo-thread" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                  {memos.length === 0 && <p className="rp-empty">메모를 남겨보세요</p>}
                  {memos.map(m => (
                    <div key={m.id} className="memo-bubble">
                      <div className="memo-bubble__text">{m.text}</div>
                      <div className="memo-bubble__meta">
                        <span>{new Date(m.created_at).toLocaleString('ko-KR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                        <button onClick={() => removeMemo(m.id)}><Trash2 size={11}/></button>
                      </div>
                    </div>
                  ))}
                  <div ref={memosEndRef} />
                </div>
                <div className="rp__input" style={{ flexShrink: 0 }}>
                  <input value={newMemo} onChange={e => setNewMemo(e.target.value)} placeholder="메모를 입력하세요..."
                    onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addMemo(); }} />
                  <button className="rp__send" onClick={addMemo}><ArrowUp size={12}/></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Link Edit overlay */}
        {linkEditId && (
          <div className="url-edit-overlay" onClick={e => e.stopPropagation()}>
            <div className="url-edit-box">
              <label>링크 수정</label>
              <input value={linkEditLabel} onChange={e => setLinkEditLabel(e.target.value)} placeholder="링크 버튼 이름"
                onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) commitLinkEdit(); if (e.key === "Escape") setLinkEditId(null); }} style={{ marginBottom: 8 }} />
              <input value={linkEditUrl} onChange={e => setLinkEditUrl(e.target.value)} placeholder="https://example.com"
                onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) commitLinkEdit(); if (e.key === "Escape") setLinkEditId(null); }} />
              <div className="url-edit-btns">
                <button onClick={() => setLinkEditId(null)}>취소</button>
                <button className="url-edit-save" onClick={commitLinkEdit}>저장</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
