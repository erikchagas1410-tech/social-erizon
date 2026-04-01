import { CalendarBoard } from "@/components/calendar/CalendarBoard";
import { CalendarQueue } from "@/components/calendar/CalendarQueue";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { getCalendarPosts, getMonthBounds } from "@/lib/calendar";
import { navGroups } from "@/lib/command-center-data";

export const dynamic = "force-dynamic";

type CalendarPageProps = {
  searchParams?: Promise<{
    month?: string;
  }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = (await searchParams) ?? {};
  const today = new Date();
  const monthParam = params.month;
  const parsed = monthParam ? new Date(`${monthParam}-01T00:00:00`) : today;
  const baseDate = Number.isNaN(parsed.getTime()) ? today : parsed;
  const year = baseDate.getFullYear();
  const monthIndex = baseDate.getMonth();
  const { monthStart, monthEnd } = getMonthBounds(year, monthIndex);
  const posts = await getCalendarPosts(
    monthStart.toISOString(),
    monthEnd.toISOString()
  );
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(baseDate);
  const days = buildCalendarDays(year, monthIndex, posts);
  const prevMonth = formatMonthParam(new Date(year, monthIndex - 1, 1));
  const nextMonth = formatMonthParam(new Date(year, monthIndex + 1, 1));

  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />
        <section className="main-shell">
          <TopHeader
            title="Calendario"
            subtitle="Visao temporal da operacao e da distribuicao editorial"
          />

          <div className="calendar-toolbar">
            <a className="ghost-button" href={`/calendar?month=${prevMonth}`}>
              Mes anterior
            </a>
            <span className="calendar-toolbar__label">{monthLabel}</span>
            <a className="ghost-button" href={`/calendar?month=${nextMonth}`}>
              Proximo mes
            </a>
          </div>

          <CalendarBoard monthLabel={monthLabel} days={days} />
          <CalendarQueue posts={posts} />
        </section>
      </div>
    </main>
  );
}

function buildCalendarDays(
  year: number,
  monthIndex: number,
  posts: Awaited<ReturnType<typeof getCalendarPosts>>
) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const leadingSlots = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const today = new Date();
  const cells: Array<{
    key: string;
    label: number | null;
    isoDate: string | null;
    isCurrentMonth: boolean;
    isToday: boolean;
    posts: Awaited<ReturnType<typeof getCalendarPosts>>;
  }> = [];

  for (let index = 0; index < leadingSlots; index += 1) {
    cells.push({
      key: `leading-${index}`,
      label: null,
      isoDate: null,
      isCurrentMonth: false,
      isToday: false,
      posts: []
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const isoDate = `${monthKey}-${String(day).padStart(2, "0")}`;
    const dayPosts = posts.filter(
      (post) => post.scheduledFor.slice(0, 10) === isoDate
    );

    cells.push({
      key: isoDate,
      label: day,
      isoDate,
      isCurrentMonth: true,
      isToday:
        today.getFullYear() === year &&
        today.getMonth() === monthIndex &&
        today.getDate() === day,
      posts: dayPosts
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      key: `trailing-${cells.length}`,
      label: null,
      isoDate: null,
      isCurrentMonth: false,
      isToday: false,
      posts: []
    });
  }

  return cells;
}

function formatMonthParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
