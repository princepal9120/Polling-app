"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";

type ParticipantListProps = {
  participants: any[];
  currentUserId: string | undefined;
};

export default function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate initials from username
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  // Get a deterministic color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Participants ({participants.length})</CardTitle>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        <CardDescription>
          {participants.filter(p => p.hasVoted).length} of {participants.length} voted
        </CardDescription>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pb-4">
              <ScrollArea className="h-[240px] pr-4">
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <motion.div
                      key={participant.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center justify-between p-2 rounded-md ${
                        participant.userId === currentUserId ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={getAvatarColor(participant.username)}>
                            {getInitials(participant.username)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {participant.username}
                          {participant.userId === currentUserId && (
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        {participant.hasVoted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Badge variant="outline" className="flex items-center gap-1 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
                              <CheckCircle className="h-3 w-3" />
                              Voted
                            </Badge>
                          </motion.div>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                            <Circle className="h-3 w-3" />
                            Not voted
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}