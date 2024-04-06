import { useContext, useEffect } from 'react'; 
import { Navigate, useNavigate } from 'react-router-dom'; 
import UserContext from '../userContext';

export default function Logout() {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        async function logout() {
            try {
                await logoutUser();
                setUser({
                    isAdmin: null,
                    id: null
                });
                localStorage.clear();
                navigate("/login");
            } catch (error) {
                console.error('Error:', error);
                // Handle errors gracefully
            }
        }

        logout();
    }, [setUser]);

    async function logoutUser() {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log(data);

        // Handle the response as needed
    }

    return (
       <>
       </>
    );
}
