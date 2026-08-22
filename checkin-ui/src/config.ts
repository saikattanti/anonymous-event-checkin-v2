export type NetworkId = 'undeployed' | 'preview' | 'preprod';

const NETWORK_IDS: readonly NetworkId[] = ['undeployed', 'preview', 'preprod'];
export const CONTRACT_OVERRIDE_KEY = 'aec:contract-address';
export const NETWORK_OVERRIDE_KEY = 'aec:network-override';

function isNetworkId(v: string): v is NetworkId {
  return (NETWORK_IDS as readonly string[]).includes(v);
}

export interface AppConfig {
  network: NetworkId;
  contractAddress: string | null;
  indexerUri: string | null;
  indexerWsUri: string | null;
  proverUri: string | null;
}

function orNull(v: string | undefined | null): string | null {
  const t = (v ?? '').trim();
  return t.length > 0 ? t : null;
}

export function defaultEndpoints(network: NetworkId) {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  switch (network) {
    case 'preprod':
      return {
        indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
        indexerWs: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
        prover: isLocal
          ? 'http://127.0.0.1:6300'
          : 'https://proof-server.preprod.midnight.network',
      };
    case 'preview':
      return {
        indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
        indexerWs: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
        prover: isLocal
          ? 'http://127.0.0.1:6300'
          : 'https://proof-server.preview.midnight.network',
      };
    case 'undeployed':
      return {
        indexer: 'http://127.0.0.1:8088/api/v4/graphql',
        indexerWs: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
        prover: 'http://localhost:6300',
      };
  }
}

function readNetworkOverride(): NetworkId | null {
  try {
    const stored = localStorage.getItem(NETWORK_OVERRIDE_KEY);
    if (stored && isNetworkId(stored)) return stored;
    return null;
  } catch {
    return null;
  }
}

function envConfig(): AppConfig {
  const fallback = 'preprod';
  const rawNetwork = (
    readNetworkOverride() ??
    import.meta.env.VITE_NETWORK_ID ??
    import.meta.env.VITE_MIDNIGHT_NETWORK ??
    fallback
  ).trim();
  const network: NetworkId = isNetworkId(rawNetwork) ? rawNetwork : (fallback as NetworkId);
  const defaults = defaultEndpoints(network);

  return {
    network,
    contractAddress:
      orNull(import.meta.env.VITE_CONTRACT_ADDRESS) ??
      'd8bbaaf91a63de2747560ad6f966741ba1a95541f9c9bacee3880bbb7bce19ac',
    indexerUri: orNull(import.meta.env.VITE_INDEXER_URI) ?? defaults.indexer,
    indexerWsUri: orNull(import.meta.env.VITE_INDEXER_WS_URI) ?? defaults.indexerWs,
    proverUri:
      orNull(import.meta.env.VITE_PROOF_SERVER_URL ?? import.meta.env.VITE_PROVER_URI) ??
      defaults.prover,
  };
}

function readOverride(): string | null {
  try {
    return orNull(localStorage.getItem(CONTRACT_OVERRIDE_KEY));
  } catch {
    return null;
  }
}

export function loadConfig(): AppConfig {
  const base = envConfig();
  return {
    ...base,
    contractAddress: readOverride() ?? base.contractAddress,
  };
}

export function saveContractAddressOverride(address: string | null) {
  const cleaned = orNull(address);
  if (cleaned) localStorage.setItem(CONTRACT_OVERRIDE_KEY, cleaned);
  else localStorage.removeItem(CONTRACT_OVERRIDE_KEY);
  window.dispatchEvent(new CustomEvent('aec:config'));
}

export function saveNetworkOverride(network: NetworkId) {
  localStorage.setItem(NETWORK_OVERRIDE_KEY, network);
  window.dispatchEvent(new CustomEvent('aec:config'));
}

export function networkLabel(n: NetworkId): string {
  switch (n) {
    case 'undeployed':
      return 'Local devnet';
    case 'preview':
      return 'Preview testnet';
    case 'preprod':
      return 'Preprod testnet';
  }
}

export function getMidnightContractExplorerUrl(address: string, network: NetworkId = 'preprod'): string {
  const clean = address.replace(/^0x/i, '').trim();
  if (network === 'preview') {
    return `https://preview.midnightexplorer.com/contracts/0x${clean}`;
  }
  return `https://preprod.midnightexplorer.com/contracts/0x${clean}`;
}

export function get1amContractExplorerUrl(address: string): string {
  const clean = address.replace(/^0x/i, '').trim();
  return `https://explorer.1am.xyz/contract/${clean}`;
}

export function getMidnightTxExplorerUrl(txId: string, network: NetworkId = 'preprod'): string {
  const clean = txId.replace(/^0x/i, '').trim();
  if (network === 'preview') {
    return `https://preview.midnightexplorer.com/transactions/0x${clean}`;
  }
  return `https://preprod.midnightexplorer.com/transactions/0x${clean}`;
}

export function get1amTxExplorerUrl(txId: string): string {
  const clean = txId.replace(/^0x/i, '').trim();
  return `https://explorer.1am.xyz/tx/${clean}`;
}
