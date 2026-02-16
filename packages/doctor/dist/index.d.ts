export type DoctorCheck = {
    id: string;
    ok: boolean;
    message: string;
    data?: Record<string, unknown>;
};
export declare function runDoctor(): Promise<DoctorCheck[]>;
export { getAdapterById, getAdapterRegistry } from './registry.js';
//# sourceMappingURL=index.d.ts.map