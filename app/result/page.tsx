'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// AI 분석 결과 시뮬레이션 (실제로는 API에서 받아옴)
// 감지된 감정만 포함, 0장인 건 아예 없음
const mockAnalysis = {
  total: 17,
  emotions: [
    { type: 'smile', emoji: '😊', label: '미소', count: 8 },
    { type: 'focus', emoji: '🎯', label: '집중', count: 5 },
    { type: 'sad', emoji: '😢', label: '슬픔', count: 1 },
    { type: 'other', emoji: '📷', label: '기타', count: 3 }, // 풍경, 음식, 사람 아닌 것
  ],
  photos: [
    { id: 1, emotion: 'smile', confidence: 95, preview: null },
    { id: 2, emotion: 'smile', confidence: 92, preview: null },
    { id: 3, emotion: 'focus', confidence: 88, preview: null },
    { id: 4, emotion: 'smile', confidence: 85, preview: null },
    { id: 5, emotion: 'focus', confidence: 82, preview: null },
    { id: 6, emotion: 'smile', confidence: 79, preview: null },
    { id: 7, emotion: 'focus', confidence: 75, preview: null },
    { id: 8, emotion: 'sad', confidence: 72, preview: null },
    { id: 9, emotion: 'smile', confidence: 70, preview: null },
    { id: 10, emotion: 'focus', confidence: 68, preview: null },
    { id: 11, emotion: 'other', confidence: 0, preview: null }, // 풍경
    { id: 12, emotion: 'other', confidence: 0, preview: null }, // 음식
    { id: 13, emotion: 'other', confidence: 0, preview: null }, // 사물
    { id: 14, emotion: 'smile', confidence: 65, preview: null },
    { id: 15, emotion: 'focus', confidence: 62, preview: null },
    { id: 16, emotion: 'smile', confidence: 58, preview: null },
    { id: 17, emotion: 'smile', confidence: 55, preview: null },
  ]
};

export default function Result() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState(mockAnalysis);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [extractCount, setExtractCount] = useState(6);
  const [showFinal, setShowFinal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 분석 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // 기타 제외하고 감지된 감정들 자동 선택
      const detected = analysisData.emotions
        .filter(e => e.type !== 'other' && e.count > 0)
        .map(e => e.type);
      setSelectedEmotions(detected);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleEmotion = (type: string) => {
    setSelectedEmotions(prev =>
      prev.includes(type)
        ? prev.filter(e => e !== type)
        : [...prev, type]
    );
  };

  const filteredPhotos = analysisData.photos
    .filter(p => selectedEmotions.includes(p.emotion))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, extractCount);

  const getEmotionInfo = (emotion: string) => {
    return analysisData.emotions.find(e => e.type === emotion);
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">사진 분석 중...</h2>
        <p className="text-sm text-gray-500 mb-4">{analysisData.total}장 분석 중</p>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      </main>
    );
  }

  // 최종 결과 화면
  if (showFinal) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setShowFinal(false)} className="text-gray-600 text-lg">←</button>
          <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-6">추출 완료</h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">상위 {filteredPhotos.length}장</span>
          <div className="flex gap-1">
            {selectedEmotions.map(type => {
              const info = getEmotionInfo(type);
              return (
                <span key={type} className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                  {info?.emoji} {info?.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {filteredPhotos.map((photo) => {
            const info = getEmotionInfo(photo.emotion);
            return (
              <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow">
                {/* 실제 사진 영역 (지금은 플레이스홀더) */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-4xl">{info?.emoji}</span>
                </div>
                {/* 하단 정보 */}
                <div className="p-2 bg-white border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {info?.emoji} {info?.label}
                    </span>
                    <span className="text-sm font-bold text-blue-500">
                      {photo.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFinal(false)}
            className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-medium"
          >
            다시 선택
          </button>
          <button
            onClick={() => alert('저장 기능은 Supabase 연동 후 구현!')}
            className="flex-1 bg-blue-500 text-white py-4 rounded-xl font-medium"
          >
            💾 저장하기
          </button>
        </div>
      </main>
    );
  }

  // 분석 결과 + 필터 화면
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="text-gray-600 text-lg">←</button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-6">분석 완료!</h1>
      </div>

      {/* 분석 결과 요약 - 감지된 것만 표시 */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          📊 {analysisData.total}장 분석 결과
        </p>
        <div className="grid grid-cols-2 gap-2">
          {analysisData.emotions.map((emotion) => (
            <div
              key={emotion.type}
              className="bg-white rounded-lg p-3 flex items-center gap-2"
            >
              <span className="text-xl">{emotion.emoji}</span>
              <div>
                <p className="text-xs text-gray-500">{emotion.label}</p>
                <p className="font-bold text-blue-600">{emotion.count}장</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 필터 선택 - 감지된 감정만 */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">가져올 감정 선택</p>
        <div className="flex flex-wrap gap-2">
          {analysisData.emotions.map((emotion) => {
            const isSelected = selectedEmotions.includes(emotion.type);

            return (
              <button
                key={emotion.type}
                onClick={() => toggleEmotion(emotion.type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {emotion.emoji} {emotion.label} ({emotion.count}) {isSelected && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 장수 선택 */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">추출할 사진 수</p>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setExtractCount(Math.max(1, extractCount - 1))}
            className="w-12 h-12 rounded-full border-2 border-gray-300 text-xl hover:border-blue-400 transition"
          >
            -
          </button>
          <span className="text-3xl font-bold w-12 text-center">{extractCount}</span>
          <button
            onClick={() => setExtractCount(Math.min(20, extractCount + 1))}
            className="w-12 h-12 rounded-full border-2 border-gray-300 text-xl hover:border-blue-400 transition"
          >
            +
          </button>
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">
          선택한 감정 중 신뢰도 높은 순 {extractCount}장
        </p>
      </div>

      {/* 추출 버튼 */}
      <button
        onClick={() => setShowFinal(true)}
        disabled={selectedEmotions.length === 0}
        className={`w-full py-4 rounded-xl font-medium transition ${
          selectedEmotions.length > 0
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        사진 추출하기
      </button>
    </main>
  );
}