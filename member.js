import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { EvilIcons } from '@expo/vector-icons';
import { useUser } from './UserContext';
import { useNavigation } from '@react-navigation/native';
import Logo from './assets/icon.png';

export default function Member() {
  const { user } = useUser();
  const navigation = useNavigation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setUTCDate(date.getUTCDate() + 1);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEditPassword = () => {
    navigation.navigate('EditPassword');
  };


  const handleLogout = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
      </View>
      <Card style={styles.card}>
        <Card.Content style={styles.header}>
          <EvilIcons name="user" size={38} color="black" style={styles.icon} />
          <Title style={styles.title}>個人資料</Title>
        </Card.Content>
        {user ? (
          <Card.Content>
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <Paragraph style={styles.label}>會員名稱</Paragraph>
              </View>
              <View style={styles.valueContainer}>
                <Paragraph style={styles.value}>{user.username}</Paragraph>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <Paragraph style={styles.label}>電子郵件</Paragraph>
              </View>
              <View style={[styles.valueContainer, { flexShrink: 1, flexWrap: 'nowrap' }]}>
                <Paragraph style={styles.value}>{user.email}</Paragraph>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <Paragraph style={styles.label}>生　　日</Paragraph>
              </View>
              <View style={styles.valueContainer}>
                <Paragraph style={styles.value}>{formatDate(user.birthday)}</Paragraph>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleEditPassword} style={[styles.button, styles.editPasswordButton]}>
                <Paragraph style={styles.buttonText}>變更密碼</Paragraph>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
                <Paragraph style={[styles.buttonText, styles.logoutButtonText]}>登出帳號</Paragraph>
              </TouchableOpacity>
            </View>
          </Card.Content>
        ) : (
          <Card.Content>
            <Paragraph style={styles.notLoggedIn}>尚未登入</Paragraph>
          </Card.Content>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // iOS風格的淺灰色背景
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF', // 白色背景
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333', // 黑色標題文字
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F7F8FA', // 單獨資料的背景顏色
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  labelContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  valueContainer: {
    flex: 2,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 15,
    color: '#888888', // 輕灰色標籤字體
  },
  value: {
    fontSize: 16,
    color: '#333333', // 深色文字
    fontWeight: '500',
  },
  notLoggedIn: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  editPasswordButton: {
    backgroundColor: '#007AFF', // iOS風格的藍色按鈕
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF3B30', // iOS風格的紅色邊框
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF3B30', // iOS風格的紅色文字
  },
});

