import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { Info, ArrowLeft, Coins } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDIDInfo, useFTHoldings } from "@/hooks/useDIDs";

/* -----------------------------------------
   Hook: Detect Mobile Screen
------------------------------------------ */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)"); // Tailwind sm
    const listener = () => setIsMobile(media.matches);

    listener(); // initial
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
};

export const DIDExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const did = searchParams.get("did") || "";

  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<"holdings" | "ftholdings">(
    "holdings"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: didData, isLoading: isLoadingDID, error: didError } =
    useDIDInfo(did, currentPage, itemsPerPage) as any;

  const { data: ftData, isLoading: isLoadingFT, error: ftError } =
    useFTHoldings(
      did,
      currentPage,
      itemsPerPage,
      activeTab === "ftholdings"
    ) as any;

  const loading = activeTab === "holdings" ? isLoadingDID : isLoadingFT;

  /* -----------------------------------------
     Helper: Responsive Address Formatter
  ------------------------------------------ */
  const formatAddress = (
    address: string,
    desktopLength = 30,
    mobileLength = 6
  ): string => {
    if (!address || address === "N/A") return address;

    const length = isMobile ? mobileLength : desktopLength;
    if (address.length <= length * 2) return address;

    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  /* -----------------------------------------
     Loading State
  ------------------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  /* -----------------------------------------
     Error State
  ------------------------------------------ */
  if (didError || ftError || !didData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading DID</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const totalPages =
    activeTab === "holdings"
      ? Math.ceil(didData.count / itemsPerPage)
      : Math.ceil((ftData?.length || 1) / itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      {/* DID Info */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">DID Explorer</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Tooltip content={didData.did.did}>
            <span className="font-mono text-primary-600 truncate max-w-[70vw]">
              {formatAddress(didData.did.did, 50, 8)}
            </span>
          </Tooltip>
          <CopyButton text={didData.did.did} size="sm" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ["Total RBTs", didData.did.total_rbts],
          ["Total FTs", didData.did.total_fts],
          ["Total NFTs", didData.did.total_nfts],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card className="p-4">
        <div className="flex gap-4 border-b mb-4">
          {["holdings", "ftholdings"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as any);
                setCurrentPage(1);
              }}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600"
              }`}
            >
              <Coins className="inline w-4 h-4 mr-1" />
              {tab === "holdings" ? "Token Holdings" : "FT Holdings"}
            </button>
          ))}
        </div>

        {/* Holdings */}
        {(activeTab === "holdings" ? didData.rbts : ftData)?.map((item: any) => {
          const id = item.rbt_id || item.ft_id;
          console.log("Rendering item:", item);
          return (
            <div
              key={id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded border mb-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Tooltip content={id}>
                  <p
                    className="truncate text-sm cursor-pointer hover:text-primary-600"
                    onClick={() =>
                      navigate(`/token-explorer?token=${id}`)
                    }
                  >
                    {formatAddress(id)}
                  </p>
                </Tooltip>
                <CopyButton text={id} size="sm" />
              </div>

              <p className="font-semibold text-sm whitespace-nowrap">
                {item.token_value || 0} {item.rbt_id ? "RBT" : "FT"}
              </p>
            </div>
          );
        })}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={
            activeTab === "holdings" ? didData.count : ftData?.length || 0
          }
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </motion.div>
  );
};
