import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/state/AppContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RoleProvider } from "@/state/RoleContext";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SharePage from "./pages/SharePage";

import AppShell from "./pages/app/AppShell";
import HomePage from "./pages/app/HomePage";
import AnalyzeHub from "./pages/app/AnalyzeHub";
import GatherContextPage from "./pages/app/GatherContextPage";
import RefinePage from "./pages/app/RefinePage";
import InsufficientDataPage from "./pages/app/InsufficientDataPage";
import ResultPage from "./pages/app/ResultPage";
import LibraryPage from "./pages/app/LibraryPage";
import ComparePage from "./pages/app/ComparePage";
import HistoryPage from "./pages/app/HistoryPage";
import SettingsPage from "./pages/app/SettingsPage";

import Saved from "./pages/buyer/Saved";
import Alerts from "./pages/buyer/Alerts";
import ClientsList from "./pages/agent/ClientsList";
import ClientDetail from "./pages/agent/ClientDetail";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <RoleProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/share/:id" element={<SharePage />} />

                {/* App shell — unified for buyer + agent */}
                <Route path="/app" element={<AppShell />}>
                  <Route index element={<HomePage />} />
                  <Route path="analyze" element={<AnalyzeHub />} />
                  <Route path="refine" element={<RefinePage />} />
                  <Route path="library" element={<LibraryPage />} />
                  <Route path="compare" element={<ComparePage />} />
                  <Route path="saved" element={<Saved />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="clients" element={<ClientsList />} />
                  <Route path="clients/:id" element={<ClientDetail />} />
                </Route>

                {/* Full-screen flows inside shell */}
                <Route path="/app/analyze/loading" element={<AppShell />}>
                  <Route index element={<GatherContextPage />} />
                </Route>
                <Route path="/app/insufficient/:id" element={<AppShell />}>
                  <Route index element={<InsufficientDataPage />} />
                </Route>
                <Route path="/app/result/:id" element={<AppShell />}>
                  <Route index element={<ResultPage />} />
                </Route>

                {/* Legacy redirects */}
                <Route path="/app/map" element={<Navigate to="/app/library" replace />} />
                <Route path="/agent/*" element={<Navigate to="/app" replace />} />
                <Route path="/buyer/*" element={<Navigate to="/app" replace />} />
                <Route path="/onboarding/*" element={<Navigate to="/" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </RoleProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
