from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, create_engine, Session, Field, select
from pydantic import BaseModel
from .auth import get_password_hash, verify_password, create_access_token, verify_token
from typing import Annotated, Optional
from contextlib import asynccontextmanager
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")

# Handle PostgreSQL URL format for SQLModel
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Security
security = HTTPBearer()

# User Model
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, min_length=3, max_length=50)
    email: str = Field(index=True, unique=True, max_length=100)
    hashed_password: str = Field()

# User schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

# Todo Model
class ToDo(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)
    content: str = Field(index= True, min_length = 3, max_length=100)
    isCompleted: bool = Field(default=False)
    user_id: int | None = Field(default=None, foreign_key="user.id")  # Link todos to users

def create_tables():
    """Create the database and tables."""
    SQLModel.metadata.create_all(engine)


# todo1 : ToDo = ToDo(content="Buy groceries")
# todo2 : ToDo = ToDo(content="Walk the dog")

# session = Session(engine)
# session.add_all([todo1, todo2])
# session.commit()
# session.close()


def get_session():
    with Session(engine) as session:
        yield session

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Get the current authenticated user."""
    token = credentials.credentials
    user_id = verify_token(token)
    
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating DB Tables...")
    create_tables()
    print("DB Tables created successfully.")
    yield
  


app: FastAPI = FastAPI( lifespan=lifespan , title="myToDo API",  version="1.0.0") 

# Add CORS middleware
origins = [
    "http://localhost:3000",  # Local development
    "https://*.railway.app",  # Railway deployment
    "https://*.vercel.app",   # Vercel deployment
    "https://*.render.com",   # Render deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 


@app.get("/")
async def root():
    return {"message": "Welcome to myToDo API!"}

# Authentication endpoints
@app.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, session: Annotated[Session, Depends(get_session)]):
    """Register a new user."""
    
    # Check if username already exists
    statement = select(User).where(User.username == user_data.username)
    existing_username = session.exec(statement).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    statement = select(User).where(User.email == user_data.email)
    existing_email = session.exec(statement).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return UserResponse(id=user.id, username=user.username, email=user.email)

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, session: Annotated[Session, Depends(get_session)]):
    """Authenticate user and return access token."""
    
    # Find user by email
    statement = select(User).where(User.email == user_data.email)
    user = session.exec(statement).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer")
    

@app.post("/todos/", response_model=ToDo)
async def create_todo(
    todo: ToDo, 
    session: Annotated[Session, Depends(get_session)],
    current_user: User = Depends(get_current_user)
):
    """Create a new todo for the authenticated user."""
    todo.user_id = current_user.id
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo
    
 
@app.get("/todos/", response_model=list[ToDo])
async def get_todos(
    session: Annotated[Session, Depends(get_session)],
    current_user: User = Depends(get_current_user)
):
    """Get all todos for the authenticated user."""
    statement = select(ToDo).where(ToDo.user_id == current_user.id)
    todos = session.exec(statement).all()
    return todos


@app.get("/todos/{id}", response_model=ToDo)
async def get_todo(
    id: int, 
    session: Annotated[Session, Depends(get_session)],
    current_user: User = Depends(get_current_user)
):
    """Get a specific todo for the authenticated user."""
    statement = select(ToDo).where(ToDo.id == id, ToDo.user_id == current_user.id)
    todo = session.exec(statement).first()  
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo
    


@app.put("/todos/{id}")
async def update_todo(
    id: int, 
    session: Annotated[Session, Depends(get_session)], 
    todo: ToDo,
    current_user: User = Depends(get_current_user)
):
    """Update a todo for the authenticated user."""
    statement = select(ToDo).where(ToDo.id == id, ToDo.user_id == current_user.id)
    existing_todo = session.exec(statement).first()
    if existing_todo is None:
       raise HTTPException(status_code=404, detail="Todo not found")
    
    if todo.id is not None and todo.id != existing_todo.id:
        raise HTTPException(status_code=400, detail="Cannot change the ID of a todo item")
    
    existing_todo.content = todo.content
    existing_todo.isCompleted = todo.isCompleted
    session.add(existing_todo)
    session.commit()
    session.refresh(existing_todo)

    return existing_todo


@app.delete("/todos/{id}")
async def delete_todo(
    id: int, 
    session: Annotated[Session, Depends(get_session)],
    current_user: User = Depends(get_current_user)
):
    """Delete a todo for the authenticated user."""
    statement = select(ToDo).where(ToDo.id == id, ToDo.user_id == current_user.id)
    existing_todo = session.exec(statement).first()
    if existing_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    session.delete(existing_todo)
    session.commit()
    return {"message": "Todo deleted successfully"}



