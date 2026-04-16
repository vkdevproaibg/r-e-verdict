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
import ClientsList from "./pages/agent/ClientsList";
import Analyze from "./pages/agent/Analyze";
import AgentMap from "./pages/agent/AgentMap";
import Inbox from "./pages/agent/Inbox";
import Library from "./pages/agent/Library";

import BuyerLayout from "./pages/buyer/BuyerLayout";
import BuyerMap from "./pages/buyer/BuyerMap";
import Saved from "./pages/buyer/Saved";
import Agents from "./pages/buyer/Agents";
import BuyerInbox from "./pages/buyer/BuyerInbox";

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

            <Route path="/agent" element={<AgentLayout />}>
              <Route index element={<ClientsList />} />
              <Route path="analyze" element={<Analyze />} />
              <Route path="map" element={<AgentMap />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="library" element={<Library />} />
            </Route>

            <Route path="/buyer" element={<BuyerLayout />}>
              <Route index element={<BuyerMap />} />
              <Route path="saved" element={<Saved />} />
              <Route path="agents" element={<Agents />} />
              <Route path="inbox" element={<BuyerInbox />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
