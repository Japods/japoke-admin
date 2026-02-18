import { useState, useEffect, useCallback } from 'react';
import * as dashApi from '../api/dashboard';

export function useDashboard(dateRange = {}) {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [popularPokeTypes, setPopularPokeTypes] = useState([]);
  const [costAnalysis, setCostAnalysis] = useState([]);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const salesParams = {
        ...params,
        groupBy: 'day',
      };

      // If no date range, default to 30 days for sales
      if (!params.from) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        salesParams.from = thirtyDaysAgo.toISOString();
      }

      const [summaryRes, salesRes, popTypesRes, costRes, ratesRes] = await Promise.all([
        dashApi.getSummary(params),
        dashApi.getSales(salesParams),
        dashApi.getPopularPokeTypes(params),
        dashApi.getCostAnalysis(),
        dashApi.getExchangeRates().catch(() => ({ data: null })),
      ]);

      setSummary(summaryRes.data);
      setSales(salesRes.data || []);
      setPopularPokeTypes(popTypesRes.data || []);
      setCostAnalysis(costRes.data || []);
      setExchangeRates(ratesRes.data || null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    summary,
    sales,
    popularPokeTypes,
    costAnalysis,
    exchangeRates,
    loading,
    error,
    refetch: fetchAll,
  };
}
