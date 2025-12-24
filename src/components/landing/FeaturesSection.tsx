import {
  Calendar,
  CheckCircle2,
  Users,
  CreditCard,
  MessageSquare,
  BarChart3,
  Zap,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "AI Smart Scheduling",
    description:
      "Let AI auto-schedule your tasks based on priority, deadlines, and your work style.",
    gradient: "from-primary to-purple-400",
  },
  {
    icon: CheckCircle2,
    title: "Tasks & Projects",
    description:
      "Kanban boards, task dependencies, recurring tasks, and AI-powered breakdowns.",
    gradient: "from-secondary to-cyan-400",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Roles, permissions, workload views, comments, and @mentions for seamless teamwork.",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    icon: Target,
    title: "CRM & Pipeline",
    description:
      "Track leads, opportunities, and deals with a beautiful visual pipeline.",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: CreditCard,
    title: "Invoices & Payments",
    description:
      "Create invoices, send payment links, and accept payments via Stripe.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description:
      "Ask anything: 'Plan my day', 'What should I work on?', 'Summarize this meeting'.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: BarChart3,
    title: "Smart Dashboard",
    description:
      "See your AI-planned schedule, upcoming tasks, revenue, and insights in one view.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: Zap,
    title: "Auto-Everything",
    description:
      "Auto-reschedule missed tasks, protect focus blocks, and stay on track effortlessly.",
    gradient: "from-yellow-500 to-amber-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-background opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-display-sm md:text-display-md font-bold mb-4">
            Everything you need,
            <br />
            <span className="gradient-text">nothing you don't.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            One intelligent workspace that replaces your task manager, calendar,
            CRM, and invoicing tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-panel rounded-2xl p-6 card-hover group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
