import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Video, ResizeMode } from 'expo-av';
import { useUser } from './UserContext';
import * as FileSystem from 'expo-file-system';
import { ActivityIndicator, Button, Card, Paragraph, ProgressBar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import Config from './config';

const API_URL = Config.ENDPOINTS.userVideos;
const VIDEO_BASE_URL = Config.API_URL;

export default function MyCalls() {
  const { user } = useUser();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchVideos = async () => {
        try {
          const response = await axios.get(API_URL, {
            params: { userId: user.id }
          });

          const sortedVideos = response.data.videos.sort((a, b) => {
            return new Date(b.C_UpTime) - new Date(a.C_UpTime);
          });

          setVideos(sortedVideos);
        } catch (err) {
          console.error('Error fetching videos:', err);
          setError('無法載入影片資料');
        } finally {
          setLoading(false);
        }
      };

      fetchVideos();
    } else {
      setError('用戶未登入');
      setLoading(false);
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handlePlay = async (videoPath) => {
    try {
      const relativePath = videoPath.replace(/^.*[\\/]/, '');
      const videoUrl = `${VIDEO_BASE_URL}/uploads/${relativePath}`;
      console.log('Downloading video from URL:', videoUrl);

      const fileUri = FileSystem.documentDirectory + relativePath;
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        fileUri,
        {},
        (progress) => {
          const progressPercent = (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100;
          setDownloadProgress(progressPercent);
        }
      );

      const response = await downloadResumable.downloadAsync();
      setPlayingVideo(response.uri);
      setDownloadProgress(0);
    } catch (error) {
      console.error('Error downloading video:', error);
      Alert.alert('錯誤', '無法下載影片');
    }
  };

  const handleClosePlayer = () => {
    setPlayingVideo(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>錯誤: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {playingVideo && (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: playingVideo }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
          <TouchableOpacity style={styles.closeButton} onPress={handleClosePlayer}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
      {downloadProgress > 0 && downloadProgress < 100 && (
        <ProgressBar progress={downloadProgress / 100} style={styles.progressBar} />
      )}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.C_Id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={
                <View style={styles.titleContainer}>
                  {item.C_Result === '此影片是偽造影片' ? (
                    <FontAwesome name="times-circle" size={24} color="red" style={styles.icon} />
                  ) : (
                    <FontAwesome name="check-circle" size={24} color="#80FF00" style={styles.icon} />
                  )}
                  <Text style={styles.cardTitleText}>{item.C_Result}</Text>
                </View>
              }
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <Paragraph style={styles.paragraph}>上傳時間: {formatDate(item.C_UpTime)}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => handlePlay(item.C_VideoPath)}
                icon={() => (
                  <FontAwesome
                    name="play-circle-o"
                    size={24}
                    color="white"
                  />
                )}
                style={styles.playButton}
                labelStyle={styles.playButtonLabel}
              >
                播放
              </Button>
            </Card.Actions>
          </Card>
        )}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#1b1b1b', // 深色背景
  },
  videoContainer: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  card: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: '#2e2e2e', // 深色卡片
  },
  flatListContent: {
    paddingHorizontal: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  progressBar: {
    marginVertical: 16,
    color: '#007ea7', // 進度條顏色
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff', // 白色字體
    marginTop: 10,
  },
  paragraph: {
    color: '#ffffff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  icon: {
    marginRight: 8,
    marginTop: 5,
  },
  playButton: {
    backgroundColor: '#007ea7', // 藍色按鈕
  },
  playButtonLabel: {
    color: '#ffffff', // 白色按鈕字體
  },
});
