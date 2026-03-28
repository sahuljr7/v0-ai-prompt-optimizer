'use client';

import { useSessions, Session } from './use-sessions';

export interface TranscriptSessionData {
  transcript: string;
  analysis: string;
  uploadedFileName?: string;
  uploadedFileSize?: number;
  isAnalyzing: boolean;
}

const TRANSCRIPT_STORAGE_KEY = 'transcript-sessions';

export function useTranscriptSessions() {
  const sessions = useSessions<TranscriptSessionData>({
    storageKey: TRANSCRIPT_STORAGE_KEY,
  });

  const createTranscriptSession = (initialTranscript: string = '') => {
    return sessions.createSession(
      {
        transcript: initialTranscript,
        analysis: '',
        uploadedFileName: undefined,
        uploadedFileSize: undefined,
        isAnalyzing: false,
      },
      'New Analysis'
    );
  };

  const getActiveSession = (): Session<TranscriptSessionData> | undefined => {
    return sessions.getActiveSession();
  };

  const updateSessionTranscript = (transcript: string) => {
    if (sessions.activeSessionId) {
      const activeSession = sessions.getActiveSession();
      if (activeSession) {
        sessions.updateSessionData(sessions.activeSessionId, {
          ...activeSession.data,
          transcript,
        });
      }
    }
  };

  const updateSessionAnalysis = (analysis: string) => {
    if (sessions.activeSessionId) {
      const activeSession = sessions.getActiveSession();
      if (activeSession) {
        sessions.updateSessionData(sessions.activeSessionId, {
          ...activeSession.data,
          analysis,
        });
      }
    }
  };

  const updateSessionFileInfo = (fileName: string, fileSize: number) => {
    if (sessions.activeSessionId) {
      const activeSession = sessions.getActiveSession();
      if (activeSession) {
        sessions.updateSessionData(sessions.activeSessionId, {
          ...activeSession.data,
          uploadedFileName: fileName,
          uploadedFileSize: fileSize,
        });
      }
    }
  };

  const updateSessionAnalyzing = (isAnalyzing: boolean) => {
    if (sessions.activeSessionId) {
      const activeSession = sessions.getActiveSession();
      if (activeSession) {
        sessions.updateSessionData(sessions.activeSessionId, {
          ...activeSession.data,
          isAnalyzing,
        });
      }
    }
  };

  return {
    ...sessions,
    createTranscriptSession,
    getActiveSession,
    updateSessionTranscript,
    updateSessionAnalysis,
    updateSessionFileInfo,
    updateSessionAnalyzing,
  };
}
