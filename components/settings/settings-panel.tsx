'use client';

import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface SettingsPanelProps {
  apiKey: string;
  temperature: number;
  maxTokens: number;
  modelName: string;
  onSave: (apiKey: string, temperature: number, maxTokens: number, modelName: string) => void;
}

export function SettingsPanel({
  apiKey,
  temperature,
  maxTokens,
  modelName,
  onSave,
}: SettingsPanelProps) {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localTemperature, setLocalTemperature] = useState(temperature);
  const [localMaxTokens, setLocalMaxTokens] = useState(maxTokens);
  const [localModelName, setLocalModelName] = useState(modelName);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(localApiKey, localTemperature, localMaxTokens, localModelName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const models = [
    { value: 'qwen3.5', label: 'Qwen 3.5' },
    { value: 'llama2', label: 'Llama 2' },
    { value: 'llama2-uncensored', label: 'Llama 2 Uncensored' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'neural-chat', label: 'Neural Chat' },
    { value: 'dolphin-mixtral', label: 'Dolphin Mixtral' },
    { value: 'codellama', label: 'Code Llama' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your AI assistant and API preferences
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Ollama API Configuration</CardTitle>
            <CardDescription>
              Set up your Ollama API credentials to enable chat functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Enter your Ollama API key"
                  className="flex-1 bg-input border-border"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="border-border"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <select
                id="model"
                value={localModelName}
                onChange={(e) => setLocalModelName(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {models.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Choose the AI model to use for generating responses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Generation Parameters</CardTitle>
            <CardDescription>
              Fine-tune how the AI generates responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Temperature */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Temperature: {localTemperature.toFixed(2)}</Label>
                <span className="text-xs text-muted-foreground">
                  {localTemperature < 0.5
                    ? 'Focused'
                    : localTemperature < 0.8
                      ? 'Balanced'
                      : 'Creative'}
                </span>
              </div>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={[localTemperature]}
                onValueChange={(val) => setLocalTemperature(val[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower values make output more focused and deterministic. Higher values
                make it more creative and random.
              </p>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <Label htmlFor="max-tokens">
                Max Tokens: {localMaxTokens}
              </Label>
              <Input
                id="max-tokens"
                type="range"
                min="128"
                max="8192"
                step="256"
                value={localMaxTokens}
                onChange={(e) => setLocalMaxTokens(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Maximum length of generated responses in tokens (1 token ≈ 4 characters)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!localApiKey || !localModelName}
            size="lg"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setLocalApiKey(apiKey);
              setLocalTemperature(temperature);
              setLocalMaxTokens(maxTokens);
              setLocalModelName(modelName);
            }}
            className="border-border"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
