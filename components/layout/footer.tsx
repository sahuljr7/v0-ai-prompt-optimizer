import { useTheme } from '@/lib/theme-provider';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="border-t border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground">
          Built with <span className="text-red-500">♡</span> by Sahul
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="gap-2"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Dark</span>
            </>
          )}
        </Button>
      </div>
    </footer>
  );
}
