import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";

const transportOptions = [
  { index: 0, value: "버스" },
  { index: 1, value: "버스+지하철" },
  { index: 2, value: "지하철" },
];

const routines = [
  { id: "01", label: "양치", time: "3분" },
  { id: "02", label: "씻기", time: "15분" },
  { id: "03", label: "옷 입기", time: "10분" },
];

const checklist = [
  { id: 1, label: "지갑", checked: true },
  { id: 2, label: "핸드크림", checked: false },
];

const timeline = {
  routine: [
    { time: "11:00", label: "양치" },
    { time: "11:03", label: "씻기" },
    { time: "11:18", label: "옷 입기" },
  ],
  route: [
    { time: "11:28", label: "집에서 출발" },
    { time: "11:28", label: "집에서 출발" },
    { time: "11:29", label: "버스 정류장까지 도보 이동" },
    { time: "11:30", label: "1117 버스 탑승" },
    { time: "12:28", label: "한국외대 글로벌캠퍼스" },
  ],
};

const status = {
  recommendTime: "11:00",
  expectedArrival: "12:28",
  currentTime: "10:48",
};

function SectionHeader({ label, duration }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="body-sm text-gray-500 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-300" />
      <span className="body-sm text-gray-500 whitespace-nowrap">{duration}</span>
    </div>
  );
}

function TimelineItem({ time, label, isLast }) {
  return (
    <div className="flex items-start gap-3">
      <span className="body-xs text-gray-400 w-10 shrink-0 pt-1">{time}</span>
      <div className="flex flex-col items-center">
        <span className="w-2 h-2 rounded-full bg-blue-700 mt-1 shrink-0" />
        {!isLast && <span className="w-px h-5 bg-blue-300 my-0.5" />}
      </div>
      <span className="body-sm text-blue-900 pt-0.5">{label}</span>
    </div>
  );
}

export default function RouteSearch() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [transport, setTransport] = useState("");

  return (
    <div className="min-h-screen bg-white px-7 py-5">
      <div className="max-w-[1152px] mx-auto">
        <h1 className="title-h2 text-blue-900 mb-2">길찾기</h1>
        <p className="body-sm text-gray-600 mb-6">
          출발지와 도착지를 설정하고{" "}
          <span className="font-semibold">원하는 도착 시간</span>을 설정하세요!
        </p>

        {/* 검색 폼 */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-5 mb-7 flex items-center gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="body-sm text-gray-600">출발지</label>
            <Input
              id="departure"
              placeholder="출발지를 입력하세요"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              width="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="body-sm text-gray-600">도착지</label>
            <Input
              id="destination"
              placeholder="도착지를 입력하세요"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              width="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="body-sm text-gray-600">목표 도착 시간</label>
            <Input
              id="arrivalTime"
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              width="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="body-sm text-gray-600">이동 수단</label>
            <Dropdown
              options={transportOptions}
              placeholder="옵션을 선택하세요"
              value={transport}
              onChange={(option) => setTransport(option.value)}
              width="w-full"
            />
          </div>
          <Button
            text={<AiOutlineSearch size={36} />}
            onClick={() => setStep(2)}
            className="p-3 shrink-0"
          />
        </div>

        {/* step 1 */}
        {step === 1 && (
          <div className="grid grid-cols-3 gap-4">
            {/* 커스텀 루틴 */}
            <div>
              <h2 className="title-h4 text-blue-900 mb-3">커스텀 루틴</h2>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col gap-3">
                  {routines.map(({ id, label, time }) => (
                    <div key={id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-900 text-blue-100 body-xs rounded-lg flex items-center justify-center font-semibold shrink-0">
                          {id}
                        </span>
                        <span className="body-md text-blue-900">{label}</span>
                      </div>
                      <span className="body-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 체크 리스트 */}
            <div>
              <h2 className="title-h4 text-blue-900 mb-3">체크 리스트</h2>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col gap-3">
                  {checklist.map(({ id, label, checked }) => (
                    <div key={id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={checked}
                        className="w-5 h-5 accent-blue-700 shrink-0"
                      />
                      <span className="body-md text-blue-900">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 준비 상태 */}
            <div>
              <h2 className="title-h4 text-blue-900 mb-3">준비 상태</h2>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                <div className="divide-y divide-gray-200">
                  {[
                    { label: "준비 시간", value: "28분" },
                    { label: "현재 시각", value: "17:35" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <span className="body-md text-blue-900">{label}</span>
                      <span className="body-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* step 2 */}
        {step === 2 && (
          <div className="grid grid-cols-[1fr_auto] gap-4">
            {/* 타임라인 */}
            <div>
              <h2 className="title-h4 text-blue-900 mb-3">타임라인</h2>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                <SectionHeader label="준비 루틴" duration="28분" />
                <div className="flex flex-col mb-6 pl-1">
                  {timeline.routine.map(({ time, label }, i) => (
                    <TimelineItem
                      key={i}
                      time={time}
                      label={label}
                      isLast={i === timeline.routine.length - 1}
                    />
                  ))}
                </div>
                <SectionHeader label="경로 상세" duration="60분" />
                <div className="flex flex-col pl-1">
                  {timeline.route.map(({ time, label }, i) => (
                    <TimelineItem
                      key={i}
                      time={time}
                      label={label}
                      isLast={i === timeline.route.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 우측 패널 */}
            <div className="flex flex-col gap-4 w-72">
              {/* 체크 리스트 */}
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col gap-3">
                  {checklist.map(({ id, label, checked }) => (
                    <div key={id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={checked}
                        className="w-5 h-5 accent-blue-700 shrink-0"
                      />
                      <span className="body-md text-blue-900">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 준비 상태 */}
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                <div className="divide-y divide-gray-200">
                  {[
                    { label: "권장 준비 시각", value: status.recommendTime },
                    { label: "예정 도착 시각", value: status.expectedArrival },
                    { label: "현재 시각", value: status.currentTime },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <span className="body-md text-blue-900">{label}</span>
                      <span className="body-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button text="시작" onClick={() => navigate("/route/active")} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
