import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Organization } from '../types';
import { Building2, MoreVertical, ExternalLink } from 'lucide-react';
import { formatDate } from '../../../utils/date';

interface OrganizationListProps {
  organizations: Organization[];
  onViewDetails: (org: Organization) => void;
}

export const OrganizationList: React.FC<OrganizationListProps> = ({
  organizations,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = (org: Organization) => {
    navigate(`/dashboard/organizations/${org.id}`);
    onViewDetails(org);
  };

  return (
    <div className="glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
              <th className="pb-4 pl-4">Organization</th>
              <th className="pb-4">Type</th>
              <th className="pb-4">Users</th>
              <th className="pb-4">Labs</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Subscription</th>
              <th className="pb-4">Last Active</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr 
                key={org.id} 
                className="border-b border-primary-500/10 hover:bg-dark-300/50 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(org)}
              >
                <td className="py-4 pl-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-primary-400" />
                    <div>
                      <p className="text-gray-200 font-medium">{org.organization_name}</p>
                      <p className="text-sm text-gray-400">{org.contactEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="capitalize text-gray-300">{org.org_type}</span>
                </td>
                <td className="py-4 text-gray-300">{org.usersCount}</td>
                <td className="py-4 text-gray-300">{org.labsCount}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    org.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                    org.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {org.status}
                  </span>
                </td>
                <td className="py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                    {org.subscriptionTier}
                  </span>
                </td>
                <td className="py-4 text-gray-400">
                  {org.lastActive}
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(org);
                      }}
                      className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-primary-400" />
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};