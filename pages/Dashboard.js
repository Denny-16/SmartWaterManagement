// src/pages/Dashboard.js
import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { ref, onValue, set } from "firebase/database";

const Dashboard = () => {
  const [waterLevel, setWaterLevel] = useState(0);
  const [motorStatus, setMotorStatus] = useState("OFF");
  const [timer, setTimer] = useState("");
  const [alerts, setAlerts] = useState([]);
  const hasTriggered = useRef(false); // To prevent multiple triggers within a minute

  // Read water level
  useEffect(() => {
    const waterRef = ref(db, "tank/waterLevel");
    onValue(waterRef, (snapshot) => {
      const level = snapshot.val();
      if (level !== null) setWaterLevel(level);
    });
  }, []);

  // Read motor status
  useEffect(() => {
    const motorRef = ref(db, "tank/motor");
    onValue(motorRef, (snapshot) => {
      const status = snapshot.val();
      if (status !== null) setMotorStatus(status);
    });
  }, []);

  // Read alerts
  useEffect(() => {
    const alertsRef = ref(db, "tank/alerts");
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data)
          .sort((a, b) => b[0] - a[0])
          .slice(0, 4)
          .map(([, value]) => value);
        setAlerts(entries);
      }
    });
  }, []);

  // Read timer
  useEffect(() => {
    const timerRef = ref(db, "tank/timer");
    onValue(timerRef, (snapshot) => {
      const time = snapshot.val();
      if (time) setTimer(time);
    });
  }, []);

  // Auto toggle motor at timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!timer) return;

      const now = new Date();
      const currentTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (currentTime === timer && !hasTriggered.current) {
        hasTriggered.current = true;

        const newStatus = motorStatus === "OFF" ? "ON" : "OFF";
        const timestamp = now.toLocaleString();

        set(ref(db, "tank/motor"), newStatus);
        set(
          ref(db, `tank/alerts/${Date.now()}`),
          `${timestamp}: Motor auto-toggled to ${newStatus} by timer`
        );

        // Clear timer
        set(ref(db, "tank/timer"), "");
      }

      // Reset trigger every new minute
      if (currentTime !== timer) {
        hasTriggered.current = false;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, motorStatus]);

  const handleToggleMotor = () => {
    const newStatus = motorStatus === "OFF" ? "ON" : "OFF";
    const timestamp = new Date().toLocaleString();

    set(ref(db, "tank/motor"), newStatus);
    set(
      ref(db, `tank/alerts/${Date.now()}`),
      `${timestamp}: Motor turned ${newStatus}`
    );
  };

  const handleTimerSet = () => {
    if (timer) {
      const formatted = new Date(`1970-01-01T${timer}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      set(ref(db, "tank/timer"), formatted);
      setTimer(""); // Reset local input box
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">Smart Water Tank Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Water Level */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-lg font-semibold mb-2">Water Level</p>
          <p className="text-2xl font-bold">{waterLevel}%</p>
          <div className="w-full h-4 bg-gray-300 rounded mt-3">
            <div
              className="h-4 bg-blue-600 rounded"
              style={{ width: `${waterLevel}%` }}
            ></div>
          </div>
        </div>

        {/* Motor Control */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-lg font-semibold mb-2">Motor Status</p>
          <p className="text-2xl font-bold text-indigo-700">{motorStatus}</p>
          <button
            onClick={handleToggleMotor}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {motorStatus === "OFF" ? "Turn ON" : "Turn OFF"}
          </button>
        </div>

        {/* Timer */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-lg font-semibold mb-2">Set Timer</p>
          <input
            type="time"
            className="border p-2 mr-2 rounded"
            value={timer}
            onChange={(e) => setTimer(e.target.value)}
          />
          <button
            onClick={handleTimerSet}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Set Timer
          </button>
        </div>

        {/* Alerts */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-lg font-semibold mb-2">Recent Alerts</p>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
