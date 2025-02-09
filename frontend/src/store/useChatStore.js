import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // getUsers: async () => {
  //   set({ isUsersLoading: true });
  //   try {
  //     const res = await axiosInstance.get("/messages/users");
  //     set({ users: res.data });
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //   } finally {
  //     set({ isUsersLoading: false });
  //   }
  // },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      // making the admin apper first
      // Define the admin user (by ID or role)
      const ADMIN_ID = "67a0a98e028dc3636f1d7614"; //  admin user ID

      // Separate admin from other users
      const adminUser = res.data.find((user) => user._id === ADMIN_ID);
      const otherUsers = res.data.filter((user) => user._id !== ADMIN_ID);

      // Ensure admin appears first
      const sortedUsers = adminUser ? [adminUser, ...otherUsers] : otherUsers;

      set({ users: sortedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      if (res.data) {
        set({ messages: [...messages, res.data] });
      } else {
        throw new Error("No data in the response.");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error.response?.data?.message || "Failed to send message.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
