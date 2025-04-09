import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const App = () => {
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = 'fca_live_DA2u71w5DCQfIw00CJrXvMEJ0F5pZazyNRn8z5Eg';
  const API_URL = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&currencies=KRW,VND`;

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        setExchangeRates(data.data); // 데이터의 `data` 키에 환율 정보가 있음
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>환율 데이터를 가져오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>오류 발생: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>실시간 환율</Text>
      {exchangeRates && (
        <>
          <Text style={styles.rate}>
            USD → KRW: {exchangeRates.KRW.toLocaleString()} 원
          </Text>
          <Text style={styles.rate}>
            USD → VND: {exchangeRates.VND.toLocaleString()} 동
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  rate: {
    fontSize: 18,
    marginVertical: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default App;
