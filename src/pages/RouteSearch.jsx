import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { MdSubway, MdDirectionsBus, MdDirectionsWalk } from "react-icons/md";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { getRoutines, getChecklists, searchRoute } from "../api/api";

// Mock 데이터 (API 실패 시 폴백)
const MOCK_ROUTINES = [
  { id: "01", name: "양치", total_minutes: 3, active: true },
  { id: "02", name: "씻기", total_minutes: 15, active: true },
  { id: "03", name: "옷 입기", total_minutes: 10, active: true },
];

const MOCK_CHECKLISTS = {
  todo: [
    { id: 1, title: "지갑", checked: true, fixed: false, sort_order: 1 },
    { id: 2, title: "핸드크림", checked: false, fixed: false, sort_order: 2 },
  ],
  must_do: [],
};

const MOCK_ROUTE_SEARCH = {
  search_id: "mock-001",
  origin: "자택",
  destination: "한국외대 글로벌캠퍼스",
  arrival_time: "12:28",
  total_minutes: 88,
  routine_minutes: 28,
  recommended_departure_time: "11:28",
  prep_start_time: "11:00",
  slack_minutes: 12,
  sub_paths: [
    { traffic_type: 3, section_time: 3, start_name: "집에서 출발", end_name: "버스 정류장", distance: 250, start_id: null, lane_names: [] },
    { traffic_type: 2, section_time: 55, start_name: "1117 버스 탑승", end_name: null, distance: null, start_id: null, lane_names: ["1117"] },
    { traffic_type: 3, section_time: 5, start_name: "버스 정류장 하차", end_name: "한국외대 글로벌캠퍼스", distance: 350, start_id: null, lane_names: [] },
  ],
};

const transportOptions = [
  { index: 0, value: "subway", label: "지하철" },
  { index: 1, value: "bus", label: "버스" },
  { index: 2, value: "mixed", label: "버스+지하철" },
];

function getCurrentTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function formatTime(isoOrHHmm) {
  if (!isoOrHHmm) return "";
  if (isoOrHHmm.includes("T")) {
    const [, timePart] = isoOrHHmm.split("T");
    return timePart.slice(0, 5);
  }
  return isoOrHHmm;
}

const TRAFFIC_TYPE = {
  1: { label: "지하철", Icon: MdSubway },
  2: { label: "버스", Icon: MdDirectionsBus },
  3: { label: "도보", Icon: MdDirectionsWalk },
};

function toISOArrivalTime(timeStr) {
  const today = new Date();
  const [h, m] = timeStr.split(":").map(Number);
  // KST 기준 ISO 문자열
  const yyyy = today.getFullYear();
  const MM = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:00`;
}

function buildRoutineTimeline(activeRoutines, prepStartTime) {
  let cursor = formatTime(prepStartTime);
  return activeRoutines.map((r) => {
    const time = cursor;
    cursor = addMinutes(cursor, r.total_minutes);
    return { id: r.id, time, label: r.name };
  });
}

const TRAFFIC_DEFAULT_LABEL = { 1: "지하철 이동", 2: "버스 이동", 3: "도보 이동" };

function buildRouteLabel(path) {
  const { traffic_type, start_name, end_name, distance } = path;

  if (traffic_type === 3) {
    if (!start_name && !end_name) return distance != null ? `도보 이동 (약 ${distance}m)` : "도보 이동";
    const base = start_name && end_name ? `${start_name} → ${end_name}` : (start_name ?? end_name);
    return distance != null ? `${base} (약 ${distance}m)` : base;
  }

  if (start_name && end_name) return `${start_name} 승차 → ${end_name} 하차`;
  if (start_name) return `${start_name} 승차`;
  return TRAFFIC_DEFAULT_LABEL[traffic_type] ?? "이동";
}

function buildRouteTimeline(subPaths, departureTime) {
  let cursor = formatTime(departureTime);
  return subPaths.map((path) => {
    const time = cursor;
    cursor = addMinutes(cursor, path.section_time);
    const label = buildRouteLabel(path);
    return { id: path.start_id ?? label, time, label, trafficType: path.traffic_type, laneNames: path.lane_names ?? [] };
  });
}

function EmptyMessage({ text }) {
  return <p className="body-sm text-gray-400 text-center py-2">{text}</p>;
}

function SectionHeader({ label, duration }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="body-md text-gray-500 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-300" />
      <span className="body-md text-gray-500 whitespace-nowrap">{duration}</span>
    </div>
  );
}

function TimelineItem({ time, label, isLast, trafficType, laneNames }) {
  const traffic = TRAFFIC_TYPE[trafficType];
  const laneText = laneNames?.length > 0
    ? trafficType === 1 ? laneNames[0] : laneNames.join(", ")
    : null;

  return (
    <div className={`flex items-start gap-3${!isLast ? " mb-3" : ""}`}>
      <span className="body-sm text-gray-400 w-10 shrink-0 pt-1">{time}</span>
      <div className="flex flex-col items-center">
        <span className="w-2 h-2 rounded-full bg-blue-700 mt-1 shrink-0" />
        {!isLast && <span className="w-px h-8 bg-blue-300 my-1" />}
      </div>
      <div className="flex flex-col pt-0.5">
        <span className="body-md text-blue-900">{label}</span>
        {traffic && (
          <span className="flex items-center gap-1 body-xs text-gray-500 mt-0.5">
            <traffic.Icon size={12} />
            {traffic.label}
            {laneText && <span>· {laneText}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

function RouteResultPanel({ routeResult, activeRoutines, allChecklistItems, toggleChecklistItem, navigate, departure, destination }) {
  const routineTimeline = buildRoutineTimeline(activeRoutines, routeResult.prep_start_time);
  const routeTimeline = buildRouteTimeline(routeResult.sub_paths, routeResult.recommended_departure_time);
  const routeMinutes = Math.max(routeResult.total_minutes - routeResult.routine_minutes, 0);

  return (
    <div className="grid grid-cols-[1fr_auto] gap-4">
      {/* 타임라인 */}
      <div>
        <h2 className="title-h4 text-blue-900 mb-3">타임라인</h2>
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
          {activeRoutines.length > 0 && (
            <>
              <SectionHeader label="준비 루틴" duration={`${routeResult.routine_minutes}분`} />
              <div className="flex flex-col mb-6 pl-1">
                {routineTimeline.map(({ id, time, label }, i) => (
                  <TimelineItem
                    key={id}
                    time={time}
                    label={label}
                    isLast={i === routineTimeline.length - 1}
                  />
                ))}
              </div>
            </>
          )}
          <SectionHeader label="경로 상세" duration={`${routeMinutes}분`} />
          <div className="flex flex-col pl-1">
            {routeTimeline.map(({ id, time, label, trafficType, laneNames }, i) => (
              <TimelineItem
                key={`route-${id}-${i}`}
                time={time}
                label={label}
                trafficType={trafficType}
                laneNames={laneNames}
                isLast={i === routeTimeline.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 우측 패널 */}
      <div className="flex flex-col gap-4 w-72">
        {/* 체크 리스트 */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
          {allChecklistItems.length > 0 ? (
            <div className="flex flex-col gap-3">
              {allChecklistItems.map(({ id, title, checked, _type }) => (
                <div key={id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklistItem(_type, id)}
                    className="w-5 h-5 accent-blue-700 shrink-0"
                  />
                  <span className="body-md text-blue-900">{title}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyMessage text="등록된 체크리스트가 없어요." />
          )}
        </div>

        {/* 준비 상태 */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
          <div className="divide-y divide-gray-200">
            {[
              { label: "준비 시작 시각", value: formatTime(routeResult.prep_start_time) },
              { label: "권장 출발 시각", value: formatTime(routeResult.recommended_departure_time) },
              { label: "예정 도착 시각", value: formatTime(routeResult.arrival_time) },
              { label: "여유 시간", value: `${routeResult.slack_minutes}분` },
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
            <Button
                text="시작"
                onClick={() => navigate("/route/active", {
                  state: {
                    routineId: activeRoutines[0]?.id ?? null,
                    searchId: routeResult.search_id,
                    departure,
                    destination,
                    arrivalTarget: routeResult.arrival_time,
                    plannedDepartureTime: routeResult.recommended_departure_time,
                    routineStartTime: routeResult.prep_start_time,
                    subPaths: routeResult.sub_paths,
                  },
                })}
              />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RouteSearch() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [transport, setTransport] = useState(null);

  const [routines, setRoutines] = useState([]);
  const [checklists, setChecklists] = useState({ todo: [], must_do: [] });
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getCurrentTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [routinesData, checklistsData] = await Promise.all([
          getRoutines(),
          getChecklists(),
        ]);
        setRoutines(routinesData);
        setChecklists(checklistsData);
      } catch {
        setRoutines(MOCK_ROUTINES);
        setChecklists(MOCK_CHECKLISTS);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    if (!departure || !destination || !arrivalTime || !transport) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const result = await searchRoute({
        origin: departure,
        destination,
        arrival_time: toISOArrivalTime(arrivalTime),
        transport_option: transport.value,
      });
      setRouteResult(result);
      setStep(2);
    } catch {
      setRouteResult(MOCK_ROUTE_SEARCH);
      setStep(2);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleChecklistItem = (type, id) => {
    setChecklists((prev) => ({
      ...prev,
      [type]: prev[type].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const activeRoutines = routines.filter((r) => r.active);
  const totalRoutineMinutes = activeRoutines.reduce((sum, r) => sum + r.total_minutes, 0);
  const allChecklistItems = [
    ...checklists.todo.map((item) => ({ ...item, _type: "todo" })),
    ...checklists.must_do.map((item) => ({ ...item, _type: "must_do" })),
  ];

  return (
    <div className="min-h-screen bg-white px-7 py-5">
      <div className="max-w-6xl mx-auto">
        <h1 className="title-h2 text-blue-900 mb-2">길찾기</h1>
        <p className="body-sm text-gray-600 mb-6">
          출발지와 도착지를 설정하고{" "}
          <span className="font-semibold">원하는 도착 시간</span>을 설정하세요!
        </p>

        {/* 검색 폼 */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-5 mb-4 flex items-center gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="body-md text-gray-600">출발지</label>
            <Input
              id="departure"
              placeholder="출발지를 입력하세요"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              width="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="body-md text-gray-600">도착지</label>
            <Input
              id="destination"
              placeholder="도착지를 입력하세요"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              width="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="body-md text-gray-600">목표 도착 시간</label>
            <Input
              id="arrivalTime"
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              width="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="body-md text-gray-600">이동 수단</label>
            <Dropdown
              options={transportOptions}
              placeholder="옵션을 선택하세요"
              value={transport?.label ?? ""}
              onChange={(option) => setTransport(option)}
              width="w-full"
            />
          </div>
          <Button
            text={<AiOutlineSearch size={24} />}
            onClick={isSearching ? undefined : handleSearch}
            bgColor={isSearching ? "var(--color-gray-400)" : "var(--color-blue-900)"}
            textColor={isSearching ? "var(--color-gray-100)" : "var(--color-blue-100)"}
            className="p-3 shrink-0"
          />
        </div>

        {/* 에러 메시지 (폼 유효성 검사) */}
        {error && <p className="body-sm text-red-500 mb-4">{error}</p>}

        {/* 콘텐츠 영역 */}
        {loading ? (
          <div className="flex items-center justify-center h-32 body-md text-gray-500">
            불러오는 중...
          </div>
        ) : step === 1 ? (
          <div className="grid grid-cols-3 gap-4">
            {/* 커스텀 루틴 */}
            <div>
              <h2 className="title-h4 text-blue-900 mb-3">커스텀 루틴</h2>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                {activeRoutines.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {activeRoutines.map(({ id, name, total_minutes }, i) => (
                      <div key={id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-900 text-blue-100 body-xs rounded-lg flex items-center justify-center font-semibold shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="body-md text-blue-900">{name}</span>
                        </div>
                        <span className="body-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                          {total_minutes}분
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyMessage text="등록된 루틴이 없어요. 커스텀 루틴을 설정해보세요." />
                )}
              </div>
            </div>

            {/* 체크 리스트 */}
            <div>
              <h2 className="title-h4 text-blue-900 mb-3">체크 리스트</h2>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                {allChecklistItems.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {allChecklistItems.map(({ id, title, checked, _type }) => (
                      <div key={id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChecklistItem(_type, id)}
                          className="w-5 h-5 accent-blue-700 shrink-0"
                        />
                        <span className="body-md text-blue-900">{title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyMessage text="등록된 체크리스트가 없어요." />
                )}
              </div>
            </div>

            {/* 준비 상태 */}
            <div>
              <h2 className="title-h4 text-blue-900 mb-3">준비 상태</h2>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                <div className="divide-y divide-gray-200">
                  {[
                    { label: "준비 시간", value: `${totalRoutineMinutes}분` },
                    { label: "현재 시각", value: currentTime },
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
        ) : routeResult ? (
          <RouteResultPanel
            routeResult={routeResult}
            activeRoutines={activeRoutines}
            allChecklistItems={allChecklistItems}
            toggleChecklistItem={toggleChecklistItem}
            navigate={navigate}
            departure={departure}
            destination={destination}
          />
        ) : null}
      </div>
    </div>
  );
}
