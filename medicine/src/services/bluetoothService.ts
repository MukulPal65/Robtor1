export interface BluetoothDeviceData {
    heartRate: number;
    batteryLevel?: number;
    deviceName?: string;
    connected: boolean;
}

class BluetoothService {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private onDataCallback: ((data: BluetoothDeviceData) => void) | null = null;

    async requestDevice() {
        try {
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service']
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
            const hrService = await this.server.getPrimaryService('heart_rate');
            const hrChar = await hrService.getCharacteristic('heart_rate_measurement');

            await hrChar.startNotifications();
            hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
                this.handleHeartRateChanged(event.target.value);
            });

            // Optional: Connect to Battery Service
            try {
                const batService = await this.server.getPrimaryService('battery_service');
                const batChar = await batService.getCharacteristic('battery_level');
                const batValue = await batChar.readValue();
                this.notify(0, batValue.getUint8(0));
            } catch (e) {
                console.warn('Battery service not available');
            }

            this.notify(0);
        }
    }

    private handleHeartRateChanged(value: DataView) {
        // Standard GATT Heart Rate measurement format
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        let heartRate: number;

        if (rate16Bits) {
            heartRate = value.getUint16(1, true);
        } else {
            heartRate = value.getUint8(1);
        }

        this.notify(heartRate);
    }

    private notify(heartRate: number, batteryLevel?: number) {
        if (this.onDataCallback) {
            this.onDataCallback({
                heartRate,
                batteryLevel,
                deviceName: this.device?.name,
                connected: true
            });
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
