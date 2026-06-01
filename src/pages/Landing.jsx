import React from "react";
import Button from "../components/Button";
import hero from "../assets/hero.svg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* 로고 */}
      <div className="mb-3 sm:mb-6">
        <img
          src={hero}
          alt="when2leave"
          className="w-50 sm:w-80 h-auto object-contain"
        />
      </div>

      {/* when2leave 텍스트 */}
      <div className="mb-0.5">
        <p className="title-display tracking-wide">
          <span className="text-beige-800">when</span>
          <span className="text-blue-500">2</span>
          <span className="text-beige-800">leave</span>
        </p>
      </div>

      {/* 하단 설명 박스 */}
      <div className="rounded-lg px-6 py-3 mb-5 sm:px-12 sm:py-4 sm:mb-8 text-center">
        <p className="body-xl text-blue-900 leading-relaxed">
          계획에 늦으시지 않게 저희가 도와드리겠습니다
        </p>
      </div>

      {/* 카카오 로그인 버튼 */}
      <Button
        text="카카오톡으로 로그인"
        onClick={() => { window.location.href = import.meta.env.VITE_KAKAO_LOGIN_URL; }}
        bgColor="var(--color-beige-500)"
        textColor="var(--color-blue-900)"
        className="h-12 px-8 py-2 sm:h-15 sm:px-12 sm:py-3 title-h4"
      />
    </div>
  );
}
