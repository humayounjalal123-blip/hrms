"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  QARIS,
  SURAHS,
  formatTime,
  getFallbackSurahAudioUrl,
  getSurahAudioUrl,
} from "@/lib/quran";
import clsx from "clsx";
import { motion } from "framer-motion";
import { interpolate, useI18n } from "@/lib/i18n";

export function QuranPlayer() {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [qariId, setQariId] = useState(QARIS[0].id);
  const [surahNumber, setSurahNumber] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  const qari = QARIS.find((q) => q.id === qariId) || QARIS[0];
  const surah = SURAHS.find((s) => s.number === surahNumber) || SURAHS[0];

  const filteredSurahs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SURAHS;
    return SURAHS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nameAr.includes(q) ||
        String(s.number).includes(q)
    );
  }, [search]);

  const src = usedFallback
    ? getFallbackSurahAudioUrl(qariId, surahNumber)
    : getSurahAudioUrl(qariId, surahNumber);

  useEffect(() => {
    setUsedFallback(false);
    setProgress(0);
    setError("");
  }, [qariId, surahNumber]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (playing) {
      audio.play().catch(() => {
        setPlaying(false);
        setError("Audio could not start. Try another Qari or Surah.");
      });
    }
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
      setError("");
    } catch {
      setError("Playback blocked. Click play again or pick another recording.");
      setPlaying(false);
    }
  };

  const playSurah = async (num: number) => {
    setSurahNumber(num);
    setPlaying(true);
  };

  const nextSurah = () => {
    setSurahNumber((n) => (n >= 114 ? 1 : n + 1));
    setPlaying(true);
  };

  const prevSurah = () => {
    setSurahNumber((n) => (n <= 1 ? 114 : n - 1));
    setPlaying(true);
  };

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => {
          if (autoNext) nextSurah();
          else setPlaying(false);
        }}
        onError={() => {
          if (!usedFallback) {
            setUsedFallback(true);
            setError("Switching to backup audio source…");
            return;
          }
          setPlaying(false);
          setError("This recording is temporarily unavailable. Try another Qari.");
        }}
      />

      {/* Active player bar */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/10 bg-arch-fade p-5 text-white shadow-lift sm:p-7">
        <div className="pointer-events-none absolute inset-0 shimmer-bg opacity-20" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/25 shadow-lg sm:h-28 sm:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qari.cover}
                alt={qari.name}
                className="h-full w-full object-cover"
              />
              {playing && (
                <span className="absolute inset-x-0 bottom-0 bg-primary/80 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
                  {t.listen.playing}
                </span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-green-100">
                {t.listen.nowListening}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                {surah.number}. {surah.name}
              </h2>
              <p className="mt-1 font-display text-lg italic text-green-50/90" dir="rtl">
                {surah.nameAr}
              </p>
              <p className="mt-2 text-sm text-green-100/85">
                {qari.name} · {qari.nameAr} · {surah.ayahs} ayahs · {surah.revelation}
              </p>
            </div>
          </div>

          <div className="w-full max-w-md space-y-3">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={progress}
              onChange={(e) => {
                const v = Number(e.target.value);
                setProgress(v);
                if (audioRef.current) audioRef.current.currentTime = v;
              }}
              className="w-full accent-white"
            />
            <div className="flex items-center justify-between text-xs text-green-100/80">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={prevSurah}
                className="rounded-full bg-white/15 p-2.5 hover:bg-white/25"
                aria-label="Previous surah"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="rounded-full bg-white p-3.5 text-primary shadow-lg hover:scale-105"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              <button
                type="button"
                onClick={nextSurah}
                className="rounded-full bg-white/15 p-2.5 hover:bg-white/25"
                aria-label="Next surah"
              >
                <SkipForward className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  if (audioRef.current) audioRef.current.muted = next;
                }}
                className="rounded-full bg-white/15 p-2.5 hover:bg-white/25"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
            </div>
            <label className="flex items-center justify-center gap-2 text-xs text-green-50/90">
              <input
                type="checkbox"
                checked={autoNext}
                onChange={(e) => setAutoNext(e.target.checked)}
                className="rounded border-white/40 text-primary focus:ring-white"
              />
              {t.listen.autoNext}
            </label>
          </div>
        </div>
        {error && (
          <p className="relative mt-4 rounded-xl bg-white/10 px-3 py-2 text-sm text-green-50">
            {error}
          </p>
        )}
      </div>

      {/* Qari selection */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.listen.selectQari}</h3>
            <p className="text-sm text-slate-500">{t.listen.selectQariHint}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {QARIS.map((q) => (
            <motion.button
              key={q.id}
              type="button"
              whileHover={{ y: -2 }}
              onClick={() => {
                setQariId(q.id);
                setPlaying(true);
              }}
              className={clsx(
                "overflow-hidden rounded-2xl border text-left transition",
                qariId === q.id
                  ? "border-primary bg-primary-soft shadow-sm ring-2 ring-primary/20"
                  : "border-slate-100 bg-white hover:border-primary/30"
              )}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-primary/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.cover}
                  alt={q.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {qariId === q.id && (
                  <span className="absolute end-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                    {t.listen.active}
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-slate-900">{q.name}</div>
                <div className="mt-0.5 text-xs text-slate-500" dir="rtl">
                  {q.nameAr}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  {q.country} · {q.style}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Surah list */}
      <section className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.listen.surahList}</h3>
            <p className="text-sm text-slate-500">
              {interpolate(t.listen.surahHint, { name: qari.name })}
            </p>
          </div>
          <input
            className="input-base max-w-xs"
            placeholder={t.listen.searchSurah}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[480px] space-y-1 overflow-y-auto pr-1">
          {filteredSurahs.map((s) => {
            const active = s.number === surahNumber;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => playSurah(s.number)}
                className={clsx(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition",
                  active
                    ? "bg-primary text-white"
                    : "hover:bg-primary-soft/70 text-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                      active ? "bg-white/20" : "bg-slate-100 text-primary"
                    )}
                  >
                    {s.number}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div
                      className={clsx(
                        "text-xs",
                        active ? "text-green-50/80" : "text-slate-500"
                      )}
                    >
                      {s.revelation} · {s.ayahs} ayahs
                    </div>
                  </div>
                </div>
                <span
                  className={clsx(
                    "font-serif text-sm",
                    active ? "text-green-50" : "text-slate-600"
                  )}
                  dir="rtl"
                >
                  {s.nameAr}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
