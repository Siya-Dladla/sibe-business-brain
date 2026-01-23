import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "@/components/MobileMenu";
import { useToast } from "@/hooks/use-toast";
import { 
  Layers, 
  ExternalLink, 
  Zap, 
  Workflow, 
  GitBranch,
  Bot,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'workflow' | 'agent';
  icon: typeof Zap;
  color: string;
  url: string;
  features: string[];
  connected?: boolean;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Open-source workflow automation tool. Build complex workflows with 400+ integrations.',
    category: 'workflow',
    icon: Workflow,
    color: 'from-orange-500 to-red-500',
    url: 'https://n8n.io',
    features: ['Visual workflow builder', 'Self-hosted option', '400+ integrations', 'Code nodes'],
    connected: false
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    description: 'Visual automation platform for connecting apps and automating workflows.',
    category: 'workflow',
    icon: GitBranch,
    color: 'from-purple-500 to-indigo-500',
    url: 'https://www.make.com',
    features: ['Visual scenarios', 'Real-time execution', '1000+ apps', 'Error handling'],
    connected: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect your favorite apps and automate workflows without code.',
    category: 'workflow',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    url: 'https://zapier.com',
    features: ['5000+ apps', 'Multi-step zaps', 'Filters & paths', 'Scheduled triggers'],
    connected: false
  },
  {
    id: 'openai-agents',
    name: 'OpenAI Agent Builder',
    description: 'Build and deploy custom AI agents powered by GPT models.',
    category: 'agent',
    icon: Bot,
    color: 'from-green-500 to-emerald-500',
    url: 'https://platform.openai.com/assistants',
    features: ['Custom instructions', 'Code interpreter', 'Function calling', 'Knowledge retrieval'],
    connected: false
  },
  {
    id: 'langchain',
    name: 'LangChain',
    description: 'Framework for developing applications powered by language models.',
    category: 'agent',
    icon: Bot,
    color: 'from-teal-500 to-cyan-500',
    url: 'https://langchain.com',
    features: ['Chain composition', 'Agent toolkits', 'Memory systems', 'Document loaders'],
    connected: false
  },
  {
    id: 'autogen',
    name: 'AutoGen',
    description: 'Microsoft framework for building multi-agent conversational systems.',
    category: 'agent',
    icon: Bot,
    color: 'from-blue-500 to-indigo-500',
    url: 'https://microsoft.github.io/autogen/',
    features: ['Multi-agent chats', 'Human-in-the-loop', 'Code execution', 'Flexible agents'],
    connected: false
  }
];

const Canvas = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [filter, setFilter] = useState<'all' | 'workflow' | 'agent'>('all');
  const { toast } = useToast();

  const handleConnect = (integration: Integration) => {
    window.open(integration.url, '_blank');
    toast({
      title: `Opening ${integration.name}`,
      description: "Follow the setup instructions to connect your account.",
    });
  };

  const filteredIntegrations = integrations.filter(
    i => filter === 'all' || i.category === filter
  );

  const workflowIntegrations = integrations.filter(i => i.category === 'workflow');
  const agentIntegrations = integrations.filter(i => i.category === 'agent');

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Third-Party Integrations</div>
      </div>

      <div className="container mx-auto px-6 py-8 bg-primary-foreground">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Layers className="w-10 h-10 text-primary animate-pulse" />
            <div>
              <h1 className="text-4xl font-extralight tracking-wide">Integrations</h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                Connect workflow builders and AI agent platforms
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'workflow' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('workflow')}
            className="gap-2"
          >
            <Workflow className="w-4 h-4" />
            Workflow Builders
          </Button>
          <Button
            variant={filter === 'agent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('agent')}
            className="gap-2"
          >
            <Bot className="w-4 h-4" />
            AI Agent Builders
          </Button>
        </div>

        {/* Workflow Builders Section */}
        {(filter === 'all' || filter === 'workflow') && (
          <div className="mb-10">
            <h2 className="text-2xl font-extralight mb-6 flex items-center gap-3">
              <Workflow className="w-6 h-6 text-primary" />
              Workflow Automation Platforms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowIntegrations.map((integration) => (
                <Card
                  key={integration.id}
                  className="glass-card p-6 hover-lift group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${integration.color} opacity-10 blur-2xl`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${integration.color}`}>
                        <integration.icon className="w-6 h-6 text-white" />
                      </div>
                      {integration.connected && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-light mb-2">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {integration.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {integration.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      onClick={() => handleConnect(integration)}
                    >
                      Open {integration.name}
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Agent Builders Section */}
        {(filter === 'all' || filter === 'agent') && (
          <div>
            <h2 className="text-2xl font-extralight mb-6 flex items-center gap-3">
              <Bot className="w-6 h-6 text-primary" />
              AI Agent Builder Platforms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentIntegrations.map((integration) => (
                <Card
                  key={integration.id}
                  className="glass-card p-6 hover-lift group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${integration.color} opacity-10 blur-2xl`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${integration.color}`}>
                        <integration.icon className="w-6 h-6 text-white" />
                      </div>
                      {integration.connected && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-light mb-2">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {integration.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {integration.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      onClick={() => handleConnect(integration)}
                    >
                      Open {integration.name}
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Getting Started Card */}
        <Card className="glass-card p-8 mt-10 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-light mb-1">Getting Started</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a platform, connect your account, and start building automations that work with Sibe.
                </p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0">
              View Documentation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Canvas;
