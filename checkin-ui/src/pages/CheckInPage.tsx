import { FormEvent, useState } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Info,
  Layers,
  Box,
} from 'lucide-react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/wallet-context';
import {
  networkLabel,
  getMidnightTxExplorerUrl,
  get1amTxExplorerUrl,
  getMidnightBlockExplorerUrl,
  getMidnightContractExplorerUrl,
} from '@/config';
import { pushActivity } from '@/lib/activity';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; txId: string; blockHeight: number }
  | { kind: 'error'; message: string };

async function contractApi() {
  return import('@/contract');
}

export function CheckInPage() {
  const { config, wallet, connect, connecting, publicState, refreshPublicState } = useWallet();
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handleCheckIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setStatus({ kind: 'submitting' });
    pushActivity('checkin_attempt', 'Anonymous check-in submitted');
    try {
      const { submitCheckIn } = await contractApi();
      const { txId, blockHeight } = await submitCheckIn(config, wallet, secret);
      setStatus({ kind: 'success', txId, blockHeight });
      setSecret('');
      pushActivity('checkin_success', 'Checked in on-chain', `tx ${txId}`);
      void refreshPublicState();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message });
      pushActivity('checkin_error', 'Check-in failed', message);
    }
  };

  const copyTx = async (txId: string) => {
    try {
      await navigator.clipboard.writeText(txId);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } catch {
      // Fallback
    }
  };

  const disabled = wallet === null || !config.contractAddress || status.kind === 'submitting';

  return (
    <div>
      <PageHeader
        kicker="Door"
        title="Check in anonymously"
        description={`Prove invite possession on ${networkLabel(config.network)} without revealing who you are.`}
      />

      <Surface className="!p-0 overflow-hidden">
        <div className="grid lg:grid-cols-[1.4fr_0.9fr]">
          <div className="border-b border-[var(--line)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl text-[var(--ink)]">Invite proof</h2>
              <Badge tone={wallet ? 'ok' : 'warn'}>
                {wallet ? 'Wallet live' : 'Wallet needed'}
              </Badge>
            </div>

            {!wallet ? (
              <div className="mb-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--ink-muted)]">
                Connect your wallet to prove and submit the check-in circuit.
                <div className="mt-3">
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => void connect()}
                    disabled={connecting}
                  >
                    {connecting ? 'Connecting…' : `Connect on ${networkLabel(config.network)}`}
                  </Button>
                </div>
              </div>
            ) : null}

            <form onSubmit={(e) => void handleCheckIn(e)} className="space-y-4">
              <div>
                <label
                  htmlFor="secret"
                  className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]"
                >
                  Invite secret
                </label>
                <div className="flex gap-2">
                  <Input
                    id="secret"
                    type={showSecret ? 'text' : 'password'}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="e.g. VIP-INVITE-2026 or attendee-hash-…"
                    autoComplete="off"
                    disabled={status.kind === 'submitting'}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecret((v) => !v)}
                    aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" variant="accent" disabled={disabled || !secret.trim()}>
                {status.kind === 'submitting' ? 'Proving with ZK…' : 'Submit check-in'}
              </Button>
            </form>

            {!config.contractAddress ? (
              <p className="mt-4 text-sm text-[var(--warn)]">
                Contract address missing — configure or deploy one in Config.
              </p>
            ) : null}

            {/* Check-In Success Card with Rich Verification Explorer Links */}
            {status.kind === 'success' ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span className="font-semibold text-sm text-slate-900">
                    Check-in Verified On-Chain!
                  </span>
                  {status.blockHeight > 0 ? (
                    <Badge tone="ok" className="ml-auto">
                      Block #{status.blockHeight}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-muted)]">
                    <span>TRANSACTION IDENTIFIER</span>
                    <button
                      type="button"
                      onClick={() => copyTx(status.txId)}
                      className="flex items-center gap-1 text-[var(--accent-deep)] font-semibold hover:underline"
                    >
                      {copiedTx ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy ID
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-900">
                    {status.txId}
                  </p>
                </div>

                <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <a
                    href={getMidnightTxExplorerUrl(status.txId, config.network)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View on Midnight Explorer
                  </a>
                  <a
                    href={get1amTxExplorerUrl(status.txId, config.network)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View on 1AM Explorer
                  </a>
                </div>

                {config.contractAddress ? (
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <a
                      href={getMidnightContractExplorerUrl(config.contractAddress, config.network)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Layers className="h-3.5 w-3.5 text-purple-600" /> View Contract Activity
                    </a>
                    {status.blockHeight > 0 ? (
                      <a
                        href={getMidnightBlockExplorerUrl(status.blockHeight, config.network)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Box className="h-3.5 w-3.5 text-sky-600" /> View Block #{status.blockHeight}
                      </a>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-500">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    Note: Block explorers index new ZK proof transactions within 15–30 seconds after
                    block finalization. The on-chain check-in tally updates immediately on the contract.
                  </span>
                </div>
              </div>
            ) : null}

            {status.kind === 'error' ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-700">
                <p className="font-semibold">Check-in Error:</p>
                <p className="mt-1 font-mono">{status.message}</p>
              </div>
            ) : null}
          </div>

          <div className="bg-[var(--ink)] p-5 text-white sm:p-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
              Public ledger state
            </p>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                  Event Title
                </dt>
                <dd className="mt-1 font-display text-2xl">{publicState?.eventName ?? '—'}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                  Verified Check-ins
                </dt>
                <dd className="mt-1 font-display text-5xl tabular-nums">
                  {publicState ? publicState.checkInCount.toString() : '—'}
                </dd>
              </div>
            </dl>
            <div className="mt-8 border-t border-white/15 pt-4 text-sm text-white/60">
              <p className="font-semibold text-white">Zero-Knowledge Guarantee</p>
              <p className="mt-1">
                Your invite secret & wallet identity are never revealed to the public ledger.
              </p>
            </div>
          </div>
        </div>
      </Surface>
    </div>
  );
}
