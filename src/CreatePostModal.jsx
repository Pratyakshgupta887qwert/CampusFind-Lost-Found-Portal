import React, { useState } from 'react';

const CreatePostModal = ({ onClose, onSubmit }) => {
  const [postType, setPostType] = useState('lost');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !location) return; // Basic validation
    
    onSubmit({
      type: postType,
      title,
      location,
      eventDate,
      description
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border-t-4 border-t-[#ffb900] border border-zinc-800 w-full max-w-lg shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700 px-2 py-1">X</button>
        
        <div className="p-8">
          <h2 className="text-2xl font-mono font-bold text-[#00a4ef] mb-6">Create New Alert</h2>
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setPostType('lost')}
              className={`flex-1 py-3 font-bold border ${postType === 'lost' ? 'bg-[#e3008c]/10 border-[#e3008c] text-[#e3008c]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              I Lost Something
            </button>
            <button 
              onClick={() => setPostType('found')}
              className={`flex-1 py-3 font-bold border ${postType === 'found' ? 'bg-[#7fba00]/10 border-[#7fba00] text-[#7fba00]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              I Found Something
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">ITEM NAME</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 text-white focus:outline-none focus:border-[#00a4ef]" 
                placeholder="e.g. Blue Water Bottle" 
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">LOCATION {postType === 'lost' ? 'LOST' : 'FOUND'}</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 text-white focus:outline-none focus:border-[#00a4ef]" 
                placeholder="e.g. Near Cafeteria" 
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">DATE / TIME</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 text-white focus:outline-none focus:border-[#00a4ef]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">SHORT DESCRIPTION (OPTIONAL)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 text-white focus:outline-none focus:border-[#00a4ef] h-24 resize-none" 
                placeholder="Brand, color, specific marks..."
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-[#ffb900] text-black font-bold py-3 mt-4 hover:bg-yellow-500 transition-colors">
              Broadcast to Campus
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
