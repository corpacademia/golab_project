import React from 'react';
import { useParams } from 'react-router-dom';
import { UserProfileHeader } from '../components/profile/UserProfileHeader';
import { UserLabsSection } from '../components/profile/UserLabsSection';
import { UserAssessmentsSection } from '../components/profile/UserAssessmentsSection';
import { UserProgressSection } from '../components/profile/UserProgressSection';
import { UserPurchaseHistory } from '../components/profile/UserPurchaseHistory';
import { TrainerStats } from '../components/profile/TrainerStats';
import { OrgAdminStats } from '../components/profile/OrgAdminStats';
import { UserRoleUpgrade } from '../components/profile/UserRoleUpgrade';
import { OrganizationAssignment } from '../components/profile/OrganizationAssignment';
import { useUserProfile } from '../hooks/useUserProfile';

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { user, isLoading, error } = useUserProfile(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user profile</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="space-y-6">
      <UserProfileHeader user={user.user} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrganizationAssignment 
          userId={userId!}
          currentOrganization={user.user.organization}
        />
        <UserRoleUpgrade 
          userId={userId!}
          currentRole={user.user.role}
        />
      </div>

      {user.user.role === 'trainer' ? (
        <TrainerStats userId={userId!} />
      ) : user.user.role === 'orgadmin' ? (
        <OrgAdminStats userId={userId!} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserLabsSection userId={userId!} />
            <UserAssessmentsSection userId={userId!} />
          </div>
          <UserProgressSection userId={userId!} />
          <UserPurchaseHistory userId={userId!} />
        </>
      )}
    </div>
  );
};