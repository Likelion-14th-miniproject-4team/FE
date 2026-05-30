import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import { MdDirectionsBus, MdDirectionsWalk, MdSubway, MdLocationOn } from "react-icons/md";
import { startCountdown, completeCountdownItem, departCountdown } from "../api/api";

// ── 색상 매핑 객체 ──────────────────────────────────────────────
const COLOR_MAP = {
  departure: "bg-white border-gray-200",
  bus:       "bg-red-200 border-red-800",
  walk:      "bg-white border-gray-200",
  subway:    "bg-green-300 border-green-800",
  arrival:   "bg-white border-gray-200",
};

const ICON_COLOR_MAP = {
  departure: "text-green-600",
  bus:       "text-red-700",
  walk:      "text-gray-500",
  subway:    "text-green-700",
  arrival:   "text-red-600",
};

// ── 유틸 ──────────────────────────────────────────────
function toMinutes(timeStr) {
  if (!timeStr || timeStr === "--:--") return 0;
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
function formatTime(isoOrHHmm) {
  if (!isoOrHHmm) return "--:--";
  if (isoOrHHmm.includes("T")) return isoOrHHmm.split("T")[1].slice(0, 5);
  return isoOrHHmm;
}

// ── 아이콘 ──────────────────────────────────────────────
function RouteIcon({ type }) {
  const cls = `w-4 h-4 ${ICON_COLOR_MAP[type] || "text-gray-500"}`;
  if (type === "walk")      return <MdDirectionsWalk className={cls} />;
  if (type === "subway")    return <MdSubway className={cls} />;
  if (type === "arrival")   return <MdLocationOn className={cls} />;
  if (type === "departure") return <MdLocationOn className={cls} />;
  return <MdDirectionsBus className={cls} />;
}

// ── 컴포넌트 ──────────────────────────────────────────
export default function RouteActive() {
  const navigate = useNavigate();
  const location = useLocation();

  // RouteSearch에서 넘어온 데이터
  const raw = location.state ?? {};
  const routineId = raw.routineId;
  const searchId = raw.searchId;
  const departure = raw.departure ?? "출발지";
  const destination = raw.destination ?? "도착지";
  const arrivalTarget = formatTime(raw.arrivalTarget ?? "--:--");
  const plannedDepartureTime = formatTime(raw.plannedDepartureTime ?? "--:--");
  const routineStartTime = formatTime(raw.routineStartTime ?? "--:--");
  const subPaths = raw.subPaths ?? [];

  // ── 세션 상태 ──
  const [sessionId, setSessionId] = useState(null);
  const [steps, setSteps] = useState([]);
  const [activeTimer, setActiveTimer] = useState(0);
  const [slackMinutes, setSlackMinutes] = useState(0); // 백엔드에서 받은 slack
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // ── 카운트다운 시작 ──
  useEffect(() => {
    const initCountdown = async () => {
      try {
        const res = await startCountdown({ routine_id: routineId, search_id: searchId });
        setSessionId(res.session_id);
        setSlackMinutes(res.slack_minutes);

        const initialSteps = [];
        if (res.current_item) {
          initialSteps.push({
            ...res.current_item,
            status: "active",
            actualDuration: null,
            savedMinutes: 0,
            plannedDuration: res.current_item.duration_min,
          });
        }
        if (res.next_item) {
          initialSteps.push({
            ...res.next_item,
            status: "pending",
            actualDuration: null,
            savedMinutes: 0,
            plannedDuration: res.next_item.duration_min,
          });
        }
        setSteps(initialSteps);
        if (res.current_item) setActiveTimer(res.current_item.duration_min * 60);
      } catch (err) {
        console.error("카운트다운 시작 실패", err);
      } finally {
        setLoading(false);
      }
    };

    if (routineId && searchId) {
      initCountdown();
    } else {
      setLoading(false);
    }
  }, []);

  // ── 1초 타이머 ──
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setActiveTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const remainSecs = Math.max(
    (toMinutes(plannedDepartureTime) - nowMins) * 60 - now.getSeconds(), 0
  );
  const doneCount = steps.filter((s) => s.status === "done").length;

  // slack 기반으로 지각 여부 판단
  const isLate = slackMinutes < 0;
  const lateMinutes = Math.abs(slackMinutes);

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

  // ── 단계 완료 ──
  const handleComplete = async (id) => {
    const capturedTimer = activeTimer;
    const activeIndex = steps.findIndex((s) => s.id === id);
    const elapsed = steps[activeIndex].plannedDuration * 60 - capturedTimer;
    const realActual = Math.max(Math.ceil(elapsed / 60), 1);
    const savedMinutes = steps[activeIndex].plannedDuration - realActual;

    try {
      const res = await completeCountdownItem(sessionId, { item_id: id, action: "complete" });
      // 백엔드에서 받은 slack으로 업데이트
      setSlackMinutes(res.slack_minutes);

      setSteps((prev) => {
        const updated = prev.map((s, i) => {
          if (s.id === id) return { ...s, status: "done", actualDuration: realActual, savedMinutes };
          if (i === activeIndex + 1) return { ...s, status: "active" };
          return s;
        });
        // 다음 항목 추가
        if (res.next_item && !updated.find((s) => s.id === res.next_item.id)) {
          updated.push({
            ...res.next_item,
            status: "pending",
            actualDuration: null,
            savedMinutes: 0,
            plannedDuration: res.next_item.duration_min,
          });
        }
        return updated;
      });

      const nextStep = steps[activeIndex + 1];
      if (nextStep) setActiveTimer(nextStep.plannedDuration * 60);
    } catch (err) {
      console.error("단계 완료 실패", err);
    }
  };

  // ── 지금 출발 ──
  const handleDepart = async () => {
    try {
      await departCountdown(sessionId, {});
      navigate("/route");
    } catch (err) {
      console.error("출발 처리 실패", err);
      navigate("/route");
    }
  };

  // ── 경로 상세 빌드 (lane_colors 적용) ──
  const buildRouteSteps = () => {
    if (!subPaths || subPaths.length === 0) return [];
    const typeMap = { 1: "subway", 2: "bus", 3: "walk" };
    let cursor = plannedDepartureTime;
    return subPaths.map((path, i) => {
      const time = cursor;
      const [h, m] = cursor.split(":").map(Number);
      const total = h * 60 + m + path.section_time;
      cursor = toTimeStr(total);
      const type = i === 0 ? "departure"
        : i === subPaths.length - 1 ? "arrival"
        : typeMap[path.traffic_type] ?? "walk";

      // lane_colors에서 첫 번째 색상 사용
      const laneColor = path.lane_colors?.[0] ?? null;
      const laneName = path.lane_names?.[0] ?? null;

      return {
        id: i,
        type,
        time,
        label: path.start_name ?? path.end_name ?? "이동",
        sub: laneName ?? (path.distance ? `도보 ${path.distance}m` : null),
        detail: path.section_time ? `${path.section_time}분` : null,
        laneColor,
      };
    });
  };
  const routeSteps = buildRouteSteps();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="body-md text-blue-900">카운트다운 준비 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-7 py-5">
      <div className="max-w-[680px] mx-auto">

        <p className="body-xs text-blue-900 mb-3">길찾기</p>

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
          {slackMinutes > 0 && (
            <div className="ml-auto">
              <Button text={`+${slackMinutes} 분 여유`} onClick={() => {}} className="body-xs px-4 py-2 rounded-lg" />
            </div>
          )}
        </div>

        {/* 지각 경고 - slack이 음수일 때 */}
        {isLate && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="body-xs text-red-500">
              {lateMinutes}분 지각 상태예요. 서둘러 준비해요!
            </p>
          </div>
        )}

        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="body-xs text-blue-900">준비 단계</p>
              <p className="body-xs text-blue-900">{doneCount} / {steps.length} 완료</p>
            </div>

            <div className="flex flex-col">
              {steps.map((step, index) => {
                const isDone = step.status === "done";
                const isActive = step.status === "active";

                return (
                  <div key={step.id} className="flex items-start gap-3">
                    <span className="body-xs text-blue-1000 w-9 shrink-0 pt-2.5 text-right">
                      {stepStartTimes[index]}
                    </span>
                    <div className="flex flex-col items-center">
                      <div className="mt-2.5">
                        <span className={`block w-2 h-2 rounded-full ${
                          isDone ? "bg-gray-300" : isActive ? "bg-blue-700" : "border-2 border-gray-300 bg-white"
                        }`} />
                      </div>
                      {index < steps.length - 1 && (
                        <span className="w-px bg-gray-200 flex-1 min-h-8" />
                      )}
                    </div>
                    <div className={`flex-1 pb-2 ${
                      isActive ? "rounded-lg bg-green-200 border border-green-800 px-3 py-2 mb-1"
                      : isDone ? "py-1" : "py-1"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`body-sm ${isDone ? "text-gray-400 line-through" : "text-blue-1000"}`}>
                          {step.name}
                        </span>
                        {isDone && <span className="body-xs text-gray-400">완료 ✓</span>}
                        {isActive && (
                          <div className="flex items-center gap-2">
                            <span className={`body-sm font-medium ${
                              activeTimer <= 60 ? "text-red-500" :
                              activeTimer <= 180 ? "text-orange-400" : "text-blue-1000"
                            }`}>{toMMSS(activeTimer)}</span>
                            <Button text="✓" onClick={() => handleComplete(step.id)} className="w-7 h-7 rounded-lg text-sm" />
                          </div>
                        )}
                      </div>
                      {isDone && (
                        <p className="body-xs text-blue-1000 mt-0.5">
                          {step.plannedDuration}분 소요 → {step.actualDuration}분 소요
                          {step.savedMinutes > 0 && <span className="text-green-500 ml-1">여유 +{step.savedMinutes}분</span>}
                        </p>
                      )}
                      {isActive && <p className="body-xs text-green-600 mt-0.5">{step.plannedDuration}분 소요</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 여유 시간 프레임 - slack이 양수일 때만 */}
          {slackMinutes > 0 && (
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
                    <p className="body-sm text-blue-1000">여유 {slackMinutes}분 확보</p>
                    <p className="body-xs text-blue-1000 mt-0.5">
                      계획 출발 {plannedDepartureTime}&nbsp;&nbsp;지금 출발도 가능해요
                    </p>
                  </div>
                  <Button text="지금 출발 →" onClick={handleDepart} className="body-xs px-3 py-1.5 rounded-lg ml-3" />
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="body-xs text-blue-900">길찾기</p>
            </div>
            {routeSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <span className="body-xs text-blue-1000 w-9 shrink-0 pt-2.5 text-right">
                  {step.time}
                </span>
                <div className="flex flex-col items-center">
                  {/* lane_color로 아이콘 배경색 적용 */}
                  <div
                    className="mt-2 w-5 h-5 rounded-lg border border-gray-200 flex items-center justify-center shrink-0"
                    style={step.laneColor ? { backgroundColor: step.laneColor + "33" } : {}}
                  >
                    <RouteIcon type={step.type} />
                  </div>
                  {index < routeSteps.length - 1 && (
                    <span className="w-px bg-gray-200 flex-1 min-h-8" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg px-3 py-2 mb-2 border ${!step.laneColor ? COLOR_MAP[step.type] : "border-gray-200"}`}
                  style={step.laneColor ? { backgroundColor: step.laneColor + "22" } : {}}
                >
                  <p className="body-sm text-blue-1000">{step.label}</p>
                  {step.sub && step.type === "bus" && (
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded-full body-xs text-white"
                      style={{ backgroundColor: step.laneColor ?? "#dc2626" }}
                    >
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