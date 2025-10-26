import type { WeatherResult, ErrorResult } from './types';
import { mcpManager } from './mcp-client';
import type { Env } from './core-utils';
export type ToolResult = WeatherResult | { content: string } | ErrorResult;
interface SerpApiResponse {
  knowledge_graph?: { title?: string; description?: string; source?: { link?: string } };
  answer_box?: { answer?: string; snippet?: string; title?: string; link?: string };
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  local_results?: Array<{ title?: string; address?: string; phone?: string; rating?: number }>;
  error?: string;
}
export async function triggerN8nWorkflow(env: Env, payload: Record<string, unknown>): Promise<{ success: boolean; message: string; error?: string }> {
  const webhookUrl = env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_URL is not set. Simulating success.');
    return { success: true, message: 'N8N workflow triggered (simulation).' };
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`N8N webhook failed with status ${response.status}: ${errorBody}`);
    }
    const responseData: unknown = await response.json();
    const message = (responseData && typeof responseData === 'object' && 'message' in responseData && typeof responseData.message === 'string')
      ? responseData.message
      : 'N8N workflow triggered successfully.';
    return { success: true, message };
  } catch (error) {
    console.error('Error triggering N8N workflow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: 'Failed to trigger N8N workflow.', error: errorMessage };
  }
}
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string', description: 'The city or location name' } },
        required: ['location']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web using Google or fetch content from a specific URL',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query for Google search' },
          url: { type: 'string', description: 'Specific URL to fetch content from (alternative to search)' },
          num_results: { type: 'number', description: 'Number of search results to return (default: 5, max: 10)', default: 5 }
        },
        required: []
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'trigger_n8n_workflow',
      description: 'Triggers a specified N8N workflow with a given payload, typically for data ingestion or RAG builds.',
      parameters: {
        type: 'object',
        properties: {
          payload: {
            type: 'object',
            description: 'The JSON payload to send to the N8N workflow.',
            properties: {
              workflow: { type: 'string', description: 'Identifier for the workflow, e.g., "rag-build".' },
              files: { type: 'array', description: 'List of files to process.' }
            },
            required: ['workflow']
          }
        },
        required: ['payload']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'trigger_n8n_chat_workflow',
      description: 'Sends a query to the N8N chat workflow to get information from the RAG-processed data.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The user\'s question to ask the RAG data.' },
          sessionId: { type: 'string', description: 'The current chat session ID for context.' }
        },
        required: ['query', 'sessionId']
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
const createSearchUrl = (query: string, apiKey: string, numResults: number) => {
  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('num', Math.min(numResults, 10).toString());
  return url.toString();
};
const formatSearchResults = (data: SerpApiResponse, query: string, numResults: number): string => {
  const results: string[] = [];
  if (data.knowledge_graph?.title && data.knowledge_graph.description) {
    results.push(`**${data.knowledge_graph.title}**\n${data.knowledge_graph.description}`);
    if (data.knowledge_graph.source?.link) results.push(`Source: ${data.knowledge_graph.source.link}`);
  }
  if (data.answer_box) {
    const { answer, snippet, title, link } = data.answer_box;
    if (answer) results.push(`**Answer**: ${answer}`);
    else if (snippet) results.push(`**${title || 'Answer'}**: ${snippet}`);
    if (link) results.push(`Source: ${link}`);
  }
  if (data.organic_results?.length) {
    results.push('\n**Search Results:**');
    data.organic_results.slice(0, numResults).forEach((result, index) => {
      if (result.title && result.link) {
        const text = [`${index + 1}. **${result.title}**`];
        if (result.snippet) text.push(`   ${result.snippet}`);
        text.push(`   Link: ${result.link}`);
        results.push(text.join('\n'));
      }
    });
  }
  if (data.local_results?.length) {
    results.push('\n**Local Results:**');
    data.local_results.slice(0, 3).forEach((result, index) => {
      if (result.title) {
        const text = [`${index + 1}. **${result.title}**`];
        if (result.address) text.push(`   Address: ${result.address}`);
        if (result.phone) text.push(`   Phone: ${result.phone}`);
        if (result.rating) text.push(`   Rating: ${result.rating} stars`);
        results.push(text.join('\n'));
      }
    });
  }
  return results.length ? `🔍 Search results for "${query}":\n\n${results.join('\n\n')}`
    : `No results found for "${query}". Try: https://www.google.com/search?q=${encodeURIComponent(query)}`;
};
async function performWebSearch(query: string, numResults: number, env: Env): Promise<string> {
  const apiKey = env.SERPAPI_KEY;
  if (!apiKey) {
    return `🔍 Web search requires SerpAPI key. Get one at https://serpapi.com/\nFallback: https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  try {
    const response = await fetch(createSearchUrl(query, apiKey, numResults), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`SerpAPI returned ${response.status}`);
    const data: SerpApiResponse = await response.json();
    if (data.error) throw new Error(`SerpAPI error: ${data.error}`);
    return formatSearchResults(data, query, numResults);
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes('timeout');
    const fallback = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return `Search failed: ${isTimeout ? 'timeout' : 'API error'}. Try: ${fallback}`;
  }
}
const extractTextFromHtml = (html: string): string => html
  .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
async function fetchWebContent(url: string): Promise<string> {
  try {
    new URL(url); // Validate
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/')) throw new Error('Unsupported content type');
    const html = await response.text();
    const text = extractTextFromHtml(html);
    return text.length ? `Content from ${url}:\n\n${text.slice(0, 4000)}${text.length > 4000 ? '...' : ''}`
      : `No readable content found at ${url}`;
  } catch (error) {
    throw new Error(`Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
export async function executeTool(name: string, args: Record<string, unknown>, env: Env): Promise<ToolResult> {
  try {
    switch (name) {
      case 'get_weather':
        return {
          location: args.location as string,
          temperature: Math.floor(Math.random() * 40) - 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 100)
        };
      case 'web_search': {
        const { query, url, num_results = 5 } = args;
        if (typeof url === 'string') {
          const content = await fetchWebContent(url);
          return { content };
        }
        if (typeof query === 'string') {
          const content = await performWebSearch(query, num_results as number, env);
          return { content };
        }
        return { error: 'Either query or url parameter is required' };
      }
      case 'trigger_n8n_workflow': {
        const payload = args.payload as Record<string, unknown>;
        const result = await triggerN8nWorkflow(env, payload);
        return { content: JSON.stringify(result) };
      }
      case 'trigger_n8n_chat_workflow': {
        const { query, sessionId } = args as { query: string; sessionId: string };
        const result = await triggerN8nWorkflow(env, { workflow: 'chat', query, sessionId });
        return { content: result.message };
      }
      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}