import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import Input from "../components/Input";

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="title-h4 text-blue-900 border-b border-blue-200 pb-2">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="body-sm text-gray-500">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function Setting() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [errorValue, setErrorValue] = useState("잘못된 입력입니다");

  const pages = [
    { label: "Landing", path: "/" },
    { label: "Route Search", path: "/route" },
    { label: "Route Active", path: "/route/active" },
    { label: "Custom Routine", path: "/customroutine" },
    { label: "Check List", path: "/checklist" },
    { label: "My Page", path: "/mypage" },
  ];

  const dropdownOptions = [
    { index: 0, value: "옵션 1" },
    { index: 1, value: "옵션 2" },
    { index: 2, value: "옵션 3" },
    { index: 3, value: "옵션 4" },
    { index: 4, value: "옵션 5" },
  ];

  return (
    <div className="flex flex-col gap-12 p-12">
      {/* 페이지 이동 */}
      <Section title="페이지 이동">
        <Row label="모든 페이지">
          {pages.map(({ label, path }) => (
            <Button key={path} text={label} onClick={() => navigate(path)} />
          ))}
        </Row>
      </Section>

      {/* Button */}
      <Section title="Button">
        <Row label="Default">
          <Button text="버튼" onClick={() => {}} />
        </Row>
        <Row label="Inverted — blue-100 / blue-900">
          <Button
            text="버튼"
            onClick={() => {}}
            bgColor="var(--color-blue-100)"
            textColor="var(--color-blue-900)"
          />
        </Row>
        <Row label="Green">
          <Button
            text="버튼"
            onClick={() => {}}
            bgColor="var(--color-green-700)"
            textColor="var(--color-green-100)"
          />
        </Row>
        <Row label="Beige">
          <Button
            text="버튼"
            onClick={() => {}}
            bgColor="var(--color-beige-700)"
            textColor="var(--color-beige-100)"
          />
        </Row>
        <Row label="Red">
          <Button
            text="버튼"
            onClick={() => {}}
            bgColor="var(--color-red-600)"
            textColor="var(--color-red-100)"
          />
        </Row>
      </Section>

      {/* Dropdown */}
      <Section title="Dropdown">
        <Row label="Default">
          <Dropdown
            options={dropdownOptions}
            value={selected?.value}
            onChange={setSelected}
            placeholder="옵션을 선택하세요"
          />
        </Row>
        <Row label="Disabled">
          <Dropdown
            options={dropdownOptions}
            value="비활성 옵션"
            onChange={() => {}}
            disabled
          />
        </Row>
      </Section>

      {/* Input */}
      <Section title="Input">
        <Row label="Default">
          <Input
            id="default"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </Row>
        <Row label="Error">
          <Input
            id="error"
            value={errorValue}
            onChange={(e) => setErrorValue(e.target.value)}
            isError
          />
        </Row>
        <Row label="Disabled">
          <Input id="disabled" value="" disabled />
        </Row>
      </Section>
    </div>
  );
}
