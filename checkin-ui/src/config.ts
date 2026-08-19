export type NetworkId = 'undeployed' | 'preview' | 'preprod';

const NETWORK_IDS: readonly NetworkId[] = ['undeployed', 'preview', 'preprod'];
export const CONTRACT_OVERRIDE_KEY = 'aec:contract-address';

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

function defaultEndpoints(network: NetworkId) {
  switch (network) {
    case 'preprod':
      return {
        indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
        indexerWs: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
        prover: 'https://proof-server.preprod.midnight.network',
      };
    case 'preview':
      return {
        indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
        indexerWs: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
        prover: 'https://proof-server.preview.midnight.network',
      };
    case 'undeployed':
      return {
        indexer: 'http://127.0.0.1:8088/api/v4/graphql',
        indexerWs: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
        prover: 'http://localhost:6300',
      };
  }
}

function envConfig(): AppConfig {
  const fallback = 'preprod';
  const rawNetwork = (
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
      'ed3c0b8bbdc6e2405d1b606dfe38ef7d895ad95c9d7ecd69b68b4c2a0fa5e68b',
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
