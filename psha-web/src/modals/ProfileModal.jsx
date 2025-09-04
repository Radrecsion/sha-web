import { useState } from "react";

export default function ProfileModal({ user, onClose, onUpdate }) {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);

  const handleSave = () => {
    const updatedUser = { ...user, username, avatar };
    localStorage.setItem("username", username);
    localStorage.setItem("avatar", avatar);
    onUpdate(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[var(--card)] p-6 rounded-lg shadow-md w-80">
        <h2 className="text-lg font-bold mb-4">Profile</h2>

        <div className="flex flex-col items-center mb-4">
          <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full mb-2"/>
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Avatar URL"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
