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
                    0x1826 // Fitness Machine Service
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
        if (!this.device) throw new Error('No device selected');

        this.onDataCallback = onData;
        this.server = await this.device.gatt?.connect() || null;

        if (this.server) {
            // Connect to Heart Rate Service
            try {
                const hrService = await this.server.getPrimaryService('heart_rate');
                const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
                await hrChar.startNotifications();
                hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    this.handleHeartRateChanged(event.target.value);
                });
            } catch (e) {
                console.warn('Heart rate service not found');
            }

            // Connect to Fitness Machine / RSC Service (Simulated for steps/calories)
            try {
                // This is a placeholder for actual fitness data parsing
                // Most devices use custom GATT characteristics for steps/calories if not standard
                const fitnessService = await this.server.getPrimaryService('running_speed_and_cadence');
                const fitnessChar = await fitnessService.getCharacteristic('rsc_measurement');
                await fitnessChar.startNotifications();
                fitnessChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    this.handleFitnessDataChanged(event.target.value);
                });
            } catch (e) {
                console.warn('Fitness service not found');
            }

            // Optional: Connect to Battery Service
            try {
                const batService = await this.server.getPrimaryService('battery_service');
                const batChar = await batService.getCharacteristic('battery_level');
                const batValue = await batChar.readValue();
                this.notify({ batteryLevel: batValue.getUint8(0) });
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
