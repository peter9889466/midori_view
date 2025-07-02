from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import pandas as pd
import logging
from dotenv import load_dotenv
from openai import OpenAI

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# FastAPI 앱 생성
app = FastAPI(title="GPT-4o mini CSV ChatBot", version="3.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8088", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청/응답 모델
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    success: bool = True
    session_id: str = "default"

# ================================
# 전역 변수
# ================================
csv_data = None
csv_loaded = False
knowledge_base = ""

def load_csv_file():
    """CSV 파일 불러오기"""
    global csv_data, csv_loaded, knowledge_base
    
    csv_file_path = "data/Merged_DataSet.csv"
    
    try:
        if not os.path.exists(csv_file_path):
            print("❌ CSV 파일이 없습니다:", csv_file_path)
            return False
        
        # CSV 파일 읽기 (인코딩 처리)
        try:
            csv_data = pd.read_csv(csv_file_path, encoding='utf-8')
            print("✅ UTF-8로 파일 읽기 성공")
        except:
            try:
                csv_data = pd.read_csv(csv_file_path, encoding='cp949')
                print("✅ CP949로 파일 읽기 성공")
            except:
                csv_data = pd.read_csv(csv_file_path, encoding='euc-kr')
                print("✅ EUC-KR로 파일 읽기 성공")
        
        print(f"📊 CSV 데이터: {len(csv_data)}행, {len(csv_data.columns)}열")
        print(f"📋 컬럼: {list(csv_data.columns)}")
        
        # 지식베이스 생성
        knowledge_base = create_knowledge_base()
        print(f"🧠 지식베이스 생성 완료: {len(knowledge_base)}글자")
        
        csv_loaded = True
        return True
        
    except Exception as e:
        print(f"❌ CSV 로드 실패: {e}")
        return False

def create_knowledge_base():
    """CSV 데이터를 AI용 지식베이스로 변환"""
    if csv_data is None:
        return ""
    
    kb_parts = []
    kb_parts.append("=== 친환경 제품 수출입 데이터 ===\n")
    
    for index, row in csv_data.iterrows():
        question = str(row.get('질문', '')).strip()
        answer = str(row.get('답변', '')).strip()
        
        if question and answer and question != 'nan' and answer != 'nan':
            kb_parts.append(f"데이터 {index + 1}:")
            kb_parts.append(f"Q: {question}")
            kb_parts.append(f"A: {answer}")
            kb_parts.append("")
    
    return "\n".join(kb_parts)

def ask_gpt4_mini(user_question):
    """GPT-4o mini로 전체 데이터 분석"""
    
    if not os.getenv("OPENAI_API_KEY"):
        return "OpenAI API 키가 설정되지 않았습니다."
    
    try:
        system_prompt = f"""당신은 친환경 제품 수출입 데이터 전문 분석가입니다.

아래는 모든 CSV 데이터입니다:

{knowledge_base}
사용자의 질문에 대해 위 데이터를 종합 분석해서 답변해주세요.

답변 규칙:
1. 데이터에 있는 정보를 정확히 분석
2. 수치나 국가명은 정확히 인용
3. 여러 데이터를 비교하여 인사이트 제공
4. 없는 정보는 "해당 정보 없음"이라고 명시
5. 친근하고 이해하기 쉽게 설명
6. 주어진 데이터와 상관이 없는 질문이라고 생각될 때는 범위 밖의 질문이라고 대답.
"""

        print("🤖 GPT-4.1 분석 중...")
        
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_question}
            ],
            temperature=0.2,
            top_p=1.0,
            frequency_penalty=0.4,
            presence_penalty=0.3,
            max_tokens=1000
        )
        
        answer = response.choices[0].message.content.strip()
        print(f"✅ 답변 완료: {len(answer)}글자")
        
        return answer
        
    except Exception as e:
        print(f"❌ AI 오류: {e}")
        return f"죄송합니다. 분석 중 오류가 발생했습니다: {str(e)}"

def simple_chat(message):
    """기본 대화 처리"""
    message_lower = message.lower()
    
    if "안녕" in message_lower or "hello" in message_lower:
        if csv_loaded:
            return f"""안녕하세요! 😊

친환경 제품 수출입 데이터 분석 챗봇입니다.

현재 2024년 6월부터 2025년 5월까지의 데이터를 보유하고 있습니다.

해당 범위 내에서 자유롭게 질문해주세요!

예: "세제 수출 현황은?"
   "수출액이 가장 큰 제품은?"
   "베트남에 수출하는 제품들 비교해줘" """
        else:
            return "안녕하세요! 데이터 로딩 중입니다."
    
    elif "도움" in message_lower or "help" in message_lower:
        return f"""📚 사용법 안내

🤖 GPT-4.1 기반 데이터 분석 챗봇
📊 현재 {len(csv_data) if csv_loaded else 0}개 데이터 분석 가능
데이터 범위 : 2024년 6월 ~ 2025년 5월

💡 이런 질문들을 해보세요:
• "○○ 제품 수출 현황은?"
• "가장 많이 수출되는 제품은?"
• "중국과 일본 수출 비교해줘"
• "전체 데이터를 요약해줘"

전체 데이터를 한번에 분석해서 정확한 답변을 드려요! 🚀"""
    
    elif "감사" in message_lower or "고마워" in message_lower:
        return "천만에요! 😊 다른 궁금한 것이 있으면 언제든 말씀해주세요."
    
    elif "테스트" in message_lower:
        return "테스트 성공! 🎉 GPT-4.1 시스템이 정상 작동하고 있습니다."
    
    elif any(word in message_lower for word in ["데이터", "정보", "확인"]):
        if csv_loaded:
            return f"""📊 현재 데이터 상태:

• 총 {len(csv_data)}개 질문-답변 쌍
• 컬럼: {', '.join(csv_data.columns)}
• 모델: GPT-4.1 (128K 토큰)
• 상태: 전체 데이터 분석 준비 완료 ✅

구체적인 질문을 해주시면 전체 데이터를 분석해서 답변드려요!"""
        else:
            return "데이터 로딩 중입니다."
    
    else:
        return None

# ================================
# API 엔드포인트
# ================================

@app.on_event("startup")
async def startup_event():
    print("🚀 GPT-4o mini 챗봇 서버 시작!")
    os.makedirs("data", exist_ok=True)
    
    if load_csv_file():
        print("✅ 시스템 준비 완료!")
    else:
        print("⚠️ data/QA_Refinement.csv 파일을 확인하세요.")

@app.get("/")
async def root():
    return {
        "message": "GPT-4.1 CSV 분석 챗봇",
        "version": "3.0.0",
        "model": "GPT-4.1",
        "csv_loaded": csv_loaded,
        "data_rows": len(csv_data) if csv_loaded else 0
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model": "GPT-4.1",
        "csv_loaded": csv_loaded,
        "data_rows": len(csv_data) if csv_loaded else 0,
        "ai_ready": bool(os.getenv("OPENAI_API_KEY")),
        "message": "GPT-4.1 시스템 정상"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """메인 채팅 처리"""
    try:
        user_message = request.message
        print(f"📥 질문: {user_message}")
        
        if not csv_loaded:
            return ChatResponse(
                response="데이터 로딩 중입니다. 잠시만 기다려주세요!",
                success=False
            )
        
        # 기본 대화 확인
        simple_response = simple_chat(user_message)
        
        if simple_response:
            ai_response = simple_response
        else:
            # GPT-4o mini 분석
            ai_response = ask_gpt4_mini(user_message)
        
        print(f"📤 답변 완료")
        
        return ChatResponse(
            response=ai_response,
            success=True
        )
        
    except Exception as e:
        print(f"❌ 오류: {e}")
        return ChatResponse(
            response=f"처리 중 오류가 발생했습니다: {str(e)}",
            success=False
        )

@app.get("/data-info")
async def get_data_info():
    """데이터 정보 확인"""
    if not csv_loaded:
        return {"error": "데이터가 로드되지 않았습니다"}
    
    return {
        "model": "GPT-4.1",
        "total_rows": len(csv_data),
        "columns": list(csv_data.columns),
        "knowledge_base_size": len(knowledge_base),
        "estimated_tokens": int(len(knowledge_base.split()) * 1.3),
        "sample_questions": [
            str(csv_data.iloc[i].get('질문', '')) 
            for i in range(min(5, len(csv_data)))
            if str(csv_data.iloc[i].get('질문', '')) != 'nan'
        ]
    }

@app.get("/model-info")
async def get_model_info():
    """모델 정보"""
    return {
        "model": "GPT-4.1",
        "context_window": "128K tokens",
        "max_output": "2000 tokens",
        "temperature": 0.3,
        "features": [
            "전체 CSV 데이터 동시 분석",
            "토큰 제한 없음",
            "종합 비교 분석",
            "정확한 수치 인용"
        ]
    }

# ================================
# 서버 실행
# ================================
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 GPT-4.1 CSV 챗봇 시작")
    print("📡 포트: 8000")
    print("🧠 GPT-4o mini (128K 토큰)")
    print("📊 전체 데이터 동시 분석")
    print("=" * 60)
    
    uvicorn.run(
        "chat_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )