"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, MoreVertical, Paperclip, MessageSquare, CheckSquare as CheckIcon, X, ExternalLink, Send } from "lucide-react";

type Column = { id: string; board_id: string; title: string; sort_order: number };
type Task = { 
  id: string; column_id: string; project_id: string; title: string; 
  status: string; priority: string; date_range: string; 
  assignees: string; image_url: string; sort_order: number;
};
type Project = { id: string; label: string; memo: string; color: string; };

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default function Dashboard({ 
  boardId = '__default__', 
  projects = [],
  addBoardProject = async (t: string) => ({ id: '' } as any),
  navigateToProject = (id: string) => {}
}: { 
  boardId?: string, 
  projects?: Project[],
  addBoardProject?: (t: string) => Promise<any>,
  navigateToProject?: (id: string) => void
}) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newColTitle, setNewColTitle] = useState("");
  const [addingTaskColId, setAddingTaskColId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColTitle, setEditingColTitle] = useState("");

  const dragTaskId = useRef<string | null>(null);
  const dragColId = useRef<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalComments, setModalComments] = useState<any[]>([]);
  const [newModalComment, setNewModalComment] = useState("");
  const [projectMemo, setProjectMemo] = useState("");

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  const loadBoard = async () => {
    setLoading(true);
    try {
      const colRes = await fetch(`/api/board-columns?board_id=${boardId}`);
      const colData = await colRes.json();
      const cols: Column[] = colData.columns || [];
      setColumns(cols);

      if (cols.length > 0) {
        const colIds = cols.map(c => c.id).join(',');
        const taskRes = await fetch(`/api/board-tasks?column_ids=${colIds}`);
        const taskData = await taskRes.json();
        setTasks(taskData.tasks || []);
      } else {
        setTasks([]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const addColumn = async () => {
    if (!newColTitle.trim()) return;
    const col: Column = { id: uid(), board_id: boardId, title: newColTitle.trim(), sort_order: columns.length };
    setColumns(p => [...p, col]);
    setNewColTitle("");
    await fetch('/api/board-columns', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(col)
    });
  };

  const renameColumn = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setColumns(p => p.map(c => c.id === id ? { ...c, title: newTitle.trim() } : c));
    await fetch('/api/board-columns', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, title: newTitle.trim() })
    });
    setEditingColId(null);
  };

  const deleteColumn = async (id: string) => {
    if (!confirm("이 카테고리와 내부의 모든 업무가 삭제됩니다. 계속하시겠습니까?")) return;
    setColumns(p => p.filter(c => c.id !== id));
    setTasks(p => p.filter(t => t.column_id !== id));
    await fetch('/api/board-columns', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
    });
  };

  const addTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;
    
    // 1. Create a real Project in the sidebar
    const newProject = await addBoardProject(newTaskTitle.trim());

    // 2. Link it to a board task
    const t: Task = { 
      id: uid(), column_id: columnId, project_id: newProject.id, title: newTaskTitle.trim(), 
      status: 'To Do', priority: '보통', date_range: '', 
      assignees: '', image_url: '', sort_order: tasks.filter(x => x.column_id === columnId).length 
    };
    setTasks(p => [...p, t]);
    setAddingTaskColId(null);
    setNewTaskTitle("");
    await fetch('/api/board-tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t)
    });
  };

  const deleteTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTasks(p => p.filter(t => t.id !== id));
    await fetch('/api/board-tasks', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
    });
  };

  /* Native Drag & Drop Logic for Tasks */
  const onTaskDragStart = (e: React.DragEvent, taskId: string) => {
    dragTaskId.current = taskId;
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = "0.4";
    }, 0);
  };

  const onTaskDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    dragTaskId.current = null;
    setDragOverColId(null);
  };

  const onColDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColId !== colId) setDragOverColId(colId);
  };

  const onColDrop = async (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    setDragOverColId(null);
    const draggedId = dragTaskId.current;
    if (!draggedId) return;

    const draggedTask = tasks.find(t => t.id === draggedId);
    if (!draggedTask) return;

    if (draggedTask.column_id === targetColId) return;

    const newTasks = [...tasks];
    const taskIdx = newTasks.findIndex(t => t.id === draggedId);
    newTasks[taskIdx] = { ...newTasks[taskIdx], column_id: targetColId };
    
    const colTasks = newTasks.filter(t => t.column_id === targetColId).sort((a,b) => a.sort_order - b.sort_order);
    colTasks.push(newTasks[taskIdx]);
    
    const updates: { id: string; column_id: string; sort_order: number }[] = [];
    colTasks.forEach((t, i) => {
      t.sort_order = i;
      updates.push({ id: t.id, column_id: targetColId, sort_order: i });
    });

    setTasks(newTasks);

    await fetch('/api/board-tasks/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
  };

  const onTaskDrop = async (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    setDragOverColId(null);
    
    const draggedId = dragTaskId.current;
    if (!draggedId || draggedId === targetTaskId) return;

    const newTasks = [...tasks];
    const srcIdx = newTasks.findIndex(t => t.id === draggedId);
    let dstIdx = newTasks.findIndex(t => t.id === targetTaskId);
    
    if (srcIdx === -1 || dstIdx === -1) return;

    const sourceColId = newTasks[srcIdx].column_id;
    const targetColId = newTasks[dstIdx].column_id;

    const [moved] = newTasks.splice(srcIdx, 1);
    moved.column_id = targetColId;
    
    if (sourceColId === targetColId && srcIdx < dstIdx) {
      dstIdx -= 1;
    }
    
    newTasks.splice(dstIdx, 0, moved);

    const colsToUpdate = new Set([sourceColId, targetColId]);
    const updates: { id: string; column_id: string; sort_order: number }[] = [];
    
    colsToUpdate.forEach(cid => {
      let order = 0;
      newTasks.forEach(t => {
        if (t.column_id === cid) {
          t.sort_order = order++;
          updates.push({ id: t.id, column_id: cid, sort_order: t.sort_order });
        }
      });
    });

    setTasks(newTasks);
    await fetch('/api/board-tasks/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
  };

  // --- Modal Specific Methods ---
  const openModal = async (task: Task, project: Project) => {
    setSelectedTask(task);
    setProjectMemo(project.memo || "");
    // Fetch comments
    const r = await fetch(`/api/comments?pid=${project.id}`);
    const data = await r.json();
    setModalComments(data.comments || []);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setModalComments([]);
  };

  const saveProjectMemo = async () => {
    if (!selectedTask) return;
    await fetch('/api/projects', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedTask.project_id, memo: projectMemo })
    });
    // Since page.tsx loads projects, ideally we mutate it or rely on a reload later.
  };

  const addModalComment = async () => {
    if (!selectedTask || !newModalComment.trim()) return;
    const cItem = { id: uid(), project_id: selectedTask.project_id, text: newModalComment.trim() };
    setModalComments(p => [...p, cItem]);
    setNewModalComment("");
    await fetch('/api/comments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cItem)
    });
  };

  const removeModalComment = async (id: string) => {
    setModalComments(p => p.filter(c => c.id !== id));
    await fetch('/api/comments', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
    });
  };

  if (loading) {
    return <div style={{ padding: 40, color: "#94a3b8" }}>보드 불러오는 중...</div>;
  }

  return (
    <div style={{
      width: "100%", height: "100%", padding: "24px 28px",
      background: "#f1f5f9", display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif", overflow: "hidden", position: "relative"
    }}>
      <style>{`
        .kanban-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .kanban-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .kanban-col { background: transparent; display: flex; flex-direction: column; width: 300px; min-width: 300px; gap: 12px; }
        .kanban-header { background: white; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; }
        .add-task-btn { background: white; border-radius: 8px; padding: 12px; display: flex; gap: 8px; align-items: center; color: #64748b; font-size: 0.9rem; cursor: pointer; border: 1px dashed #cbd5e1; transition: all 0.2s; }
        .add-task-btn:hover { background: #f8fafc; color: #3b82f6; border-color: #93c5fd; }
        .task-card { background: white; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; cursor: grab; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.03); transition: box-shadow 0.2s; }
        .task-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .badge { padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; }
        .badge.todo { background: #f1f5f9; color: #475569; }
        .badge.done { background: #dcfce7; color: #16a34a; }
        .badge.priority { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }
        .badge.priority.high { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
        .task-title { font-size: 0.95rem; font-weight: 600; color: #1e293b; line-height: 1.4; display: flex; align-items: center; gap: 6px; }
        .task-date { font-size: 0.8rem; color: #ef4444; font-weight: 500; }
        .col-title-input { font-size: 1rem; font-weight: 700; color: #1e293b; border: 1px solid #3b82f6; border-radius: 4px; outline: none; padding: 2px 6px; width: 100%; }
        
        /* Three-dots dropdown */
        .dots-menu { position: relative; }
        .dots-dropdown { position: absolute; right: 0; top: 20px; display: none; background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 0; z-index: 10; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .dots-menu:hover .dots-dropdown { display: block; }
        .dots-dropdown button { padding: 6px 16px; width: 100%; text-align: left; white-space: nowrap; border: none; background: transparent; cursor: pointer; font-size: 0.85rem; }
        .dots-dropdown button:hover { background: #f8fafc; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; width: 600px; max-width: 90vw; max-height: 85vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }
      `}</style>

      <div className="kanban-scroll" style={{ display: "flex", gap: 20, flex: 1, overflowX: "auto", overflowY: "hidden", paddingBottom: 10 }}>
        
        {/* Columns */}
        {columns.sort((a,b) => a.sort_order - b.sort_order).map(col => {
          const colTasks = tasks.filter(t => t.column_id === col.id).sort((a,b) => a.sort_order - b.sort_order);
          return (
            <div key={col.id} className="kanban-col"
              onDragOver={(e) => onColDragOver(e, col.id)}
              onDrop={(e) => onColDrop(e, col.id)}
            >
              {/* Header */}
              <div className="kanban-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }} onDoubleClick={() => { setEditingColId(col.id); setEditingColTitle(col.title); }}>
                  {editingColId === col.id ? (
                    <input 
                      autoFocus className="col-title-input" value={editingColTitle} onChange={e => setEditingColTitle(e.target.value)}
                      onBlur={() => renameColumn(col.id, editingColTitle)}
                      onKeyDown={e => { if (e.key === 'Enter') renameColumn(col.id, editingColTitle); if (e.key === 'Escape') setEditingColId(null); }}
                    />
                  ) : (
                    <>
                      <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "1rem", cursor: "text" }}>{col.title}</span>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                        {colTasks.length}
                      </span>
                    </>
                  )}
                </div>
                <div style={{ marginLeft: 'auto' }} className="dots-menu">
                  <MoreVertical size={16} color="#94a3b8" style={{ cursor: "pointer" }} />
                  <div className="dots-dropdown">
                    <button onClick={() => deleteColumn(col.id)} style={{ color: "#ef4444" }}>카테고리 삭제</button>
                    <button onClick={() => { setEditingColId(col.id); setEditingColTitle(col.title); }} style={{ color: "#64748b" }}>이름 바꾸기</button>
                  </div>
                </div>
              </div>

              {/* Add Task Button or Form */}
              {addingTaskColId === col.id ? (
                <div style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }}>
                  <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} 
                    placeholder="새로운 프로젝트 이름을 입력하세요" 
                    style={{ width: "100%", border: "none", outline: "none", fontSize: "0.9rem", marginBottom: 8 }}
                    onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addTask(col.id); if (e.key === "Escape") setAddingTaskColId(null); }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button onClick={() => setAddingTaskColId(null)} style={{ padding: "4px 8px", fontSize: "0.8rem", color: "#64748b", background: "transparent", border: "none", cursor: "pointer" }}>취소</button>
                    <button onClick={() => addTask(col.id)} style={{ padding: "4px 10px", fontSize: "0.8rem", color: "white", background: "#3b82f6", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: 500 }}>등록</button>
                  </div>
                </div>
              ) : (
                <div className="add-task-btn" onClick={() => { setAddingTaskColId(col.id); setNewTaskTitle(""); }}>
                  <Plus size={16} /> 새 업무
                </div>
              )}

              {/* Task List */}
              <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 20, outline: dragOverColId === col.id ? "2px dashed #93c5fd" : "none", borderRadius: 8 }} className="kanban-scroll">
                {colTasks.map(task => {
                  const project = projects.find(p => p.id === task.project_id);
                  const displayTitle = project ? project.label : task.title;
                  const displayColor = project?.color || '#3b82f6';
                  
                  return (
                  <div key={task.id} className="task-card" draggable 
                    onClick={() => project && openModal(task, project)}
                    onDragStart={e => onTaskDragStart(e, task.id)}
                    onDragEnd={onTaskDragEnd}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                    onDrop={e => onTaskDrop(e, task.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className={`badge ${task.status === 'Done' ? 'done' : 'todo'}`}>{task.status}</span>
                        <span className={`badge priority ${task.priority === '높음' ? 'high' : ''}`}>
                          {task.priority === '높음' ? '↑ 높음' : '− 보통'}
                        </span>
                      </div>
                      <div onClick={e => e.stopPropagation()} className="dots-menu">
                        <MoreVertical size={16} color="#94a3b8" style={{ cursor: "pointer" }} />
                        <div className="dots-dropdown" style={{ top: 16 }}>
                          <button onClick={(e) => deleteTask(e, task.id)} style={{ color: "#ef4444" }}>삭제</button>
                        </div>
                      </div>
                    </div>

                    <div className="task-title">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: displayColor }} />
                      <span>{displayTitle}</span>
                    </div>
                    
                    {task.date_range && <div className="task-date">{task.date_range}</div>}
                    
                    {/* Bottom row: avatars + icons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <div style={{ display: "flex" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "0.7rem", fontWeight: 600, border: "2px solid white" }}>U</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, color: "#94a3b8" }}>
                        <Paperclip size={14} />
                        <MessageSquare size={14} />
                        <CheckIcon size={14} />
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          );
        })}

        {/* Add Column */}
        <div className="kanban-col">
          <div style={{ background: "rgba(255,255,255,0.6)", border: "1px dashed #cbd5e1", borderRadius: 8, padding: 12 }}>
            <input value={newColTitle} onChange={e => setNewColTitle(e.target.value)} 
              placeholder="새 카테고리 (Column) 추가..." 
              style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "0.9rem", color: "#475569" }}
              onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addColumn(); }}
            />
          </div>
        </div>
      </div>

      {/* Task/Project Modal */}
      {selectedTask && (() => {
        const project = projects.find(p => p.id === selectedTask.project_id);
        const displayTitle = project ? project.label : selectedTask.title;
        return (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-content" onMouseDown={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: project?.color || "#3b82f6" }} />
                  <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>{displayTitle}</h2>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => { closeModal(); if(project) navigateToProject(project.id); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>
                    <ExternalLink size={14} /> 바로가기
                  </button>
                  <button onClick={closeModal} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "0", flex: 1, display: "flex", minHeight: 400 }}>
                {/* Left: Overview (Memo) */}
                <div style={{ flex: 1, padding: "24px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1rem", color: "#334155", marginBottom: 16 }}>프로젝트 개요</h3>
                  <textarea 
                    value={projectMemo}
                    onChange={e => setProjectMemo(e.target.value)}
                    onBlur={saveProjectMemo}
                    placeholder="프로젝트와 관련된 개요나 메모를 여기에 작성하세요..."
                    style={{ flex: 1, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 12, resize: "none", fontSize: "0.95rem", color: "#1e293b", outlineColor: "#3b82f6" }}
                  />
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 8 }}>입력 후 바깥을 클릭하면 자동 저장됩니다.</div>
                </div>

                {/* Right: Comments */}
                <div style={{ width: 280, padding: "24px", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1rem", color: "#334155", marginBottom: 16 }}>댓글 및 알림</h3>
                  <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, paddingRight: 4 }}>
                    {modalComments.length === 0 && <div style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", marginTop: 20 }}>작성된 댓글이 없습니다.</div>}
                    {modalComments.map((m: any) => (
                      <div key={m.id} style={{ background: "white", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#334155", display: "flex", justifyContent: "space-between" }}>
                        <span style={{flex: 1, wordBreak: "break-all"}}>{m.text}</span>
                        <X size={14} color="#ef4444" style={{cursor: "pointer", flexShrink: 0, marginLeft: 8}} onClick={() => removeModalComment(m.id)} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input 
                      value={newModalComment} onChange={e => setNewModalComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addModalComment(); }}
                      placeholder="댓글 추가..."
                      style={{ flex: 1, width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, outline: "none", fontSize: "0.9rem" }}
                    />
                    <button onClick={addModalComment} style={{ padding: "0 12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
