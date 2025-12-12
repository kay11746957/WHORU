import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { useUser } from './UserContext';
import { Button, Text, Card, FAB } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import Config from './config';

export default function MyCalls() {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { user } = useUser();

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const videoUri = result.assets[0].uri;
      setVideo(videoUri);
      uploadVideo(videoUri);
    }
  };

  const uploadVideo = async (uri) => {
    if (!uri) {
      console.error('No URI provided for video upload');
      return;
    }

    setUploading(true);
    const videoInfo = await FileSystem.getInfoAsync(uri);
    if (!videoInfo.exists) {
      console.error('File does not exist at URI:', uri);
      setUploading(false);
      return;
    }

    let apiUrl = Config.ENDPOINTS.upload;
    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('video', {
      uri: videoInfo.uri,
      name: `video.${fileType}`,
      type: `video/${fileType}`,
    });

    if (user && user.id) {
      formData.append('userId', user.id);
    } else {
      console.error('User ID is not available');
      setUploading(false);
      return;
    }

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload success:', response.data);
      const videoId = response.data.videoId;
      setVideoId(videoId);
      pollForResult(videoId);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const pollForResult = (videoId) => {
    if (!videoId) {
      console.error('Invalid videoId:', videoId);
      setUploading(false);
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(Config.ENDPOINTS.videoResult(videoId));
        const result = response.data.result;
        if (result !== 'Pending') {
          setResult(result);
          clearInterval(intervalId);
          setUploading(false);
          setModalVisible(true); // 顯示結果彈出視窗
        }
      } catch (error) {
        console.error('Error fetching video result:', error);
        clearInterval(intervalId);
        setUploading(false);
      }
    }, 5000); // 每5秒鐘查詢一次結果
  };

  const handleFeedbackSubmit = () => {
    if (feedback.trim().length === 0) {
      Alert.alert('請輸入回饋');
      return;
    }

    // 提交反饋的邏輯 (例如發送到伺服器)
    console.log('Feedback submitted:', feedback);
    setFeedback('');
    setFeedbackModalVisible(false);
    Alert.alert('感謝您的回饋');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>
            <FontAwesome name="camera" size={24} color="#007ea7" /> 檢測影片
          </Text>
          <Text style={styles.paragraph}>
            把任何有換臉疑慮的影片都交給我！{'\n'}由WHORU幫你把關！
          </Text>
          <Button
            mode="text"
            onPress={pickVideo}
            style={styles.dashedButton}
            icon={() => (
              <FontAwesome
                name="upload"
                size={24}
                color="#007ea7" // 按鈕圖標顏色
              />
            )}
          >
            <Text style={{ color: '#007ea7', fontWeight: 'bold' }}>上傳影片</Text>
          </Button>

          {uploading && <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
              setModalVisible(false);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>檢測結果</Text>
                <Text style={styles.modalResult}>{result}</Text>
                <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  關閉
                </Button>
              </View>
            </View>
          </Modal>

          {/* 反饋彈出視窗 */}
          <Modal
            visible={feedbackModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
              setFeedbackModalVisible(false);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.feedbackModalContent}>
                <Text style={styles.feedbackModalTitle}>回報問題</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="請輸入您的問題或意見回饋"
                  style={styles.feedbackTextInput}
                />
                <Button mode="contained" onPress={handleFeedbackSubmit} style={styles.feedbackModalButton}>
                  提交
                </Button>
                <Button mode="text" onPress={() => setFeedbackModalVisible(false)} style={styles.feedbackCancelButton}>
                  <Text style={styles.feedbackCancelButtonText}>取消</Text>
                </Button>
              </View>
            </View>
          </Modal>
        </Card.Content>
      </Card>

      {/* 浮動按鈕 */}
      <FAB
        style={styles.fab}
        label="回報問題"
        onPress={() => setFeedbackModalVisible(true)}
        color="white"
        icon={() => <FontAwesome name="exclamation-circle" size={24} color="white" />} // 使用 FontAwesome 的圖標
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1529', // 深藍背景色
    padding: 20,
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF', // 白色卡片背景
    borderRadius: 10,
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
  button: {
    marginTop: 20,
    backgroundColor: '#007ea7', // 藍色按鈕
    borderRadius: 8,
    paddingVertical: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#555', // 中灰色文字
    marginBottom: 20,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 20,
    color: '#007ea7', // 藍色 Spinner 顏色
  },
  result: {
    fontSize: 18,
    color: '#333', // 深灰色文字
    marginTop: 20,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑色背景
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF', // 白色彈窗背景
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', // 深灰色標題文字
    marginBottom: 20,
  },
  modalResult: {
    fontSize: 18,
    color: '#555', // 中灰色文字
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#007ea7', // 藍色按鈕
    borderRadius: 8,
    paddingVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  feedbackModalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF', // 白色背景
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  feedbackModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333', // 深灰色標題
    marginBottom: 15,
  },
  feedbackTextInput: {
    width: '100%',
    height: 100,
    borderColor: '#ddd', // 淺灰色邊框
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  feedbackModalButton: {
    marginTop: 10,
    width: '100%',
    backgroundColor: '#007ea7', // 藍色按鈕
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  feedbackCancelButton: {
    marginTop: 10,
    width: '100%',
    borderColor: '#007ea7',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  feedbackCancelButtonText: {
    color: '#007ea7', // 藍色字體
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#007ea7',
  },
  dashedButton: {
    marginTop: 20,
    paddingVertical: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#007ea7', // 藍色邊框
    backgroundColor: 'transparent',
    alignItems: 'center',
    color: '#000000', // 設置按鈕文字顏色
  },
});

