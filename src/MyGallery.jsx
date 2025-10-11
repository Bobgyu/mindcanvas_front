import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function MyGallery() {
  const [drawings, setDrawings] = useState([]);
  const [error, setError] = useState('');
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [modal, setModal] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();

  // 색칠하기 원본 이미지 목록
  const colorImages = [
    { id: 1, name: '호작도', filename: 'hojakdo.png', description: '조선시대 화가 김홍도의 호작도' },
    { id: 2, name: '미인도', filename: 'miindo.png', description: '조선시대 미인도' },
    { id: 3, name: '천지창조', filename: 'thecreation.png', description: '미켈란젤로의 천지창조' },
    { id: 4, name: '진주 귀걸이를 한 소녀', filename: 'pearl.png', description: '베르메르의 진주 귀걸이를 한 소녀' },
    { id: 5, name: '피카소', filename: 'picaso.png', description: '피카소의 작품' },
    { id: 6, name: '해바라기', filename: 'sunflower.png', description: '반 고흐의 해바라기' },
    { id: 7, name: '모나리자', filename: 'monarisa.png', description: '레오나르도 다 빈치의 모나리자' },
    { id: 8, name: '별이 빛나는 밤', filename: 'starnight.png', description: '반 고흐의 별이 빛나는 밤' }
  ];

  // 이미지 유사도를 계산하는 함수
  const calculateImageSimilarity = (img1, img2) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 두 이미지를 같은 크기로 리사이즈
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    
    // 첫 번째 이미지 그리기
    ctx.drawImage(img1, 0, 0, size, size);
    const data1 = ctx.getImageData(0, 0, size, size).data;
    
    // 두 번째 이미지 그리기
    ctx.drawImage(img2, 0, 0, size, size);
    const data2 = ctx.getImageData(0, 0, size, size).data;
    
    // 픽셀 차이 계산
    let diff = 0;
    for (let i = 0; i < data1.length; i += 4) {
      const r1 = data1[i];
      const g1 = data1[i + 1];
      const b1 = data1[i + 2];
      const r2 = data2[i];
      const g2 = data2[i + 1];
      const b2 = data2[i + 2];
      
      diff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    }
    
    // 유사도 점수 (낮을수록 유사)
    return diff / (size * size * 3 * 255);
  };

  // 색칠된 이미지에서 가장 유사한 원본 이미지 찾기
  const findMostSimilarOriginalImage = async (coloredImageData) => {
    return new Promise((resolve) => {
      const coloredImg = new Image();
      coloredImg.crossOrigin = 'anonymous';
      coloredImg.onload = async () => {
        let bestMatch = colorImages[0]; // 기본값
        let bestScore = Infinity;
        
        // 모든 원본 이미지와 비교
        const comparisons = colorImages.map(async (originalImage) => {
          return new Promise((resolve) => {
            const originalImg = new Image();
            originalImg.crossOrigin = 'anonymous';
            originalImg.onload = () => {
              const similarity = calculateImageSimilarity(coloredImg, originalImg);
              resolve({ image: originalImage, score: similarity });
            };
            originalImg.onerror = () => resolve({ image: originalImage, score: Infinity });
            originalImg.src = `/src/imgdata/colorimg/${originalImage.filename}`;
          });
        });
        
        const results = await Promise.all(comparisons);
        
        // 가장 유사한 이미지 찾기
        for (const result of results) {
          if (result.score < bestScore) {
            bestScore = result.score;
            bestMatch = result.image;
          }
        }
        
        resolve(bestMatch);
      };
      coloredImg.onerror = () => resolve(colorImages[0]); // 오류 시 기본값
      coloredImg.src = coloredImageData;
    });
  };

  const fetchDrawings = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/drawings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        setDrawings(response.data.drawings);
        // 디버깅: 분석 결과가 있는 그림들 확인
        console.log('갤러리 그림들:', response.data.drawings.map(d => ({
          id: d.id,
          hasAnalysis: !!d.analysis_result,
          analysisResult: d.analysis_result,
          drawingType: d.drawing_type
        })));
      }
    } catch (err) {
      console.error("그림 가져오기 오류:", err);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
      } else {
        setError('그림을 가져오는 중 오류가 발생했습니다.');
      }
    }
  };

  useEffect(() => {
    fetchDrawings();
  }, [navigate]);

  // location.state에서 selectedDrawingId가 있으면 해당 그림을 선택
  useEffect(() => {
    if (location.state && location.state.selectedDrawingId && drawings.length > 0) {
      const targetDrawing = drawings.find(drawing => drawing.id === location.state.selectedDrawingId);
      if (targetDrawing) {
        setSelectedDrawing(targetDrawing);
        console.log('선택된 그림:', targetDrawing);
        console.log('분석 결과:', targetDrawing.analysis_result);
        if (targetDrawing.analysis_result) {
          console.log('분석 결과 필드들:', Object.keys(targetDrawing.analysis_result));
          console.log('AI 분석 내용:', targetDrawing.analysis_result.ai_analysis);
          console.log('Speech 분석 내용:', targetDrawing.analysis_result.speech_analysis);
        }
      }
      // state를 클리어해서 다음 방문 시에는 선택되지 않도록
      navigate(location.pathname, { replace: true });
    }
  }, [drawings, location.state, navigate, location.pathname]);

  // 페이지 포커스 시 데이터 새로고침 (분석 완료 후 갤러리로 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      // 분석 완료 플래그가 있으면 데이터 새로고침 (자동 이동 없이)
      if (localStorage.getItem('analysisCompleted')) {
        fetchDrawings();
        localStorage.removeItem('analysisCompleted');
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleThumbnailClick = (drawing) => {
    // 모든 그림을 상세보기로 처리 (삭제 기능을 위해)
    console.log('선택된 그림:', drawing);
    console.log('분석 결과:', drawing.analysis_result);
    if (drawing.analysis_result) {
      console.log('분석 결과 필드들:', Object.keys(drawing.analysis_result));
      console.log('AI 분석 내용:', drawing.analysis_result.ai_analysis);
      console.log('Speech 분석 내용:', drawing.analysis_result.speech_analysis);
    }
    setSelectedDrawing(drawing);
  };

  const closeDetail = () => {
    setSelectedDrawing(null);
  };

  const closeModal = () => {
    setModal({ show: false, message: '', type: '' });
  };

  const handleDeleteDrawing = async (drawingId) => {
    setModal({ 
      show: true, 
      message: '정말로 이 그림을 삭제하시겠습니까?', 
      type: 'warning',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.delete(`http://localhost:5000/api/drawings/${drawingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.data.success) {
            setModal({ 
              show: true, 
              message: '그림이 삭제되었습니다.', 
              type: 'success' 
            });
            // 상세보기 모달 닫기
            setSelectedDrawing(null);
            // 목록 새로고침
            fetchDrawings();
          } else {
            setModal({ 
              show: true, 
              message: '그림 삭제에 실패했습니다.', 
              type: 'error' 
            });
          }
        } catch (error) {
          console.error('그림 삭제 오류:', error);
          if (error.response?.status === 401) {
            setModal({ 
              show: true, 
              message: '로그인이 만료되었습니다. 다시 로그인해주세요.', 
              type: 'warning' 
            });
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            setTimeout(() => navigate('/login'), 2000);
          } else {
            setModal({ 
              show: true, 
              message: '그림 삭제 중 오류가 발생했습니다.', 
              type: 'error' 
            });
          }
        }
      }
    });
  };

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col relative" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
      {/* 모달 오버레이 */}
      {modal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            margin: '20px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            {/* 모달 아이콘 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {modal.type === 'success' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#d4edda',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#28a745' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {modal.type === 'error' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#dc3545' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {modal.type === 'warning' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#ffc107' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* 모달 메시지 */}
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              {modal.message}
            </p>
            
            {/* 버튼들 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {modal.type === 'warning' ? (
                <>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (modal.onConfirm) {
                        modal.onConfirm();
                      }
                      closeModal();
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: modal.type === 'success' ? 'rgb(39, 192, 141)' : 
                                   modal.type === 'error' ? '#dc3545' : '#ffc107',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
        <button className="text-gray-600" onClick={() => {
          // 그리기 활동에서 온 경우 MainPage로 이동
          if (localStorage.getItem('fromThemeDrawing') || localStorage.getItem('fromColorDrawing') || 
              localStorage.getItem('fromHomeDrawing') || localStorage.getItem('fromTreeDrawing') || 
              localStorage.getItem('fromPersonDrawing')) {
            localStorage.removeItem('fromThemeDrawing');
            localStorage.removeItem('fromColorDrawing');
            localStorage.removeItem('fromHomeDrawing');
            localStorage.removeItem('fromTreeDrawing');
            localStorage.removeItem('fromPersonDrawing');
            navigate('/mainpage');
          } else {
            // 일반적인 경우 마이페이지로 이동
            navigate('/mypage');
          }
        }}>
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '24px', height: '24px' }} />
        </button>
        <h1 className="text-xl font-bold" style={{color: '#111827'}}>내 그림 갤러리</h1>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow p-6 overflow-y-auto scrollbar-hide">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {drawings.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500">아직 저장된 그림이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {drawings.map((drawing) => (
              <div 
                key={drawing.id} 
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative border-2"
                style={{backgroundColor: '#F9FAF9', borderColor: 'rgb(39, 192, 141)'}}
                onClick={() => handleThumbnailClick(drawing)}
              >
                <img 
                  src={drawing.image} 
                  alt={`Drawing ${drawing.id}`} 
                  className="w-full h-full object-cover"
                />
                {/* 분석된 그림에만 "분석" 표시 */}
                {drawing.analysis_result && (
                  <div className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg" style={{backgroundColor: 'rgb(39, 192, 141)'}}>
                    분석
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {new Date(drawing.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 상세보기 모달 */}
        {selectedDrawing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col shadow-2xl" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
              <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
                <button className="text-gray-600" onClick={closeDetail}>
                  <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '24px', height: '24px' }} />
                </button>
                <h1 className="text-xl font-bold" style={{color: '#111827'}}>
                  {selectedDrawing.drawing_type === 'theme' ? '테마그리기' :
                   selectedDrawing.drawing_type === 'colored' ? '색칠하기' :
                   selectedDrawing.drawing_type === 'house' ? '집그리기' :
                   selectedDrawing.drawing_type === 'tree' ? '나무그리기' :
                   selectedDrawing.drawing_type === 'person' ? '사람그리기' :
                   '그림 상세보기'}
                </h1>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDeleteDrawing(selectedDrawing.id)}
                    className="text-gray-400 transition-colors p-1 rounded-full hover:bg-opacity-20"
                    style={{'&:hover': {color: '#dc3545', backgroundColor: '#f8d7da'}}}
                    title="그림 삭제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </header>
              
              <main className="flex-grow p-6 overflow-y-auto scrollbar-hide">
                <img 
                  src={selectedDrawing.image} 
                  alt={`Drawing ${selectedDrawing.id}`} 
                  className="w-full h-auto rounded-lg mb-4"
                />
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">저장일: {new Date(selectedDrawing.created_at).toLocaleString()}</p>
                </div>

              {/* 이어서 색칠하기 버튼 (테마/색칠하기 그림에만) */}
              {(selectedDrawing.drawing_type === 'theme' || selectedDrawing.drawing_type === 'colored') && (
                <div className="mb-4">
                  <button
                    onClick={async () => {
                      try {
                        // 자동으로 가장 유사한 원본 이미지 찾기
                        const detectedImage = await findMostSimilarOriginalImage(selectedDrawing.image);
                        
                        const imageData = {
                          id: selectedDrawing.id,
                          filename: detectedImage.filename,
                          name: detectedImage.name,
                          coloredImage: selectedDrawing.image,
                          isContinue: true
                        };
                        
                        localStorage.setItem('selectedColorImage', JSON.stringify(imageData));
                        navigate('/draw/fillcanvas');
                      } catch (error) {
                        console.error('원본 이미지 자동 감지 실패:', error);
                        alert('원본 이미지를 자동으로 찾을 수 없습니다. 다시 시도해주세요.');
                      }
                    }}
                    className="w-full text-white px-4 py-2 rounded-lg transition-colors"
                    style={{backgroundColor: 'rgb(39, 192, 141)'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#30E8AB'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(39, 192, 141)'}
                  >
                    이어서 색칠하기
                  </button>
                </div>
              )}

              {/* 이어서 그리기 버튼 (분석 버튼을 누른 그림들용) */}
              {!selectedDrawing.analysis_result && selectedDrawing.drawing_type !== 'theme' && selectedDrawing.drawing_type !== 'colored' && (
                <div className="mb-4">
                  <button
                    onClick={() => {
                      // 저장된 그림 데이터를 로컬 스토리지에 저장하고 해당 그리기 페이지로 이동
                      localStorage.setItem('continueDrawing', JSON.stringify({
                        id: selectedDrawing.id,
                        image: selectedDrawing.image,
                        drawingType: selectedDrawing.drawing_type || 'normal'
                      }));
                      
                      // drawing_type에 따라 적절한 페이지로 이동
                      if (selectedDrawing.drawing_type === 'house' || !selectedDrawing.drawing_type) {
                        navigate('/draw/home');
                      } else if (selectedDrawing.drawing_type === 'tree') {
                        navigate('/draw/tree');
                      } else if (selectedDrawing.drawing_type === 'person') {
                        navigate('/draw/person');
                      } else {
                        // 기본값으로 집 그리기 페이지로 이동
                        navigate('/draw/home');
                      }
                    }}
                    className="w-full text-white px-4 py-2 rounded-lg transition-colors"
                    style={{backgroundColor: 'rgb(39, 192, 141)'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#30E8AB'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(39, 192, 141)'}
                  >
                    이어서 그리기
                  </button>
                </div>
              )}

              {selectedDrawing.analysis_result ? (
                <div className="border-t pt-4">

                  {/* 분석하기 버튼 */}
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => {
                        console.log('분석하기 버튼 클릭 - 분석결과:', selectedDrawing.analysis_result);
                        
                        // 갤러리에서 온 경우임을 표시하고 분석 페이지로 이동
                        localStorage.setItem('drawnImage', selectedDrawing.image);
                        localStorage.setItem('analysisResult', JSON.stringify(selectedDrawing.analysis_result));
                        localStorage.setItem('continueDrawing', JSON.stringify({
                          id: selectedDrawing.id,
                          image: selectedDrawing.image,
                          drawingType: selectedDrawing.drawing_type || 'normal',
                          fromGallery: true,
                          hasAiAnalysis: !!(selectedDrawing.analysis_result?.ai_analysis || selectedDrawing.analysis_result?.speech_analysis)
                        }));
                        navigate('/draw/analysis');
                      }}
                      className="px-8 py-3 text-white border-none rounded-full text-base font-bold cursor-pointer shadow-md transition-all duration-200 hover:transform hover:-translate-y-0.5"
                      style={{backgroundColor: 'rgb(39, 192, 141)'}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(35, 173, 127)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(39, 192, 141)'}
                    >
                      분석하기
                    </button>
                  </div>

                  {/* 하단 버튼 영역 - analysis.jsx와 동일한 디자인 */}
                  <div className="flex gap-4 justify-center mt-6 mb-4">
                    {/* 마음코디네이터 찾기 버튼 */}
                    <button
                      onClick={() => navigate('/coordinator', { state: { from: 'gallery-detail', drawingId: selectedDrawing.id } })}
                      className="px-6 py-3 text-white border-none rounded-full text-sm font-bold cursor-pointer shadow-md transition-all duration-200 hover:transform hover:-translate-y-0.5"
                      style={{backgroundColor: 'rgb(39, 192, 141)'}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(35, 173, 127)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(39, 192, 141)'}
                    >
                      마음코디네이터 찾기
                    </button>

                    {/* 근처 상담센터 찾기 버튼 */}
                    <button
                      onClick={() => navigate('/counseling-center')}
                      className="px-6 py-3 text-white border-none rounded-full text-sm font-bold cursor-pointer shadow-md transition-all duration-200 hover:transform hover:-translate-y-0.5"
                      style={{backgroundColor: 'rgb(39, 192, 141)'}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(35, 173, 127)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(39, 192, 141)'}
                    >
                      근처 상담센터 찾기
                    </button>
                  </div>
                  
                  {/* 기존 구조 (objects, total_score, risk_level) 지원 */}
                  {selectedDrawing.analysis_result.objects && Object.entries(selectedDrawing.analysis_result.objects).map(([objType, objData]) => (
                    <div key={objType} className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-800">{objData.label || objType}</h4>
                        {objData.score && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            점수: {objData.score}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {objData.interpretations && objData.interpretations.map((interp, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-800">{interp.feature}</h5>
                              {interp.severity && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  interp.severity === '높음' ? 'bg-red-100 text-red-800' :
                                  interp.severity === '보통' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  심각도: {interp.severity}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{interp.interpretation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* 전체 점수와 위험도 (기존 구조 지원) */}
                  {selectedDrawing.analysis_result.total_score && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <p className="text-sm font-medium text-blue-700">총 점수</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-800">{selectedDrawing.analysis_result.total_score}</p>
                      </div>
                      
                      {selectedDrawing.analysis_result.risk_level && (
                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-sm font-medium text-red-700">위험도</p>
                          </div>
                          <p className="text-2xl font-bold text-red-800">{selectedDrawing.analysis_result.risk_level}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              ) : (
                // 분석되지 않은 일반 그림에만 분석 메시지 표시 (테마/색칠하기 그림 제외)
                !selectedDrawing.analysis_result && selectedDrawing.drawing_type !== 'theme' && selectedDrawing.drawing_type !== 'colored' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">아직 분석되지 않은 그림입니다</p>
                        <p className="text-gray-400 text-sm mt-1">분석을 원하시면 아래 버튼을 눌러주세요</p>
                        <button
                          onClick={() => {
                            console.log('분석하기 버튼 클릭 - 분석결과:', selectedDrawing.analysis_result);
                            
                            // 갤러리에서 온 경우임을 표시하고 분석 페이지로 이동
                            localStorage.setItem('drawnImage', selectedDrawing.image);
                            localStorage.setItem('analysisResult', JSON.stringify(selectedDrawing.analysis_result));
                            localStorage.setItem('continueDrawing', JSON.stringify({
                              id: selectedDrawing.id,
                              image: selectedDrawing.image,
                              drawingType: selectedDrawing.drawing_type || 'normal',
                              fromGallery: true,
                              hasAiAnalysis: !!(selectedDrawing.analysis_result?.ai_analysis || selectedDrawing.analysis_result?.speech_analysis)
                            }));
                            navigate('/draw/analysis');
                          }}
                          className="mt-4 text-white px-6 py-2 rounded-lg transition-colors"
                          style={{backgroundColor: 'rgb(39, 192, 141)'}}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#30E8AB'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(39, 192, 141)'}
                        >
                          분석하기
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
              </main>
            </div>
          </div>
        )}

      </main>

      <style>{`
        .scrollbar-hide {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

      `}</style>
    </div>
  );
}

export default MyGallery;
