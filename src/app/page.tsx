"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, RotateCw, Lock,
  Plus, X, GripVertical,
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

  const addTab = () => {
    const id = Date.now().toString();
    setTabs(prev => [...prev, { id, label:"New Tab", url:"", pinned:false, memo:"", color: COLORS[prev.length % COLORS.length] }]);
    setActiveId(id);
  };
  const removeTab = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setTabs(p => p.filter(t => t.id !== id)); };
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
              <div style={{ width:16, height:16, borderRadius:3, background: t.color }} />
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
              draggable
              onDragStart={e => onDragStart(e, t.id)}
              onDragEnd={onDragEnd}
              onDragOver={e => onTabDragOver(e, t.id)}
              onDrop={e => onTabDrop(e, t.id)}
            >
              <span className="tab__grip"><GripVertical size={12}/></span>
              <span className="tab__dot" style={{ background: t.color }} />
              <span className="tab__label">{t.label}</span>
              <span className="tab__actions">
                <button className="tab__btn" title="Close" onClick={e => removeTab(t.id, e)}><X size={11}/></button>
              </span>
            </div>
          ))}
        </div>

        <button className="sb__new" onClick={addTab}><Plus size={14}/> New Tab</button>
      </div>

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
