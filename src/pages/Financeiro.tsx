import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Share2,
  Calendar,
  Filter,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinancialTransactions, CreateFinancialTransactionData } from "@/hooks/useFinancialTransactions";
import { usePayments, CreatePaymentData } from "@/hooks/usePayments";
import { usePolos } from "@/hooks/usePolos";
import { useStudents } from "@/hooks/useStudents";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Financeiro() {
  const { 
    transactions, 
    categories, 
    loading: transactionsLoading, 
    fetchTransactions, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction,
    getBalance,
    createCategory,
    updateCategory,
    deleteCategory
  } = useFinancialTransactions();
  
  const { 
    payments, 
    loading: paymentsLoading, 
    fetchPayments, 
    createPayment, 
    updatePayment, 
    deletePayment,
    generateMonthlyPayments 
  } = usePayments();
  
  const { polos } = usePolos();
  const { students } = useStudents();
  const { userType, user } = useSupabaseAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"dashboard" | "revenue" | "expense" | "payments" | "categories">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [balance, setBalance] = useState({ total_revenue: 0, total_expense: 0, balance: 0 });
  const [dateFilter, setDateFilter] = useState<"month" | "year" | "all">("month");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPolo, setSelectedPolo] = useState<string>("all");
  
  // Dialog states
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isGeneratePaymentsDialogOpen, setIsGeneratePaymentsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [transactionForm, setTransactionForm] = useState<CreateFinancialTransactionData>({
    transaction_type: "revenue",
    category: "",
    description: "",
    amount: 0,
    transaction_date: format(new Date(), "yyyy-MM-dd"),
    payment_method: null,
    reference_number: null,
    supplier_payee: null,
    polo_id: null,
    student_id: null,
    is_recurring: false,
    recurring_period: null,
    attachment_url: null,
    notes: null
  });

  const [paymentForm, setPaymentForm] = useState<CreatePaymentData>({
    student_id: null,
    amount: 0,
    payment_date: format(new Date(), "yyyy-MM-dd"),
    due_date: format(new Date(), "yyyy-MM-dd"),
    status: "pending",
    payment_method: null,
    reference_month: null,
    notes: null,
    is_social_project: false
  });

  const [generatePaymentsForm, setGeneratePaymentsForm] = useState({
    month: format(new Date(), "MM"),
    year: format(new Date(), "yyyy")
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "revenue" as "revenue" | "expense" | "both",
    description: ""
  });

  // Calcular período de filtro
  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case "month":
        return {
          start: format(startOfMonth(now), "yyyy-MM-dd"),
          end: format(endOfMonth(now), "yyyy-MM-dd")
        };
      case "year":
        return {
          start: format(startOfYear(now), "yyyy-MM-dd"),
          end: format(endOfYear(now), "yyyy-MM-dd")
        };
      default:
        return { start: undefined, end: undefined };
    }
  };

  // Carregar dados
  useEffect(() => {
    if (!user) return;

    const dateRange = getDateRange();
    fetchTransactions({
      startDate: dateRange.start,
      endDate: dateRange.end,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      poloId: selectedPolo !== "all" ? selectedPolo : undefined
    });

    fetchPayments({
      startDate: dateRange.start,
      endDate: dateRange.end
    });
  }, [user, dateFilter, selectedCategory, selectedPolo]);

  // Calcular saldo
  useEffect(() => {
    const loadBalance = async () => {
      const dateRange = getDateRange();
      const balanceData = await getBalance(dateRange.start, dateRange.end);
      setBalance(balanceData);
    };
    if (user) {
      loadBalance();
    }
  }, [user, transactions, dateFilter]);

  // Reset forms
  const resetTransactionForm = () => {
    setTransactionForm({
      transaction_type: "revenue",
      category: "",
      description: "",
      amount: 0,
      transaction_date: format(new Date(), "yyyy-MM-dd"),
      payment_method: null,
      reference_number: null,
      supplier_payee: null,
      polo_id: null,
      student_id: null,
      is_recurring: false,
      recurring_period: null,
      attachment_url: null,
      notes: null
    });
    setEditingTransaction(null);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      student_id: null,
      amount: 0,
      payment_date: format(new Date(), "yyyy-MM-dd"),
      due_date: format(new Date(), "yyyy-MM-dd"),
      status: "pending",
      payment_method: null,
      reference_month: null,
      notes: null,
      is_social_project: false
    });
    setEditingPayment(null);
  };

  // Handlers
  const handleCreateTransaction = async () => {
    try {
      setActionLoading(true);
      if (editingTransaction) {
        await updateTransaction(editingTransaction, transactionForm);
      } else {
        await createTransaction(transactionForm);
      }
      setIsTransactionDialogOpen(false);
      resetTransactionForm();
    } catch (error) {
      // Error já tratado no hook
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      setActionLoading(true);
      if (editingPayment) {
        await updatePayment(editingPayment, paymentForm);
      } else {
        await createPayment(paymentForm);
      }
      setIsPaymentDialogOpen(false);
      resetPaymentForm();
    } catch (error) {
      // Error já tratado no hook
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePayments = async () => {
    try {
      setActionLoading(true);
      await generateMonthlyPayments(generatePaymentsForm.month, parseInt(generatePaymentsForm.year));
      setIsGeneratePaymentsDialogOpen(false);
    } catch (error) {
      // Error já tratado no hook
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTransaction = (transaction: any) => {
    setTransactionForm({
      transaction_type: transaction.transaction_type,
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      payment_method: transaction.payment_method,
      reference_number: transaction.reference_number,
      supplier_payee: transaction.supplier_payee,
      polo_id: transaction.polo_id,
      student_id: transaction.student_id,
      is_recurring: transaction.is_recurring,
      recurring_period: transaction.recurring_period,
      attachment_url: transaction.attachment_url,
      notes: transaction.notes
    });
    setEditingTransaction(transaction.id);
    setIsTransactionDialogOpen(true);
  };

  const handleEditPayment = (payment: any) => {
    setPaymentForm({
      student_id: payment.student_id,
      amount: payment.amount,
      payment_date: payment.payment_date,
      due_date: payment.due_date,
      status: payment.status,
      payment_method: payment.payment_method,
      reference_month: payment.reference_month,
      notes: payment.notes,
      is_social_project: payment.is_social_project
    });
    setEditingPayment(payment.id);
    setIsPaymentDialogOpen(true);
  };

  // Filtrar transações
  const filteredTransactions = transactions.filter(t => {
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (activeTab === "revenue" && t.transaction_type !== "revenue") return false;
    if (activeTab === "expense" && t.transaction_type !== "expense") return false;
    return true;
  });

  // Filtrar pagamentos
  const filteredPayments = payments.filter(p => {
    if (searchTerm && !p.student_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Compartilhar relatório
  const handleShareReport = async () => {
    const dateRange = getDateRange();
    const reportData = {
      periodo: dateFilter === "month" 
        ? format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })
        : dateFilter === "year"
        ? format(new Date(), "yyyy")
        : "Todos os períodos",
      receitas: formatCurrency(balance.total_revenue),
      despesas: formatCurrency(balance.total_expense),
      saldo: formatCurrency(balance.balance),
      transacoes: transactions.length,
      pagamentos: payments.length
    };

    const reportText = `Relatório Financeiro - ${reportData.periodo}\n\n` +
      `Receitas: ${reportData.receitas}\n` +
      `Despesas: ${reportData.despesas}\n` +
      `Saldo: ${reportData.saldo}\n` +
      `Transações: ${reportData.transacoes}\n` +
      `Pagamentos: ${reportData.pagamentos}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relatório Financeiro - ${reportData.periodo}`,
          text: reportText
        });
      } catch (error) {
        // Usuário cancelou ou erro
      }
    } else {
      // Fallback: copiar para clipboard
      await navigator.clipboard.writeText(reportText);
      toast({
        title: "Copiado!",
        description: "Relatório copiado para a área de transferência.",
      });
    }
  };

  // Exportar relatório (CSV simples)
  const handleExportReport = () => {
    const dateRange = getDateRange();
    const csvContent = [
      ["Tipo", "Categoria", "Descrição", "Valor", "Data", "Método de Pagamento", "Observações"].join(","),
      ...transactions.map(t => [
        t.transaction_type === "revenue" ? "Receita" : "Despesa",
        t.category,
        `"${t.description}"`,
        t.amount,
        t.transaction_date,
        t.payment_method || "",
        `"${t.notes || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-financeiro-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (userType !== 'mestre') {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Acesso restrito. Apenas mestres podem acessar o módulo financeiro.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento Financeiro</h1>
            <p className="text-muted-foreground mt-1">Controle completo de receitas, despesas e mensalidades</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShareReport}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        {activeTab === "dashboard" && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(balance.total_revenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(balance.total_expense)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance.balance)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Este Mês</SelectItem>
                    <SelectItem value="year">Este Ano</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories
                      .filter(c => activeTab === "dashboard" || c.type === activeTab || c.type === "both")
                      .map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Polo</Label>
                <Select value={selectedPolo} onValueChange={setSelectedPolo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {polos.map(polo => (
                      <SelectItem key={polo.id} value={polo.id}>
                        {polo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="revenue">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
            <TabsTrigger value="payments">Mensalidades</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transactions
                      .filter(t => t.transaction_type === "revenue")
                      .slice(0, 5)
                      .map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(transaction.transaction_date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      ))}
                    {transactions.filter(t => t.transaction_type === "revenue").length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Nenhuma receita encontrada</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Últimas Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transactions
                      .filter(t => t.transaction_type === "expense")
                      .slice(0, 5)
                      .map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{formatCurrency(transaction.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(transaction.transaction_date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      ))}
                    {transactions.filter(t => t.transaction_type === "expense").length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Nenhuma despesa encontrada</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Receitas</h2>
              <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => {
                setIsTransactionDialogOpen(open);
                if (!open) resetTransactionForm();
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setTransactionForm(prev => ({ ...prev, transaction_type: "revenue" }));
                    resetTransactionForm();
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Receita
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTransaction ? "Editar Receita" : "Nova Receita"}</DialogTitle>
                    <DialogDescription>
                      Registre uma nova receita no sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={transactionForm.category}
                        onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter(c => c.type === "revenue" || c.type === "both")
                            .map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Input
                        id="description"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                        placeholder="Ex: Venda de uniformes"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Valor *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={transactionForm.amount || ""}
                        onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="transaction_date">Data *</Label>
                      <Input
                        id="transaction_date"
                        type="date"
                        value={transactionForm.transaction_date}
                        onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_method">Método de Pagamento</Label>
                      <Select
                        value={transactionForm.payment_method || "unspecified"}
                        onValueChange={(value) => setTransactionForm({ ...transactionForm, payment_method: value === "unspecified" ? null : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                          <SelectItem value="card">Cartão</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="transfer">Transferência</SelectItem>
                          <SelectItem value="check">Cheque</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supplier_payee">Recebedor</Label>
                      <Input
                        id="supplier_payee"
                        value={transactionForm.supplier_payee || ""}
                        onChange={(e) => setTransactionForm({ ...transactionForm, supplier_payee: e.target.value })}
                        placeholder="Nome do recebedor"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="polo_id">Polo (Opcional)</Label>
                      <Select
                        value={transactionForm.polo_id || "none"}
                        onValueChange={(value) => setTransactionForm({ ...transactionForm, polo_id: value === "none" ? null : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o polo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {polos.map(polo => (
                            <SelectItem key={polo.id} value={polo.id}>
                              {polo.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={transactionForm.notes || ""}
                        onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                        placeholder="Observações adicionais..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateTransaction} disabled={actionLoading}>
                        {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingTransaction ? "Salvar" : "Criar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Receitas */}
            <div className="space-y-2">
              {transactionsLoading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </CardContent>
                </Card>
              ) : filteredTransactions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhuma receita encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTransactions.map(transaction => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{transaction.description}</h3>
                            <Badge variant="outline">{transaction.category}</Badge>
                            {transaction.polo_name && (
                              <Badge variant="secondary">{transaction.polo_name}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(transaction.transaction_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • 
                            {transaction.payment_method && ` ${transaction.payment_method} •`}
                            {transaction.supplier_payee && ` ${transaction.supplier_payee}`}
                          </p>
                          {transaction.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Menu</span>
                                <span>⋮</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setTransactionToDelete(transaction.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Despesas</h2>
              <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => {
                setIsTransactionDialogOpen(open);
                if (!open) resetTransactionForm();
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setTransactionForm(prev => ({ ...prev, transaction_type: "expense" }));
                    resetTransactionForm();
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Despesa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTransaction ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
                    <DialogDescription>
                      Registre uma nova despesa no sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={transactionForm.category}
                        onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter(c => c.type === "expense" || c.type === "both")
                            .map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Input
                        id="description"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                        placeholder="Ex: Compra de material de treino"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Valor *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={transactionForm.amount || ""}
                        onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="transaction_date">Data *</Label>
                      <Input
                        id="transaction_date"
                        type="date"
                        value={transactionForm.transaction_date}
                        onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_method">Método de Pagamento</Label>
                      <Select
                        value={transactionForm.payment_method || "unspecified"}
                        onValueChange={(value) => setTransactionForm({ ...transactionForm, payment_method: value === "unspecified" ? null : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                          <SelectItem value="card">Cartão</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="transfer">Transferência</SelectItem>
                          <SelectItem value="check">Cheque</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supplier_payee">Fornecedor</Label>
                      <Input
                        id="supplier_payee"
                        value={transactionForm.supplier_payee || ""}
                        onChange={(e) => setTransactionForm({ ...transactionForm, supplier_payee: e.target.value })}
                        placeholder="Nome do fornecedor"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="polo_id">Polo (Opcional)</Label>
                      <Select
                        value={transactionForm.polo_id || "none"}
                        onValueChange={(value) => setTransactionForm({ ...transactionForm, polo_id: value === "none" ? null : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o polo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {polos.map(polo => (
                            <SelectItem key={polo.id} value={polo.id}>
                              {polo.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={transactionForm.notes || ""}
                        onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                        placeholder="Observações adicionais..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateTransaction} disabled={actionLoading}>
                        {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingTransaction ? "Salvar" : "Criar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Despesas */}
            <div className="space-y-2">
              {transactionsLoading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </CardContent>
                </Card>
              ) : filteredTransactions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTransactions.map(transaction => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{transaction.description}</h3>
                            <Badge variant="outline">{transaction.category}</Badge>
                            {transaction.polo_name && (
                              <Badge variant="secondary">{transaction.polo_name}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(transaction.transaction_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • 
                            {transaction.payment_method && ` ${transaction.payment_method} •`}
                            {transaction.supplier_payee && ` ${transaction.supplier_payee}`}
                          </p>
                          {transaction.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">{formatCurrency(transaction.amount)}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Menu</span>
                                <span>⋮</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setTransactionToDelete(transaction.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mensalidades</h2>
              <div className="flex gap-2">
                <Dialog open={isGeneratePaymentsDialogOpen} onOpenChange={setIsGeneratePaymentsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Gerar Mensalidades
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gerar Mensalidades do Mês</DialogTitle>
                      <DialogDescription>
                        Gera mensalidades para todos os alunos ativos com mensalidade definida
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="month">Mês</Label>
                        <Input
                          id="month"
                          type="month"
                          value={`${generatePaymentsForm.year}-${generatePaymentsForm.month}`}
                          onChange={(e) => {
                            const [year, month] = e.target.value.split('-');
                            setGeneratePaymentsForm({ year, month });
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsGeneratePaymentsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleGeneratePayments} disabled={actionLoading}>
                          {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Gerar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isPaymentDialogOpen} onOpenChange={(open) => {
                  setIsPaymentDialogOpen(open);
                  if (!open) resetPaymentForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Mensalidade
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPayment ? "Editar Mensalidade" : "Nova Mensalidade"}</DialogTitle>
                      <DialogDescription>
                        Registre uma nova mensalidade no sistema
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="student_id">Aluno *</Label>
                        <Select
                          value={paymentForm.student_id || undefined}
                          onValueChange={(value) => setPaymentForm({ ...paymentForm, student_id: value || null })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o aluno" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map(student => (
                              <SelectItem key={student.id} value={student.id}>
                                {(student.profile as any)?.full_name || 'Não encontrado'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_social_project"
                          checked={paymentForm.is_social_project}
                          onCheckedChange={(checked) => {
                            setPaymentForm({ 
                              ...paymentForm, 
                              is_social_project: checked as boolean,
                              amount: checked ? 0 : paymentForm.amount
                            });
                          }}
                        />
                        <Label htmlFor="is_social_project" className="cursor-pointer">
                          Projeto Social (Gratuito)
                        </Label>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Valor *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={paymentForm.amount || ""}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          disabled={paymentForm.is_social_project}
                        />
                        {paymentForm.is_social_project && (
                          <p className="text-xs text-muted-foreground">Projeto social: valor deve ser zero</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="payment_date">Data de Pagamento *</Label>
                        <Input
                          id="payment_date"
                          type="date"
                          value={paymentForm.payment_date}
                          onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="due_date">Data de Vencimento *</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={paymentForm.due_date}
                          onChange={(e) => setPaymentForm({ ...paymentForm, due_date: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={paymentForm.status}
                          onValueChange={(value: any) => setPaymentForm({ ...paymentForm, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="overdue">Vencido</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="payment_method">Método de Pagamento</Label>
                        <Select
                        value={paymentForm.payment_method || "unspecified"}
                        onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value === "unspecified" ? null : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unspecified">Não especificado</SelectItem>
                            <SelectItem value="cash">Dinheiro</SelectItem>
                            <SelectItem value="card">Cartão</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="transfer">Transferência</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="reference_month">Mês de Referência</Label>
                        <Input
                          id="reference_month"
                          type="month"
                          value={paymentForm.reference_month ? format(new Date(paymentForm.reference_month), "yyyy-MM") : ""}
                          onChange={(e) => {
                            const monthDate = e.target.value ? `${e.target.value}-01` : null;
                            setPaymentForm({ ...paymentForm, reference_month: monthDate });
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={paymentForm.notes || ""}
                          onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                          placeholder="Observações adicionais..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreatePayment} disabled={actionLoading}>
                          {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingPayment ? "Salvar" : "Criar"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Lista de Mensalidades */}
            <div className="space-y-2">
              {paymentsLoading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </CardContent>
                </Card>
              ) : filteredPayments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhuma mensalidade encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPayments.map(payment => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{payment.student_name}</h3>
                            <Badge variant={payment.status === "paid" ? "default" : payment.status === "overdue" ? "destructive" : "secondary"}>
                              {payment.status === "paid" ? "Pago" : payment.status === "overdue" ? "Vencido" : payment.status === "pending" ? "Pendente" : "Cancelado"}
                            </Badge>
                            {payment.is_social_project && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">Projeto Social</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Vencimento: {format(new Date(payment.due_date), "dd/MM/yyyy", { locale: ptBR })} • 
                            Pagamento: {format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ptBR })}
                            {payment.payment_method && ` • ${payment.payment_method}`}
                          </p>
                          {payment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-lg font-bold ${payment.is_social_project ? 'text-blue-600' : 'text-green-600'}`}>
                              {payment.is_social_project ? "Gratuito" : formatCurrency(payment.amount)}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Menu</span>
                                <span>⋮</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setPaymentToDelete(payment.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab de Categorias */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Categorias</h2>
              <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
                setIsCategoryDialogOpen(open);
                if (!open) {
                  setCategoryForm({ name: "", type: "revenue", description: "" });
                  setEditingCategory(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                    <DialogDescription>
                      Crie uma nova categoria para receitas ou despesas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category_name">Nome da Categoria *</Label>
                      <Input
                        id="category_name"
                        value={categoryForm?.name || ""}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Material de Treino"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category_type">Tipo *</Label>
                      <Select
                        value={categoryForm?.type || "revenue"}
                        onValueChange={(value: any) => setCategoryForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="both">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category_description">Descrição</Label>
                      <Textarea
                        id="category_description"
                        value={categoryForm?.description || ""}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição da categoria..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            setActionLoading(true);
                            if (editingCategory && categoryForm) {
                              await updateCategory(editingCategory, categoryForm);
                            } else if (categoryForm) {
                              await createCategory(categoryForm.name, categoryForm.type, categoryForm.description || undefined);
                            }
                            setIsCategoryDialogOpen(false);
                            setCategoryForm({ name: "", type: "revenue", description: "" });
                            setEditingCategory(null);
                          } catch (error) {
                            // Error já tratado no hook
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        disabled={actionLoading || !categoryForm?.name?.trim()}
                      >
                        {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingCategory ? "Salvar" : "Criar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Categorias */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories
                      .filter(c => (c.type === "revenue" || c.type === "both") && c.active)
                      .map(category => (
                        <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description && (
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Menu</span>
                                <span>⋮</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  const cat = categories.find(c => c.id === category.id);
                                  if (cat) {
                                    setCategoryForm({
                                      name: cat.name,
                                      type: cat.type,
                                      description: cat.description || ""
                                    });
                                    setEditingCategory(category.id);
                                    setIsCategoryDialogOpen(true);
                                  }
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setCategoryToDelete(category.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    {categories.filter(c => (c.type === "revenue" || c.type === "both") && c.active).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Nenhuma categoria de receita encontrada</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories
                      .filter(c => (c.type === "expense" || c.type === "both") && c.active)
                      .map(category => (
                        <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description && (
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Menu</span>
                                <span>⋮</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  const cat = categories.find(c => c.id === category.id);
                                  if (cat) {
                                    setCategoryForm({
                                      name: cat.name,
                                      type: cat.type,
                                      description: cat.description || ""
                                    });
                                    setEditingCategory(category.id);
                                    setIsCategoryDialogOpen(true);
                                  }
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setCategoryToDelete(category.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    {categories.filter(c => (c.type === "expense" || c.type === "both") && c.active).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Nenhuma categoria de despesa encontrada</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alert Dialogs para exclusão */}
        <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (transactionToDelete) {
                    await deleteTransaction(transactionToDelete);
                    setTransactionToDelete(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta mensalidade? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (paymentToDelete) {
                    await deletePayment(paymentToDelete);
                    setPaymentToDelete(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta categoria? Se houver transações usando esta categoria, ela será desativada em vez de excluída.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (categoryToDelete) {
                    await deleteCategory(categoryToDelete);
                    setCategoryToDelete(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

