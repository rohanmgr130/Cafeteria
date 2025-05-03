
export const loginUser = (userData) => {
    localStorage.setItem('cafeUser', JSON.stringify({
      token: userData.token,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        fullName: userData.user.fullName,
        contact: userData.user.contact || ''
      }
    }));
  };
  
  export const logoutUser = () => {
    localStorage.removeItem('cafeUser');
  };
  
  export const isAuthenticated = () => {
    const userData = localStorage.getItem('cafeUser');
    if (!userData) return false;
    
    try {
      const { token } = JSON.parse(userData);
      return !!token;
    } catch (error) {
      return false;
    }
  };
  
  export const getUserData = () => {
    const userData = localStorage.getItem('cafeUser');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      return null;
    }
  };
