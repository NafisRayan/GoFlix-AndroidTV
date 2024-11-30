import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { moderateScale, SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/dimensions';

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between'
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: moderateScale(4)
  }
  // ... other styles ...
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

  useLayoutEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const handleSeek = useCallback(async (value) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
      setPosition(value);
    }
  }, []);

  const handleVolumeChange = useCallback(async (value) => {
    if (videoRef.current) {
      await videoRef.current.setVolumeAsync(value);
      setVolume(value);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleRetry = useCallback(async () => {
    if (!videoRef.current) return;
    setError(null);
    setIsLoading(true);
    try {
      await videoRef.current.loadAsync(
        { uri: route.params?.videoUrl || 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' },
        { shouldPlay: false, isLooping: true }
      );
      setIsLoading(false);
    } catch (error) {
      setError(`Failed to load video: ${error.message}`);
      console.error('Video loading error:', error);
      setIsLoading(false);
    }
  }, [route.params?.videoUrl]);

  useEffect(() => {
    if (!videoRef.current) return;
    const loadVideo = async () => {
      try {
        await videoRef.current.loadAsync(
          { uri: route.params?.videoUrl || 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' },
          { shouldPlay: false, isLooping: true }
        );
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis);
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

  const videoStyle = useMemo(() => ({
    width: SCREEN_WIDTH,
    height: isFullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH * 0.5625,
    transform: [{ rotate: isFullscreen ? '90deg' : '0deg' }]
  }), [isFullscreen]);

  return (
    <View style={styles.videoContainer}>
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          style={videoStyle}
          source={{ uri: route.params?.videoUrl || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={status => setStatus(() => status)}
          onError={(error) => {
            console.error('Video error event:', error);
            setError('Video playback error occurred');
          }}
          volume={volume}
        />
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* You can add other controls here if needed */}
          </View>
        )}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}