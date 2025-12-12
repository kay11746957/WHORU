import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import Config from './config';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarStyle, setSnackbarStyle] = useState(styles.snackbar);

  const handleResetPassword = async () => {
    setLoading(true);

    try {
      const response = await fetch(Config.ENDPOINTS.forgot, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbarMessage(data.message); // 可能是「郵件已發送成功」
        setSnackbarStyle(styles.snackbarSuccess);
      } else {
        setSnackbarMessage(data.error); // 顯示錯誤訊息
        setSnackbarStyle(styles.snackbarError);
      }
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('發生錯誤，請稍後再試。');
      setSnackbarStyle(styles.snackbarError);
      setSnackbarVisible(true);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>忘記密碼</Text>
      <TextInput
        label="請輸入註冊的電子郵件"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleResetPassword}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        重設密碼
      </Button>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[snackbarStyle, styles.snackbarPosition]}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    width: '100%',
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  snackbar: {
    backgroundColor: '#323232',
  },
  snackbarSuccess: {
    backgroundColor: 'green',
  },
  snackbarError: {
    backgroundColor: 'red',
  },
  snackbarText: {
    textAlign: 'center',
    color: '#fff',
  },
  snackbarPosition: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
  },
});

export default ForgotPassword;
