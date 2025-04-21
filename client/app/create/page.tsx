"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Scroll to the create section on the home page
    router.push("/#join-create");
  }, [router]);

  return null;
}