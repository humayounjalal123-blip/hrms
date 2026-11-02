"use client";

import { TopBar } from "@/components/dashboard/TopBar";
import { QuranPlayer } from "@/components/QuranPlayer";
import { FadeUp } from "@/components/motion";

export default function DashboardListenPage() {
  return (
    <div>
      <TopBar
        title="Quran Listening"
        subtitle="Listen to recorded Quran from famous Qaris for revision and muraja'ah"
      />
      <FadeUp>
        <QuranPlayer />
      </FadeUp>
    </div>
  );
}
