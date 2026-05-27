import { useState, useRef } from "react";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown"
import { BsFillPersonFill } from "react-icons/bs";
 
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
function DefaultProfileIcon() {
    return <BsFillPersonFill size={130} className="text-gray-600" />;
}
 
function RouteCard({ date, route }) {
  return (
    <div
      className="flex items-center bg-beige-300 rounded-lg px-6 py-4"
    >
      <span
        className="title-h4 text-gray-1000 w-28 shrink-0"
      >
        {date}
      </span>
      <span
        className="body-lg text-gray-1000 flex-1"
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
        className="bg-blue-300 relative w-[400px] rounded-xl px-10 py-8"
      > 
        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="bg-blue-100 w-40 h-40 rounded-full flex items-center justify-center overflow-hidden mb-3 cursor-pointer"
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
        <div className="flex flex-col gap-4 items-center">
          <p className="body-xl text-gray-1000">
            mail: lion@example.com
          </p>
          <p className="body-xl text-gray-1000">
            phone: 010-0000-0000
          </p>
        </div>
        {/* 하단 버튼 */}
        <div className="flex justify-between mt-8">
          <Button
            text="닫기"
            onClick={onClose}
            bgColor="var(--color-blue-500)"
            textColor="var(--color-blue-100)"
            className="h-12 px-8 py-3 body-md"
          />
          <Button
            text="완료"
            onClick={onClose}
            bgColor="var(--color-blue-500)"
            textColor="var(--color-blue-100)"
            className="h-12 px-8 py-3 body-md"
          />
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
        className="relative bg-blue-300 w-[400px] rounded-xl px-10 py-8 flex flex-col"
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
            className="body-xl text-gray-100 whitespace-nowrap"
          >
            분 전 알림
          </span>
        </div>
 
        {/* 하단 버튼 */}
        <div className="flex justify-between mt-8">
          <Button
            text="닫기"
            onClick={onClose}
            bgColor="var(--color-blue-500)"
            textColor="var(--color-blue-100)"
            className="h-12 px-8 py-3 body-md"
          />
          <Button
            text="완료"
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
            className="bg-blue-100 w-48 h-48 rounded-full flex items-center justify-center overflow-hidden mb-4"
          >
            {profileImage ? (
              <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <DefaultProfileIcon size={80} />
            )}
          </div>
 
          {/* 사용자 이름 */}
          <p
            className="title-h4 text-blue-900 mb-8"
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
        <div className="flex-1 bg-blue-100 rounded-lg">
          <div className="border border-gray-200 rounded-lg px-10 py-8">
            <h2
              className="title-h2 text-gray-1000 mb-6"
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