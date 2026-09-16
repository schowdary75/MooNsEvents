import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCheck, Clock3, Loader2, RefreshCw, Send, Settings2 } from 'lucide-react';
import { API_BASE_URL } from '@/constants/app';
import {
  getLeadWhatsAppConversation,
  getWhatsAppTemplates,
  markLeadWhatsAppRead,
  saveMetaWhatsAppCredential,
  sendLeadWhatsAppMessage,
  verifyMetaWhatsAppCredential,
  type LeadWhatsAppConversation,
  type LeadWhatsAppMessage,
  type WhatsAppTemplate,
} from '@/api/whatsappClient';
import { getSocket } from '@/socket/socketClient';
import { getErrorMessage } from '@/utils/errors';
import { toast } from '@/lib/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppIcon } from './WhatsAppIcon';

export interface WhatsAppLeadSummary {
  id: number;
  name: string;
  phone: string;
  assigned_owner?: string | null;
}

interface Props {
  lead: WhatsAppLeadSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  canConfigure: boolean;
  onUnreadChange?: () => void;
}

function uniqueMessages(messages: LeadWhatsAppMessage[]) {
  return [...new Map(messages.map((message) => [message.id, message])).values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function deliveryIcon(status: LeadWhatsAppMessage['deliveryStatus']) {
  if (status === 'pending') return <Clock3 className="h-3 w-3" aria-label="Pending" />;
  if (status === 'read') return <CheckCheck className="h-3 w-3 text-sky-500" aria-label="Read" />;
  if (status === 'delivered') return <CheckCheck className="h-3 w-3" aria-label="Delivered" />;
  if (status === 'sent') return <Check className="h-3 w-3" aria-label="Sent" />;
  return null;
}

function SetupPanel({
  canConfigure,
  busy,
  onConfigured,
}: {
  canConfigure: boolean;
  busy: boolean;
  onConfigured: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    accessToken: '',
    appSecret: '',
    phoneNumberId: '',
    businessAccountId: '',
    apiVersion: 'v21.0',
  });
  const webhookUrl = useMemo(
    () =>
      new URL(
        `${API_BASE_URL.replace(/\/$/, '')}/public/webhooks/meta/whatsapp`,
        window.location.origin,
      ).toString(),
    [],
  );

  if (!canConfigure) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-semibold">WhatsApp is not connected for this workspace.</p>
        <p className="mt-1 text-muted-foreground">
          Ask a workspace administrator to connect the Meta WhatsApp Business account.
        </p>
      </div>
    );
  }

  async function save() {
    setSaving(true);
    try {
      await saveMetaWhatsAppCredential(form);
      await verifyMetaWhatsAppCredential();
      toast.success('WhatsApp Business connection verified');
      setForm((current) => ({ ...current, accessToken: '', appSecret: '' }));
      await onConfigured();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div>
        <div className="flex items-center gap-2 font-semibold">
          <Settings2 className="h-4 w-4" /> Connect Meta WhatsApp Business
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Credentials are encrypted and never displayed again. Recent MFA verification is required.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium">
          Phone-number ID
          <Input
            value={form.phoneNumberId}
            onChange={(event) => setForm({ ...form, phoneNumberId: event.target.value })}
            autoComplete="off"
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Business-account ID
          <Input
            value={form.businessAccountId}
            onChange={(event) => setForm({ ...form, businessAccountId: event.target.value })}
            autoComplete="off"
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Graph API version
          <Input
            value={form.apiVersion}
            onChange={(event) => setForm({ ...form, apiVersion: event.target.value })}
            placeholder="v21.0"
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Access token
          <Input
            type="password"
            value={form.accessToken}
            onChange={(event) => setForm({ ...form, accessToken: event.target.value })}
            autoComplete="new-password"
          />
        </label>
        <label className="space-y-1 text-xs font-medium sm:col-span-2">
          App secret
          <Input
            type="password"
            value={form.appSecret}
            onChange={(event) => setForm({ ...form, appSecret: event.target.value })}
            autoComplete="new-password"
          />
        </label>
      </div>
      <div className="rounded-md bg-background/70 p-2 text-xs">
        <div className="font-medium">Meta webhook callback URL</div>
        <code className="mt-1 block break-all text-muted-foreground">{webhookUrl}</code>
        <p className="mt-1 text-muted-foreground">
          Use the deployment’s private <code>META_WHATSAPP_VERIFY_TOKEN</code> as the verification
          token in Meta.
        </p>
      </div>
      <Button
        onClick={save}
        disabled={
          busy ||
          saving ||
          !form.accessToken ||
          !form.appSecret ||
          !form.phoneNumberId ||
          !form.businessAccountId ||
          !form.apiVersion
        }
        className="bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save and verify connection
      </Button>
    </div>
  );
}

export function LeadWhatsAppModal({
  lead,
  open,
  onOpenChange,
  agentName,
  canConfigure,
  onUnreadChange,
}: Props) {
  const [data, setData] = useState<LeadWhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<LeadWhatsAppMessage[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
  const [templateParameters, setTemplateParameters] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const onUnreadChangeRef = useRef(onUnreadChange);

  useEffect(() => {
    onUnreadChangeRef.current = onUnreadChange;
  }, [onUnreadChange]);

  const selectedTemplate = useMemo(
    () =>
      templates.find(
        (template) => `${template.name}:${template.language}` === selectedTemplateKey,
      ) ?? null,
    [selectedTemplateKey, templates],
  );

  const refresh = useCallback(
    async (showLoader = false) => {
      if (!lead) return;
      if (showLoader) setLoading(true);
      try {
        const next = await getLeadWhatsAppConversation(lead.id);
        setData(next);
        setMessages(next.messages);
        setError(null);
        if (next.conversation.unreadCount > 0) {
          await markLeadWhatsAppRead(lead.id);
          onUnreadChangeRef.current?.();
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [lead],
  );

  useEffect(() => {
    if (!open || !lead) return;
    setData(null);
    setMessages([]);
    setDraft(
      `Hi ${lead.name}, this is ${agentName} from MooNs Events. How can I help with your event?`,
    );
    setSelectedTemplateKey('');
    setTemplateParameters([]);
    setShowSettings(false);
    void refresh(true);
  }, [agentName, lead, open, refresh]);

  useEffect(() => {
    if (!open || !data?.provider.configured) {
      setTemplates([]);
      return;
    }
    void getWhatsAppTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, [data?.provider.configured, open]);

  useEffect(() => {
    if (!open || !lead) return;
    const socket = getSocket();
    let poll: number | null = null;
    const stopPolling = () => {
      if (poll !== null) window.clearInterval(poll);
      poll = null;
    };
    const startPolling = () => {
      if (poll === null) poll = window.setInterval(() => void refresh(false), 5_000);
    };
    if (!socket) {
      startPolling();
      return stopPolling;
    }
    const onMessage = (payload: { leadId?: number }) => {
      if (Number(payload?.leadId) === lead.id) void refresh(false);
    };
    const onConnect = () => {
      stopPolling();
      void refresh(false);
    };
    socket.on('whatsapp:message', onMessage);
    socket.on('connect', onConnect);
    socket.on('disconnect', startPolling);
    if (!socket.connected) {
      startPolling();
      socket.connect();
    }
    return () => {
      stopPolling();
      socket.off('whatsapp:message', onMessage);
      socket.off('connect', onConnect);
      socket.off('disconnect', startPolling);
    };
  }, [lead, open, refresh]);

  useEffect(() => {
    if (!loading && messages.length) {
      requestAnimationFrame(() =>
        scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight }),
      );
    }
  }, [loading, messages.length]);

  useEffect(() => {
    setTemplateParameters(
      Array.from({ length: selectedTemplate?.parameterCount ?? 0 }, (_, index) => {
        if (index === 0) return lead?.name ?? '';
        if (index === 1) return agentName;
        return '';
      }),
    );
  }, [agentName, lead?.name, selectedTemplate]);

  async function loadOlder() {
    if (!lead || !data?.nextCursor) return;
    setLoadingOlder(true);
    try {
      const older = await getLeadWhatsAppConversation(lead.id, {
        cursor: data.nextCursor,
        limit: 50,
      });
      setMessages((current) => uniqueMessages([...older.messages, ...current]));
      setData((current) => (current ? { ...current, nextCursor: older.nextCursor } : older));
    } catch (loadError) {
      toast.error(getErrorMessage(loadError));
    } finally {
      setLoadingOlder(false);
    }
  }

  async function send() {
    if (!lead || !data?.provider.configured) return;
    setSending(true);
    try {
      const sent = data.conversation.canSendFreeform
        ? await sendLeadWhatsAppMessage(lead.id, {
            type: 'text',
            text: draft,
            clientMessageId: crypto.randomUUID(),
          })
        : selectedTemplate
          ? await sendLeadWhatsAppMessage(lead.id, {
              type: 'template',
              template: {
                name: selectedTemplate.name,
                language: selectedTemplate.language,
                parameters: templateParameters,
              },
              clientMessageId: crypto.randomUUID(),
            })
          : null;
      if (!sent) return;
      setMessages((current) => uniqueMessages([...current, sent]));
      setDraft('');
      toast.success('WhatsApp message sent');
      await refresh(false);
    } catch (sendError) {
      toast.error(getErrorMessage(sendError));
    } finally {
      setSending(false);
    }
  }

  function composerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (draft.trim() && !sending) void send();
    }
  }

  const freeform = Boolean(data?.conversation.canSendFreeform);
  const canSendTemplate = Boolean(
    selectedTemplate &&
    templateParameters.length === selectedTemplate.parameterCount &&
    templateParameters.every((value) => value.trim()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        {canConfigure && data?.provider.configured ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-12 top-3 z-10"
            onClick={() => setShowSettings((current) => !current)}
            aria-label={showSettings ? 'Close WhatsApp settings' : 'Open WhatsApp settings'}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        ) : null}
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            WhatsApp with {lead?.name || 'customer'}
            {data ? (
              <Badge
                className={
                  data.provider.configured
                    ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10'
                    : 'bg-amber-500/10 text-amber-800 hover:bg-amber-500/10 dark:text-amber-300'
                }
              >
                {data.provider.configured ? 'Connected' : data.provider.status}
              </Badge>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {lead?.phone} · Agent {agentName}
            {lead?.assigned_owner ? ` · Owner ${lead.assigned_owner}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4" ref={scrollerRef}>
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading conversation…
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={() => void refresh(true)}>
                <RefreshCw className="mr-2 h-4 w-4" /> Try again
              </Button>
            </div>
          ) : !data?.provider.configured || showSettings ? (
            <SetupPanel
              canConfigure={canConfigure}
              busy={loading}
              onConfigured={async () => {
                setShowSettings(false);
                await refresh(true);
              }}
            />
          ) : (
            <div className="space-y-3">
              {data.nextCursor ? (
                <div className="text-center">
                  <Button variant="ghost" size="sm" onClick={loadOlder} disabled={loadingOlder}>
                    {loadingOlder ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                    Load older messages
                  </Button>
                </div>
              ) : null}
              {!messages.length ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No WhatsApp messages yet. Start with an approved template.
                </div>
              ) : null}
              {messages.map((message) => {
                const outbound = message.direction === 'outbound';
                return (
                  <div
                    key={message.id}
                    className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                        outbound
                          ? 'rounded-br-sm bg-emerald-600 text-white'
                          : 'rounded-bl-sm border bg-muted/60'
                      }`}
                    >
                      <div className="mb-1 text-[10px] font-semibold opacity-75">
                        {message.senderName || (outbound ? agentName : lead?.name)}
                      </div>
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-75">
                        {new Date(message.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                        {outbound ? deliveryIcon(message.deliveryStatus) : null}
                      </div>
                      {message.deliveryStatus === 'failed' ? (
                        <button
                          type="button"
                          className="mt-1 text-xs font-semibold underline"
                          onClick={() => setDraft(message.body)}
                        >
                          Retry message
                        </button>
                      ) : null}
                      {message.error ? (
                        <p className="mt-1 text-[10px] opacity-80">{message.error}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {data?.provider.configured && !showSettings ? (
          <div className="border-t bg-background p-4">
            {freeform ? (
              <>
                <label htmlFor="lead-whatsapp-message" className="sr-only">
                  WhatsApp message
                </label>
                <Textarea
                  id="lead-whatsapp-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.slice(0, 4096))}
                  onKeyDown={composerKeyDown}
                  placeholder="Write a WhatsApp message…"
                  className="min-h-20 resize-none"
                  autoFocus
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Enter to send · Shift+Enter for a new line · {draft.length}/4096
                  </span>
                  <Button
                    onClick={send}
                    disabled={!draft.trim() || sending}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {sending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="rounded-md bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-300">
                  The customer-service window is closed. Choose an approved Meta template to start
                  or reopen this conversation.
                </div>
                <label className="block space-y-1 text-xs font-semibold">
                  Approved template
                  <select
                    value={selectedTemplateKey}
                    onChange={(event) => setSelectedTemplateKey(event.target.value)}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Choose a template</option>
                    {templates.map((template) => (
                      <option
                        key={`${template.name}:${template.language}`}
                        value={`${template.name}:${template.language}`}
                      >
                        {template.name} · {template.language}
                      </option>
                    ))}
                  </select>
                </label>
                {templateParameters.map((value, index) => (
                  <label
                    key={`${selectedTemplateKey}:${index}`}
                    className="block space-y-1 text-xs font-semibold"
                  >
                    Template value {index + 1}
                    <Input
                      value={value}
                      onChange={(event) =>
                        setTemplateParameters((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
                <div className="flex justify-end">
                  <Button
                    onClick={send}
                    disabled={!canSendTemplate || sending}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send approved template
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
