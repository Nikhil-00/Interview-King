from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import START, END, StateGraph
from doctr.io import DocumentFile
from doctr.models import ocr_predictor
from langgraph.graph.message import add_messages
from typing import TypedDict, Literal, Annotated, Optional
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, BaseMessage
from langgraph.checkpoint.memory import MemorySaver
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import os
import shutil

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS for production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8080").split(",")
if os.getenv("ENVIRONMENT") == "production":
    # In production, use specific origins
    allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]
else:
    # In development, allow all localhost
    allowed_origins.extend(["*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Get Groq API key from environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables. Please check your .env file.")

# LLM Model
model = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=GROQ_API_KEY
)


class analyse(BaseModel):
    Ats_score: int = Field(default=0, ge=0, le=100, description="Score between 0 to 100")
    similar: int = Field(default=0, ge=0, le=100, description="Score between 0 to 100")


strucuted_output = model.with_structured_output(analyse)


class ChatBot(TypedDict):
    message: Annotated[list[BaseMessage], add_messages]
    pdf_path: str
    JD_path: str
    parsePDF_resume: str
    parsePDF_JD: str
    strength: str
    Area_of_Improvement: str
    Matching_qualifications: str
    skills_gap:str
    skills: str
    exp: str
    projects: str
    Behavioral_Question: str
    Technical_Question: str
    Situation_Question: str
    Leadership_Question: str

# OCR Model
ocr_model = ocr_predictor(pretrained=True)


def Upload(state: dict):
    global resume
    pdf_path = state['pdf_path']
    JD_path = state['JD_path']

    try:
        print(f"Processing resume file: {pdf_path}")
        doc_resume = DocumentFile.from_pdf(pdf_path)
        resume_text = ocr_model(doc_resume).render()
        resume = resume_text
        print("Successfully processed resume")

        print(f"Processing job description file: {JD_path}")
        doc_req = DocumentFile.from_pdf(JD_path)
        req_text = ocr_model(doc_req).render()
        print("Successfully processed job description")

        return {'parsePDF_resume': resume_text, 'parsePDF_JD': req_text}
    except Exception as e:
        print(f"Error in Upload function: {str(e)}")
        raise e


# Sentence Transformer Embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def Chunking_embedding_vectorstore(state: ChatBot):
    splitter = RecursiveCharacterTextSplitter.from_language(
        language="python",
        chunk_size=500,
        chunk_overlap=150
    )
    chunks = splitter.split_text(state['parsePDF_resume'])
    chunks_index = splitter.create_documents(chunks)

    vector_store = Chroma.from_documents(chunks_index, embeddings, persist_directory="./chroma_db")
    retriever = vector_store.as_retriever(search_type='similarity', search_kwargs={'k': 4})

    retriever_doc = retriever.invoke("Technical and Soft Skills")
    skills_text = " ".join([d.page_content for d in retriever_doc])

    retriever_doc1 = retriever.invoke("Professional Experience ")
    skills_text1 = " ".join([d.page_content for d in retriever_doc1])

    retriever_doc2 = retriever.invoke("Projects")
    skills_text2 = " ".join([d.page_content for d in retriever_doc2])

    return {'skills': skills_text, 'exp': skills_text1, 'projects': skills_text2}


def similarity(state: ChatBot):
    # ATS score prompt
    prompt = f"""
    You are an expert resume evaluator.
    Analyze the ATS score (0-100) based on keyword optimization, structure, and completeness.
    Return ATS score as JSON in this exact format:
    {{"Ats_score": <score from 0 to 100>}}
    
    Resume text:
    {state['parsePDF_resume']}
    """
    Ats_SCORE = strucuted_output.invoke(prompt).Ats_score

    # Similarity score prompt
    prompt1 = f"""
    You are an expert job matching evaluator.
    Compare the resume skills with the job description and return the similarity score as JSON in this exact format:
    {{"similar": <score from 0 to 100>}}

    Resume Skills:
    {state['skills']}

    Job Description:
    {state['parsePDF_JD']}
    """
    Jd_SCORE = strucuted_output.invoke(prompt1).similar
    
    print(f"ATS Score: {Ats_SCORE}, Similarity Score: {Jd_SCORE}")
    return {'ats_score': Ats_SCORE, 'similarity_score': Jd_SCORE}

def Analyse_resume(state: ChatBot):
    prompt1 = f"""
    You are an expert resume evaluator.
    Analyze the candidate's strengths based on their resume. Provide exactly 4 key strengths in the following format:

    • [Strength 1 - brief description]
    • [Strength 2 - brief description]  
    • [Strength 3 - brief description]
    • [Strength 4 - brief description]

    Resume: {state['parsePDF_resume']}
    """
    strength = model.invoke(prompt1).content
    
    prompt2 = f"""
    You are an expert resume evaluator.
    Analyze the candidate's areas for improvement based on their resume. Provide exactly 4 key areas in the following format:

    • [Area 1 - brief description]
    • [Area 2 - brief description]
    • [Area 3 - brief description]
    • [Area 4 - brief description]

    Resume: {state['parsePDF_resume']}
    """
    Area_of_Improvement = model.invoke(prompt2).content
    
    prompt3 = f"""
    You are an expert resume evaluator.
    Analyze how the candidate's qualifications match the job requirements. Provide exactly 4 matching qualifications in the following format:

    • [Match 1 - brief description]
    • [Match 2 - brief description]
    • [Match 3 - brief description]
    • [Match 4 - brief description]

    Resume: {state['parsePDF_resume']}
    Job Description: {state['parsePDF_JD']}
    """
    Matching_qualifications = model.invoke(prompt3).content
    
    prompt4 = f"""
    You are an expert resume evaluator.
    Analyze the skill gaps between the candidate's resume and job requirements. Provide exactly 4 key skill gaps in the following format:

    • [Gap 1 - brief description]
    • [Gap 2 - brief description]
    • [Gap 3 - brief description]
    • [Gap 4 - brief description]

    Resume: {state['parsePDF_resume']}
    Job Description: {state['parsePDF_JD']}
    """
    skills_gap = model.invoke(prompt4).content
    
    print("📊 Analysis Results:")
    print(f"💪 Strengths: {strength}")
    print(f"⚠️ Areas of Improvement: {Area_of_Improvement}")
    print(f"🎯 Matching Qualifications: {Matching_qualifications}")
    print(f"📈 Skills Gap: {skills_gap}")
    
    return {'strength': strength, 'Area_of_Improvement': Area_of_Improvement, 'Matching_qualifications': Matching_qualifications, 'skills_gap': skills_gap}

def Chat_bot(state: ChatBot):
    messages = state['message']
    response = model.invoke(messages)
    return {'message': [response]}


def Question(state: ChatBot):
    prompt1 = f"""
    You are an expert technical interviewer. Based on the candidate's background, generate 10 
    well-structured technical interview questions along with clear, detailed answers. 
    The questions should be directly related to the candidate's:

    - Professional Experience: {state['exp']}
    - Projects: {state['projects']}
    - Technical Skills: {state['skills']}

    Guidelines:
    1. Questions must test practical understanding, problem-solving, and application of knowledge.
    2. Answers should be accurate, concise, and at an interviewer’s expected level.
    3. Include a mix of theory-based and scenario/problem-based questions.
    4. Format output as:
       Q1: [Question]  
       A1: [Answer]  
       Q2: [Question]  
       A2: [Answer]  
       ...
    """
    Technical_Question = model.invoke(prompt1).content
    
    prompt2 = f"""
    You are an expert HR interviewer. Based on the candidate's background, generate 5 
    behavioral interview questions along with thoughtful sample answers. 
    The questions should be directly related to the candidate's:

    - Professional Experience: {state['exp']}
    - Projects: {state['projects']}
    - Technical Skills: {state['skills']}

    Guidelines:
    1. Frame questions using the STAR method (Situation, Task, Action, Result).
    2. Answers should be realistic, concise, and reflect teamwork, leadership, problem-solving, 
       adaptability, and communication skills.
    3. Cover diverse themes such as conflict resolution, decision-making, time management, 
       leadership, and handling failures.
    4. Format output as:
       Q1: [Question]  
       A1: [Answer]  
       Q2: [Question]  
       A2: [Answer]  
       ...
    """
    Behavioral_Question = model.invoke(prompt2).content
    
    prompt3 = f"""
    You are a professional interviewer. Based on the candidate's background, generate 5 
    situation-based interview questions along with well-structured sample answers. 
    The questions should be directly related to the candidate's:

    - Professional Experience: {state['exp']}
    - Projects: {state['projects']}
    - Technical Skills: {state['skills']}

    Guidelines:
    1. Questions must describe a realistic workplace situation and ask how the candidate 
       would respond or act.
    2. Answers should follow logical reasoning, showcasing decision-making, problem-solving, 
       teamwork, adaptability, and leadership skills.
    3. Include a variety of scenarios such as meeting deadlines, handling conflicts, working 
       in a team, managing limited resources, and adapting to change.
    4. Format output as:
       Q1: [Situation-based Question]  
       A1: [Sample Answer]  
       Q2: [Situation-based Question]  
       A2: [Sample Answer]  
       ...
    """
    situation_Question = model.invoke(prompt3).content
    
    prompt4 = f"""
    You are an expert leadership interviewer. Based on the candidate's background, generate 5
    leadership-focused interview questions along with thoughtful sample answers. 
    The questions should be directly related to the candidate's:

    - Professional Experience: {state['exp']}
    - Projects: {state['projects']}
    - Technical Skills: {state['skills']}

    Guidelines:
    1. Questions should evaluate leadership qualities such as decision-making, conflict 
       management, mentoring, delegation, vision, accountability, and motivating a team.
    2. Answers should be structured, realistic, and demonstrate emotional intelligence, 
       influence, and strategic thinking.
    3. Include a variety of scenarios like leading a diverse team, resolving conflicts, 
       handling failure, inspiring others, and driving innovation.
    4. Format output as:
       Q1: [Leadership Question]  
       A1: [Sample Answer]  
       Q2: [Leadership Question]  
       A2: [Sample Answer]  
       ...
    """
    Leadership_Question = model.invoke(prompt4).content

    print("🔧 Question Generation Results:")
    print(f"📝 Technical Questions (length: {len(Technical_Question)}): {Technical_Question[:100]}...")
    print(f"🤝 Behavioral Questions (length: {len(Behavioral_Question)}): {Behavioral_Question[:100]}...")
    print(f"🎯 Situation Questions (length: {len(situation_Question)}): {situation_Question[:100]}...")
    print(f"👑 Leadership Questions (length: {len(Leadership_Question)}): {Leadership_Question[:100]}...")

    return {'Technical_Question': Technical_Question , 'Behavioral_Question': Behavioral_Question , 'Situation_Question': situation_Question , 'Leadership_Question': Leadership_Question }


def evaluate_answer(question: str, student_answer: str, correct_answer: str, question_type: str) -> dict:
    """
    Evaluate student's answer against the correct answer using AI
    """
    evaluation_prompt = f"""
    You are an expert interview evaluator. Evaluate the student's answer against the correct answer for this {question_type} question.

    Question: {question}
    
    Correct Answer: {correct_answer}
    
    Student's Answer: {student_answer}

    Please provide a comprehensive evaluation with:
    1. Score (0-100): Rate the student's answer quality
    2. Detailed Feedback: What was good and what needs improvement
    3. Key Strengths: What the student did well in their answer
    4. Areas for Improvement: Specific suggestions for better answers

    Evaluation Criteria:
    - Accuracy and relevance to the question
    - Completeness of the answer
    - Clarity and structure
    - Use of examples or specific details
    - Demonstration of understanding

    Format your response as:
    SCORE: [0-100]
    
    FEEDBACK:
    [Detailed feedback paragraph]
    
    STRENGTHS:
    [What the student did well]
    
    IMPROVEMENTS:
    [Specific areas to improve]
    """
    
    try:
        response = model.invoke(evaluation_prompt).content
        
        # Parse the response to extract score, feedback, strengths, and improvements
        lines = response.split('\n')
        score = 75  # default score
        feedback = ""
        strengths = ""
        improvements = ""
        
        current_section = ""
        for line in lines:
            line = line.strip()
            if line.startswith("SCORE:"):
                try:
                    score = int(line.replace("SCORE:", "").strip())
                except:
                    score = 75
            elif line.startswith("FEEDBACK:"):
                current_section = "feedback"
            elif line.startswith("STRENGTHS:"):
                current_section = "strengths"
            elif line.startswith("IMPROVEMENTS:"):
                current_section = "improvements"
            elif line and current_section:
                if current_section == "feedback":
                    feedback += line + " "
                elif current_section == "strengths":
                    strengths += line + " "
                elif current_section == "improvements":
                    improvements += line + " "
        
        return {
            "score": max(0, min(100, score)),  # Ensure score is between 0-100
            "feedback": feedback.strip() or "Good effort! Keep practicing to improve your interview skills.",
            "strengths": strengths.strip() or "You showed understanding of the topic.",
            "improvements": improvements.strip() or "Focus on providing more specific examples and details."
        }
        
    except Exception as e:
        print(f"Error in answer evaluation: {str(e)}")
        return {
            "score": 50,
            "feedback": "Unable to evaluate the answer at this time. Please try again.",
            "strengths": "Answer received successfully.",
            "improvements": "Please ensure your answer is clear and detailed."
        }


# Create uploads directory if it doesn't exist
uploads_dir = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(uploads_dir, exist_ok=True)

class AnalysisResponse(BaseModel):
    ats_score: int
    similarity_score: int
    strength: str
    area_of_improvement: str
    matching_qualifications: str
    skills_gap: str
    technical_questions: str
    behavioral_questions: str
    situation_questions: str
    leadership_questions: str

class AnswerSubmission(BaseModel):
    question: str
    student_answer: str
    correct_answer: str
    question_type: str  # "technical", "behavioral", "situational", "leadership"

class AnswerEvaluation(BaseModel):
    score: int  # 0-100
    feedback: str
    correct_answer: str
    strengths: str
    improvements: str

@app.get("/")
async def root():
    return {"message": "Resume Analysis API is running!", "status": "OK"}

@app.get("/test")
async def test_endpoint():
    return {
        "message": "Test endpoint working",
        "ats_score": 85,
        "similarity_score": 78,
        "timestamp": "2024-01-01"
    }

@app.post("/upload/")
async def upload_files(resume: UploadFile = File(...), job_description: UploadFile = File(...)):
    try:
        print(f"Received files: Resume: {resume.filename}, JD: {job_description.filename}")
        
        # Create unique filenames
        resume_filename = f"{os.path.splitext(resume.filename)[0]}_{os.urandom(4).hex()}.pdf"
        jd_filename = f"{os.path.splitext(job_description.filename)[0]}_{os.urandom(4).hex()}.pdf"
        
        resume_path = os.path.join(uploads_dir, resume_filename)
        jd_path = os.path.join(uploads_dir, jd_filename)
        
        # Save uploaded files
        resume_content = await resume.read()
        jd_content = await job_description.read()
        
        with open(resume_path, "wb") as buffer:
            buffer.write(resume_content)
        with open(jd_path, "wb") as buffer:
            buffer.write(jd_content)
            
        # Create workflow graph
        workflow_state = {
            "pdf_path": resume_path,
            "JD_path": jd_path,
            "parsePDF_resume": "",
            "parsePDF_JD": "",
            "strength": "",
            "Area_of_Improvement": "",
            "Matching_qualifications": "",
            "skills_gap": "",
            "skills": "",
            "exp": "",
            "projects": "",
            "Behavioral_Question": "",
            "Technical_Question": "",
            "Situation_Question": "",
            "Leadership_Question": ""
        }
        
        print("Starting workflow with files:", resume_path, jd_path)
        
        # Step 1: Upload and OCR
        upload_result = Upload({"pdf_path": resume_path, "JD_path": jd_path})
        workflow_state.update(upload_result)
        print("Upload complete:", upload_result)
        
        # Step 2: Chunking and embedding
        chunk_result = Chunking_embedding_vectorstore(workflow_state)
        workflow_state.update(chunk_result)
        print("Chunking complete:", chunk_result)
        
        # Step 3: Similarity analysis
        sim_result = similarity(workflow_state)
        workflow_state.update(sim_result)
        print("Similarity analysis complete:", sim_result)
        
        # Step 4: Resume analysis
        analysis_result = Analyse_resume(workflow_state)
        workflow_state.update(analysis_result)
        print("Resume analysis complete:", analysis_result)
        
        # Step 5: Generate questions
        question_result = Question(workflow_state)
        workflow_state.update(question_result)
        print("Question generation complete:", question_result)
        
        # Final output
        output = workflow_state
        print("Complete workflow output keys:", list(output.keys()))
        print("ATS Score in output:", output.get('ats_score', 'NOT FOUND'))
        print("Similarity Score in output:", output.get('similarity_score', 'NOT FOUND'))
        
        analysis_response = AnalysisResponse(
            ats_score=output.get('ats_score', 75),  # Default to 75 if not found
            similarity_score=output.get('similarity_score', 70),  # Default to 70 if not found
            strength=output.get('strength', 'No strengths analyzed'),
            area_of_improvement=output.get('Area_of_Improvement', 'No areas of improvement analyzed'),
            matching_qualifications=output.get('Matching_qualifications', 'No matching qualifications found'),
            skills_gap=output.get('skills_gap', 'No skills gap analyzed'),
            technical_questions=output.get('Technical_Question', 'No technical questions generated'),
            behavioral_questions=output.get('Behavioral_Question', 'No behavioral questions generated'),
            situation_questions=output.get('Situation_Question', 'No situation questions generated'),
            leadership_questions=output.get('Leadership_Question', 'No leadership questions generated')
        )
        print("Prepared response:", analysis_response.dict())
        return analysis_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up uploaded files
        try:
            if os.path.exists(resume_path):
                os.remove(resume_path)
            if os.path.exists(jd_path):
                os.remove(jd_path)
        except Exception as e:
            print(f"Error cleaning up files: {str(e)}")

class ChatMessage(BaseModel):
    message: str
    domain: Optional[str] = None

# Store chat sessions
chat_sessions = {}

@app.post("/chat/")
async def chat(chat_message: ChatMessage):
    if chat_message.domain and chat_message.domain not in chat_sessions:
        # Initialize new chat session with domain
        checkpointer = MemorySaver()
        graph = StateGraph(ChatBot)
        
        graph.add_node("Chat_bot", Chat_bot)
        graph.add_edge(START, "Chat_bot")
        graph.add_edge('Chat_bot', END)
        
        work = graph.compile(checkpointer=checkpointer)
        
        thread_id = chat_message.domain
        config = {'configurable': {'thread_id': thread_id}}
        
        initial_prompt = f"You are a helpful AI assistant. I am in an interview, and my candidate's domain is {chat_message.domain}."
        response = work.invoke({'message': [HumanMessage(content=initial_prompt)]}, config=config)
        
        chat_sessions[chat_message.domain] = {
            'work': work,
            'config': config
        }
    
    session = chat_sessions.get(chat_message.domain)
    if not session:
        return {"error": "No active chat session. Please provide a domain."}
    
    response = session['work'].invoke(
        {'message': [HumanMessage(content=chat_message.message)]}, 
        config=session['config']
    )
    
    return {"response": response['message'][-1].content}

@app.post("/evaluate_answer/", response_model=AnswerEvaluation)
async def evaluate_student_answer(answer_submission: AnswerSubmission):
    """
    Evaluate student's answer and provide feedback with correct answer
    """
    try:
        print(f"Evaluating answer for {answer_submission.question_type} question")
        print(f"Question: {answer_submission.question[:100]}...")
        print(f"Student Answer: {answer_submission.student_answer[:100]}...")
        
        # Evaluate the answer using AI
        evaluation_result = evaluate_answer(
            question=answer_submission.question,
            student_answer=answer_submission.student_answer,
            correct_answer=answer_submission.correct_answer,
            question_type=answer_submission.question_type
        )
        
        # Create response
        evaluation_response = AnswerEvaluation(
            score=evaluation_result["score"],
            feedback=evaluation_result["feedback"],
            correct_answer=answer_submission.correct_answer,
            strengths=evaluation_result["strengths"],
            improvements=evaluation_result["improvements"]
        )
        
        print(f"Evaluation complete - Score: {evaluation_response.score}/100")
        return evaluation_response
        
    except Exception as e:
        print(f"Error evaluating answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)



