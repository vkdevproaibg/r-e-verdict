import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/state/AppContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RoleProvider } from "@/state/RoleContext";
import { BuyerProfileProvider } from "@/state/BuyerProfileContext";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SharePage from "./pages/SharePage";

import Splash from "./pages/onboarding/Splash";
import Welcome from "./pages/onboarding/Welcome";
import RoleSelect from "./pages/onboarding/RoleSelect";
import GoalSelect from "./pages/onboarding/GoalSelect";
import Permissions from "./pages/onboarding/Permissions";
import CalibrateRadar from "./pages/onboarding/CalibrateRadar";

import AppShell from "./pages/app/AppShell";
import HomePage from "./pages/app/HomePage";
import AnalyzeHub from "./pages/app/AnalyzeHub";
import SourcesBrowser from "./pages/app/SourcesBrowser";
import GatherContextPage from "./pages/app/GatherContextPage";
import RefinePage from "./pages/app/RefinePage";
import InsufficientDataPage from "./pages/app/InsufficientDataPage";
import ResultPage from "./pages/app/ResultPage";
import ClientPackPage from "./pages/app/ClientPackPage";
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
          <BuyerProfileProvider>
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
                  <Route path="analyze/sources" element={<SourcesBrowser />} />
                  <Route path="refine" element={<RefinePage />} />
                  <Route path="library" element={<LibraryPage />} />
                  <Route path="compare" element={<ComparePage />} />
                  <Route path="saved" element={<Saved />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="settings" element={<SettingsPage />} />
                  {/* Legacy CRM (hidden until Agent Flow v2 lands) */}
                  <Route path="clients" element={<Navigate to="/app" replace />} />
                  <Route path="clients/:id" element={<Navigate to="/app" replace />} />
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
                <Route path="/app/pack/:id" element={<ClientPackPage />} />

                {/* Onboarding */}
                <Route path="/splash" element={<Splash />} />
                <Route path="/onboarding/welcome" element={<Welcome />} />
                <Route path="/onboarding/role" element={<RoleSelect />} />
                <Route path="/onboarding/goal" element={<GoalSelect />} />
                <Route path="/onboarding/permissions" element={<Permissions />} />
                <Route path="/onboarding/calibrate" element={<CalibrateRadar />} />

                {/* Legacy redirects */}
                <Route path="/app/map" element={<Navigate to="/app/library" replace />} />
                <Route path="/agent/*" element={<Navigate to="/app" replace />} />
                <Route path="/buyer/*" element={<Navigate to="/app" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
          </BuyerProfileProvider>
        </AppProvider>
      </RoleProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
