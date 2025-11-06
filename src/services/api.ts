import { API_ENDPOINTS, USE_MOCK_DATA } from "@/constants";
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
  private baseUrl: string;

  constructor(baseUrl: string = API_ENDPOINTS.BASE_URL) {
    this.baseUrl = baseUrl;
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
    // type?: string;
    // status?: string;
  }) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    // if (params?.type) searchParams.append("type", params.type);
    // if (params?.status) searchParams.append("status", params.status);

    try {
      console.log("test")
      const response = await fetch(
        `${API_BASE_URL}/txnblocks?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const txnResp = await response.json();
      console.log("test", txnResp)

      const frontendTransactions = (txnResp.transactions_response || []).map(
        (txn: any) => {
          // --- Inline timeAgo formatter ---
      
          return {
            id: txn.txn_hash,
            type: txn.txn_type
              ? txn.txn_type.charAt(0).toUpperCase() + txn.txn_type.slice(1)
              : "Unknown",
            from: txn.sender_did || "N/A",
            to: txn.receiver_did || "N/A",
            value: `${Number(txn.amount || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} RBT`,
            epoch: txn.txn_time,
            status: txn.status || "confirmed",
          };
        }
      );

      frontendTransactions.count = txnResp.count;

      return { success: true, data: frontendTransactions };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        success: false,
        message: "Failed to fetch transactions",
        data: [],
      };
    }
  }

  async getTransaction(id: string) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


    try {
      // const response = await fetch(`${this.baseUrl}/txnhash?hash=${id}`);
      const response = await fetch(`${API_BASE_URL}/txnhash?hash=${id}`);

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
    // type?: string;
    // owner?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    // if (params?.type) searchParams.append('type', params.type);
    // if (params?.owner) searchParams.append('owner', params.owner);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    try {
      const response = await fetch(
        `${API_BASE_URL}/getrbtlist?${searchParams.toString()}`
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

  async getDIDs(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    try {
      const response = await fetch(
        `${this.baseUrl}/didwithmostrbts?${searchParams.toString()}`
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

  async getMetrics(): Promise<{
    data: NetworkMetrics;
    success: boolean;
    message: string;
  }> {
    try {
      const [rbtRes, ftRes, didRes, txnsRes, scRes, nftRes] = await Promise.all(
        [
          fetch(`${this.baseUrl}/allrbtcount`).then((res) => res.json()),
          fetch(`${this.baseUrl}/allftcount`).then((res) => res.json()),
          fetch(`${this.baseUrl}/alldidcount`).then((res) => res.json()),
          fetch(`${this.baseUrl}/alltransactionscount`).then((res) =>
            res.json()
          ),
          fetch(`${this.baseUrl}/allsmartcontractscount`).then((res) =>
            res.json()
          ),
          fetch(`${this.baseUrl}/allnftcount`).then((res) => res.json()),
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

  async getSCTransactions(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    try {
      const response = await fetch(
        `${this.baseUrl}/sc-blocks?${searchParams.toString()}`
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

  async getBurntTransactions(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    try {
      const response = await fetch(
        `${this.baseUrl}/burnt-blocks?${searchParams.toString()}`
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
  getTransaction: (id: string) => apiClient.getTransaction(id),
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
  getMetrics: () => apiClient.getMetrics(),
};
