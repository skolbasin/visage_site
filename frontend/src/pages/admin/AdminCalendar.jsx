import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import AppointmentFormModal from '../../components/admin/AppointmentFormModal';
import {
  TYPE_COLORS,
  formatMoney,
  formatTimeRange,
  typeLabel,
} from '../../data/calendarConstants';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}

export default function AdminCalendar() {
  const calendarRef = useRef(null);
  const isMobile = useIsMobile();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [defaultStartsAt, setDefaultStartsAt] = useState(null);
  const [range, setRange] = useState(null);

  const fetchAppointments = useCallback(async (from, to) => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get('/admin/calendar/appointments', { params });
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (range) {
      fetchAppointments(range.from, range.to);
    }
  }, [range, fetchAppointments]);

  const events = useMemo(
    () =>
      appointments.map((a) => {
        const people = a.people_count || 1 + (a.guests?.length || 0);
        const suffix = people > 1 ? ` · ${people} чел.` : '';
        return {
          id: String(a.id),
          title: `${a.name} · ${typeLabel(a.appointment_type)}${suffix}`,
          start: a.starts_at,
          end: a.ends_at,
          backgroundColor: TYPE_COLORS[a.appointment_type] || '#4a7c59',
          borderColor: TYPE_COLORS[a.appointment_type] || '#4a7c59',
          extendedProps: { appointment: a },
        };
      }),
    [appointments]
  );

  const openCreate = (startsAt) => {
    setEditing(null);
    setDefaultStartsAt(startsAt || new Date());
    setModalOpen(true);
  };

  const openEdit = (appointment) => {
    setEditing(appointment);
    setDefaultStartsAt(null);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/admin/calendar/appointments/${editing.id}`, payload);
      } else {
        await api.post('/admin/calendar/appointments', payload);
      }
      setModalOpen(false);
      if (range) await fetchAppointments(range.from, range.to);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (!confirm('Удалить запись? Это действие нельзя отменить.')) return;
    setSaving(true);
    try {
      await api.delete(`/admin/calendar/appointments/${editing.id}`);
      setModalOpen(false);
      if (range) await fetchAppointments(range.from, range.to);
    } catch (err) {
      console.error(err);
      alert('Не удалось удалить запись');
    } finally {
      setSaving(false);
    }
  };

  const headerToolbar = isMobile
    ? {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      }
    : {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      };

  const initialView = isMobile ? 'listWeek' : 'timeGridWeek';
  const buttonText = {
    today: 'Сегодня',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    list: 'Список',
  };

  return (
    <div className="px-0 sm:px-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Календарь</h1>
          <p className="text-sm text-gray-500 mt-1">
            Записи клиентов для ведения расписания и аналитики
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreate(new Date())}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#4a7c59] text-white hover:bg-[#3d6849] transition"
        >
          <Plus size={18} />
          Новая запись
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sm:p-4 relative admin-calendar">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-xl">
            <div className="w-8 h-8 border-4 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <FullCalendar
          key={isMobile ? 'mobile' : 'desktop'}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={initialView}
          locale={ruLocale}
          headerToolbar={headerToolbar}
          buttonText={buttonText}
          height="auto"
          contentHeight="auto"
          stickyHeaderDates
          nowIndicator
          selectable
          selectMirror
          editable={false}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          weekends
          events={events}
          datesSet={(arg) => {
            setRange({
              from: arg.start.toISOString(),
              to: arg.end.toISOString(),
            });
          }}
          select={(info) => {
            openCreate(info.start);
          }}
          dateClick={(info) => {
            if (info.view.type.startsWith('dayGrid')) {
              openCreate(info.date);
            }
          }}
          eventClick={(info) => {
            openEdit(info.event.extendedProps.appointment);
          }}
          eventContent={(arg) => {
            const a = arg.event.extendedProps.appointment;
            const timeRange = formatTimeRange(a.starts_at, a.ends_at);
            const price = a.total_price ?? a.price;
            const people = a.people_count || 1 + (a.guests?.length || 0);
            return (
              <div className="px-1 py-0.5 overflow-hidden text-[11px] sm:text-xs leading-tight">
                <div className="font-medium truncate">{timeRange}</div>
                <div className="truncate">
                  {a.name} · {typeLabel(a.appointment_type)}
                  {people > 1 ? ` · ${people} чел.` : ''}
                </div>
                {price != null && Number(price) > 0 && (
                  <div className="opacity-90 truncate">{formatMoney(price)}</div>
                )}
              </div>
            );
          }}
        />
      </div>

      <AppointmentFormModal
        open={modalOpen}
        initial={editing}
        defaultStartsAt={defaultStartsAt}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={editing ? handleDelete : undefined}
        saving={saving}
      />

      <style>{`
        .admin-calendar .fc {
          font-family: inherit;
        }
        .admin-calendar .fc .fc-button {
          background: #4a7c59;
          border-color: #4a7c59;
          text-transform: capitalize;
          font-weight: 500;
          box-shadow: none;
        }
        .admin-calendar .fc .fc-button:hover {
          background: #3d6849;
          border-color: #3d6849;
        }
        .admin-calendar .fc .fc-button-primary:not(:disabled).fc-button-active,
        .admin-calendar .fc .fc-button-primary:not(:disabled):active {
          background: #345a3f;
          border-color: #345a3f;
        }
        .admin-calendar .fc .fc-toolbar-title {
          font-size: 1.1rem;
          font-weight: 600;
        }
        @media (max-width: 640px) {
          .admin-calendar .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
          }
          .admin-calendar .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.25rem;
          }
          .admin-calendar .fc .fc-toolbar-title {
            font-size: 1rem;
            text-align: center;
          }
          .admin-calendar .fc .fc-button {
            padding: 0.35rem 0.55rem;
            font-size: 0.75rem;
          }
        }
        .admin-calendar .fc-event {
          cursor: pointer;
          border-radius: 4px;
        }
        .admin-calendar .fc-timegrid-event .fc-event-main {
          padding: 2px 0;
        }
      `}</style>
    </div>
  );
}
