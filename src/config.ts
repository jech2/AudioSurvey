// export const METRICS = ['Coherence', 'Harmony', 'Consistency', 'Correctness', 'Overall', 'Creativity'];
export const METRICS = ['멜로디와 어울림', '화성', '일관성', '정확도', '전체적인 퀄리티'];

// 디버그 모드용 메트릭
// export const DEBUG_METRICS = ['Coherence', 'Harmony', 'Consistency', 'Correctness', 'Overall', 'Creativity'];
export const DEBUG_METRICS = METRICS;  // 디버그 모드에서도 동일한 메트릭 사용

// 실험 설정
export const EXPERIMENT_CONFIG = {
  // 샘플 순서 랜덤화 (폴더 순서)
  SHUFFLE_SAMPLES: true,
  // 모델 순서 랜덤화 (각 폴더 내 오디오 파일 순서)
  SHUFFLE_MODELS: true,
  // 디버그 모드 설정
  DEBUG_MODE: true,
  DEBUG: {
    SAMPLE_COUNT: 2,    // 샘플 수
    AUDIO_COUNT: 6,     // 각 샘플당 오디오 수
  }
} as const;

// 파일 경로 설정
export const PATHS = {
  // 오디오 샘플 기본 경로
  AUDIO_SAMPLES: './public/data/audio_samples',
  // 실험 예시 기본 경로
  EVAL_EXAMPLES: './public/data/audio_examples',
  // 리드시트 관련 파일명
  LEADSHEET: {
    IMAGE: 'leadsheet-1.png',
    AUDIO: 'leadsheet.wav'
  }
} as const;

// 실험 예시 데이터
export const EXAMPLE_DATA = [
  {
    id: '893__seg_32_40',
    title: '예시 1: 높은 평가를 받을 수 있는 샘플',
    scores: [5, 5, 5, 5, 5],
    generatedAudio: 'valid.wav',
  },
  {
    id: '210__seg_24_32',
    title: '예시 2: 중간 정도의 평가를 받을 수 있는 샘플',
    scores: [3, 4, 3, 2, 3],
    comment: '** 첫번째와 두번째 마디에 코드 조건과 다른 이상한 화음이 등장',
    generatedAudio: 'cne_no_velocity.wav',
  },
  {
    id: '210__seg_24_32',
    title: '예시 3: 중간 정도의 평가를 받을 수 있는 샘플',
    scores: [3, 3, 4, 2, 3],
    comment: '** 전반적인 흐름에는 문제가 없는데 이상한 음들이 한번씩 등장, 첫번째 마디 코드 생략',
    generatedAudio: 'efficient_diffusion.wav',
  },
  {
    id: '893__seg_32_40',
    title: '예시 4: 낮은 평가를 받을 수 있는 샘플',
    scores: [1, 1, 4, 1, 1],
    comment: '** 주어진 코드 조건을 전혀 따르지 않고 있음. 불협화음 등장',
    generatedAudio: 'efficient_diffusion.wav',
  }
] as const;
