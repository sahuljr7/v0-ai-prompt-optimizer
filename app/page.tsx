'use client';

import { MessageCircle, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  const apps = [
    {
      id: 'chat',
      title: 'AI Chat',
      description: 'Have intelligent conversations powered by advanced AI models. Get instant answers, creative ideas, and detailed explanations.',
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500',
      features: ['Real-time conversations', 'Context awareness', 'Multiple models'],
    },
    {
      id: 'optimizer',
      title: 'Prompt Optimizer',
      description: 'Transform vague prompts into powerful, specific instructions. Get better AI results with intelligently optimized prompts.',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      features: ['Smart optimization', 'Multiple tones', 'Template library'],
    },
    {
      id: 'transcript',
      title: 'Transcript Analyzer',
      description: 'Upload meeting transcripts and extract key insights. Automatically identify action items, key points, and important discussions.',
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      features: ['Key extraction', 'Action items', 'Meeting summaries'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Suite</h1>
              <p className="text-xs text-muted-foreground">Powered by Advanced AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-8 mb-20 animate-fade-in">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              Your Complete AI Assistant Suite
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              Unlock the power of AI with three specialized tools designed to enhance your productivity, creativity, and communication.
            </p>
          </div>
        </div>

        {/* App Cards Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 animate-slide-in-up">
          {apps.map((app, index) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => router.push(`/${app.id}`)}
                className="group relative h-full animate-scale-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative h-full bg-card border border-border rounded-2xl p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col">
                  {/* Icon Background */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${app.color} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-card rounded-lg flex items-center justify-center">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-left flex-1 flex flex-col">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {app.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6 flex-1">
                      {app.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {app.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/40 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Why Choose Our Suite?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience cutting-edge AI technology designed for modern workflows
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                title: 'Fast & Reliable',
                description: 'Optimized performance with instant responses',
              },
              {
                title: 'Easy to Use',
                description: 'Intuitive interface requires no technical knowledge',
              },
              {
                title: 'Secure & Private',
                description: 'Your data is protected with enterprise security',
              },
              {
                title: 'Always Improving',
                description: 'Regular updates with latest AI capabilities',
              },
            ].map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            AI Suite v1.0 - Powered by Advanced AI Technology
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
