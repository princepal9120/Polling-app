"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ArrowRight, BarChart3, PieChart, Timer } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                Real-time Poll Battles at Your Fingertips
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-muted-foreground md:text-xl">
                Create instant polls, share them with friends, and watch results update in real-time.
                Settle debates, make decisions, and have fun with live interaction.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <Button 
                size="lg" 
                onClick={() => router.push(user ? "/create" : "/login")}
              >
                {user ? "Create a Poll" : "Sign In to Start"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push("/join")}
              >
                Join with Code
              </Button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative lg:ml-auto"
          >
            <div className="relative bg-gradient-to-b from-primary/20 to-primary/5 border rounded-lg overflow-hidden p-8">
              <div className="flex flex-col space-y-4">
                <div className="rounded-lg bg-card p-4 shadow-lg">
                  <h2 className="text-lg font-semibold mb-4">Cats vs Dogs?</h2>
                  <div className="space-y-3">
                    <div className="relative w-full h-14 rounded-md bg-secondary overflow-hidden">
                      <div className="absolute inset-0 bg-primary/80 w-[65%] h-full flex items-center px-4 text-primary-foreground animate-pulse">
                        <PieChart className="h-5 w-5 mr-2" />
                        Cats <span className="ml-auto">65%</span>
                      </div>
                    </div>
                    <div className="relative w-full h-14 rounded-md bg-secondary overflow-hidden">
                      <div className="absolute inset-0 bg-accent w-[35%] h-full flex items-center px-4 text-accent-foreground">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Dogs <span className="ml-auto">35%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Timer className="h-4 w-4 mr-1" />
                      00:45 remaining
                    </div>
                    <div className="text-sm text-muted-foreground">
                      8 participants
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl"></div>
              <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}