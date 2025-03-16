import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 세션 초기화
  useEffect(() => {
    sessionStorage.removeItem('currentUser');
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (userName.trim()) {
      const trimmedUserName = userName.trim();
      
      // 기존 응답 데이터 확인
      const savedData = localStorage.getItem(`responses_${trimmedUserName}`);
      
      if (savedData) {
        try {
          // 저장된 데이터가 유효한지 확인
          const parsedData = JSON.parse(savedData);
          console.log('Found saved data:', parsedData);  // 디버깅용
          
          const confirmed = window.confirm(
            '이전에 저장된 응답이 있습니다. 계속하시겠습니까?\n' +
            '확인: 이전 응답에서 계속하기\n' +
            '취소: 새로 시작하기'
          );
          
          if (!confirmed) {
            console.log('Removing saved data');  // 디버깅용
            localStorage.removeItem(`responses_${trimmedUserName}`);
          }
        } catch (error) {
          console.error('Error parsing saved data:', error);
          localStorage.removeItem(`responses_${trimmedUserName}`);
        }
      }
      
      sessionStorage.setItem('currentUser', trimmedUserName);
      navigate('/experiment');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            AI 피아노 반주 생성 평가
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              피험자 이름을 입력해주세요.
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="이름"
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              실험 시작하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 