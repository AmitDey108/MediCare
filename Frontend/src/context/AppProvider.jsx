import React, { useEffect, useMemo, useState } from "react";
import App from "../App";
import { Context } from "./appContext";
import { api } from "../utils/api";

const AppProvider = () => {
  const [patient, setPatient] = useState({
    isAuthenticated: false,
    user: null,
  });
  const [admin, setAdmin] = useState({
    isAuthenticated: false,
    user: null,
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [patientResult, adminResult] = await Promise.allSettled([
          api.get("/user/patient/me"),
          api.get("/user/admin/me"),
        ]);

        if (patientResult.status === "fulfilled") {
          setPatient({
            isAuthenticated: true,
            user: patientResult.value.data.user,
          });
        }

        if (adminResult.status === "fulfilled") {
          setAdmin({
            isAuthenticated: true,
            user: adminResult.value.data.user,
          });
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      patient,
      setPatient,
      admin,
      setAdmin,
      isBootstrapping,
      clearPatient() {
        setPatient({
          isAuthenticated: false,
          user: null,
        });
      },
      clearAdmin() {
        setAdmin({
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    [admin, isBootstrapping, patient]
  );

  return (
    <Context.Provider value={value}>
      <App />
    </Context.Provider>
  );
};

export default AppProvider;
