import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseConfig";

const StartPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error('Error checking auth state:', error);
        setIsAuthenticated(false);
      }
    };

    checkUser();
  }, []);

  
  if (isAuthenticated === null) {
    return null;
  }

  
  return isAuthenticated ? (
    <Redirect href="/Home" />
  ) : (
    <Redirect href="/(screens)/LoginPage" />
  );
};

export default StartPage;
