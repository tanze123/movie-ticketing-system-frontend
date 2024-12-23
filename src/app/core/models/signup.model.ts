export interface SignupModel {
    name: string;
    phoneNumber: string;
    email: String;
    password: string;
    confirmPassword?: string;
    isActive?: String;
}
