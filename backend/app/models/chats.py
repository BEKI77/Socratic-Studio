from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    student_solution: str
