import { AudioSample } from '../types';
import { EXPERIMENT_CONFIG } from '../config';

export async function loadAudioSamples(experimentIndex: number): Promise<AudioSample[]> {
  try {
    const audioFiles = import.meta.glob('../../public/data/audio_samples/**/*.wav', { eager: true });
    
    // load folder list 
    const folders = Array.from(new Set(
      Object.keys(audioFiles).map(path => {
        const match = path.match(/\/audio_samples\/([^/]+)\//);
        return match ? match[1] : null;
      }).filter(Boolean)
    ));
    
    const userName = sessionStorage.getItem('currentUser');
    if (userName) {
      // determine the order of samples based on config
      const orderedFolders = EXPERIMENT_CONFIG.SHUFFLE_SAMPLES 
        ? shuffleArrayWithSeed(folders, userName)
        : folders.sort();  // if not shuffle, order by alphabet

      console.log('Ordered folders:', orderedFolders);

      const currentFolder = orderedFolders[experimentIndex];
      console.log('Current folder:', currentFolder);

      const experimentFiles = Object.entries(audioFiles)
        .filter(([path]) => path.includes(currentFolder))
        .map(([path, module]) => ({
          id: path,
          audioUrl: (module as any).default
        }));

      // determin the order of models
      return EXPERIMENT_CONFIG.SHUFFLE_MODELS 
        ? shuffleArray(experimentFiles)
        : experimentFiles.sort((a, b) => a.id.localeCompare(b.id));  // if not shuffle, order by alphabet
    }
    
    return [];
  } catch (error) {
    console.error('Error loading audio samples:', error);
    return [];
  }
}

// random function 
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

// shuffle function
function shuffleArrayWithSeed<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(`${seed}${i}`) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

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