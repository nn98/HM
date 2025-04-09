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

  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_KEY = 'c0ea0a95ff56fcd86fefe33aab11e72f';
  const API_URL = `https://data.fixer.io/api/latest?access_key=${API_KEY}`;

useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Fixer.io 기본 통화는 EUR이므로 USD를 기준으로 환율 변환
        const rates = data.rates;
        const usdRate = rates['USD'];

        const formattedRates = {
        EUR: { KRW: rates['KRW'], USD: rates['USD'], VND: rates['VND'] },
        KRW: { EUR: 1/rates['KRW'], USD: rates['USD']/rates['KRW'], VND: rates['VND']/rates['KRW'] },
        USD: { EUR: 1/rates['USD'], KRW: 1/rates['USD']*rates['KRW'], VND: 1/rates['USD']*rates['VND'] },
        VND: { EUR: 1/rates['VND'], KRW: 1/rates['VND']*rates['KRW'], USD: 1/rates['VND']*rates['USD'] },
        };

        setExchangeRates(formattedRates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const currencyNames = {
    KRW: '원',
    EUR: '유로',
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
          if(targetCurrency in exchangeRates) {
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
    }
    setResult(conversionResults);
  }, [selectedCurrency, amount]); // selectedCurrency와 amount가 변경될 때 실행

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
      <Text style={styles.title}>실시간 환율</Text>
      {exchangeRates && (
        <>
          {/* KRW 비교 */}
          <Text style={styles.rate}>
            KRW → USD: {exchangeRates.KRW.USD.toFixed(5)}
          </Text>
          <Text style={styles.rate}>
            KRW → EUR: {exchangeRates.KRW.EUR.toFixed(5)}
          </Text>
          <Text style={styles.rate}>
            KRW → VND: {exchangeRates.KRW.VND.toFixed(5)}
          </Text>
          <Text></Text>

          {/* USD 비교 */}
          <Text style={styles.rate}>
            USD → KRW: {exchangeRates.USD.KRW.toFixed(5)}
          </Text>
          <Text style={styles.rate}>
            USD → EUR: {exchangeRates.USD.EUR.toFixed(5)}
          </Text>
          <Text style={styles.rate}>
            USD → VND: {exchangeRates.USD.VND.toFixed(5)}
          </Text>
          <Text></Text>

          {/* EUR 비교 */}
          <Text style={styles.rate}>
            EUR → KRW: {exchangeRates.EUR.KRW.toFixed(5)}
          </Text>
          <Text style={styles.rate}>
            EUR → USD: {exchangeRates.EUR.USD.toFixed(5)}
          </Text>
          <Text style={styles.rate}>
            EUR → VND: {exchangeRates.EUR.VND.toFixed(5)}
          </Text>
          <Text></Text>

          {/* VND 비교 */}
          <Text style={styles.rate}>
            VND → KRW: {exchangeRates.VND.KRW.toFixed(5)}
          </Text>
          <Text style={styles.rate}>
            VND → USD: {exchangeRates.VND.USD.toFixed(5)}
          </Text>
          <Text style={styles.rate}>
            VND → EUR: {exchangeRates.VND.EUR.toFixed(5)}
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
    backgroundColor: '#f5f6fa', // 배경색을 밝은 회색으로 변경
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50', // 텍스트 색상을 어두운 회색으로 변경
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7', // 입력 필드 테두리 색상을 밝은 회색으로 변경
    borderRadius: 10, // 둥근 모서리 추가
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18, // 폰트 크기 증가
    color: '#34495e', // 입력 텍스트 색상 변경
    backgroundColor: '#ffffff', // 입력 필드 배경색 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // 그림자 효과 추가
    marginBottom: 20,
  },
  currencyGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // 버튼이 화면 너비를 초과하면 다음 줄로 이동
    marginBottom: 20,
    gap: 10, // 버튼 간격 추가
  },
  currencyButton: {
    flexGrow: 1,
    minWidth: '30%', // 버튼 너비를 반응형으로 설정
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 10, // 둥근 모서리 추가
    backgroundColor: '#ecf0f1', // 버튼 배경색 변경
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007bff', // 선택된 버튼 배경색 변경
    borderColor: '#0056b3',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d', // 기본 버튼 텍스트 색상 변경
  },
  selectedText: {
    color: '#ffffff', // 선택된 버튼 텍스트 색상 변경
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 20, // 폰트 크기 증가
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  resultItem: {
    fontSize: 18, // 폰트 크기 증가
    color: '#27ae60', // 결과 텍스트 색상 변경 (녹색)
    marginBottom: 10,
  },
  rateBox: {
    flexDirection: 'row', // 텍스트와 값 나란히 배치
    justifyContent: 'space-between', // 좌우 정렬
    alignItems: 'center',
    paddingVertical: 10, // 상하 여백 추가
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#bdc3c7', // 테두리 색상
    borderRadius: 10, // 둥근 모서리
    backgroundColor: '#ffffff', // 박스 배경색
    width: '100%', // 박스 크기 고정
  },
  rate: {
    fontSize: 16,
    color: '#34495e',
  },
  rateValue: {
    fontSize: 16,
    color: '#3498db', // 값 강조 색상
    fontWeight: 'bold',
  },
})


export default App;
