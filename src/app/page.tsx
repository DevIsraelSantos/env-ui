import { EnvManager } from "@/components/env-manager";

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Gerenciador de Arquivos .env</h1>
      <EnvManager />
    </main>
  );
}
