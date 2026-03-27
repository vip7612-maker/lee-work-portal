"use client";
import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type AgentFeature = {
  id: string;
  title: string;
  icon: string;
  bgGrad: string;
  description: string;
  setupGuide: string;
  sort_order: number;
};

const renderIcon = (name: string, props: any) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Bot;
  return <Icon {...props} />;
};

export default function AaronAIGallery() {
  const [features, setFeatures] = useState<AgentFeature[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFeature, setSelectedFeature] = useState<AgentFeature | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form States
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editBg, setEditBg] = useState("");
  const [editGuide, setEditGuide] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/aaron-features');
      const json = await res.json();
      if (json.success) {
        setFeatures(json.features);
      }
    } catch (e) {
      console.error("Failed to load features", e);
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFeature(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleOpenModal = (feat: AgentFeature) => {
    setSelectedFeature(feat);
    setIsEditing(false);
    setEditTitle(feat.title);
    setEditDesc(feat.description);
    setEditIcon(feat.icon);
    setEditBg(feat.bgGrad);
    setEditGuide(feat.setupGuide);
  };

  const handleAddNew = async () => {
    const defaultData = {
      title: "새로운 기능",
      icon: "Sparkles",
      bgGrad: "linear-gradient(135deg, #cbd5e1, #94a3b8)",
      description: "기능에 대한 간략한 설명을 적어주세요.",
      setupGuide: "<p>여기에 HTML 설정 가이드를 작성하세요.</p>",
      sort_order: features.length + 1
    };
    setIsSaving(true);
    try {
      const res = await fetch('/api/aaron-features', {
        method: 'POST',
        body: JSON.stringify(defaultData)
      });
      const data = await res.json();
      if (data.success) {
        const newFeat = { ...defaultData, id: data.id };
        setFeatures(p => [...p, newFeat]);
        handleOpenModal(newFeat);
        setIsEditing(true); // Open directly in edit mode
      }
    } catch (e) {
      console.error(e);
      alert("추가 중 오류 발생");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFeature) return;
    setIsSaving(true);
    try {
      await fetch('/api/aaron-features', {
        method: 'PUT',
        body: JSON.stringify({
          id: selectedFeature.id,
          title: editTitle,
          description: editDesc,
          icon: editIcon,
          bgGrad: editBg,
          setupGuide: editGuide
        })
      });
      // Refresh local state
      setFeatures(p => p.map(f => f.id === selectedFeature.id ? {
        ...f,
        title: editTitle,
        description: editDesc,
        icon: editIcon,
        bgGrad: editBg,
        setupGuide: editGuide
      } : f));
      
      // Update selected modal view details, and exit editing
      setSelectedFeature(p => p ? {
        ...p,
        title: editTitle,
        description: editDesc,
        icon: editIcon,
        bgGrad: editBg,
        setupGuide: editGuide
      } : null);
      
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("저장 중 오류 발생");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeature) return;
    if (!confirm("정말 이 에이전트 기능을 삭제하시겠습니까?")) return;
    
    setIsSaving(true);
    try {
      await fetch('/api/aaron-features', {
        method: 'DELETE',
        body: JSON.stringify({ id: selectedFeature.id })
      });
      setFeatures(p => p.filter(f => f.id !== selectedFeature.id));
      setSelectedFeature(null);
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류 발생");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#64748b" }}>데이터를 불러오는 중...</div>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      padding: "32px 24px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative"
    }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ 
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 16, 
            background: "linear-gradient(135deg, #0f172a, #334155)",
            color: "white", marginBottom: 16,
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.2)"
          }}>
            <LucideIcons.Bot size={32}/>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 12 }}>
            Aaron Agent <span style={{ color: "#0ea5e9" }}>Gallery</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1rem", fontWeight: 500, maxWidth: 580, margin: "0 auto", lineHeight: 1.6 }}>
            아론(Aaron) AI 비서의 다양한 기능을 직접 편집하고 관리해 보세요. 각 카드를 클릭하면 상세 가이드를 볼 수 있습니다.
          </p>
        </div>

        {/* Gallery Grid - smaller cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {features.map((feat) => (
            <div 
              key={feat.id} 
              onClick={() => handleOpenModal(feat)}
              style={{
                background: "white", border: "1px solid rgba(0,0,0,0.04)", borderRadius: 16,
                overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)", transition: "all 0.2s ease-out",
                position: "relative"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
              }}
            >
              <div style={{ height: 100, background: feat.bgGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {renderIcon(feat.icon, { size: 36, color: "white", opacity: 0.9 })}
              </div>
              <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1e293b", marginBottom: 8, lineHeight: 1.3 }}>{feat.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{feat.description}</p>
              </div>
            </div>
          ))}

          {/* ADD NEW CARD */}
          <div 
            onClick={handleAddNew}
            style={{
              background: "rgba(255,255,255,0.4)", border: "2px dashed #cbd5e1", borderRadius: 16,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s", minHeight: 200, color: "#94a3b8"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.8)";
              e.currentTarget.style.borderColor = "#94a3b8";
              e.currentTarget.style.color = "#64748b";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.4)";
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            {isSaving ? <LucideIcons.Loader2 className="spin" size={32} /> : <LucideIcons.PlusCircle size={36} />}
            <span style={{ marginTop: 12, fontWeight: 600, fontSize: "0.95rem" }}>새 기능 추가</span>
          </div>
        </div>

        {/* Feature Modal */}
        {selectedFeature && (
          <div 
            onClick={() => { if(!isEditing) setSelectedFeature(null); }}
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
                background: "white", borderRadius: 20, width: "100%", maxWidth: 640,
                overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
                display: "flex", flexDirection: "column", maxHeight: "90vh"
              }}
            >
              {/* Modal Header */}
              <div style={{ 
                height: 120, background: isEditing ? "#e2e8f0" : editBg, padding: "24px 32px 0",
                display: "flex", alignItems: "flex-end", position: "relative",
                transition: "background 0.3s"
              }}>
                <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
                  {!isEditing && (
                    <>
                      <button onClick={() => setIsEditing(true)} style={{ background: "rgba(255,255,255,0.25)", color: "white", border: "none", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><LucideIcons.Edit2 size={15}/></button>
                      <button onClick={handleDelete} style={{ background: "rgba(255,255,255,0.25)", color: "white", border: "none", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><LucideIcons.Trash2 size={15} color="#faa"/></button>
                    </>
                  )}
                  <button onClick={() => setSelectedFeature(null)} style={{ background: isEditing ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.25)", color: isEditing ? "#333" : "white", border: "none", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><LucideIcons.X size={18}/></button>
                </div>
                
                {!isEditing ? (
                  <div style={{ 
                    background: "white", width: 64, height: 64, borderRadius: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: "translateY(20px)", boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                  }}>
                    {renderIcon(editIcon, { size: 32, color: editBg.split(',')[1]?.trim() || "#333" })}
                  </div>
                ) : (
                  <div style={{ width: "100%", marginBottom: 12 }}>
                    <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#64748b" }}>아이콘 이름 (Lucide)</label>
                    <input className="edit-input" value={editIcon} onChange={e => setEditIcon(e.target.value)} placeholder="Bot, Smartphone 등..." />
                    <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#64748b", marginTop:8, display:"block" }}>배경 CSS (그라데이션 등)</label>
                    <input className="edit-input" value={editBg} onChange={e => setEditBg(e.target.value)} placeholder="linear-gradient(...)" />
                  </div>
                )}
              </div>
              
              {/* Modal Body */}
              <div style={{ padding: "40px 32px 24px", overflowY: "auto", flex: 1, background: isEditing ? "#f8fafc" : "white" }}>
                {!isEditing ? (
                  <>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: 10, letterSpacing: "-0.02em" }}>
                      {editTitle}
                    </h2>
                    <div style={{ fontSize: "0.95rem", color: "#475569", lineHeight: 1.6, marginBottom: 24, whiteSpace: "pre-wrap" }}>
                      {editDesc}
                    </div>
                    <div style={{ width: "100%", height: 1, background: "#e2e8f0", marginBottom: 24 }} />
                    <div className="setup-guide markdown-body">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw]}
                      >
                        {editGuide}
                      </ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ fontSize:"0.8rem", fontWeight:600, color:"#475569", marginBottom:4, display:"block" }}>타이틀</label>
                      <input className="edit-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ padding:10, fontSize:"1.1rem" }} />
                    </div>
                    <div>
                      <label style={{ fontSize:"0.8rem", fontWeight:600, color:"#475569", marginBottom:4, display:"block" }}>카드 상세 설명 (썸네일 설명)</label>
                      <textarea className="edit-input" value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ minHeight: 80, padding:10 }} />
                    </div>
                    <div>
                      <label style={{ fontSize:"0.8rem", fontWeight:600, color:"#475569", marginBottom:4, display:"block" }}>설정 가이드 본문 (HTML 자유 양식)</label>
                      <textarea className="edit-input" value={editGuide} onChange={e => setEditGuide(e.target.value)} style={{ minHeight: 180, padding:10, fontFamily: "monospace", fontSize: "0.85rem" }} />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div style={{ padding: "16px 32px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                {isEditing ? (
                  <>
                    <button onClick={() => { setIsEditing(false); handleOpenModal(selectedFeature); }} style={{ background: "transparent", color: "#64748b", border: "1px solid #cbd5e1", padding: "8px 20px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>취소</button>
                    <button onClick={handleSave} disabled={isSaving} style={{ background: "#0ea5e9", color: "white", border: "none", padding: "8px 24px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>{isSaving ? "저장 중..." : "저장 완료"}</button>
                  </>
                ) : (
                  <button onClick={() => setSelectedFeature(null)} style={{ background: "#0f172a", color: "white", border: "none", padding: "8px 24px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>확인 닫기</button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .edit-input {
            width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px;
            font-size: 0.9rem; outline: none; background: white;
            transition: border-color 0.2s;
          }
          .edit-input:focus { border-color: #0ea5e9; }
          .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { font-weight:600; color:#1e293b; margin:24px 0 12px; }
          .markdown-body p { margin-bottom:12px; line-height:1.6; }
          .markdown-body ul, .markdown-body ol { padding-left:24px; margin-bottom:16px; display:flex; flex-direction:column; gap:6px; }
          .markdown-body li { margin-bottom: 4px; }
          .markdown-body code { background:#f1f5f9; padding:3px 6px; border-radius:6px; font-size:0.85em; }
          .markdown-body pre { background:#f1f5f9; padding:16px; border-radius:8px; overflow-x:auto; margin-bottom:16px; }
          .markdown-body pre code { background:transparent; padding:0; }
          .setup-guide h4 { font-weight:600; color:#1e293b; margin:16px 0 8px; }
          .setup-guide p { margin-bottom:12px; }
          .setup-guide ul, .setup-guide ol { padding-left:20px; margin-bottom:16px; display:flex; flex-direction:column; gap:6px; }
        `}} />
      </div>
    </div>
  );
}
