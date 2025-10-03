import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    authUser: { name: "Karan", _id: 123, age: 20 },
    isLoggedIn: false,
    isLoading: false,

    login: () => {
        console.log("Login successful");
        set({ isLoggedIn: true, isLoading: true });
    }

}))

