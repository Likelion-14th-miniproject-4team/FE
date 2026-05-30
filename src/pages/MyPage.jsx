import { useState, useRef, useEffect } from "react";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import { BsFillPersonFill } from "react-icons/bs";
import { getMe, updateMe, deleteMe, getRouteHistory, uploadProfileImage } from "../api/api";

const timeOptions = [
  { index: 0, value: "5" },
  { index: 1, value: "10" },
  { index: 2, value: "15" },
];

function DefaultProfileIcon() {
  return <BsFillPersonFill size={130} className="text-gray-600" />;
}

function RouteCard({ searched_at, origin, destination }) {
  const date = new Date(searched_at);
  const formatted = `${String(date.getFullYear()).slice(2)}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  return (
    <div className="flex items-center bg-beige-300 rounded-lg px-6 py-4">
      <span className="title-h4 text-gray-1000 w-28 shrink-0">
        {formatted}
      </span>
      <span className="body-lg text-gray-1000 flex-1">
        {origin} → {destination}
      </span>
    </div>
  );
}

function UserInfoModal({ isOpen, onClose, profile_image, onProfileChange, userInfo, onUserInfoChange }) {
  const fileInputRef = useRef(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNickname(userInfo.name || "");
    }
  }, [isOpen, userInfo.name]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const res = await uploadProfileImage(file);
        onProfileChange(res.profile_image_url);
      } catch (err) {
        console.error("프로필 변경 실패:", err);
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateMe({ nickname });
      onUserInfoChange({ ...userInfo, name: nickname });
      onClose();
    } catch (err) {
      console.error("닉네임 변경 실패:", err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-blue-300 relative w-100 rounded-xl px-10 py-8">
        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="bg-blue-100 w-40 h-40 rounded-full flex items-center justify-center overflow-hidden mb-3 cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            {profile_image ? (
              <img src={profile_image} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <DefaultProfileIcon size={80} />
            )}
          </div>
          <button
            className="body-sm text-blue-100 hover:underline"
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

        {/* 닉네임 수정 */}
        <div className="flex flex-col gap-2 mb-6">
          <p className="body-sm text-blue-100">닉네임을 입력하세요</p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-3 rounded-lg body-md text-blue-900 bg-blue-100 outline-none border border-blue-400 focus:border-blue-500"
          />
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
}

function AlarmSettingModal({ isOpen, onClose }) {
  const [selectedTime, setSelectedTime] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    if (selectedTime) {
      try {
        await updateMe({ alert_offset_minutes: Number(selectedTime), alert_enabled: true });
      } catch (err) {
        console.error("알림 설정 실패:", err);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-blue-300 w-100 rounded-xl px-10 py-8 flex flex-col">
        {/* 드롭다운 + 라벨 */}
        <div className="flex items-center gap-4 mb-auto">
          <Dropdown
            options={timeOptions}
            value={selectedTime}
            onChange={(option) => setSelectedTime(option.value)}
            placeholder="시간을 선택하세요"
            width="w-52"
          />
          <span className="body-xl text-gray-100 whitespace-nowrap">
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
}

export default function MyPage() {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showAlarmSetting, setShowAlarmSetting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "", alert_offset_minutes: null });
  const [routeHistory, setRouteHistory] = useState([]);  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMe();
        setUserInfo(res);
        setProfileImage(res.profile_image);
      } catch (err) {
        console.error("사용자 정보 조회 실패:", err);
      }
    };

    const fetchRoutes = async () => {
      try {
        const res = await getRouteHistory();
        setRouteHistory(res.content);
      } catch (err) {
        console.error("경로 기록 조회 실패:", err);
      }
    };

    fetchUser();
    fetchRoutes(); 
  }, []);

  const handleDeleteAccount = async () => {
    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      try {
        await deleteMe();
        alert("탈퇴되었습니다.");
      } catch (err) {
        console.error("탈퇴 실패:", err);
      }
    }
  };

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
          <div className="bg-blue-100 w-48 h-48 rounded-full flex items-center justify-center overflow-hidden mb-4">
            {profileImage ? (
              <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <DefaultProfileIcon size={80} />
            )}
          </div>

          <p className="title-h4 text-blue-900 mb-8">
            {userInfo.name || "사용자"}
          </p>

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
            <h2 className="title-h2 text-gray-1000 mb-6">
              지난 경로 기록
            </h2>
            <div className="flex flex-col gap-4">
              {routeHistory.map((item) => (
                <RouteCard
                  key={item.search_id}
                  searched_at={item.searched_at}
                  origin={item.origin}
                  destination={item.destination}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <UserInfoModal
        isOpen={showUserInfo}
        onClose={() => setShowUserInfo(false)}
        profile_image={profileImage}
        onProfileChange={setProfileImage}
        userInfo={userInfo}
        onUserInfoChange={setUserInfo}
      />
      <AlarmSettingModal
        isOpen={showAlarmSetting}
        onClose={() => setShowAlarmSetting(false)}
      />
    </div>
  );
}