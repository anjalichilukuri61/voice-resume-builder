# Voice Resume Builder 🎙️📄

Voice Resume Builder is a modern, AI-powered full-stack application that allows users to build, edit, and optimize their professional resumes simply by speaking into their microphone.

## ✨ Features

- **Voice Studio (Speech-to-Resume)**: Talk naturally about your experience, and the AI will transcribe, extract, and format it directly into your resume fields.
- **Multi-Agent AI Orchestration**:
  - **Transcriber (Groq Whisper)**: Accurately converts user audio to text.
  - **Extractor (Groq LLaMA 3)**: Parses unstructured transcripts into structured JSON (Education, Projects, Experience, Skills, etc.).
  - **Auto-Categorizer**: Intelligently categorizes your resume (e.g., Software Engineer, Data Scientist) based on your spoken skills.
  - **Skill Grouping**: Automatically groups your skills into logical buckets (e.g., *Programming Languages, Frameworks & Libraries, Databases*).
  - **AI Voice Assistant**: Analyzes your resume for missing fields and speaks back to you using native browser Text-to-Speech (TTS) asking for the missing details.
- **Manual Resume Builder**: A clean, intuitive React form builder for manually tweaking your generated resume.
- **Modern Dashboard**: Track your total resumes, recent voice sessions, and overall activity.

## 🛠️ Technology Stack

### Frontend
- **React.js (Vite)**
- **TailwindCSS** for responsive, modern styling
- **React Hook Form** for robust form management
- **React Router** for client-side navigation
- **Lucide Icons**

### Backend
- **Java Spring Boot 3.2**
- **Spring WebFlux (Project Reactor)** for non-blocking asynchronous AI API calls
- **MongoDB** for flexible NoSQL data storage (Resumes, Voice Sessions)

### AI Integrations
- **Groq API**: Lightning-fast inference for both Whisper (Audio transcription) and LLaMA (LLM extraction).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java 21
- Maven
- MongoDB (Local or Atlas)
- Groq API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables. Open `src/main/resources/application.yml` and provide your credentials (or export them in your terminal):
   - `MONGO_URI`
   - `GROQ_API_KEY`
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

## 🎤 How to Use the Voice Studio
1. Navigate to the **Voice Studio** tab on the dashboard.
2. Toggle the **AI Orchestrator** ON.
3. Click the Microphone icon and talk about your experience. (e.g., *"My name is John. I am a software engineer. My skills include Java, Python, React, and MongoDB."*)
4. Stop the recording. The AI will transcribe your audio, extract the data, categorize your skills, and save them directly to your resume.
5. If you missed any critical information (like Education or Contact Info), the AI Assistant will speak to you and ask you for it!
6. Click **Review My Resume** to view the auto-filled forms and make any final manual adjustments.

## 🛡️ Security
This repository uses placeholders for sensitive API keys. Ensure that your local `.env` or system environment variables are properly configured before running the application. Never commit your `GROQ_API_KEY` or `MONGO_URI` to version control.

## 📄 License
This project is open-source and available under the MIT License.
