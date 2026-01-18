import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Session, Project } from "@/types";

interface CalendarProps {
  sessions: Session[];
  projects?: Project[]; // Proyectos para obtener el stack
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  sessions,
  projects = [],
  onDateSelect,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Get session stacks for a specific date
  const getStacksForDate = (date: Date): string[] => {
    const sessionsOnDate = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === checkDate.getTime();
    });

    const stacks = sessionsOnDate
      .map((session) => {
        const project = projects.find((p) => p.id === session.projectId);
        return project?.stack || "";
      })
      .filter((stack) => stack);

    // Return unique stacks
    return Array.from(new Set(stacks));
  };

  // Get border color class based on stacks
  const getBorderClass = (stacks: string[]): string => {
    if (stacks.length === 0) return "";

    if (stacks.length === 1) {
      switch (stacks[0]) {
        case "Frontend":
          return "border-[#069a9a]"; // Cyan oscuro
        case "Backend":
          return "border-[#ff5da2]"; // Rosa
        case "Fullstack":
          return "border-[#a16ee4]"; // Lila
        default:
          return "border-[#069a9a]";
      }
    }

    // Multiple stacks - return multiple classes for gradient effect
    return "border-cyan"; // Default to cyan for multiple
  };

  // Get gradient style for multiple stacks
  const getGradientStyle = (
    stacks: string[]
  ): React.CSSProperties | undefined => {
    if (stacks.length <= 1) return undefined;

    const hasFrontend = stacks.includes("Frontend");
    const hasBackend = stacks.includes("Backend");
    const hasFullstack = stacks.includes("Fullstack");

    let gradient = "";

    if (hasFrontend && hasBackend && hasFullstack) {
      gradient =
        "linear-gradient(135deg, #069a9a 0%, #ff5da2 50%, #a16ee4 100%)";
    } else if (hasFrontend && hasBackend) {
      gradient = "linear-gradient(135deg, #069a9a 0%, #ff5da2 100%)";
    } else if (hasFrontend && hasFullstack) {
      gradient = "linear-gradient(135deg, #069a9a 0%, #a16ee4 100%)";
    } else if (hasBackend && hasFullstack) {
      gradient = "linear-gradient(135deg, #ff5da2 0%, #a16ee4 100%)";
    }

    if (gradient) {
      return {
        borderWidth: "2px",
        borderStyle: "solid",
        borderImage: `${gradient} 1`,
      };
    }

    return undefined;
  };

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Previous month's last days
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      sessionCount: number;
      stacks: string[];
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        sessionCount: 0,
        stacks: [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate
        ? date.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0)
        : false;

      // Get stacks for this day
      const stacks = getStacksForDate(date);
      const sessionCount =
        stacks.length > 0
          ? sessions.filter((session) => {
              const sessionDate = new Date(session.date);
              sessionDate.setHours(0, 0, 0, 0);
              return sessionDate.getTime() === date.getTime();
            }).length
          : 0;

      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        isSelected,
        sessionCount,
        stacks,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        sessionCount: 0,
        stacks: [],
      });
    }

    return days;
  }, [currentMonth, sessions, selectedDate]);

  const goToPrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (date: Date, isCurrentMonth: boolean, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isCurrentMonth && onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="bg-[var(--color-dark-card)] rounded-lg border border-[#4ad3e5]/30 p-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrevMonth();
          }}
          className="p-1.5 hover:bg-[#1a1f2e] rounded transition-colors text-[#4ad3e5] hover:text-[#65dde6]"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h3 className="text-xs font-semibold text-light capitalize">
          {monthNames[currentMonth.getMonth()].slice(0, 3)} {currentMonth.getFullYear()}
        </h3>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNextMonth();
          }}
          className="p-1.5 hover:bg-[#1a1f2e] rounded transition-colors text-[#4ad3e5] hover:text-[#65dde6]"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-[#8fa6bc]"
          >
            {day.slice(0, 1)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((item, index) => {
          const hasSession = item.sessionCount > 0;
          const borderClass =
            hasSession && item.isCurrentMonth
              ? getBorderClass(item.stacks)
              : "";
          const gradientStyle =
            hasSession && item.isCurrentMonth
              ? getGradientStyle(item.stacks)
              : undefined;

          return (
            <button
              key={index}
              onClick={(e) => handleDateClick(item.date, item.isCurrentMonth, e)}
              disabled={!item.isCurrentMonth}
              style={gradientStyle}
              className={`
                relative aspect-square rounded text-[10px] font-medium transition-all
                ${
                  item.isCurrentMonth
                    ? "hover:bg-[#1a1f2e]"
                    : "text-[#4a5568] cursor-not-allowed opacity-50"
                }
                ${
                  item.isToday
                    ? "bg-[#4ad3e5] text-[#13161d] font-semibold hover:bg-[#65dde6]"
                    : hasSession && borderClass && !gradientStyle
                    ? `border ${borderClass} ${
                        borderClass === 'border-[#069a9a]'
                          ? 'bg-[#4ad3e5] text-[#13161d]'
                          : 'bg-[var(--color-dark-bg)] text-light'
                      }`
                    : gradientStyle
                    ? "bg-[var(--color-dark-bg)] text-light"
                    : item.isCurrentMonth
                    ? "bg-transparent border border-transparent text-light"
                    : "bg-transparent border border-transparent"
                }
                ${item.isSelected ? "ring-1 ring-[#ff5da2]" : ""}
              `}
            >
              <span className="block text-center leading-none">{item.day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
