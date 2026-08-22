import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ExternalLink } from 'lucide-react';
import { cn, shortAddr } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/surface';
import { useWallet } from '@/wallet-context';
import {
  networkLabel,
  getMidnightContractExplorerUrl,
  get1amContractExplorerUrl,
} from '@/config';

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/check-in', label: 'Door check-in' },
  { href: '/logs', label: 'Activity' },
  { href: '/settings', label: 'Config' },
] as const;

function WalletChip() {
  const {
    wallet,
    connecting,
    laceInstalled,
    laceReady,
    connect,
    disconnect,
    walletError,
    laceStoreUrl,
  } = useWallet();

  if (!laceReady) {
    return <Badge tone="neutral">Detecting…</Badge>;
  }

  if (!laceInstalled) {
    return (
      <a
        href={laceStoreUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xs font-semibold text-[var(--accent-deep)] underline-offset-2 hover:underline"
      >
        Install 1AM / Lace
      </a>
    );
  }

  if (wallet) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="ok">Live</Badge>
        <code className="hidden max-w-[130px] truncate font-mono text-[11px] text-[var(--ink-muted)] sm:inline">
          {shortAddr(wallet.state.address)}
        </code>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="accent" onClick={() => void connect()} disabled={connecting}>
        {connecting ? 'Connecting…' : 'Connect Wallet'}
      </Button>
      {walletError ? (
        <span className="hidden max-w-[160px] truncate text-xs text-[var(--danger)] lg:inline">
          {walletError}
        </span>
      ) : null}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { config, setNetwork } = useWallet();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="scan-lines pointer-events-none fixed inset-0 opacity-60" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full items-center gap-4 px-4 sm:px-8">
          <Link to="/" className="shrink-0 font-display text-lg text-[var(--ink)]">
            AEC<span className="text-[var(--accent)]">.</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'rounded-[var(--radius)] px-3 py-1.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-[var(--ink)] text-white'
                      : 'text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Interactive Network Selector in Header */}
            <div className="hidden items-center rounded-full border border-[var(--line)] bg-[var(--surface-muted)] p-0.5 sm:flex">
              <button
                type="button"
                onClick={() => setNetwork('preprod')}
                className={cn(
                  'rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold transition-all',
                  config.network === 'preprod'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-[var(--ink-muted)] hover:text-white',
                )}
              >
                Preprod
              </button>
              <button
                type="button"
                onClick={() => setNetwork('preview')}
                className={cn(
                  'rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold transition-all',
                  config.network === 'preview'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-[var(--ink-muted)] hover:text-white',
                )}
              >
                Preview
              </button>
            </div>

            <Badge tone="accent" className="hidden sm:inline-flex">
              ZK
            </Badge>
            <WalletChip />
            <button
              className="rounded-[var(--radius)] p-2 text-[var(--ink-muted)] hover:bg-[var(--surface)] md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <nav className="border-t border-[var(--line)] px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                <span className="text-xs font-semibold text-[var(--ink-muted)]">Target Network:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNetwork('preprod');
                      setOpen(false);
                    }}
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-semibold',
                      config.network === 'preprod'
                        ? 'bg-purple-600 text-white'
                        : 'bg-[var(--surface)] text-[var(--ink-muted)]',
                    )}
                  >
                    Preprod
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNetwork('preview');
                      setOpen(false);
                    }}
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-semibold',
                      config.network === 'preview'
                        ? 'bg-sky-600 text-white'
                        : 'bg-[var(--surface)] text-[var(--ink-muted)]',
                    )}
                  >
                    Preview
                  </button>
                </div>
              </div>
              {NAV.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-[var(--radius)] px-3 py-2 text-sm font-semibold',
                      isActive
                        ? 'bg-[var(--ink)] text-white'
                        : 'text-[var(--ink-muted)] hover:bg-[var(--surface)]',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        ) : null}

        <div className="border-t border-[var(--line)] bg-[var(--ink)] text-white">
          <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] sm:px-8">
            <div className="flex items-center gap-2">
              <span className="text-white/55">Network:</span>
              <span className="font-semibold text-white">{networkLabel(config.network)}</span>
              <span className="text-white/25">|</span>
              <span className="text-white/55">Contract:</span>
              <span className="truncate">
                {config.contractAddress
                  ? `${config.contractAddress.slice(0, 8)}…${config.contractAddress.slice(-6)}`
                  : 'unset'}
              </span>
            </div>

            {config.contractAddress ? (
              <div className="flex items-center gap-3 text-[9px]">
                <a
                  href={getMidnightContractExplorerUrl(config.contractAddress, config.network)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-purple-300 hover:text-white"
                >
                  <ExternalLink className="h-2.5 w-2.5" /> Midnight Explorer
                </a>
                <a
                  href={get1amContractExplorerUrl(config.contractAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sky-300 hover:text-white"
                >
                  <ExternalLink className="h-2.5 w-2.5" /> 1AM Explorer
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full px-4 py-6 sm:px-8 sm:py-7">{children}</main>
    </div>
  );
}
