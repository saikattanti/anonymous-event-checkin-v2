import { useEffect, useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/wallet-context';
import {
  getMidnightTxExplorerUrl,
  get1amTxExplorerUrl,
  getMidnightContractExplorerUrl,
  get1amContractExplorerUrl,
  networkLabel,
} from '@/config';
import {
  clearActivity,
  listActivity,
  type ActivityEvent,
  type ActivityKind,
} from '@/lib/activity';

function toneFor(kind: ActivityKind): 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' {
  if (kind.includes('success') || kind === 'wallet_connect') return 'ok';
  if (kind.includes('error')) return 'danger';
  if (kind === 'wallet_disconnect') return 'warn';
  if (kind.startsWith('checkin') || kind.startsWith('deploy')) return 'accent';
  return 'neutral';
}

function isHexHash(s?: string): boolean {
  if (!s) return false;
  const clean = s.replace(/^(tx\s+|0x)/i, '').trim();
  return /^[0-9a-fA-F]{32,}$/.test(clean);
}

function extractCleanHash(s: string): string {
  return s.replace(/^(tx\s+|0x)/i, '').trim();
}

export function LogsPage() {
  const { config } = useWallet();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reload = () => setEvents(listActivity());

  useEffect(() => {
    reload();
    const onChange = () => reload();
    window.addEventListener('aec:activity', onChange);
    return () => window.removeEventListener('aec:activity', onChange);
  }, []);

  const copyDetail = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div>
      <PageHeader
        kicker="Activity"
        title="Session log"
        description={`Audit trail of wallet sessions, contract deploys, and ZK check-ins on ${networkLabel(config.network)}.`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearActivity();
              reload();
            }}
          >
            Clear Log
          </Button>
        }
      />

      <Surface className="!p-0 overflow-hidden">
        {events.length === 0 ? (
          <p className="p-5 text-sm text-[var(--ink-muted)]">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {events.map((event) => {
              const hasHex = isHexHash(event.detail);
              const cleanHash = event.detail ? extractCleanHash(event.detail) : '';
              const isDeploy = event.kind === 'deploy_success';
              const isTx = event.kind === 'checkin_success' || event.kind === 'checkin_attempt';

              return (
                <li
                  key={event.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={toneFor(event.kind)}>{event.kind.replaceAll('_', ' ')}</Badge>
                      <p className="font-semibold text-white">{event.title}</p>
                    </div>

                    {event.detail ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="break-all font-mono text-xs text-[var(--ink-muted)]">
                          {event.detail}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyDetail(event.id, cleanHash || event.detail!)}
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--accent)] hover:underline"
                        >
                          {copiedId === event.id ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    ) : null}

                    {/* Explorer Links for Deploy or Check-in transactions */}
                    {hasHex && (isDeploy || isTx) ? (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {isDeploy ? (
                          <>
                            <a
                              href={getMidnightContractExplorerUrl(cleanHash, config.network)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 text-[11px] font-medium text-purple-200 hover:bg-purple-900/60"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> Midnight Explorer
                            </a>
                            <a
                              href={get1amContractExplorerUrl(cleanHash)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 text-[11px] font-medium text-sky-200 hover:bg-sky-900/60"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> 1AM Explorer
                            </a>
                          </>
                        ) : (
                          <>
                            <a
                              href={getMidnightTxExplorerUrl(cleanHash, config.network)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 text-[11px] font-medium text-purple-200 hover:bg-purple-900/60"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> Midnight Tx Explorer
                            </a>
                            <a
                              href={get1amTxExplorerUrl(cleanHash)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 text-[11px] font-medium text-sky-200 hover:bg-sky-900/60"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> 1AM Tx Explorer
                            </a>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <time className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                    {new Date(event.at).toLocaleString()}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </Surface>
    </div>
  );
}
