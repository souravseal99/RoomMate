import React, { useState, useMemo, useCallback, useEffect } from 'react';

// I have made the webpage with mock data as the we yet to work on data collection for our real site, so did this for demonstration
// In a real app, these functions would be in `src/api/choresApi.ts` and use Axios.
// In the site I have tried to incoperate as much I could think of at the moment, with a section to add tasks and even a gamified points system for better accountability


const FAKE_API_LATENCY = 500;

const api = {
  fetchHouseholdData: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          members: [
            { id: '1', name: 'Sourav', points: 50 }, { id: '2', name: 'Nav', points: 30 },
            { id: '3', name: 'Oashe', points: 70 }, { id: '4', name: 'Abhinav', points: 20 },
          ],
          chores: [
            { id: 'c1', title: 'Take out the trash', assignedTo: '1', dueDate: new Date().toISOString(), status: 'To Do', isRecurring: true, frequency: 'Weekly', points: 10 },
            { id: 'c2', title: 'Clean the kitchen', assignedTo: '2', dueDate: new Date(Date.now() + 86400000).toISOString(), status: 'To Do', isRecurring: false, frequency: 'Not Recurring', points: 15 },
            { id: 'c3', title: 'Wipe down bathroom surfaces', assignedTo: '3', dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'To Do', isRecurring: false, frequency: 'Not Recurring', points: 10 },
            { id: 'c4', title: 'Buy groceries', assignedTo: '4', status: 'In Progress', isRecurring: false, frequency: 'Not Recurring', points: 10 },
            { id: 'c5', title: 'Water the plants', assignedTo: '1', dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'In Progress', isRecurring: true, frequency: 'Weekly', points: 5 },
            { id: 'c6', title: 'Vacuum the living room', assignedTo: '2', status: 'Completed', isRecurring: true, frequency: 'Monthly', points: 20 },
            { id: 'c7', title: 'Organize the pantry', assignedTo: '3', status: 'Completed', isRecurring: false, frequency: 'Not Recurring', points: 15 },
          ],
        });
      }, FAKE_API_LATENCY);
    });
  },
  addChore: async (chore) => new Promise(resolve => setTimeout(() => resolve({ ...chore, id: `c${Date.now()}` }), FAKE_API_LATENCY)),
  updateChore: async (chore) => new Promise(resolve => setTimeout(() => resolve(chore), FAKE_API_LATENCY)),
  deleteChore: async (choreId) => new Promise(resolve => setTimeout(() => resolve({ success: true }), FAKE_API_LATENCY)),
};


// --- Helper Functions & Constants ---
const AVATAR_COLORS = ['#FFC107', '#4CAF50', '#2196F3', '#F44336', '#9C27B0', '#00BCD4', '#FF9800', '#AEC6CF'];
const getAvatarColor = (name) => {
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];
};

const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date < today) return `Overdue`;
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// TypeScript Types
type ChoreStatus = 'To Do' | 'In Progress' | 'Completed';
type Frequency = 'Not Recurring' | 'Daily' | 'Weekly' | 'Monthly';

interface Chore {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate?: string;
  status: ChoreStatus;
  isRecurring: boolean;
  frequency: Frequency;
  points: number;
}

interface HouseholdMember {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
}

//  Sub-Components 
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div></div>
);

const MemberAvatar = ({ member }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: getAvatarColor(member.name) }} title={member.name}>
    {member.name.charAt(0).toUpperCase()}
  </div>
);

const CelebrationAnimation = ({ trigger }) => {
  if (!trigger) return null;
  return (
    <>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall { animation: fall linear; }
      `}</style>
      <div key={trigger} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full animate-fall" style={{
              left: `${Math.random() * 100}vw`, top: `${Math.random() * -20}vh`,
              width: `${Math.random() * 10 + 5}px`, height: `${Math.random() * 10 + 5}px`,
              backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
              animationDelay: `${Math.random() * 0.5}s`, animationDuration: `${Math.random() * 2 + 3}s`,
            }}/>
        ))}
      </div>
    </>
  );
};

const StatsAndLeaderboard = ({ members, chores }) => {
  const sortedMembers = useMemo(() => [...members].sort((a, b) => b.points - a.points), [members]);
  const totalCompleted = useMemo(() => chores.filter(c => c.status === 'Completed').length, [chores]);
  const topContributor = sortedMembers[0];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-6 justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Household Stats</h2>
          <div className="flex gap-4 text-center">
            <div className="bg-blue-100 p-4 rounded-lg flex-1">
              <div className="text-4xl font-extrabold text-blue-600">{totalCompleted}</div>
              <p className="text-sm font-medium text-blue-800">Chores Completed</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg flex-1">
              <div className="text-xl font-bold text-green-800 truncate">{topContributor?.name || 'N/A'}</div>
              <p className="text-sm font-medium text-green-800">Top Contributor 🏆</p>
            </div>
          </div>
        </div>
        <div className="flex-1 lg:max-w-md">
          <h3 className="font-semibold text-gray-700 mb-2 text-lg">Leaderboard</h3>
          <ul className="space-y-2">
            {sortedMembers.map((member, index) => (
              <li key={member.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md hover:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-500 w-5 text-center">{index + 1}.</span>
                  <MemberAvatar member={member} />
                  <span className="font-medium text-gray-800">{member.name}</span>
                </div>
                <span className="font-bold text-blue-600 bg-white rounded-full px-3 py-1 text-sm">{member.points} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};


const ChoreCard = ({ chore, members, onEdit, onDelete, onStatusChange }) => {
  const assignedMember = members.find(m => m.id === chore.assignedTo);
  const dueDateText = formatDate(chore.dueDate);
  const isOverdue = dueDateText === 'Overdue';
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border-l-4 transition-shadow hover:shadow-xl" style={{ borderColor: isOverdue ? '#EF4444' : '#3B82F6' }}>
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-800 break-words">{chore.title}</h4>
        <div className="flex space-x-1 flex-shrink-0">
          <button onClick={() => onEdit(chore)} className="text-gray-400 hover:text-blue-500 p-1 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
          <button onClick={() => onDelete(chore.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
        </div>
      </div>
      {chore.description && <p className="text-sm text-gray-500 mt-1 break-words">{chore.description}</p>}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          {assignedMember && <MemberAvatar member={assignedMember} />}
          <div className="text-sm">
            <div className={`font-medium ${isOverdue ? 'text-red-500' : 'text-gray-700'}`}>{dueDateText}</div>
            <div className="text-xs text-blue-600 font-bold">{chore.points} points</div>
          </div>
        </div>
        <div className="relative">
          <select value={chore.status} onChange={(e) => onStatusChange(chore.id, e.target.value as ChoreStatus)} className="text-xs appearance-none bg-gray-100 border border-gray-300 rounded-full px-3 py-1 pr-7 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
          </select>
          <svg className="w-4 h-4 absolute top-1/2 right-2 -translate-y-1/2 pointer-events-none text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
};

const ChoreColumn = ({ title, chores, members, onEdit, onDelete, onStatusChange }) => {
  const count = chores.length;
  const columnColor = { "To Do": "border-blue-500", "In Progress": "border-yellow-500", "Completed": "border-green-500" }[title];
  return (
    <div className="bg-blue-100/50 rounded-xl p-4 flex-1 min-w-[300px] shadow-inner">
      <h3 className={`font-bold text-lg mb-4 text-gray-800 border-b-2 pb-2 ${columnColor}`}>
        {title} <span className="text-sm font-semibold text-gray-500 bg-white rounded-full px-2.5 py-1">{count}</span>
      </h3>
      <div>
        {chores.length > 0 ? (
          chores.map(chore => <ChoreCard key={chore.id} chore={chore} members={members} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />)
        ) : (
          <div className="text-sm text-gray-500 text-center py-10 bg-white/50 rounded-lg">No chores here!</div>
        )}
      </div>
    </div>
  );
};

const ChoreModal = ({ isOpen, onClose, onSave, members, chore }) => {
  const [formData, setFormData] = useState<Partial<Chore>>({});
  useEffect(() => {
    if (isOpen) {
      setFormData(chore || { title: '', description: '', assignedTo: members[0]?.id || '', status: 'To Do', isRecurring: false, frequency: 'Not Recurring', points: 10 });
    }
  }, [isOpen, chore, members]);
  if (!isOpen) return null;
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleSubmit = (e) => { e.preventDefault(); if (!formData.title) return; onSave(formData as Chore); };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-transform scale-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{chore ? 'Edit Chore' : 'Add New Chore'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Points</label>
                <input type="number" name="points" value={formData.points || 10} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate ? formData.dueDate.split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
             <div>
                <label className="flex items-center space-x-3"><input type="checkbox" name="isRecurring" checked={formData.isRecurring || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /><span className="text-sm font-medium text-gray-700">This is a recurring chore</span></label>
              </div>
              {formData.isRecurring && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <select name="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
                 </div>
              )}
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">Save Chore</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm m-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2><p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 shadow-md">Confirm</button>
                </div>
            </div>
        </div>
    );
}

// --- Main Page Component ---
export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [filterByMember, setFilterByMember] = useState<string>('all');

  const [choreToDelete, setChoreToDelete] = useState<string|null>(null);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);

  useEffect(() => {
    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await api.fetchHouseholdData();
            setHouseholdMembers(data.members);
            setChores(data.chores);
        } catch (err) { setError("Failed to fetch household data."); } 
        finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const filteredChores = useMemo(() => filterByMember === 'all' ? chores : chores.filter(c => c.assignedTo === filterByMember), [chores, filterByMember]);
  const choresByStatus = useMemo(() => ({
    'To Do': filteredChores.filter(c => c.status === 'To Do'), 'In Progress': filteredChores.filter(c => c.status === 'In Progress'), 'Completed': filteredChores.filter(c => c.status === 'Completed'),
  }), [filteredChores]);

  const handleOpenModal = (chore: Chore | null) => { setEditingChore(chore); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingChore(null); };

  const handleSaveChore = useCallback(async (choreData: Chore) => {
    if (choreData.id) {
      await api.updateChore(choreData);
      setChores(prev => prev.map(c => c.id === choreData.id ? { ...c, ...choreData } : c));
    } else {
      const newChore = await api.addChore(choreData);
      setChores(prev => [...prev, newChore]);
    }
    handleCloseModal();
  }, []);

  const handleDeleteChore = useCallback((choreId: string) => { setChoreToDelete(choreId); }, []);
  const confirmDelete = useCallback(async () => {
    if (!choreToDelete) return;
    await api.deleteChore(choreToDelete);
    setChores(prev => prev.filter(c => c.id !== choreToDelete));
    setChoreToDelete(null);
  }, [choreToDelete]);
  
  const handleStatusChange = useCallback(async (choreId: string, newStatus: ChoreStatus) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;

    if (newStatus === 'Completed' && chore.status !== 'Completed') {
      setHouseholdMembers(prevMembers =>
        prevMembers.map(member =>
          member.id === chore.assignedTo
            ? { ...member, points: member.points + (chore.points || 10) }
            : member
        )
      );
      setCelebrationTrigger(c => c + 1);
    }
    
    await api.updateChore({ ...chore, status: newStatus });
    setChores(prev => prev.map(c => c.id === choreId ? { ...c, status: newStatus } : c));
  }, [chores]);

  return (
    <div className="bg-blue-50 min-h-screen font-sans">
      <CelebrationAnimation trigger={celebrationTrigger} />
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <div><h1 className="text-4xl font-bold text-gray-800">Household Chores</h1><p className="text-gray-600 mt-1">A central place to track and manage shared tasks.</p></div>
          <button onClick={() => handleOpenModal(null)} className="mt-4 md:mt-0 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105">+ Add New Chore</button>
        </header>

        {!isLoading && !error && <StatsAndLeaderboard members={householdMembers} chores={chores} />}

        <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <label className="font-semibold text-gray-700">Filter by Member:</label>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setFilterByMember('all')} className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${filterByMember === 'all' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>All</button>
            {householdMembers.map(member => (
              <button key={member.id} onClick={() => setFilterByMember(member.id)} className={`flex items-center space-x-2 pl-2 pr-4 py-1 rounded-full transition-colors ${filterByMember === member.id ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
                <MemberAvatar member={member} /><span className="font-medium">{member.name}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? <LoadingSpinner /> : error ? <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div> : (
          <div className="flex flex-col lg:flex-row gap-6">
            {(['To Do', 'In Progress', 'Completed'] as ChoreStatus[]).map(status => (
              <ChoreColumn key={status} title={status} chores={choresByStatus[status]} members={householdMembers} onEdit={handleOpenModal} onDelete={handleDeleteChore} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
      <ChoreModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveChore} members={householdMembers} chore={editingChore} />
      <ConfirmationModal isOpen={!!choreToDelete} onClose={() => setChoreToDelete(null)} onConfirm={confirmDelete} title="Delete Chore?" message="Are you sure you want to delete this chore? This action cannot be undone." />
    </div>
  );
}

