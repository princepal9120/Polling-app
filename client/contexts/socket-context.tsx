"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";

type RoomData = {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  voters: Array<{ userId: string; username: string; optionIndex: number }>;
  expiresAt: string;
  isActive: boolean;
};

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  currentRoom: RoomData | null;
  createRoom: (pollQuestion: string, options: string[]) => Promise<string>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  castVote: (roomId: string, optionIndex: number) => Promise<boolean>;
  leaveRoom: () => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Only connect to socket if user is logged in
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }


    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      {
        auth: {
          userId: user.id,
          username: user.username,
        },
      }
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setCurrentRoom(null);
    });

    socketInstance.on("error", (error) => {
      toast({
        title: "Connection Error",
        description:
          error.message || "An error occurred with the socket connection",
        variant: "destructive",
      });
    });

    socketInstance.on("room_update", (roomData: RoomData) => {
      console.log("Room update received:", roomData);
      setCurrentRoom(roomData);
    });

    socketInstance.on("poll_expired", ({ roomId }) => {
      toast({
        title: "Poll Expired",
        description: "This poll has ended",
        variant: "default",
      });

      if (currentRoom && currentRoom.id === roomId) {
        setCurrentRoom((prev) => (prev ? { ...prev, isActive: false } : null));
      }
    });

    socketInstance.on("vote_recorded", () => {
      toast({
        title: "Success",
        description: "Your vote has been recorded",
        variant: "default",
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, toast]);

  const createRoom = (
    pollQuestion: string,
    options: string[]
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected || !user) {
        reject(new Error("Not connected to server"));
        return;
      }

      socket.emit(
        "create_room",
        {
          question: pollQuestion,
          options,
          createdBy: user.id,
        },
        (response: { success: boolean; roomId?: string; error?: string }) => {
          if (response.success && response.roomId) {
            resolve(response.roomId);
          } else {
            reject(new Error(response.error || "Failed to create room"));
          }
        }
      );
    });
  };

  const joinRoom = (roomCode: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected || !user) {
        reject(new Error("Not connected to server"));
        return;
      }

      socket.emit(
        "join_room",
        {
          roomId: roomCode,
          userId: user.id,
          username: user.username,
        },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve(true);
          } else {
            reject(new Error(response.error || "Failed to join room"));
          }
        }
      );
    });
  };

  const castVote = (roomId: string, optionIndex: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected || !user) {
        reject(new Error("Not connected to server"));
        return;
      }

      socket.emit(
        "cast_vote",
        {
          roomId,
          userId: user.id,
          optionIndex,
        },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve(true);
          } else {
            reject(new Error(response.error || "Failed to cast vote"));
          }
        }
      );
    });
  };

  const leaveRoom = () => {
    if (currentRoom && socket) {
      socket.emit("leave_room", { roomId: currentRoom.id });
      setCurrentRoom(null);
    }
  };

  const value = {
    socket,
    isConnected,
    currentRoom,
    createRoom,
    joinRoom,
    castVote,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
