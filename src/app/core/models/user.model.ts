export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    roles: string;
    enabled?: boolean;
    // Add any other user properties your backend returns
  }
