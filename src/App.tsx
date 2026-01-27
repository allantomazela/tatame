import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
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
import Polos from "./pages/Polos";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={(import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")}>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Em dev (base /), redireciona /tatame e /tatame/* para / para evitar 404 */}
          <Route path="/tatame" element={<Navigate to="/" replace />} />
          <Route path="/tatame/*" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/alunos" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <Layout>
                <AlunosGestao />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/mensagens" element={
            <ProtectedRoute>
              <Layout>
                <Mensagens />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/evolucao" element={
            <ProtectedRoute>
              <Layout>
                <Evolucao />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/progresso" element={
            <ProtectedRoute>
              <Layout>
                <Progresso />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/conquistas" element={
            <ProtectedRoute>
              <Layout>
                <Conquistas />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/graduacoes" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <Layout>
                <Graduacoes />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/agenda" element={
            <ProtectedRoute>
              <Layout>
                <Agenda />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/relatorios" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <Layout>
                <Relatorios />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <Layout>
                <Configuracoes />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/minhas-turmas" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <Layout>
                <MinhasTurmas />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/polos" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <Layout>
                <Polos />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/financeiro" element={
            <ProtectedRoute allowedUserTypes={["mestre"]}>
              <Layout>
                <Financeiro />
              </Layout>
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
