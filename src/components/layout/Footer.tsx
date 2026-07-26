import { appConfig } from "../../config/app.config";
import { BuildMeta } from "../ui/BuildMeta";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-6 text-sm text-muted md:flex-row">
        <p>{appConfig.name} · React, TypeScript, Vite, Tailwind CSS</p>
        <p>
          <BuildMeta />
        </p>
      </div>
    </footer>
  );
}
