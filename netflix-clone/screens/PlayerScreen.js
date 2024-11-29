import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useCallback, useLayoutEffect, memo } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { moderateScale, SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/dimensions';
import Slider from '@react-native-community/slider';

const styles = StyleSheet.create({
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    paddingHorizontal: moderateScale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  iconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 50,
    padding: 8
  },
  title: {
    color: 'white',
    fontSize: 18,
    marginLeft: 16,
    flex: 1
  },
  bottomControls: {
    padding: moderateScale(16),
    paddingHorizontal: moderateScale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  progressContainer: {
    marginBottom: moderateScale(16)
  },
  slider: {
    width: '100%',
    height: moderateScale(40)
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateScale(8)
  },
  timeText: {
    color: 'white'
  },
  controlButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(8)
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(16)
  },
  playPauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: moderateScale(50),
    padding: moderateScale(16)
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between'
  }
});

// Extract controls into separate components
const TopControls = memo(({ onBack, title }) => (
  <SafeAreaView style={styles.topControls}>
    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
      <Ionicons name="chevron-back" size={moderateScale(24)} color="white" />
    </TouchableOpacity>
    <Text style={styles.title}>{title || 'Now Playing'}</Text>
    <TouchableOpacity style={styles.iconButton}>
      <Ionicons name="ellipsis-horizontal" size={moderateScale(24)} color="white" />
    </TouchableOpacity>
  </SafeAreaView>
));

// Extract additional components
const BottomControls = memo(({ 
  position, 
  duration, 
  formatTime, 
  handleSeek, 
  volume, 
  handleVolumeChange, 
  isFullscreen, 
  toggleFullscreen 
}) => (
  <SafeAreaView style={styles.bottomControls}>
    <View style={styles.progressContainer}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onValueChange={handleSeek}
        minimumTrackTintColor="#ff0000"
        maximumTrackTintColor="#ffffff"
        thumbTintColor="#ff0000"
      />
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>

    <View style={styles.controlButtonsContainer}>
      <View style={styles.buttonGroup}>
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

      <View style={styles.buttonGroup}>
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
));

const PlayPauseButton = memo(({ isPlaying, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.playPauseButton}>
    <Ionicons 
      name={isPlaying ? "pause" : "play"} 
      size={moderateScale(32)} 
      color="white" 
    />
  </TouchableOpacity>
));

export default function PlayerScreen({ navigation, route }) {
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  // Optimize control hiding with useLayoutEffect
  useLayoutEffect(() => {
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

  // Memoize callback functions
  const handlePlaybackStatusUpdate = useCallback((playbackStatus) => {
    if (!playbackStatus.isLoaded) return;
    
    setStatus(playbackStatus);
    setPosition(playbackStatus.positionMillis);
    setDuration(playbackStatus.durationMillis);
  }, []);

  const togglePlayPause = useCallback(async () => {
    try {
      if (!videoRef.current) return;
      
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [status.isPlaying]);

  const handleSeek = useCallback(async (value) => {
    try {
      if (videoRef.current) {
        await videoRef.current.setPositionAsync(value);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, []);

  const handleVolumeChange = useCallback(async (value) => {
    try {
      if (videoRef.current) {
        await videoRef.current.setVolumeAsync(value);
        setVolume(value);
      }
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          style={{
            width: SCREEN_WIDTH,
            height: isFullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH * 0.5625,
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
          <View style={styles.controlsOverlay}>
            <TopControls onBack={() => navigation.goBack()} title={route.params?.title} />
            
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <PlayPauseButton isPlaying={status.isPlaying} onPress={togglePlayPause} />
            </View>

            <BottomControls
              position={position}
              duration={duration}
              formatTime={formatTime}
              handleSeek={handleSeek}
              volume={volume}
              handleVolumeChange={handleVolumeChange}
              isFullscreen={isFullscreen}
              toggleFullscreen={toggleFullscreen}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
