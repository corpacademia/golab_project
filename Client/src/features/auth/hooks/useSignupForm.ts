import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../api/authApi';
import axios from 'axios';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
   organization:any;
   isNewOrganization:boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
  organization?:any;
  isNewOrganization?:boolean;
}

export const useSignupForm = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization:'',
    isNewOrganization:false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {

      // const response = await authApi.login(formData.email, formData.password);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user_ms/signup`,{
         name:formData.name,
         email:formData.email,
         password:formData.password,
         organization:formData.organization,
         isNewOrganization:formData.isNewOrganization
      })
      if(res.data.success){
        if(formData.isNewOrganization){
          const updateOrgAdmin = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/organization_ms/updateOrgAdmin`,{
          orgAdmin:res.data.result.id,
          Id:formData.organization.id
        })

        if(updateOrgAdmin.data.success){
           navigate('/login');
           return
        }
        }
        
      }
      // login(response.user);
      navigate('/login');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error?.response?.data?.error || 'Failed to create account. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
};