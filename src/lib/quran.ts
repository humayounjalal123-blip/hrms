export interface Qari {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  style: string;
  /** islamic.network audio-surah edition id */
  edition: string;
  /** Portrait cover under /public/qaris */
  cover: string;
}

export interface SurahMeta {
  number: number;
  name: string;
  nameAr: string;
  ayahs: number;
  revelation: "Meccan" | "Medinan";
}

/** Famous Qaris — audio from public CDN (islamic.network) */
export const QARIS: Qari[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    nameAr: "مشاري راشد العفاسي",
    country: "Kuwait",
    style: "Murattal",
    edition: "ar.alafasy",
    cover: "/qaris/alafasy.jpg",
  },
  {
    id: "sudais",
    name: "Abdurrahman As-Sudais",
    nameAr: "عبد الرحمن السديس",
    country: "Saudi Arabia",
    style: "Murattal",
    edition: "ar.abdurrahmaansudais",
    cover: "/qaris/sudais.jpg",
  },
  {
    id: "shuraim",
    name: "Saud Al-Shuraim",
    nameAr: "سعود الشريم",
    country: "Saudi Arabia",
    style: "Murattal",
    edition: "ar.shaatree",
    cover: "/qaris/shuraim.jpg",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    nameAr: "محمود خليل الحصري",
    country: "Egypt",
    style: "Murattal",
    edition: "ar.husary",
    cover: "/qaris/husary.jpg",
  },
  {
    id: "minshawi",
    name: "Mohamed Siddiq El-Minshawi",
    nameAr: "محمد صديق المنشاوي",
    country: "Egypt",
    style: "Murattal",
    edition: "ar.minshawi",
    cover: "/qaris/minshawi.jpg",
  },
  {
    id: "abdulsamad",
    name: "Abdul Basit Abdul Samad",
    nameAr: "عبد الباسط عبد الصمد",
    country: "Egypt",
    style: "Murattal",
    edition: "ar.abdulsamad",
    cover: "/qaris/abdulsamad.jpg",
  },
  {
    id: "muaiqly",
    name: "Maher Al-Muaiqly",
    nameAr: "ماهر المعيقلي",
    country: "Saudi Arabia",
    style: "Murattal",
    edition: "ar.mahermuaiqly",
    cover: "/qaris/muaiqly.jpg",
  },
  {
    id: "hudhaify",
    name: "Ali Al-Hudhaify",
    nameAr: "علي الحذيفي",
    country: "Saudi Arabia",
    style: "Murattal",
    edition: "ar.hudhaify",
    cover: "/qaris/hudhaify.jpg",
  },
  {
    id: "ajamy",
    name: "Ahmad Al-Ajmy",
    nameAr: "أحمد العجمي",
    country: "Saudi Arabia",
    style: "Murattal",
    edition: "ar.ahmedajamy",
    cover: "/qaris/ajamy.jpg",
  },
  {
    id: "ghamdi",
    name: "Saad Al-Ghamdi",
    nameAr: "سعد الغامدي",
    country: "Saudi Arabia",
    style: "Murattal",
    edition: "ar.saadalghamdi",
    cover: "/qaris/ghamdi.jpg",
  },
];

/** Fallback MP3Quran server paths if islamic.network edition fails */
export const QARI_FALLBACK: Record<string, string> = {
  alafasy: "https://server8.mp3quran.net/afs",
  sudais: "https://server11.mp3quran.net/sds",
  shuraim: "https://server7.mp3quran.net/shur",
  husary: "https://server13.mp3quran.net/husr",
  minshawi: "https://server10.mp3quran.net/minsh",
  abdulsamad: "https://server7.mp3quran.net/basit",
  muaiqly: "https://server12.mp3quran.net/maher",
  hudhaify: "https://server8.mp3quran.net/hthfi",
  ajamy: "https://server10.mp3quran.net/ajm",
  ghamdi: "https://server7.mp3quran.net/s_ghamdi",
};

/** Primary: mp3quran full-surah servers. Secondary: islamic.network CDN. */
export function getSurahAudioUrl(qariId: string, surahNumber: number, useFallback = false) {
  const padded = String(surahNumber).padStart(3, "0");
  const base = QARI_FALLBACK[qariId];
  if (!useFallback && base) return `${base}/${padded}.mp3`;
  const qari = QARIS.find((q) => q.id === qariId) || QARIS[0];
  return `https://cdn.islamic.network/quran/audio-surah/128/${qari.edition}/${surahNumber}.mp3`;
}

export function getFallbackSurahAudioUrl(qariId: string, surahNumber: number) {
  return getSurahAudioUrl(qariId, surahNumber, true);
}

export const SURAHS: SurahMeta[] = [
  { number: 1, name: "Al-Fatiha", nameAr: "الفاتحة", ayahs: 7, revelation: "Meccan" },
  { number: 2, name: "Al-Baqarah", nameAr: "البقرة", ayahs: 286, revelation: "Medinan" },
  { number: 3, name: "Aal-e-Imran", nameAr: "آل عمران", ayahs: 200, revelation: "Medinan" },
  { number: 4, name: "An-Nisa", nameAr: "النساء", ayahs: 176, revelation: "Medinan" },
  { number: 5, name: "Al-Maidah", nameAr: "المائدة", ayahs: 120, revelation: "Medinan" },
  { number: 6, name: "Al-Anam", nameAr: "الأنعام", ayahs: 165, revelation: "Meccan" },
  { number: 7, name: "Al-Araf", nameAr: "الأعراف", ayahs: 206, revelation: "Meccan" },
  { number: 8, name: "Al-Anfal", nameAr: "الأنفال", ayahs: 75, revelation: "Medinan" },
  { number: 9, name: "At-Tawbah", nameAr: "التوبة", ayahs: 129, revelation: "Medinan" },
  { number: 10, name: "Yunus", nameAr: "يونس", ayahs: 109, revelation: "Meccan" },
  { number: 11, name: "Hud", nameAr: "هود", ayahs: 123, revelation: "Meccan" },
  { number: 12, name: "Yusuf", nameAr: "يوسف", ayahs: 111, revelation: "Meccan" },
  { number: 13, name: "Ar-Rad", nameAr: "الرعد", ayahs: 43, revelation: "Medinan" },
  { number: 14, name: "Ibrahim", nameAr: "إبراهيم", ayahs: 52, revelation: "Meccan" },
  { number: 15, name: "Al-Hijr", nameAr: "الحجر", ayahs: 99, revelation: "Meccan" },
  { number: 16, name: "An-Nahl", nameAr: "النحل", ayahs: 128, revelation: "Meccan" },
  { number: 17, name: "Al-Isra", nameAr: "الإسراء", ayahs: 111, revelation: "Meccan" },
  { number: 18, name: "Al-Kahf", nameAr: "الكهف", ayahs: 110, revelation: "Meccan" },
  { number: 19, name: "Maryam", nameAr: "مريم", ayahs: 98, revelation: "Meccan" },
  { number: 20, name: "Ta-Ha", nameAr: "طه", ayahs: 135, revelation: "Meccan" },
  { number: 21, name: "Al-Anbiya", nameAr: "الأنبياء", ayahs: 112, revelation: "Meccan" },
  { number: 22, name: "Al-Hajj", nameAr: "الحج", ayahs: 78, revelation: "Medinan" },
  { number: 23, name: "Al-Muminun", nameAr: "المؤمنون", ayahs: 118, revelation: "Meccan" },
  { number: 24, name: "An-Nur", nameAr: "النور", ayahs: 64, revelation: "Medinan" },
  { number: 25, name: "Al-Furqan", nameAr: "الفرقان", ayahs: 77, revelation: "Meccan" },
  { number: 26, name: "Ash-Shuara", nameAr: "الشعراء", ayahs: 227, revelation: "Meccan" },
  { number: 27, name: "An-Naml", nameAr: "النمل", ayahs: 93, revelation: "Meccan" },
  { number: 28, name: "Al-Qasas", nameAr: "القصص", ayahs: 88, revelation: "Meccan" },
  { number: 29, name: "Al-Ankabut", nameAr: "العنكبوت", ayahs: 69, revelation: "Meccan" },
  { number: 30, name: "Ar-Rum", nameAr: "الروم", ayahs: 60, revelation: "Meccan" },
  { number: 31, name: "Luqman", nameAr: "لقمان", ayahs: 34, revelation: "Meccan" },
  { number: 32, name: "As-Sajdah", nameAr: "السجدة", ayahs: 30, revelation: "Meccan" },
  { number: 33, name: "Al-Ahzab", nameAr: "الأحزاب", ayahs: 73, revelation: "Medinan" },
  { number: 34, name: "Saba", nameAr: "سبأ", ayahs: 54, revelation: "Meccan" },
  { number: 35, name: "Fatir", nameAr: "فاطر", ayahs: 45, revelation: "Meccan" },
  { number: 36, name: "Ya-Sin", nameAr: "يس", ayahs: 83, revelation: "Meccan" },
  { number: 37, name: "As-Saffat", nameAr: "الصافات", ayahs: 182, revelation: "Meccan" },
  { number: 38, name: "Sad", nameAr: "ص", ayahs: 88, revelation: "Meccan" },
  { number: 39, name: "Az-Zumar", nameAr: "الزمر", ayahs: 75, revelation: "Meccan" },
  { number: 40, name: "Ghafir", nameAr: "غافر", ayahs: 85, revelation: "Meccan" },
  { number: 41, name: "Fussilat", nameAr: "فصلت", ayahs: 54, revelation: "Meccan" },
  { number: 42, name: "Ash-Shura", nameAr: "الشورى", ayahs: 53, revelation: "Meccan" },
  { number: 43, name: "Az-Zukhruf", nameAr: "الزخرف", ayahs: 89, revelation: "Meccan" },
  { number: 44, name: "Ad-Dukhan", nameAr: "الدخان", ayahs: 59, revelation: "Meccan" },
  { number: 45, name: "Al-Jathiyah", nameAr: "الجاثية", ayahs: 37, revelation: "Meccan" },
  { number: 46, name: "Al-Ahqaf", nameAr: "الأحقاف", ayahs: 35, revelation: "Meccan" },
  { number: 47, name: "Muhammad", nameAr: "محمد", ayahs: 38, revelation: "Medinan" },
  { number: 48, name: "Al-Fath", nameAr: "الفتح", ayahs: 29, revelation: "Medinan" },
  { number: 49, name: "Al-Hujurat", nameAr: "الحجرات", ayahs: 18, revelation: "Medinan" },
  { number: 50, name: "Qaf", nameAr: "ق", ayahs: 45, revelation: "Meccan" },
  { number: 51, name: "Adh-Dhariyat", nameAr: "الذاريات", ayahs: 60, revelation: "Meccan" },
  { number: 52, name: "At-Tur", nameAr: "الطور", ayahs: 49, revelation: "Meccan" },
  { number: 53, name: "An-Najm", nameAr: "النجم", ayahs: 62, revelation: "Meccan" },
  { number: 54, name: "Al-Qamar", nameAr: "القمر", ayahs: 55, revelation: "Meccan" },
  { number: 55, name: "Ar-Rahman", nameAr: "الرحمن", ayahs: 78, revelation: "Medinan" },
  { number: 56, name: "Al-Waqiah", nameAr: "الواقعة", ayahs: 96, revelation: "Meccan" },
  { number: 57, name: "Al-Hadid", nameAr: "الحديد", ayahs: 29, revelation: "Medinan" },
  { number: 58, name: "Al-Mujadila", nameAr: "المجادلة", ayahs: 22, revelation: "Medinan" },
  { number: 59, name: "Al-Hashr", nameAr: "الحشر", ayahs: 24, revelation: "Medinan" },
  { number: 60, name: "Al-Mumtahanah", nameAr: "الممتحنة", ayahs: 13, revelation: "Medinan" },
  { number: 61, name: "As-Saff", nameAr: "الصف", ayahs: 14, revelation: "Medinan" },
  { number: 62, name: "Al-Jumuah", nameAr: "الجمعة", ayahs: 11, revelation: "Medinan" },
  { number: 63, name: "Al-Munafiqun", nameAr: "المنافقون", ayahs: 11, revelation: "Medinan" },
  { number: 64, name: "At-Taghabun", nameAr: "التغابن", ayahs: 18, revelation: "Medinan" },
  { number: 65, name: "At-Talaq", nameAr: "الطلاق", ayahs: 12, revelation: "Medinan" },
  { number: 66, name: "At-Tahrim", nameAr: "التحريم", ayahs: 12, revelation: "Medinan" },
  { number: 67, name: "Al-Mulk", nameAr: "الملك", ayahs: 30, revelation: "Meccan" },
  { number: 68, name: "Al-Qalam", nameAr: "القلم", ayahs: 52, revelation: "Meccan" },
  { number: 69, name: "Al-Haqqah", nameAr: "الحاقة", ayahs: 52, revelation: "Meccan" },
  { number: 70, name: "Al-Maarij", nameAr: "المعارج", ayahs: 44, revelation: "Meccan" },
  { number: 71, name: "Nuh", nameAr: "نوح", ayahs: 28, revelation: "Meccan" },
  { number: 72, name: "Al-Jinn", nameAr: "الجن", ayahs: 28, revelation: "Meccan" },
  { number: 73, name: "Al-Muzzammil", nameAr: "المزمل", ayahs: 20, revelation: "Meccan" },
  { number: 74, name: "Al-Muddaththir", nameAr: "المدثر", ayahs: 56, revelation: "Meccan" },
  { number: 75, name: "Al-Qiyamah", nameAr: "القيامة", ayahs: 40, revelation: "Meccan" },
  { number: 76, name: "Al-Insan", nameAr: "الإنسان", ayahs: 31, revelation: "Medinan" },
  { number: 77, name: "Al-Mursalat", nameAr: "المرسلات", ayahs: 50, revelation: "Meccan" },
  { number: 78, name: "An-Naba", nameAr: "النبأ", ayahs: 40, revelation: "Meccan" },
  { number: 79, name: "An-Naziat", nameAr: "النازعات", ayahs: 46, revelation: "Meccan" },
  { number: 80, name: "Abasa", nameAr: "عبس", ayahs: 42, revelation: "Meccan" },
  { number: 81, name: "At-Takwir", nameAr: "التكوير", ayahs: 29, revelation: "Meccan" },
  { number: 82, name: "Al-Infitar", nameAr: "الإنفطار", ayahs: 19, revelation: "Meccan" },
  { number: 83, name: "Al-Mutaffifin", nameAr: "المطففين", ayahs: 36, revelation: "Meccan" },
  { number: 84, name: "Al-Inshiqaq", nameAr: "الإنشقاق", ayahs: 25, revelation: "Meccan" },
  { number: 85, name: "Al-Buruj", nameAr: "البروج", ayahs: 22, revelation: "Meccan" },
  { number: 86, name: "At-Tariq", nameAr: "الطارق", ayahs: 17, revelation: "Meccan" },
  { number: 87, name: "Al-Ala", nameAr: "الأعلى", ayahs: 19, revelation: "Meccan" },
  { number: 88, name: "Al-Ghashiyah", nameAr: "الغاشية", ayahs: 26, revelation: "Meccan" },
  { number: 89, name: "Al-Fajr", nameAr: "الفجر", ayahs: 30, revelation: "Meccan" },
  { number: 90, name: "Al-Balad", nameAr: "البلد", ayahs: 20, revelation: "Meccan" },
  { number: 91, name: "Ash-Shams", nameAr: "الشمس", ayahs: 15, revelation: "Meccan" },
  { number: 92, name: "Al-Lail", nameAr: "الليل", ayahs: 21, revelation: "Meccan" },
  { number: 93, name: "Ad-Duha", nameAr: "الضحى", ayahs: 11, revelation: "Meccan" },
  { number: 94, name: "Ash-Sharh", nameAr: "الشرح", ayahs: 8, revelation: "Meccan" },
  { number: 95, name: "At-Tin", nameAr: "التين", ayahs: 8, revelation: "Meccan" },
  { number: 96, name: "Al-Alaq", nameAr: "العلق", ayahs: 19, revelation: "Meccan" },
  { number: 97, name: "Al-Qadr", nameAr: "القدر", ayahs: 5, revelation: "Meccan" },
  { number: 98, name: "Al-Bayyinah", nameAr: "البينة", ayahs: 8, revelation: "Medinan" },
  { number: 99, name: "Az-Zalzalah", nameAr: "الزلزلة", ayahs: 8, revelation: "Medinan" },
  { number: 100, name: "Al-Adiyat", nameAr: "العاديات", ayahs: 11, revelation: "Meccan" },
  { number: 101, name: "Al-Qariah", nameAr: "القارعة", ayahs: 11, revelation: "Meccan" },
  { number: 102, name: "At-Takathur", nameAr: "التكاثر", ayahs: 8, revelation: "Meccan" },
  { number: 103, name: "Al-Asr", nameAr: "العصر", ayahs: 3, revelation: "Meccan" },
  { number: 104, name: "Al-Humazah", nameAr: "الهمزة", ayahs: 9, revelation: "Meccan" },
  { number: 105, name: "Al-Fil", nameAr: "الفيل", ayahs: 5, revelation: "Meccan" },
  { number: 106, name: "Quraish", nameAr: "قريش", ayahs: 4, revelation: "Meccan" },
  { number: 107, name: "Al-Maun", nameAr: "الماعون", ayahs: 7, revelation: "Meccan" },
  { number: 108, name: "Al-Kawthar", nameAr: "الكوثر", ayahs: 3, revelation: "Meccan" },
  { number: 109, name: "Al-Kafirun", nameAr: "الكافرون", ayahs: 6, revelation: "Meccan" },
  { number: 110, name: "An-Nasr", nameAr: "النصر", ayahs: 3, revelation: "Medinan" },
  { number: 111, name: "Al-Masad", nameAr: "المسد", ayahs: 5, revelation: "Meccan" },
  { number: 112, name: "Al-Ikhlas", nameAr: "الإخلاص", ayahs: 4, revelation: "Meccan" },
  { number: 113, name: "Al-Falaq", nameAr: "الفلق", ayahs: 5, revelation: "Meccan" },
  { number: 114, name: "An-Nas", nameAr: "الناس", ayahs: 6, revelation: "Meccan" },
];

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
