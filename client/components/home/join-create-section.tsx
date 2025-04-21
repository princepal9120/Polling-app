"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";
import { useSocket } from "@/contexts/socket-context";
import { useToast } from "@/hooks/use-toast";

const joinSchema = z.object({
  roomCode: z.string().length(6, { message: "Room code must be exactly 6 characters" }),
});

const createSchema = z.object({
  question: z.string().min(5, { message: "Question must be at least 5 characters" }),
  option1: z.string().min(1, { message: "Option 1 is required" }),
  option2: z.string().min(1, { message: "Option 2 is required" }),
});

export default function JoinCreateSection() {


  const { user } = useAuth();
  const router = useRouter();
  const { joinRoom, createRoom } = useSocket();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const joinForm = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      roomCode: "",
    },
  });

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      question: "",
      option1: "",
      option2: "",
    },
  });

  const onJoinSubmit = async (values: z.infer<typeof joinSchema>) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsJoining(true);
    try {
      await joinRoom(values.roomCode);
      router.push(`/room/${values.roomCode}`);
    } catch (error: any) {
      toast({
        title: "Error joining room",
        description: error.message || "Failed to join room. Please check your room code.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const onCreateSubmit = async (values: z.infer<typeof createSchema>) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsCreating(true);
    try {
      const roomId = await createRoom(
        values.question, 
        [values.option1, values.option2]
      );
      router.push(`/room/${roomId}`);
    } catch (error: any) {
      toast({
        title: "Error creating room",
        description: error.message || "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="py-12" id="join-create">
      <div className="container px-4 md:px-6">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center">Start Polling</CardTitle>
            <CardDescription className="text-center">
              Create a new poll room or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="join" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="join">Join Existing</TabsTrigger>
                <TabsTrigger value="create">Create New</TabsTrigger>
              </TabsList>
              <TabsContent value="join" className="mt-4">
                <Form {...joinForm}>
                  <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                    <FormField
                      control={joinForm.control}
                      name="roomCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter 6-digit room code" 
                              {...field} 
                              maxLength={6}
                              className="text-center text-lg tracking-wider"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isJoining || !user}
                    >
                      {isJoining ? "Joining..." : "Join Room"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="create" className="mt-4">
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poll Question</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Cats vs Dogs?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="option1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Option 1</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Cats" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="option2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Option 2</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Dogs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isCreating || !user}
                    >
                      {isCreating ? "Creating..." : "Create Poll Room"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-muted-foreground">
              {user ? "You're signed in and ready to go!" : "Please sign in to create or join polls"}
            </p>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}