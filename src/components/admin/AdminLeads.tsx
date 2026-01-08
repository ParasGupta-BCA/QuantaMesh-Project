import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Mail, 
  Search, 
  Send, 
  Loader2, 
  Sparkles, 
  Globe,
  RefreshCw,
  Eye,
  Trash2,
  Bot
} from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: string;
  niche: string | null;
  notes: string | null;
  created_at: string;
  last_contacted_at: string | null;
}

interface EmailSequence {
  id: string;
  lead_id: string;
  sequence_type: string;
  subject: string;
  content: string;
  sent_at: string;
  status: string;
}

interface AdminLeadsProps {
  leads: Lead[];
  emailSequences: EmailSequence[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (leadId: string, status: string) => void;
  onDeleteLead: (leadId: string) => void;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  qualified: "bg-green-500/10 text-green-500 border-green-500/20",
  converted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  unsubscribed: "bg-red-500/10 text-red-500 border-red-500/20",
};

const sourceIcons: Record<string, typeof Users> = {
  popup: Users,
  google_search: Globe,
  manual: Mail,
};

export function AdminLeads({ 
  leads, 
  emailSequences, 
  loading, 
  onRefresh, 
  onUpdateStatus, 
  onDeleteLead 
}: AdminLeadsProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [generatingLeads, setGeneratingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendAIEmail = async (lead: Lead, sequenceType: string) => {
    setSendingEmail(lead.id);
    try {
      const { error } = await supabase.functions.invoke("send-lead-email", {
        body: {
          leadId: lead.id,
          email: lead.email,
          name: lead.name,
          sequenceType,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Sent! 📧",
        description: `AI-generated ${sequenceType} email sent to ${lead.name}`,
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error sending email:", error);

      const raw = error instanceof Error ? error.message : String(error);
      let description = "Please try again later";

      const jsonMatch = raw.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed?.error === "string") {
            description = parsed.error;
          } else {
            description = raw;
          }
        } catch {
          description = raw;
        }
      } else if (raw) {
        description = raw;
      }

      toast({
        title: "Failed to send email",
        description,
        variant: "destructive",
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const handleGenerateLeads = async () => {
    setGeneratingLeads(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-leads", {
        body: {
          niches: ["app_developers", "startups", "agencies"],
        },
      });

      if (error) throw error;

      toast({
        title: "Lead Generation Started! 🔍",
        description: `Found ${data?.leadsFound || 0} potential leads. Processing...`,
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error generating leads:", error);
      toast({
        title: "Failed to generate leads",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setGeneratingLeads(false);
    }
  };

  const leadEmails = emailSequences.filter(
    (seq) => selectedLead && seq.lead_id === selectedLead.id
  );

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailSequences.length}</p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter((l) => l.status === "qualified").length}
                </p>
                <p className="text-xs text-muted-foreground">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Globe className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter((l) => l.source === "google_search").length}
                </p>
                <p className="text-xs text-muted-foreground">AI Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Lead Management
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateLeads}
              disabled={generatingLeads}
              className="gap-2"
            >
              {generatingLeads ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Find Leads with AI
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-8 w-8" />
                        <p>No leads found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateLeads}
                          disabled={generatingLeads}
                        >
                          Generate Leads with AI
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const SourceIcon = sourceIcons[lead.source] || Users;
                    return (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {lead.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <SourceIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize text-sm">
                              {lead.source.replace("_", " ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => onUpdateStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <Badge
                                variant="outline"
                                className={statusColors[lead.status]}
                              >
                                {lead.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(lead.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedLead(lead)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Email History - {lead.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[400px]">
                                  {leadEmails.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                      No emails sent yet
                                    </p>
                                  ) : (
                                    <div className="space-y-4">
                                      {leadEmails.map((email) => (
                                        <Card key={email.id}>
                                          <CardContent className="pt-4">
                                            <div className="flex justify-between items-start mb-2">
                                              <div>
                                                <p className="font-medium">
                                                  {email.subject}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {format(
                                                    new Date(email.sent_at),
                                                    "MMM d, yyyy h:mm a"
                                                  )}
                                                </p>
                                              </div>
                                              <Badge variant="outline">
                                                {email.sequence_type}
                                              </Badge>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">
                                              {email.content}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  )}
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendAIEmail(lead, "follow_up")}
                              disabled={sendingEmail === lead.id}
                            >
                              {sendingEmail === lead.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteLead(lead.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
