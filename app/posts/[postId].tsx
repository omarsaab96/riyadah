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
    Keyboard,
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

// Component for user avatar display
const UserAvatar = ({ user, style = {} }) => {
  const getAvatarSource = () => {
    if (!user) return require('../../assets/avatar.png');

    if (user.image) {
      return { uri: user.image };
    }

    if (user.type === "Club" || user.type === "Association") {
      return require('../../assets/clublogo.png');
    }

    if (user.gender === "Female") {
      return require('../../assets/avatarF.png');
    }

    return require('../../assets/avatar.png');
  };

  return (
    <View style={[styles.profileImage, style]}>
      <Image
        source={getAvatarSource()}
        style={styles.profileImageAvatar}
        resizeMode="contain"
      />
    </View>
  );
};

// Comment Footer Component
const CommentFooter = ({ footerProps, user, submittingComment, onSubmitComment }) => {
  const [newComment, setNewComment] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onSubmitComment(newComment);
      setNewComment('');
    }
  };

  return (
    <BottomSheetFooter {...footerProps}>
      <View style={[
        styles.commentInputContainer,
        keyboardVisible && styles.commentInputContainerKeyboardVisible
      ]}>
        <UserAvatar user={user} />
        <BottomSheetTextInput
          style={styles.commentInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.commentSubmit}
          onPress={handleSubmit}
          disabled={!newComment.trim() || submittingComment}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color="#FF4000" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={newComment.trim() ? "#FF4000" : "#888"}
            />
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetFooter>
  );
};

// Video Player Component
const VideoPlayer = ({ uri, style, showFullscreenToggle = false }) => {
  const videoRef = useRef<Video>(null);
  const fullscreenVideoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);

  const formatTime = (millis) => {
    if (!millis) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getDisplayTime = () => {
    return formatTime(isPlaying ? duration - currentPosition : duration);
  };

  const handlePlaybackStatusUpdate = (status) => {
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
      if (isPlaying) videoRef.current?.playAsync();
    } else {
      fullscreenVideoRef.current?.setPositionAsync(currentPosition);
      if (isPlaying) fullscreenVideoRef.current?.playAsync();
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
        <View style={style}>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.video}
            resizeMode="cover"
            isLooping
            shouldPlay={isPlaying && !isFullscreen}
            useNativeControls={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
          <View style={[styles.overlay, !showControls && !isPlaying && styles.centerOverlay]}>
            {(!isPlaying || showControls) && (
              <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="white" />
              </TouchableOpacity>
            )}
            {showFullscreenToggle && (
              <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenToggleArea} />
            )}
            {(showControls || !isPlaying) && (
              <View style={styles.bottomBar}>
                <Text style={styles.durationText}>{getDisplayTime()}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={isFullscreen}
        transparent
        animationType="slide"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={toggleFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <Video
            ref={fullscreenVideoRef}
            source={{ uri }}
            style={styles.fullscreenVideo}
            resizeMode="contain"
            isLooping
            shouldPlay={isPlaying}
            useNativeControls={true}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
          <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
            <View style={[styles.fullscreenOverlay, !showControls && !isPlaying && styles.centerOverlay]}>
              {(showControls || !isPlaying) && (
                <View style={styles.fullscreenBottomBar}>
                  {(!isPlaying || showControls) && (
                    <TouchableOpacity onPress={togglePlayPause} style={[styles.playButton, styles.fixedPlayButton]}>
                      <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="white" />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.fullscreenDurationText}>{getDisplayTime()}</Text>
                  <TouchableOpacity onPress={toggleFullscreen}>
                    <Ionicons name="contract" size={36} color="white" />
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

// Media Renderer Component
const MediaRenderer = ({ post }) => {
  if (!post || !post.type) return null;

  const renderMediaGrid = (mediaItems, isLastItemOverlay) => {
    return (
      <MasonryList
        data={mediaItems}
        keyExtractor={(item, index) => `${item.uri || item}-${index}`}
        numColumns={2}
        containerStyle={styles.mediaGridContainer}
        style={styles.mediaGrid}
        renderItem={({ item, index }) => {
          const isLastPreview = isLastItemOverlay && index === 3;
          const remainingCount = mediaItems.length - 3;

          return (
            <View style={styles.mediaItemContainer}>
              {typeof item === 'string' ? (
                <Image source={{ uri: item }} style={styles.mediaImage} resizeMode="cover" />
              ) : item.type === 'image' ? (
                <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="cover" />
              ) : (
                <VideoPlayer uri={item.uri} style={styles.mediaVideo} />
              )}
              {isLastPreview && (
                <View style={styles.mediaOverlay}>
                  <Text style={styles.mediaOverlayText}>+ {remainingCount}</Text>
                </View>
              )}
            </View>
          );
        }}
      />
    );
  };

  switch (post.type) {
    case 'image':
      if (post.media?.images?.length === 1) {
        return (
          <Image
            source={{ uri: post.media.images[0] }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        );
      } else if (post.media?.images?.length > 1) {
        const isMoreThanFour = post.media.images.length >= 4;
        const previewImages = isMoreThanFour ? post.media.images.slice(0, 4) : post.media.images;
        return renderMediaGrid(previewImages, isMoreThanFour);
      }
      break;

    case 'video':
      if (post.media?.videos?.length === 1) {
        return (
          <View style={styles.singleVideoContainer}>
            <VideoPlayer uri={post.media.videos[0]} style={styles.singleVideo} />
          </View>
        );
      } else if (post.media?.videos?.length > 1) {
        const isMoreThanFour = post.media.videos.length >= 4;
        const previewVideos = isMoreThanFour ? post.media.videos.slice(0, 4) : post.media.videos;
        return renderMediaGrid(previewVideos, isMoreThanFour);
      }
      break;

    case 'multipleMedia':
      const images = post.media?.images || [];
      const videos = post.media?.videos || [];
      const allMedia = [
        ...images.map(uri => ({ uri, type: 'image' })),
        ...videos.map(uri => ({ uri, type: 'video' }))
      ];

      if (allMedia.length > 0) {
        const isMoreThanFour = allMedia.length > 4;
        const previewMedia = isMoreThanFour ? allMedia.slice(0, 4) : allMedia;
        return renderMediaGrid(previewMedia, isMoreThanFour);
      }
      break;
  }

  return null;
};

// Post Header Component
const PostHeader = ({ post, onMoreOptions, formatDate }) => (
  <View style={styles.postHeader}>
    <UserAvatar user={post.created_by} />
    <View style={styles.postHeaderInfo}>
      <Text style={styles.postUserName}>{post.created_by?.name || 'Unknown User'}</Text>
      <Text style={styles.postDate}>{formatDate(post.date)}</Text>
    </View>
    <TouchableOpacity onPress={() => onMoreOptions(post)} style={styles.postOptions}>
      <Ionicons name="ellipsis-horizontal" size={24} color="#888888" />
    </TouchableOpacity>
  </View>
);

// Post Actions Component
const PostActions = ({ post, userId, onLike, onComment, onShare, liking }) => {
  const isLiked = userId && post.likes?.some(like => like._id === userId);

  return (
    <View style={styles.postStats}>
      <TouchableOpacity onPress={onLike} style={styles.postActionBtn}>
        {liking ? (
          <ActivityIndicator size="small" color="#FF4000" style={styles.likeIndicator} />
        ) : (
          <FontAwesome
            name={isLiked ? "heart" : "heart-o"}
            size={24}
            color={isLiked ? "#FF4000" : "#888888"}
          />
        )}
        <Text style={styles.postActionText}>{post.likes?.length || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onComment} style={styles.postActionBtn}>
        <FontAwesome name="comment-o" size={24} color="#888888" />
        <Text style={styles.postActionText}>{post.comments?.length || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onShare} style={[styles.postActionBtn, styles.postActionBtnLast]}>
        <FontAwesome name="share-square-o" size={24} color="#888888" />
      </TouchableOpacity>
    </View>
  );
};

// Bottom Navigation Component
const BottomNavigation = ({ router }) => (
  <View style={styles.navBar}>
    <TouchableOpacity onPress={() => router.replace('/settings')}>
      <Image source={require('../../assets/settings.png')} style={styles.icon} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => router.replace('/search')}>
      <Image source={require('../../assets/search.png')} style={styles.icon} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => router.replace('/landing')}>
      <Image source={require('../../assets/home.png')} style={styles.activeIcon} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => router.replace('/notifications')}>
      <Image source={require('../../assets/notifications.png')} style={styles.icon} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => router.replace('/profile')}>
      <Image source={require('../../assets/profile.png')} style={styles.icon} />
    </TouchableOpacity>
  </View>
);

// Comments List Component
const CommentsList = ({ comments, loadingComments, formatDate }) => {
  if (loadingComments) {
    return (
      <View style={styles.commentLoading}>
        <ActivityIndicator size="large" color="#FF4000" />
      </View>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <View style={styles.noComments}>
        <Text style={styles.noCommentsText}>No comments yet</Text>
      </View>
    );
  }

  return (
    <>
      {comments.map((item) => (
        <View key={item._id} style={styles.commentItem}>
          <UserAvatar user={item.user} />
          <View style={styles.commentContent}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{item.user?.name || 'Unknown User'}</Text>
              <Text style={styles.commentDate}>{formatDate(item.date)}</Text>
            </View>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
        </View>
      ))}
    </>
  );
};

// More Options Component
const MoreOptionsSheet = ({
  post,
  userId,
  deleteConfirmation,
  onClose,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  router
}) => (
  <BottomSheetView style={styles.moreOptionsContainer}>
    <View style={styles.moreOptionsContent}>
      {post.created_by._id === userId ? (
        <TouchableOpacity onPress={() => { onClose(); router.replace('/profile'); }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Go to your profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => {
          onClose();
          router.push({ pathname: '/profile/public', params: { id: post.created_by._id } });
        }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Go to {post.created_by.name}'s profile</Text>
        </TouchableOpacity>
      )}

      {post.created_by._id === userId && (
        <View>
          {!deleteConfirmation && (
            <TouchableOpacity onPress={onDelete} style={[styles.profileButton, styles.deleteButton]}>
              <Text style={[styles.profileButtonText, styles.deleteButtonText]}>Delete post</Text>
            </TouchableOpacity>
          )}
          {deleteConfirmation && (
            <View style={[styles.profileButton, styles.confirmationContainer]}>
              <Text style={[styles.profileButtonText, styles.deleteButtonText]}>Are you sure?</Text>
              <View style={styles.confirmationButtons}>
                <TouchableOpacity onPress={onConfirmDelete} style={styles.confirmationButton}>
                  <Text style={styles.confirmationButtonText}>Yes, delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancelDelete} style={styles.confirmationButton}>
                  <Text style={styles.confirmationButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity onPress={onClose} style={[styles.profileButton, styles.cancelButton]}>
        <Text style={[styles.profileButtonText, styles.cancelButtonText]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </BottomSheetView>
);

// Main Post Screen Component
export default function PostScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();

  // State management
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [liking, setLiking] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // Refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const moreOptionsRef = useRef<BottomSheet>(null);

  // Constants
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  // Callbacks
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

  const renderBackdrop = useCallback((props) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
  ), []);

  // Date formatting
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // API functions
  const fetchUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
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
  };

  const fetchPost = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`https://server.riyadah.app/api/posts/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
    const isLiked = post.likes?.some(like => like._id === userId);
    const updatedLikes = isLiked
      ? post.likes.filter(like => like._id !== userId)
      : [...(post.likes || []), { _id: userId }];

    setPost(prev => ({ ...prev, likes: updatedLikes }));

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(`https://server.riyadah.app/api/posts/like/${postId}`, {
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
      const res = await fetch(`https://server.riyadah.app/api/posts/comments/${postId}`, {
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

  const handleSubmitComment = async (commentText) => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(`https://server.riyadah.app/api/posts/comments/${postId}`, {
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

  const handleMoreOptions = (post) => {
    setSelectedPost(post);
    handleOpenMoreOptions();
  };

  const handleShare = async () => {
    const url = `https://riyadah.app/posts/${postId}`;
    try {
      await Share.share({
        message: `Check out this post on Riyadah: ${url}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error.message);
    }
  };

  const handleDeletePost = () => setDeleteConfirmation(postId);
  const handleCancelDeletePost = () => setDeleteConfirmation('');

  const handleConfirmDeletePost = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(`https://server.riyadah.app/api/posts/delete/${postId}`, {
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
        router.back();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  // Effects
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId && postId) {
      fetchPost();
    }
  }, [userId, postId]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4000" />
      </View>
    );
  }

  // Error state
  if (!post || typeof post !== 'object' || !post.created_by) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Invalid post data</Text>
      </View>
    );
  }

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      {Platform.OS === 'ios' ? (
        <View style={{ height: 60, backgroundColor: '#FF4000' }} />
      ) : (
        <View style={{ height: 25, backgroundColor: '#FF4000' }} />
      )}

      <SafeAreaView>
        <View style={{ height: '100%', paddingBottom: 100 }}>
          <FlatList
            data={[post]}
            renderItem={() => (
              <View style={styles.postContainer}>
                <PostHeader
                  post={post}
                  onMoreOptions={handleMoreOptions}
                  formatDate={formatDate}
                />

                <View style={styles.post}>
                  <View style={styles.postContent}>
                    {post.title && <Text style={styles.postTitle}>{post.title}</Text>}
                    {post.content?.trim() !== '' && (
                      <Text style={styles.postText}>{post.content}</Text>
                    )}
                    <MediaRenderer post={post} />
                  </View>

                  <PostActions
                    post={post}
                    userId={userId}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    liking={liking}
                  />
                </View>
              </View>
            )}
            ListHeaderComponent={
              <>
                <View style={styles.header}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} >
                    <Image
                      source={require('../../assets/logo_orangeBlack.png')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>

                </View>
              </>
            }
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
        </View>

        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.replace('/settings')}>
            <Image source={require('../../assets/settings.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/search')}>
            <Image source={require('../../assets/search.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/landing')}>
            <Image source={require('../../assets/home.png')} style={[styles.icon]} />
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
      {
        user && (
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            handleIndicatorStyle={styles.bottomSheetHandle}
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
            <BottomSheetView style={styles.commentsSheet}>
              <View style={styles.commentModalHeader}>
                <Text style={styles.commentModalTitle}>Comments</Text>
                <TouchableOpacity onPress={handleCloseModalPress} style={styles.commentModalClose}>
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>
              <BottomSheetScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.commentsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <CommentsList
                  comments={comments}
                  loadingComments={loadingComments}
                  formatDate={formatDate}
                />
              </BottomSheetScrollView>
            </BottomSheetView>
          </BottomSheet>
        )
      }

      {/* More Options Bottom Sheet */}
      {
        selectedPost && (
          <BottomSheet
            ref={moreOptionsRef}
            enablePanDownToClose={true}
            handleIndicatorStyle={styles.bottomSheetHandle}
            backdropComponent={renderBackdrop}
          >
            <MoreOptionsSheet
              post={post}
              userId={userId}
              deleteConfirmation={deleteConfirmation}
              onClose={handleCloseModalPress}
              onDelete={handleDeletePost}
              onConfirmDelete={handleConfirmDeletePost}
              onCancelDelete={handleCancelDeletePost}
              router={router}
            />
          </BottomSheet>
        )
      }
    </GestureHandlerRootView >
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
  video: {
    width: '100%', 
    height: '100%'
  },
  fullscreenVideo: {
    width: '100%', 
    height: '100%'
  },
  fullscreenToggleArea: {
    position: 'absolute', 
    right: 0, 
    top: 0, 
    width: '100%', 
    height: '70%'
  },
  mediaGridContainer: {
    marginTop: 10
  },
  mediaGrid: {
    margin: -5
  },
  mediaItemContainer: {
    borderRadius: 8,
    backgroundColor: 'black',
    overflow: 'hidden',
    margin: 5,
    position: 'relative',
  },
  mediaImage: {
    width: '100%', 
    aspectRatio: 1
  },
  mediaVideo: {
    width: '100%', 
    aspectRatio: 1
  },
  mediaOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  mediaOverlayText: {
    color: '#fff', 
    fontFamily: 'Qatar', 
    fontSize: 30
  },
  singleImage: {
    width: '100%', 
    height: width * 0.8, 
    borderRadius: 8, 
    marginTop: 10
  },
  singleVideoContainer: {
    borderRadius: 8,
    backgroundColor: 'black',
    overflow: 'hidden',
    marginTop: 10,
    aspectRatio: 1
  },
  singleVideo: {
    width: '100%', 
    height: '100%'
  },
  likeIndicator: {
    marginBottom: 5
  },
  commentInputContainerKeyboardVisible: {
    paddingBottom: 10
  },
  bottomSheetHandle: {
    width: 50, 
    backgroundColor: '#aaa'
  },
  commentsSheet: {
    backgroundColor: 'white', 
    zIndex: 1
  },
  commentsScrollContent: {
    paddingHorizontal: 15, 
    marginTop: 50, 
    paddingBottom: 140
  },
  commentHeader: {
    flexDirection: 'row', 
    alignItems: 'center'
  },
  moreOptionsContainer: {
    flex: 1, 
    paddingBottom: 50
  },
  moreOptionsContent: {
    padding: 20
  },
  deleteButton: {
    marginTop: 10
  },
  deleteButtonText: {
    color: '#FF4000'
  },
  confirmationContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10
  },
  confirmationButtons: {
    flexDirection: 'row', 
    columnGap: 30, 
    alignItems: 'center'
  },
  confirmationButton: {
    backgroundColor: 'transparent', 
    padding: 0
  },
  confirmationButtonText: {
    textAlign: 'center'
  },
  cancelButton: {
    marginTop: 20, 
    backgroundColor: '#111111'
  },
  cancelButtonText: {
    textAlign: 'center', 
    color: '#fff'
  },
  iosStatusBar: {
    height: 60,
    backgroundColor: '#FF4000'
  },
  androidStatusBar: {
    height: 25,
    backgroundColor: '#FF4000'
  },
  safeArea: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 24,
  },
});