import { Plus, Search, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const invoices = [
  { id: "INV-001", patient: "Marie Dubois", date: "2024-03-15", amount: "150€", status: "paid" },
  { id: "INV-002", patient: "Jean Martin", date: "2024-03-14", amount: "280€", status: "paid" },
  { id: "INV-003", patient: "Sophie Bernard", date: "2024-03-13", amount: "450€", status: "pending" },
  { id: "INV-004", patient: "Luc Petit", date: "2024-03-12", amount: "120€", status: "overdue" },
  { id: "INV-005", patient: "Emma Laurent", date: "2024-03-11", amount: "320€", status: "paid" },
];

const Billing = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturation</h1>
          <p className="text-muted-foreground mt-2">Gérez vos factures et paiements</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total facturé ce mois</p>
          <p className="text-3xl font-bold text-foreground mt-2">1,320€</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Paiements reçus</p>
          <p className="text-3xl font-bold text-success mt-2">850€</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">En attente</p>
          <p className="text-3xl font-bold text-warning mt-2">470€</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Factures récentes</h2>
          <div className="relative flex-1 max-w-xs ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher une facture..." className="pl-10" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.patient}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell className="font-semibold">{invoice.amount}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(invoice.status)} variant="outline">
                    {invoice.status === "paid" && "Payée"}
                    {invoice.status === "pending" && "En attente"}
                    {invoice.status === "overdue" && "En retard"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Billing;
