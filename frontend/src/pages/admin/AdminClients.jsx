import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, CalendarDays } from 'lucide-react';
import api from '../../services/api';
import { APPOINTMENT_TYPES, formatMoney, typeLabel } from '../../data/calendarConstants';

const emptyForm = {
  name: '', age: '', phone: '', instagram: '', email: '', other_contacts: '', events: [],
};

function toLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [emailFilter, setEmailFilter] = useState('all');
  const [instagramFilter, setInstagramFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (emailFilter !== 'all') params.has_email = emailFilter === 'yes';
      if (instagramFilter !== 'all') params.has_instagram = instagramFilter === 'yes';
      const { data } = await api.get('/admin/clients', { params });
      setClients(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось загрузить базу клиентов');
    } finally {
      setLoading(false);
    }
  }, [search, emailFilter, instagramFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(fetchClients, 250);
    return () => window.clearTimeout(timeout);
  }, [fetchClients]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const term = search.trim().toLowerCase();
    return clients.filter((client) => [client.name, client.phone, client.email, client.instagram, client.other_contacts]
      .some((value) => String(value || '').toLowerCase().includes(term)));
  }, [clients, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({
      name: client.name || '', age: client.age ?? '', phone: client.phone || '',
      instagram: client.instagram || '', email: client.email || '', other_contacts: client.other_contacts || '',
      events: (client.events || []).map((event) => ({
        id: event.id, event_type: event.event_type, event_date: toLocalInput(event.event_date), cost: event.cost ?? '', comment: event.comment || '',
      })),
    });
    setError('');
    setFormOpen(true);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Укажите имя клиента';
    if (!form.phone.trim()) return 'Укажите номер телефона';
    if (!form.email.trim()) return 'Укажите email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Укажите корректный email';
    if (form.age !== '' && (!Number.isInteger(Number(form.age)) || Number(form.age) < 0 || Number(form.age) > 120)) return 'Укажите корректный возраст';
    for (const item of form.events) {
      if (!item.event_date) return 'Укажите дату для каждого события';
      if (item.cost !== '' && (Number(item.cost) < 0 || Number.isNaN(Number(item.cost)))) return 'Укажите корректную стоимость события';
    }
    return '';
  };

  const save = async (event) => {
    event.preventDefault();
    const message = validate();
    if (message) { setError(message); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(), age: form.age === '' ? null : Number(form.age), phone: form.phone.trim(),
        instagram: form.instagram.trim() || null, email: form.email.trim(), other_contacts: form.other_contacts.trim() || null,
      };
      let client;
      if (editing) {
        ({ data: client } = await api.patch(`/admin/clients/${editing.id}`, payload));
      } else {
        payload.events = form.events.map((item) => ({
          event_type: item.event_type,
          event_date: new Date(item.event_date).toISOString(),
          cost: item.cost === '' ? null : Number(item.cost),
          comment: item.comment.trim() || null,
        })).filter((item) => item.event_date);
        ({ data: client } = await api.post('/admin/clients', payload));
      }

      if (editing) {
        const keptIds = new Set(form.events.filter((item) => item.id).map((item) => item.id));
        for (const item of (editing.events || []).filter((event) => !keptIds.has(event.id))) {
          await api.delete(`/admin/clients/${client.id}/events/${item.id}`);
        }
        for (const item of form.events.filter((item) => item.id)) {
          await api.patch(`/admin/clients/${client.id}/events/${item.id}`, {
            event_type: item.event_type,
            event_date: new Date(item.event_date).toISOString(),
            cost: item.cost === '' ? null : Number(item.cost),
            comment: item.comment.trim() || null,
          });
        }
        const newEvents = form.events.filter((item) => !item.id);
        for (const item of newEvents) {
          await api.post(`/admin/clients/${client.id}/events`, {
            event_type: item.event_type,
            event_date: new Date(item.event_date).toISOString(),
            cost: item.cost === '' ? null : Number(item.cost),
            comment: item.comment.trim() || null,
          });
        }
      }
      setFormOpen(false);
      await fetchClients();
      if (detail?.id) {
        const { data } = await api.get(`/admin/clients/${detail.id}`);
        setDetail(data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось сохранить клиента');
    } finally {
      setSaving(false);
    }
  };

  const removeClient = async (client) => {
    if (!confirm(`Удалить клиента «${client.name || 'Без имени'}» и все его события?`)) return;
    try {
      await api.delete(`/admin/clients/${client.id}`);
      setDetail((current) => current?.id === client.id ? null : current);
      await fetchClients();
    } catch (err) {
      alert(err.response?.data?.detail || 'Не удалось удалить клиента');
    }
  };

  const removeEvent = async (eventId) => {
    if (!detail || !confirm('Удалить это событие?')) return;
    try {
      const { data } = await api.delete(`/admin/clients/${detail.id}/events/${eventId}`);
      setDetail(data);
      await fetchClients();
    } catch (err) {
      alert(err.response?.data?.detail || 'Не удалось удалить событие');
    }
  };

  const addFormEvent = () => setForm((current) => ({
    ...current,
    events: [...current.events, { event_type: 'makeup', event_date: toLocalInput(new Date()), cost: '', comment: '' }],
  }));

  const updateFormEvent = (index, field, value) => setForm((current) => ({
    ...current,
    events: current.events.map((item, i) => i === index ? { ...item, [field]: value } : item),
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-800">База клиентов</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#4a7c59] text-white px-4 py-2 rounded-lg hover:bg-[#3d6b4f]">
          <Plus size={18} /> <span className="hidden sm:inline">Добавить клиента</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по имени, телефону, почте или Instagram"
            className="w-full border rounded-lg pl-10 pr-3 py-2" />
        </div>
        <select value={emailFilter} onChange={(e) => { setEmailFilter(e.target.value); }} className="border rounded-lg px-3 py-2">
          <option value="all">Email: все</option><option value="yes">Есть email</option><option value="no">Без email</option>
        </select>
        <select value={instagramFilter} onChange={(e) => setInstagramFilter(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="all">Instagram: все</option><option value="yes">Есть Instagram</option><option value="no">Без Instagram</option>
        </select>
        {(emailFilter !== 'all' || instagramFilter !== 'all') && (
          <button onClick={() => { setEmailFilter('all'); setInstagramFilter('all'); fetchClients(); }} className="text-sm text-gray-600 underline">Сбросить</button>
        )}
      </div>

      {loading ? <div className="text-center py-20 text-gray-500">Загрузка...</div> : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Имя</th>
              <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Телефон</th>
              <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Instagram</th>
              <th className="px-6 py-3 text-right text-xs uppercase text-gray-500">Действия</th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map((client) => (
                <tr key={client.id} onClick={() => setDetail(client)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 font-medium text-gray-900">{client.name || 'Без имени'}</td>
                  <td className="px-6 py-4 text-gray-600">{client.phone || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{client.email || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{client.instagram || '—'}</td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(client)} className="p-2 text-gray-500 hover:text-[#4a7c59]" title="Редактировать"><Pencil size={17} /></button>
                    <button onClick={() => removeClient(client)} className="p-2 text-gray-500 hover:text-red-600" title="Удалить"><Trash2 size={17} /></button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Клиенты не найдены</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-serif">{editing ? 'Редактирование клиента' : 'Новый клиент'}</h2>
              <button onClick={() => setFormOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-5">
              {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3">{error}</div>}
              <div className="grid md:grid-cols-2 gap-4">
                <label className="text-sm">Имя *<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                <label className="text-sm">Возраст<input type="number" min="0" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                <label className="text-sm">Телефон *<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                <label className="text-sm">Instagram<input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                <label className="text-sm md:col-span-2">Email *<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                <label className="text-sm md:col-span-2">Иные контакты<textarea value={form.other_contacts} onChange={(e) => setForm({ ...form, other_contacts: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" rows="2" /></label>
              </div>

              <div className="border-t pt-5">
                <div className="flex justify-between items-center mb-3"><h3 className="font-medium">События</h3><button type="button" onClick={addFormEvent} className="text-sm text-[#4a7c59] flex items-center gap-1"><Plus size={16} /> Добавить событие</button></div>
                <div className="space-y-3">
                  {form.events.map((item, index) => (
                    <div key={item.id || index} className="grid md:grid-cols-12 gap-2 border rounded-lg p-3">
                      <select value={item.event_type} onChange={(e) => updateFormEvent(index, 'event_type', e.target.value)} className="md:col-span-3 border rounded px-2 py-2">
                        {APPOINTMENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                        <option value="other">Другое</option>
                      </select>
                      <input type="datetime-local" value={item.event_date} onChange={(e) => updateFormEvent(index, 'event_date', e.target.value)} className="md:col-span-3 border rounded px-2 py-2" />
                      <input type="number" min="0" step="0.01" placeholder="Стоимость" value={item.cost} onChange={(e) => updateFormEvent(index, 'cost', e.target.value)} className="md:col-span-2 border rounded px-2 py-2" />
                      <input placeholder="Комментарий" value={item.comment} onChange={(e) => updateFormEvent(index, 'comment', e.target.value)} className="md:col-span-3 border rounded px-2 py-2" />
                      <button type="button" onClick={() => setForm((current) => ({ ...current, events: current.events.filter((_, i) => i !== index) }))} className="md:col-span-1 text-red-600 flex justify-center items-center"><Trash2 size={17} /></button>
                    </div>
                  ))}
                  {!form.events.length && <p className="text-sm text-gray-500">Событий пока нет</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 border rounded-lg">Отмена</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#4a7c59] text-white rounded-lg disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex justify-between"><div><h2 className="text-xl font-serif">{detail.name || 'Без имени'}</h2>{detail.age != null && <p className="text-sm text-gray-500">Возраст: {detail.age}</p>}</div><button onClick={() => setDetail(null)}><X size={20} /></button></div>
            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 text-sm"><div><span className="text-gray-500">Телефон</span><p>{detail.phone || '—'}</p></div><div><span className="text-gray-500">Email</span><p>{detail.email || '—'}</p></div><div><span className="text-gray-500">Instagram</span><p>{detail.instagram || '—'}</p></div><div><span className="text-gray-500">Иные контакты</span><p>{detail.other_contacts || '—'}</p></div></div>
              <div className="border-t pt-4"><h3 className="font-medium mb-3">События</h3>{detail.events?.length ? <div className="space-y-2">{detail.events.map((item) => (
                <div key={item.id} className="flex items-start justify-between border rounded-lg p-3"><div className="flex gap-3"><CalendarDays size={18} className="text-[#4a7c59] mt-0.5" /><div><p className="font-medium">{typeLabel(item.event_type)}</p><p className="text-sm text-gray-500">{new Date(item.event_date).toLocaleString()}</p>{item.cost != null && <p className="text-sm">Стоимость: {formatMoney(item.cost)}</p>}{item.comment && <p className="text-sm text-gray-500 mt-1">{item.comment}</p>}</div></div><button onClick={() => removeEvent(item.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></div>
              ))}</div> : <p className="text-sm text-gray-500">Событий пока нет</p>}</div>
              <div className="flex justify-end gap-3 border-t pt-4"><button onClick={() => { openEdit(detail); setDetail(null); }} className="px-4 py-2 border rounded-lg flex items-center gap-2"><Pencil size={16} /> Редактировать</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
