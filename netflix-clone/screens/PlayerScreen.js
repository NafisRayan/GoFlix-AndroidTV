import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import {
  moderateScale,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  horizontalScale,
  verticalScale,
} from '../utils/dimensions';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ScreenOrientation from 'expo-screen-orientation';

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
  const [comments, setComments] = useState(
    route.params?.comments || []
  );
  const [newComment, setNewComment] = useState('');

  // Hide controls after 3 seconds of inactivity
  useLayoutEffect(() => {
    let timer;
    if (showControls) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timer);
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
  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      // Exit Fullscreen
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
      setIsFullscreen(false);
    } else {
      // Enter Fullscreen
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
      setIsFullscreen(true);
      setShowControls(true); // Show controls when entering fullscreen
    }
  }, [isFullscreen]);

  // Retry loading the video on error
  const handleRetry = useCallback(async () => {
    if (!videoRef.current) return;
    setError(null);
    setIsLoading(true);
    try {
      await videoRef.current.loadAsync(
        {
          uri:
            route.params?.videoUrl ||
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        { shouldPlay: false, isLooping: true }
      );
      setIsLoading(false);
    } catch (error) {
      setError(`Failed to load video: ${error.message}`);
      console.error('Video loading error:', error);
      setIsLoading(false);
    }
  }, [route.params?.videoUrl]);

  // Add cleanup for video player
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  // Modify video loading
  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      if (!videoRef.current) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        await videoRef.current.unloadAsync(); // Unload any existing video
        await videoRef.current.loadAsync(
          { uri: route.params?.videoUrl },
          { shouldPlay: true, isLooping: true },
          false
        );
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Video loading error:', error);
        if (isMounted) {
          setError('Error loading video');
          setIsLoading(false);
        }
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
    };
  }, [route.params?.videoUrl]);

  // Style for the video player
  const videoStyle = useMemo(
    () => ({
      width: '100%',
      height: '100%',
    }),
    []
  );

  // Handle adding a new comment
  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    const newId = (comments.length + 1).toString();
    const comment = {
      id: newId,
      author: 'You',
      text: newComment
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
        <View style={isFullscreen ? styles.fullscreenVideoContainer : styles.videoContainer}>
          <Video
            ref={videoRef}
            style={videoStyle}
            source={{ uri: route.params?.videoUrl }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={true}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setStatus(status);
                setPosition(status.positionMillis || 0);
                setDuration(status.durationMillis || 0);
              }
            }}
            onError={(error) => {
              console.error('Video error event:', error);
              setError('Video playback error occurred');
              setIsLoading(false);
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
                  accessibilityLabel={status.isPlaying ? 'Pause Video' : 'Play Video'}
                >
                  <Ionicons
                    name={status.isPlaying ? 'pause' : 'play'}
                    size={moderateScale(30)}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleFullscreen}
                  style={styles.controlButton}
                  accessibilityLabel={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  <Ionicons
                    name={isFullscreen ? 'contract' : 'expand'}
                    size={moderateScale(24)}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // Implement Like functionality
                    console.log('Like button pressed');
                  }}
                  style={styles.controlButton}
                  accessibilityLabel="Like Video"
                >
                  <Ionicons
                    name="heart-outline"
                    size={moderateScale(24)}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // Implement Share functionality
                    console.log('Share button pressed');
                  }}
                  style={styles.controlButton}
                  accessibilityLabel="Share Video"
                >
                  <MaterialIcons
                    name="share"
                    size={moderateScale(24)}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {error && (
            <View
              style={{
                position: 'absolute',
                bottom: verticalScale(50),
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={handleRetry}
                style={{ marginTop: verticalScale(10) }}
                accessibilityLabel="Retry Loading Video"
              >
                <Text
                  style={{
                    color: '#fff',
                    textDecorationLine: 'underline',
                    fontSize: moderateScale(14),
                  }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
      {!isFullscreen && (
        <KeyboardAvoidingView
          style={styles.commentsContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity
              onPress={() => {
                // Implement Sort or Filter functionality
                console.log('Filter button pressed');
              }}
              accessibilityLabel="Filter Comments"
            >
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
            ListEmptyComponent={
              <Text style={{ color: '#fff', fontSize: moderateScale(14) }}>
                No comments yet.
              </Text>
            }
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
              accessibilityLabel="Add a comment"
            />
            <TouchableOpacity
              onPress={handleAddComment}
              style={styles.sendButton}
              accessibilityLabel="Send Comment"
            >
              <Ionicons
                name="send"
                size={moderateScale(24)}
                color="#1e90ff"
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background for better video contrast
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16), // 16:9 Aspect Ratio
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_HEIGHT,
    height: SCREEN_WIDTH,
    backgroundColor: 'black',
    zIndex: 9999,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: verticalScale(30), // Responsive vertical positioning
    left: horizontalScale(10), // Responsive horizontal positioning
    right: horizontalScale(10),
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
    marginTop: verticalScale(15),
    marginBottom: verticalScale(15),
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
    paddingVertical: verticalScale(10),
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
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(14),
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
});