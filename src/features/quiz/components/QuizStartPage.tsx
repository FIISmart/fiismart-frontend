interface Props {
  onStart: () => void;
  quizTitle: string;
}

export default function QuizStartPage({ onStart, quizTitle }: Props) {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="bg-[#9B8EC7] text-white text-sm font-medium px-6 h-[32px] flex items-center justify-center rounded-full mb-6 shadow-sm">
        FIISmart Learning
      </div>

      <div className="bg-white w-full max-w-[512px] rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col items-center">
        <div className="h-[8px] w-full bg-gradient-to-r from-[#B4D3D9] via-[#BDA6CE] to-[#9B8EC7]"></div>

        <div className="p-8 w-full flex flex-col items-center">
          <div className="w-[80px] h-[80px] bg-[#F2EAE0] rounded-[16px] flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[#9B8EC7]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h1 className="text-[24px] font-bold text-gray-900 mb-2 text-center">
            {quizTitle}
          </h1>

          <p className="text-[16px] text-[#6A7282] leading-[24px] text-center mb-8 max-w-[368px]">
            Test your knowledge with this quick quiz.
          </p>

          <div className="flex w-full gap-4 mb-8">
            <div className="flex-1 h-[78px] bg-[#B4D3D9]/20 rounded-[16px] flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-gray-900">10</span>
              <span className="text-[12px] text-[#6A7282]">Questions</span>
            </div>

            <div className="flex-1 h-[78px] bg-[#B4D3D9]/20 rounded-[16px] flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-gray-900">10 min</span>
              <span className="text-[12px] text-[#6A7282]">Duration</span>
            </div>

            <div className="flex-1 h-[78px] bg-[#B4D3D9]/20 rounded-[16px] flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-gray-900">60%</span>
              <span className="text-[12px] text-[#6A7282]">Pass Score</span>
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full h-[52px] rounded-[16px] bg-gradient-to-r from-[#BDA6CE] to-[#9B8EC7] text-white font-semibold text-[16px] hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
