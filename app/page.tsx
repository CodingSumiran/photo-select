export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* 로고 */}
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6">
        📸
      </div>
      
      {/* 타이틀 */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">포토셀렉</h1>
      <p className="text-gray-500 mb-8">AI가 원아 사진을 자동 분류해드려요</p>
      
      {/* 버튼들 */}
      <div className="w-full max-w-xs space-y-3">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-medium transition">
          📷 사진 업로드
        </button>
        <button className="w-full border-2 border-blue-500 text-blue-500 py-4 rounded-xl font-medium opacity-50 cursor-not-allowed">
          📁 이전 결과 보기
        </button>
      </div>
      
      {/* 푸터 */}
      <p className="text-xs text-gray-400 mt-12">
        Made by sumiran
      </p>
    </main>
  );
}