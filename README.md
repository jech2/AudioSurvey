# Webpage for Audio Subjective Evaluation
This repository contains interactive webpage for subjective evaluation with audio samples.
** Currently, the page is shown in Korean. We will also release the english version in the future.

# Features
- Users enter their name to begin the experiment, and when they finished the experiment, their responses are saved in responses/{user_name}/response_{timestamp}.csv. You can also monitor the user response time per each page (page_logs csv file). Check the dummy response file from response/eunjinchoi.
- Upon starting, an introduction popup appears; it can be reopened anytime by clicking the question-mark button in the lower right corner.
- In the main session, each trial displays an image alongside reference audio. Under each model condition, the generated audio is presented and users rate it across various metrics.
- A Debug mode is available for testing: it can generate dummy responses and reveals sample and model names.
- Trials are displayed in randomized order, both by sample and by model.
- All user data and progress are stored in localStorage, allowing participants to resume the experiment in the same browser.
- If the backend server is unavailable, responses are automatically packaged into a downloadable ZIP file in local so users can preserve and submit their data without loss.

# How to Use
Audio samples are stored in the public/data/audio_samples and public/data/audio_examples for explanation slide.
To change the audio loading path, change the PATHS of src/config.ts and this part of src/utils/audioLoader.ts. 
```
const audioFiles = import.meta.glob('../../public/data/audio_samples/**/*.wav', { eager: true });
```
** Currently, import.meta.glob of Vite doesn't support dynamic literal so that the path is hard coded.
** Currently, we implemented deploying the server with dev setting (suitable with small number of participants). 

# Env Setting
## Install nvm
```
sudo apt update
sudo apt install curl

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
# Frontend
npm install

## Backend
# install related packages. we tested in python 3.10.
pip install uvicorn
pip install fastapi
```

# How to Run
## Frontend
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

## Contact
If you have any questions regarding this repository, contact Eunjin Choi (jech@kaist.ac.kr). 