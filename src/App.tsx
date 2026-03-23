import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import MyWarren from "./pages/MyWarren";
import NewCase from "./pages/NewCase";
import CasePage from "./pages/CasePage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Confirm from "./pages/Confirm";
import CheckEmail from "./pages/CheckEmail";
import SetupUsername from "./pages/SetupUsername";
import UserProfile from "./pages/UserProfile";
import Docs from "./pages/Docs";
import Notifications from "./pages/Notifications";
import { AuthProvider } from "./components/AuthProvider";
import { PrivateRoute } from "./components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/confirm" element={<Confirm />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/setup-username" element={<PrivateRoute><SetupUsername /></PrivateRoute>} />

            {/* Protected routes */}
            <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
            <Route path="/my-warren" element={<PrivateRoute><MyWarren /></PrivateRoute>} />
            <Route path="/new-case" element={<PrivateRoute><NewCase /></PrivateRoute>} />
            <Route path="/case/:id" element={<PrivateRoute><CasePage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/user/:username" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

            <Route path="/docs" element={<Docs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
