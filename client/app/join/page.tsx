"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Scroll to the join section on the home page
    router.push("/#join-create");
  }, [router]);

  return null;
}