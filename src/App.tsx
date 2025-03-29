import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { MapboxProvider } from "@/context/MapboxContext";
import { AnimatePresence } from "framer-motion";

import Navbar from "@/components/layout/Navbar";
import Index from "./pages/Index";
import VehicleSelection from "./pages/VehicleSelection";
import BatteryMonitor from "./pages/BatteryMonitor";
import Notifications from "./pages/Notifications";
import LocationServices from "./pages/LocationServices";
import ChargingStations from "./pages/ChargingStations";
import Navigation from "./pages/Navigation";
import NotFound from "./pages/NotFound";
import ApiDashboard from "./pages/ApiDashboard";

import "@/App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <MapboxProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/vehicle" element={<VehicleSelection />} />
                <Route path="/battery" element={<BatteryMonitor />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/location" element={<LocationServices />} />
                <Route path="/stations" element={<ChargingStations />} />
                <Route path="/navigation" element={<Navigation />} />
                <Route path="/api-dashboard" element={<ApiDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </MapboxProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
