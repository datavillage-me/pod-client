import { getCurrentPod, Pod } from "@datavillage-me/pod-client";
import { useMemo } from "react";

export function usePod(): Pod | undefined {
  return useMemo(() => getCurrentPod(), []);
}
