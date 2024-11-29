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
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <TouchableOpacity 
        style={{ flex: 1, justifyContent: 'center' }} 
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          style={{
            width: SCREEN_WIDTH,
            height: isFullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH * 0.5625, // 16:9 aspect ratio
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
          <View style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            justifyContent: 'space-between' 
          }}>
            {/* Top controls */}
            <SafeAreaView style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: moderateScale(16), 
              paddingHorizontal: moderateScale(20),
              backgroundColor: 'rgba(0, 0, 0, 0.5)' 
            }}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: 50, padding: 8 }}
              >
                <Ionicons name="chevron-back" size={moderateScale(24)} color="white" />
              </TouchableOpacity>
              <Text style={{ color: 'white', fontSize: 18, marginLeft: 16, flex: 1 }}>
                {route.params?.title || 'Now Playing'}
              </Text>
              <TouchableOpacity style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: 50, padding: 8 }}>
                <Ionicons name="ellipsis-horizontal" size={moderateScale(24)} color="white" />
              </TouchableOpacity>
            </SafeAreaView>

            {/* Center play/pause button */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity 
                onPress={togglePlayPause}
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  borderRadius: moderateScale(50), 
                  padding: moderateScale(16) 
                }}
              >
                <Ionicons 
                  name={status.isPlaying ? "pause" : "play"} 
                  size={moderateScale(32)} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            {/* Bottom controls */}
            <SafeAreaView style={{ 
              padding: moderateScale(16), 
              paddingHorizontal: moderateScale(20),
              backgroundColor: 'rgba(0, 0, 0, 0.5)' 
            }}>
              {/* Progress bar */}
              <View style={{ marginBottom: moderateScale(16) }}>
                <Slider
                  style={{ width: '100%', height: moderateScale(40) }}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  onValueChange={handleSeek}
                  minimumTrackTintColor="#ff0000"
                  maximumTrackTintColor="#ffffff"
                  thumbTintColor="#ff0000"
                />
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginTop: moderateScale(8)
                }}>
                  <Text style={{ color: 'white' }}>{formatTime(position)}</Text>
                  <Text style={{ color: 'white' }}>{formatTime(duration)}</Text>
                </View>
              </View>

              {/* Control buttons */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginTop: moderateScale(8)
              }}>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: moderateScale(16) 
                }}>
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

                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: moderateScale(16)
                }}>
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
