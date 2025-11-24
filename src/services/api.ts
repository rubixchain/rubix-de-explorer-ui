import { API_ENDPOINTS, USE_MOCK_DATA, NETWORK_CONFIG, STORAGE_KEYS } from "@/constants";
import {
  ApiResponse,
  Pagination,
  DID,
  Token,
  Transaction,
  Block,
  Validator,
  NetworkMetrics,
} from "@/types";

// Helper function to get current network's base URL
// Modified to always use testnet
export const getCurrentBaseUrl = (): string => {
  // Always return testnet base URL
  return NETWORK_CONFIG.testnet.baseUrl;

  /* Original network switching logic - commented out
  try {
    const selectedNetwork = localStorage.getItem(STORAGE_KEYS.SELECTED_NETWORK) || 'testnet';
    const baseUrl = selectedNetwork === 'mainnet'
      ? NETWORK_CONFIG.mainnet.baseUrl
      : NETWORK_CONFIG.testnet.baseUrl;

    return baseUrl;
  } catch (error) {
    console.error('Failed to get network from local storage:', error);
    return NETWORK_CONFIG.testnet.baseUrl;
  }
  */
};

// Helper function to get base URL for a specific network
// Modified to always use testnet regardless of network parameter
export const getBaseUrlForNetwork = (network: string): string => {
  // Always return testnet base URL, ignore network parameter
  return NETWORK_CONFIG.testnet.baseUrl;

  /* Original network switching logic - commented out
  const baseUrl = network === 'mainnet'
    ? NETWORK_CONFIG.mainnet.baseUrl
    : NETWORK_CONFIG.testnet.baseUrl;

  return baseUrl;
  */
};

const generateMockMetrics = (): NetworkMetrics => ({
  totalTransactions: 1234567,
  totalDIDs: 89432,
  //  activeValidators: 1247,
  //   totalPledge: 45200000,
  //   averageBlockTime: 2.3,
  //   networkHealth: 99.8,
});

const generateMockTransactions = (count: number = 20): Transaction[] => {
  const types: Array<
    "transfer" | "mint" | "burn" | "pledge" | "unpledge" | "deploy"
  > = ["transfer", "mint", "burn", "pledge", "unpledge", "deploy"];
  const statuses: Array<"pending" | "confirmed" | "failed"> = [
    "pending",
    "confirmed",
    "failed",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `tx_${Date.now()}_${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    sender: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
    receiver: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
    amount: Math.floor(Math.random() * 10000) + 100,
    blockHeight: 1234567 - i,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    validators: [],
    gasUsed: Math.floor(Math.random() * 21000) + 21000,
    gasPrice: Math.random() * 0.001 + 0.0001,
  }));
};

class ApiClient {
  // Getter for dynamic base URL based on current network
  private get baseUrl(): string {
    return getCurrentBaseUrl();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {

    if (USE_MOCK_DATA) {
      await new Promise((resolve) =>
        setTimeout(resolve, 300 + Math.random() * 200)
      );
      if (endpoint.includes("/metrics")) {
        return {
          data: generateMockMetrics() as T,
          success: true,
          message: "Mock data loaded successfully",
        };
      }

      if (endpoint.includes("/transactions")) {
        return {
          data: generateMockTransactions() as T,
          success: true,
          message: "Mock transactions loaded successfully",
        };
      }

      return {
        data: {} as T,
        success: true,
        message: "Mock data loaded successfully",
      };
    }

    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async search(query: string, type?: string) {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) =>
        setTimeout(resolve, 300 + Math.random() * 200)
      );

      // Generate mock search results based on query
      const mockResults = [];

      if (query.toLowerCase().includes("did") || query.startsWith("did:")) {
        mockResults.push({
          id: `did:rubix:${Math.random().toString(36).substr(2, 9)}`,
          type: "did",
          title: `DID: ${query}`,
          description: "Decentralized Identifier",
          value: Math.floor(Math.random() * 10000) + 100,
          timestamp: new Date().toISOString(),
        });
      }

      if (
        query.match(/^(RBT|FT|NFT|SC)-/) ||
        query.toLowerCase().includes("token")
      ) {
        mockResults.push({
          id: `${query.startsWith("RBT") ? "RBT" : "FT"}-${Math.random()
            .toString(36)
            .substr(2, 8)}`,
          type: "token",
          title: `Token: ${query}`,
          description: "Token Contract",
          value: Math.floor(Math.random() * 1000) + 10,
          timestamp: new Date().toISOString(),
        });
      }

      if (query.startsWith("0x") || query.toLowerCase().includes("tx")) {
        mockResults.push({
          id: `0x${Math.random().toString(16).substr(2, 40)}`,
          type: "transaction",
          title: `Transaction: ${query}`,
          description: "Blockchain Transaction",
          value: Math.floor(Math.random() * 500) + 1,
          timestamp: new Date().toISOString(),
        });
      }

      // Add some generic results if no specific pattern matches
      if (mockResults.length === 0) {
        mockResults.push({
          id: `search-${Math.random().toString(36).substr(2, 8)}`,
          type: "general",
          title: `Search result for: ${query}`,
          description: "General search result",
          value: Math.floor(Math.random() * 100) + 1,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        data: {
          query,
          type,
          results: mockResults,
          total: mockResults.length,
        },
        success: true,
        message: "Mock search completed successfully",
      };
    }

    const params = new URLSearchParams({ q: query });
    if (type) params.append("type", type);

    return this.request<any>(`${API_ENDPOINTS.SEARCH}?${params}`);
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    network?: string;
    // type?: string;
    // status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    // if (params?.type) searchParams.append("type", params.type);
    // if (params?.status) searchParams.append("status", params.status);

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(
        `${baseUrl}/txnblocks?${searchParams.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const txnResp = await response.json();

      const formatTimeAgo = (epoch: number): string => {
        if (!epoch) return "N/A";

        // Convert to milliseconds if needed
        const timestamp = epoch < 1e12 ? epoch * 1000 : epoch;
        const now = Date.now();
        const diff = Math.floor((now - timestamp) / 1000); // difference in seconds

        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
        return `${Math.floor(diff / 2592000)} months ago`;
      };

      const frontendTransactions = (txnResp.transactions_response || []).map(
        (txn: any) => {
          return {
            id: txn.txn_hash,
            type: txn.txn_type
              ? txn.txn_type.charAt(0).toUpperCase() + txn.txn_type.slice(1)
              : "Unknown",
            from: txn.sender_did || "N/A",
            to: txn.receiver_did || "N/A",
            value: `${Number(txn.amount || 0).toLocaleString("en-US", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })} RBT`,
            timestamp: formatTimeAgo(txn.txn_time),
            status: txn.status || "confirmed",
          };
        }
      );

      return {
        success: true,
        data: {
          transactions: frontendTransactions,
          count: txnResp.count
        }
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        success: false,
        message: "Failed to fetch transactions",
        data: {
          transactions: [],
          count: 0
        },
      };
    }
  }

  async getTransaction(id: string, network?: string) {
    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;
    try {
      const response = await fetch(`${baseUrl}/txnhash?hash=${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const txnInfo = await response.json();
      return txnInfo;
    } catch (error) {
      throw error;
    }
  }

  async getTokens(params?: {
    page?: number;
    limit?: number;
    network?: string;
    // type?: string;
    // owner?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    // if (params?.type) searchParams.append('type', params.type);
    // if (params?.owner) searchParams.append('owner', params.owner);

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(
        `${baseUrl}/getrbtlist?${searchParams.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const txnInfo = await response.json();
      return txnInfo;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getToken(id: string) {
    return this.request<Token>(`${API_ENDPOINTS.TOKENS}/${id}`);
  }

  async getDIDs(params?: { page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(
        `${baseUrl}/didwithmostrbts?${searchParams.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const didInfo = await response.json();
      return didInfo;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getDID(id: string) {
    return this.request<DID>(`${API_ENDPOINTS.DIDS}/${id}`);
  }

  async getValidators(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);

    return this.request<Validator[]>(
      `${API_ENDPOINTS.VALIDATORS}?${searchParams}`
    );
  }

  async getValidator(id: string) {
    return this.request<Validator>(`${API_ENDPOINTS.VALIDATORS}/${id}`);
  }

  async getBlocks(params?: {
    page?: number;
    limit?: number;
    from?: number;
    to?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.from) searchParams.append("from", params.from.toString());
    if (params?.to) searchParams.append("to", params.to.toString());

    return this.request<Block[]>(`${API_ENDPOINTS.BLOCKS}?${searchParams}`);
  }

  async getBlock(height: number) {
    return this.request<Block>(`${API_ENDPOINTS.BLOCKS}/${height}`);
  }

  async getMetrics(network?: string): Promise<{
    data: NetworkMetrics;
    success: boolean;
    message: string;
  }> {
    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;
    try {
      const [rbtRes, ftRes, didRes, txnsRes, scRes, nftRes] = await Promise.all(
        [
          fetch(`${baseUrl}/allrbtcount`).then((res) => res.json()),
          fetch(`${baseUrl}/allftcount`).then((res) => res.json()),
          fetch(`${baseUrl}/alldidcount`).then((res) => res.json()),
          fetch(`${baseUrl}/alltransactionscount`).then((res) =>
            res.json()
          ),
          fetch(`${baseUrl}/allsmartcontractscount`).then((res) =>
            res.json()
          ),
          fetch(`${baseUrl}/allnftcount`).then((res) => res.json()),
        ]
      );
      // Combine results
      const data: NetworkMetrics = {
        totalRBT: rbtRes.all_rbt_count || 0,
        totalFT: ftRes.all_ft_count || 0,
        totalDIDs: didRes.all_did_count || 0,
        totalTransactions: txnsRes.all_txn_count || 0,
        totalSmartContracts: scRes.all_sc_count || 0,
        totalNFT: nftRes.all_nft_count || 0,
      };

      return {
        data,
        success: true,
        message: "Metrics loaded successfully",
      };
    } catch (error) {
      console.error("Error fetching metrics:", error);
      return {
        data: generateMockMetrics(), // fallback to mock if error occurs
        success: false,
        message: "Failed to fetch metrics",
      };
    }
  }

  async getSCTransactions(params?: { page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(
        `${baseUrl}/sc-blocks?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const scTxns = await response.json();
      return scTxns;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getBurntTransactions(params?: { page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(
        `${baseUrl}/burnt-blocks?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const burntTxns = await response.json();
      return burntTxns;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

export const api = {
  search: (query: string, type?: string) => apiClient.search(query, type),
  getTransactions: (params?: any) => apiClient.getTransactions(params),
  getTransaction: (id: string, network?: string) => apiClient.getTransaction(id, network),
  getSCTransactions: (params: any) => apiClient.getSCTransactions(params),
  getBurntTransactions: (params?: any) =>
    apiClient.getBurntTransactions(params),
  getTokens: (params?: any) => apiClient.getTokens(params),
  getToken: (id: string) => apiClient.getToken(id),
  getDIDs: (params?: any) => apiClient.getDIDs(params),
  getDID: (id: string) => apiClient.getDID(id),
  getValidators: (params?: any) => apiClient.getValidators(params),
  getValidator: (id: string) => apiClient.getValidator(id),
  getBlocks: (params?: any) => apiClient.getBlocks(params),
  getBlock: (height: number) => apiClient.getBlock(height),
  getMetrics: (network?: string) => apiClient.getMetrics(network),
};
