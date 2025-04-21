"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/contexts/socket-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Clock, Users, ThumbsUp } from "lucide-react";
import ParticipantList from "@/components/room/participant-list";
import Timer from "@/components/room/timer";

type PollRoomProps = {
  roomData: any;
  roomId: string;
};

export default function PollRoom({ roomData, roomId }: PollRoomProps) {
  const { user } = useAuth();
  const { socket, castVote } = useSocket();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<number>(roomData.timeRemaining || 60);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voteResults, setVoteResults] = useState<number[]>(roomData.votes || [0, 0]);
  const [participants, setParticipants] = useState<any[]>(roomData.participants || []);
  const [isRoomActive, setIsRoomActive] = useState<boolean>(roomData.active !== false);
  const [totalVotes, setTotalVotes] = useState<number>(
    roomData.votes ? roomData.votes.reduce((a: number, b: number) => a + b, 0) : 0
  );

  // Initialize user's vote from localStorage
  useEffect(() => {
    // Check if user has already voted
    const userVoteData = participants.find((p) => p.userId === user?.id);
    if (userVoteData && userVoteData.hasVoted) {
      setHasVoted(true);
      setSelectedOption(userVoteData.vote);
    }
  }, [participants, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Vote update handler
    const handleVoteUpdate = (data: { votes: number[], participants: any[] }) => {
      setVoteResults(data.votes);
      setParticipants(data.participants);
      setTotalVotes(data.votes.reduce((a, b) => a + b, 0));
      
      // Check if current user has voted
      if (user) {
        const userVoteData = data.participants.find((p) => p.userId === user.id);
        if (userVoteData && userVoteData.hasVoted) {
          setHasVoted(true);
          setSelectedOption(userVoteData.vote);
        }
      }
    };

    // Timer update handler
    const handleTimerUpdate = (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    };

    // Room ended handler
    const handleRoomEnded = () => {
      setIsRoomActive(false);
      toast({
        title: "Poll Ended",
        description: "The voting period has ended",
      });
    };

    // Subscribe to socket events
    socket.on("vote_update", handleVoteUpdate);
    socket.on("timer_update", handleTimerUpdate);
    socket.on("room_ended", handleRoomEnded);

    // Cleanup
    return () => {
      socket.off("vote_update", handleVoteUpdate);
      socket.off("timer_update", handleTimerUpdate);
      socket.off("room_ended", handleRoomEnded);
    };
  }, [socket, user, toast]);

  // Handle vote
  const handleVote = (optionIndex: number) => {
    if (hasVoted || !isRoomActive) return;

    setSelectedOption(optionIndex);
    castVote(roomId, optionIndex);
    setHasVoted(true);

    toast({
      title: "Vote Cast",
      description: `You voted for ${roomData.options[optionIndex]}`,
    });
  };

  // Share room
  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join my poll: ${roomData.question}`,
        text: `I've created a poll and want your vote! Join with room code: ${roomId}`,
        url: window.location.href,
      }).catch((err) => {
        console.error("Error sharing:", err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Room link copied to clipboard",
      });
    }
  };

  // Calculate percentages
  const calculatePercentage = (votesForOption: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votesForOption / totalVotes) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center mb-2">
              <Badge variant={isRoomActive ? "default" : "secondary"}>
                {isRoomActive ? "Live" : "Ended"}
              </Badge>
              <Button variant="ghost" size="icon" onClick={shareRoom}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-2xl md:text-3xl">{roomData.question}</CardTitle>
            <CardDescription className="flex items-center mt-2">
              <Users className="mr-1 h-4 w-4" /> 
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
              <span className="mx-2">•</span>
              <Clock className="mr-1 h-4 w-4" />
              <Timer seconds={timeRemaining} isActive={isRoomActive} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roomData.options.map((option: string, index: number) => (
                <motion.div 
                  key={index}
                  whileHover={!hasVoted && isRoomActive ? { scale: 1.01 } : {}}
                  whileTap={!hasVoted && isRoomActive ? { scale: 0.98 } : {}}
                  layout
                >
                  <div 
                    className={`relative w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === index 
                        ? "border-primary bg-primary/10"
                        : hasVoted || !isRoomActive 
                          ? "border-border bg-background"
                          : "border-border bg-background hover:border-primary/50 cursor-pointer"
                    }`}
                    onClick={() => !hasVoted && isRoomActive && handleVote(index)}
                  >
                    <div className="flex justify-between items-center mb-2 z-10 relative">
                      <span className="font-medium">{option}</span>
                      <span className="font-bold">
                        {calculatePercentage(voteResults[index])}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculatePercentage(voteResults[index])}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full ${selectedOption === index ? "bg-primary" : "bg-muted-foreground/70"}`}
                      />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {voteResults[index]} vote{voteResults[index] !== 1 ? 's' : ''}
                    </div>
                    
                    {selectedOption === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-3"
                      >
                        <Badge variant="default" className="px-2 py-1">
                          <ThumbsUp className="h-3 w-3 mr-1" /> Your Vote
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-3 flex flex-col items-start">
            {!isRoomActive && (
              <div className="w-full p-3 bg-muted rounded-md mb-4">
                <h3 className="font-semibold mb-1">Poll Results</h3>
                <p className="text-sm text-muted-foreground">
                  Final result: {roomData.options[voteResults.indexOf(Math.max(...voteResults))]} wins with {Math.max(...voteResults)} votes!
                </p>
              </div>
            )}
            {!hasVoted && isRoomActive && (
              <p className="text-sm text-muted-foreground">
                Click on an option to cast your vote
              </p>
            )}
          </CardFooter>
        </Card>

        <ParticipantList 
          participants={participants} 
          currentUserId={user?.id} 
        />
      </div>
    </div>
  );
}