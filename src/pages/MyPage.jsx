import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown"
 
const routeHistory = [
  { id: 1, date: "26.05.03", route: "한국외대 글로벌 캠퍼스 백년관 → 모란역 6번 출구" },
  { id: 2, date: "26.05.02", route: "수서역 1번 출구 → 성수역 3번 출구" },
  { id: 3, date: "26.05.01", route: "오리역 4번 출구 → 삼성역 9번 출구" },
];

const timeOptions = [
  { index: 0, value: "5"},
  { index: 1, value: "10"},
  { index: 2, value: "15"}
]
function DefaultProfileIcon({ size = 80 }) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.33333 99.3127C8.33333 99.3127 0 99.3127 0 91.0367C0 82.7606 8.33334 57.9324 50 57.9324C91.6667 57.9324 100 82.7606 100 91.0367C100 99.3127 91.6667 99.3127 91.6667 99.3127H8.33333ZM50 49.6564C56.6304 49.6564 62.9893 47.0405 67.6777 42.3843C72.3661 37.7282 75 31.413 75 24.8282C75 18.2433 72.3661 11.9282 67.6777 7.27201C62.9893 2.61582 56.6304 0 50 0C43.3696 0 37.0107 2.61582 32.3223 7.27201C27.6339 11.9282 25 18.2433 25 24.8282C25 31.413 27.6339 37.7282 32.3223 42.3843C37.0107 47.0405 43.3696 49.6564 50 49.6564Z" fill="#7E898C"/>
    </svg>

  );
}
 
function RouteCard({ date, route }) {
  return (
    <div
      className="flex items-center rounded-lg px-6 py-4"
      style={{ backgroundColor: "rgba(237, 228, 214, 1)" }}
    >
      <span
        className="title-h4 w-28 shrink-0"
        style={{ color: "rgba(48, 84, 92, 1)" }}
      >
        {date}
      </span>
      <span
        className="body-lg flex-1"
        style={{ color: "rgba(48, 84, 92, 1)" }}
      >
        {route}
      </span>
    </div>
  );
}

function UserInfoModal({ isOpen, onClose, profileImage, onProfileChange }) {
  const fileInputRef = useRef(null);
 
  if (!isOpen) return null;
 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onProfileChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
 
   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
 
      {/* 모달 */}
      <div
        className="relative w-[400px] rounded-xl px-10 py-8"
        style={{ backgroundColor: "rgba(168, 205, 213, 0.95)" }}
      >
        {/* 상단 버튼 */}
        <div className="flex justify-between items-center mb-8">
          {/* X 닫기 버튼 */}
          <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
 
          {/* ✓ 확인 버튼 */}
          <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12L10 17L20 7" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
 
        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden mb-3 cursor-pointer"
            style={{ backgroundColor: "rgba(232, 244, 247, 1)" }}
            onClick={() => fileInputRef.current.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <DefaultProfileIcon size={80} />
            )}
          </div>
          <button
            className="body-sm text-white hover:underline"
            onClick={() => fileInputRef.current.click()}
          >
            프로필 사진 변경
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
 
        {/* 사용자 정보 */}
        <div className="flex flex-col gap-4">
          <p className="body-xl" style={{ color: "rgba(0, 0, 0, 1)" }}>
            mail: lion@example.com
          </p>
          <p className="body-xl" style={{ color: "rgba(0, 0, 0, 1)" }}>
            phone: 010-0000-0000
          </p>
        </div>
      </div>
    </div>
  );
}
 
function AlarmSettingModal({ isOpen, onClose }){
  const [ selectedTime, setSelectedTime ] = useState("");

  if(!isOpen) return null;

  const handleSave = () => {
    if (selectedTime) {
      alert(`${selectedTime}분 전 알림이 설정되었습니다.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-[400px] rounded-xl px-10 py-8 flex flex-col"
        style={{ backgroundColor: "rgba(168, 205, 213, 0.95)", minHeight: "400px" }}
      >
        {/* 드롭다운 + 라벨 */}
        <div className="flex items-center gap-4 mb-auto">
          <Dropdown
            options={timeOptions}
            value={selectedTime}
            onChange={(option) => setSelectedTime(option.value)}
            placeholder="시간을 선택하세요"
            width="w-52"
          />
          <span
            className="body-xl whitespace-nowrap"
            style={{ color: "rgba(79, 128, 144, 1)" }}
          >
            분 전 알림
          </span>
        </div>
 
        {/* 하단 버튼 */}
        <div className="flex justify-between mt-8">
          <Button
            text="취소"
            onClick={onClose}
            bgColor="var(--color-blue-500)"
            textColor="var(--color-blue-100)"
            className="h-12 px-8 py-3 body-md"
          />
          <Button
            text="설정"
            onClick={handleSave}
            bgColor="var(--color-blue-500)"
            textColor="var(--color-blue-100)"
            className="h-12 px-8 py-3 body-md"
          />
        </div>
      </div>
    </div>
  );
};


export default function MyPage() {
  const navigate = useNavigate();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showAlarmSetting, setShowAlarmSetting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      {/* 제목 */}
      <div className="px-16 pt-8 pb-6">
        <h1 className="title-display text-blue-700">MY PAGE</h1>
      </div>
 
      {/* 콘텐츠 */}
      <div className="px-16 flex gap-12">
        {/* 왼쪽: 프로필 */}
        <div className="flex flex-col items-center w-60 shrink-0">
          {/* 프로필 이미지 */}
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center overflow-hidden mb-4"
            style={{ backgroundColor: "rgba(232, 244, 247, 1)" }}
          >
            {profileImage ? (
              <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <DefaultProfileIcon size={80} />
            )}
          </div>
 
          {/* 사용자 이름 */}
          <p
            className="title-h4 mb-8"
            style={{ color: "rgba(48, 84, 92, 1)" }}
          >
            사용자
          </p>
 
          {/* 버튼들 */}
          <div className="flex flex-col gap-4 w-full">
            <Button
              text="사용자 정보"
              onClick={() => setShowUserInfo(true)}
              className="p-3 shrink-0"
            />
            <Button
              text="알림 설정"
              onClick={() => setShowAlarmSetting(true)}
              className="p-3 shrink-0"
            />
          </div>
        </div>
 
        {/* 오른쪽: 지난 경로 기록 */}
        <div className="flex-1">
          <div className="border border-gray-200 rounded-xl px-10 py-8">
            <h2
              className="title-h2 mb-6"
              style={{ color: "rgba(48, 84, 92, 1)" }}
            >
              지난 경로 기록
            </h2>
            <div className="flex flex-col gap-4">
              {routeHistory.map((item) => (
                <RouteCard
                  key={item.id}
                  date={item.date}
                  route={item.route}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* 사용자 정보 모달 */}
      <UserInfoModal
        isOpen={showUserInfo}
        onClose={() => setShowUserInfo(false)}
        profileImage={profileImage}
        onProfileChange={setProfileImage}
      />
      {/* 알람 설정 모달 */}
      <AlarmSettingModal
        isOpen={showAlarmSetting}
        onClose={() => setShowAlarmSetting(false)}
      />
    </div>
  );
}