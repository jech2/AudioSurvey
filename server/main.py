from fastapi import FastAPI, HTTPException, Depends, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import secrets
import os

app = FastAPI()
security = HTTPBasic()

# CORS setting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permit all origin
    allow_credentials=True,
    allow_methods=["GET", "POST"], 
    allow_headers=["*"],
)

# responses 디렉토리 생성
RESPONSES_DIR = "responses"
if not os.path.exists(RESPONSES_DIR):
    os.makedirs(RESPONSES_DIR)

class LoginResponse(BaseModel):
    username: str

class ResponseData(BaseModel):
    userName: str
    csvContent: str
    timestamp: str
    logsContent: Optional[str] = None  # optional

@app.post("/save-responses")
async def save_responses(data: ResponseData):
    try:
        print('server get file')
        
        # set response data file name
        timestamp = datetime.fromisoformat(data.timestamp.replace('Z', '+00:00')).strftime('%Y-%m-%d-%H-%M-%S')
        response_filename = f"responses_{timestamp}.csv"
        response_filepath = os.path.join(RESPONSES_DIR, data.userName, response_filename)
        os.makedirs(os.path.dirname(response_filepath), exist_ok=True)
        
        # save csv
        with open(response_filepath, "w", encoding="utf-8") as f:
            f.write(data.csvContent)
        
        # save page log data
        if data.logsContent:
            logs_filename = f"page_logs_{timestamp}.csv"
            logs_filepath = os.path.join(RESPONSES_DIR, data.userName, logs_filename)
            os.makedirs(os.path.dirname(logs_filepath), exist_ok=True)
            with open(logs_filepath, "w", encoding="utf-8") as f:
                f.write(data.logsContent)
            
            print(f"Logs saved to {logs_filename}")
            return {
                "status": "success",
                "message": f"Responses saved to {response_filename} and logs saved to {logs_filename}",
                "filepath": response_filepath,
                "logs_filepath": logs_filepath
            }

        return {
            "status": "success",
            "message": f"Responses saved to {response_filename}",
            "filepath": response_filepath
        }
    except Exception as e:
        print(f"Error saving responses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# end point for checking server status
@app.get("/")
async def read_root():
    return {"status": "Server is running"} 