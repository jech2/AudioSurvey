# Audio Sample Evaluator
User data is saved as localStorage and we implemented the progress saving in their local.
Stimuli is shown as randomized order (both sample wise and model wise).
Audio samples are stored in the public/data/audio_samples and public/data/audio_examples for explanation slide.
To change the audio loading path, change the PATHS of src/config.ts and this part of src/utils/audioLoader.ts. 
```
const audioFiles = import.meta.glob('../../public/data/audio_samples/**/*.wav', { eager: true });
```
**note: Currently, import.meta.glob of Vite doesn't support dynamic literal so that the path is hard coded.


# Installation
```
npm install
```

# FrontEnd
```
npm run dev
```
- Currently, 30010 port is used. 
- Currently, 8000 port of backend is connected as reverse proxy. (backend port number don't need to be opened.)
- If page not shown, check whether any adblock plugin is used.

# Backend
```
uvicorn server.main:app --reload --port 8000
```