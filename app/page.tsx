"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// ▼▼▼ 設定（変更なし） ▼▼▼
const MAX_LINES_PER_PAGE = 17; 
const CHARS_PER_LINE = 16;     

export default function Home() {
  // 入力用（裏側で保持する全文）
  const [inputText, setInputText] = useState("");
  // 表示用（ノートに実際に表示される文字）
  const [displayText, setDisplayText] = useState("");
  
  // アニメーションスイッチ（手動制御）
  const [isAnimating, setIsAnimating] = useState(true);

  // ▼▼▼ 初期ロード（ローカルストレージ） ▼▼▼
  useEffect(() => {
    const savedText = localStorage.getItem("notebook_main_text");
    if (savedText) {
      // ロード時は待たずにすぐ表示させる
      setInputText(savedText);
      setDisplayText(savedText);
    }
  }, []);

  // ▼▼▼ 文字の遅延表示ロジック（ゴーストライター機能） ▼▼▼
  useEffect(() => {
    // 完全に同期していれば何もしない
    if (displayText === inputText) return;

    // 文字が減った場合（バックスペースなど）は、即座に反映（操作性重視）
    if (inputText.length < displayText.length) {
      setDisplayText(inputText);
      return;
    }

    // ★重要: アニメーションがOFF（一時停止中）なら、文字送りも止める
    // これにより「スイッチを切ると書くのも止まる」という演出になります
    if (!isAnimating) return;

    // 文字が増えた場合、0.1秒待って1文字進める
    const timer = setTimeout(() => {
      // 現在の表示文字数 + 1文字分を切り出してセット
      const nextCharIndex = displayText.length + 1;
      setDisplayText(inputText.slice(0, nextCharIndex));
    }, 300); // 100ms = 0.1秒

    return () => clearTimeout(timer);
  }, [inputText, displayText, isAnimating]);


  // ▼▼▼ 制限なし入力ハンドラー ▼▼▼
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    // 入力エリア(inputText)だけ即時更新し、localStorageに保存
    setInputText(newText);
    localStorage.setItem("notebook_main_text", newText);
    
    // ※ displayTextは上のuseEffectが検知して後から追いかけてきます
  };

  // ▼▼▼ ノート表示用テキスト生成ロジック（ページ送り版） ▼▼▼
  const getVisualText = (fullText: string) => {
    if (!fullText) return "";

    // 1. まず全てのテキストを表示用の行（16文字区切り）に分解する
    const lines = fullText.split("\n");
    let allVisualLines: string[] = [];

    lines.forEach((line) => {
      if (line === "") {
        allVisualLines.push(""); 
      } else {
        for (let i = 0; i < line.length; i += CHARS_PER_LINE) {
          allVisualLines.push(line.substring(i, i + CHARS_PER_LINE));
        }
      }
    });

    // 2. 現在何ページ目にいるか計算する (0始まり)
    // 行数が0の場合は0ページ目
    // 例: 17行目までは pageIndex = 0, 18行目(index 17)からは pageIndex = 1
    const totalLines = allVisualLines.length;
    const pageIndex = totalLines === 0 ? 0 : Math.floor((totalLines - 1) / MAX_LINES_PER_PAGE);

    // 3. そのページに表示すべき範囲を切り出す
    const startIndex = pageIndex * MAX_LINES_PER_PAGE;
    const endIndex = startIndex + MAX_LINES_PER_PAGE;
    
    const pageLines = allVisualLines.slice(startIndex, endIndex);

    return pageLines.join("\n");
  };

  const visualDisplayText = getVisualText(displayText);

  return (
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
        

        {/* 左ページ (表示エリア) -> displayTextを使用 */}
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
            {visualDisplayText}
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
          {/* isAnimatingがtrueのときだけ動く */}
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
        
        {/* コントロールヘッダー */}
        <div className="flex flex-col gap-2 px-3 py-3 bg-white/40 rounded-xl border border-white/40 shadow-lg">
          <div className="flex items-center justify-between">
            <label htmlFor="diary-input" className="text-sm text-gray-700 font-bold tracking-widest">
              SCRIPT
            </label>
            <div className="text-[10px] text-gray-600 font-mono flex gap-2">
              {/* 進捗状況を表示：例 (15/100) */}
              <span>{displayText.length} / {inputText.length} chars</span>
              {displayText.length < inputText.length && (
                <span className="text-purple-600 animate-pulse">Writing...</span>
              )}
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
              {isAnimating ? "● WRITING (AUTO)" : "II PAUSED"}
            </span>
          </button>
        </div>
        
        <div className="relative flex-1">
          <textarea
            id="diary-input"
            value={inputText} // ここは即時反映の inputText
            onChange={handleTextChange} 
            placeholder="ここに台本をペーストすると、左側で自動筆記が始まります..."
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