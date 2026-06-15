import { Issue } from "@/shared/types/domain/Issue";
import { IssueStatus } from "@/shared/types/domain/IssueStatus";

export interface DashboardStats {
  activeCount: number;
  resolvedCount: number;
  totalSupportsCount: number;
}

export const dashboardService = {
  calculateStats(issues: Issue[]): DashboardStats {
    const activeCount = issues.filter((i) => i.status !== IssueStatus.RESOLVED && i.status !== IssueStatus.REJECTED).length;
    const resolvedCount = issues.filter((i) => i.status === IssueStatus.RESOLVED).length;
    const totalSupportsCount = issues.reduce((sum, i) => sum + i.supportsCount, 0);

    return {
      activeCount,
      resolvedCount,
      totalSupportsCount,
    };
  },
};
