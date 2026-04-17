import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/state/AppContext";

import Splash from "./pages/onboarding/Splash";
import Welcome from "./pages/onboarding/Welcome";
import RoleSelect from "./pages/onboarding/RoleSelect";
import GoalSelect from "./pages/onboarding/GoalSelect";
import Permissions from "./pages/onboarding/Permissions";

import AgentLayout from "./pages/agent/AgentLayout";
import Analyze from "./pages/agent/Analyze";
import AgentMap from "./pages/agent/AgentMap";
import ClientsList from "./pages/agent/ClientsList";
import ClientDetail from "./pages/agent/ClientDetail";
import Library from "./pages/agent/Library";

import BuyerLayout from "./pages/buyer/BuyerLayout";
import BuyerAnalyze from "./pages/buyer/BuyerAnalyze";
import BuyerMap from "./pages/buyer/BuyerMap";
import Saved from "./pages/buyer/Saved";
import Alerts from "./pages/buyer/Alerts";

import AnalyzeLoading from "./components/AnalyzeLoading";
import AnalyzeResult from "./components/AnalyzeResult";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />

            <Route path="/onboarding">
              <Route index element={<Navigate to="/onboarding/welcome" replace />} />
              <Route path="welcome" element={<Welcome />} />
              <Route path="role" element={<RoleSelect />} />
              <Route path="goal" element={<GoalSelect />} />
              <Route path="permissions" element={<Permissions />} />
            </Route>

            {/* Agent mode */}
            <Route path="/agent" element={<AgentLayout />}>
              <Route index element={<Analyze />} />
              <Route path="map" element={<AgentMap />} />
              <Route path="clients" element={<ClientsList />} />
              <Route path="library" element={<Library />} />
            </Route>
            <Route path="/agent/clients/:id" element={<ClientDetail />} />
            <Route path="/agent/analyze/loading" element={<AnalyzeLoading mode="agent" />} />
            <Route path="/agent/analyze/result" element={<AnalyzeResult mode="agent" />} />

            {/* Buyer mode */}
            <Route path="/buyer" element={<BuyerLayout />}>
              <Route index element={<BuyerAnalyze />} />
              <Route path="map" element={<BuyerMap />} />
              <Route path="saved" element={<Saved />} />
              <Route path="alerts" element={<Alerts />} />
            </Route>
            <Route path="/buyer/analyze/loading" element={<AnalyzeLoading mode="buyer" />} />
            <Route path="/buyer/analyze/result" element={<AnalyzeResult mode="buyer" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
