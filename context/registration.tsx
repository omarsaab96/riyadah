// context/RegistrationContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

// 1. Define the shape of your form data
interface RegistrationData {
  name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  password: string | null;
  dob: {
    day: string | null;
    month: string | null;
    year: string | null;
  };
  parentEmail: string | null;
  type: string | null;
  sport: string | null;
  club: string | null;
  gender: string | null;
  bio: string | null;
  height: string | null;
  weight: string | null;
  agreed: boolean | null;
  highlights: any;
  stats: any;
  achievements: any;
  events: any;
  skills: any;
}

// 2. Define the context type
interface RegistrationContextType {
  formData: RegistrationData;
  updateFormData: (newData: Partial<RegistrationData>) => void;
}

// 3. Create context with default (nullable) values
const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

// 4. Define props for the provider
interface Props {
  children: ReactNode;
}

export const RegistrationProvider = ({ children }: Props) => {
  const [formData, setFormData] = useState<RegistrationData>({
    name: null,
    email: null,
    phone: null,
    country: null,
    password: null,
    dob: {
      day: null,
      month: null,
      year: null
    },
    parentEmail: null,
    type: null,
    sport: null,
    club: null,
    gender: null,
    bio: null,
    height: null,
    weight: null,
    agreed: false,
    highlights: null,
    stats: null,
    achievements: null,
    events: null,
    skills: {
      attack: null,
      skill: null,
      stamina: null,
      speed: null,
      defense: null
    }
  });

  const updateFormData = (newData: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <RegistrationContext.Provider value={{ formData, updateFormData }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error('useRegistration must be used within a RegistrationProvider');
  return context;
};
