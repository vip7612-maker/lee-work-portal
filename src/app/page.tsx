"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft, ChevronRight, RotateCw, Lock,
  Plus, X, GripVertical, ChevronDown, Trash2, RotateCcw,
  Zap, Search, Pin, MessageSquare,
  PanelRight, ArrowUp
} from "lucide-react";

/* ── Types ── */
type Tab = {
  id: string;
  label: string;
  url: string;
  pinned: boolean;
  memo: string;
  color: string;
};

const COLORS = ["#ea4335","#34a853","#fbbc04","#4285f4","#ff6d01","#673ab7","#00bcd4","#8bc34a"];

const seed: Tab[] = [
  { id:"p1", label:"Gmail",      url:"mail.google.com",    pinned:true, memo:"", color:"#ea4335" },
  { id:"p2", label:"Drive",      url:"drive.google.com",   pinned:true, memo:"", color:"#34a853" },
  { id:"p3", label:"Calendar",   url:"calendar.google.com",pinned:true, memo:"", color:"#fbbc04" },
  { id:"p4", label:"Portal",     url:"lee-work-portal.vercel.app", pinned:true, memo:"", color:"#4285f4" },
  { id:"p5", label:"Notion",     url:"notion.so",          pinned:true, memo:"", color:"#000" },

  { id:"1", label:"해밀학교 대상 연구 참여자 정보 (2026", url:"docs.google.com",  pinned:false, memo:"해밀학교 연구 대상자 스프레드시트", color:"#4285f4" },
  { id:"2", label:"vip7612-maker/lee-work-portal",        url:"github.com",       pinned:false, memo:"업무포털 리포지토리",           color:"#24292e" },
  { id:"3", label:"Create Next App",                      url:"localhost:3000",    pinned:false, memo:"로컬 개발 환경",                color:"#000" },
  { id:"4", label:"lee-work-portal.vercel.app",            url:"lee-work-portal.vercel.app", pinned:false, memo:"프로덕션 배포 사이트", color:"#000" },
  { id:"5", label:"사학연금공단 대문페이지",                url:"tp.or.kr",          pinned:false, memo:"사학연금공단 벤치마킹 탭",       color:"#2b2a65" },
];

/* ── Component ── */
export default function Portal() {
  const [tabs, setTabs]             = useState<Tab[]>(seed);
  const [activeId, setActiveId]     = useState("5");
  const [sbWidth, setSbWidth]       = useState(240);
  const [panelOpen, setPanelOpen]   = useState(true);

  /* ── Trash (soft delete) ── */
  const [trash, setTrash]           = useState<Tab[]>([]);
  const [trashOpen, setTrashOpen]   = useState(false);

  const softDelete = (id: string) => {
    const t = tabs.find(x => x.id === id);
    if (t) {
      setTrash(prev => [t, ...prev]);
      setTabs(prev => prev.filter(x => x.id !== id));
      if (activeId === id) {
        const remaining = tabs.filter(x => x.id !== id);
        if (remaining.length) setActiveId(remaining[0].id);
      }
    }
  };
  const restoreTab = (id: string) => {
    const t = trash.find(x => x.id === id);
    if (t) {
      setTrash(prev => prev.filter(x => x.id !== id));
      setTabs(prev => [...prev, { ...t, pinned: false }]);
    }
  };
  const permanentDelete = (id: string) => {
    setTrash(prev => prev.filter(x => x.id !== id));
  };

  /* ── Inline rename (double-click) ── */
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editVal, setEditVal]       = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  const startRename = (t: Tab) => {
    setEditingId(t.id);
    setEditVal(t.label);
    setTimeout(() => editRef.current?.focus(), 0);
  };
  const commitRename = () => {
    if (editingId && editVal.trim()) {
      setTabs(p => p.map(t => t.id === editingId ? { ...t, label: editVal.trim() } : t));
    }
    setEditingId(null);
  };

  /* ── Right-click context menu ── */
  const [ctxMenu, setCtxMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [urlEditId, setUrlEditId]   = useState<string | null>(null);
  const [urlEditVal, setUrlEditVal] = useState("");
  const urlRef = useRef<HTMLInputElement>(null);

  const openCtx = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ id, x: e.clientX, y: e.clientY });
  };
  const startUrlEdit = (id: string) => {
    const t = tabs.find(x => x.id === id);
    setUrlEditId(id);
    setUrlEditVal(t?.url || "");
    setCtxMenu(null);
    setTimeout(() => urlRef.current?.focus(), 0);
  };
  const commitUrl = () => {
    if (urlEditId) {
      setTabs(p => p.map(t => t.id === urlEditId ? { ...t, url: urlEditVal.trim() } : t));
    }
    setUrlEditId(null);
  };

  /* Close menus on outside click */
  useEffect(() => {
    const handler = () => { setCtxMenu(null); };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  /* sidebar resize */
  const resizing = useRef(false);
  const onPointerDown = useCallback(() => { resizing.current = true; }, []);
  useEffect(() => {
    const move = (e: PointerEvent) => { if (!resizing.current) return; setSbWidth(Math.max(180, Math.min(380, e.clientX))); };
    const up = () => { resizing.current = false; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  /* ── Drag & Drop state ── */
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pinDropHover, setPinDropHover] = useState(false);

  const onDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
    // Make the drag image semi-transparent
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = "0.4";
  };

  const onDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    dragId.current = null;
    setDragOverId(null);
    setPinDropHover(false);
  };

  /* Reorder within tab list */
  const onTabDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== targetId) setDragOverId(targetId);
  };

  const onTabDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const srcId = dragId.current;
    if (!srcId || srcId === targetId) return;

    setTabs(prev => {
      const arr = [...prev];
      const srcIdx = arr.findIndex(t => t.id === srcId);
      const tgtIdx = arr.findIndex(t => t.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      const [moved] = arr.splice(srcIdx, 1);
      arr.splice(tgtIdx, 0, moved);
      return arr;
    });
    setDragOverId(null);
  };

  /* Drop onto pin bar → make it pinned */
  const onPinBarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setPinDropHover(true);
  };

  const onPinBarDragLeave = () => { setPinDropHover(false); };

  const onPinBarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const srcId = dragId.current;
    if (!srcId) return;
    setTabs(prev => prev.map(t => t.id === srcId ? { ...t, pinned: true } : t));
    setPinDropHover(false);
  };

  /* Reorder within pin bar */
  const onPinDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== targetId) setDragOverId(targetId);
  };

  const onPinDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const srcId = dragId.current;
    if (!srcId || srcId === targetId) return;

    setTabs(prev => {
      const arr = [...prev];
      const srcIdx = arr.findIndex(t => t.id === srcId);
      if (srcIdx === -1) return prev;
      // If dragging from tab list to pin bar, pin it
      arr[srcIdx] = { ...arr[srcIdx], pinned: true };
      const updated = [...arr];
      const src2 = updated.findIndex(t => t.id === srcId);
      const tgt2 = updated.findIndex(t => t.id === targetId);
      const [moved] = updated.splice(src2, 1);
      updated.splice(tgt2, 0, moved);
      return updated;
    });
    setDragOverId(null);
    setPinDropHover(false);
  };

  /* Drop on tab list area → unpin if pinned */
  const onTabListDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onTabListDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const srcId = dragId.current;
    if (!srcId) return;
    const src = tabs.find(t => t.id === srcId);
    if (src?.pinned) {
      setTabs(prev => prev.map(t => t.id === srcId ? { ...t, pinned: false } : t));
    }
  };

  const active   = tabs.find(t => t.id === activeId) ?? tabs[0];
  const pins     = tabs.filter(t => t.pinned);
  const items    = tabs.filter(t => !t.pinned);

  /* Favicon helper */
  const getFavicon = (url: string, size: number) => {
    if (!url) return null;
    const domain = url.split("/")[0];
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}`}
        alt=""
        width={size}
        height={size}
        style={{ borderRadius: size > 16 ? 4 : 2 }}
        draggable={false}
      />
    );
  };

  const addTab = () => {
    const id = Date.now().toString();
    setTabs(prev => [...prev, { id, label:"NEW 프로젝트", url:"", pinned:false, memo:"", color: COLORS[prev.length % COLORS.length] }]);
    setActiveId(id);
  };
  const setMemo   = (v: string) => setTabs(p => p.map(t => t.id===activeId ? {...t, memo:v} : t));

  return (
    <div className={`shell ${panelOpen ? "panel-open" : "panel-closed"}`} style={{ "--sb": `${sbWidth}px` } as React.CSSProperties}>

      {/* ═══ SIDEBAR ═══ */}
      <div className="sb">
        <div className="sb__resize" onPointerDown={onPointerDown} />

        <div className="sb__title">이경진 업무포털</div>

        {/* Pinned icons — drop zone */}
        <div
          className={`pin-bar ${pinDropHover ? "pin-bar--hover" : ""}`}
          onDragOver={onPinBarDragOver}
          onDragLeave={onPinBarDragLeave}
          onDrop={onPinBarDrop}
        >
          {pins.map(t => (
            <div
              key={t.id}
              className={`pin ${activeId===t.id ? "is-active" : ""} ${dragOverId===t.id ? "pin--drag-over" : ""}`}
              onClick={() => setActiveId(t.id)}
              title={t.label}
              draggable
              onDragStart={e => onDragStart(e, t.id)}
              onDragEnd={onDragEnd}
              onDragOver={e => onPinDragOver(e, t.id)}
              onDrop={e => onPinDrop(e, t.id)}
            >
              {getFavicon(t.url, 20) || <div style={{ width:16, height:16, borderRadius:3, background: t.color }} />}
            </div>
          ))}
          {pins.length === 0 && (
            <div style={{ fontSize:".75rem", color:"var(--ink-3)", padding:"8px 0" }}>여기로 드래그하여 즐겨찾기 추가</div>
          )}
        </div>

        {/* Tab list — drop zone */}
        <div
          className="tab-list"
          onDragOver={onTabListDragOver}
          onDrop={onTabListDrop}
        >
          {items.map(t => (
            <div
              key={t.id}
              className={`tab ${activeId===t.id ? "is-active" : ""} ${dragOverId===t.id ? "tab--drag-over" : ""}`}
              onClick={() => setActiveId(t.id)}
              onDoubleClick={() => startRename(t)}
              onContextMenu={e => openCtx(e, t.id)}
              draggable={editingId !== t.id}
              onDragStart={e => onDragStart(e, t.id)}
              onDragEnd={onDragEnd}
              onDragOver={e => onTabDragOver(e, t.id)}
              onDrop={e => onTabDrop(e, t.id)}
            >
              {getFavicon(t.url, 16) || <span className="tab__dot" style={{ background: t.color }} />}
              {editingId === t.id ? (
                <input
                  ref={editRef}
                  className="tab__edit"
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingId(null); }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="tab__label">{t.label}</span>
              )}

            </div>
          ))}
        </div>

        {/* ── Trash toggle ── */}
        {trash.length > 0 && (
          <div className="trash-section">
            <button className="trash-toggle" onClick={() => setTrashOpen(v => !v)}>
              <Trash2 size={13}/>
              <span>삭제된 프로젝트 ({trash.length})</span>
              <ChevronDown size={13} style={{ transform: trashOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', marginLeft: 'auto' }}/>
            </button>
            {trashOpen && (
              <div className="trash-list">
                {trash.map(t => (
                  <div key={t.id} className="trash-item">
                    {getFavicon(t.url, 14) || <span className="tab__dot" style={{ background: t.color }} />}
                    <span className="trash-item__label">{t.label}</span>
                    <button className="tab__btn" title="복원" onClick={() => restoreTab(t.id)}><RotateCcw size={11}/></button>
                    <button className="tab__btn ctx-danger" title="영구 삭제" onClick={() => permanentDelete(t.id)}><X size={11}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="sb__new" onClick={addTab}><Plus size={14}/> NEW 프로젝트</button>

        {/* URL edit overlay */}
        {urlEditId && (
          <div className="url-edit-overlay" onClick={e => e.stopPropagation()}>
            <div className="url-edit-box">
              <label>링크(URL) 변경</label>
              <input
                ref={urlRef}
                value={urlEditVal}
                onChange={e => setUrlEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commitUrl(); if (e.key === "Escape") setUrlEditId(null); }}
                placeholder="https://example.com"
              />
              <div className="url-edit-btns">
                <button onClick={() => setUrlEditId(null)}>취소</button>
                <button className="url-edit-save" onClick={commitUrl}>저장</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <div
          className="ctx-menu"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { const t = tabs.find(x => x.id === ctxMenu.id); if (t) startRename(t); setCtxMenu(null); }}>이름 변경</button>
          <button onClick={() => startUrlEdit(ctxMenu.id)}>링크 변경</button>
          <button onClick={() => { setTabs(p => p.map(t => t.id === ctxMenu.id ? { ...t, pinned: !t.pinned } : t)); setCtxMenu(null); }}>
            {tabs.find(t => t.id === ctxMenu.id)?.pinned ? "즐겨찾기 해제" : "즐겨찾기 등록"}
          </button>
          <div className="ctx-divider" />
          <button className="ctx-danger" onClick={() => { softDelete(ctxMenu.id); setCtxMenu(null); }}>삭제</button>
        </div>
      )}

      {/* ═══ VIEWPORT ═══ */}
      <div className="vp">
        <header className="vp__toolbar">
          <div className="vp__nav">
            <ChevronLeft size={16}/>
            <ChevronRight size={16} opacity={.35}/>
            <RotateCw size={14}/>
          </div>
          <div className="vp__url">
            <Lock size={11}/>
            <b>{active.url.split("/")[0]}</b>
            {active.url.includes("/") && <span>/{active.url.split("/").slice(1).join("/")}</span>}
          </div>
          <div className="vp__ext">
            <PanelRight size={16} color={panelOpen ? "var(--tint)" : undefined} onClick={() => setPanelOpen(v => !v)} />
          </div>
        </header>

        <div className="vp__body">
          {active.id === "5" ? (
            <div style={{ padding:"48px 40px", maxWidth:860, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:40 }}>
                <span style={{ background:"#2b2a65", color:"#fff", padding:"5px 14px", borderRadius:14, fontSize:".78rem", fontWeight:600 }}>대문페이지</span>
                <h1 style={{ color:"#2b2a65", fontSize:"1.6rem", margin:"16px 0 8px", fontWeight:700 }}>교직원과 함께하는 연금·복지 전문기관</h1>
                <p style={{ color:"#888", fontSize:".92rem" }}>안녕하세요, 사립학교교직원연금공단입니다.<br/>원하시는 서비스를 선택하세요.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                {[["연금 서비스","조회·신청·확인서 발급 등\n연금과 관련된 서비스를 이용하세요","#3db2a0"],
                  ["대표 홈페이지","사학연금과 관련된\n다양한 정보를 확인하세요","#5b8dd9"],
                  ["통합복지 플랫폼","사학연금의 교직원 복지와\n맞춤형 서비스를 확인해 보세요","#c77dba"]
                ].map(([t,d,c]) => (
                  <div key={t} style={{ border:"1px solid var(--rule)", borderRadius:12, padding:"28px 20px", position:"relative" }}>
                    <h3 style={{ fontSize:"1.05rem", fontWeight:700, color:"var(--ink)", marginBottom:6 }}>{t}</h3>
                    <div style={{ width:48, height:48, borderRadius:"50%", background:`${c}22`, position:"absolute", top:24, right:20 }} />
                    <p style={{ fontSize:".82rem", color:"var(--ink-3)", whiteSpace:"pre-line", marginTop:28, lineHeight:1.6 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding:"60px 40px", color:"var(--ink-3)" }}>
              <h2 style={{ color:"var(--ink)", marginBottom:8 }}>{active.label}</h2>
              <p>{active.url || "빈 탭"}</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="rp">
        <div className="rp__header">
          <div style={{ display:"flex", gap:10 }}><MessageSquare size={15}/></div>
          <div style={{ display:"flex", gap:10 }}>
            <Pin size={15}/>
            <X size={15} onClick={() => setPanelOpen(false)}/>
          </div>
        </div>
        <div className="rp__body">
          <div className="rp__card">
            <h3><Zap size={14} fill="var(--ink)"/> Browse Skills</h3>
            <p>Make complex tasks simple and repeatable.</p>
          </div>
          <div className="rp__hint">
            <strong>Shortcuts for complex tasks</strong>
            Type / to use a skill
          </div>
        </div>
        <div className="rp__footer">
          <div className="rp__chips">
            <button className="chip"><Search size={10}/> Explain</button>
            <button className="chip"><Search size={10}/> Analyze</button>
            <button className="chip"><Search size={10}/> Summarize</button>
          </div>
          <div style={{ fontSize:".78rem", color:"var(--ink-3)", marginBottom:8, display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:14, height:14, borderRadius:3, background: active.color, display:"inline-block" }} />
            <b style={{ color:"var(--ink)" }}>{active.label.slice(0,20)}</b>
          </div>
          <div className="rp__input">
            <input placeholder="Ask a question about this page..." />
            <button className="rp__send"><ArrowUp size={12}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
