import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";

export default function CustomRoutine() {
  const navigate = useNavigate();

  const [routines, setRoutines] = useState([
    { id: "01", label: "아침 식사", time: 20 },
    { id: "02", label: "준비하기", time: 30 },
    { id: "03", label: "짐 챙기기", time: 10 },
  ]);

  const [newLabel, setNewLabel] = useState("");
  const [newTime, setNewTime] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editTime, setEditTime] = useState(0);

  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const totalTime = routines.reduce((sum, r) => sum + r.time, 0);
  const padId = (n) => String(n).padStart(2, "0");

  const handleAdd = () => {
    if (!newLabel.trim() || newTime <= 0) return;
    const newId = padId(routines.length + 1);
    setRoutines((prev) => [...prev, { id: newId, label: newLabel.trim(), time: newTime }]);
    setNewLabel("");
    setNewTime(0);
  };

  const handleDelete = (id) => {
    setRoutines((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.map((r, i) => ({ ...r, id: padId(i + 1) }));
    });
  };

  const handleEditStart = (routine) => {
    setEditingId(routine.id);
    setEditLabel(routine.label);
    setEditTime(routine.time);
  };

  const handleEditSave = (id) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, label: editLabel.trim() || r.label, time: editTime } : r
      )
    );
    setEditingId(null);
  };

  const handleDragStart = (index) => { dragIndex.current = index; };
  const handleDragOver = (e, index) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDrop = (index) => {
    const from = dragIndex.current;
    if (from === null || from === index) { setDragOverIndex(null); return; }
    setRoutines((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(index, 0, moved);
      return updated.map((r, i) => ({ ...r, id: padId(i + 1) }));
    });
    dragIndex.current = null;
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { dragIndex.current = null; setDragOverIndex(null); };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-blue-100 px-16 py-10">
        <div className="max-w-xl mx-auto">
          <p className="body-sm text-blue-500 mb-1">Custom Routine</p>
          <h1 className="title-h2 text-blue-900 leading-tight">준비 단계</h1>
          <h1 className="title-h2 text-blue-900 leading-tight mb-3">설정</h1>
          <p className="body-sm text-gray-500">하루를 계획 있게 시작하세요.</p>
          <p className="body-sm text-gray-500">단계를 추가하고 드래그로 순서를 조정할 수 있어요.</p>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* 새 단계 추가 */}
        <div className="mb-6">
          <p className="body-sm text-gray-500 mb-2">새 단계 추가</p>
          <div className="flex items-center gap-2">
            <Input
              id="newLabel"
              placeholder="단계 이름을 입력하세요"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              width="flex-1"
            />
            <Input
              id="newTime"
              type="number"
              value={newTime}
              onChange={(e) => setNewTime(Number(e.target.value))}
              width="w-16"
            />
            <span className="body-sm text-gray-500">분</span>
            <Button text="+" onClick={handleAdd} className="w-10 h-10 rounded-lg text-xl font-bold" />
          </div>
        </div>

        {/* 단계 목록 */}
        <div className="mb-8">
          <p className="body-sm text-gray-500 mb-3">단계 목록</p>
          <div className="flex flex-col">
            {routines.map((routine, index) => (
              <div
                key={routine.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 py-4 border-b border-gray-200 cursor-grab transition ${
                  dragOverIndex === index ? "bg-blue-100 rounded-lg px-2" : ""
                }`}
              >
                {/* 번호 */}
                <span className="body-sm text-gray-400 w-6 shrink-0 text-right">
                  {routine.id}
                </span>

                {/* 이름 */}
                {editingId === routine.id ? (
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEditSave(routine.id)}
                    className="flex-1 h-9 px-3 border-1.5 rounded-lg body-sm outline-none bg-blue-100 text-gray-900 border-blue-500"
                  />
                ) : (
                  <span className="flex-1 body-md text-blue-900">{routine.label}</span>
                )}

                {/* 시간 */}
                {editingId === routine.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={editTime}
                      onChange={(e) => setEditTime(Number(e.target.value))}
                      className="w-14 h-9 px-2 border-1.5 rounded-lg body-sm outline-none text-center bg-blue-100 text-gray-900 border-blue-500"
                    />
                    <span className="body-sm text-gray-500">분</span>
                  </div>
                ) : (
                  <span className="body-sm text-gray-600 shrink-0">{routine.time} 분</span>
                )}

                {/* 버튼 */}
                {editingId === routine.id ? (
                  <button
                    onClick={() => handleEditSave(routine.id)}
                    className="body-xs text-blue-900 border border-blue-300 rounded-lg px-3 py-1 hover:bg-blue-100 transition cursor-pointer"
                  >
                    저장
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditStart(routine)}
                    className="body-xs text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    수정
                  </button>
                )}
                <button
                  onClick={() => handleDelete(routine.id)}
                  className="body-xs text-gray-400 hover:text-red-500 transition cursor-pointer"
                >
                  삭제
                </button>
              </div>
            ))}

            {routines.length === 0 && (
              <p className="body-sm text-gray-400 py-6 text-center">
                아직 추가된 단계가 없어요. 위에서 추가해보세요!
              </p>
            )}
          </div>
        </div>

        {/* 하단 요약 + 완료 버튼 */}
        <div className="flex items-center justify-between">
          <span className="body-sm text-gray-500">
            <span className="text-blue-900">{routines.length}개 단계</span>
            &nbsp;&nbsp;총 {totalTime}분 소요
          </span>
          <Button text="완료 →" onClick={() => navigate("/route")} />
        </div>
      </div>
    </div>
  );
}