# Webpage for Audio Subjective Evaluation
User data is saved as localStorage and we implemented the progress saving in their local.
Stimuli is shown as randomized order (both sample wise and model wise).
Audio samples are stored in the public/data/audio_samples and public/data/audio_examples for explanation slide.
To change the audio loading path, change the PATHS of src/config.ts and this part of src/utils/audioLoader.ts. 
```
const audioFiles = import.meta.glob('../../public/data/audio_samples/**/*.wav', { eager: true });
```
**note: Currently, import.meta.glob of Vite doesn't support dynamic literal so that the path is hard coded.

# Env Setting
## Install nvm
```
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc   # or source ~/.profile
```
## Install Node.js 18.20.8 and set it as default
```
nvm install 18.20.8
nvm alias default 18.20.8
nvm use default
```
## Set npm version
```
npm install -g npm@10.8.2
```
## Version check
```
node -v   # -> v18.20.8
npm -v    # -> 10.8.2
```
# Installation
```
$ npm install
```

# How to Run
## FrontEnd
```
$ npm run dev
```
- Currently, 30010 port is used. 
- Currently, 8000 port of backend is connected as reverse proxy. (backend port number don't need to be opened.)
- If page not shown, check whether any adblock plugin is used.

## Backend
```
$ uvicorn server.main:app --reload --port 8000
```