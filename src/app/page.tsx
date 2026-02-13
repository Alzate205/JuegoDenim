// src/app/page.tsx
import { HomeHero } from "components/home/HomeHero";
import { CreateGameForm } from "components/home/CreateGameForm";
import { JoinGameForm } from "components/home/JoinGameForm";

export default function HomePage() {
  return (
    <div className="grid gap-8 md:grid-cols-[2fr,1fr] items-start">
      <HomeHero />
      <div className="space-y-6">
        <CreateGameForm />
        <JoinGameForm />
      </div>
    </div>
  );
}
