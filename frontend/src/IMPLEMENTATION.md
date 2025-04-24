# EduDiagno Project Structure & Implementation Guide

## Project Overview

EduDiagno is an educational assessment platform that helps educational institutions create, deliver, and analyze AI-powered assessments. The application features a sophisticated interview system, analytics, and comprehensive management tools.

## Project Structure

### File Organization

```
src/
├── components/         # Reusable UI components
│   ├── common/         # Shared components used across the app
│   ├── interview/      # Components specific to the interview experience
│   ├── layout/         # Layout components (headers, footers, etc.)
│   └── ui/             # Shadcn UI components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and helpers
├── pages/              # Page components organized by feature
│   ├── Dashboard/      # Dashboard pages (protected routes)
│   │   ├── Candidates/ # Candidate management
│   │   ├── Interviews/ # Interview management
│   │   └── Jobs/       # Job management
│   ├── Interview/      # Interview experience pages
│   └── [Public Pages]  # Landing, About, etc.
└── App.tsx             # Main application component and routing
```

### Key Components

1. **AIAvatar**: Animated avatar representing the AI interviewer with visual feedback
2. **RecordingButton**: UI for recording candidate responses
3. **DashboardLayout**: Layout wrapper for authenticated dashboard pages
4. **LandingLayout**: Layout wrapper for public/marketing pages

## Routing Structure

The application uses React Router with the following route structure:

### Public Routes
- `/` - Landing page
- `/features` - Product features
- `/pricing` - Pricing plans
- `/about` - About the company
- `/case-studies` - Customer success stories
- `/contact` - Contact information
- `/privacy` - Privacy policy
- `/careers` - Career opportunities
- `/integrations` - Integration partners
- `/changelog` - Product updates
- `/how-it-works` - Product workflow explanation
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password recovery
- `/interview/:interviewId` - Public interview experience for candidates

### Protected Routes (require authentication)
- `/dashboard` - Main dashboard
- `/dashboard/jobs` - Job listings
- `/dashboard/jobs/new` - Create new job
- `/dashboard/candidates` - Candidate listings
- `/dashboard/candidates/:id` - Candidate details
- `/dashboard/interviews` - Interview listings
- `/dashboard/interviews/:id` - Interview details
- `/dashboard/analytics` - Analytics dashboard
- `/dashboard/profile` - User profile
- `/dashboard/settings` - Application settings
- `/dashboard/help` - Help and support

## Interview System Implementation

The interview system is a core feature of EduDiagno, providing an interactive AI-driven interview experience.

### Key Components of the Interview System:

1. **AIAvatar Component**: 
   - Provides a human-like representation of the AI interviewer
   - Features visual feedback when speaking (pulsating border, animation)
   - Can display either a default avatar image or a fallback icon

2. **RecordingButton Component**:
   - Manages recording UI states (start, stop, processing)
   - Shows recording time and processing state
   - Provides visual feedback during recording

3. **InterviewResponseProcessor**:
   - Handles the processing of candidate responses
   - Generates follow-up questions or transitions between questions
   - Provides scoring and feedback (would integrate with AI in production)

4. **CandidateInterview Component**:
   - Manages the overall interview experience
   - Coordinates the interview flow (question presentation, response recording, feedback)
   - Handles device permissions and testing
   - Displays the transcript and provides navigation between questions

### Interview Flow:

1. **Preparation Phase**:
   - Candidate reviews job information and interview guidelines
   - Tests camera and microphone
   - Begins interview when ready

2. **Question and Response Phase (per question)**:
   - AI presents a question with visual speaking feedback
   - Candidate is given time to prepare
   - Candidate records their response
   - System processes the response
   - AI provides a transition to the next question
   - Process repeats for each question

3. **Completion Phase**:
   - AI provides closing remarks
   - Candidate receives summary of the interview
   - Option to download transcript

### Integration Points:

In a production environment, this system would integrate with:

1. **Speech Recognition API**: For real-time transcription of candidate responses
2. **Natural Language Processing**: For analyzing response quality and relevance
3. **Video Processing**: For capturing and analyzing non-verbal cues
4. **Assessment Engine**: For scoring responses against predefined rubrics

## Removing Sample Data

To remove sample data and connect to real data sources:

1. **API Integration**:
   - Replace mock data in page components with API calls
   - Implement proper error handling and loading states

2. **Authentication**:
   - The `AuthContext.tsx` needs to be connected to your authentication service
   - Update the `RequireAuth.tsx` component to use real auth checks

3. **Interview System**:
   - Replace simulated responses in `CandidateInterview.tsx` with actual recording functionality
   - Connect `InterviewResponseProcessor.tsx` to your AI processing service
   - Implement real-time transcription using a service like OpenAI Whisper

4. **Key Files with Sample Data**:
   - `src/pages/Dashboard/Interviews/InterviewDetail.tsx`
   - `src/pages/Dashboard/Candidates/CandidateDetail.tsx`
   - `src/pages/Dashboard/Jobs/JobsIndex.tsx`
   - `src/pages/CaseStudies.tsx`
   - `src/pages/Interview/CandidateInterview.tsx`
   - `src/components/interview/InterviewResponseProcessor.tsx`

## Development Workflow

1. **Local Development**:
   - Run `npm run dev` for local development
   - Changes will be hot-reloaded

2. **Adding New Features**:
   - Create new components in the appropriate directories
   - Update routes in `App.tsx` if adding new pages
   - Use existing UI components from `components/ui/`

3. **Styling**:
   - Use Tailwind CSS for styling
   - Follow the existing design patterns

4. **State Management**:
   - Use React Query for server state
   - Use React Context for global application state
   - Use local state for component-specific state

## Deployment

The application can be deployed to any hosting platform that supports React applications.

## Important Features

### AI Interview System
- The `CandidateInterview.tsx` component handles the live interview experience
- The `AIAvatar.tsx` component provides visual feedback during the interview
- The interview process includes preparation, recording, feedback, and transition phases

### Analytics
- The `Analytics.tsx` component shows assessment data and insights
- Charts are implemented using Recharts library

### Assessment Management
- Create and manage assessment templates
- Configure questions and scoring rubrics
- Review and analyze results

### Dashboard Routes
- `/dashboard` - Main dashboard
- `/dashboard/jobs` - Job listings and management
- `/dashboard/candidates` - Candidate management
- `/dashboard/interviews` - Interview scheduling and management
- `/dashboard/help` - Help and support
- `/dashboard/settings` - User settings

### Dashboard Components
- The `Dashboard.tsx` component shows key metrics and recent activity
- The `Jobs.tsx` component manages job postings and applications
- The `Candidates.tsx` component handles candidate profiles and applications
- The `Interviews.tsx` component manages interview scheduling and results
- The `Help.tsx` component provides support and documentation
- The `Settings.tsx` component manages user preferences and account settings
