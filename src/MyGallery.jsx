import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyGallery() {
  const [drawings, setDrawings] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // TODO: 실제 사용자 ID를 Context API 또는 Redux에서 가져오도록 수정
  const userId = 1; // 임시 사용자 ID

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/drawings/${userId}`);
        if (response.data.success) {
          setDrawings(response.data.drawings);
        }
      } catch (err) {
        console.error("그림 가져오기 오류:", err);
        setError('그림을 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchDrawings();
  }, [userId]);

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col">
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
        <button className="text-gray-600" onClick={() => navigate(-1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold">내 그림 (작품) 보기</h1>
        <div className="w-6"></div> {/* Placeholder for alignment */}
      </header>

      <main className="flex-grow p-6 overflow-y-auto">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {drawings.length === 0 ? (
          <p className="text-center text-gray-500">아직 저장된 그림이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {drawings.map((drawing) => (
              <div key={drawing.id} className="border border-gray-200 rounded-lg p-4 shadow-md">
                <img src={drawing.image} alt={`Drawing ${drawing.id}`} className="w-full h-auto object-cover rounded-md mb-4" />
                <h2 className="font-bold text-lg mb-2">그림 ID: {drawing.id}</h2>
                <p className="text-gray-600 text-sm mb-2">저장일: {new Date(drawing.created_at).toLocaleString()}</p>
                {drawing.analysis_result && (
                  <div>
                    <h3 className="font-semibold text-md mt-4 mb-2">분석 결과:</h3>
                    <p>총 점수: {drawing.analysis_result.total_score}</p>
                    <p>위험도: {drawing.analysis_result.risk_level}</p>
                    {Object.entries(drawing.analysis_result.objects).map(([objType, objData]) => (
                      <div key={objType} className="mt-2">
                        <h4 className="font-medium text-sm">- {objData.label} (점수: {objData.score})</h4>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          {objData.interpretations.map((interp, index) => (
                            <li key={index}><strong>{interp.feature}</strong>: {interp.interpretation} (심각도: {interp.severity})</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyGallery;
