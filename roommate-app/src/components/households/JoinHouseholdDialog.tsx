import { useState } from "react";
import useHousehold from "@/hooks/useHousehold";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function JoinHouseholdDialog({ open, onClose }: Props) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { joinHousehold, fetchAllHouseholds } = useHousehold();

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      await joinHousehold(inviteCode.trim());
      await fetchAllHouseholds();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to join household");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2">Join Household</h2>
        <input
          className="border rounded px-3 py-2 w-full mb-2"
          placeholder="Enter invite code"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded bg-gray-200"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleJoin}
            disabled={loading || !inviteCode.trim()}
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}