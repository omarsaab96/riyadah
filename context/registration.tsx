// context/RegistrationContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

// 1. Define the shape of your form data
interface RegistrationData {
  name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  password: string | null;
  admin: {
    id: string | null;
    name: string | null;
    email: String | null;
  };
  children: [] | null;
  teams: [] | null;
  contactInfo: {
    phone: String | null;
    email: String | null;
    facebook: String | null;
    instagram: String | null;
    whatsapp: String | null;
    telegram: String | null;
    tiktok: String | null;
    snapchat: String | null;
    location: {
      latitude: String | null;
      longitude: String | null;
    };
    description: String | null;
  };
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
  image: string | null;
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
  resetFormData: () => void;
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
    admin: {
      id: null,
      name: null,
      email: null
    },
    contactInfo: {
      phone: null,
      email: null,
      facebook: null,
      instagram: null,
      whatsapp: null,
      telegram: null,
      tiktok: null,
      snapchat: null,
      location: {
        latitude: null,
        longitude: null
      },
      description: null
    },
    dob: {
      day: null,
      month: null,
      year: null
    },
    children: null,
    teams: null,
    parentEmail: null,
    type: null,
    sport: null,
    club: null,
    gender: null,
    bio: null,
    height: null,
    image: null,
    weight: null,
    agreed: false,
    highlights: null,
    stats: null,
    achievements: null,
    events: null,
    skills: {
      attack: 0,
      skill: 0,
      stamina: 0,
      speed: 0,
      defense: 0
    }
  });

  const updateFormData = (newData: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const resetFormData = () => {
    setFormData({
      name: null,
      email: null,
      phone: null,
      country: null,
      password: null,
      admin: {
        id: null,
        name: null,
        email: null
      },
      dob: {
        day: null,
        month: null,
        year: null
      },
      children: null,
      parentEmail: null,
      type: null,
      sport: null,
      club: null,
      gender: null,
      bio: null,
      height: null,
      image: null,
      weight: null,
      agreed: false,
      highlights: null,
      stats: null,
      achievements: null,
      events: null,
      skills: {
        attack: 0,
        skill: 0,
        stamina: 0,
        speed: 0,
        defense: 0
      }
    });
  };

  return (
    <RegistrationContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error('useRegistration must be used within a RegistrationProvider');
  return context;
};
