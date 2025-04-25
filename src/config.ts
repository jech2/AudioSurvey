// export const METRICS = ['Coherence', 'Harmony', 'Consistency', 'Correctness', 'Overall', 'Creativity'];
export const METRICS = ['멜로디와 어울림', '화성', '일관성', '정확도', '전체적인 퀄리티']

// export const DEBUG_METRICS = ['Coherence', 'Harmony', 'Consistency', 'Correctness', 'Overall', 'Creativity'];
export const DEBUG_METRICS = METRICS;  // use same metrics for debug mode

// 실험 설정
export const EXPERIMENT_CONFIG = {
  // randomize sample order
  SHUFFLE_SAMPLES: true,
  // randomize model sample order
  SHUFFLE_MODELS: true,
  // set debug mode
  DEBUG_MODE: true,
  DEBUG: {
    SAMPLE_COUNT: 2,    // the number of samples
    AUDIO_COUNT: 6,     // the number of models per sample
  }
} as const;

// set audio sample directory
export const PATHS = {
  // default directory for audio samples
  AUDIO_SAMPLES: './public/data/audio_samples',
  // directory for audio examples (for introduction popup)
  EVAL_EXAMPLES: './public/data/audio_examples',
  // leadsheet related file names
  LEADSHEET: {
    IMAGE: 'leadsheet-1.png',
    AUDIO: 'leadsheet.wav'
  }
} as const;

// example data for the introduction pop up
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
