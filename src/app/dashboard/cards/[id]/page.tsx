"use client";

import { useParams } from "next/navigation";
import CardEditor from "@/components/cards/CardEditor";

export default function EditCardPage() {
  const params = useParams();
  return <CardEditor cardId={params.id as string} />;
}
