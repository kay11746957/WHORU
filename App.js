import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, Dimensions, Alert, Linking, NativeEventEmitter } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, Text, Card } from 'react-native-paper';
import { UserProvider } from './UserContext';
import * as Updates from 'expo-updates';
import LocalVideos from './LocalVideos';
import Tips from './Tips';
import Detection from './Detection';
import Login from './Login';
import Register from './Register';
import Member from './member';
import Logo from './assets/icon.png';
import ForgotPassword from './ForgotPassword';
import EditPassword from './EditPassword';
import RecordScreen from 'react-native-record-screen';
import * as MediaLibrary from 'expo-media-library';
import { EvilIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

// HomeScreen component
function HomeScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      try {
        // 請求媒體庫權限（包含照片和影片）
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            '權限要求',
            '請開啟媒體庫存取權限以便APP功能運作。您可以在手機設定中手動開啟權限。',
            [{ text: '了解' }],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error('Failed to check permissions:', error);
      }
    };
    checkAndRequestPermissions();
  }, []);


  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const navigateToMemberCenter = () => {
    navigation.navigate('Member');
  };

  const handleStartRecording = async () => {
    // 檢查是否在 Expo Go 中運行
    Alert.alert(
      '功能限制',
      '螢幕錄製功能需要完整的開發建置(Development Build)，Expo Go 不支援此功能。\n\n若要使用此功能，請建立 Development Build。',
      [{ text: '了解' }]
    );
    return;

    // 原始錄製邏輯（在 Development Build 中才會執行）
    try {
      const res = await RecordScreen.startRecording();
      if (!res) {
        console.error('Failed to start recording: Response is undefined');
      } else if (res && res.includes('PermissionError')) {
        console.error('Permission error: User denied access.');
      } else {
        setIsRecording(true);
        console.log('Recording started', res);
      }
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('錯誤', '無法啟動螢幕錄製');
    }
  };

  const handleStopRecording = async () => {
    Alert.alert(
      '功能限制',
      '螢幕錄製功能需要完整的開發建置，Expo Go 不支援此功能。',
      [{ text: '了解' }]
    );
    return;

    // 原始停止錄製邏輯
    try {
      const res = await RecordScreen.stopRecording();
      if (res) {
        const url = res.result.outputURL;
        console.log('Recording stopped. Saved to:', url);

        // Save the recording to the gallery
        saveRecordingToGallery(url);

        setIsRecording(false);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const saveRecordingToGallery = async (videoPath) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(videoPath);
      await MediaLibrary.createAlbumAsync('WHORU', asset, false);
      console.log('影片已保存:', videoPath);
    } catch (error) {
      //console.error('保存影片至畫廊失敗', error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <Text style={styles.title}>WHORU</Text>
          </View>
          <Image source={Logo} style={styles.logo} />

          <Button
            mode="contained"
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('Member')}
            icon={() => (
              <View style={[styles.iconContainer, styles.userIconContainer]}>
                <FontAwesome name="user-circle-o" size={20} style={styles.icon} />
              </View>
            )}
          >
            會員中心
          </Button>

          <Button
            mode="contained"
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('LocalVideos')}
            icon={() => (
              <View style={[styles.iconContainer, styles.archiveIconContainer]}>
                <FontAwesome name="archive" size={20} style={styles.icon} />
              </View>
            )}
          >
            檢測紀錄
          </Button>

          <Button
            mode="contained"
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('Tips')}
            icon={() => (
              <View style={[styles.iconContainer, styles.questionIconContainer]}>
                <FontAwesome name="question-circle-o" size={24} style={styles.icon} />
              </View>
            )}
          >
            反詐騙小知識
          </Button>

          <Button
            mode="contained"
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('Detection')}
            icon={() => (
              <View style={[styles.iconContainer, styles.cameraIconContainer]}>
                <FontAwesome name="camera" size={20} style={styles.icon} />
              </View>
            )}
          >
            檢測影片
          </Button>

          <Button
            mode="contained"
            style={[styles.button, isRecording ? styles.buttonRecording : styles.buttonNotRecording]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={handleStartRecording}
            disabled={isRecording}
            icon={() => (
              <View style={styles.iconContainer}>
                <FontAwesome name="play-circle-o" size={24} style={styles.playIcon} />
              </View>
            )}
          >
            開始錄影
          </Button>

          <Button
            mode="contained"
            style={[styles.button, !isRecording ? styles.buttonRecording : styles.buttonNotRecording]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={handleStopRecording}
            disabled={!isRecording}
            icon={() => (
              <View style={styles.iconContainer}>
                <FontAwesome name="stop-circle-o" size={24} style={styles.stopIcon} />
              </View>
            )}
          >
            停止錄影
          </Button>

        </Card.Content>
      </Card>
      <StatusBar style="auto" />
    </View>
  );
}

// Stack Navigator
const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // Only check for updates if not in Expo Go
    if (process.env.EXPO_LOCAL_DEV) {
      const checkForUpdates = async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        } catch (e) {
          console.error(e);
        }
      };

      checkForUpdates();
    }
  }, []);

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerTitle: '登入' }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerTitle: '註冊' }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerTitle: '首頁', headerLeft: null }} // 移除返回按鈕
          />
          <Stack.Screen
            name="LocalVideos"
            component={LocalVideos}
            options={{ headerTitle: '檢測紀錄' }}
          />
          <Stack.Screen
            name="Tips"
            component={Tips}
            options={{ headerTitle: '反詐騙小知識' }}
          />
          <Stack.Screen
            name="Detection"
            component={Detection}
            options={{ headerTitle: '檢測影片' }}
          />
          <Stack.Screen
            name="Member"
            component={Member}
            options={{ headerTitle: '會員中心' }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{ headerTitle: '忘記密碼' }}
          />
          <Stack.Screen
            name="EditPassword"
            component={EditPassword}
            options={{ headerTitle: '變更密碼' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  button: {
    marginVertical: 10,
    width: '80%',
    backgroundColor: '#333333',
  },
  buttonLabel: {
    fontSize: 16,
    color: 'white',
    paddingHorizontal: 10,
  },
  buttonContent: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 20,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  // 新增的各種 icon 的背景樣式
  userIconContainer: {
    backgroundColor: '#0070BB',
  },
  archiveIconContainer: {
    backgroundColor: '#8806CE',
  },
  questionIconContainer: {
    backgroundColor: '#03C03C',
  },
  cameraIconContainer: {
    backgroundColor: '#FFBF00',
  },
  icon: {
    color: 'white',
  },
  buttonRecording: {
    backgroundColor: '#C0C0C0',
  },
  buttonNotRecording: {
    backgroundColor: '#fb8500',
  },
  playIcon: {
    color: 'white', // 開始錄影的圖標顏色
  },
  stopIcon: {
    color: 'white', // 停止錄影的圖標顏色
  },
});


