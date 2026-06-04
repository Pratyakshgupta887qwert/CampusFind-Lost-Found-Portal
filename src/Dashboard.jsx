import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import FeedItemCard from './FeedItemCard';
import CreatePostModal from './CreatePostModal';
import { apiRequest } from './api';

const DAY = 24 * 60 * 60 * 1000;

const formatTime = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  if (diff < 60 * 1000) return 'Just now';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} mins ago`;
  if (diff < DAY) return `${Math.floor(diff / (60 * 60 * 1000))} hours ago`;
  return `${Math.floor(diff / DAY)} days ago`;
};

const normalize = (value = '') => value.toLowerCase().trim();
const wordsFrom = (value = '') => normalize(value).split(/[^a-z0-9]+/).filter((word) => word.length > 2);

const scoreMatch = (left, right) => {
  const leftWords = wordsFrom(`${left.title} ${left.location}`);
  const rightText = normalize(`${right.title} ${right.location}`);
  return leftWords.filter((word) => rightText.includes(word)).length;
};

const decoratePost = (post) => ({
  ...post,
  id: post._id,
  ownerEmail: post.owner?.email,
  finderEmail: post.finder?.email,
  ownerName: post.owner?.name,
  finderName: post.finder?.name,
  displayStatus: post.status,
  time: formatTime(post.createdAt),
});

const Dashboard = ({ session, onLogout }) => {
  const { token, user } = session;
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    lost: 0,
    found: 0,
    returned: 0,
    pending: 0,
    successRate: 0,
    topHelpers: [],
  });
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const [postData, notificationData, analyticsData] = await Promise.all([
      apiRequest('/api/posts', { token }),
      apiRequest('/api/notifications', { token }),
      apiRequest('/api/analytics', { token }),
    ]);
    setPosts(postData.posts.map(decoratePost));
    setNotifications(notificationData.notifications);
    setAnalytics(analyticsData.analytics);
  }, [token]);

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, [loadData]);

  useEffect(() => {
    const socket = io('/', { auth: { email: user.email } });

    socket.on('notification:new', (notification) => {
      setNotifications((current) => [notification, ...current].slice(0, 30));
      setToast(notification);
    });

    socket.on('post:new', (post) => {
      setPosts((current) => [decoratePost(post), ...current]);
    });

    socket.on('post:updated', (post) => {
      const nextPost = decoratePost(post);
      setPosts((current) => current.map((item) => (item.id === nextPost.id ? nextPost : item)));
      apiRequest('/api/analytics', { token })
        .then((data) => setAnalytics(data.analytics))
        .catch(() => {});
    });

    return () => socket.disconnect();
  }, [token, user.email]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const locations = useMemo(() => ['all', ...Array.from(new Set(posts.map((post) => post.location))).sort()], [posts]);

  const matchesByPost = useMemo(() => {
    const lostPosts = posts.filter((post) => post.type === 'lost' && post.status === 'open');
    const foundPosts = posts.filter((post) => post.type === 'found' && post.status === 'open');

    return posts.reduce((acc, post) => {
      const candidates = post.type === 'lost' ? foundPosts : lostPosts;
      acc[post.id] = candidates
        .filter((candidate) => candidate.id !== post.id)
        .map((candidate) => ({ ...candidate, score: scoreMatch(post, candidate) }))
        .filter((candidate) => candidate.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);
      return acc;
    }, {});
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const search = normalize(query);
    const now = Date.now();
    return posts
      .filter((post) => activeTab === 'all' || post.type === activeTab || post.status === activeTab)
      .filter((post) => locationFilter === 'all' || post.location === locationFilter)
      .filter((post) => {
        if (dateFilter === 'all') return true;
        const createdAt = new Date(post.createdAt).getTime();
        if (dateFilter === 'today') return now - createdAt < DAY;
        return now - createdAt < 7 * DAY;
      })
      .filter((post) =>
        search
          ? normalize(
              `${post.title} ${post.location} ${post.description || ''} ${post.owner?.name || ''} ${post.finder?.name || ''}`
            ).includes(search)
          : true
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [activeTab, dateFilter, locationFilter, posts, query]);

  const badges = user.badges || [];

  const handleCreatePost = async (newPost) => {
    const data = await apiRequest('/api/posts', {
      token,
      method: 'POST',
      body: JSON.stringify(newPost),
    });
    setPosts((current) => [decoratePost(data.post), ...current]);
    setCreateModalOpen(false);
  };

  const handleFoundItem = async (postId, returnLocation) => {
    const data = await apiRequest(`/api/posts/${postId}/found`, {
      token,
      method: 'POST',
      body: JSON.stringify({ returnLocation }),
    });
    setPosts((current) => current.map((post) => (post.id === postId ? decoratePost(data.post) : post)));
  };

  const handleClaimFoundPost = async (postId, collectionLocation) => {
    const data = await apiRequest(`/api/posts/${postId}/claim`, {
      token,
      method: 'POST',
      body: JSON.stringify({ collectionLocation }),
    });
    setPosts((current) => current.map((post) => (post.id === postId ? decoratePost(data.post) : post)));
  };

  const handleApproveReturn = async (postId) => {
    const data = await apiRequest(`/api/posts/${postId}/approve`, { token, method: 'POST' });
    setPosts((current) => current.map((post) => (post.id === postId ? decoratePost(data.post) : post)));
  };

  const handleRejectReturn = async (postId) => {
    const data = await apiRequest(`/api/posts/${postId}/reject`, { token, method: 'POST' });
    setPosts((current) => current.map((post) => (post.id === postId ? decoratePost(data.post) : post)));
  };

  const markNotificationsRead = async () => {
    await apiRequest('/api/notifications/read', { token, method: 'PATCH' });
    setNotifications((current) => current.map((notification) => ({ ...notification, readBy: [...(notification.readBy || []), user.id] })));
  };

  const runAction = (action) => {
    action().catch((err) => {
      setError(err.message);
      setToast({ message: err.message });
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ffb900] selection:text-black">
      {toast && (
        <div className="fixed right-4 top-20 z-50 max-w-sm border border-[#00a4ef] bg-black px-4 py-3 shadow-2xl">
          <div className="mb-1 font-mono text-xs text-[#00a4ef]">LIVE NOTIFICATION</div>
          <div className="text-sm text-zinc-200">{toast.message}</div>
        </div>
      )}

      <header className="flex flex-col gap-4 border-b border-zinc-800 bg-[#0a0a0a] px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 animate-pulse bg-[#00a4ef]"></div>
          <span className="font-mono text-xl font-bold tracking-tight text-[#00a4ef]">GLAU_FEED</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <span className="text-sm text-zinc-400">
            Logged in as: <strong className="text-white">{user.name}</strong>
          </span>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ffb900] px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-yellow-500"
          >
            <span>+</span> New Alert
          </button>
          <button onClick={onLogout} className="border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-white">
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <aside className="w-full space-y-5 lg:w-72">
          <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
            <h3 className="mb-4 font-mono text-sm text-zinc-400">FILTER FEED</h3>
            <div className="space-y-2">
              {[
                ['all', 'All Items', '#00a4ef'],
                ['lost', 'Lost Only', '#e3008c'],
                ['found', 'Found Only', '#7fba00'],
                ['pending_return', 'Awaiting Approval', '#f25022'],
                ['returned', 'Completed', '#ffb900'],
              ].map(([value, label, color]) => (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className="w-full border px-3 py-2 text-left text-sm transition-colors"
                  style={{
                    borderColor: activeTab === value ? color : 'transparent',
                    color: activeTab === value ? color : '#a1a1aa',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
            <h3 className="mb-4 font-mono text-sm text-zinc-400">ANALYTICS</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border border-zinc-800 bg-black p-3">
                <div className="text-2xl font-bold text-[#e3008c]">{analytics.lost}</div>
                <div className="text-xs text-zinc-500">Lost</div>
              </div>
              <div className="border border-zinc-800 bg-black p-3">
                <div className="text-2xl font-bold text-[#7fba00]">{analytics.returned}</div>
                <div className="text-xs text-zinc-500">Returned</div>
              </div>
              <div className="border border-zinc-800 bg-black p-3">
                <div className="text-2xl font-bold text-[#00a4ef]">{analytics.successRate}%</div>
                <div className="text-xs text-zinc-500">Success</div>
              </div>
              <div className="border border-zinc-800 bg-black p-3">
                <div className="text-2xl font-bold text-[#f25022]">{analytics.pending}</div>
                <div className="text-xs text-zinc-500">Pending</div>
              </div>
            </div>
            <div className="mt-3 border border-zinc-800 bg-black p-3 text-xs text-zinc-400">
              Most helpful:{' '}
              <span className="text-white">
                {analytics.topHelpers?.[0] ? `${analytics.topHelpers[0].name} (${analytics.topHelpers[0].count})` : 'No returns yet'}
              </span>
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-mono text-sm text-zinc-400">BADGES</h3>
              <span className="text-xs text-[#ffb900]">{badges.length}</span>
            </div>
            <div className="space-y-2">
              {badges.length ? (
                badges.map((badge) => (
                  <div key={badge} className="border border-[#ffb900]/40 bg-[#ffb900]/10 px-3 py-2 text-xs text-[#ffb900]">
                    {badge}
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500">Return an item to unlock public trust badges.</p>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-5">
          {error && <div className="border border-[#f25022] bg-[#f25022]/10 p-3 text-sm text-[#f25022]">{error}</div>}

          <section className="grid gap-3 border border-zinc-800 bg-[#0a0a0a] p-4 md:grid-cols-[1fr_180px_140px]">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by item name, location, person, description..."
              className="w-full border border-zinc-800 bg-black px-4 py-2 text-white outline-none focus:border-[#00a4ef]"
            />
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#00a4ef]"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All locations' : location}
                </option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#00a4ef]"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
            </select>
          </section>

          <section className="border border-zinc-800 bg-[#0a0a0a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-mono text-sm text-zinc-400">REAL-TIME NOTIFICATIONS</h3>
              <button onClick={() => runAction(markNotificationsRead)} className="text-xs text-[#00a4ef] hover:text-white">
                Mark read
              </button>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => {
                const isRead = notification.readBy?.includes(user.id);
                return (
                  <div
                    key={notification._id}
                    className={`border px-3 py-2 text-xs ${
                      isRead ? 'border-zinc-800 text-zinc-500' : 'border-[#00a4ef]/40 bg-[#00a4ef]/5 text-zinc-200'
                    }`}
                  >
                    {notification.message}
                  </div>
                );
              })}
              {notifications.length === 0 && <p className="text-xs text-zinc-500">No notifications yet.</p>}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4">
            {filteredPosts.map((post) => (
              <FeedItemCard
                key={post.id}
                item={post}
                currentUser={user}
                matches={matchesByPost[post.id] || []}
                onFound={(postId, returnLocation) => runAction(() => handleFoundItem(postId, returnLocation))}
                onClaimFound={(postId, collectionLocation) => runAction(() => handleClaimFoundPost(postId, collectionLocation))}
                onApprove={(postId) => runAction(() => handleApproveReturn(postId))}
                onReject={(postId) => runAction(() => handleRejectReturn(postId))}
              />
            ))}
            {filteredPosts.length === 0 && (
              <p className="border border-zinc-800 p-4 font-mono text-zinc-500">No items match your filter.</p>
            )}
          </div>
        </div>
      </main>

      {isCreateModalOpen && (
        <CreatePostModal onClose={() => setCreateModalOpen(false)} onSubmit={(post) => runAction(() => handleCreatePost(post))} />
      )}
    </div>
  );
};

export default Dashboard;
