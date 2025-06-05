
import React, { useState } from 'react';
import { Submission, Clan, WorldRecord, SubmissionStatus, StatUpdateProofData, ClanApplicationData, RecordVerificationData, BadgeProofData, LeaderboardCategory } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TextArea } from '../ui/Input'; // Assuming TextArea is part of Input.tsx

interface SubmissionDetailsProps {
  submission: Submission<any>;
}

const SubmissionDetailsDisplay: React.FC<SubmissionDetailsProps> = ({ submission }) => {
    const { players } = useAppContext();
    const submitter = players.find(p => p.id === submission.submittedBy);

    if (submission.type === "ClanApplication") {
        const data = submission.data as ClanApplicationData;
        return (
            <div>
                <p><strong>Type:</strong> Clan Application</p>
                <p><strong>Submitted By:</strong> {submitter?.username || submission.submittedBy}</p>
                <p><strong>Clan Name:</strong> {data.name}</p>
                <p><strong>Tag:</strong> {data.tag}</p>
                <p><strong>Description:</strong> {data.description}</p>
                <p><strong>Requirements:</strong> {data.requirementsToJoin}</p>
                <p><strong>Discord:</strong> {data.discordLink || 'N/A'}</p>
                <p><strong>Proposed Leader:</strong> {players.find(p => p.id === data.leaderId)?.username || data.leaderId}</p>
            </div>
        );
    }
    if (submission.type === "RecordVerification") {
        const data = submission.data as RecordVerificationData;
        return (
            <div>
                <p><strong>Type:</strong> Record Verification</p>
                <p><strong>Player:</strong> {submitter?.username || data.playerId}</p>
                <p><strong>Record Type:</strong> {data.type}</p>
                {/* data.mapName is part of data.type for speed records in RecordVerificationData */}
                <p><strong>Value:</strong> {data.value}</p>
                <p><strong>Proof:</strong> <a href={data.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{data.proofUrl}</a></p>
            </div>
        );
    }
    if (submission.type === "BadgeProof") { // Kept for completeness
        const data = submission.data as BadgeProofData;
         return (
            <div>
                <p><strong>Type:</strong> Badge Proof</p>
                <p><strong>User:</strong> {submitter?.username || data.userId}</p>
                <p><strong>Badge ID:</strong> {data.badgeId}</p>
                <p><strong>Proof:</strong> {data.proof}</p>
            </div>
        );
    }
    if (submission.type === "StatUpdateProof") {
        const data = submission.data as StatUpdateProofData;
        return (
            <div>
                <p><strong>Type:</strong> Stat Update Proof</p>
                <p><strong>Player:</strong> {submitter?.username || data.playerId}</p>
                <p><strong>Category:</strong> {data.category}</p>
                <p><strong>Sub-Category:</strong> {data.subCategory}{data.mapName ? ` (${data.mapName})` : ''}</p>
                <p><strong>New Value:</strong> {data.newValue}{data.category === LeaderboardCategory.SPEED ? 's' : ''}</p>
                <p><strong>Video Proof:</strong> <a href={data.videoProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{data.videoProofUrl}</a></p>
                {data.imageProofName && <p><strong>Image Proof:</strong> {data.imageProofName}</p>}
                {data.notes && <p><strong>Notes:</strong> {data.notes}</p>}
            </div>
        );
    }
    return <p>Unknown submission type or data missing.</p>;
};


export const SubmissionsQueueSection: React.FC = () => {
  const { submissions, processSubmission, players } = useAppContext();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission<any> | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingSubmissions = submissions.filter(s => s.status === SubmissionStatus.PENDING);

  const handleProcessSubmission = (status: SubmissionStatus.APPROVED | SubmissionStatus.REJECTED) => {
    if (selectedSubmission) {
      processSubmission(selectedSubmission.id, status, status === SubmissionStatus.REJECTED ? rejectionReason : undefined);
      setSelectedSubmission(null);
      setRejectionReason('');
    }
  };

  const getSubmitterUsername = (submitterId: string) => {
    return players.find(p => p.id === submitterId)?.username || submitterId;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-100">Submissions Queue ({pendingSubmissions.length} Pending)</h2>
      
      {pendingSubmissions.length > 0 ? (
        <div className="overflow-x-auto bg-dark-surface rounded-lg shadow">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {pendingSubmissions.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{sub.type.replace(/([A-Z])/g, ' $1').trim()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getSubmitterUsername(sub.submittedBy)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sub.submissionDate.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button size="sm" onClick={() => setSelectedSubmission(sub)}>Review</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-6">No pending submissions.</p>
      )}

      {selectedSubmission && (
        <Modal isOpen={!!selectedSubmission} onClose={() => {setSelectedSubmission(null); setRejectionReason('');}} title={`Review Submission`}>
          <div className="space-y-4">
            <SubmissionDetailsDisplay submission={selectedSubmission} />
            <hr className="border-dark-border"/>
            <TextArea
                label="Rejection Reason (if rejecting)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                className={selectedSubmission.status === SubmissionStatus.APPROVED ? "hidden" : ""}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <Button variant="ghost" onClick={() => {setSelectedSubmission(null); setRejectionReason('');}}>Cancel</Button>
              <Button variant="danger" onClick={() => handleProcessSubmission(SubmissionStatus.REJECTED)} disabled={!rejectionReason && selectedSubmission.status === SubmissionStatus.PENDING /* Ensure reason if rejecting */}>Reject</Button>
              <Button variant="primary" onClick={() => handleProcessSubmission(SubmissionStatus.APPROVED)}>Approve</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
