import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, ThumbsUp, Send, Trash2, Plus, Sparkles, User, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [commentInput, setCommentInput] = useState({});

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/forum'));
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await axios.post(getApiUrl('/api/forum'), { title, content, category });
      setTitle('');
      setContent('');
      setShowNewModal(false);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.put(getApiUrl(`/api/forum/${postId}/like`));
      fetchPosts();
    } catch (err) {
      alert('Failed to like post');
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInput[postId];
    if (!text) return;
    try {
      await axios.post(getApiUrl(`/api/forum/${postId}/comments`), { text });
      setCommentInput({ ...commentInput, [postId]: '' });
      fetchPosts();
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(getApiUrl(`/api/forum/${postId}`));
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Forum Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MessageSquare size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100 font-serif">Community Forum</h2>
            <p className="text-xs text-slate-400">Ask questions, share resources, and connect with SkillSync peers</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition duration-300 shadow-md shadow-brand-600/10"
        >
          <Plus size={16} />
          New Discussion
        </button>
      </div>

      {/* New Post Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Create New Discussion Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="General">General</option>
                  <option value="Frontend">Frontend Development</option>
                  <option value="Backend">Backend & Databases</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Career & Mentorship">Career & Mentorship</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Content</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details, ask questions, or share tips..."
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-bold hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-100 text-xs font-bold"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {post.authorId?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {post.authorId?.name || 'Peer User'}
                    {post.authorId?.isVerified && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold">Verified</span>
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-1">
                  <Tag size={10} />
                  {post.category}
                </span>
                {(user?.id === post.authorId?._id || user?.role === 'admin') && (
                  <button onClick={() => handleDeletePost(post._id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100">{post.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{post.content}</p>
            </div>

            {/* Like and Stats */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-850 text-xs text-slate-400">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition duration-300 ${
                  post.likes?.includes(user?.id)
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                    : 'bg-slate-950 border-slate-850 hover:text-slate-200'
                }`}
              >
                <ThumbsUp size={14} />
                <span>{post.likes?.length || 0} Likes</span>
              </button>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} />
                {post.comments?.length || 0} Comments
              </span>
            </div>

            {/* Comments List */}
            {post.comments?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-850/60">
                {post.comments.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-850/60 text-xs space-y-1">
                    <div className="font-bold text-slate-300">{c.authorId?.name || 'Peer'}</div>
                    <p className="text-slate-400">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentInput[post._id] || ''}
                onChange={(e) => setCommentInput({ ...commentInput, [post._id]: e.target.value })}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => handleAddComment(post._id)}
                className="px-3 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-white text-xs font-bold flex items-center gap-1"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
