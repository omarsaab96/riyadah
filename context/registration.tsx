// context/RegistrationContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

// 1. Define the shape of your form data
interface RegistrationData {
  achievements: any;
  admin: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
  agreed: boolean | null;
  bio: string | null;
  children: [] | null;
  club: string | null;
  contactInfo: {
    phone: string | null;
    email: string | null;
    facebook: string | null;
    instagram: string | null;
    whatsapp: string | null;
    telegram: string | null;
    tiktok: string | null;
    snapchat: string | null;
    location: {
      latitude: string | null;
      longitude: string | null;
    };
    description: string | null;
  };
  country: string | null;
  dob: {
    day: string | null;
    month: string | null;
    year: string | null;
  };
  email: string | null;
  events: any;
  gender: string | null;
  height: Number | null;
  highlights: any;
  image: string | null;
  isStaff: [String] | [];
  memberOf:[String] | [];
  name: string | null;
  organization: {
    name: string | null;
    role: string | null;
    location: string | null;
    since: string | null;
    independent: boolean;
  };
  parentEmail: string | null;
  password: string | null;
  personalAccount: Boolean;
  phone: string | null;
  role: string | null;
  skills: any;
  sport: string | null;
  stats: any;
  type: string | null;
  verified: Date | null;
  weight: Number | null;
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
    achievements: null,
    admin: {
      id: null,
      name: null,
      email: null
    },
    agreed: false,
    bio: null,
    children: null,
    club: null,
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
    country: null,
    dob: {
      day: null,
      month: null,
      year: null
    },
    email: null,
    events: null,
    gender: null,
    height: null,
    highlights: null,
    image: null,
    isStaff: [],
    memberOf: [],
    name: null,
    organization: {
      name: null,
      role: null,
      location: null,
      since: null,
      independent: false
    },
    parentEmail: null,
    password: null,
    personalAccount: true,
    phone: null,
    role: null,
    skills: {
      attack: 0,
      skill: 0,
      stamina: 0,
      speed: 0,
      defense: 0
    },
    sport: null,
    stats: null,
    type: null,
    verified: null,
    weight: null
  });


  const updateFormData = (newData: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const resetFormData = () => {
    setFormData({
      achievements: null,
      admin: {
        id: null,
        name: null,
        email: null
      },
      agreed: false,
      bio: null,
      children: null,
      club: null,
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
      country: null,
      dob: {
        day: null,
        month: null,
        year: null
      },
      email: null,
      events: null,
      gender: null,
      height: null,
      highlights: null,
      image: null,
      isStaff: [],
      memberOf: [],
      name: null,
      organization: {
        name: null,
        role: null,
        location: null,
        since: null,
        independent: false
      },
      parentEmail: null,
      password: null,
      personalAccount: true,
      phone: null,
      role: null,
      skills: {
        attack: 0,
        skill: 0,
        stamina: 0,
        speed: 0,
        defense: 0
      },
      sport: null,
      stats: null,
      type: null,
      verified: null,
      weight: null
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
