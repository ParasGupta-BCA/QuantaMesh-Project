import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail,
  Search,
  Send,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Briefcase,
  Building2,
  User,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface ColdProspect {
  id: string;
  client_name: string;
  job_title: string;
  company_name: string;
  email: string;
  status: string;
  emails_sent: number;
  last_sent_at: string | null;
  opened_at: string | null;
  added_by: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  sent: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  opened: "bg-green-500/10 text-green-500 border-green-500/20",
  replied: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  converted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  unsubscribed: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function AdminColdOutreach() {
  const { toast } = useToast();
  const [prospects, setProspects] = useState<ColdProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    job_title: "",
    company_name: "",
    email: "",
  });

  const fetchProspects = async () => {
    const { data, error } = await supabase
      .from("cold_outreach")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProspects(data as ColdProspect[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const filteredProspects = prospects.filter((p) => {
    const matchesSearch =
      p.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProspect = async () => {
    if (!form.client_name || !form.email || !form.job_title || !form.company_name) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const { data: profile } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", profile.user?.id ?? "")
        .single();

      const { error } = await supabase.from("cold_outreach").insert({
        client_name: form.client_name,
        job_title: form.job_title,
        company_name: form.company_name,
        email: form.email,
        added_by: profileData?.full_name || "Admin",
      });
      if (error) throw error;
      toast({ title: "Prospect Added ✅", description: `${form.client_name} added to outreach list` });
      setForm({ client_name: "", job_title: "", company_name: "", email: "" });
      setAddDialogOpen(false);
      fetchProspects();
    } catch (error) {
      toast({ title: "Error adding prospect", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleSendEmail = async (prospect: ColdProspect) => {
    setSendingEmail(prospect.id);
    try {
      const { error } = await supabase.functions.invoke("send-cold-email", {
        body: { prospectId: prospect.id },
      });
      if (error) throw error;
      toast({ title: "Cold Email Sent! 📧", description: `Email sent to ${prospect.client_name} at ${prospect.company_name}` });
      fetchProspects();
    } catch (error) {
      toast({ title: "Failed to send email", description: "Please try again", variant: "destructive" });
    } finally {
      setSendingEmail(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cold_outreach").delete().eq("id", id);
    if (!error) {
      setProspects((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Prospect Removed" });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("cold_outreach").update({ status }).eq("id", id);
    if (!error) {
      setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Briefcase className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-2xl font-bold">{prospects.length}</p>
                <p className="text-xs text-muted-foreground">Total Prospects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><Mail className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold">{prospects.reduce((sum, p) => sum + p.emails_sent, 0)}</p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><Building2 className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-2xl font-bold">{prospects.filter((p) => p.opened_at).length}</p>
                <p className="text-xs text-muted-foreground">Opened</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><Clock className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <p className="text-2xl font-bold">{prospects.filter((p) => p.status === "pending").length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Cold Email Outreach
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchProspects} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Prospect</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Prospect</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Client Name</Label>
                    <Input placeholder="John Smith" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Job Title</Label>
                    <Input placeholder="CEO / CTO / Product Manager" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Company Name</Label>
                    <Input placeholder="Acme Corp" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                    <Input type="email" placeholder="john@acme.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <Button onClick={handleAddProspect} disabled={adding} className="w-full gap-2">
                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Prospect
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search prospects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prospect</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Emails</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProspects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-8 w-8" />
                        <p>No prospects yet. Add one to get started!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProspects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prospect.client_name}</p>
                          <p className="text-xs text-muted-foreground">{prospect.job_title}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{prospect.company_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{prospect.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select value={prospect.status} onValueChange={(v) => handleStatusChange(prospect.id, v)}>
                          <SelectTrigger className="w-[120px] h-8">
                            <Badge variant="outline" className={statusColors[prospect.status]}>{prospect.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="opened">Opened</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          <span className="font-medium">{prospect.emails_sent}</span>
                          {prospect.opened_at && (
                            <p className="text-xs text-green-500">Opened: {format(new Date(prospect.opened_at), "MMM d, h:mm a")}</p>
                          )}
                          {prospect.last_sent_at && !prospect.opened_at && (
                            <p className="text-xs text-muted-foreground">Last: {format(new Date(prospect.last_sent_at), "MMM d")}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendEmail(prospect)}
                            disabled={sendingEmail === prospect.id || prospect.status === "unsubscribed"}
                            title="Send cold email"
                          >
                            {sendingEmail === prospect.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(prospect.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
