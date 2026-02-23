"use client";

import React, { useMemo } from "react";
import { useGetDailyProgressQuery } from "@/store/api/userProgressApi";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  return new Date(d.getTime() + days * DAY_MS);
}

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Monday=0 .. Sunday=6
function weekdayMon0(d: Date) {
  const js = d.getDay(); // Sunday=0
  return (js + 6) % 7;
}

function monthShort(d: Date) {
  return d.toLocaleString(undefined, { month: "short" });
}

function dateLong(d: Date) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function intensityClass(level: 0 | 1 | 2 | 3 | 4) {
  switch (level) {
    case 0:
      return "bg-gray-100 dark:bg-gray-800";
    case 1:
      return "bg-brand-100 dark:bg-brand-900/35";
    case 2:
      return "bg-brand-200 dark:bg-brand-800/45";
    case 3:
      return "bg-brand-400 dark:bg-brand-700/60";
    case 4:
      return "bg-brand-600 dark:bg-brand-500";
  }
}

export default function PracticeHeatmap({
  userId,
  days = 365,
}: {
  userId: string;
  days?: number;
}) {
  const { data: dailyRaw, isLoading } = useGetDailyProgressQuery(userId, {
    skip: !userId,
  });

  const {
    weeks,
    monthMarkers,
    maxCount,
    totalDaysActive,
  } = useMemo(() => {
    const end = startOfDay(new Date());
    const start = addDays(end, -(days - 1));

    // Pull into map: yyyy-mm-dd -> sessionsCompleted
    const map = new Map<string, number>();
    (dailyRaw ?? []).forEach((x) => {
      if (!x?.date) return;
      // backend may return ISO; normalize to date-only in local time
      const d = startOfDay(new Date(x.date));
      const key = formatYMD(d);
      map.set(key, (map.get(key) ?? 0) + (x.sessionsCompleted ?? 0));
    });

    // Align grid to Monday like GitHub style label rows (Mon/Wed/Fri)
    const gridStart = addDays(start, -weekdayMon0(start));
    const gridEnd = addDays(end, 6 - weekdayMon0(end));

    const totalCells = Math.round((gridEnd.getTime() - gridStart.getTime()) / DAY_MS) + 1;
    const totalWeeks = Math.ceil(totalCells / 7);

    let max = 0;
    let active = 0;

    // Build weeks: array of columns, each has 7 days (row)
    const weeksOut: Array<
      Array<{
        date: Date;
        inRange: boolean;
        count: number;
      }>
    > = [];

    for (let w = 0; w < totalWeeks; w++) {
      const col: Array<{ date: Date; inRange: boolean; count: number }> = [];
      for (let r = 0; r < 7; r++) {
        const d = addDays(gridStart, w * 7 + r);
        const inRange = d >= start && d <= end;
        const key = formatYMD(d);
        const count = inRange ? map.get(key) ?? 0 : 0;
        if (inRange) {
          max = Math.max(max, count);
          if (count > 0) active += 1;
        }
        col.push({ date: d, inRange, count });
      }
      weeksOut.push(col);
    }

    // Month markers: first week column index where a month starts
    const markers: Array<{ label: string; weekIndex: number }> = [];
    let prevMonth = -1;
    for (let w = 0; w < weeksOut.length; w++) {
      // use the top cell's date (Monday) to decide month boundaries
      const d = weeksOut[w][0].date;
      const m = d.getMonth();
      if (m !== prevMonth) {
        markers.push({ label: monthShort(d), weekIndex: w });
        prevMonth = m;
      }
    }

    return {
      weeks: weeksOut,
      monthMarkers: markers,
      maxCount: max,
      totalDaysActive: active,
    };
  }, [dailyRaw, days]);

  const legendLevels: Array<0 | 1 | 2 | 3 | 4> = [0, 1, 2, 3, 4];

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {isLoading ? "Đang tải lịch luyện tập..." : `${totalDaysActive} ngày luyện tập trong 12 tháng gần nhất`}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Mỗi ô là 1 ngày. Màu đậm hơn nghĩa là bạn luyện nhiều hơn.
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {legendLevels.map((lvl) => (
              <span
                key={lvl}
                className={`h-3 w-3 rounded-sm ${intensityClass(lvl)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {/* Month labels */}
        <div className="relative h-5 min-w-fit">
          {monthMarkers.map((m) => (
            <span
              key={`${m.label}-${m.weekIndex}`}
              className="absolute text-[11px] text-gray-500 dark:text-gray-400"
              style={{ left: m.weekIndex * 16 }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex min-w-fit gap-3">
          {/* Day labels */}
          <div className="flex flex-col gap-1 py-[0px] text-[11px] text-gray-500 dark:text-gray-400">
            {/* Align to 7 rows (Mon..Sun) but only show Mon/Wed/Fri like GitHub */}
            <span className="h-3 leading-3">Mon</span>
            <span className="h-3 leading-3">&nbsp;</span>
            <span className="h-3 leading-3">Wed</span>
            <span className="h-3 leading-3">&nbsp;</span>
            <span className="h-3 leading-3">Fri</span>
            <span className="h-3 leading-3">&nbsp;</span>
            <span className="h-3 leading-3">&nbsp;</span>
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((cell, rowIndex) => {
                  // show labels aligned to Mon/Wed/Fri rows only; keep squares always
                  const level: 0 | 1 | 2 | 3 | 4 = (() => {
                    if (!cell.inRange) return 0;
                    if (cell.count <= 0) return 0;
                    if (maxCount <= 1) return 4;
                    const ratio = cell.count / maxCount;
                    const scaled = Math.min(4, Math.max(1, Math.ceil(ratio * 4)));
                    return scaled as 1 | 2 | 3 | 4;
                  })();

                  const shouldDim = !cell.inRange;
                  const title = cell.inRange
                    ? `${cell.count} session${cell.count === 1 ? "" : "s"} • ${dateLong(cell.date)}`
                    : "";

                  // Hide weekend labels in the left column already; squares stay.
                  void rowIndex;

                  return (
                    <span
                      key={`${weekIndex}-${rowIndex}`}
                      title={title}
                      className={[
                        "h-3 w-3 rounded-sm",
                        intensityClass(level),
                        shouldDim ? "opacity-0" : "",
                      ].join(" ")}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

