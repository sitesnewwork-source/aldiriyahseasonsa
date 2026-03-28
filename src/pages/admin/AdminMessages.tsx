import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MailOpen, Search, Archive, ArchiveRestore, Phone, AtSign, Trash2, CheckSquare, Square, Reply, Send, ExternalLink } from "lucide-react";
import ExportButtons from "@/components/admin/ExportButtons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { playChime } from "@/hooks/use-action-sound";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

const subjectLabels: Record<string, { label: string; gradient: string; color: string }> = {
  inquiry: { label: "استفسار", gradient: "from-blue-500 to-indigo-500", color: "bg-blue-100 text-blue-600" },
  booking: { label: "حجز", gradient: "from-emerald-500 to-teal-500", color: "bg-emerald-100 text-emerald-600" },
  events: { label: "فعاليات", gradient: "from-violet-500 to-purple-500", color: "bg-violet-100 text-violet-600" },
  complaint: { label: "شكوى", gradient: "from-red-500 to-rose-500", color: "bg-red-100 text-red-600" },
  media: { label: "إعلام", gradient: "from-amber-400 to-orange-500", color: "bg-amber-100 text-amber-600" },
  partnership: { label: "شراكة", gradient: "from-teal-500 to-cyan-500", color: "bg-teal-100 text-teal-600" },
};

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [viewMode, setViewMode] = useState<"inbox" | "archived">("inbox");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ type: "single" | "selected" | "all"; id?: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages((data as Message[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "contact_messages" }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handler = () => fetchMessages();
    window.addEventListener("admin-pull-refresh", handler);
    return () => window.removeEventListener("admin-pull-refresh", handler);
  }, []);

  const markAsRead = async (msg: Message) => {
    if (selectMode) return;
    if (!msg.is_read) {
      await supabase.from("contact_messages").update({ is_read: true }).eq("id", msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
    setSelected(msg);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const archiveMessages = async (ids: string[]) => {
    if (ids.length === 0) return;
    for (const id of ids) {
      await supabase.from("contact_messages").update({ is_archived: true }).eq("id", id);
    }
    playChime("notification");
    toast.success(`تم أرشفة ${ids.length} رسالة`);
    setSelectedIds(new Set());
    setSelectMode(false);
    if (selected && ids.includes(selected.id)) setSelected(null);
    fetchMessages();
  };

  const restoreMessages = async (ids: string[]) => {
    if (ids.length === 0) return;
    for (const id of ids) {
      await supabase.from("contact_messages").update({ is_archived: false }).eq("id", id);
    }
    playChime("notification");
    toast.success(`تم استعادة ${ids.length} رسالة`);
    setSelectedIds(new Set());
    setSelectMode(false);
    if (selected && ids.includes(selected.id)) setSelected(null);
    fetchMessages();
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    playChime("delete");
    if (confirmDelete.type === "single" && confirmDelete.id) {
      await supabase.from("contact_messages").delete().eq("id", confirmDelete.id);
      if (selected?.id === confirmDelete.id) setSelected(null);
    } else if (confirmDelete.type === "selected") {
      for (const id of selectedIds) {
        await supabase.from("contact_messages").delete().eq("id", id);
      }
      if (selected && selectedIds.has(selected.id)) setSelected(null);
      setSelectedIds(new Set());
      setSelectMode(false);
    } else if (confirmDelete.type === "all") {
      const ids = filtered.map(m => m.id);
      if (ids.length > 0) {
        await supabase.from("contact_messages").delete().in("id", ids);
      }
      setSelected(null);
    }
    setConfirmDelete(null);
    fetchMessages();
  };

  // Filter by inbox/archived first, then by read status and search
  const byView = messages.filter(m => viewMode === "archived" ? m.is_archived : !m.is_archived);
  
  const filtered = byView.filter(m => {
    if (filter === "unread" && m.is_read) return false;
    if (filter === "read" && !m.is_read) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
    }
    return true;
  });

  const inboxMessages = messages.filter(m => !m.is_archived);
  const archivedMessages = messages.filter(m => m.is_archived);
  const unreadCount = byView.filter(m => !m.is_read).length;

  const tabs = [
    { key: "all" as const, label: "الكل", count: byView.length },
    { key: "unread" as const, label: "غير مقروءة", count: unreadCount },
    { key: "read" as const, label: "مقروءة", count: byView.length - unreadCount },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Mail className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">رسائل التواصل</h2>
            <p className="text-[10px] text-slate-400">{filtered.length} رسالة • {unreadCount} غير مقروءة</p>
          </div>
        </div>
        <ExportButtons
          data={filtered}
          filename="messages"
          title="رسائل التواصل"
          columns={[
            { key: "name", label: "الاسم" },
            { key: "email", label: "البريد" },
            { key: "phone", label: "الهاتف" },
            { key: "subject", label: "الموضوع" },
            { key: "message", label: "الرسالة" },
            { key: "is_read", label: "الحالة", format: (v) => v ? "مقروءة" : "غير مقروءة" },
            { key: "created_at", label: "التاريخ", format: (v) => new Date(v).toLocaleDateString("ar-SA") },
          ]}
        />
      </div>

      {/* Inbox / Archive Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setViewMode("inbox"); setSelectMode(false); setSelectedIds(new Set()); setFilter("all"); }}
          className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all flex items-center justify-center gap-2 ${
            viewMode === "inbox"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20"
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          <Mail className="w-4 h-4" />
          الوارد ({inboxMessages.length})
        </button>
        <button
          onClick={() => { setViewMode("archived"); setSelectMode(false); setSelectedIds(new Set()); setFilter("all"); }}
          className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all flex items-center justify-center gap-2 ${
            viewMode === "archived"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          <Archive className="w-4 h-4" />
          الأرشيف ({archivedMessages.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في الرسائل..."
          className="w-full bg-white border border-slate-200/80 rounded-xl pr-10 pl-4 py-2.5 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
              filter === tab.key
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          غير مقروءة
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          مقروءة
        </span>
        <span className="mr-auto flex items-center gap-2 flex-wrap">
          {filtered.length} رسالة
          <button
            onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
            className={`px-2 py-1 rounded-lg transition-all text-[10px] font-medium ${
              selectMode ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {selectMode ? "إلغاء التحديد" : "تحديد"}
          </button>
          {selectMode && selectedIds.size > 0 && (
            <>
              {viewMode === "inbox" ? (
                <button
                  onClick={() => archiveMessages(Array.from(selectedIds))}
                  className="px-2 py-1 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all text-[10px] font-medium flex items-center gap-1"
                >
                  <Archive className="w-3 h-3" />
                  أرشفة ({selectedIds.size})
                </button>
              ) : (
                <button
                  onClick={() => restoreMessages(Array.from(selectedIds))}
                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all text-[10px] font-medium flex items-center gap-1"
                >
                  <ArchiveRestore className="w-3 h-3" />
                  استعادة ({selectedIds.size})
                </button>
              )}
              <button
                onClick={() => setConfirmDelete({ type: "selected" })}
                className="px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all text-[10px] font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                حذف ({selectedIds.size})
              </button>
            </>
          )}
          {filtered.length > 0 && !selectMode && (
            <button
              onClick={() => setConfirmDelete({ type: "all" })}
              className="px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all text-[10px] font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              مسح الكل
            </button>
          )}
        </span>
      </div>

      {/* Messages List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="w-1/3 h-3.5 bg-slate-100 rounded" />
                    <div className="w-2/3 h-3 bg-slate-50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
            {viewMode === "archived" ? "لا توجد رسائل مؤرشفة" : "لا توجد رسائل"}
          </div>
        ) : (
          filtered.map((msg) => {
            const sub = subjectLabels[msg.subject || ""];
            return (
              <div
                key={msg.id}
                onClick={() => markAsRead(msg)}
                className={`w-full text-right bg-white rounded-2xl border transition-all duration-200 hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5 cursor-pointer ${
                  !msg.is_read ? "border-blue-200 bg-blue-50/30" : "border-slate-100"
                } ${viewMode === "archived" ? "opacity-80" : ""}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Select checkbox */}
                    {selectMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(msg.id); }}
                        className="shrink-0 mt-1"
                      >
                        {selectedIds.has(msg.id) ? <CheckSquare className="w-5 h-5 text-blue-500" /> : <Square className="w-5 h-5 text-slate-300" />}
                      </button>
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold ${
                        !msg.is_read ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {msg.name.charAt(0)}
                      </div>
                      <span className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        !msg.is_read ? "bg-red-400" : "bg-emerald-400"
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[14px] font-semibold ${!msg.is_read ? "text-slate-800" : "text-slate-600"}`}>
                          {msg.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {format(new Date(msg.created_at), "dd MMM، HH:mm", { locale: ar })}
                          </span>
                          {!selectMode && (
                            <div className="flex items-center gap-0.5">
                              {viewMode === "inbox" ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); archiveMessages([msg.id]); }}
                                  className="p-1 rounded-lg hover:bg-amber-50 text-slate-300 hover:text-amber-500 transition-colors"
                                  title="أرشفة"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); restoreMessages([msg.id]); }}
                                  className="p-1 rounded-lg hover:bg-emerald-50 text-slate-300 hover:text-emerald-500 transition-colors"
                                  title="استعادة"
                                >
                                  <ArchiveRestore className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: "single", id: msg.id }); }}
                                className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        {viewMode === "archived" && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
                            مؤرشفة
                          </span>
                        )}
                        {sub && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sub.color}`}>
                            {sub.label}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1" dir="ltr">
                          <AtSign className="w-3 h-3" />
                          {msg.email}
                        </span>
                      </div>

                      <p className="text-[12px] text-slate-500 mt-2 truncate leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom info bar */}
                {msg.phone && (
                  <div className="border-t border-slate-50 px-4 py-2 flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px] text-slate-400" dir="ltr">{msg.phone}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setShowReply(false); setReplyText(""); }}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {selected?.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-slate-800">{selected?.name}</p>
                <p className="text-[11px] text-slate-400 font-normal" dir="ltr">{selected?.email}</p>
              </div>
              <div className="flex items-center gap-1">
                {selected && !selected.is_archived ? (
                  <button
                    onClick={() => { archiveMessages([selected.id]); setSelected(null); }}
                    className="p-2 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-colors"
                    title="أرشفة"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                ) : selected && selected.is_archived ? (
                  <button
                    onClick={() => { restoreMessages([selected.id]); setSelected(null); }}
                    className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-colors"
                    title="استعادة"
                  >
                    <ArchiveRestore className="w-4 h-4" />
                  </button>
                ) : null}
                <button
                  onClick={() => { setConfirmDelete({ type: "single", id: selected!.id }); setSelected(null); }}
                  className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "الجوال", value: selected.phone || "—" },
                  { label: "الموضوع", value: subjectLabels[selected.subject || ""]?.label || selected.subject || "—" },
                  { label: "التاريخ", value: format(new Date(selected.created_at), "dd MMM yyyy", { locale: ar }) },
                  { label: "الوقت", value: format(new Date(selected.created_at), "HH:mm", { locale: ar }) },
                ].map((info) => (
                  <div key={info.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 mb-0.5">{info.label}</p>
                    <p className="text-[13px] font-medium text-slate-700">{info.value}</p>
                  </div>
                ))}
              </div>

              <div className="border border-blue-100 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-blue-600">نص الرسالة</span>
                  <span className="text-[10px] text-blue-400">
                    {format(new Date(selected.created_at), "dd MMM yyyy، HH:mm", { locale: ar })}
                  </span>
                </div>
                <div className="p-4 text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>

              {/* Reply Section */}
              {!showReply ? (
                <button
                  onClick={() => setShowReply(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  رد على الرسالة
                </button>
              ) : (
                <div className="border border-emerald-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-2 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-emerald-600 flex items-center gap-1.5">
                      <Reply className="w-3.5 h-3.5" />
                      الرد على {selected.name}
                    </span>
                    <span className="text-[10px] text-emerald-400" dir="ltr">{selected.email}</span>
                  </div>
                  <div className="p-3 space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="اكتب ردك هنا..."
                      rows={4}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[16px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${selected.email}?subject=${encodeURIComponent(
                          `رد: ${subjectLabels[selected.subject || ""]?.label || selected.subject || "رسالة من موقع درعية"}`
                        )}&body=${encodeURIComponent(replyText + "\n\n---\nالرسالة الأصلية من " + selected.name + ":\n" + selected.message)}`}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                          replyText.trim()
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-400 pointer-events-none"
                        }`}
                        onClick={() => {
                          if (replyText.trim()) {
                            playChime("notification");
                            toast.success("تم فتح تطبيق البريد الإلكتروني");
                          }
                        }}
                      >
                        <Send className="w-4 h-4" />
                        إرسال عبر البريد
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      <button
                        onClick={() => { setShowReply(false); setReplyText(""); }}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 text-[13px] font-medium transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent dir="rtl" className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {confirmDelete?.type === "single" && "هل أنت متأكد من حذف هذه الرسالة نهائياً؟ لا يمكن التراجع عن هذا الإجراء."}
              {confirmDelete?.type === "selected" && `هل أنت متأكد من حذف ${selectedIds.size} رسالة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}
              {confirmDelete?.type === "all" && `هل أنت متأكد من حذف جميع الرسائل (${filtered.length}) نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMessages;
