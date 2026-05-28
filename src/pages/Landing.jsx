import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import hero from "../assets/hero.svg";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* 로고 */}
      <div className="mb-6">
        <img
          src={hero}
          alt="when2leave"
          className="w-[340px] h-auto object-contain"
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
      <div className="rounded-lg px-12 py-4 mb-8 text-center">
        <p className="body-xl text-blue-900 leading-relaxed">
          계획에 늦으시지 않게 저희가 도와드리겠습니다
        </p>
      </div>

      {/* 시작하기 버튼 */}
      <Button
        text="카카오톡으로 로그인"
        onClick={() => navigate("/route")}
        bgColor="var(--color-beige-500)"
        textColor="var(--color-blue-900)"
        className="h-15 px-12 py-3 title-h4"
      />
    </div>
  );
}