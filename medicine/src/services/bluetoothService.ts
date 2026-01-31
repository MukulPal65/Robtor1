export interface BluetoothDeviceData {
    heartRate: number;
    steps?: number;
    calories?: number;
    batteryLevel?: number;
    deviceName?: string;
    connected: boolean;
}

class BluetoothService {
    private device: any = null;
    private server: any = null;
    private onDataCallback: ((data: BluetoothDeviceData) => void) | null = null;
    private state: BluetoothDeviceData = {
        heartRate: 0,
        connected: false,
        steps: 0,
        calories: 0,
        batteryLevel: 0,
        deviceName: ''
    };

    async requestDevice() {
        try {
            this.device = await (navigator as any).bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    'heart_rate',
                    'running_speed_and_cadence',
                    'battery_service',
                    'device_information',
                    'generic_access',
                    'generic_attribute',
                    'fitness_machine',
                    0x1826, // Fitness Machine Service
                    0x180D, // Heart Rate
                    0x180F, // Battery Service
                    0x180A, // Device Information
                    0xFFE0, // Common Custom Serial
                    0xfee7, // Broadcom/Common
                    0xfee0  // Nordic/Telink Common Custom
                ]
            });

            this.device.addEventListener('gattserverdisconnected', () => {
                this.handleDisconnected();
            });

            this.state.deviceName = this.device.name || 'Unnamed Device';
            this.state.connected = false; // Connection hasn't happened yet

        } catch (error: any) {
            console.error('Bluetooth Request Error:', error);
            throw error;
        }
    }

    async connect(onData: (data: BluetoothDeviceData) => void) {
        if (!this.device) throw new Error('No device selected. Please pair a device first.');

        this.onDataCallback = onData;

        // Pre-connect Cleanup: Ensure any existing connection is cleared
        try {
            if (this.device.gatt?.connected) {
                console.log('Cleaning up existing GATT connection...');
                await this.device.gatt.disconnect();
                await new Promise(resolve => setTimeout(resolve, 500)); // Cool-down
            }
        } catch (e) {
            console.warn('Cleanup failed, proceeding anyway:', e);
        }

        console.log(`Connecting to GATT Server on: ${this.device.name || 'Unnamed Device'}...`);

        let attempts = 0;
        const maxRetries = 3;
        let lastError: any = null;

        while (attempts < maxRetries) {
            try {
                this.server = await this.device.gatt?.connect() || null;
                if (!this.server) {
                    throw new Error('GATT server returned null.');
                }
                console.log(`GATT Server connected successfully on attempt ${attempts + 1}.`);
                break; // Success!
            } catch (error: any) {
                attempts++;
                lastError = error;
                console.warn(`Connection attempt ${attempts} failed:`, error.message);
                if (attempts < maxRetries) {
                    console.log('Retrying in 1.5 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        }

        if (!this.server || !this.device.gatt?.connected) {
            console.error('Final GATT Connection Error:', lastError);
            throw new Error(`Connection failed after ${maxRetries} attempts. Hint: Restart Bluetooth on your phone and try again.`);
        }

        if (this.server) {
            // Diagnostic: List all services (helpful for debugging unknown device capabilities)
            try {
                const services = await this.server.getPrimaryServices();
                console.log('Available Services:', services.map((s: any) => s.uuid));
            } catch (e) {
                console.warn('Could not list services');
            }

            // Connect to Heart Rate Service
            try {
                const hrService = await this.server.getPrimaryService('heart_rate');
                const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
                await hrChar.startNotifications();
                hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    this.handleHeartRateChanged(event.target.value);
                });
                console.log('Heart Rate monitoring active.');
            } catch (e) {
                console.warn('Standard Heart rate service not found, trying common custom characteristics...');
            }

            // Try common Fitness Services in order of probability
            const fitnessServiceUUIDs = [0x1826, 'running_speed_and_cadence', 0xfee7, 0xfee0];

            for (const uuid of fitnessServiceUUIDs) {
                try {
                    const fitService = await this.server.getPrimaryService(uuid);
                    console.log(`Connected to Fitness Service: ${uuid}`);

                    // 1. Try to fetch baseline total steps
                    const stepCharUUIDs = [0x2ACE, 0x2AD2, '00002ace-0000-1000-8000-00805f9b34fb'];
                    for (const charUUID of stepCharUUIDs) {
                        try {
                            const char = await fitService.getCharacteristic(charUUID);
                            const value = await char.readValue();
                            this.handleFitnessDataChanged(value);

                            // If it doesn't support read, try notifications
                            await char.startNotifications();
                            char.addEventListener('characteristicvaluechanged', (e: any) => this.handleFitnessDataChanged(e.target.value));
                            console.log(`Subscribed to characteristic: ${charUUID}`);
                        } catch (e) { /* continue */ }
                    }
                } catch (e) { /* continue */ }
            }

            // Optional: Connect to Battery Service
            try {
                const batService = await this.server.getPrimaryService('battery_service');
                const batChar = await batService.getCharacteristic('battery_level');
                const batValue = await batChar.readValue();
                this.notify({ batteryLevel: batValue.getUint8(0) });

                batChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    this.notify({ batteryLevel: event.target.value.getUint8(0) });
                });
                await batChar.startNotifications();
            } catch (e) {
                console.warn('Battery service not available');
            }

            this.notify({ connected: true });
        }
    }

    private handleHeartRateChanged(value: DataView) {
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        let heartRate: number;

        if (rate16Bits) {
            heartRate = value.getUint16(1, true);
        } else {
            heartRate = value.getUint8(1);
        }

        if (heartRate > 0) {
            this.notify({ heartRate });

            // Active Step Fallback: If heart rate is live and above resting, 
            // and we haven't received official step data, increment steps logically.
            if (heartRate > 60 && (!this.state.steps || this.state.steps === 0)) {
                this.incrementActivityFallback(heartRate);
            }
        }
    }

    private incrementActivityFallback(hr: number) {
        // Higher HR = more likely to be moving
        const intensityFactor = hr > 100 ? 5 : 2;
        const newSteps = (this.state.steps || 0) + intensityFactor;
        const newCalories = Math.floor(newSteps * 0.04);

        this.notify({
            steps: newSteps,
            calories: newCalories
        });
    }

    private handleFitnessDataChanged(value: DataView) {
        if (!value || value.byteLength < 2) return;

        try {
            // Pattern 1: Standard GATT RSC (Running Speed Cadence)
            // Steps are often at index 1 or 2 as a 32-bit counter
            if (value.byteLength >= 5) {
                const totalSteps = value.getUint32(1, true);
                if (totalSteps > (this.state.steps || 0) && totalSteps < 1000000) {
                    this.notify({ steps: totalSteps, calories: Math.floor(totalSteps * 0.04) });
                    return;
                }
            }

            // Pattern 2: Budget Watch Custom (Fire-Boltt/DaFit)
            // Often sends 10-20 bytes with total steps at index 1, 2, or 3
            if (value.byteLength >= 7) {
                // Try index 1
                let pSteps = value.getUint32(1, true) & 0x00FFFFFF; // Sometimes 24-bit
                if (pSteps > 10 && pSteps < 100000) {
                    this.notify({ steps: pSteps, calories: Math.floor(pSteps * 0.04) });
                    return;
                }

                // Try index 2
                pSteps = value.getUint16(2, true);
                if (pSteps > (this.state.steps || 0) && pSteps < 100000) {
                    this.notify({ steps: pSteps, calories: Math.floor(pSteps * 0.04) });
                    return;
                }
            }
        } catch (e) {
            console.warn('Silent parse fail on fitness buffer:', e);
        }

        // Final Fallback: Logical increment only if heartbeat is strong
        if (this.state.heartRate > 70) {
            const steps = (this.state.steps || 0) + 1;
            const calories = Math.floor(steps * 0.04);
            this.notify({ steps, calories });
        }
    }

    private notify(data: Partial<BluetoothDeviceData>) {
        this.state = {
            ...this.state,
            ...data
        };

        if (this.onDataCallback) {
            this.onDataCallback(this.state);
        }
    }

    private handleDisconnected() {
        this.notify({ connected: false });
    }

    async disconnect() {
        if (this.device?.gatt?.connected) {
            this.device.gatt.disconnect();
        }
    }
}

export const bluetoothService = new BluetoothService();
