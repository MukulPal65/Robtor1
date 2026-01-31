import React, { createContext, useContext, useState, useEffect } from 'react';
import { bluetoothService, BluetoothDeviceData } from '../services/bluetoothService';
import { HealthService } from '../services/healthService';

interface BluetoothContextType {
    btData: BluetoothDeviceData | null;
    isScanning: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [btData, setBtData] = useState<BluetoothDeviceData | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    // Background Sync to Supabase
    useEffect(() => {
        let syncInterval: NodeJS.Timeout;

        if (btData?.connected && (btData.heartRate > 0 || btData.steps || btData.calories)) {
            syncInterval = setInterval(async () => {
                try {
                    await HealthService.upsertMetric({
                        heart_rate: btData.heartRate,
                        steps: btData.steps || 0
                    });
                    console.log('Bluetooth data auto-synced to Supabase');
                } catch (error) {
                    console.error('Failed to auto-sync Bluetooth data:', error);
                }
            }, 30000); // Sync every 30 seconds
        }

        return () => {
            if (syncInterval) clearInterval(syncInterval);
        };
    }, [btData]);

    const connect = async () => {
        try {
            setIsScanning(true);
            await bluetoothService.requestDevice();
            await bluetoothService.connect((data) => {
                setBtData(data);
            });
        } catch (error) {
            console.error('Bluetooth connection failed:', error);
            throw error;
        } finally {
            setIsScanning(false);
        }
    };

    const disconnect = async () => {
        try {
            await bluetoothService.disconnect();
            setBtData(null);
        } catch (error) {
            console.error('Bluetooth disconnection failed:', error);
            throw error;
        }
    };

    return (
        <BluetoothContext.Provider value={{ btData, isScanning, connect, disconnect }}>
            {children}
        </BluetoothContext.Provider>
    );
};

export const useBluetooth = () => {
    const context = useContext(BluetoothContext);
    if (context === undefined) {
        throw new Error('useBluetooth must be used within a BluetoothProvider');
    }
    return context;
};
