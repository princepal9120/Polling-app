"use client";

import { motion } from "framer-motion";
import { Clock, Users, Zap, Shield, RefreshCw, Share2 } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Real-time Updates",
    description: "See votes as they happen with instant updates and smooth animations."
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "60-Second Timer",
    description: "Quick polls with a countdown timer to keep things moving."
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Live Participants",
    description: "See who's in the room and when they've voted."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Vote Protection",
    description: "One vote per user, guaranteed with duplicate vote prevention."
  },
  {
    icon: <RefreshCw className="h-8 w-8" />,
    title: "Persistent State",
    description: "Refresh the page without losing your place or votes."
  },
  {
    icon: <Share2 className="h-8 w-8" />,
    title: "Shareable Rooms",
    description: "Invite anyone with a simple room code - no account needed."
  }
];

export default function Features() {
  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Our real-time polling platform is packed with features that make creating and participating in polls fun and interactive.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}