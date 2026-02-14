"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// ▼▼▼ 設定（変更なし） ▼▼▼
const MAX_LINES_PER_PAGE = 17; 
const CHARS_PER_LINE = 16;     

export default function Home() {
  const [text, setText] = useState("");
  const [isAnimating, setIsAnimating] = useState(true);

  // ▼▼▼ 初期ロード（ローカルストレージ） ▼▼▼
  useEffect(() => {
    const savedText = localStorage.getItem("notebook_main_text");
    if (savedText) setText(savedText);
  }, []);

  // ▼▼▼ 制限なし入力ハンドラー ▼▼▼
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    localStorage.setItem("notebook_main_text", newText);
  };

  // ▼▼▼ ノート表示用テキスト生成ロジック ▼▼▼
  const getDisplayText = (fullText: string) => {
    if (!fullText) return "";

    const lines = fullText.split("\n");
    let visualLines: string[] = [];

    lines.forEach((line) => {
      if (line === "") {
        visualLines.push(""); 
      } else {
        for (let i = 0; i < line.length; i += CHARS_PER_LINE) {
          visualLines.push(line.substring(i, i + CHARS_PER_LINE));
        }
      }
    });

    const slicedLines = visualLines.slice(-MAX_LINES_PER_PAGE);
    return slicedLines.join("\n");
  };

  const displayText = getDisplayText(text);

  return (
    // ▼▼▼ 変更点: bg-[#FFD1DC] を追加し、文字色を黒系(text-gray-800)に変更 ▼▼▼
    <main className="min-h-screen flex flex-row items-center justify-center p-4 gap-4 overflow-hidden text-gray-800 bg-[#FFD1DC]">
      
      {/* 
        === 左側：ノートブック表示エリア ===
      */}
      <div 
        className="relative w-[70%] max-w-6xl aspect-square md:aspect-[4/3] perspective-container overflow-hidden rounded-2xl flex-shrink-0"
        style={{ perspectiveOrigin: "50% 30%" }}
      >
        
        {/* 背景画像 */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <Image
            src="/note.png"
            alt="Notebook"
            width={1024}
            height={1024}
            className="object-contain w-full h-full drop-shadow-2xl"
            priority
          />
        </div>
        

        {/* 左ページ (表示エリア) */}
        <div 
          className="absolute top-[27%] left-[22%] w-[30%] h-[60%] z-10 
                     pointer-events-none overflow-hidden origin-center"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateZ(-27deg) rotateY(10deg) rotateX(30deg) skewY(5deg)",
          }}
        >
          <p 
            className="w-full h-full text-base md:text-s text-[#6d667e] whitespace-pre font-hand leading-[1.6] tracking-widest"
            style={{
              textShadow: "1px 1px 1px rgba(0,0,0,0.05), 0 0 5px rgba(109, 102, 126, 0.1)",
              opacity: 0.9
            }}
          >
            {displayText}
          </p>
        </div>

        {/* 右ページ (ロゴエリア) */}
        <div 
          className="absolute top-[9%] right-[17%] w-[40%] h-[48%] z-10 
                     pointer-events-none overflow-hidden origin-center flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateZ(-40deg) rotateY(20deg) rotateX(0deg) skewY(0deg)",
          }}
        >
          <div className="relative w-2/3 h-2/3 opacity-80 rotate-12">
            <div className="w-full h-full flex items-center justify-center text-[#6d667e]/50 font-hand">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
          </div>
        </div>

        {/* 決め台詞 */}
        <div 
          className="absolute top-[38%] right-[1%] w-[30%] h-[60%] z-10 
                     pointer-events-none overflow-hidden origin-center"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateZ(-27deg) rotateY(10deg) rotateX(30deg) skewY(5deg)",
          }}
        >
          <p 
            className="w-full h-full text-base md:text-lg text-[#6d667e] whitespace-pre-wrap font-hand leading-[1.6] tracking-widest break-all"
            style={{
              textShadow: "1px 1px 1px rgba(0,0,0,0.05), 0 0 5px rgba(109, 102, 126, 0.1)",
              opacity: 0.9
            }}
          >
            5人揃ってガールフレンジャー！
          </p>
        </div>

        {/* 5人画像 */}
        <div 
          className="absolute top-[30%] right-[6%] w-[40%] h-[48%] z-10 
                     pointer-events-none overflow-hidden origin-center flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateZ(-36deg) ",
          }}
        >
          <div className="relative w-2/3 h-2/3 opacity-80 rotate-12">
            <div className="w-full h-full flex items-center justify-center text-[#6d667e]/50 font-hand">
              <Image src="/five.png" alt="Logo" fill className="object-contain" />
            </div>
          </div>
        </div>

        {/* 腕のアニメーション */}
        <div className="absolute -bottom-[15%] -right-[8%] w-[50%] z-50 pointer-events-none select-none">
          <style jsx>{`
            @keyframes writing-step {
              0% { transform: translate(0, -100px); }
              50% { transform: translate(-200px, 100px) rotateZ(-30deg); }
            }
          `}</style>
          <div style={{ animation: "writing-step 1.33s steps(1) infinite", animationPlayState: isAnimating ? "running" : "paused"}}>
            <Image 
              src="/hand.png" 
              alt="Hand Writing" 
              width={800} 
              height={1000} 
              className="w-full h-auto drop-shadow-xl" 
            />
          </div>
        </div>
      </div>

      {/* 
        === 右側：入力エリア === 
      */}
      <div className="flex-1 max-w-sm h-[90vh] z-20 flex flex-col gap-3 animate-in slide-in-from-right-10 fade-in duration-700">
        
        {/* コントロールヘッダー (背景色に合わせて見やすく調整) */}
        <div className="flex flex-col gap-2 px-3 py-3 bg-white/40 rounded-xl border border-white/40 shadow-lg">
          <div className="flex items-center justify-between">
            <label htmlFor="diary-input" className="text-sm text-gray-700 font-bold tracking-widest">
              SCRIPT
            </label>
            <div className="text-[10px] text-gray-600 font-mono">
              {text.length} chars
            </div>
          </div>
          
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`
              w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300
              border border-white/40 hover:scale-[1.02] active:scale-95 shadow-sm
              ${isAnimating 
                ? "bg-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                : "bg-gray-200 text-gray-500"}
            `}
          >
            <span className={isAnimating ? "animate-pulse" : ""}>
              {isAnimating ? "● WRITING" : "II PAUSED"}
            </span>
          </button>
        </div>
        
        <div className="relative flex-1">
          {/* テキストエリアも背景色に合わせて白っぽく変更 */}
          <textarea
            id="diary-input"
            value={text}
            onChange={handleTextChange} 
            placeholder="Input text..."
            className="w-full h-full bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-4
                       text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50
                       resize-none transition-all duration-300 shadow-xl font-hand text-base leading-relaxed
                       scrollbar-thin scrollbar-thumb-purple-400/50 scrollbar-track-transparent"
          />
        </div>
      </div>

    </main>
  );
}