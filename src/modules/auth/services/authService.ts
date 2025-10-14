import axios from 'axios';

const API_URL = 'https://25a3d8a97570.ngrok-free.app'; // Replace with your API URL

// export const sendLoginRequest = async (email:string,password:string) => {
//     try {
//         const response = await axios.post(`${API_URL}/auth/login`, { email, password });
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };