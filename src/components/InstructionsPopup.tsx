import React from 'react';
import { Music, X } from 'lucide-react';
import { PATHS, EXAMPLE_DATA } from '../config';

interface InstructionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  registerAudioRef: (id: string, element: HTMLAudioElement | null) => void;
  handleAudioPlay: (audioId: string) => void;
}

export function InstructionsPopup({ isOpen, onClose, registerAudioRef, handleAudioPlay }: InstructionsPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">실험 안내</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-blue-700">실험 목적</h3>
            <p>
              본 실험은 KAIST 문화기술대학원 Music and Audio Computing Lab에서 진행되는 연구의 일환으로, <strong>멜로디와 코드가 주어졌을 때 어울리는 피아노 반주를 생성하는 AI 모델의 성능을 평가</strong>하기 위해 진행됩니다.
            </p>
            <p>
              귀한 시간 내어 실험에 참여해주셔서 정말 감사드립니다!
            </p>
            
            <h3 className="text-xl font-semibold text-blue-700 mt-6">주의 사항</h3>
            <ul className="list-disc pl-5">
              <li>실험을 끝내기까지 약 <strong className="text-black">1시간 정도의 시간이 소요</strong>됩니다. <strong className="text-black">인터넷 연결이 원활한 곳에서 PC로 실험 진행</strong>을 부탁드립니다.</li>
              <li>실험 중간에 페이지를 닫더라도 진행 상황은 저장됩니다. (동일한 기기, 동일한 브라우저로 다시 로그인하면 중단된 지점부터 계속할 수 있습니다.)</li>
              <li>하지만 안전한 실험 결과 저장을 위해 <strong className="text-black">가급적 한번에 실험을 끝내주시길 부탁드립니다.</strong></li>
              <li>혹시나 실험을 정상적으로 진행하였으나 제출에 문제가 생기는 경우 csv 파일이 로컬에 저장됩니다. 이 경우 해당 파일을 카카오톡으로 보내주시길 부탁드립니다.</li>
              <li>추가로, 여러 tab에서 같은 이름으로 접속하면 안되니 <strong className="text-black">꼭 하나의 tab에서 실험을 진행해주세요.</strong></li>
              <li><strong className="text-black">실험이 완료된 후에는 완료되었다고 카카오톡으로 말씀 부탁드립니다!</strong></li>
              <li><strong className="text-black">우측 하단의 물음표 버튼을 클릭</strong>하시면 이 실험 안내 창을 다시 확인하실 수 있습니다.</li>
              <li>실험 진행 중 <strong className="text-black">문의사항</strong>이 있으시다면 <strong className="text-black">카카오톡, 혹은 최은진 (010-3674-4215) 으로 연락</strong> 부탁드립니다.</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-blue-700 mt-6">실험 방법</h3>
            <ol className="list-decimal pl-5">
              <li>총 10개의 샘플과 6개의 비교모델이 준비되어 있습니다.</li>
              <li>각 샘플별로 주어진 리드 시트를 확인한 후 아래에 제시되는 모든 오디오들을 듣고 평가해주시면 됩니다. (필요시 리드시트의 오디오도 들어주세요)</li>
              <li>각 샘플에 대해 제시된 평가 기준에 대해서 <strong>1-5점</strong>으로 평가를 부탁드립니다.</li>
              <li>한 페이지의 모든 평가를 완료하면 '다음 샘플' 버튼을 클릭하여 다음으로 진행해주세요. <strong>(다음 샘플 버튼을 클릭해야 진행상황이 저장됩니다.)</strong></li>
              <li>마지막 페이지에서는 <strong>'평가 결과 제출' 버튼을 클릭</strong>하여 실험을 완료합니다.</li>
            </ol>
            
            <h3 className="text-xl font-semibold text-blue-700 mt-6">평가 기준</h3>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>멜로디와 어울림</strong>: 주어진 <strong>멜로디</strong>와 반주가 얼마나 잘 어울리나요?</li>
              <li><strong>화성</strong>: 반주는 주어진 코드 진행을 얼마나 잘 따르나요? (코드의 구성음을 잘 누르고 있는지, 생략하는 음이 있진 않은지)</li>
              <li><strong>일관성</strong>: 반주가 <strong>리듬</strong>적인 측면에서 음악적인 일관성을 가지고 있나요?</li>
              <li><strong>정확도</strong>: 반주에 <strong>눈에 띄는 오류</strong>가 있나요? (화성, 리듬적으로 <strong>이상한 음이 등장</strong>하는지)</li>
              <li><strong>전체적인 퀄리티</strong>: 생성된 반주는 얼마나 음악적인가요?</li>
            </ul>
            
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>참고사항:</strong> 간혹 전체 멜로디의 음역대(옥타브)가 바뀌거나 멜로디 노트 중 일부가 생략되는 경우가 존재하는데, 이 부분은 멜로디와 어울림 평가에 영향을 주지 않습니다.
              </p>
            </div>
            
            <h3 className="text-xl font-semibold text-blue-700 mt-6">평가 예시</h3>
            <p>아래는 실험에서 평가하게 될 오디오 샘플의 예시입니다. 실제 실험에서는 이와 유사한 여러 샘플을 평가하게 됩니다.</p>
            
            {EXAMPLE_DATA.map((example, index) => (
              <ExampleSection 
                key={index}
                title={example.title}
                imageSrc={`${PATHS.EVAL_EXAMPLES}/${example.id}/${PATHS.LEADSHEET.IMAGE}`}
                leadsheetAudioSrc={`${PATHS.EVAL_EXAMPLES}/${example.id}/${PATHS.LEADSHEET.AUDIO}`}
                generatedAudioSrc={`${PATHS.EVAL_EXAMPLES}/${example.id}/valid.wav`}
                scores={example.scores}
                comment={example.comment}
                registerAudioRef={registerAudioRef}
                handleAudioPlay={handleAudioPlay}
                audioIdPrefix={`example${index + 1}`}
              />
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              실험 계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExampleSectionProps {
  title: string;
  imageSrc: string;
  leadsheetAudioSrc: string;
  generatedAudioSrc: string;
  scores: number[];
  comment?: string;
  registerAudioRef: (id: string, element: HTMLAudioElement | null) => void;
  handleAudioPlay: (audioId: string) => void;
  audioIdPrefix: string;
}

function ExampleSection({ 
  title, 
  imageSrc, 
  leadsheetAudioSrc, 
  generatedAudioSrc, 
  scores, 
  comment, 
  registerAudioRef, 
  handleAudioPlay,
  audioIdPrefix
}: ExampleSectionProps) {
  const metrics = ['멜로디와 어울림', '화성', '일관성', '정확도', '전체적인 퀄리티'];
  
  return (
    <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-lg font-medium mb-3">{title}</h4>
      <div className="mb-3">
        <img 
          src={imageSrc} 
          alt={`리드시트 ${title}`} 
          className="w-full max-w-2xl mx-auto rounded-lg shadow-md mb-3"
        />
        
        {/* 리드시트 오디오 */}
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-2 text-gray-700">리드시트 오디오:</h5>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <audio 
              controls 
              src={leadsheetAudioSrc} 
              className="w-full"
              ref={(el) => registerAudioRef(`${audioIdPrefix}-leadsheet`, el)}
              onPlay={() => handleAudioPlay(`${audioIdPrefix}-leadsheet`)}
            />
          </div>
        </div>
        
        {/* 생성된 오디오 */}
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-2 text-gray-700">생성된 오디오:</h5>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <audio 
              controls 
              src={generatedAudioSrc} 
              className="w-full"
              ref={(el) => registerAudioRef(`${audioIdPrefix}-generated`, el)}
              onPlay={() => handleAudioPlay(`${audioIdPrefix}-generated`)}
            />
          </div>
        </div>
        
        {/* 코멘트 (있는 경우에만) */}
        {comment && (
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <p className="text-sm text-blue-800">
              <strong>{comment}</strong>
            </p>
          </div>
        )}
        
        {/* 평가 점수 표시 */}
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {metrics.map((metric, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <p className="text-sm font-medium text-gray-700 mb-2">{metric}</p>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div
                      key={value}
                      className={`w-7 h-7 rounded-full font-medium text-xs flex items-center justify-center cursor-default
                        ${value === scores[idx] ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 