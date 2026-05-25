import { useState } from "react";
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
    <svg width="32" height="32" viewBox="0 0 32 32" fill="rgba(196, 220, 225, 1)" xmlns="http://www.w3.org/2000/svg">
      <path d="M31.5883 10.8993L21.1024 0.412821C20.8258 0.136188 20.4641 0 20.1024 0C19.7406 0 19.3789 0.136188 19.1023 0.412821L12.2465 7.27331C11.7273 7.21372 11.2039 7.18819 10.6805 7.18819C7.56534 7.18819 4.45024 8.21386 1.89261 10.2652C1.73773 10.3896 1.61079 10.5452 1.52005 10.7219C1.42931 10.8986 1.37681 11.0924 1.36597 11.2908C1.35513 11.4891 1.38619 11.6875 1.45714 11.873C1.52808 12.0586 1.63731 12.2271 1.77771 12.3676L9.51016 20.1005L0.343571 29.2592C0.231243 29.3708 0.161918 29.5185 0.147813 29.6763L0.00312233 31.2595C-0.0351782 31.6595 0.283992 32 0.679764 32C0.701042 32 0.72232 32 0.743598 31.9957L2.32669 31.851C2.48414 31.8383 2.63309 31.7659 2.74374 31.6553L11.9103 22.4881L19.6428 30.221C19.9194 30.4977 20.2811 30.6339 20.6428 30.6339C21.0556 30.6339 21.4642 30.4551 21.745 30.1061C24.141 27.1142 25.1368 23.3691 24.7325 19.7473L31.5883 12.8911C32.1372 12.3463 32.1372 11.4526 31.5883 10.8993ZM22.5621 17.5896L21.5195 18.6323L21.6812 20.0963C21.9348 22.3607 21.483 24.6482 20.3875 26.6461L5.36094 11.6101C5.90991 11.3079 6.48016 11.0525 7.07595 10.8483C8.23347 10.4482 9.44632 10.2482 10.6805 10.2482C11.089 10.2482 11.5018 10.2695 11.9103 10.3163L13.3743 10.478L14.4169 9.4353L20.1066 3.74518L28.2561 11.8952L22.5621 17.5896Z" fill="rgba(196, 220, 225, 1)" />
    </svg>
  ) : (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M31.5883 10.8993L21.1024 0.412821C20.8258 0.136188 20.4641 0 20.1024 0C19.7406 0 19.3789 0.136188 19.1023 0.412821L12.2465 7.27331C11.7273 7.21372 11.2039 7.18819 10.6805 7.18819C7.56534 7.18819 4.45024 8.21386 1.89261 10.2652C1.73773 10.3896 1.61079 10.5452 1.52005 10.7219C1.42931 10.8986 1.37681 11.0924 1.36597 11.2908C1.35513 11.4891 1.38619 11.6875 1.45714 11.873C1.52808 12.0586 1.63731 12.2271 1.77771 12.3676L9.51016 20.1005L0.343571 29.2592C0.231243 29.3708 0.161918 29.5185 0.147813 29.6763L0.00312233 31.2595C-0.0351782 31.6595 0.283992 32 0.679764 32C0.701042 32 0.72232 32 0.743598 31.9957L2.32669 31.851C2.48414 31.8383 2.63309 31.7659 2.74374 31.6553L11.9103 22.4881L19.6428 30.221C19.9194 30.4977 20.2811 30.6339 20.6428 30.6339C21.0556 30.6339 21.4642 30.4551 21.745 30.1061C24.141 27.1142 25.1368 23.3691 24.7325 19.7473L31.5883 12.8911C32.1372 12.3463 32.1372 11.4526 31.5883 10.8993ZM22.5621 17.5896L21.5195 18.6323L21.6812 20.0963C21.9348 22.3607 21.483 24.6482 20.3875 26.6461L5.36094 11.6101C5.90991 11.3079 6.48016 11.0525 7.07595 10.8483C8.23347 10.4482 9.44632 10.2482 10.6805 10.2482C11.089 10.2482 11.5018 10.2695 11.9103 10.3163L13.3743 10.478L14.4169 9.4353L20.1066 3.74518L28.2561 11.8952L22.5621 17.5896Z" fill="rgba(196, 220, 225, 1)" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.00058 33.8187C3.30255 33.9534 3.64159 34.015 3.98132 33.9969C4.32105 33.9789 4.64863 33.8819 4.92891 33.7164L29.1964 19.3169C29.4443 19.1697 29.647 18.9731 29.7869 18.7441C29.9269 18.515 30 18.2603 30 18.0018C30 17.7432 29.9269 17.4885 29.7869 17.2595C29.647 17.0304 29.4443 16.8339 29.1964 16.6866L4.92891 2.28718C4.64916 2.11991 4.3212 2.02168 3.98079 2.0032C3.64037 1.98471 3.30057 2.04668 2.99843 2.18235C2.69629 2.31802 2.44341 2.52218 2.26735 2.77257C2.09129 3.02297 1.99882 3.30998 2.00001 3.60232V32.4012C1.99996 32.6933 2.09317 32.9797 2.26954 33.2296C2.44592 33.4795 2.69873 33.6832 3.00058 33.8187ZM5.73347 6.65661L24.8543 18.0018L5.73347 29.3469V6.65661Z" fill="none" stroke="rgba(79, 128, 144, 1)" strokeWidth="4" />
    </svg>
  );
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
        className={`flex-1 text-md bg-transparent border-none outline-none border-b border-teal-200 pb-0.5 placeholder-slate-400 ${item.checked ? "line-through text-slate-400" : ""}`}
        style={{ color: "rgba(48, 84, 92, 1)" }}
      />
      {showPin ? (
        <button
          onClick={() => onPin(item.id)}
          className="shrink-0 p-0.5 hover:opacity-80 transition-opacity"
        >
          <PinIcon active={false} />
        </button>
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
      <div className="flex flex-col items-center py-10" style={{ backgroundColor: 'rgba(232, 244, 247, 1)' }}>
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
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="여기에 목록을 추가하세요"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 body-sm text-blue-900 placeholder-gray-500 outline-none focus:border-blue-300 bg-blue-100"
          />
          <button
            onClick={addItem}
            className="w-11 h-11 bg-white border border-slate-300 rounded-lg text-gray-500 body-xl flex items-center justify-center hover:bg-blue-500 transition-colors"
          >
            +
          </button>
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
          <button
            onClick={deleteSelected}
            className="bg-blue-900 text-blue-100 rounded-lg px-6 py-3 text-body-md"
          >
            선택 삭제
          </button>
          <button
            onClick={saveList}
            className="bg-blue-900 text-blue-100 rounded-lg px-6 py-3 text-body-md"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}