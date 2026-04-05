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
export const getCurrentBaseUrl = (): string => {
  return NETWORK_CONFIG.testnet.baseUrl;
};

// Helper function to get base URL for a specific network
export const getBaseUrlForNetwork = (network: string): string => {
  return NETWORK_CONFIG.testnet.baseUrl;
};

const generateMockMetrics = (): NetworkMetrics => ({
  totalTransactions: 1234567,
  totalDIDs: 89432,
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

const formatTimeAgo = (epoch: number): string => {
  if (!epoch) return "N/A";
  const timestamp = epoch < 1e12 ? epoch * 1000 : epoch;
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  const format = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? "" : "s"} ago`;
  if (diff < 60) return "just now";
  if (diff < 3600) return format(Math.floor(diff / 60), "min");
  if (diff < 86400) return format(Math.floor(diff / 3600), "hr");
  if (diff < 604800) return format(Math.floor(diff / 86400), "day");
  if (diff < 2592000) return format(Math.floor(diff / 604800), "week");
  return format(Math.floor(diff / 2592000), "month");
};

class ApiClient {
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
      if (query.match(/^(RBT|FT|NFT|SC)-/) || query.toLowerCase().includes("token")) {
        mockResults.push({
          id: `${query.startsWith("RBT") ? "RBT" : "FT"}-${Math.random().toString(36).substr(2, 8)}`,
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
        data: { query, type, results: mockResults, total: mockResults.length },
        success: true,
        message: "Mock search completed successfully",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/get-info?id=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    network?: string;
    did?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.did) searchParams.append("did", params.did);

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(
        `${baseUrl}/api/get-latest-transactions?${searchParams.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const txnResp = await response.json();

      // API formats: { data: [], total, total_pages } | array | { transactions_response: [], count }
      const txnArray = Array.isArray(txnResp)
        ? txnResp
        : Array.isArray(txnResp.data)
        ? txnResp.data
        : (txnResp.transactions_response || []);

      const frontendTransactions = txnArray.map((txn: any) => {
        const id = txn.transaction_id || txn.txn_hash;
        const from = txn.initiator || txn.sender_did || "N/A";
        const firstTokenId = txn.tokens && typeof txn.tokens === "object"
          ? (Object.values(txn.tokens).filter(Array.isArray).flat() as any[])[0]?.tokenId || null
          : null;
        const to = txn.owner || txn.receiver_did || firstTokenId || "N/A";
        const epoch = txn.epoch || txn.txn_time;
        const txnType = txn.txn_type
          ? txn.txn_type.charAt(0).toUpperCase() + txn.txn_type.slice(1)
          : "Transfer";

        // Derive value from tokens object or legacy amount field
        let value = "N/A";
        if (txn.amount !== undefined) {
          value = `${Number(txn.amount || 0).toLocaleString("en-US", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          })} RBT`;
        } else if (txn.tokens && typeof txn.tokens === "object") {
          const tokenCount = Object.values(txn.tokens).reduce(
            (sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0),
            0
          );
          value = `${tokenCount} token${tokenCount !== 1 ? "s" : ""}`;
        }

        return {
          id,
          type: txnType,
          from,
          to,
          value,
          amount: txn.amount,
          timestamp: formatTimeAgo(epoch),
          status: txn.status === true || txn.status === "true" ? "success" : txn.status === false || txn.status === "false" ? "failed" : "success",
          memo: txn.memo,
        };
      });

      return {
        success: true,
        data: {
          transactions: frontendTransactions,
          count: txnResp.total || txnResp.count || txnResp.all_transaction_count || frontendTransactions.length,
          totalPages: txnResp.total_pages,
        },
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        success: false,
        message: "Failed to fetch transactions",
        data: { transactions: [], count: 0 },
      };
    }
  }

  async getTransaction(id: string, network?: string) {
    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;
    try {
      const response = await fetch(`${baseUrl}/api/get-transaction-info?transactionID=${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async getTokens(params?: { page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/get-rbt-list?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getToken(id: string) {
    return this.request<Token>(`${API_ENDPOINTS.TOKENS}/${id}`);
  }

  // FT group list — all FT types with token counts
  async getFTList(params?: { page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/get-ft-group-list?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Individual FT tokens filtered by FT name
  async getFTListByFTName(params?: { ftName?: string; page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.ftName) searchParams.append("ftName", params.ftName);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/get-ft-list-by-ftname?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getDIDs(params?: { page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/get-did-with-most-rbts?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getDID(id: string) {
    return this.request<DID>(`${API_ENDPOINTS.DIDS}/${id}`);
  }

  // FT holders by FT name (maps to get-ft-list-by-ftname)
  async getFTHolders(params?: { ft_name?: string; page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.ft_name) searchParams.append("ftName", params.ft_name);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/get-ft-list-by-ftname?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Top holders for a specific FT (identified by name + creator DID)
  async getFTTopHolders(params: { ftName: string; creatorDID: string; page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams({ ftName: params.ftName, creatorDID: params.creatorDID });
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/get-ft-top-holders?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json() as Promise<{
        holders: Array<{ did: string; token_count: number }>;
        total_count: number;
        page: number;
        limit: number;
      }>;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // RBT token search suggestions
  async searchRBTSuggestions(query: string, limit: number = 10, network?: string) {
    const searchParams = new URLSearchParams({ query });
    if (limit) searchParams.append("limit", limit.toString());
    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;
    try {
      const response = await fetch(`${baseUrl}/api/search-rbt-suggestions?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json() as Promise<Array<{ token_id: string }>>;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Single RBT token info
  async getRBTInfo(tokenId: string, network?: string) {
    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;
    try {
      const response = await fetch(`${baseUrl}/api/get-rbt-info?tokenId=${encodeURIComponent(tokenId)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json() as Promise<{ token_id: string; owner_did: string; token_value: number }>;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // FT detail info (name, creator, value, supply, created time)
  async getFTInfo(ftName: string, creatorDID: string, network?: string) {
    const searchParams = new URLSearchParams({ ftName, creatorDID });
    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;
    try {
      const response = await fetch(`${baseUrl}/api/get-ft-info?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json() as Promise<{
        ft_name: string;
        creator_did: string;
        ft_value: number;
        total_amount: number;
        created_time: number;
      }>;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // FT name autocomplete suggestions
  async getFTSuggestions(query: string, limit: number = 10, network?: string) {
    const searchParams = new URLSearchParams({ query });
    if (limit) searchParams.append("limit", limit.toString());

    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/search-ft-suggestions?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json() as Promise<Array<{ ft_name: string; creator_did: string }>>;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getValidators(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    return this.request<Validator[]>(`${API_ENDPOINTS.VALIDATORS}?${searchParams}`);
  }

  async getValidator(id: string) {
    return this.request<Validator>(`${API_ENDPOINTS.VALIDATORS}/${id}`);
  }

  async getBlocks(params?: { page?: number; limit?: number; from?: number; to?: number }) {
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

  // Full transaction history for a specific token
  async getTransactionHistory(tokenID: string, params?: { page?: number; limit?: number; network?: string }) {
    const searchParams = new URLSearchParams({ tokenID });
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const baseUrl = params?.network ? getBaseUrlForNetwork(params.network) : this.baseUrl;

    try {
      const response = await fetch(`${baseUrl}/api/get-transaction-info-list?${searchParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Sequential transaction ID list for a token (provenance)
  async getTransactionIdList(tokenID: string, network?: string) {
    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;
    try {
      const response = await fetch(`${baseUrl}/api/get-transaction-id-list?tokenID=${tokenID}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getMetrics(network?: string): Promise<{
    data: NetworkMetrics;
    success: boolean;
    message: string;
  }> {
    const baseUrl = network ? getBaseUrlForNetwork(network) : this.baseUrl;

    try {
      const metricsCalls = Promise.all([
        fetch(`${baseUrl}/api/get-rbt-count`).then((res) => res.json()),
        fetch(`${baseUrl}/api/get-ft-count`).then((res) => res.json()),
        fetch(`${baseUrl}/api/get-did-count`).then((res) => res.json()),
        fetch(`${baseUrl}/api/get-txn-count`).then((res) => res.json()),
        fetch(`${baseUrl}/api/get-sc-count`).then((res) => res.json()),
        fetch(`${baseUrl}/api/get-nft-count`).then((res) => res.json()),
      ]);

      const kpiCall = fetch(
        "https://rexplorerapi.azurewebsites.net/api/Analytics/GetKPIDetails"
      ).then((res) => res.json());

      const [rbtRes, ftRes, didRes, txnsRes, scRes, nftRes] = await metricsCalls;
      const kpiRes = await kpiCall;

      const data: NetworkMetrics = {
        totalRBT: rbtRes.all_rbt_count || 0,
        totalFT: ftRes.all_ft_count || 0,
        totalDIDs: didRes.all_did_count || 0,
        totalTransactions: txnsRes.all_transaction_count || 0,  // fixed: was all_txn_count
        totalSmartContracts: scRes.all_sc_count || 0,
        totalNFT: nftRes.all_nft_count || 0,
        totalSupply: kpiRes?.data?.totalSupply || "0",
        maxSupply: kpiRes?.data?.maxSupply || "0",
        circulatingSupply: kpiRes?.data?.circulatingSupply || "0",
        rbtPrice: kpiRes?.data?.rbtPrice || "0",
        mainNetTVL: kpiRes?.data?.mainNetTVL || "0",
        subNetTVL: kpiRes?.data?.subNetTVL || "0",
        tvL_RBT: kpiRes?.data?.tvL_RBT?.replace(' $Mn', '') || "0",
      };

      return { data, success: true, message: "Metrics loaded successfully" };
    } catch (error) {
      console.error("Error fetching metrics:", error);
      return {
        data: generateMockMetrics(),
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
      const response = await fetch(`${baseUrl}/api/get-sc-list?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
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
      const response = await fetch(`${baseUrl}/burnt-blocks?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
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
  getBurntTransactions: (params?: any) => apiClient.getBurntTransactions(params),
  getTokens: (params?: any) => apiClient.getTokens(params),
  getFTList: (params?: any) => apiClient.getFTList(params),
  getFTListByFTName: (params?: any) => apiClient.getFTListByFTName(params),
  getFTSuggestions: (query: string, limit?: number, network?: string) => apiClient.getFTSuggestions(query, limit, network),
  getFTTopHolders: (params: any) => apiClient.getFTTopHolders(params),
  searchRBTSuggestions: (query: string, limit?: number, network?: string) => apiClient.searchRBTSuggestions(query, limit, network),
  getRBTInfo: (tokenId: string, network?: string) => apiClient.getRBTInfo(tokenId, network),
  getFTInfo: (ftName: string, creatorDID: string, network?: string) => apiClient.getFTInfo(ftName, creatorDID, network),
  getToken: (id: string) => apiClient.getToken(id),
  getDIDs: (params?: any) => apiClient.getDIDs(params),
  getFTHolders: (params?: any) => apiClient.getFTHolders(params),
  getDID: (id: string) => apiClient.getDID(id),
  getValidators: (params?: any) => apiClient.getValidators(params),
  getValidator: (id: string) => apiClient.getValidator(id),
  getBlocks: (params?: any) => apiClient.getBlocks(params),
  getBlock: (height: number) => apiClient.getBlock(height),
  getMetrics: (network?: string) => apiClient.getMetrics(network),
  getTransactionHistory: (tokenID: string, params?: any) => apiClient.getTransactionHistory(tokenID, params),
  getTransactionIdList: (tokenID: string, network?: string) => apiClient.getTransactionIdList(tokenID, network),
};
