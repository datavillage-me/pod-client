import { getCurrentPod, Pod } from "@datavillage-me/pod-client";
import { useCallback, useState } from "react";

export function usePod(): Pod | undefined {
  const [pod, setPod] = useState<Pod>();

  const fetchPod = useCallback(async () => {
    if (!pod) setPod(await getCurrentPod());
  }, [pod]);

  fetchPod();

  return pod;
}
