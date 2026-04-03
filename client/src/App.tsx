/**
 * App.tsx — Trading Journal Pro
 * Design: Swiss International Style — dark sidebar + clean white content
 * Routes: / (Calendar) | /dashboard (Dashboard)
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { JournalProvider } from "./contexts/JournalContext";
import Layout from "./components/Layout";
import CalendarPage from "./pages/Calendar";
import DashboardPage from "./pages/Dashboard";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={CalendarPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <JournalProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </JournalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
