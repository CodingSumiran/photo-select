'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Upload() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    
    // 미리보기 생성
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (files.length === 0) {
      alert('사진을 선택해주세요!');
      return;
    }
    // TODO: 실제 분석 로직
    router.push('/result');
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="text-gray-600 text-lg"
        >
          ← 
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-6">
          사진 선택
        </h1>
      </div>

      {/* 업로드 영역 */}
      <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center mb-4 bg-white cursor-pointer hover:border-blue-400 transition">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-5xl mb-3">📁</div>
        <p className="text-gray-500">터치해서 사진 선택</p>
        <p className="text-gray-400 text-sm mt-1">여러 장 선택 가능</p>
      </label>

      {/* 선택된 사진들 */}
      {previews.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mb-4">
            {files.length}장 선택됨
          </p>
        </>
      )}

      {/* 분석 버튼 */}
      <button
        onClick={handleAnalyze}
        disabled={files.length === 0}
        className={`w-full py-4 rounded-xl font-medium transition ${
          files.length > 0
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        🔍 사진 분석하기 ({files.length}장)
      </button>
    </main>
  );
}