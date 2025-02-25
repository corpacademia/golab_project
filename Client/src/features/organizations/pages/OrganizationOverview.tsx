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
  Clock,
  Loader
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

const defaultOrganization: OrganizationDetails = {
  id: '',
  name: '',
  description: '',
  createdAt: new Date().toISOString(),
  status: 'pending',
  contact: {
    name: '',
    email: '',
    phone: '',
    address: ''
  },
  subscription: {
    plan: 'Basic',
    billingCycle: 'Monthly',
    nextBilling: new Date().toISOString(),
    usage: {
      storage: 0,
      workspaces: 0
    }
  },
  stats: {
    users: 0,
    admins: 0,
    activeWorkspaces: 0,
    monthlyUsage: 0
  }
};

export const OrganizationOverview: React.FC = () => {
  const { orgId } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'billing' | 'workspaces' | 'activity' | 'documents'>('overview');
  const [organization, setOrganization] = useState<OrganizationDetails>(defaultOrganization);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3000/api/v1/organization/${orgId}`);
        if (response.data) {
          setOrganization({
            ...defaultOrganization,
            ...response.data
          });
        }
      } catch (err) {
        console.error('Failed to fetch organization data:', err);
        setError('Failed to load organization data');
      } finally {
        setIsLoading(false);
      }
    };

    if (orgId) {
      fetchOrganizationData();
    }
  }, [orgId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-200 mb-2">
          {error}
        </h2>
        <p className="text-gray-400">
          Please try again later or contact support if the problem persists.
        </p>
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
          <p className="text-2xl font-semibold text-gray-200">
            {organization?.stats?.users || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {organization?.stats?.admins || 0} admins
          </p>
        </div>

        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Active Workspaces</span>
            <Activity className="h-5 w-5 text-secondary-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-200">
            {organization?.stats?.activeWorkspaces || 0}
          </p>
        </div>

        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Monthly Usage</span>
            <CreditCard className="h-5 w-5 text-accent-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-200">
            ${(organization?.stats?.monthlyUsage || 0).toLocaleString()}
          </p>
        </div>

        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Subscription</span>
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-200">
            {organization?.subscription?.plan || 'Basic'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Next billing: {new Date(organization?.subscription?.nextBilling || '').toLocaleDateString()}
          </p>
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
              <p className="text-gray-200">{organization?.contact?.email || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-secondary-500/10">
              <Phone className="h-5 w-5 text-secondary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-gray-200">{organization?.contact?.phone || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:col-span-2">
            <div className="p-2 rounded-lg bg-accent-500/10">
              <MapPin className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="text-gray-200">{organization?.contact?.address || 'N/A'}</p>
            </div>
          </div>
        </div>
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
                <GradientText>{organization.name || 'Unnamed Organization'}</GradientText>
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm text-gray-400">ID: {organization.id}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  organization.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                  organization.status === 'suspended' ? 'bg-red-500/20 text-red-300' :
                  organization.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
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
      {/* Add other tab content here */}
    </div>
  );
};