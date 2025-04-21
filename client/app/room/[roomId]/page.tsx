"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/socket-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import PollRoom from "@/components/room/poll-room";
import Loading from "@/components/room/loading";

/**
 * RoomPage component responsible for rendering the room view.
 *
 * - Redirects to login if user is not authenticated.
 * - Attempts to join the room using the provided roomId.
 * - Handles socket events to update room state.
 *
 * @returns {JSX.Element}
 */
export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { socket, isConnected, joinRoom, currentRoom } = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirectTo=/room/${roomId}`);
      return;
    }

    if (isConnected && user) {
      setIsJoining(true);
      joinRoom(roomId as string)
        .then(() => {
          setIsJoining(false);
        })
        .catch((err) => {
          const msg = err.message || "Failed to join room";
          setError(msg);
          setIsJoining(false);
          toast({
            title: "Error",
            description: msg,
            variant: "destructive",
          });
        });
    }
  }, [roomId, user, isConnected, joinRoom, router, toast]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomClosed = () => {
      toast({
        title: "Room Closed",
        description: "This poll has ended.",
      });
      router.push("/");
    };

    const handleError = (data: { message: string }) => {
      setError(data.message);
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
    };

    socket.on("room_closed", handleRoomClosed);
    socket.on("room_error", handleError);
    socket.emit("get_room_data", { roomId });

    return () => {
      socket.off("room_closed", handleRoomClosed);
      socket.off("room_error", handleError);
    };
  }, [socket, roomId, router, toast]);

  if (!user) {
    return <Loading message="Please log in to join this room" />;
  }

  if (error && !currentRoom) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return Home
        </button>
      </div>
    );
  }

  if ( !currentRoom) {
    return <Loading message="Loading poll data..." />;
  }

  return <PollRoom roomData={currentRoom} roomId={roomId as string} />;
}
