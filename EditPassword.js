import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useUser } from './UserContext';
import Config from './config';

const EditPassword = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('錯誤', '新密碼和確認密碼不符');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(Config.ENDPOINTS.editPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新密碼時發生錯誤');
      }

      const data = await response.json();
      Alert.alert('成功', data.message || '密碼已更新', [
        {
          text: '確定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('錯誤', error.message || '更新密碼時發生錯誤，請稍後再試');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>變更密碼</Title>
          <Paragraph>請輸入您的新密碼</Paragraph>
          <TextInput
            label="新密碼"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            label="確認新密碼"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            確認密碼並送出
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1529', // 深藍色背景
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF', // 白色卡片背景
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // 黑色標題文字
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f0f0f0', // 輕灰色輸入框背景
  },
  button: {
    marginTop: 15,
    backgroundColor: '#007ea7', // 藍色按鈕背景
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF', // 白色按鈕文字
  },
  Paragraph: {
    paddingBottom: 20,
    color: '#555', // 淡灰色段落文字
    fontSize: 16,
  },
});


export default EditPassword;
