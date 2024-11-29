import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { moderateScale, SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/dimensions';
import Slider from '@react-native-community/slider';

export default function PlayerScreen({ navigation, route }) {
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlaybackStatusUpdate = (playbackStatus) => {
    setStatus(() => playbackStatus);
    if (playbackStatus.isLoaded) {
      setPosition(playbackStatus.positionMillis);
      setDuration(playbackStatus.durationMillis);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleSeek = async (value) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const handleVolumeChange = async (value) => {
    if (videoRef.current) {
      await videoRef.current.setVolumeAsync(value);
      setVolume(value);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <View className="flex-1 bg-black">
      <TouchableOpacity 
        className="flex-1 justify-center" 
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          style={{
            width: isFullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH,
            height: isFullscreen ? SCREEN_WIDTH : SCREEN_WIDTH * (9/16),
            transform: [{ rotate: isFullscreen ? '90deg' : '0deg' }]
          }}
          source={{ uri: route.params?.videoUrl || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          volume={volume}
        />

        {showControls && (
          <View className="absolute inset-0">
            {/* Top controls */}
            <SafeAreaView className="flex-row items-center p-4 bg-black/50">
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="bg-gray-900/80 rounded-full p-2"
              >
                <Ionicons name="chevron-back" size={moderateScale(24)} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg ml-4 flex-1">
                {route.params?.title || 'Now Playing'}
              </Text>
              <TouchableOpacity className="bg-gray-900/80 rounded-full p-2">
                <Ionicons name="ellipsis-horizontal" size={moderateScale(24)} color="white" />
              </TouchableOpacity>
            </SafeAreaView>

            {/* Center play/pause button */}
            <View className="flex-1 items-center justify-center">
              <TouchableOpacity 
                onPress={togglePlayPause}
                className="bg-gray-900/80 rounded-full p-4"
              >
                <Ionicons 
                  name={status.isPlaying ? "pause" : "play"} 
                  size={moderateScale(32)} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            {/* Bottom controls */}
            <SafeAreaView className="p-4 bg-black/50">
              {/* Progress bar */}
              <View className="mb-4">
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  onValueChange={handleSeek}
                  minimumTrackTintColor="#ff0000"
                  maximumTrackTintColor="#ffffff"
                  thumbTintColor="#ff0000"
                />
                <View className="flex-row justify-between">
                  <Text className="text-white">{formatTime(position)}</Text>
                  <Text className="text-white">{formatTime(duration)}</Text>
                </View>
              </View>

              {/* Control buttons */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity onPress={() => handleVolumeChange(volume === 0 ? 1 : 0)}>
                    <Ionicons 
                      name={volume === 0 ? "volume-mute" : "volume-medium"} 
                      size={moderateScale(24)} 
                      color="white" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="settings-outline" size={moderateScale(24)} color="white" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity>
                    <Ionicons name="closed-captioning-outline" size={moderateScale(24)} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleFullscreen}>
                    <Ionicons 
                      name={isFullscreen ? "contract" : "expand"} 
                      size={moderateScale(24)} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
