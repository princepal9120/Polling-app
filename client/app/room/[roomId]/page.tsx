"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/socket-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import PollRoom from "@/components/room/poll-room";
import Loading from "@/components/room/loading";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * RoomPage component responsible for rendering the room view.
 * 
 * - Redirects to login if user is not authenticated.
 * - Attempts to join the room using the provided roomId.
 * - Handles socket events to update room data and manage room state.
 * - Persists and retrieves room data from localStorage.
 * 
 * @returns {JSX.Element} The component rendering either loading, error, or the poll room content.
 */

/*******  f7437150-2777-4fdb-8b1f-12bc83b8a562  *******/
export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { socket, isConnected, joinRoom } = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(true);
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push(`/login?redirectTo=/room/${roomId}`);
      return;
    }

    // Load persisted room data if available
    const persistedData = localStorage.getItem(`room_${roomId}`);
    if (persistedData) {
      try {
        setRoomData(JSON.parse(persistedData));
      } catch (error) {
        console.error("Error parsing persisted room data:", error);
      }
    }

    // Try to join room when connected
    if (isConnected && user) {
      setIsJoining(true);
      joinRoom(roomId as string)
        .then(() => {
          setIsJoining(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to join room");
          setIsJoining(false);
          toast({
            title: "Error",
            description: err.message || "Failed to join room",
            variant: "destructive",
          });
        });
    }
  }, [roomId, user, isConnected, joinRoom, router, toast]);

  useEffect(() => {
    if (!socket) return;

    // Room data handler
    const handleRoomData = (data: any) => {
      setRoomData(data);
      // Persist room data
      localStorage.setItem(`room_${roomId}`, JSON.stringify(data));
    };

    // Room closed handler
    const handleRoomClosed = () => {
      toast({
        title: "Room Closed",
        description: "This poll has ended.",
      });
      localStorage.removeItem(`room_${roomId}`);
      router.push("/");
    };

    // Error handler
    const handleError = (data: { message: string }) => {
      setError(data.message);
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
    };

    // Subscribe to socket events
    socket.on("room_data", handleRoomData);
    socket.on("room_closed", handleRoomClosed);
    socket.on("room_error", handleError);

    // Request initial room data
    socket.emit("get_room_data", { roomId });

    // Cleanup
    return () => {
      socket.off("room_data", handleRoomData);
      socket.off("room_closed", handleRoomClosed);
      socket.off("room_error", handleError);
    };
  }, [socket, roomId, router, toast]);

  if (!user) {
    return <Loading message="Please log in to join this room" />;
  }


  if (error && !roomData) {
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
  console.log(roomData)
  if (!roomData) {
    return <Loading message="Loading poll data..." />;
  }

  return <PollRoom roomData={roomData} roomId={roomId as string} />;
}