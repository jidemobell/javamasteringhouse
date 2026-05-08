import { Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { TrackPage } from './pages/TrackPage';
import { PhasePage } from './pages/PhasePage';
import { ConceptPage, ConceptsListPage } from './pages/ConceptPage';
import { HowToUsePage } from './pages/HowToUsePage';

// Wrapper for pages whose content should scroll naturally inside <main>.
// PhasePage opts out — it manages its own two-pane scroll.
function ScrollPage({ children }: { children: ReactNode }) {
  return <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>;
}

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <Routes>
          <Route path="/" element={<ScrollPage><HomePage /></ScrollPage>} />
          <Route path="/how-to-use" element={<ScrollPage><HowToUsePage /></ScrollPage>} />
          <Route path="/track/:trackId" element={<ScrollPage><TrackPage /></ScrollPage>} />
          <Route path="/track/:trackId/:phaseId" element={<PhasePage />} />
          <Route path="/concepts" element={<ScrollPage><ConceptsListPage /></ScrollPage>} />
          <Route path="/concepts/:conceptId" element={<ScrollPage><ConceptPage /></ScrollPage>} />
        </Routes>
      </main>
    </div>
  );
}
