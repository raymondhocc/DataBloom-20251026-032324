# DataBloom AI

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/DataBloom-20251026-030817)

DataBloom AI is a sophisticated platform designed to empower users to seamlessly ingest, process, and interact with their data using advanced AI capabilities. It focuses on a visually stunning and intuitive user experience, making complex RAG (Retrieval Augmented Generation) workflows accessible. The application features a secure authentication system for user management. Users can upload multiple files or define data pipelines to Google Drive, which then triggers N8N workflows for RAG model building. A central, intelligent chatbot interface allows users to converse with the processed data, leveraging chat history and memory for personalized interactions. The UI is meticulously crafted with an illustrative, human-centered design, ensuring responsiveness across web and mobile devices, and prioritizing visual appeal and delightful micro-interactions.

## ✨ Key Features

*   **Secure User Authentication**: Robust login, signup, and logout functionalities.
*   **Multi-file Upload & Data Pipelines**: Intuitive interface for ingesting multiple files or configuring data pipelines to Google Drive.
*   **N8N Workflow Orchestration**: Triggers N8N workflows for RAG model building and data processing.
*   **Intelligent Chatbot**: A conversational AI interface with persistent chat history and memory for personalized interactions.
*   **Visually Stunning UI**: An illustrative, human-centered design with vibrant colors, smooth animations, and delightful micro-interactions.
*   **Responsive Design**: Flawless layouts and interactions across all device sizes, from mobile to desktop.
*   **Cloudflare Powered Backend**: Leverages Cloudflare Workers and Durable Objects for scalable, stateful backend logic and session management.
*   **AI Integration**: Utilizes OpenAI via Cloudflare AI Gateway for advanced AI capabilities.
*   **Tool Usage Visualization**: Clear indicators within the chat interface showing when AI agents use external tools.

## 🎨 Visual Design Principles

DataBloom AI embraces an 'Illustrative' design style: human-centered, whimsical, and expressive.

*   **Color Palette**:
    *   Primary Accent: `#F38020` (Rich Orange/Terra Cotta)
    *   Secondary Accent: `#764BA2` (Deep Purple)
    *   Illustrative Green: `#4CAF50` (Fresh Green for success/growth)
*   **Typography**: 'Playfair Display' for all major headings (H1-H6) for maximum impact, and 'Inter' for body text, captions, and labels for excellent readability.
*   **Interactive Polish**: Every interactive element features subtle elevation, color shifts, scale transitions, beautiful focus rings, and smooth animations powered by `framer-motion`.
*   **Responsive Perfection**: Designed mobile-first, ensuring an intentional and beautiful experience on every screen size.

## 🚀 Technology Stack

DataBloom AI is built with a modern and robust technology stack:

*   **Frontend**:
    *   [React](https://react.dev/) - A JavaScript library for building user interfaces.
    *   [Vite](https://vitejs.dev/) - A fast build tool for modern web projects.
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
    *   [shadcn/ui](https://ui.shadcn.com/) - Reusable components built with Radix UI and Tailwind CSS.
    *   [Framer Motion](https://www.framer.com/motion/) - A production-ready motion library for React.
    *   [Lucide React](https://lucide.dev/) - A beautiful icon library.
    *   [Zustand](https://zustand-demo.pmnd.rs/) - A small, fast, and scalable bearbones state-management solution.
    *   [React Router DOM](https://reactrouter.com/en/main) - Declarative routing for React.
    *   [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) - For robust form validation.
    *   [Sonner](https://sonner.emilkowal.ski/) - An opinionated toast component.
    *   [Immer](https://immerjs.github.io/immer/) - Immutable state with a mutable API.
    *   [Next.js Themes](https://github.com/pacocoursey/next-themes) (via `use-theme` hook) - For dark mode support.
*   **Backend (Cloudflare Worker)**:
    *   [Hono](https://hono.dev/) - A small, simple, and ultrafast web framework for the Edge.
    *   [Cloudflare Agents SDK](https://github.com/cloudflare/agents-sdk) - For stateful agent management with persistent Durable Objects.
    *   [Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/) - For consistent storage and coordination.
    *   [OpenAI SDK](https://github.com/openai/openai-node) - For AI model integration via Cloudflare AI Gateway.
    *   [Model Context Protocol (MCP) SDK](https://github.com/modelcontextprotocol/sdk) - For real server integration.
*   **Utilities**: `clsx`, `tailwind-merge`, `date-fns`, `uuid`.
*   **Fonts**: Playfair Display, Inter.

## ⚙️ Setup and Installation

To get DataBloom AI up and running on your local machine, follow these steps:

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd databloom-ai
    ```

2.  **Install dependencies**:
    This project uses `bun` as its package manager. If you don't have `bun` installed, you can find instructions [here](https://bun.sh/docs/installation).

    ```bash
    bun install
    ```

3.  **Configure Environment Variables**:
    Create a `.dev.vars` file in the root of your project (or configure environment variables in your Cloudflare Worker settings for deployment). You will need:

    ```
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    SERPAPI_KEY="your-serpapi-key" # Required for web_search tool
    OPENROUTER_API_KEY="your-openrouter-api-key" # If using OpenRouter models
    ```
    Replace `YOUR_ACCOUNT_ID`, `YOUR_GATEWAY_ID`, and API keys with your actual values.

## 💻 Local Development

To run the application in development mode:

```bash
bun dev
```

This will start the Vite development server and the Cloudflare Worker, accessible typically at `http://localhost:3000`. The frontend will automatically reload on changes.

## ☁️ Deployment to Cloudflare Workers

DataBloom AI is designed for seamless deployment to Cloudflare Workers.

1.  **Build the project**:

    ```bash
    bun run build
    ```

2.  **Deploy using Wrangler**:
    Ensure you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and configured.

    ```bash
    bun run deploy
    ```

    Wrangler will build your Worker and deploy it to your Cloudflare account.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/DataBloom-20251026-030817)

## ⚠️ Important Note on AI Usage

Although DataBloom AI incorporates powerful AI capabilities, there is a limit on the number of requests that can be made to the AI servers across all user applications in a given time period. Please be mindful of this usage constraint.

## 🗺️ Project Structure

The project is organized into two main parts:

*   `src/`: Contains the React frontend application.
    *   `src/pages/`: Main application pages (Auth, Dashboard, Upload, Chat, Settings).
    *   `src/components/`: Reusable React components, including `shadcn/ui` components.
    *   `src/hooks/`: Custom React hooks.
    *   `src/lib/`: Utility functions and API service integrations.
*   `worker/`: Contains the Cloudflare Worker backend.
    *   `worker/agent.ts`: The core `ChatAgent` Durable Object logic.
    *   `worker/app-controller.ts`: The `AppController` Durable Object for session management.
    *   `worker/chat.ts`: OpenAI integration and conversation handling.
    *   `worker/tools.ts`: Tool definitions and execution logic.
    *   `worker/userRoutes.ts`: API routes for the frontend.
    *   `worker/mcp-client.ts`: Model Context Protocol client for external tool integration.

## 🚧 Known Pitfalls

*   **N8N Webhook Reliability**: Ensuring robust communication between Cloudflare Workers and N8N, including retries and error reporting.
*   **Google Drive API Integration**: Managing authentication, authorization, and rate limits within N8N for file operations.
*   **Large File Uploads**: Efficiently handling large files, potentially requiring signed URLs for direct client-to-storage uploads.
*   **Conversation Context Management**: Maintaining relevant context within the `ChatAgent` for RAG integration without exceeding AI model token limits.
*   **State Consistency**: Ensuring consistent state (chat history, active session) between the client and Durable Objects.
*   **Security**: Properly securing all API endpoints and N8N webhooks.
*   **Visual Consistency vs. Whimsy**: Balancing an illustrative, whimsical design with a professional and consistent user experience.
*   **Performance**: Optimizing animations and visual effects for smooth 60fps interactions and fast loading times.
*   **Accessibility**: Ensuring high contrast and readability across themes for all users.