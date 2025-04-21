"use client";

import { Loader2 } from "lucide-react";

export default function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}