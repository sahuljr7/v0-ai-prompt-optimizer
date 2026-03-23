'use client';

import { useState } from 'react';
import { Lightbulb, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
];

export function PromptOptimizerPanel() {
  const [prompt, setPrompt] = useState('');
  const [optimized, setOptimized] = useState('');
  const [copied, setCopied] = useState(false);

  const handleOptimize = () => {
    // Simple optimization logic - add more sophistication as needed
    const optimizationSuggestions = [
      prompt,
      '\n\n[Optimized Prompt]',
      'Please ' + prompt.toLowerCase().trim(),
      '\nProvide a detailed and structured response.',
      '\nInclude examples if relevant.',
    ];

    setOptimized(optimizationSuggestions.join(''));
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
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Prompt Optimizer</h1>
          <p className="text-muted-foreground">
            Enhance your prompts for better AI responses
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
              <Button
                onClick={handleOptimize}
                disabled={!prompt.trim()}
                className="w-full"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Optimize Prompt
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Optimized Prompt</CardTitle>
              <CardDescription>Your enhanced prompt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-48 bg-input border border-border rounded-lg p-4 text-foreground whitespace-pre-wrap break-words">
                {optimized || 'Optimized prompt will appear here...'}
              </div>
              {optimized && (
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
          <div className="space-y-3">
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
                  <code className="text-xs text-muted-foreground">{tmpl.template}</code>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
