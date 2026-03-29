'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Copy, Check, Loader, Trash2, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { usePromptOptimizer } from '@/hooks/use-prompt-optimizer';
import { useOptimizerSessions } from '@/hooks/use-optimizer-sessions';

type ToneType = 'professional' | 'casual' | 'creative' | 'technical';
type StyleType = 'structured' | 'narrative' | 'step-by-step';

const optimizationTips = [
  {
    title: 'Be Specific',
    description: 'Include relevant context and details in your prompts',
    example: 'Instead of: "Write code"\nTry: "Write Python code for a binary search function with error handling"',
  },
  {
    title: 'Use Examples',
    description: 'Provide examples of the desired output format',
    example: 'Input format: "User: {question}"\nOutput format: "Assistant: {detailed answer}"',
  },
  {
    title: 'Clear Instructions',
    description: 'Use step-by-step instructions for complex tasks',
    example: '1. Analyze the problem\n2. Generate a solution\n3. Explain the reasoning',
  },
  {
    title: 'Set Constraints',
    description: 'Define length, tone, or format constraints',
    example: 'Keep response under 100 words, use professional tone',
  },
];

const promptTemplates = [
  {
    name: 'Code Generation',
    template:
      'Generate [language] code to [task description]. Include error handling and comments. Output format: code block only.',
  },
  {
    name: 'Analysis',
    template:
      'Analyze the following: [content]. Provide a structured analysis with key points, insights, and recommendations.',
  },
  {
    name: 'Creative Writing',
    template:
      'Write a [genre] story about [topic]. Length: [word count]. Tone: [tone]. Include [specific elements].',
  },
  {
    name: 'Explanation',
    template:
      'Explain [concept] in simple terms. Use analogies and examples. Target audience: [audience level].',
  },
  {
    name: 'Content Summary',
    template:
      'Summarize the following content: [content]. Include: key points, main ideas, and actionable takeaways.',
  },
  {
    name: 'Email Writing',
    template:
      'Write a professional email to [recipient] about [topic]. Tone: [tone]. Include [specific elements]. Keep it under [word count] words.',
  },
];

export function PromptOptimizerPanel() {
  const [prompt, setPrompt] = useState('');
  const [optimized, setOptimized] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<ToneType>('professional');
  const [style, setStyle] = useState<StyleType>('structured');
  const [error, setError] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const { optimizePrompt } = usePromptOptimizer();
  const {
    sessions,
    activeSessionId,
    isLoaded,
    createOptimizationSession,
    getActiveSession,
    updateSessionPrompt,
    updateSessionOptimized,
    updateSessionOptions,
    deleteSession,
    switchSession,
  } = useOptimizerSessions();

  // Load active session data on mount and when switching sessions
  useEffect(() => {
    if (isLoaded && activeSessionId) {
      const activeSession = getActiveSession();
      if (activeSession) {
        setPrompt(activeSession.data.prompt);
        setOptimized(activeSession.data.optimized);
        setTone(activeSession.data.tone);
        setStyle(activeSession.data.style);
      }
    } else if (isLoaded && !activeSessionId && sessions.length === 0) {
      createOptimizationSession();
    } else if (isLoaded && !activeSessionId && sessions.length > 0) {
      switchSession(sessions[0].id);
    }
  }, [isLoaded, activeSessionId, sessions.length, getActiveSession, createOptimizationSession, switchSession]);

  // Persist changes to session
  useEffect(() => {
    if (activeSessionId && isLoaded) {
      updateSessionPrompt(prompt);
    }
  }, [prompt, activeSessionId, isLoaded, updateSessionPrompt]);

  useEffect(() => {
    if (activeSessionId && isLoaded) {
      updateSessionOptimized(optimized);
    }
  }, [optimized, activeSessionId, isLoaded, updateSessionOptimized]);

  useEffect(() => {
    if (activeSessionId && isLoaded) {
      updateSessionOptions(tone, style);
    }
  }, [tone, style, activeSessionId, isLoaded, updateSessionOptions]);

  const handleOptimize = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setOptimized('');
    setError('');

    try {
      await optimizePrompt(prompt, (chunk) => {
        setOptimized((prev) => prev + chunk);
      }, { tone, style });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to optimize prompt';
      setError(message);
      setOptimized('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOptimized = () => {
    navigator.clipboard.writeText(optimized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectTemplate = (template: string) => {
    setPrompt(template);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex h-full">
        {/* Sessions Sidebar */}
        <div className={`${showSessions ? 'w-64' : 'w-0'} overflow-hidden transition-all duration-300 border-r border-border bg-card`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <Button
                onClick={() => createOptimizationSession()}
                className="w-full gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Session
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="p-2 space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      activeSessionId === session.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    onClick={() => switchSession(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.title}</p>
                        <p className={`text-xs ${activeSessionId === session.id ? 'text-primary-foreground/70' : 'text-muted-foreground'} line-clamp-2`}>
                          {session.data.prompt || 'No prompt yet'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">Prompt Optimizer</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSessions(!showSessions)}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showSessions ? 'Hide' : 'Show'} Sessions
                </Button>
              </div>
              <p className="text-muted-foreground">
                Transform vague prompts into powerful, specific instructions for better AI results
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Your Prompt</CardTitle>
                  <CardDescription>Enter your initial prompt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type your prompt here..."
                    className="min-h-48 bg-input border-border"
                  />

                  {/* Tone and Style Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tone" className="text-sm">
                        Tone
                      </Label>
                      <select
                        id="tone"
                        value={tone}
                        onChange={(e) => setTone(e.target.value as ToneType)}
                        className="w-full px-3 py-2 rounded-md border border-border bg-input text-foreground text-sm"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="creative">Creative</option>
                        <option value="technical">Technical</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="style" className="text-sm">
                        Style
                      </Label>
                      <select
                        id="style"
                        value={style}
                        onChange={(e) => setStyle(e.target.value as StyleType)}
                        className="w-full px-3 py-2 rounded-md border border-border bg-input text-foreground text-sm"
                      >
                        <option value="structured">Structured</option>
                        <option value="narrative">Narrative</option>
                        <option value="step-by-step">Step-by-Step</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={handleOptimize}
                    disabled={!prompt.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Optimize Prompt
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Optimized Prompt</CardTitle>
                  <CardDescription>Your AI-enhanced prompt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="min-h-48 bg-input border border-border rounded-lg p-4 text-foreground whitespace-pre-wrap break-words text-sm">
                    {isLoading && !optimized && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader className="w-4 h-4 animate-spin" />
                        Optimizing your prompt...
                      </div>
                    )}
                    {error && (
                      <div className="text-destructive">Error: {error}</div>
                    )}
                    {optimized && !error && optimized}
                    {!optimized && !isLoading && !error && (
                      <span className="text-muted-foreground">Optimized prompt will appear here...</span>
                    )}
                  </div>
                  {optimized && !error && (
                    <Button
                      onClick={handleCopyOptimized}
                      variant="outline"
                      className="w-full"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tips Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Optimization Tips</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {optimizationTips.map((tip) => (
                  <Card key={tip.title} className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <CardDescription>{tip.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs bg-secondary p-3 rounded block whitespace-pre-wrap break-words">
                        {tip.example}
                      </code>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Templates Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Prompt Templates</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {promptTemplates.map((tmpl) => (
                  <Card
                    key={tmpl.name}
                    className="border-border cursor-pointer hover:bg-secondary/20 transition-colors"
                    onClick={() => handleSelectTemplate(tmpl.template)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{tmpl.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-muted-foreground line-clamp-2">{tmpl.template}</code>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
