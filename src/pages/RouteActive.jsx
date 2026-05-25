import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const initialRoutineSteps = [
  { id: 1, label: "아침 먹기", plannedDuration: 20 },
  { id: 2, label: "준비 하기", plannedDuration: 20 },
  { id: 3, label: "짐 챙기기", plannedDuration: 10 },
];

const routeSteps = [
  {
    id: 1, type: "bus", time: "14:05",
    label: "한국외국어대학교 글로벌캠퍼스",
    sub: "1550", detail: "44개 정류장 이동 · 1시간 22분", color: "bg-red-200 border-red-800",
  },
  {
    id: 2, type: "walk", time: "12:27",
    label: "을지로입구역. 광교 하차",
    sub: "도보 224m  5분", color: "bg-white border-gray-200",
  },
  {
    id: 3, type: "subway", time: "12:32",
    label: "2호선 을지로입구역 승차",
    sub: "빠른하차 4-1, 8-4", detail: "7개 역 이동 · 13분", color: "bg-green-300 border-green-800",
  },
  {
    id: 4, type: "arrival", time: "12:45",
    label: "합정역 2호선",
    sub: "서울 마포구 양화로 55", color: "bg-white border-gray-200",
  },
];

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}
function toTimeStr(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function toMMSS(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RouteActive() {
  const navigate = useNavigate();

  const departure = "한국외대";
  const destination = "합정역";
  const arrivalTarget = "16:00";
  const plannedDepartureTime = "14:05";
  const routineStartTime = "11:00";

  const [steps, setSteps] = useState(
    initialRoutineSteps.map((s, i) => ({
      ...s,
      status: i === 0 ? "active" : "pending",
      actualDuration: null,
      savedMinutes: 0,
    }))
  );
  const [activeTimer, setActiveTimer] = useState(initialRoutineSteps[0].plannedDuration * 60);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setActiveTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calcStepStartTimes = () => {
    let t = toMinutes(routineStartTime);
    return steps.map((step) => {
      const start = t;
      t += step.status === "done" ? step.actualDuration : step.plannedDuration;
      return toTimeStr(start);
    });
  };
  const stepStartTimes = calcStepStartTimes();

  const calcActualDepartureTime = () => {
    let t = toMinutes(routineStartTime);
    steps.forEach((step) => {
      t += step.status === "done" ? step.actualDuration : step.plannedDuration;
    });
    return toTimeStr(t);
  };

  const spareMins = toMinutes(plannedDepartureTime) - toMinutes(calcActualDepartureTime());

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const departureMins = toMinutes(plannedDepartureTime);
  const remainSecs = Math.max((departureMins - nowMins) * 60 - now.getSeconds(), 0);
  const doneCount = steps.filter((s) => s.status === "done").length;

  // 권장 시작 시각과 실제 시작 시각 비교 (나중에 API 값으로 교체)
  const recommendedStartMins = toMinutes(routineStartTime);
  const diffMins = nowMins - recommendedStartMins;

  // 늦게 시작한 경우: 각 단계 시간을 비례로 줄여 재조정
  const isLate = diffMins > 0;
  const lateMinutes = isLate ? diffMins : 0;

  useEffect(() => {
    if (isLate) {
      setSteps((prev) =>
        prev.map((s) => ({
          ...s,
          plannedDuration: Math.max(
            Math.floor(s.plannedDuration * (1 - lateMinutes / (initialRoutineSteps.reduce((a, b) => a + b.plannedDuration, 0)))),
            1
          ),
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 일찍 시작한 경우: 여유 시간에 추가
  const extraSpare = diffMins < 0 ? Math.abs(diffMins) : 0;
  const totalSpareMins = spareMins + extraSpare;

  const handleComplete = (id) => {
    const activeIndex = steps.findIndex((s) => s.id === id);
    const realActual = Math.max(
      steps[activeIndex].plannedDuration - Math.floor(activeTimer / 60), 1
    );
    setSteps((prev) =>
      prev.map((s, i) => {
        if (s.id === id)
          return { ...s, status: "done", actualDuration: realActual, savedMinutes: steps[activeIndex].plannedDuration - realActual };
        if (i === activeIndex + 1) return { ...s, status: "active" };
        return s;
      })
    );
    const nextStep = steps[activeIndex + 1];
    if (nextStep) setActiveTimer(nextStep.plannedDuration * 60);
  };

  return (
    <div className="min-h-screen bg-white px-7 py-5">
      <div className="max-w-[680px] mx-auto">

        {/* 길찾기 헤더 */}
        <p className="body-xs text-blue-900 mb-3">길찾기</p>

        {/* 출발지 / 화살표 / 도착지 / 도착 예정 시간 */}
        <div className="flex items-center pb-4 border-b border-blue-600 mb-4">
          <div className="flex-1">
            <p className="body-xs text-blue-900 mb-0.5">출발지</p>
            <p className="body-xl font-bold text-blue-900">{departure}</p>
          </div>
          <span className="text-blue-600 text-sm flex-shrink-0">———→</span>
          <div className="flex-1 text-center">
            <p className="body-xs text-blue-900 mb-0.5">도착지</p>
            <p className="body-xl font-bold text-blue-900">{destination}</p>
          </div>
          <div className="flex-1 text-right">
            <p className="body-xs text-blue-900 mb-0.5">도착 예정 시간</p>
            <p className="body-xl font-bold text-blue-900">{arrivalTarget}</p>
          </div>
        </div>

        {/* 출발 시각 / 출발까지 카운트다운 */}
        <div className="flex items-center gap-4 pb-4 border-b border-blue-600 mb-3">
          <div>
            <p className="body-xs text-blue-900 mb-0.5">출발 시각</p>
            <p className="title-h3 text-blue-900 font-bold">{plannedDepartureTime}</p>
          </div>
          <span className="title-h4 text-blue-600 mt-3">/</span>
          <div>
            <p className="body-xs text-blue-900 mb-0.5">출발까지</p>
            <p className={`title-h3 font-bold ${remainSecs === 0 ? "text-red-500" : "text-blue-900"}`}>
              {toMMSS(remainSecs)}
            </p>
          </div>
          {totalSpareMins > 0 && (
            <div className="ml-auto">
<Button text={`+${totalSpareMins} 분 여유`} onClick={() => {}} className="body-xs px-4 py-2 rounded-lg" />
            </div>
          )}
        </div>

        {/* 늦게 시작 경고 메시지 */}
        {isLate && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="body-xs text-red-500">
              권장 시작 시간보다 {lateMinutes}분 늦게 시작했어요. 각 단계 시간이 조정됐어요.
            </p>
          </div>
        )}

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>

          {/* 준비 단계 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="body-xs text-blue-900">준비 단계</p>
              <p className="body-xs text-blue-900">{doneCount} / {steps.length} 완료</p>
            </div>

            <div className="flex flex-col">
              {steps.map((step, index) => {
                const isDone = step.status === "done";
                const isActive = step.status === "active";
                const isPending = step.status === "pending";

                return (
                  <div key={step.id} className="flex items-start gap-3">
                    {/* 시간 */}
                    <span className="body-xs text-blue-1000 w-9 shrink-0 pt-2.5 text-right">
                      {stepStartTimes[index]}
                    </span>

                    {/* 도트 + 선 */}
                    <div className="flex flex-col items-center">
                      <div className="mt-2.5">
                        <span className={`block w-2 h-2 rounded-full ${
                          isDone ? "bg-gray-300"
                          : isActive ? "bg-blue-700"
                          : "border-2 border-gray-300 bg-white"
                        }`} />
                      </div>
                      {index < steps.length - 1 && (
                        <span className="w-px bg-gray-200 flex-1 min-h-8" />
                      )}
                    </div>

                    {/* 내용 */}
                    <div className={`flex-1 pb-2 ${
                      isActive ? "rounded-lg bg-green-200 border border-green-800 px-3 py-2 mb-1"
                      : isDone ? "py-1"
                      : "py-1"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`body-sm ${
                          isDone ? "text-gray-400 line-through" : "text-blue-1000"
                        }`}>
                          {step.label}
                        </span>

                        {isDone && (
                          <span className="body-xs text-gray-400">완료 ✓</span>
                        )}

                        {/* 완료 버튼: 현재 진행 중인 단계에만 */}
                        {isActive && (
                          <div className="flex items-center gap-2">
                            <span className={`body-sm font-medium ${
                              activeTimer <= 60 ? "text-red-500" :
                              activeTimer <= 180 ? "text-orange-400" :
                              "text-blue-1000"
                            }`}>{toMMSS(activeTimer)}</span>
<Button text="✓" onClick={() => handleComplete(step.id)} className="w-7 h-7 rounded-lg text-sm" />
                          </div>
                        )}
                      </div>

                      {isDone && (
                        <p className="body-xs text-blue-1000 mt-0.5">
                          {step.plannedDuration}분 소요 → {step.actualDuration}분 소요
                          {step.savedMinutes > 0 && (
                            <span className="text-green-500 ml-1">여유 +{step.savedMinutes}분</span>
                          )}
                        </p>
                      )}
                      {isActive && (
                        <p className="body-xs text-green-600 mt-0.5">{step.plannedDuration}분 소요</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 여유 시간 프레임 - 여유 시간이 생겼을 때만 표시 */}
          {totalSpareMins > 0 && (
            <div className="flex items-start gap-3 mb-4">
              <span className="body-xs text-blue-1000 w-9 shrink-0 pt-2.5 text-right">
                {calcActualDepartureTime()}
              </span>
              <div className="flex flex-col items-center">
                <div className="mt-2.5">
                  <span className="block w-2 h-2 rounded-full border-2 border-gray-300 bg-white" />
                </div>
              </div>
              <div className="flex-1 rounded-lg bg-blue-400 border border-blue-800 px-3 py-2 mb-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-sm text-blue-1000">여유 {totalSpareMins}분 확보</p>
                    <p className="body-xs text-blue-1000 mt-0.5">
                      계획 출발 {plannedDepartureTime}&nbsp;&nbsp;지금 출발도 가능해요
                    </p>
                  </div>
<Button text="지금 출발 →" onClick={() => navigate("/route", { state: { departureNow: true, currentTime: toTimeStr(nowMins) } })} className="body-xs px-3 py-1.5 rounded-lg ml-3" />
                </div>
              </div>
            </div>
          )}

          {/* 경로 상세 */}
          <div>
            {routeSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <span className="body-xs text-blue-1000 w-9 shrink-0 pt-2.5 text-right">
                  {step.time}
                </span>
                <div className="flex flex-col items-center">
                  <div className="mt-2 w-5 h-5 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs shrink-0">
                    {step.type === "walk" ? "🚶" : step.type === "arrival" ? "📍" : "🚌"}
                  </div>
                  {index < routeSteps.length - 1 && (
                    <span className="w-px bg-gray-200 flex-1 min-h-8" />
                  )}
                </div>
                <div className={`flex-1 rounded-lg px-3 py-2 mb-2 border ${step.color}`}>
                  <p className="body-sm text-blue-1000">{step.label}</p>
                  {step.sub && step.type === "bus" && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full body-xs text-white bg-red-700">
                      {step.sub}
                    </span>
                  )}
                  {step.sub && step.type !== "bus" && (
                    <p className="body-xs text-blue-1000 mt-0.5">{step.sub}</p>
                  )}
                  {step.detail && <p className="body-xs text-blue-1000 mt-0.5">{step.detail}</p>}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}