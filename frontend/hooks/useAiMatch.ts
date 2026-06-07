'use client';

import { useState } from 'react';
import {
  aiEndpoints,
  MatchPayload,
  RewritePayload,
  MatchResponse,
  AiAnalysis,
} from '@/lib/endpoints';

export function useAiMatch() {
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [rewriteResult, setRewriteResult] = useState<string | null>(null);
  const [history, setHistory] = useState<AiAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = async (payload: MatchPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiEndpoints.match(payload);
      setMatchResult(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail ?? 'AI match failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const rewrite = async (payload: RewritePayload) => {
    setRewriteLoading(true);
    setError(null);
    try {
      const res = await aiEndpoints.rewrite(payload);
      setRewriteResult(res.data.rewritten_summary);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail ?? 'AI rewrite failed. Try again.');
    } finally {
      setRewriteLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await aiEndpoints.history();
      setHistory(res.data);
    } catch {
      // history is non-critical
    }
  };

  return {
    data: matchResult,
    matchResult,
    rewriteResult,
    history,
    loading,
    rewriteLoading,
    error,
    match,
    rewrite,
    fetchHistory,
  };
}
