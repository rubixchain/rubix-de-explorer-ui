import { useEffect, useState } from "react";

export const useFormatAddress = (
  desktopLength = 20,
  mobileLength = 8
) => {
  const isMobile = useIsMobile();

  return (address: string): string => {
    if (!address || address === "N/A") return address;

    const length = isMobile ? mobileLength : desktopLength;
    if (address.length <= length * 2) return address;

    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const listener = () => setIsMobile(media.matches);

    listener();
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
};
