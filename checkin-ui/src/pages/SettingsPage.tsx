import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Rocket,
  Layers,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/wallet-context';
import {
  loadConfig,
  networkLabel,
  getMidnightContractExplorerUrl,
  get1amContractExplorerUrl,
} from '@/config';
import { LACE_STORE_URL } from '@/lace';

export function SettingsPage() {
  const navigate = useNavigate();
  const {
    config,
    wallet,
    connecting,
    deploying,
    deployError,
    laceInstalled,
    connect,
    disconnect,
    deploy,
    walletError,
    refreshPublicState,
    setContractAddress,
    clearContractAddressOverride,
    setNetwork,
  } = useWallet();

  const [addressDraft, setAddressDraft] = useState(config.contractAddress ?? '');
  const [eventName, setEventName] = useState('Anonymous Event Check-in');
  const [copiedActive, setCopiedActive] = useState(false);
  const [copiedDeployed, setCopiedDeployed] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deployedModal, setDeployedModal] = useState<{
    address: string;
    eventName: string;
  } | null>(null);

  useEffect(() => {
    setAddressDraft(config.contractAddress ?? '');
  }, [config.contractAddress]);

  const onSaveContract = (e: FormEvent) => {
    e.preventDefault();
    if (!addressDraft.trim()) return;
    setContractAddress(addressDraft.trim());
    void refreshPublicState();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const onDeploy = async () => {
    const name = eventName.trim() || 'Anonymous Event Check-in';
    const address = await deploy(name);
    if (address) {
      setAddressDraft(address);
      setDeployedModal({
        address,
        eventName: name,
      });
      void refreshPublicState();
    }
  };

  const copyToClipboard = async (text: string, isDeployed: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isDeployed) {
        setCopiedDeployed(true);
        setTimeout(() => setCopiedDeployed(false), 2000);
      } else {
        setCopiedActive(true);
        setTimeout(() => setCopiedActive(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const isSaveDisabled =
    !addressDraft.trim() || addressDraft.trim() === (config.contractAddress ?? '').trim();

  return (
    <div>
      <PageHeader
        kicker="Config"
        title="Workspace setup"
        description={`Deploy on ${networkLabel(config.network)}, switch networks, and manage contract configuration.`}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Deploy Card */}
        <Surface accent>
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <Rocket className="h-5 w-5 text-[var(--accent)]" />
              Deploy event contract
            </h2>
            <Badge tone="ok">{networkLabel(config.network)}</Badge>
          </div>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Deploys a fresh <strong>{networkLabel(config.network)}</strong> contract instance. ZK
            proving takes ~30–60 seconds. Approve the wallet popup when prompted.
          </p>
          <div className="mt-5 space-y-3">
            <div>
              <label
                htmlFor="eventName"
                className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]"
              >
                Public Event Title
              </label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Midnight Builder Summit 2026"
                spellCheck={false}
                disabled={deploying}
              />
            </div>
            <Button
              type="button"
              variant="accent"
              className="w-full sm:w-auto"
              onClick={() => void onDeploy()}
              disabled={!wallet || deploying}
            >
              {deploying
                ? 'Deploying on-chain (proving)…'
                : `Deploy on ${networkLabel(config.network)}`}
            </Button>
            {!wallet ? (
              <p className="text-sm text-[var(--ink-faint)]">Connect your wallet first to deploy.</p>
            ) : null}
            {deployError ? <p className="text-sm text-[var(--danger)]">{deployError}</p> : null}
            {deploying ? (
              <div className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--ink-muted)]">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                <span>
                  Generating ZK proof and submitting transaction… Please keep this tab open and
                  approve in your wallet.
                </span>
              </div>
            ) : null}
          </div>
        </Surface>

        {/* Contract Address Card */}
        <Surface>
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <Layers className="h-5 w-5 text-[var(--accent)]" />
              Contract address
            </h2>
            {saveSuccess ? (
              <Badge tone="ok">
                <Check className="mr-1 inline h-3 w-3" /> Saved!
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Paste a deployed address or deploy above. Saved locally and applied immediately across
            the DApp.
          </p>
          <form onSubmit={onSaveContract} className="mt-5 space-y-3">
            <div>
              <label
                htmlFor="contract"
                className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]"
              >
                Contract Address (64-char Hex)
              </label>
              <Input
                id="contract"
                value={addressDraft}
                onChange={(e) => setAddressDraft(e.target.value)}
                placeholder="64-char hex contract address"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="accent" disabled={isSaveDisabled}>
                {saveSuccess ? 'Saved!' : 'Save Address'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  clearContractAddressOverride();
                  const def = loadConfig().contractAddress ?? '';
                  setAddressDraft(def);
                }}
              >
                Reset to Default
              </Button>
            </div>
          </form>

          {config.contractAddress ? (
            <div className="mt-4 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] p-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--ink-muted)]">
                <span>ACTIVE CONTRACT</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.contractAddress!, false)}
                  className="flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  {copiedActive ? (
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
              <p className="mt-1.5 break-all font-mono text-xs text-white">
                {config.contractAddress}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2 pt-2 border-t border-[var(--line)]">
                <a
                  href={getMidnightContractExplorerUrl(config.contractAddress, config.network)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-purple-950/60 border border-purple-800/60 px-2 py-1 text-[11px] font-medium text-purple-200 hover:bg-purple-900/60"
                >
                  <ExternalLink className="h-3 w-3" /> View on Midnight Explorer
                </a>
                <a
                  href={get1amContractExplorerUrl(config.contractAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-sky-950/60 border border-sky-800/60 px-2 py-1 text-[11px] font-medium text-sky-200 hover:bg-sky-900/60"
                >
                  <ExternalLink className="h-3 w-3" /> View on 1AM Explorer
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-4 font-mono text-[11px] text-[var(--danger)]">
              No contract address configured.
            </p>
          )}
        </Surface>

        {/* Network & Environment Card */}
        <Surface>
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <Globe className="h-5 w-5 text-[var(--accent)]" />
              Network & Endpoints
            </h2>
            <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-1">
              <button
                type="button"
                onClick={() => setNetwork('preprod')}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-semibold transition-all',
                  config.network === 'preprod'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-[var(--ink-muted)] hover:text-white',
                )}
              >
                Preprod
              </button>
              <button
                type="button"
                onClick={() => setNetwork('preview')}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-semibold transition-all',
                  config.network === 'preview'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-[var(--ink-muted)] hover:text-white',
                )}
              >
                Preview
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Switch between <strong>Preprod</strong> and <strong>Preview</strong> testnets instantly.
            Wallet and endpoints reconfigure automatically.
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                Active Network
              </dt>
              <dd className="font-semibold text-white">{networkLabel(config.network)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                GraphQL Indexer
              </dt>
              <dd className="max-w-[65%] break-all text-right font-mono text-xs text-[var(--ink-muted)]">
                {config.indexerUri ?? wallet?.uris.indexerUri ?? '—'}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                Proof Server
              </dt>
              <dd className="max-w-[65%] break-all text-right font-mono text-xs text-[var(--ink-muted)]">
                {config.proverUri ?? wallet?.uris.proverServerUri ?? '—'}
              </dd>
            </div>
          </dl>
        </Surface>

        {/* Wallet Connection */}
        <Surface>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl">Midnight wallet</h2>
            <Badge tone={wallet ? 'ok' : laceInstalled ? 'warn' : 'danger'}>
              {wallet ? 'Connected' : laceInstalled ? 'Detected' : 'Not Found'}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Connect using <strong>1AM</strong> or <strong>Lace</strong> wallet on Midnight{' '}
            <strong>{networkLabel(config.network)}</strong>.
          </p>
          {wallet ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-md border border-[var(--line)] bg-[var(--surface-muted)] p-3">
                <span className="text-[10px] font-semibold text-[var(--ink-muted)] uppercase">
                  Shielded Address
                </span>
                <p className="mt-1 break-all font-mono text-xs text-white">
                  {wallet.state.address}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={disconnect}>
                  Disconnect Wallet
                </Button>
                <Button variant="ghost" onClick={() => void refreshPublicState()}>
                  Sync Ledger
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              {laceInstalled ? (
                <Button variant="accent" onClick={() => void connect()} disabled={connecting}>
                  {connecting ? 'Connecting…' : `Connect on ${networkLabel(config.network)}`}
                </Button>
              ) : (
                <a
                  href={LACE_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-deep)]"
                >
                  Install 1AM / Lace
                </a>
              )}
            </div>
          )}
          {walletError ? <p className="mt-3 text-sm text-[var(--danger)]">{walletError}</p> : null}
        </Surface>
      </div>

      {/* Deployment Success Confirmation Modal */}
      {deployedModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-[var(--accent)]/50 bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-2xl text-white">Contract Deployed!</h3>
                  <Badge tone="ok">{networkLabel(config.network)}</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  Your smart contract for{' '}
                  <strong className="text-white">"{deployedModal.eventName}"</strong> has been
                  finalized on {networkLabel(config.network)}.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-muted)]">
                <span>NEW CONTRACT ADDRESS</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(deployedModal.address, true)}
                  className="flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  {copiedDeployed ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Address
                    </>
                  )}
                </button>
              </div>
              <p className="break-all font-mono text-xs font-medium text-white">
                {deployedModal.address}
              </p>
            </div>

            {/* Dual Explorer Links in Modal */}
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <a
                href={getMidnightContractExplorerUrl(deployedModal.address, config.network)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius)] border border-purple-800/60 bg-purple-950/50 px-3 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-900/60"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View on Midnight Explorer
              </a>
              <a
                href={get1amContractExplorerUrl(deployedModal.address)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius)] border border-sky-800/60 bg-sky-950/50 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-900/60"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View on 1AM Explorer
              </a>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="accent"
                onClick={() => {
                  setDeployedModal(null);
                  navigate('/dashboard');
                }}
              >
                Open Dashboard
              </Button>
              <Button variant="ghost" onClick={() => setDeployedModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
