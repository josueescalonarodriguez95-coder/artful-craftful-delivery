import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import RestorationPage from "./pages/RestorationPage.tsx";
import MudanzasPage from "./pages/MudanzasPage.tsx";
import DeliveryPage from "./pages/DeliveryPage.tsx";
import HeavyCranePage from "./pages/HeavyCranePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/restauraciones" element={<RestorationPage />} />
          <Route path="/restauraciones/:slug" element={<RestorationPage />} />
          <Route path="/mudanzas" element={<MudanzasPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/grua-pesada" element={<HeavyCranePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
