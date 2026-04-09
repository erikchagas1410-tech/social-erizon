"use client";

import Link from "next/link";
import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { generateMonthPlan } from "@/app/command-center/actions";

export function CommandCenterActions() {
  const router = useRouter();

  return (
    <div className="top-header__actions">
      <button
        type="button"
        className="ghost-button"
        onClick={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
      >
        Atualizar
      </button>

      <Link href="/growth-analyst" className="ghost-button">
        Analista de Growth
      </Link>

      <Link href="/super-agent" className="ghost-button">
        Super Agente
      </Link>

      <Link href="/generate-content" className="primary-button secondary">
        Gerar Post
      </Link>

      <form action={generateMonthPlan}>
        <GenerateMonthButton />
      </form>
    </div>
  );
}

function GenerateMonthButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="primary-button" disabled={pending}>
      {pending ? "Gerando mes..." : "Gerar Mes"}
    </button>
  );
}
