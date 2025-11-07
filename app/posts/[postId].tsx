import { FontAwesome, Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFooter, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import MasonryList from '@react-native-seoul/masonry-list';
import { Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const CommentFooter = ({ footerProps, user, submittingComment, onSubmitComment }) => {
  const [newComment, setNewComment] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handlePress = () => {
    onSubmitComment(newComment);
    setNewComment('');
  };

  return (
    <BottomSheetFooter {...footerProps}>
      <View style={[styles.commentInputContainer, keyboardVisible && { paddingBottom: 10 }]}>
        <View style={styles.profileImage}>
          {(user?.image == null || user?.image == "") && (user?.type == "Club" || user?.type == "Association") && <Image
            source={require('../../assets/clublogo.png')}
            style={styles.profileImageAvatar}
            resizeMode="contain"
          />}
          {(user?.image == null || user?.image == "") && user?.gender == "Male" && <Image
            source={require('../../assets/avatar.png')}
            style={styles.profileImageAvatar}
            resizeMode="contain"
          />}
          {(user?.image == null || user?.image == "") && user?.gender == "Female" && <Image
            source={require('../../assets/avatarF.png')}
            style={styles.profileImageAvatar}
            resizeMode="contain"
          />}
          {user?.image != null && <Image
            source={{ uri: user?.image }}
            style={styles.profileImageAvatar}
            resizeMode="contain"
          />}
        </View>
        <BottomSheetTextInput
          style={styles.commentInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.commentSubmit}
          onPress={handlePress}
          disabled={!newComment.trim() || submittingComment}
        >
          {!submittingComment ? (
            <Ionicons
              name="send"
              size={20}
              color={newComment.trim() ? "#FF4000" : "#888"}
            />
          ) : (
            <ActivityIndicator size={'small'} color="#FF4000" />
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetFooter>
  );
};

const VideoPlayer = ({ uri, style, showFullscreenToggle = false }) => {
  const videoRef = React.useRef<Video>(null);
  const fullscreenVideoRef = React.useRef<Video>(null);
  const [status, setStatus] = React.useState<any>({});
  const [fullscreenStatus, setFullscreenStatus] = React.useState<any>({});
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentPosition, setCurrentPosition] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(false);

  const formatTime = (millis: number) => {
    if (!millis) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getDisplayTime = () => {
    if (isPlaying) {
      return formatTime(duration - currentPosition);
    }
    return formatTime(duration);
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    setStatus(status);
    if (status.positionMillis !== undefined) {
      setCurrentPosition(status.positionMillis);
    }
    if (status.durationMillis !== undefined) {
      setDuration(status.durationMillis);
    }
  };

  const handleFullscreenPlaybackStatusUpdate = (status: any) => {
    setFullscreenStatus(status);
    if (status.positionMillis !== undefined) {
      setCurrentPosition(status.positionMillis);
    }
    if (status.durationMillis !== undefined) {
      setDuration(status.durationMillis);
    }
  };

  const togglePlayPause = () => {
    if (isFullscreen) {
      isPlaying ? fullscreenVideoRef.current?.pauseAsync() : fullscreenVideoRef.current?.playAsync();
    } else {
      isPlaying ? videoRef.current?.pauseAsync() : videoRef.current?.playAsync();
    }
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowControls(true);

    if (isFullscreen) {
      videoRef.current?.setPositionAsync(currentPosition);
      if (isPlaying) {
        videoRef.current?.playAsync();
      }
    } else {
      fullscreenVideoRef.current?.setPositionAsync(currentPosition);
      if (isPlaying) {
        fullscreenVideoRef.current?.playAsync();
      }
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
        <View style={style}>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            isLooping
            shouldPlay={isPlaying && !isFullscreen}
            useNativeControls={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          <View style={[styles.overlay, !showControls && !isPlaying && styles.centerOverlay]}>
            {(!isPlaying || showControls) && (
              <TouchableOpacity
                onPress={togglePlayPause}
                style={styles.playButton}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            )}

            {showFullscreenToggle && (
              <TouchableOpacity onPress={toggleFullscreen}
                style={{ position: 'absolute', right: 0, top: 0, width: '100%', height: '70%' }}
              >
              </TouchableOpacity>
            )}

            {(showControls || !isPlaying) && (
              <View style={styles.bottomBar}>
                <Text style={styles.durationText}>
                  {getDisplayTime()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={isFullscreen}
        transparent={true}
        animationType="slide"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={toggleFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <Video
            ref={fullscreenVideoRef}
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
            isLooping
            shouldPlay={isPlaying}
            useNativeControls={true}
            onPlaybackStatusUpdate={handleFullscreenPlaybackStatusUpdate}
          />

          <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
            <View style={[styles.fullscreenOverlay, !showControls && !isPlaying && styles.centerOverlay]}>
              {(showControls || !isPlaying) && (
                <View style={styles.fullscreenBottomBar}>
                  {(!isPlaying || showControls) && (
                    <TouchableOpacity
                      onPress={togglePlayPause}
                      style={[styles.playButton, styles.fixedPlayButton]}
                    >
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={36}
                        color="white"
                      />
                    </TouchableOpacity>
                  )}

                  <Text style={styles.fullscreenDurationText}>
                    {getDisplayTime()}
                  </Text>

                  <TouchableOpacity onPress={toggleFullscreen}>
                    <Ionicons
                      name="contract"
                      size={36}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </>
  );
};

export default function PostScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [liking, setLiking] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Bottom sheet refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const moreOptionsRef = useRef<BottomSheet>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const snapPoints = useMemo(() => ["50%", "90%"], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleOpenMoreOptions = useCallback(() => {
    moreOptionsRef.current?.expand();
  }, []);

  const handleCloseModalPress = useCallback(() => {
    bottomSheetRef.current?.close();
    moreOptionsRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId && postId) {
      fetchPost();
    }
  }, [userId, postId]);

  const fetchUser = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      const decodedToken = jwtDecode(token);

      try {
        const response = await fetch(`http://193.187.132.170:5000/api/users/${decodedToken.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setUserId(userData._id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
  };

  const fetchPost = async () => {
    console.log('getting post')
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`http://193.187.132.170:5000/api/posts/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(response)

      if (response.ok) {
        const postData = await response.json();
        setPost(postData);
      } else {
        console.error('Failed to fetch post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPost();
    setRefreshing(false);
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;

    setLiking(true);

    // Optimistic update
    const isLiked = post.likes?.some(like => like._id === userId);
    const updatedLikes = isLiked
      ? post.likes.filter(like => like._id !== userId)
      : [...(post.likes || []), { _id: userId }];

    setPost(prev => ({ ...prev, likes: updatedLikes }));

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(`http://193.187.132.170:5000/api/posts/like/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPost(prev => ({ ...prev, likes: data.likes }));
      }
    } catch (err) {
      console.error('Like error:', err);
      // Revert optimistic update on error
      setPost(prev => ({ ...prev, likes: post.likes }));
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    setLoadingComments(true);
    handlePresentModalPress();

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(`http://193.187.132.170:5000/api/posts/comments/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (commentText: string) => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(`http://193.187.132.170:5000/api/posts/comments/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentText })
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setPost(prev => ({ ...prev, comments: data.comments }));
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleMoreOptions = () => {
    handleOpenMoreOptions();
  };

  const handleShare = async () => {
    const url = `https://riyadah.app/posts/${postId}`;
    try {
      const result = await Share.share({
        message: `Check out this post on Riyadah: ${url}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error.message);
    }
  };

  const handleDeletePost = () => {
    setDeleteConfirmation(postId);
  };

  const handleConfirmDeletePost = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(`http://193.187.132.170:5000/api/posts/delete/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await res.json();

      if (res.ok) {
        setDeleteConfirmation('');
        handleCloseModalPress();
        router.back(); // Go back to previous screen after deletion
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleCancelDeletePost = () => {
    setDeleteConfirmation('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMedia = () => {
    if (!post) return null;

    // Images only
    if (post.type === 'image' && post.media.images?.length > 0) {
      const images = post.media.images;
      const isMoreThanFour = images.length >= 4;
      const previewImages = isMoreThanFour ? images.slice(0, 4) : images;

      return (
        images.length === 1 ? (
          <Image
            source={{ uri: images[0] }}
            style={[styles.postImage, { marginTop: 10 }]}
            resizeMode="cover"
          />
        ) : (
          <MasonryList
            data={previewImages}
            keyExtractor={(uri, index) => uri + index}
            numColumns={2}
            containerStyle={{ marginTop: 10 }}
            style={{ margin: -5 }}
            renderItem={({ item: image }) => {
              const currentIndex = previewImages.findIndex(img => img === image);
              const isLastPreview = isMoreThanFour && currentIndex === 3;

              return (
                <View
                  style={{
                    borderRadius: 8,
                    overflow: 'hidden',
                    margin: 5,
                    backgroundColor: 'black',
                    position: 'relative',
                  }}
                >
                  <Image
                    source={{ uri: image }}
                    resizeMode="cover"
                    style={{ width: '100%', aspectRatio: 1 }}
                  />

                  {isLastPreview && (
                    <View
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 3,
                      }}
                    >
                      <Text style={{ color: '#fff', fontFamily: 'Qatar', fontSize: 30 }}>
                        + {images.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )
      );
    }

    // Videos only
    if (post.type === 'video' && post.media.videos?.length > 0) {
      const videos = post.media.videos;
      const isMoreThanFour = videos.length >= 4;
      const previewVideos = isMoreThanFour ? videos.slice(0, 4) : videos;

      return (
        videos.length === 1 ? (
          <View
            style={{
              borderRadius: 8,
              backgroundColor: 'black',
              overflow: 'hidden',
              marginTop: 10,
              aspectRatio: 1
            }}>
            <VideoPlayer
              uri={videos[0]}
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        ) : (
          <MasonryList
            data={previewVideos}
            keyExtractor={(uri, index) => uri + index}
            numColumns={2}
            containerStyle={{ marginTop: 10 }}
            style={{ marginVertical: -5, marginHorizontal: -0, }}
            renderItem={({ item: video }) => {
              const currentIndex = previewVideos.findIndex(v => v === video);
              const isLastPreview = isMoreThanFour && currentIndex === 3;

              return (
                <View
                  style={{
                    borderRadius: 8,
                    backgroundColor: 'black',
                    overflow: 'hidden',
                    marginVertical: 5,
                    marginHorizontal: 0,
                    position: 'relative',
                    aspectRatio: 1,
                    borderWidth: 1
                  }}>
                  <VideoPlayer
                    uri={video}
                    style={{ width: '100%', height: '100%' }}
                    showFullscreenToggle={true}
                  />

                  {isLastPreview && (
                    <View
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 3,
                      }}
                    >
                      <Text style={{ color: '#fff', fontFamily: 'Qatar', fontSize: 30 }}>
                        + {videos.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )
      );
    }

    // Multiple media
    if (post.type === 'multipleMedia') {
      const images = post.media.images || [];
      const videos = post.media.videos || [];

      const allMedia = [
        ...images.map(uri => ({ uri, type: 'image' })),
        ...videos.map(uri => ({ uri, type: 'video' }))
      ];

      const isMoreThanFour = allMedia.length > 4;
      const previewMedia = isMoreThanFour ? allMedia.slice(0, 4) : allMedia;

      return (
        <MasonryList
          data={previewMedia}
          keyExtractor={(item, index) => item.uri + index}
          numColumns={2}
          containerStyle={{ marginTop: 10 }}
          style={{ margin: -5 }}
          renderItem={({ item }) => {
            const currentIndex = previewMedia.findIndex(m => m.uri === item.uri && m.type === item.type);
            const isLastPreview = isMoreThanFour && currentIndex === 3;

            return (
              <View
                style={{
                  borderRadius: 8,
                  backgroundColor: 'black',
                  overflow: 'hidden',
                  margin: 5,
                  position: 'relative',
                }}
              >
                {item.type === 'image' ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: '100%', aspectRatio: 1 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Video
                    source={{ uri: item.uri }}
                    style={{ width: '100%', aspectRatio: 1, backgroundColor: 'black' }}
                    resizeMode="cover"
                    isLooping
                  />
                )}

                {isLastPreview && (
                  <View
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 3,
                    }}
                  >
                    <Text style={{ color: '#fff', fontFamily: 'Qatar', fontSize: 30 }}>
                      + {allMedia.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      );
    }

    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4000" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Post not found</Text>
      </View>
    );
  }

  const isLiked = userId && post.likes?.some((like: any) => like._id === userId);

  return (
    <GestureHandlerRootView style={styles.container}>
      {Platform.OS === 'ios' ? (
        <View style={{ height: 60, backgroundColor: '#FF4000' }} />
      ) : (
        <View style={{ height: 25, backgroundColor: '#FF4000' }} />
      )}

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Image
              source={require('../../assets/logo_orangeBlack.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={{ width: 24 }} /> {/* Spacer for balance */}
          </View>
        </View>

        <FlatList
          data={[post]} // Wrap post in array for FlatList
          renderItem={() => (
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                {(post.created_by.image == null || post.created_by.image == "") ? (
                  <View style={styles.profileImage}>
                    {post.created_by.gender == "Male" && <Image
                      source={require('../../assets/avatar.png')}
                      style={styles.profileImageAvatar}
                      resizeMode="contain"
                    />}
                    {post.created_by.gender == "Female" && <Image
                      source={require('../../assets/avatarF.png')}
                      style={styles.profileImageAvatar}
                      resizeMode="contain"
                    />}
                    {post.created_by.type == "Club" && <Image
                      source={require('../../assets/clublogo.png')}
                      style={styles.profileImageAvatar}
                      resizeMode="contain"
                    />}
                  </View>
                ) : (
                  <View style={styles.profileImage}>
                    <Image
                      source={{ uri: post.created_by.image }}
                      style={styles.avatar}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={styles.postHeaderInfo}>
                  <Text style={styles.postUserName}>{post.created_by.name}</Text>
                  <Text style={styles.postDate}>{formatDate(post.date)}</Text>
                </View>

                <TouchableOpacity onPress={handleMoreOptions} style={styles.postOptions}>
                  <Ionicons name="ellipsis-horizontal" size={24} color="#888888" />
                </TouchableOpacity>
              </View>

              <View style={styles.post}>
                <View style={styles.postContent}>
                  {post.title && <Text style={styles.postTitle}>{post.title}</Text>}
                  {post.content?.trim() !== '' && (
                    <Text style={styles.postText}>{post.content}</Text>
                  )}

                  {renderMedia()}
                </View>

                <View style={styles.postStats}>
                  <TouchableOpacity onPress={handleLike} style={styles.postActionBtn}>
                    <View>
                      {liking ? (
                        <ActivityIndicator
                          size="small"
                          color="#FF4000"
                          style={{ marginBottom: 5 }}
                        />
                      ) : (
                        <FontAwesome
                          name={isLiked ? "heart" : "heart-o"}
                          size={24}
                          color={isLiked ? "#FF4000" : "#888888"}
                        />
                      )}
                    </View>
                    <Text style={styles.postActionText}>
                      {post.likes?.length}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleComment} style={styles.postActionBtn}>
                    <View style={styles.postActionBtn}>
                      <FontAwesome name="comment-o" size={24} color="#888888" />
                      <Text style={styles.postActionText}>{post.comments?.length}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleShare} style={[styles.postActionBtn, { marginBottom: 14 }]}>
                    <View style={[styles.postActionBtn, styles.postActionBtnLast]}>
                      <FontAwesome name="share-square-o" size={24} color="#888888" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          keyExtractor={() => post._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF4000']}
              tintColor="#FF4000"
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Bottom Navigation */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.replace('/settings')}>
            <Image source={require('../../assets/settings.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/search')}>
            <Image source={require('../../assets/search.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/landing')}>
            <Image source={require('../../assets/home.png')} style={[styles.activeIcon]} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/notifications')}>
            <Image source={require('../../assets/notifications.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/profile')}>
            <Image source={require('../../assets/profile.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Comments Bottom Sheet */}
      {user && (
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose={true}
          handleIndicatorStyle={{ width: 50, backgroundColor: '#aaa' }}
          backdropComponent={renderBackdrop}
          footerComponent={(footerProps) => (
            <CommentFooter
              footerProps={footerProps}
              user={user}
              submittingComment={submittingComment}
              onSubmitComment={handleSubmitComment}
            />
          )}
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
        >
          <BottomSheetView style={{ backgroundColor: 'white', zIndex: 1 }}>
            <View style={[styles.commentModalHeader, {}]}>
              <Text style={styles.commentModalTitle}>Comments</Text>
              <TouchableOpacity
                style={styles.commentModalClose}
                onPress={handleCloseModalPress}
              >
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
          </BottomSheetView>

          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 15, marginTop: 50, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            {loadingComments ? (
              <View style={styles.commentLoading}>
                <ActivityIndicator size="large" color="#FF4000" />
              </View>
            ) : (
              comments.length === 0 ? (
                <View style={styles.noComments}>
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                </View>
              ) : (
                comments.map((item) => (
                  <View key={item._id} style={styles.commentItem}>
                    <View style={styles.profileImage}>
                      {(item.user?.image == null || item.user?.image === '') && item.user?.type === 'Club' && (
                        <Image source={require('../../assets/clublogo.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                      )}
                      {(item.user?.image == null || item.user?.image === '') && item.user?.gender === 'Male' && (
                        <Image source={require('../../assets/avatar.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                      )}
                      {(item.user?.image == null || item.user?.image === '') && item.user?.gender === 'Female' && (
                        <Image source={require('../../assets/avatarF.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                      )}
                      {item.user?.image && (
                        <Image source={{ uri: item.user.image }} style={styles.profileImageAvatar} resizeMode="contain" />
                      )}
                    </View>
                    <View style={styles.commentContent}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.commentAuthor}>{item.user.name}</Text>
                            <Text style={styles.commentDate}>{formatDate(item.date)}</Text>
                          </View>
                          <Text style={styles.commentText}>{item.content}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      )}

      {/* More Options Bottom Sheet */}
      <BottomSheet
        ref={moreOptionsRef}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ width: 50, backgroundColor: '#aaa' }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={{
          flex: 1, paddingBottom: 50
        }}>
          <View style={{ padding: 20 }}>
            {post.created_by._id == userId ? (
              <TouchableOpacity
                onPress={() => {
                  handleCloseModalPress();
                  router.replace('/profile')
                }}
                style={styles.profileButton}>
                <Text style={styles.profileButtonText}>Go to your profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  handleCloseModalPress();
                  router.push({
                    pathname: '/profile/public',
                    params: { id: post.created_by._id },
                  })
                }}
                style={styles.profileButton}>
                <Text style={styles.profileButtonText}>Go to {post.created_by.name} 's profile</Text>
              </TouchableOpacity>
            )}

            {post.created_by._id == userId && (
              <View>
                {deleteConfirmation == '' && <TouchableOpacity onPress={handleDeletePost} style={[styles.profileButton, { marginTop: 10 }]}>
                  <Text style={[styles.profileButtonText, { color: '#FF4000' }]}>Delete post</Text>
                </TouchableOpacity>}
                {deleteConfirmation == postId &&
                  <View style={[styles.profileButton, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }]}>
                    <Text style={[styles.profileButtonText, { color: '#FF4000' }]}>Are you sure?</Text>
                    <View style={{ flexDirection: 'row', columnGap: 30, alignItems: 'center' }}>
                      <TouchableOpacity onPress={handleConfirmDeletePost}
                        style={[styles.profileButton, { backgroundColor: 'transparent', padding: 0 }]}>
                        <Text style={[styles.profileButtonText, { textAlign: 'center' }]}>Yes, delete</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={handleCancelDeletePost}
                        style={[styles.profileButton, { backgroundColor: 'transparent', padding: 0 }]}>
                        <Text style={[styles.profileButtonText, { textAlign: 'center' }]}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>}
              </View>
            )}

            <TouchableOpacity onPress={() => {
              handleCloseModalPress();
            }
            } style={[styles.profileButton, { marginTop: 20, backgroundColor: '#111111' }]}>
              <Text style={[styles.profileButtonText, { textAlign: 'center', color: '#fff' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f4f4',
    height: '100%',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 30,
    // tintColor: '#111111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingFooter: {
    paddingVertical: 20,
    marginBottom: 50
  },
  headerActions: {
    flexDirection: 'row',
    columnGap: 20,
    alignItems: 'center'
  },
  profileButton: {
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  profileButtonText: {
    textTransform: 'uppercase',
    fontSize: 16,
    color: '#150000',
    fontFamily: 'Qatar',
  },
  dmBtnImg: {
    width: 25,
    height: 25
  },
  postBtnImg: {
    width: 25,
    height: 25
  },
  navBar: {
    position: 'absolute',
    bottom: Platform.OS == 'ios' ? 100 : 70,
    left: 10,
    width: width - 20,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,

    // Android shadow
    elevation: 5,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#111111',
  },
  activeIcon: {
    width: 24,
    height: 24,
    // tintColor: '#FF4000',
  },
  createPostContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#FF4000"
  },
  postInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#050505',
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  createPostButton: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  createPostButtonText: {
    fontSize: 16,
    color: '#150000',
    fontFamily: 'Qatar',
  },
  postContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 10,
    marginHorizontal: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  post: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  postContent: {
    width: width - 100,
  },
  postStats: {
    width: 30,
  },
  postActionBtn: {
    alignItems: 'center',
    marginBottom: 15,
  },
  postActionBtnLast: {
    marginBottom: 0,
  },
  postActionText: {
    fontFamily: 'Acumin',
    fontSize: 14,
    color: '#888888'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postAvatar: {
    width: undefined,
    height: '100%',
    maxWidth: 44,
    aspectRatio: 1
  },
  postHeaderInfo: {
    flex: 1,
  },
  postUserName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#050505',
  },
  postDate: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  postOptions: {
    padding: 5,
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#050505',
    fontFamily: 'Acumin'
  },
  postImage: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 8,
  },
  videoContainer: {
    width: '100%',
    marginBottom: 15,
  },
  videoPlaceholder: {
    width: '100%',
    height: width * 0.6,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentShareStat: {
    flexDirection: 'row',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'blue',
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  fixedPlayButton: {
    position: 'relative',
  },
  durationText: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  centerOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  fullscreenBottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 10
  },
  fullscreenDurationText: {
    color: 'white',
    fontSize: 18,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  commentModalHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  commentModalHandle: {
    width: 40,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentModalTitle: {
    fontSize: 18,
    fontFamily: 'Qatar',
    color: '#333',
  },
  commentModalClose: {
    padding: 5,
  },
  commentLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  commentList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    // fontFamily:'Qatar',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
    marginRight: 15
  },
  commentText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 3,
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  noComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#888',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: Platform.OS == "ios" ? 30 : 50,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white'
  },
  commentInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS == "ios" ? 10 : 8,
    fontSize: 14,
    color: '#333',
  },
  commentSubmit: {
    marginLeft: 10,
    padding: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#FF4000',
    overflow: 'hidden',
  },
  profileImageAvatar: {
    height: '100%',
    width: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  newPostContainer: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    padding: 5,
    marginBottom: 20
  },
  avatarContainer: {
    width: 50,
    height: 50,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 25,
  },
  textInput: {
    fontSize: 16,
    minHeight: 100,
    padding: 12,
    borderRadius: 10,
    textAlignVertical: 'top',
    color: 'black'
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  media: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 8,
  },
  mediaWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 12,
    zIndex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#150000',
    fontFamily: 'Qatar',
  },
  postButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1
  },
  postSec: {
    backgroundColor: '#f4f4f4',
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Qatar'
  },
  postSecBtnText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Qatar'
  },
  postText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#050505',
    fontFamily: 'Acumin'
  },
});