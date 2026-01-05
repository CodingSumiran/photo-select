'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// 타입 정의
type Emotion = {
  type: string;
  emoji: string;
  label: string;
  count: number;
};

type Photo = {
  id: number;
  url: string;
  emotion: string;
  confidence: number;
};

type AnalysisData = {
  total: number;
  emotions: Emotion[];
  photos: Photo[];
};

export default function Result() {
  const router = useRouter();
  const hasStartedRef = useRef(false);
  
  const [mounted, setMounted] = useState(false);
  const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [extractCount, setExtractCount] = useState(6);
  const [showFinal, setShowFinal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const generateMockAnalysis = useCallback((photos: string[]): AnalysisData => {
    const emotions = ['smile', 'focus', 'sad', 'other'];
    const emotionLabels: Record<string, { emoji: string; label: string }> = {
      smile: { emoji: '😊', label: '미소' },
      focus: { emoji: '🎯', label: '집중' },
      sad: { emoji: '😢', label: '슬픔' },
      other: { emoji: '📷', label: '기타' },
    };

    const photoResults: Photo[] = photos.map((url, index) => {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const confidence = randomEmotion === 'other' ? 0 : Math.floor(Math.random() * 30) + 70;
      return { id: index + 1, url, emotion: randomEmotion, confidence };
    });

    const emotionCounts: Emotion[] = emotions.reduce((acc: Emotion[], emotion) => {
      const count = photoResults.filter(p => p.emotion === emotion).length;
      if (count > 0) {
        acc.push({
          type: emotion,
          emoji: emotionLabels[emotion].emoji,
          label: emotionLabels[emotion].label,
          count,
        });
      }
      return acc;
    }, []);

    return {
      total: photos.length,
      emotions: emotionCounts,
      photos: photoResults.sort((a, b) => b.confidence - a.confidence),
    };
  }, []);

  // 클라이언트 마운트 후 localStorage 읽기
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('uploadedPhotos');
    const photos = stored ? JSON.parse(stored) as string[] : [];
    setInitialPhotos(photos);
    setExtractCount(Math.min(photos.length || 1, 6));
    
    if (photos.length === 0) {
      setIsLoading(false);
    }
  }, []);

  // 분석 시작
  useEffect(() => {
    if (!mounted || hasStartedRef.current || initialPhotos.length === 0) return;
    hasStartedRef.current = true;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setLoadingProgress(current);
      
      if (current >= initialPhotos.length) {
        clearInterval(interval);
        setTimeout(() => {
          const mockResult = generateMockAnalysis(initialPhotos);
          setAnalysisData(mockResult);
          
          const detected = mockResult.emotions
            .filter(e => e.type !== 'other' && e.count > 0)
            .map(e => e.type);
          setSelectedEmotions(detected);
          setIsLoading(false);
        }, 100);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [mounted, initialPhotos, generateMockAnalysis]);

  const toggleEmotion = (type: string) => {
    setSelectedEmotions(prev =>
      prev.includes(type) ? prev.filter(e => e !== type) : [...prev, type]
    );
  };

  const filteredPhotos = analysisData?.photos
    ?.filter(p => selectedEmotions.includes(p.emotion))
    .slice(0, extractCount) || [];

  const getEmotionInfo = (emotion: string) => {
    return analysisData?.emotions.find(e => e.type === emotion);
  };

  const maxExtractCount = analysisData?.photos
    ?.filter(p => selectedEmotions.includes(p.emotion)).length || 1;

  const handleSaveSelected = async () => {
    if (filteredPhotos.length === 0) return;
    
    setIsSaving(true);
    try {
      for (const photo of filteredPhotos) {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const fileName = `selected-${Date.now()}-${photo.id}.jpg`;
        
        await supabase.storage.from('photos').upload(fileName, blob);
      }
      alert(`${filteredPhotos.length}장 저장 완료!`);
    } catch (error) {
      console.error(error);
      alert('저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!analysisData) return;
    
    setIsSaving(true);
    try {
      for (const photo of analysisData.photos) {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const fileName = `all-${Date.now()}-${photo.id}-${photo.emotion}.jpg`;
        
        await supabase.storage.from('photos').upload(fileName, blob);
      }
      alert(`${analysisData.total}장 전체 저장 완료!`);
    } catch (error) {
      console.error(error);
      alert('저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  // 마운트 전 빈 화면
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">사진 분석 중...</h2>
        <p className="text-sm text-gray-500 mb-4">
          {initialPhotos.length}장 중 {loadingProgress}장 완료
        </p>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all" 
            style={{width: `${initialPhotos.length > 0 ? (loadingProgress / initialPhotos.length) * 100 : 0}%`}}
          ></div>
        </div>
      </main>
    );
  }

  // 데이터 없음
  if (!analysisData) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">분석할 사진이 없습니다.</p>
        <button onClick={() => router.push('/')} className="text-blue-500 font-medium">
          홈으로 돌아가기
        </button>
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
                <div className="aspect-square bg-gray-100">
                  <img src={photo.url} alt={`photo-${photo.id}`} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 bg-white border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{info?.emoji} {info?.label}</span>
                    <span className="text-sm font-bold text-blue-500">{photo.confidence}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowFinal(false)}
            className="w-full bg-gray-100 text-gray-600 py-4 rounded-xl font-medium"
          >
            다시 선택
          </button>
          <button
            onClick={handleSaveSelected}
            disabled={isSaving}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : `💾 선택한 ${filteredPhotos.length}장 저장`}
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full border-2 border-blue-500 text-blue-500 py-4 rounded-xl font-medium disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : `📊 전체 분석 결과 저장 (${analysisData?.total}장)`}
          </button>
        </div>
      </main>
    );
  }

  // 분석 결과 + 필터 화면
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="text-gray-600 text-lg">←</button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-6">분석 완료!</h1>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">📊 {analysisData.total}장 분석 결과</p>
        <div className="grid grid-cols-2 gap-2">
          {analysisData.emotions.map((emotion) => (
            <div key={emotion.type} className="bg-white rounded-lg p-3 flex items-center gap-2">
              <span className="text-xl">{emotion.emoji}</span>
              <div>
                <p className="text-xs text-gray-500">{emotion.label}</p>
                <p className="font-bold text-blue-600">{emotion.count}장</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                  isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {emotion.emoji} {emotion.label} ({emotion.count}) {isSelected && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">추출할 사진 수</p>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setExtractCount(Math.max(1, extractCount - 1))}
            disabled={extractCount <= 1}
            className={`w-12 h-12 rounded-full border-2 text-xl font-bold transition ${
              extractCount <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-blue-400 text-blue-500 hover:bg-blue-50'
            }`}
          >-</button>
          <span className="text-3xl font-bold w-12 text-center text-blue-600">{extractCount}</span>
          <button
            onClick={() => setExtractCount(Math.min(maxExtractCount, extractCount + 1))}
            disabled={extractCount >= maxExtractCount}
            className={`w-12 h-12 rounded-full border-2 text-xl font-bold transition ${
              extractCount >= maxExtractCount ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-blue-400 text-blue-500 hover:bg-blue-50'
            }`}
          >+</button>
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">최대 {maxExtractCount}장 선택 가능</p>
      </div>

      <button
        onClick={() => setShowFinal(true)}
        disabled={selectedEmotions.length === 0}
        className={`w-full py-4 rounded-xl font-medium transition ${
          selectedEmotions.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        사진 추출하기
      </button>
    </main>
  );
}