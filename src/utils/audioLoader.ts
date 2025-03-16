import { AudioSample } from '../types';
import { EXPERIMENT_CONFIG } from '../config';

export async function loadAudioSamples(experimentIndex: number): Promise<AudioSample[]> {
  try {
    const audioFiles = import.meta.glob('../../public/data/audio_samples/**/*.wav', { eager: true });
    
    // 폴더 목록 가져오기
    const folders = Array.from(new Set(
      Object.keys(audioFiles).map(path => {
        const match = path.match(/\/audio_samples\/([^/]+)\//);
        return match ? match[1] : null;
      }).filter(Boolean)
    ));
    
    const userName = sessionStorage.getItem('currentUser');
    if (userName) {
      // 설정에 따라 폴더 순서 결정
      const orderedFolders = EXPERIMENT_CONFIG.SHUFFLE_SAMPLES 
        ? shuffleArrayWithSeed(folders, userName)
        : folders.sort();  // 셔플하지 않을 경우 알파벳 순으로 정렬

      console.log('Ordered folders:', orderedFolders);

      const currentFolder = orderedFolders[experimentIndex];
      console.log('Current folder:', currentFolder);

      const experimentFiles = Object.entries(audioFiles)
        .filter(([path]) => path.includes(currentFolder))
        .map(([path, module]) => ({
          id: path,
          audioUrl: (module as any).default
        }));

      // 설정에 따라 모델 순서 결정
      return EXPERIMENT_CONFIG.SHUFFLE_MODELS 
        ? shuffleArray(experimentFiles)
        : experimentFiles.sort((a, b) => a.id.localeCompare(b.id));  // 셔플하지 않을 경우 파일명 순으로 정렬
    }
    
    return [];
  } catch (error) {
    console.error('Error loading audio samples:', error);
    return [];
  }
}

// 시드 기반 랜덤 함수
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

// 시드 기반 배열 섞기 함수
function shuffleArrayWithSeed<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(`${seed}${i}`) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// 기존의 일반 랜덤 섞기 함수 (오디오 파일용)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getExperimentCount(): number {
  if (EXPERIMENT_CONFIG.DEBUG_MODE) {
    return EXPERIMENT_CONFIG.DEBUG.SAMPLE_COUNT;
  }
  
  const audioFiles = import.meta.glob('../../public/data/audio_samples/**/*.wav', { eager: true });
  const folders = new Set(
    Object.keys(audioFiles).map(path => {
      const match = path.match(/\/audio_samples\/([^/]+)\//);
      return match ? match[1] : null;
    }).filter(Boolean)
  );
  return folders.size;
} 