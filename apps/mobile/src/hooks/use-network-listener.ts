import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { processTranscriptionQueue } from "@/services/transcription-queue";
import { supabase } from "@/lib/supabase";

/**
 * Hook that listens for network connectivity changes and processes
 * pending transcriptions when connection is restored
 */
export function useNetworkListener() {
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected === true && state.isInternetReachable !== false;

      // If we just came back online, process pending transcriptions
      if (isOnline && wasOfflineRef.current) {
        console.log("Network connection restored, processing transcription queue");

        // Wait a bit for Supabase session to refresh, then process queue
        setTimeout(async () => {
          try {
            // Ensure we have a valid session before processing
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              await processTranscriptionQueue();
            } else {
              console.warn("No valid session, skipping transcription queue");
            }
          } catch (error) {
            console.error("Failed to process transcription queue:", error);
          }
        }, 2000); // Wait 2 seconds for session refresh
      }

      wasOfflineRef.current = !isOnline;
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
