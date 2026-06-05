import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor, Settings } from 'lucide-react';
import { useTheme } from '@/lib/theme.js';

const themeIcons: Record<string, React.ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
};

interface TopNavProps {
  onSettingsClick: () => void;
}

export function TopNav({ onSettingsClick }: TopNavProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const cycleLang = () => {
    const langs = ['en', 'zh', 'ja'];
    const idx = langs.indexOf(i18n.language.split('-')[0]);
    i18n.changeLanguage(langs[(idx + 1) % langs.length]);
  };

  const langLabel = (() => {
    const l = i18n.language.split('-')[0];
    if (l === 'zh') return '简';
    if (l === 'ja') return '日';
    return 'EN';
  })();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-bold tracking-tight">{t('nav.title')}</h1>
        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <button
            onClick={cycleLang}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title={t('language.' + (i18n.language.split('-')[0]), i18n.language)}
          >
            {langLabel}
          </button>
          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title={t('theme.' + theme)}
          >
            {themeIcons[theme]}
          </button>
          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title={t('nav.settings')}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
