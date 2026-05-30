import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlinePushpin, AiFillPushpin } from "react-icons/ai";
import { BsFillPlayFill } from "react-icons/bs";
import Input from "../components/Input";
import Button from "../components/Button";
import { getChecklists, createChecklist, deleteChecklist, updateChecklist } from "../api/api"

const initialTodos = [
  { id: 1, title: "", checked: false },
  { id: 2, title: "", checked: false },
  { id: 3, title: "", checked: false },
];

const initialMustdos = [
  { id: 4, title: "", checked: false },
];

function PinIcon({ active }) {
  return active ? (
    <AiFillPushpin size={32} className="text-blue-300" />
  ) : (
    <AiOutlinePushpin size={32} className="text-blue-300" />
  );
}

function PlayIcon() {
  return <BsFillPlayFill size={40} className="text-blue-600" />;
}

function CheckItem({ item, onToggle, onLabelChange, onDelete, onPin, showPin = true }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id)}
        className="w-6 h-6 accent-teal-700 shrink-0 cursor-pointer"
      />
      <input
        type="text"
        value={item.title}
        placeholder="내용을 입력하세요..."
        onChange={(e) => onLabelChange(item.id, e.target.value)}
        className={`flex-1 body-md text-blue-900 bg-transparent outline-none border-0 border-b border-gray-300 pb-0.5 placeholder-slate-400 ${item.checked ? "line-through text-slate-400" : ""}`}
      />
      {showPin ? (
        <Button
          onClick={() => onPin(item.id)}
          className="shrink-0 p-0.5 hover:opacity-80 transition-opacity"
          bgColor="transparent"
          text={<PinIcon active={false} />}
        />
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}

export default function CheckList() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState(initialTodos);
  const [mustdos, setMustdos] = useState(initialMustdos);
  const [newItem, setNewItem] = useState("");

  // 페이지 로드 시 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getChecklists();
        const todos = res.filter((item) => !item.must_do);
        const mustdos = res.filter((item) => item.must_do);
        setTodos(todos);
        setMustdos(mustdos);
      } catch (err) {
        console.error("조회 실패:", err);
      }
    };
    fetchData();
  }, []);

  const addItem = async () => {
    const title = newItem.trim();
    if (!title) return;
    try {
      const res = await createChecklist({ title, checked: false });
      setTodos((prev) => [...prev, res]);
      setNewItem("");
    } catch (err) {
      console.error("추가 실패:", err);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addItem();
  };

  const toggleTodo = async (id) => {
    const item = todos.find((i) => i.id === id);
    try {
      await updateChecklist(id, { checked: !item.checked });
      setTodos((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
    } catch (err) {
      console.error("수정 실패:", err);
    }
  };
  const toggleMust = (id) =>
    setMustdos((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

  const updateTodoLabel = async (id, val) => {
    try {
      await updateChecklist(id, { title: val });
      setTodos((prev) => prev.map((i) => (i.id === id ? { ...i, title: val } : i)));
    } catch (err) {
      console.error("수정 실패:", err);
    }
  };

  const updateMustLabel = (id, val) =>
    setMustdos((prev) => prev.map((i) => (i.id === id ? { ...i, title: val } : i)));

  const pinItem = async (id) => {
    try {
      await updateChecklist(id, { fixed: true });
      const res =await getChecklists();
      const todos = res.filter((item) => !item.must_do);
      const mustdos = res.filter((item) => item.must_do);
      setTodos(todos);
      setMustdos(mustdos);
    } catch (err) {
      console.error("고정 실패:", err);
    }
  };

  const deleteSelected = async () => {
    try {
      const checkedTodos = todos.filter((i) => i.checked);
      const checkedMusts = mustdos.filter((i) => i.checked);
      await Promise.all([
        ...checkedTodos.map((i) => deleteChecklist(i.id)),
        ...checkedMusts.map((i) => deleteChecklist(i.id)),
      ]);
      setTodos((prev) => prev.filter((i) => !i.checked));
      setMustdos((prev) => prev.filter((i) => !i.checked));
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  }

  const deleteTodo = async (id) => {
    try {
      await deleteChecklist(id);
      setTodos((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  const deleteMust = async (id) => {
    try {
      await deleteChecklist(id);
      setMustdos((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  const goToRoute = () => {
    navigate("/route")
  };
  

  return (
    <div className="min-h-screen bg-white">
      {/* 제목 박스 */}
      <div className="bg-blue-100 px-16 py-10">
        <div className="max-w-xl mx-auto">
          <p className="body-sm text-blue-500 mb-1">CheckList</p>
          <h1 className="title-h2 text-blue-900 leading-tight mb-3">
            체크<br />리스트
          </h1>
          <p className="body-sm text-gray-500">
            오늘 해야할 일들을 정리해보세요.<br />
            반드시 해야하거나 우선적으로 해야할 일들은 핀버튼을 통해 고정시켜보세요.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px- py-8">
      {/* 목록 추가 */}
        <div className="mb-6 max-w-xl mx-auto">
          <p className="body-sm text-gray-500 mb-2">새 할 일 목록 추가</p>
            <div className="flex items-center gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="여기에 목록을 추가하세요"
                width="flex-1"
              />
              <Button text="+" onClick={addItem} className="w-10 h-10 rounded-lg text-xl font-bold" />
            </div>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* To-Do */}
          <div className="bg-gray-100 rounded-lg border border-gray-300 px-8 py-6 min-h-[600px]">
            <div className="flex items-center gap-2 mb-4">
              <PlayIcon />
              <span className="title-h3 text-blue-700">To-Do</span>
            </div>
            <div>
              {todos.map((item) => (
                <CheckItem
                  key={item.id}
                  item={item}
                  onToggle={toggleTodo}
                  onLabelChange={updateTodoLabel}
                  onDelete={deleteTodo}
                  onPin={pinItem}
                  showPin={true}
                />
              ))}
            </div>
          </div>

          {/* Must-Do */}
          <div className="bg-gray-100 rounded-lg border border-gray-300 px-8 py-6 min-h-[600px]">
            <div className="flex items-center gap-2 mb-4">
              <PlayIcon />
              <span className="title-h3 text-blue-700">Must-Do</span>
            </div>
            <div>
              {mustdos.map((item) => (
                <CheckItem
                  key={item.id}
                  item={item}
                  onToggle={toggleMust}
                  onLabelChange={updateMustLabel}
                  onDelete={deleteMust}
                  onPin={() => {}}
                  showPin={false}
                />
              ))}
            </div>
          </div>
        </div>
        {/* 선택 삭제 & 저장하기 버튼 */}
        <div className="flex justify-between">
          <Button
            text="선택 삭제"
            onClick={deleteSelected}
          />
          <Button
            text="완료하기"
            onClick={goToRoute}
          />
        </div>
      </div>
    </div>
  );
};