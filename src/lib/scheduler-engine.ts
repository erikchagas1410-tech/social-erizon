import { ContentFormat, ContentPillar, PublicationChannel } from "@/types/content";
import { TrendSignal, ViralVariant, WeeklyScheduleSlot } from "@/types/super-agent";

const WEEK_DAYS = [
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
  "Domingo"
];

export function buildWeeklySchedule(params: {
  trend: TrendSignal | null;
  variants: ViralVariant[];
}): WeeklyScheduleSlot[] {
  const leadVariant = params.variants[0];
  const fallbackPillar: ContentPillar = params.trend?.recommendedPillar ?? "autoridade";
  const fallbackFormat: ContentFormat = params.trend?.recommendedFormat ?? "carrossel";

  return WEEK_DAYS.map((day, index) => {
    const isWeekend = index >= 5;
    const format = pickFormatForDay(index, fallbackFormat);
    const pillar = pickPillarForDay(index, fallbackPillar);
    const time = pickTimeForDay(index);
    const channels = pickChannelsForDay(isWeekend, leadVariant?.recommendedChannels);

    return {
      day,
      time,
      format,
      pillar,
      objective: buildObjective(day, format, params.trend?.topic),
      channels,
      reason: buildReason(day, time, format, channels)
    };
  });
}

function pickFormatForDay(index: number, fallback: ContentFormat): ContentFormat {
  const formats: ContentFormat[] = [
    fallback,
    "post_de_decisao",
    "comparacao",
    "analise",
    "carrossel",
    "provocacao",
    "frase_impacto"
  ];

  return formats[index] ?? fallback;
}

function pickPillarForDay(index: number, fallback: ContentPillar): ContentPillar {
  const pillars: ContentPillar[] = [
    fallback,
    "educacao",
    "prova",
    "autoridade",
    "desejo",
    "conexao",
    "conversao_indireta"
  ];

  return pillars[index] ?? fallback;
}

function pickTimeForDay(index: number) {
  const times = ["08:12", "12:18", "07:47", "18:24", "11:36", "10:08", "19:12"];
  return times[index] ?? "12:00";
}

function pickChannelsForDay(isWeekend: boolean, preferred?: PublicationChannel[]) {
  if (preferred?.length) {
    return preferred;
  }

  return isWeekend ? (["instagram"] satisfies PublicationChannel[]) : (["linkedin", "instagram"] satisfies PublicationChannel[]);
}

function buildObjective(day: string, format: ContentFormat, topic?: string) {
  return `${day}: usar ${format} para tensionar ${topic?.toLowerCase() ?? "uma dor operacional"} e puxar share/save.`;
}

function buildReason(
  day: string,
  time: string,
  format: ContentFormat,
  channels: PublicationChannel[]
) {
  return `${day} as ${time} favorece consumo de ${format} com mais contexto e chance de distribuicao em ${channels.join(" + ")}.`;
}

