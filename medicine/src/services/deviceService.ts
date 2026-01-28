export interface Device {
    id: string;
    name: string;
    type: 'watch' | 'ring' | 'scale' | 'bp_monitor';
    status: 'connected' | 'disconnected' | 'pairing';
    lastSync?: string;
    batteryLevel?: number;
    icon?: string;
}

export const DeviceService = {
    async getConnectedDevices(): Promise<Device[]> {
        // Simulated devices
        return [
            { id: '1', name: 'Apple Watch Series 9', type: 'watch', status: 'connected', lastSync: new Date().toISOString(), batteryLevel: 85 },
            { id: '2', name: 'Oura Ring Gen 3', type: 'ring', status: 'connected', lastSync: new Date(Date.now() - 3600000).toISOString(), batteryLevel: 42 }
        ];
    },

    async startPairing(type: string): Promise<Device> {
        // Simulate pairing delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        return { id: Math.random().toString(), name: `New ${type}`, type: type as any, status: 'connected', lastSync: new Date().toISOString(), batteryLevel: 100 };
    }
};
