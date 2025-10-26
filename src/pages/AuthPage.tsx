import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function AuthPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden p-4">
      <ThemeToggle className="absolute top-6 right-6" />
      <div className="absolute inset-0 bg-grid-slate-100/[0.05] dark:bg-grid-slate-900/[0.2] bg-[10px_10px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.2 }}
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-accent/20 rounded-full filter blur-2xl"
      ></motion.div>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.4 }}
        className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary-accent/20 rounded-full filter blur-3xl"
      ></motion.div>
      <div className="text-center z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0, 0.71, 0.2, 1.01]
          }}
          className="mb-8"
        >
          <img src="https://placehold.co/600x400/764BA2/F38020?text=DataBloom\nIllustration&font=playfairdisplay" alt="DataBloom Illustration" className="w-[400px] h-auto max-w-full md:w-[600px] rounded-2xl shadow-2xl" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-4"
        >
          Welcome to <span className="text-gradient">DataBloom AI</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Seamlessly ingest, process, and interact with your data using the power of Retrieval Augmented Generation.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button asChild size="lg" className="bg-btn-gradient text-primary-foreground font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out active:scale-95">
            <Link to="/login">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-semibold text-lg px-8 py-6 rounded-full hover:bg-accent transition-colors duration-200">
            <Link to="/signup">Create Account</Link>
          </Button>
        </motion.div>
      </div>
      <footer className="absolute bottom-6 text-center text-sm text-muted-foreground/80 z-10">
        <p>There is a limit on the number of requests that can be made to the AI servers.</p>
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
    </div>
  );
}