"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, MoreVertical, Paperclip, MessageSquare, CheckSquare as CheckIcon, X } from "lucide-react";

type Column = { id: string; board_id: string; title: string; sort_order: number };
type Task = { 
  id: string; column_id: string; title: string; 
  status: string; priority: string; date_range: string; 
  assignees: string; image_url: string; sort_order: number;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default function Dashboard({ boardId = '__default__' }: { boardId?: string }) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newColTitle, setNewColTitle] = useState("");
  const [addingTaskColId, setAddingTaskColId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const dragTaskId = useRef<string | null>(null);
  const dragColId = useRef<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

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
    const t: Task = { 
      id: uid(), column_id: columnId, title: newTaskTitle.trim(), 
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

  const deleteTask = async (id: string) => {
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

    // We drop it at the end of the target column
    const draggedTask = tasks.find(t => t.id === draggedId);
    if (!draggedTask) return;

    // If same column and dropped on column background, do nothing 
    // (We handle exact ordering in onTaskDrop when dropping on a specific task)
    if (draggedTask.column_id === targetColId) return;

    const newTasks = [...tasks];
    const taskIdx = newTasks.findIndex(t => t.id === draggedId);
    newTasks[taskIdx] = { ...newTasks[taskIdx], column_id: targetColId };
    
    // Re-calc sort_order for the target column
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
    e.stopPropagation(); // prevent column drop
    setDragOverColId(null);
    
    const draggedId = dragTaskId.current;
    if (!draggedId || draggedId === targetTaskId) return;

    const newTasks = [...tasks];
    const srcIdx = newTasks.findIndex(t => t.id === draggedId);
    let dstIdx = newTasks.findIndex(t => t.id === targetTaskId);
    
    if (srcIdx === -1 || dstIdx === -1) return;

    const sourceColId = newTasks[srcIdx].column_id;
    const targetColId = newTasks[dstIdx].column_id;

    // Move array item
    const [moved] = newTasks.splice(srcIdx, 1);
    moved.column_id = targetColId;
    
    // Recalculate dstIdx because splice might have shifted it
    if (sourceColId === targetColId && srcIdx < dstIdx) {
      dstIdx -= 1;
    }
    
    // We drop it *before* the target task, or after depending on drop. Let's just drop before for simplicity:
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

  if (loading) {
    return <div style={{ padding: 40, color: "#94a3b8" }}>보드 불러오는 중...</div>;
  }

  return (
    <div style={{
      width: "100%", height: "100%", padding: "24px 28px",
      background: "#f1f5f9", display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif", overflow: "hidden"
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
        .task-title { font-size: 0.95rem; font-weight: 600; color: #1e293b; line-height: 1.4; }
        .task-date { font-size: 0.8rem; color: #ef4444; font-weight: 500; }
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "1rem" }}>{col.title}</span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                    {colTasks.length}
                  </span>
                </div>
                <div style={{ position: "relative" }} className="group">
                  <MoreVertical size={16} color="#94a3b8" style={{ cursor: "pointer" }} />
                  {/* Basic delete for now */}
                  <div style={{ position: "absolute", right: 0, top: 20, display: "none", background: "white", border: "1px solid #e2e8f0", borderRadius: 4, padding: "4px 0", zIndex: 10, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} className="group-hover:block">
                    <button onClick={() => deleteColumn(col.id)} style={{ padding: "6px 16px", color: "#ef4444", fontSize: "0.85rem", width: "100%", textAlign: "left", whiteSpace: "nowrap", border: "none", background: "transparent", cursor: "pointer" }}>삭제</button>
                  </div>
                </div>
              </div>

              {/* Add Task Button or Form */}
              {addingTaskColId === col.id ? (
                <div style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }}>
                  <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} 
                    placeholder="업무 내용을 입력하세요" 
                    style={{ width: "100%", border: "none", outline: "none", fontSize: "0.9rem", marginBottom: 8 }}
                    onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addTask(col.id); if (e.key === "Escape") setAddingTaskColId(null); }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button onClick={() => setAddingTaskColId(null)} style={{ padding: "4px 8px", fontSize: "0.8rem", color: "#64748b", background: "transparent", border: "none", cursor: "pointer" }}>취소</button>
                    <button onClick={() => addTask(col.id)} style={{ padding: "4px 10px", fontSize: "0.8rem", color: "white", background: "#3b82f6", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: 500 }}>추가</button>
                  </div>
                </div>
              ) : (
                <div className="add-task-btn" onClick={() => { setAddingTaskColId(col.id); setNewTaskTitle(""); }}>
                  <Plus size={16} /> 새 업무
                </div>
              )}

              {/* Task List */}
              <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 20, outline: dragOverColId === col.id ? "2px dashed #93c5fd" : "none", borderRadius: 8 }} className="kanban-scroll">
                {colTasks.map(task => (
                  <div key={task.id} className="task-card" draggable 
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
                      <button onClick={() => deleteTask(task.id)} style={{ padding: 2, background: "transparent", border: "none", cursor: "pointer", color: "#cbd5e1" }}>
                        <X size={14} />
                      </button>
                    </div>

                    <div className="task-title">{task.title}</div>
                    
                    {task.date_range && <div className="task-date">{task.date_range}</div>}
                    
                    {/* Bottom row: avatars + icons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <div style={{ display: "flex" }}>
                        {/* Placeholder avatar */}
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "0.7rem", fontWeight: 600, border: "2px solid white" }}>
                          U
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, color: "#94a3b8" }}>
                        <Paperclip size={14} />
                        <MessageSquare size={14} />
                        <CheckIcon size={14} />
                      </div>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
