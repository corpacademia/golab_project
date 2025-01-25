// Move the AssessmentCard component here with renamed interface
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Tag, 
  BookOpen, 
  Play, 
  Plus,
  Check,
  AlertCircle,
  X,
  Cpu,
  Hash,
  FileCode,
  HardDrive,
  Server,
  UserPlus
} from 'lucide-react';
import { GradientText } from '../../../../../components/ui/GradientText';
import axios from 'axios';
import { jsPDF } from "jspdf";

interface CloudVMAssessmentProps {
  assessment: {
    assessment_id: string;
    title: string;
    description: string;
    provider: string;
    instance: string;
    instance_id?: string;
    status: 'active' | 'inactive' | 'pending';
    cpu: number;
    ram: number;
    storage: number;
    os: string;
    software: string[];
  };
}

interface LabDetails {
  cpu: string;
  ram: string;
  storage: string;
  instance: string;
  description: string;
}

export const CloudVMAssessmentCard: React.FC<CloudVMAssessmentProps> = ({ assessment }) => {
  // Rest of the component code remains the same, just update component name
  // ... (keep all the existing code)
};