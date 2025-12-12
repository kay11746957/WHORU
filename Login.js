import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useUser } from './UserContext';
import Axios from 'axios';
import { TextInput, Button, HelperText, Snackbar, Card } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import Logo from './assets/icon.png';
import Config from './config';
const { width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const { setUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarStyle, setSnackbarStyle] = useState(styles.snackbar);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      setSnackbarMessage('請輸入帳號和密碼');
      setSnackbarStyle(styles.snackbarError);
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);

    Axios.post(Config.ENDPOINTS.login, {
      username,
      password
    })
      .then(response => {
        setLoading(false);
        if (response.status === 200) {
          setUser(response.data.user);
          navigation.navigate('Home');
        } else {
          setSnackbarMessage('登入失敗');
          setSnackbarStyle(styles.snackbar);
          setSnackbarVisible(true);
        }
      })
      .catch(() => {
        setLoading(false);
        setSnackbarMessage('登入失敗，請稍後再試~');
        setSnackbarStyle(styles.snackbar);
        setSnackbarVisible(true);
      });
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeTitle}>Welcome to WHORU</Text>
      <Image source={Logo} style={styles.logo} />
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.title}>會員登入</Text>
          </View>

          <TextInput
            label="帳號"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            onBlur={() => setUsernameError(!username)}
            theme={{ colors: { text: '#FFFFFF', placeholder: '#888', primary: '#444' } }}
          />
          <TextInput
            label="密碼"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            onBlur={() => setPasswordError(!password)}
            theme={{ colors: { text: '#FFFFFF', placeholder: '#888', primary: '#444' } }}
          />
          <HelperText type="error" visible={usernameError || passwordError}>
            帳號和密碼為必填
          </HelperText>
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            立即登入
          </Button>
          <View style={styles.registerContainer}>
            <TouchableOpacity onPress={handleRegister} style={styles.registerLinkContainer}>
              <FontAwesome name="user-plus" size={16} color="#007ea7" />
              <Text style={styles.registerLink}>建立一個帳號</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
              <FontAwesome name="question-circle" size={16} color="#007ea7" />
              <Text style={styles.forgotPasswordLink}>忘記密碼</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>
    </View>
  );
}

// App component (在這裡設置導航)
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerStyle: {
              backgroundColor: '#0F1529', // 修改標題欄背景顏色
            },
            headerTintColor: '#FFFFFF', // 修改返回按鈕和標題顏色
            headerTitleStyle: {
              fontSize: 20, // 標題字體大小
              fontWeight: 'bold', // 標題字體加粗
            },
          }}
        />
        {/* 其他頁面 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1529',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 15,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  card: {
    width: width - 40,
    marginBottom: 60,
    backgroundColor: '#FFFFFF', // 卡片背景色
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000', // 黑色標題文字
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 5,
    backgroundColor: '#007ea7', // 藍色按鈕背景
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  snackbar: {
    backgroundColor: '#323232', // 黑灰訊息框
  },
  snackbarText: {
    textAlign: 'center',
    color: '#FFFFFF',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerLink: {
    color: '#007ea7',
    fontSize: 16,
    marginLeft: 5,
    textAlign: 'center',
    marginBottom: 5,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotPasswordLink: {
    color: '#007ea7',
    fontSize: 16,
    marginLeft: 5,
    textAlign: 'center',
    marginBottom: 5,
  },
});
