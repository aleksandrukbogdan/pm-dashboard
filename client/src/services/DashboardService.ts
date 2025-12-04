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
    };
    projects: any[];
}

export const DashboardService = {
    async getDashboardData(spreadsheetId: string): Promise<DashboardData> {
        const response = await axios.get(`${API_URL}/dashboard/${spreadsheetId}`);
        return response.data;
    }
};
