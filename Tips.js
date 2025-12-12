import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import Axios from 'axios';
import Config from './config';

export default function MyCalls() {
  const [knowledgeData, setKnowledgeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');

  useEffect(() => {
    Axios.get(Config.ENDPOINTS.knowledge)
      .then(response => {
        setKnowledgeData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching knowledge data: ', error);
        setLoading(false);
      });
  }, []);

  const renderItem = ({ item }) => {
    // 使用新的 K_ImageURL 欄位
    const imageUri = item.K_ImageURL;

    return (
      <Card style={styles.card}>
        {imageUri ? (
          <Card.Cover
            source={{ uri: imageUri }}
            style={styles.image}
            onError={(error) => console.log('圖片載入失敗:', imageUri)}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📷 暫無圖片</Text>
          </View>
        )}
        <Card.Content>
          <Title style={styles.title}>{item.K_Content}</Title>
          <Paragraph style={styles.paragraph}>{new Date(item.K_Update_Time).toLocaleString()}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            style={styles.linkButton} // 使用新的樣式
            onPress={() => {
              setWebViewUrl(item.K_Source);
              setWebViewVisible(true);
            }}
          >
            連結
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {webViewVisible ? (
        <WebView
          source={{ uri: webViewUrl }}
          style={{ flex: 1 }}
          onError={() => setWebViewVisible(false)}
          onHttpError={() => setWebViewVisible(false)}
          onLoadEnd={() => setLoading(false)}
        />
      ) : (
        loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <FlatList
            data={knowledgeData}
            renderItem={renderItem}
            keyExtractor={item => item.K_Id.toString()}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#0F1529', // 深色背景
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#1C1C1E', // 深灰色卡片背景
    borderRadius: 10,            // 卡片圓角
    borderWidth: 1,              // 卡片邊框寬度
    borderColor: '#3A3A3C',      // 淺灰色邊框顏色
    elevation: 2,                // 提升陰影效果
  },
  image: {
    height: 200, // 圖片高度
    resizeMode: 'cover',
  },
  title: {
    fontWeight: 'bold', // 加粗標題
    fontSize: 18,       // 字體大小
    color: '#FFFFFF',   // 白色字體顏色
  },
  paragraph: {
    fontSize: 14,       // 字體大小
    color: '#E0E0E0',   // 淺灰色字體顏色
  },
  linkButton: {
    backgroundColor: '#00a8e8', // 藍色背景
    borderRadius: 8,             // 圓角
  },
  placeholderImage: {
    backgroundColor: '#2A2A2C', // 深灰色占位背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#8E8E93',
    fontSize: 16,
  },
});
