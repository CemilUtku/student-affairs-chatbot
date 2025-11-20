from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from utils import (
    generate_response_with_context,
    load_chroma_db,
    load_llm,
    create_prompt_template,
    create_qa_chain
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Embed edilmiş veritabanı, LLM ve QA zinciri başlatılıyor
chroma_db = load_chroma_db()
llm = load_llm()
prompt_template = create_prompt_template()
qa = create_qa_chain(chroma_db, llm, prompt_template)

@app.get("/chat-response/")
def get_chat_response(user_input: str):
    try:
        result = generate_response_with_context(user_input, qa, chroma_db)
        return {"response": result["response"]}
    except Exception as e:
        return {"error": str(e)}