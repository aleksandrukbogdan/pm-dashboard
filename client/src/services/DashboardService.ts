import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface DashboardData {
    summary: {
        totalProjects: number;
        totalTeamMembers: number;
        totalBudget: number;
    };
    charts: {
        byDirection: Record<string, number>;
        deadlines: {
            onTrack: number;
            overdueSmall: number;
            overdueLarge: number;
            completed: number;
        };
        byStatus: Record<string, number>;
        teamRoles: Record<string, number>;
        byType: {
            internal: number;
            commercial: number;
            free: number;
        };
        byCompany: {
            ite29: number;
            nir: number;
        };
    };
    projects: any[];
}

export interface WeekInfo {
    weekStart: string;
    display: string;
    createdAt: string;
    isCurrent: boolean;
}

export interface SnapshotData extends DashboardData {
    weekStart: string;
    display: string;
    createdAt: string;
}

export interface ProjectHistoryEntry {
    weekStart: string;
    display: string;
    status: string;
    statusChangedAt: string;
    previousStatus: string | null;
    snapshot: any;
}

export const DashboardService = {
    async getDashboardData(spreadsheetId: string): Promise<DashboardData> {
        const response = await axios.get(`${API_URL}/dashboard/${spreadsheetId}`);
        return response.data;
    },

    async getAvailableWeeks(): Promise<WeekInfo[]> {
        const response = await axios.get(`${API_URL}/snapshots/weeks`);
        return response.data;
    },

    async getSnapshotData(weekStart: string): Promise<SnapshotData> {
        const response = await axios.get(`${API_URL}/snapshots/${weekStart}`);
        return response.data;
    },

    async createSnapshot(): Promise<{ success: boolean; weekStart: string; display: string }> {
        const response = await axios.post(`${API_URL}/snapshots/create`);
        return response.data;
    },

    async getProjectHistory(projectKey: string): Promise<ProjectHistoryEntry[]> {
        const response = await axios.get(`${API_URL}/snapshots/projects/${encodeURIComponent(projectKey)}/history`);
        return response.data;
    },

    async getStatusDurations(projectKeys: string[]): Promise<Record<string, number | null>> {
        const response = await axios.post(`${API_URL}/snapshots/status-durations`, { projectKeys });
        return response.data;
    },

    async deleteSnapshot(weekStart: string): Promise<{ success: boolean; weekStart: string }> {
        const response = await axios.delete(`${API_URL}/snapshots/${weekStart}`);
        return response.data;
    }
};
