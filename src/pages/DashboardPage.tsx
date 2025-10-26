import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, MessageSquare, History, Bot } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};
const featureCards = [
  {
    title: "Upload Data",
    description: "Ingest files or set up data pipelines.",
    icon: UploadCloud,
    link: "/upload",
    color: "text-primary-accent"
  },
  {
    title: "Start a Chat",
    description: "Converse with your processed data.",
    icon: MessageSquare,
    link: "/chat",
    color: "text-secondary-accent"
  },
  {
    title: "View Sessions",
    description: "Review your past conversations.",
    icon: History,
    link: "/chat",
    color: "text-illustrative-green"
  }
];
export function DashboardPage() {
  const { user } = useAuth();
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.name || 'Illustrator'}!</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Ready to unlock insights from your data?
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureCards.map((card, i) => (
            <motion.div key={card.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Link to={card.link} className="block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary-accent/50 flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <card.icon className={`w-10 h-10 ${card.color}`} />
                    <CardTitle className="text-2xl font-semibold">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-base">{card.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mt-16"
        >
          <Card className="bg-secondary border-dashed">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Bot className="w-8 h-8 text-primary-accent" />
                <div>
                  <CardTitle className="text-2xl font-semibold">Recent Activity</CardTitle>
                  <CardDescription>A summary of your latest interactions will appear here.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>No recent activity yet. Start by uploading some data!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}