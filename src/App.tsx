import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AlunosGestao from "./pages/AlunosGestao";
import Mensagens from "./pages/Mensagens";
import Evolucao from "./pages/Evolucao";
import Graduacoes from "./pages/Graduacoes";
import Agenda from "./pages/Agenda";
import Configuracoes from "./pages/Configuracoes";
import Progresso from "./pages/Progresso";
import Conquistas from "./pages/Conquistas";
import Relatorios from "./pages/Relatorios";
import MinhasTurmas from "./pages/MinhasTurmas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/alunos" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <AlunosGestao />
            </ProtectedRoute>
          } />
          <Route path="/mensagens" element={
            <ProtectedRoute>
              <Mensagens />
            </ProtectedRoute>
          } />
          <Route path="/evolucao" element={
            <ProtectedRoute>
              <Evolucao />
            </ProtectedRoute>
          } />
          <Route path="/progresso" element={
            <ProtectedRoute>
              <Progresso />
            </ProtectedRoute>
          } />
          <Route path="/conquistas" element={
            <ProtectedRoute>
              <Conquistas />
            </ProtectedRoute>
          } />
          <Route path="/graduacoes" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <Graduacoes />
            </ProtectedRoute>
          } />
          <Route path="/agenda" element={
            <ProtectedRoute>
              <Agenda />
            </ProtectedRoute>
          } />
          <Route path="/relatorios" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <Relatorios />
            </ProtectedRoute>
          } />
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <Configuracoes />
            </ProtectedRoute>
          } />
          <Route path="/minhas-turmas" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <MinhasTurmas />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
