import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

const App = () => {
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [result, setResult] = useState([]);
  const [isManualSelection, setIsManualSelection] = useState(false);

  const exchangeRates = {
    KRW: { USD: 0.00075, VND: 18.22 },
    USD: { KRW: 1331.4, VND: 24262.5 },
    VND: { KRW: 0.055, USD: 0.000041 },
  };

  const currencyNames = {
    KRW: '원',
    USD: '달러',
    VND: '동',
  };

  // 자동으로 화폐를 감지하는 함수
  const detectCurrency = (amount) => {
    const amountStr = amount.toString();
    if (amountStr.length <= 3) return 'USD';
    if (amountStr.length >= 4 && amountStr.slice(-3) === '000') return 'VND';
    return 'KRW';
  };

  // VND 포맷팅 함수
  const formatVND = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
      .format(value)
      .replace('₫', '')
      .trim() + ' 동';

  // 상태가 변경될 때마다 변환 로직 실행
  useEffect(() => {
    if (!selectedCurrency || !amount) {
      setResult([]);
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setResult([]);
      return;
    }

    const conversionResults = [];
    for (const targetCurrency in exchangeRates[selectedCurrency]) {
      if (targetCurrency !== selectedCurrency) {
        const convertedAmount =
          amountValue * exchangeRates[selectedCurrency][targetCurrency];
        const formattedAmount =
          targetCurrency === 'VND'
            ? formatVND(convertedAmount)
            : `${convertedAmount.toLocaleString()} ${currencyNames[targetCurrency]}`;
        conversionResults.push({
          currency: targetCurrency,
          value: formattedAmount,
        });
      }
    }
    setResult(conversionResults);
  }, [selectedCurrency, amount]); // selectedCurrency와 amount가 변경될 때 실행

  return (
    <View style={styles.container}>
      <Text style={styles.title}>실시간 화폐 변환기</Text>
      <TextInput
        style={styles.input}
        placeholder="금액을 입력하세요"
        keyboardType="numeric"
        value={amount}
        onChangeText={(text) => {
          setAmount(text);
          if (!isManualSelection) { // ✅ 수동 선택이 아닐 때만 자동 감지
              setSelectedCurrency(detectCurrency(text));
            }
        }}
      />
      <View style={styles.currencyGroup}>
        {Object.keys(currencyNames).map((currency) => (
          <TouchableOpacity
            key={currency}
            style={[
              styles.currencyButton,
              selectedCurrency === currency && styles.selectedButton,
            ]}
            onPress={() => {
                          setIsManualSelection(true);
                          setSelectedCurrency(currency);
                        }}
          >
            <Text
              style={[
                styles.currencyText,
                selectedCurrency === currency && styles.selectedText,
              ]}
            >
              {currencyNames[currency]} ({currency})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.result}>
        {result.length > 0 && (
          <>
            <Text style={styles.resultTitle}>
              {parseFloat(amount).toLocaleString()} {currencyNames[selectedCurrency]}의 환산 결과:
            </Text>
            <FlatList
              data={result}
              keyExtractor={(item) => item.currency}
              renderItem={({ item }) => (
                <Text style={styles.resultItem}>{item.value}</Text>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  currencyGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  currencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  selectedButton: {
    backgroundColor: '#007BFF',
    borderColor: '#0056b3',
  },
  currencyText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default App;
