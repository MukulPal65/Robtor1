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
                    0xfee7  // Broadcom/Common
                ]
            });

            this.device.addEventListener('gattserverdisconnected', () => {
                this.handleDisconnected();
            });

            return this.device;
        } catch (error) {
            console.error('Bluetooth device request failed:', error);
            throw error;
        }
    }

    async connect(onData: (data: BluetoothDeviceData) => void) {
        if (!this.device) throw new Error('No device selected. Please pair a device first.');

        this.onDataCallback = onData;
        console.log(`Connecting to GATT Server on: ${this.device.name || 'Unnamed Device'}...`);

        try {
            this.server = await this.device.gatt?.connect() || null;
            if (!this.server) {
                throw new Error('Failed to establish GATT server connection.');
            }
            console.log('GATT Server connected successfully.');
        } catch (error: any) {
            console.error('GATT Connection Error:', error);
            throw new Error(`Connection failed: ${error.message || 'Check if device is too far or already connected elsewhere.'}`);
        }

        if (this.server) {
            // Diagnostic: List all services (helpful for debugging unknown device capabilities)
            try {
                const services = await this.server.getPrimaryServices();
                console.log('Available Services on device:', services.map((s: any) => s.uuid));
            } catch (e) {
                console.warn('Could not list services - device might have disconnected or is restricted.');
            }

            // Connect to Heart Rate Service
            try {
                console.log('Attempting Heart Rate service connection...');
                const hrService = await this.server.getPrimaryService('heart_rate');
                const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
                await hrChar.startNotifications();
                hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    this.handleHeartRateChanged(event.target.value);
                });
                console.log('Heart Rate monitoring active.');
            } catch (e) {
                console.warn('Heart rate service not found or access denied');
            }

            // Connect to Fitness Machine / RSC Service
            try {
                console.log('Attempting Fitness/RSC service connection...');
                const fitnessService = await this.server.getPrimaryService('running_speed_and_cadence');
                const fitnessChar = await fitnessService.getCharacteristic('rsc_measurement');
                await fitnessChar.startNotifications();
                fitnessChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    this.handleFitnessDataChanged(event.target.value);
                });
                console.log('Fitness/RSC monitoring active.');
            } catch (e) {
                console.warn('Fitness/Speed service not found');
            }

            // Optional: Connect to Battery Service
            try {
                const batService = await this.server.getPrimaryService('battery_service');
                const batChar = await batService.getCharacteristic('battery_level');
                const batValue = await batChar.readValue();
                this.notify({ batteryLevel: batValue.getUint8(0) });
                console.log('Battery level fetched:', batValue.getUint8(0));
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

        this.notify({ heartRate });
    }

    private handleFitnessDataChanged(_value: DataView) {
        // Example parsing for RSC (Running Speed and Cadence)
        // This is highly device-dependent. We'll simulate step detection here.
        // real implementation would parse the buffer according to GATT spec
        const steps = Math.floor(Math.random() * 1000); // Placeholder
        const calories = Math.floor(steps * 0.04); // Placeholder
        this.notify({ steps, calories });
    }

    private notify(data: Partial<BluetoothDeviceData>) {
        if (this.onDataCallback) {
            const currentData: BluetoothDeviceData = {
                heartRate: 0,
                connected: true,
                deviceName: this.device?.name,
                ...data
            };
            this.onDataCallback(currentData);
        }
    }

    private handleDisconnected() {
        if (this.onDataCallback) {
            this.onDataCallback({ heartRate: 0, connected: false });
        }
    }

    async disconnect() {
        if (this.device?.gatt?.connected) {
            this.device.gatt.disconnect();
        }
    }
}

export const bluetoothService = new BluetoothService();
