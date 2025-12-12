import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TextInput, Button, Card, Title, Snackbar } from 'react-native-paper';
import Axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import Config from './config';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // 驗證輸入信箱格式
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // 驗證生日格式
  const validateDate = (date) => {
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(date)) return false;
    const [year, month, day] = date.split('-').map(Number);
    const isValidDate = (year >= 1900 && year <= 2100) &&
      (month >= 1 && month <= 12) &&
      (day >= 1 && day <= 31);
    return isValidDate;
  };

  const formatDate = (date) => {
    if (/^\d{8}$/.test(date)) {
      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = date.slice(6, 8);
      return `${year}-${month}-${day}`;
    }
    return date;
  };

  const handleRegister = () => {
    if (!username || !password || !name || !email || !birthday) {
      setSnackbarMessage('您好像漏了些什麼');
      setSnackbarVisible(true);
      return;
    }

    if (!validateEmail(email)) {
      setSnackbarMessage('您的電子郵件格式不正確');
      setSnackbarVisible(true);
      return;
    }

    if (password.length < 6) {
      setSnackbarMessage('您的密碼必須至少6個字');
      setSnackbarVisible(true);
      return;
    }

    const formattedBirthday = formatDate(birthday);
    if (!validateDate(formattedBirthday)) {
      setSnackbarMessage('生日格式不正確，請輸入YYYYMMDD');
      setSnackbarVisible(true);
      return;
    }

    Axios.post(Config.ENDPOINTS.register, {
      username: username,
      password: password,
      name: name,
      email: email,
      birthday: formattedBirthday
    })
      .then(response => {
        if (response.status === 200) {
          setSnackbarMessage('註冊成功');
          setSnackbarVisible(true);
          setTimeout(() => {
            navigation.navigate('Login');
          }, 2000); // Delay navigation to allow Snackbar to be visible
        } else {
          setSnackbarMessage('註冊失敗');
          setSnackbarVisible(true);
        }
      })
      .catch(error => {
        //console.error('註冊用戶時出錯: ', error);
        setSnackbarMessage(`註冊失敗: ${error.response ? error.response.data.error : error.message}`);
        setSnackbarVisible(true);
      });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <FontAwesome name="user-plus" size={24} color="black" />
          <Title style={styles.title}>註冊新帳號</Title>
        </View>
        <Card.Content>
          <TextInput
            label="帳號"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="密碼 (至少6位數)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="會員名稱"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="電子郵件"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="生日 (YYYYMMDD)"
            value={birthday}
            onChangeText={setBirthday}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleRegister} style={styles.button}>
            註冊
          </Button>
        </Card.Content>
      </Card>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: '關閉',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1529',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007ea7',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 10,
  },
  snackbar: {
    backgroundColor: '#323232',
  },
  snackbarText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});