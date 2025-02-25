import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  CreditCard, 
  Activity,
  Shield,
  FileText,
  Pencil,
  Trash2,
  UserPlus,
  AlertTriangle,
  FolderOpen,
  Clock
} from 'lucide-react';
import axios from 'axios';

interface OrganizationDetails {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  logo?: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  subscription: {
    plan: string;
    billingCycle: string;
    nextBilling: string;
    usage: {
      storage: number;
      workspaces: number;
    };
  };
  stats: {
    users: number;
    admins: number;
    activeWorkspaces: number;
    monthlyUsage: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

interface BillingRecord {
  id: string;
  transactionId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  description: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface Document {
  id: string;
  name: string;
  format: string;
  uploadedAt: string;
  size: number;
  uploadedBy: string;
}

export const OrganizationOverview: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'billing' | 'workspaces' | 'activity' | 'documents'>('overview');
  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setIsLoading(true);
        // Fetch organization details
        const orgResponse = await axios.get(`/api/organizations/${orgId}`);
        setOrganization(orgResponse.data);

        // Fetch users
        const usersResponse = await axios.get(`/api/organizations/${orgId}/users`);
        setUsers(usersResponse.data);

        // Fetch billing records
        const billingResponse = await axios.get(`/api/organizations/${orgId}/billing`);
        setBillingRecords(billingResponse.data);

        // Fetch workspaces
        const workspacesResponse = await axios.get(`/api/organizations/${orgId}/workspaces`);
        setWorkspaces(workspacesResponse.data);

        // Fetch activities
        const activitiesResponse = await axios.get(`/api/organizations/${orgId}/activities`);
        setActivities(activitiesResponse.data);

        // Fetch documents
        const documentsResponse = await axios.get(`/api/organizations/${orgId}/documents`);
        setDocuments(documentsResponse.data);
      } catch (error) {
        console.error('Failed to fetch organization data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, [orgId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-300">Organization not found</h2>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Total Users</span>
            <Users className="h-5 w-5 text-primary-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-200">{organization.stats.users}</p>
          <p className="text-sm text-gray-400 mt-1">{organization.stats.admins} admins</p>
        </div>

        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Active Workspaces</span>
            <Activity className="h-5 w-5 text-secondary-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-200">{organization.stats.activeWorkspaces}</p>
        </div>

        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Monthly Usage</span>
            <CreditCard className="h-5 w-5 text-accent-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-200">
            ${organization.stats.monthlyUsage.toLocaleString()}
          </p>
        </div>

        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Subscription</span>
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-200">{organization.subscription.plan}</p>
          <p className="text-sm text-gray-400 mt-1">Next billing: {new Date(organization.subscription.nextBilling).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="glass-panel">
        <h2 className="text-lg font-semibold mb-6">
          <GradientText>Contact Information</GradientText>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <Mail className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-gray-200">{organization.contact.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-secondary-500/10">
              <Phone className="h-5 w-5 text-secondary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-gray-200">{organization.contact.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:col-span-2">
            <div className="p-2 rounded-lg bg-accent-500/10">
              <MapPin className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="text-gray-200">{organization.contact.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
              <th className="pb-4">User</th>
              <th className="pb-4">Role</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Last Active</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-primary-500/10">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <span className="text-primary-400">{user.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-gray-200">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                    {user.role}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 text-gray-400">{user.lastActive}</td>
                <td className="py-4">
                  <button className="p-2 hover:bg-primary-500/10 rounded-lg">
                    <Pencil className="h-4 w-4 text-primary-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
              <th className="pb-4">Transaction ID</th>
              <th className="pb-4">Description</th>
              <th className="pb-4">Amount</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {billingRecords.map(record => (
              <tr key={record.id} className="border-b border-primary-500/10">
                <td className="py-4 text-gray-300">{record.transactionId}</td>
                <td className="py-4 text-gray-300">{record.description}</td>
                <td className="py-4 text-gray-300">${record.amount.toFixed(2)}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    record.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' :
                    record.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="py-4 text-gray-400">{new Date(record.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWorkspacesTab = () => (
    <div className="glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
              <th className="pb-4">Name</th>
              <th className="pb-4">Description</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Created</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map(workspace => (
              <tr key={workspace.id} className="border-b border-primary-500/10">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="h-5 w-5 text-primary-400" />
                    <span className="text-gray-200">{workspace.name}</span>
                  </div>
                </td>
                <td className="py-4 text-gray-400">{workspace.description}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    workspace.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {workspace.status}
                  </span>
                </td>
                <td className="py-4 text-gray-400">{new Date(workspace.createdAt).toLocaleDateString()}</td>
                <td className="py-4">
                  <button className="p-2 hover:bg-primary-500/10 rounded-lg">
                    <Pencil className="h-4 w-4 text-primary-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="glass-panel">
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start space-x-3 p-4 bg-dark-300/50 rounded-lg">
            <Activity className="h-5 w-5 text-primary-400 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-gray-200">
                  <span className="font-medium">{activity.userName}</span>
                  {' '}{activity.action}
                </p>
                <span className="text-sm text-gray-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              {activity.details && (
                <p className="text-sm text-gray-400 mt-1">{activity.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
              <th className="pb-4">Name</th>
              <th className="pb-4">Format</th>
              <th className="pb-4">Size</th>
              <th className="pb-4">Uploaded By</th>
              <th className="pb-4">Upload Date</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} className="border-b border-primary-500/10">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary-400" />
                    <span className="text-gray-200">{doc.name}</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                    {doc.format}
                  </span>
                </td>
                <td className="py-4 text-gray-400">{(doc.size / 1024 / 1024).toFixed(2)} MB</td>
                <td className="py-4 text-gray-400">{doc.uploadedBy}</td>
                <td className="py-4 text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                <td className="py-4">
                  <button className="p-2 hover:bg-primary-500/10 rounded-lg">
                    <FileText className="h-4 w-4 text-primary-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            {organization.logo ? (
              <img 
                src={organization.logo} 
                alt={organization.name} 
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-display font-bold">
                <GradientText>{organization.name}</GradientText>
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm text-gray-400">ID: {organization.id}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  organization.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                  organization.status === 'suspended' ? 'bg-red-500/20 text-red-300' :
                  organization.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {/* {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)} */}
                  pending
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button className="btn-secondary text-red-400 hover:text-red-300">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-primary-500/10">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'users', label: 'Users & Admins', icon: Users },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'workspaces', label: 'Workspaces', icon: Activity },
            { id: 'activity', label: 'Activity', icon: Clock },
            { id: 'documents', label: 'Documents', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-primary-500/50'
                }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'billing' && renderBillingTab()}
      {activeTab === 'workspaces' && renderWorkspacesTab()}
      {activeTab === 'activity' && renderActivityTab()}
      {activeTab === 'documents' && renderDocumentsTab()}
    </div>
  );
};