import { useState } from 'react';
import { ThemeProvider } from './lib/theme.js';
import { TopNav } from './components/layout/TopNav.js';
import { Dashboard } from './pages/Dashboard.js';
import { PingIndicator } from './components/common/PingIndicator.js';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <TopNav onSettingsClick={() => setShowSettings(true)} />
        <Dashboard showSettings={showSettings} onCloseSettings={() => setShowSettings(false)} />
        <div className="fixed bottom-0 left-0 z-40">
          <PingIndicator />
        </div>
      </div>
    </ThemeProvider>
  );
}
