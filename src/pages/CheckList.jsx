import { useState } from "react";
import { AiOutlinePushpin, AiFillPushpin } from "react-icons/ai";
import { BsFillPlayFill } from "react-icons/bs";
import Input from "../components/Input";
import Button from "../components/Button";


const initialTodos = [
  { id: 1, label: "", checked: false },
  { id: 2, label: "", checked: false },
  { id: 3, label: "", checked: false },
];

const initialMustdos = [
  { id: 4, label: "", checked: false },
];

let nextId = 5;

function PinIcon({ active }) {
  return active ? (
    <AiFillPushpin size={32} className="text-blue-300" />
  ) : (
    <AiOutlinePushpin size={32} className="text-blue-300" />
  );
}

function PlayIcon() {
  return <BsFillPlayFill size={40} className="text-gray-600" />;
}

function CheckItem({ item, onToggle, onLabelChange, onDelete, onPin, showPin = true }) {
  return (
    <div className="flex items-center gap-2 last:border-none">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id)}
        className="w-6 h-6 accent-teal-700 shrink-0 cursor-pointer"
      />
      <input
        type="text"
        value={item.label}
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
  const [todos, setTodos] = useState(initialTodos);
  const [mustdos, setMustdos] = useState(initialMustdos);
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    const label = newItem.trim();
    if (!label) return;  // list → label
    setTodos((prev) => [...prev, { id: nextId++, label, checked: false }]);
    setNewItem("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addItem();
  };

  const toggleTodo = (id) =>
    setTodos((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

  const toggleMust = (id) =>
    setMustdos((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

  const updateTodoLabel = (id, val) =>
    setTodos((prev) => prev.map((i) => (i.id === id ? { ...i, label: val } : i)));

  const updateMustLabel = (id, val) =>
    setMustdos((prev) => prev.map((i) => (i.id === id ? { ...i, label: val } : i)));

  const pinItem = (id) => {
    const item = todos.find((i) => i.id === id);
    if (!item) return;
    setTodos((prev) => prev.filter((i) => i.id !== id));
    setMustdos((prev) => [...prev, { id: item.id, label: item.label, checked: item.checked }]);
  };

  const deleteSelected = () => {
    setTodos((prev) => prev.filter((i) => !i.checked));
    setMustdos((prev) => prev.filter((i) => !i.checked));
  };

  const saveList = () => {
    alert("저장되었습니다!");
  };

  const deleteTodo = (id) => setTodos((prev) => prev.filter((i) => i.id !== id));
  const deleteMust = (id) => setMustdos((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="min-h-screen bg-white">
      {/* 제목 박스 */}
      <div className="bg-blue-100 flex flex-col items-center py-10">
        <div className="w-full max-w-[1200px] px-12">
          <p className="body-sm text-blue-900 mb-3">CheckList</p>
          <h1 className="title-h1 text-blue-700 mb-3">
            체크<br />리스트
          </h1>
          <p className="body-sm text-blue-900 mb-3">
            오늘 해야할 일들을 정리해보세요.<br />
            반드시 해야하거나 우선적으로 해야할 일들은 핀버튼을 통해 고정시켜보세요.
          </p>
        </div>
      </div>

      <div className="px-12 py-7">
      {/* 목록 추가 버튼 */}
      <div className="flex gap-2 mb-5">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="여기에 목록을 추가하세요"
          width="w-full"
        />
        <Button
          text="+"
          onClick={addItem}
          bgColor="var(--color-blue-100)"
          textColor="var(--color-gray-500)"
          className="border-[1.5px] border-gray-300 text-gray-500 bg-100 w-11 h-11 body-xl"
        />
      </div>

        {/* Panels */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* To-Do */}
          <div className="bg-gray-100 rounded-lg border border-gray-300 px-8 py-6 min-h-[450px]">
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
          <div className="bg-gray-100 rounded-lg border border-gray-300 px-8 py-6 min-h-[450px]">
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
            text="저장하기"
            onClick={saveList}
          />
        </div>
      </div>
    </div>
  );
}