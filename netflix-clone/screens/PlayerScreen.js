import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { moderateScale, SCREEN_WIDTH, SCREEN_HEIGHT, horizontalScale, verticalScale } from '../utils/dimensions';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background for better video contrast
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.5625, // 16:9 Aspect Ratio
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: verticalScale(30), // Responsive vertical positioning
    left: horizontalScale(10), // Responsive horizontal positioning
    right: horizontalScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
  },
  controlButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(10),
  },
  controlButton: {
    padding: moderateScale(10),
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: horizontalScale(10),
  },
  progressText: {
    color: '#fff',
    fontSize: moderateScale(12),
    marginHorizontal: horizontalScale(5),
  },
  commentsContainer: {
    flex: 1,
    padding: horizontalScale(10),
    backgroundColor: '#121212',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  commentsTitle: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  commentItem: {
    marginBottom: verticalScale(10),
  },
  commentAuthor: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
  },
  commentText: {
    color: '#ccc',
    marginTop: verticalScale(2),
    fontSize: moderateScale(14),
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: verticalScale(5),
  },
  commentInput: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(5),
    backgroundColor: '#1e1e1e',
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(10),
    fontSize: moderateScale(14),
  },
  sendButton: {
    padding: moderateScale(10),
  },
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.5625,
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(14),
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
});

export default function PlayerScreen({ navigation, route }) {
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({});
  const [comments, setComments] = useState([
    { id: '1', author: 'User1', text: 'Great video!' },
    { id: '2', author: 'User2', text: 'Loved it!' },
    // ... more mock comments
  ]);
  const [newComment, setNewComment] = useState('');

  // Hide controls after 3 seconds of inactivity
  useLayoutEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  // Format milliseconds to MM:SS
  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  // Handle seeking in the video
  const handleSeek = useCallback(async (value) => {
    if (videoRef.current) {
      try {
        await videoRef.current.setPositionAsync(value);
        setPosition(value);
      } catch (err) {
        console.error('Error seeking video:', err);
        setError('Error seeking video');
      }
    }
  }, []);

  // Handle volume changes
  const handleVolumeChange = useCallback(async (value) => {
    if (videoRef.current) {
      try {
        await videoRef.current.setVolumeAsync(value);
        setVolume(value);
      } catch (err) {
        console.error('Error setting volume:', err);
        setError('Error setting volume');
      }
    }
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Retry loading the video on error
  const handleRetry = useCallback(async () => {
    if (!videoRef.current) return;
    setError(null);
    setIsLoading(true);
    try {
      await videoRef.current.loadAsync(
        { uri: route.params?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { shouldPlay: false, isLooping: true }
      );
      setIsLoading(false);
    } catch (error) {
      setError(`Failed to load video: ${error.message}`);
      console.error('Video loading error:', error);
      setIsLoading(false);
    }
  }, [route.params?.videoUrl]);

  // Load video on component mount
  useEffect(() => {
    const loadVideo = async () => {
      if (!videoRef.current) {
        setError('Video component not mounted properly.');
        setIsLoading(false);
        return;
      }
      try {
        await videoRef.current.loadAsync(
          { uri: route.params?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { shouldPlay: false, isLooping: true }
        );
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis);
          setPosition(status.positionMillis || 0);
          setIsLoading(false);
        } else {
          setError('Failed to load video.');
          setIsLoading(false);
        }
      } catch (error) {
        setError(`Failed to load video: ${error.message}`);
        console.error('Video loading error:', error);
        setIsLoading(false);
      }
    };
    loadVideo();

    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, [route.params?.videoUrl]);

  // Update position as the video plays
  useEffect(() => {
    if (status.isLoaded && status.positionMillis) {
      setPosition(status.positionMillis);
    }
    if (status.isLoaded && status.durationMillis) {
      setDuration(status.durationMillis);
    }
  }, [status]);

  // Style for the video player
  const videoStyle = useMemo(
    () => ({
      width: isFullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH,
      height: isFullscreen ? SCREEN_WIDTH : SCREEN_WIDTH * 0.5625,
      transform: [{ rotate: isFullscreen ? '90deg' : '0deg' }],
    }),
    [isFullscreen]
  );

  // Handle adding a new comment
  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    const newId = (comments.length + 1).toString();
    const comment = { id: newId, author: 'You', text: newComment };
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        <TouchableOpacity
          style={styles.videoContainer}
          onPress={() => setShowControls(!showControls)}
        >
          <Video
            ref={videoRef}
            style={videoStyle}
            source={{ uri: route.params?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
            useNativeControls={false} // Custom controls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={(playbackStatus) => {
              if (playbackStatus.isLoaded) {
                setStatus(playbackStatus);
                setPosition(playbackStatus.positionMillis || 0);
                setDuration(playbackStatus.durationMillis || 0);
              } else {
                if (playbackStatus.error) {
                  setError(`Video playback error: ${playbackStatus.error}`);
                }
              }
            }}
            onError={(error) => {
              console.error('Video error event:', error);
              setError('Video playback error occurred');
            }}
            volume={volume}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          {showControls && (
            <View style={styles.controlsOverlay}>
              {/* Slider for seeking */}
              <View style={styles.progressBarContainer}>
                <Text style={styles.progressText}>{formatTime(position)}</Text>
                <Slider
                  style={{ flex: 1 }}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  minimumTrackTintColor="#1e90ff"
                  maximumTrackTintColor="#fff"
                  thumbTintColor="#1e90ff"
                  onValueChange={(value) => {
                    setPosition(value);
                  }}
                  onSlidingComplete={handleSeek}
                />
                <Text style={styles.progressText}>{formatTime(duration)}</Text>
              </View>

              {/* Control Buttons */}
              <View style={styles.controlButtonsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (status.isPlaying) {
                      videoRef.current.pauseAsync();
                    } else {
                      videoRef.current.playAsync();
                    }
                  }}
                >
                  <Ionicons
                    name={status.isPlaying ? 'pause' : 'play'}
                    size={moderateScale(30)}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
                  <Ionicons
                    name={isFullscreen ? 'contract' : 'expand'}
                    size={moderateScale(24)}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { /* Like functionality */ }} style={styles.controlButton}>
                  <Ionicons name="heart-outline" size={moderateScale(24)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { /* Share functionality */ }} style={styles.controlButton}>
                  <MaterialIcons name="share" size={moderateScale(24)} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {error && (
            <View style={{ position: 'absolute', bottom: verticalScale(50), width: '100%', alignItems: 'center' }}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={handleRetry} style={{ marginTop: verticalScale(10) }}>
                <Text style={{ color: '#fff', textDecorationLine: 'underline', fontSize: moderateScale(14) }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={styles.commentsContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <TouchableOpacity onPress={() => { /* Sort or filter comments */ }}>
            <Ionicons name="filter" size={moderateScale(24)} color="#fff" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Text style={styles.commentAuthor}>{item.author}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#fff', fontSize: moderateScale(14) }}>No comments yet.</Text>}
        />
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#888"
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={handleAddComment}
            multiline
          />
          <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
            <Ionicons name="send" size={moderateScale(24)} color="#1e90ff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}