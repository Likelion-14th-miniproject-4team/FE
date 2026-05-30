import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { getRoutines, createRoutine, updateRoutine, deleteRoutine, reorderRoutine } from "../api/api";

// 루틴 이름 (고정 - 사용자당 루틴 1개 구조)
const ROUTINE_NAME = "나의 준비 루틴";

export default function CustomRoutine() {
  const navigate = useNavigate();

  const [routineId, setRoutineId] = useState(null); // 루틴 ID
  const [items, setItems] = useState([]);            // 루틴 항목들
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [newTime, setNewTime] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editTime, setEditTime] = useState(0);

  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const totalTime = items.reduce((sum, r) => sum + r.duration_min, 0);
  const padId = (n) => String(n).padStart(2, "0");

  // 루틴 불러오기
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const data = await getRoutines();
        if (data && data.length > 0) {
          // 첫 번째 루틴 사용
          setRoutineId(data[0].id);
          // 상세 정보는 items에서 가져옴
          setItems(data[0].items ?? []);
        }
      } catch (err) {
        console.error("루틴 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  // 항목 추가
  const handleAdd = async () => {
    if (!newLabel.trim() || newTime <= 0) return;
    const newItem = { name: newLabel.trim(), duration_min: newTime };
    try {
      if (routineId) {
        // 기존 루틴 업데이트
        const updated = await updateRoutine(routineId, {
          name: ROUTINE_NAME,
          items: [...items.map((i) => ({ name: i.name, duration_min: i.duration_min })), newItem],
          active: true,
        });
        setItems(updated.items ?? []);
      } else {
        // 루틴 최초 생성
        const created = await createRoutine({
          name: ROUTINE_NAME,
          items: [newItem],
        });
        setRoutineId(created.id);
        setItems(created.items ?? []);
      }
      setNewLabel("");
      setNewTime(0);
    } catch (err) {
      console.error("루틴 추가 실패", err);
    }
  };

  // 항목 삭제
  const handleDelete = async (id) => {
    const filtered = items.filter((r) => r.id !== id);
    try {
      const updated = await updateRoutine(routineId, {
        name: ROUTINE_NAME,
        items: filtered.map((i) => ({ name: i.name, duration_min: i.duration_min })),
        active: true,
      });
      setItems(updated.items ?? []);
    } catch (err) {
      console.error("루틴 삭제 실패", err);
    }
  };

  // 수정 시작
  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditLabel(item.name);
    setEditTime(item.duration_min);
  };

  // 수정 저장
  const handleEditSave = async (id) => {
    const updatedItems = items.map((r) =>
      r.id === id ? { ...r, name: editLabel.trim() || r.name, duration_min: editTime } : r
    );
    try {
      const updated = await updateRoutine(routineId, {
        name: ROUTINE_NAME,
        items: updatedItems.map((i) => ({ name: i.name, duration_min: i.duration_min })),
        active: true,
      });
      setItems(updated.items ?? []);
      setEditingId(null);
    } catch (err) {
      console.error("루틴 수정 실패", err);
    }
  };

  // 드래그 앤 드롭
  const handleDragStart = (index) => { dragIndex.current = index; };
  const handleDragOver = (e, index) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDrop = async (index) => {
    const from = dragIndex.current;
    if (from === null || from === index) { setDragOverIndex(null); return; }

    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(index, 0, moved);
    setItems(updated);

    try {
      await reorderRoutine(moved.id, { sort_order: index });
    } catch (err) {
      console.error("순서 변경 실패", err);
    }

    dragIndex.current = null;
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { dragIndex.current = null; setDragOverIndex(null); };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="body-md text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-blue-100 py-10">
        <div className="max-w-xl mx-auto px-4">
          <p className="body-sm text-blue-500 mb-1">Custom Routine</p>
          <h1 className="title-h2 text-blue-900 leading-tight mb-3">
            준비 단계<br />설정
          </h1>
          <p className="body-sm text-gray-500">하루를 계획 있게 시작하세요.</p>
          <p className="body-sm text-gray-500">단계를 추가하고 드래그로 순서를 조정할 수 있어요.</p>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* 새 단계 추가 */}
        <div className="mb-6">
          <p className="body-sm text-blue-900 mb-2">새 단계 추가</p>
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
          <p className="body-sm text-blue-900 mb-3">단계 목록</p>
          <div className="flex flex-col">
            {items.map((item, index) => (
              <div
                key={item.id}
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
                  {padId(index + 1)}
                </span>

                {/* 이름 */}
                {editingId === item.id ? (
                  <Input
                    id="editLabel"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    width="flex-1"
                  />
                ) : (
                  <span className="flex-1 body-md text-blue-900">{item.name}</span>
                )}

                {/* 시간 */}
                {editingId === item.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      id="editTime"
                      type="number"
                      value={editTime}
                      onChange={(e) => setEditTime(Number(e.target.value))}
                      width="w-16"
                    />
                    <span className="body-sm text-gray-500">분</span>
                  </div>
                ) : (
                  <span className="body-sm text-gray-600 shrink-0">{item.duration_min} 분</span>
                )}

                {/* 버튼 */}
                {editingId === item.id ? (
                  <Button
                    text="저장"
                    onClick={() => handleEditSave(item.id)}
                    className="body-xs px-3 py-1 rounded-lg"
                  />
                ) : (
                  <button
                    onClick={() => handleEditStart(item)}
                    className="body-xs text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    수정
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="body-xs text-gray-400 hover:text-red-500 transition cursor-pointer"
                >
                  삭제
                </button>
              </div>
            ))}

            {items.length === 0 && (
              <p className="body-sm text-gray-400 py-6 text-center">
                아직 추가된 단계가 없어요. 위에서 추가해보세요!
              </p>
            )}
          </div>
        </div>

        {/* 하단 요약 + 완료 버튼 */}
        <div className="flex items-center justify-between">
          <span className="body-sm text-gray-500">
            <span className="text-blue-900">{items.length}개 단계</span>
            &nbsp;&nbsp;총 {totalTime}분 소요
          </span>
          <Button text="완료 →" onClick={() => navigate("/route")} />
        </div>
      </div>
    </div>
  );
}