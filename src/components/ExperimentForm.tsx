import React, { useState, useEffect } from 'react';
import { Music, Image, X, HelpCircle } from 'lucide-react';
import { METRICS, DEBUG_METRICS, EXPERIMENT_CONFIG, PATHS } from '../config';
import { loadAudioSamples, getExperimentCount } from '../utils/audioLoader';
import type { AudioSample } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { InstructionsPopup } from './InstructionsPopup';
import JSZip from 'jszip';

interface PageTimeLog {
  pageIndex: number;
  totalTime: number;  // milliseconds
  visits: number;
}

export function ExperimentForm() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem('currentUser');
  
  // 저장된 데이터 확인
  const savedData = userName ? localStorage.getItem(`responses_${userName}`) : null;
  const initialData = savedData ? JSON.parse(savedData) : null;

  // 초기 상태 설정
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sampleIndex, setSampleIndex] = useState(initialData?.index || 0);
  const [audioSamples, setAudioSamples] = useState<AudioSample[]>([]);
  const [allShuffledSamples, setAllShuffledSamples] = useState<Record<number, AudioSample[]>>(
    initialData?.shuffledSamples || {}  // 저장된 샘플 순서 불러오기
  );
  const [allRatings, setAllRatings] = useState<Record<number, Record<number, Record<string, number>>>>(
    initialData?.ratings || {}
  );
  const [currentRatings, setCurrentRatings] = useState<Record<number, Record<string, number>>>({});
  const [pageLogs, setPageLogs] = useState<PageTimeLog[]>(initialData?.logs || []);

  // 팝업 상태 추가
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // 상태 추가
  const [submissionType, setSubmissionType] = useState<'server' | 'local' | null>(null);

  // 로그인 체크
  useEffect(() => {
    if (!userName) {
      navigate('/');
    }
  }, [userName, navigate]);

  // 데이터 자동 저장 useEffect 수정
  useEffect(() => {
    if (userName && !isSubmitted) {
      console.log('Saving data to localStorage:', {
        ratings: allRatings,
        logs: pageLogs,
        index: sampleIndex,
        shuffledSamples: allShuffledSamples
      });
      
      localStorage.setItem(`responses_${userName}`, JSON.stringify({
        ratings: allRatings,
        logs: pageLogs,
        index: sampleIndex,
        shuffledSamples: allShuffledSamples
      }));
    }
  }, [allRatings, pageLogs, sampleIndex, allShuffledSamples, userName, isSubmitted]);

  // 컴포넌트 마운트 시 데이터 로드 확인
  useEffect(() => {
    if (initialData) {
      console.log('Loaded saved data:', initialData);
      console.log('Loaded shuffled samples:', initialData.shuffledSamples);
    }
  }, []);

  // 컴포넌트 마운트 시 자동으로 팝업 표시 (최초 1회)
  useEffect(() => {
    if (userName) {
      const hasSeenInstructions = sessionStorage.getItem(`instructions_seen_${userName}`);
      if (hasSeenInstructions !== 'true') {
        setShowInstructions(true);
        sessionStorage.setItem(`instructions_seen_${userName}`, 'true');
      }
    }
  }, [userName]);

  const totalSamples = getExperimentCount();
  const activeMetrics = EXPERIMENT_CONFIG.DEBUG_MODE ? DEBUG_METRICS : METRICS;
  const [pageStartTime, setPageStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const loadSamples = async () => {
      setIsLoading(true);
      try {
        if (sampleIndex >= totalSamples) {
          setIsLoading(false);
          return;
        }

        // 저장된 샘플 순서가 있는 경우 사용
        if (allShuffledSamples[sampleIndex] && allShuffledSamples[sampleIndex].length > 0) {
          console.log(`Using saved samples for index ${sampleIndex}:`, allShuffledSamples[sampleIndex]);
          // leadsheet.wav 파일 제외
          const filteredSamples = allShuffledSamples[sampleIndex].filter(
            sample => !sample.id.includes('leadsheet.wav')
          );
          setAudioSamples(filteredSamples);
        } else {
          console.log(`Loading new samples for index ${sampleIndex}`);
          const samples = await loadAudioSamples(sampleIndex);
          console.log(`Loaded new samples:`, samples);
          
          // leadsheet.wav 파일 제외
          const filteredSamples = samples.filter(
            sample => !sample.id.includes('leadsheet.wav')
          );
          setAudioSamples(filteredSamples);
          
          // 새로 로드한 샘플을 allShuffledSamples에 저장
          setAllShuffledSamples(prev => {
            const updated = {
            ...prev,
              [sampleIndex]: filteredSamples
            };
            console.log(`Updated allShuffledSamples:`, updated);
            
            // 즉시 localStorage에도 저장
            if (userName) {
              const currentData = localStorage.getItem(`responses_${userName}`);
              const parsedData = currentData ? JSON.parse(currentData) : {};
              localStorage.setItem(`responses_${userName}`, JSON.stringify({
                ...parsedData,
                shuffledSamples: updated
              }));
            }
            
            return updated;
          });
        }

        if (allRatings[sampleIndex]) {
          setCurrentRatings(allRatings[sampleIndex]);
        } else {
          setCurrentRatings({});
        }
      } catch (error) {
        console.error('Error loading samples:', error);
      }
      setIsLoading(false);
    };

    loadSamples();
  }, [sampleIndex, totalSamples, userName]);

  // 페이지 로드 시 시작 시간 기록
  useEffect(() => {
    setPageStartTime(Date.now());
  }, [sampleIndex]);

  // 페이지 시간 기록 함수
  const logPageTime = (currentIndex: number) => {
    const currentTime = Date.now();
    const timeSpent = currentTime - pageStartTime;

    setPageLogs(prev => {
      const existingLog = prev.find(log => log.pageIndex === currentIndex);
      if (existingLog) {
        // 기존 로그 업데이트
        return prev.map(log => 
          log.pageIndex === currentIndex 
            ? {
                ...log,
                totalTime: log.totalTime + timeSpent,
                visits: log.visits + 1
              }
            : log
        );
      } else {
        // 새 로그 추가
        return [...prev, {
          pageIndex: currentIndex,
          totalTime: timeSpent,
          visits: 1
        }];
      }
    });
  };

  const getCurrentFolderPath = () => {
    if (audioSamples.length > 0) {
      const path = audioSamples[0].id;
      // 파일명을 제외한 폴더 경로만 가져오기
      const folderPath = path.split('/').slice(0, -1).pop();
      return folderPath;
    }
    return null;
  };

  // 현재 평가 저장하는 함수 분리
  const saveCurrentRatings = () => {
    setAllRatings(prev => ({
      ...prev,
      [sampleIndex]: currentRatings
    }));
    console.log('Ratings saved for sample:', sampleIndex); // 디버깅
  };

  // Previous 버튼 핸들러
  const handlePrevious = () => {
    // 현재 평가 저장
    saveCurrentRatings();
    
    // 페이지 시간 기록
    logPageTime(sampleIndex);
    
    // 이전 페이지로 이동
    setSampleIndex(prev => prev - 1);
    
    // 이전 페이지의 평가 데이터로 currentRatings 설정
    const prevIndex = sampleIndex - 1;
    if (allRatings[prevIndex]) {
      setCurrentRatings(allRatings[prevIndex]);
    } else {
      setCurrentRatings({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked'); // 디버깅
    console.log('Current sample index:', sampleIndex);
    console.log('Total samples:', totalSamples);

    // 마지막 샘플인 경우
    if (sampleIndex === totalSamples - 1) {
      console.log('Final submission - generating CSV...'); // 디버깅

      try {
        // 페이지 시간 기록
        logPageTime(sampleIndex);
        
        // 마지막 샘플의 평가 데이터를 직접 allRatings에 포함시킴
        const updatedAllRatings = {
          ...allRatings,
          [sampleIndex]: currentRatings
        };
        console.log('Updated all ratings for final submission:', updatedAllRatings);
        
        // 업데이트된 평가 데이터로 CSV 생성 및 저장
        const success = await generateAndSaveCSV(updatedAllRatings);
        console.log('CSV generation result:', success); // 디버깅

        if (success) {
          // 성공 후 상태 업데이트
          setAllRatings(updatedAllRatings);
          setIsSubmitted(true);
          
          // 제출 완료 후 3초 뒤에 로그인 페이지로 이동
          // setTimeout(() => {
          //   // sessionStorage.removeItem('currentUser');
          //   // localStorage.removeItem(`responses_${userName}`);
          //   // navigate('/', { replace: true });
          // }, 3000);
        }
      } catch (error) {
        console.error('Error during submission:', error);
        alert('제출 중 오류가 발생했습니다.');
      }
    } else {
      // 현재 평가 저장
      saveCurrentRatings();
      
      // 페이지 시간 기록
      logPageTime(sampleIndex);
      
      // 다음 샘플로 이동
      setSampleIndex(prev => prev + 1);
      setCurrentRatings({});
    }
  };

  const generateAndSaveCSV = async (ratingsToUse = allRatings) => {
    try {
      console.log('Starting CSV generation...');
      console.log('Current user:', userName);
      
      // 기본 CSV 헤더 생성 (평가 데이터용)
      const headers = ['user_name', 'sample_id', 'audio_file', ...activeMetrics];
      const rows: string[][] = [];

      // 페이지 로그용 CSV 헤더
      const logHeaders = ['user_name', 'page_index', 'total_time_ms', 'visits'];
      const logRows: string[][] = [];

      // 모든 샘플에 대한 응답 데이터 수집 (전달받은 평가 데이터 사용)
      Object.entries(ratingsToUse).forEach(([sampleIdx, sampleRatings]) => {
        const shuffledSamplesForIndex = allShuffledSamples[Number(sampleIdx)];
        if (!shuffledSamplesForIndex || !shuffledSamplesForIndex[0]) {
          console.error(`Missing sample data for index ${sampleIdx}`);
          return;
        }

        try {
          const samplePath = shuffledSamplesForIndex[0].id;
          const sampleId = samplePath.split('audio_samples/')[1]?.split('/')[0] || '';
          
          Object.entries(sampleRatings).forEach(([audioIdx, ratings]) => {
            const audioSample = shuffledSamplesForIndex[Number(audioIdx)];
            if (!audioSample) {
              console.error(`Missing audio data for sample ${sampleIdx}, audio ${audioIdx}`);
              return;
            }

            const audioPath = audioSample.id;
            const audioFile = audioPath.split('/').pop() || '';
            
            const row = [
              userName,
              sampleId,
              audioFile,
              ...activeMetrics.map(metric => {
                const rating = ratings[metric];
                return rating?.toString() || '';
              })
            ];
            rows.push(row);
          });
        } catch (error) {
          console.error(`Error processing sample ${sampleIdx}:`, error);
        }
      });

      // 페이지 로그 데이터 수집
      pageLogs.forEach(log => {
        const row = [
          userName,
          log.pageIndex.toString(),
          log.totalTime.toString(),
          log.visits.toString()
        ];
        logRows.push(row);
      });

      console.log('Page logs data:', pageLogs);  // 디버깅용

      // 데이터 검증
      if (rows.length === 0) {
        throw new Error('No valid response data to save');
      }

      // 평가 데이터 CSV 생성
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // 페이지 로그 CSV 생성
      const logsContent = [
        logHeaders.join(','),
        ...logRows.map(row => row.join(','))
      ].join('\n');

      console.log('Generated logs CSV content:', logsContent);  // 디버깅용

      // 현재 시간을 포함한 파일명 생성
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // 서버 저장 시도
      try {
        const serverUrl = '/api/save-responses';
        console.log('Sending data to server:', serverUrl);
        
        // 평가 데이터와 페이지 로그 데이터를 함께 서버로 전송
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            userName,
            csvContent,
            logsContent,  // 페이지 로그 데이터 추가
            timestamp: new Date().toISOString()
          }),
        });

        const result = await response.json();
        console.log('Server response:', result);

        if (!response.ok) {
          throw new Error(`Server response error: ${response.status} - ${result.detail || 'Unknown error'}`);
        }

        console.log('CSV and logs saved to server successfully');
        setSubmissionType('server');
        return true;
      } catch (serverError) {
        console.error('Server error:', serverError);
        
        // 서버 저장 실패 시 ZIP 파일로 로컬 저장
        try {
          const zip = new JSZip();
          
          // responses 폴더 생성
          const folder = zip.folder(userName);
          
          // CSV 파일들을 폴더에 추가
          folder.file(`responses_${timestamp}.csv`, csvContent);
          folder.file(`page_logs_${timestamp}.csv`, logsContent);
          
          // ZIP 생성 
          const content = await zip.generateAsync({ type: "blob" });
          const url = window.URL.createObjectURL(content);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${userName}_experiment_data.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          alert('서버 연결에 실패했습니다. ZIP 파일이 로컬에 다운로드되었습니다.');
          setSubmissionType('local');
          return true;
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          alert('파일 저장에 실패했습니다.');
          return false;
        }
      }

    } catch (error) {
      console.error('Error generating CSV:', error);
      alert(`응답 생성 중 오류가 발생했습니다: ${error.message}`);
      return false;
    }
  };

  const handleRating = (audioIndex: number, metric: string, value: number) => {
    setCurrentRatings(prev => ({
      ...prev,
      [audioIndex]: { ...(prev[audioIndex] || {}), [metric]: value }
    }));
  };

  const isComplete = audioSamples.every((_, index) => 
    Object.keys(currentRatings[index] || {}).length === activeMetrics.length
  );

  const generateRandomRatings = () => {
    const newRatings: Record<number, Record<string, number>> = {};
    
    // 각 오디오 샘플에 대해 순차적으로 평가 값 설정
    audioSamples.forEach((_, index) => {
      newRatings[index] = {};
      
      // 각 메트릭에 대해 순차적으로 평가 값 설정
      activeMetrics.forEach((metric, metricIndex) => {
        // 각 오디오 샘플마다 다른 순서로 시작하는 평가 값 설정
        // [1,2,3,4,5], [2,3,4,5,1], [3,4,5,1,2], ...
        const startValue = (index % 5) + 1;
        const value = ((startValue + metricIndex - 1) % 5) + 1;
        newRatings[index][metric] = value;
      });
    });
    
    setCurrentRatings(newRatings);
    
    // 디버깅용 로그
    // console.log('생성된 순차적 평가 값:', newRatings);
  };

  const generateDummyData = async () => {
    try {
      const dummyData = {
        userName: 'dummy_user',
        csvContent: 'user_name,sample_id,audio_file,naturalness,musicality\ndummy_user,001,audio1.wav,5,4\ndummy_user,001,audio2.wav,3,5',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/save-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(dummyData),
      });

      if (!response.ok) {
        throw new Error(`Server response error: ${response.status}`);
      }

      alert('더미 데이터가 성공적으로 전송되었습니다.');
    } catch (error) {
      console.error('Error sending dummy data:', error);
      alert('더미 데이터 전송 실패: ' + error.message);
    }
  };

  // 팝업 열기/닫기 함수
  const toggleInstructions = () => {
    setShowInstructions(prev => !prev);
  };

  // 스크롤바 스타일을 위한 CSS를 head에 추가
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* 테이블 컨테이너 스타일 */
      .table-container {
        position: relative;
        margin-bottom: 1.5rem;
        overflow-x: auto;
        scrollbar-width: none;  /* Firefox */
      }
      
      /* 하단 스크롤바 숨기기 */
      .table-container::-webkit-scrollbar {
        display: none;  /* Chrome, Safari, Edge */
      }
      
      /* 상단 스크롤바 */
      .top-scrollbar {
        overflow-x: scroll;
        overflow-y: hidden;
        height: 16px;
        background-color: #f0f0f0;
        border-radius: 8px;
        margin-bottom: 8px;
      }
      
      .top-scrollbar-inner {
        height: 1px;
      }
      
      .top-scrollbar::-webkit-scrollbar {
        height: 16px;
        background-color: #f0f0f0;
        border-radius: 8px;
      }
      
      .top-scrollbar::-webkit-scrollbar-thumb {
        background-color: #3b82f6;
        border-radius: 8px;
        border: 3px solid #f0f0f0;
      }
      
      .top-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #2563eb;
      }
      
      /* 스크롤 힌트 애니메이션 */
      @keyframes scrollHint {
        0% { transform: translateX(0); }
        25% { transform: translateX(20px); }
        50% { transform: translateX(0); }
        75% { transform: translateX(-20px); }
        100% { transform: translateX(0); }
      }
      
      .scroll-hint {
        animation: scrollHint 3s ease-in-out;
        animation-iteration-count: 2;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 스크롤바 동기화를 위한 useEffect
  useEffect(() => {
    const tableContainer = document.getElementById('tableContainer');
    const topScrollbar = document.getElementById('topScrollbar');
    const topScrollbarInner = document.getElementById('topScrollbarInner');
    
    if (tableContainer && topScrollbar && topScrollbarInner) {
      // 상단 스크롤바 너비 설정
      const setScrollWidth = () => {
        topScrollbarInner.style.width = tableContainer.scrollWidth + 'px';
      };
      
      // 초기 설정
      setScrollWidth();
      
      // 테이블 스크롤 시 상단 스크롤바 동기화
      const handleTableScroll = () => {
        topScrollbar.scrollLeft = tableContainer.scrollLeft;
      };
      
      // 상단 스크롤바 스크롤 시 테이블 동기화
      const handleTopScroll = () => {
        tableContainer.scrollLeft = topScrollbar.scrollLeft;
      };
      
      // 이벤트 리스너 등록
      tableContainer.addEventListener('scroll', handleTableScroll);
      topScrollbar.addEventListener('scroll', handleTopScroll);
      window.addEventListener('resize', setScrollWidth);
      
      // 클린업
      return () => {
        tableContainer.removeEventListener('scroll', handleTableScroll);
        topScrollbar.removeEventListener('scroll', handleTopScroll);
        window.removeEventListener('resize', setScrollWidth);
      };
    }
  }, [audioSamples]);

  // 오디오 요소 참조를 저장할 ref 추가
  const audioRefs = React.useRef<Record<string, HTMLAudioElement>>({});
  
  // 오디오 재생 처리 함수 수정
  const handleAudioPlay = (audioId: string) => {
    // 현재 재생 중인 모든 오디오를 찾아서 중지 (재생 위치는 유지)
    Object.entries(audioRefs.current).forEach(([id, audioElement]) => {
      if (id !== audioId && !audioElement.paused) {
        audioElement.pause();
      }
    });
  };
  
  // 오디오 요소 참조 등록 함수
  const registerAudioRef = (id: string, element: HTMLAudioElement | null) => {
    if (element) {
      audioRefs.current[id] = element;
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {submissionType === 'server' ? (
          // 서버 저장 성공 시
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">실험에 참가해주셔서 감사합니다!</h2>
            <p className="text-gray-600 mb-4">실험 결과가 정상적으로 제출되었습니다.</p>
            <p className="text-sm text-gray-500">사용자: {userName}</p>
            {/* <p className="text-sm text-gray-400 mt-4">3초 안에 페이지가 리디렉션 됩니다.</p> */}
          </div>
        ) : (
          // 로컬 다운로드 시
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">실험에 참가해주셔서 감사합니다!</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    서버 연결에 실패하여 실험 결과가 로컬에 저장되었습니다.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
              <h3 className="text-lg font-medium mb-4">다음 단계를 따라주세요:</h3>
              <ol className="text-left space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="font-medium mr-2">1.</span>
                  <span>다운로드된 ZIP 파일({userName}_experiment_results.zip)을 확인해주세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">2.</span>
                  <span>ZIP 파일을 아래 카카오톡 채널로 전송해주시거나 jech@kaist.ac.kr로 전송해주세요.</span>
                </li>
              </ol>
              <a 
                href="https://open.kakao.com/o/somZ4olh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                카카오톡 채널 열기
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (audioSamples.length === 0) {
    return <div>Loading audio samples...</div>;
  }

  return (
    <>
      {/* 실험 설명 팝업 - 별도 컴포넌트로 분리 */}
      <InstructionsPopup 
        isOpen={showInstructions}
        onClose={toggleInstructions}
        registerAudioRef={registerAudioRef}
        handleAudioPlay={handleAudioPlay}
      />
      
      {/* 도움말 버튼 추가 */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={toggleInstructions}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="실험 안내 보기"
        >
          <HelpCircle size={24} />
        </button>
      </div>
      
      {/* 기존 폼 */}
      <form onSubmit={handleSubmit} className="max-w-[95vw] mx-auto p-2">
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading audio samples...</p>
        </div>
      ) : (
        <>
          {EXPERIMENT_CONFIG.DEBUG_MODE && (
            <>
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-700">⚠️ Debug Mode</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Running in debug mode with {DEBUG_METRICS.length} metrics
                    </p>
                    <p className="text-sm text-yellow-700">
                      Current Song: {getCurrentFolderPath()}
                    </p>
                    <p className="text-sm text-yellow-700">
                      Shuffle Settings - Samples: {EXPERIMENT_CONFIG.SHUFFLE_SAMPLES ? 'ON' : 'OFF'}, 
                      Models: {EXPERIMENT_CONFIG.SHUFFLE_MODELS ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 mb-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Debug Controls</span>
                    <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={generateRandomRatings}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Generate Random Ratings
                  </button>
                      <button
                        type="button"
                        onClick={generateDummyData}
                        className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        Send Dummy Data
                      </button>
                    </div>
                  </div>
              </div>
            </>
          )}
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {sampleIndex + 1} / {totalSamples} 번째 샘플
            </h2>

              {/* 이미지와 리드시트 오디오를 함께 표시 */}
            {audioSamples.length > 0 && (
              <div className="mb-6">
                  <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
                    {/* 이미지 */}
                    <div className="w-full md:w-2/3 max-w-2xl">
                <img 
                        src={`${PATHS.AUDIO_SAMPLES}/${getCurrentFolderPath()}/${PATHS.LEADSHEET.IMAGE}`}
                  alt="Lead Sheet" 
                        className="w-full rounded-lg shadow-md"
                  onError={(e) => console.error('Image load error:', e)}
                />
                    </div>
                    
                    {/* 리드시트 오디오 */}
                    <div className="w-full md:w-1/3 max-w-md p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-medium mb-3 text-center">리드시트 오디오</h3>
                      <div className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <audio 
                          controls 
                          src={`${PATHS.AUDIO_SAMPLES}/${getCurrentFolderPath()}/${PATHS.LEADSHEET.AUDIO}`}
                          className="w-full"
                          ref={(el) => registerAudioRef('leadsheet', el)}
                          onPlay={() => handleAudioPlay('leadsheet')}
                          onError={(e) => console.error('Audio load error:', e)}
                        />
                      </div>
                    </div>
                  </div>
              </div>
            )}

              {/* 스크롤 안내 메시지 */}
              <div className="bg-blue-100 p-2 rounded-t-lg border border-blue-200 border-b-0 flex items-center justify-center">
                <div className="flex items-center scroll-hint">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mr-2">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                  <span className="text-blue-700 font-medium text-sm">총 평가 항목은 5개입니다. 만약 평가 항목이 모두 보이지 않는다면, ⇩ 아래 스크롤바를 사용하여 모든 평가 항목을 확인하세요.</span>
                </div>
              </div>
              
              {/* 상단 스크롤바 */}
              <div className="top-scrollbar" id="topScrollbar">
                <div className="top-scrollbar-inner" id="topScrollbarInner"></div>
              </div>
              
              {/* 테이블 컨테이너 - 크기 축소 */}
              <div className="table-container border border-gray-200 rounded-b-lg shadow-sm" id="tableContainer">
                <table className="w-full min-w-[900px]">
                <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-center w-[320px] sticky left-0 bg-gray-100 border-r border-gray-200 z-10">
                        오디오
                      </th>
                    {activeMetrics.map((metric) => (
                        <th key={metric} className="px-2 py-2 text-center whitespace-nowrap font-medium text-sm">
                          {metric}
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {audioSamples.map((sample, index) => (
                      <tr key={sample.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-3 sticky left-0 bg-inherit border-r border-gray-200">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 min-w-[280px]">
                              <Music className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <audio 
                              controls 
                              src={sample.audioUrl} 
                              className="w-full"
                              style={{ minWidth: '260px' }}
                              ref={(el) => registerAudioRef(`audio-${sample.id}`, el)}
                              onPlay={() => handleAudioPlay(`audio-${sample.id}`)}
                            />
                          </div>
                          {EXPERIMENT_CONFIG.DEBUG_MODE && (
                              <p className="text-xs text-gray-600 text-center mt-1">
                              {sample.id.split('/').pop()?.replace('.wav', '')}
                            </p>
                          )}
                        </div>
                      </td>
                      {activeMetrics.map((metric) => (
                          <td key={`${index}-${metric}`} className="px-2 py-3 text-center">
                          <div className="flex gap-1 justify-center">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => handleRating(index, metric, value)}
                                  className={`w-7 h-7 rounded-full font-medium text-xs
                                  ${currentRatings[index]?.[metric] === value 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-md mx-auto">
            {sampleIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
              >
                이전 샘플
              </button>
            )}
            <button
              type="submit"
              disabled={!isComplete}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                isComplete
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isComplete 
                ? (sampleIndex === totalSamples - 1 
                  ? '평가 결과 제출' 
                  : '다음 샘플')
                : '모든 평가를 해주세요'}
            </button>
          </div>
        </>
      )}
    </form>
    </>
  );
}