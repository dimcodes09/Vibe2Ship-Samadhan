import { Issue } from "@/shared/types/domain/Issue";
import { IssueStatus } from "@/shared/types/domain/IssueStatus";

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

export interface DashboardStats {
  activeCount: number;
  resolvedCount: number;
  totalSupportsCount: number;
  geoTaggedCount: number;
  avgResolutionDays: number | null;
  duplicateCount: number;
  issuesThisWeek: number;
  aiClassifiedCount: number;
}

export interface CategoryCount {
  name: string;
  count: number;
  color: string;
}

export interface StatusCount {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  count: number;
}

export interface CityRanking {
  city: string;
  count: number;
  resolvedCount: number;
  resolutionRate: number;
  topCategory: string;
}

export interface DashboardAnalytics {
  categoryData: CategoryCount[];
  statusData: StatusCount[];
  monthlyTrend: MonthlyTrend[];
  cityRanking: CityRanking[];
  totalIssues: number;
  geoTaggedCount: number;
  avgResolutionDays: number | null;
}

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  "Water Supply":    "#3b82f6",
  "जल आपूर्ति":     "#3b82f6",
  "Sanitation":      "#f59e0b",
  "स्वच्छता":       "#f59e0b",
  "Electricity":     "#eab308",
  "बिजली":          "#eab308",
  "Roads":           "#6b7280",
  "सड़कें":         "#6b7280",
  "Parks & Gardens": "#22c55e",
  "पार्क और बगीचे": "#22c55e",
  "Buildings":       "#8b5cf6",
  "भवन":            "#8b5cf6",
};

const KNOWN_CITIES = [
  { key: "bhopal", name: "Bhopal" },
  { key: "khanna", name: "Khanna" },
  { key: "indore", name: "Indore" },
  { key: "mumbai", name: "Mumbai" },
  { key: "delhi", name: "Delhi" },
  { key: "new delhi", name: "New Delhi" },
  { key: "bangalore", name: "Bengaluru" },
  { key: "bengaluru", name: "Bengaluru" },
  { key: "hyderabad", name: "Hyderabad" },
  { key: "chennai", name: "Chennai" },
  { key: "kolkata", name: "Kolkata" },
  { key: "pune", name: "Pune" }
];

const STATE_COUNTRY_BLACKLIST = new Set([
  "india", "usa", "united states",
  "madhya pradesh", "mp", "m.p.", "punjab", "maharashtra", "delhi", "haryana",
  "uttar pradesh", "up", "u.p.", "gujarat", "rajasthan", "karnataka", "tamil nadu",
  "kerala", "andhra pradesh", "telangana", "west bengal", "bihar", "jharkhand",
  "odisha", "chhattisgarh", "himachal pradesh", "uttarakhand", "goa", "assam"
]);

const STREET_INDICATORS = /\b(st|street|rd|road|lane|ln|plot|ward|flat|sector|building|house|h\.no|no|floor|near|opp|behind|post office|post|office|park)\b/i;

function extractCity(location: string): string {
  if (!location) return "Unknown";
  
  const lowerLocation = location.toLowerCase();
  
  // 1. Check for known cities in the text
  for (const city of KNOWN_CITIES) {
    const regex = new RegExp(`\\b${city.key}\\b`, "i");
    if (regex.test(lowerLocation)) {
      return city.name;
    }
  }

  // 2. Comma-separated analysis
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return "Unknown";

  for (const part of parts) {
    const partLower = part.toLowerCase();
    
    // Skip blacklist items
    if (STATE_COUNTRY_BLACKLIST.has(partLower)) continue;
    
    // Skip pincodes
    if (/^\d{6}$/.test(partLower)) continue;
    
    // Skip specific street addresses
    if (/\d/.test(partLower) || STREET_INDICATORS.test(partLower)) continue;
    
    // If it looks like a clean name of length >= 3, return it capitalized
    if (part.length >= 3) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
  }

  // Fallback 1: Return the first part that is not country/state
  for (const part of parts) {
    const partLower = part.toLowerCase();
    if (!STATE_COUNTRY_BLACKLIST.has(partLower)) {
      return part;
    }
  }

  // Fallback 2: Return first part
  return parts[0] || "Unknown";
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const dashboardService = {
  calculateStats(issues: Issue[]): DashboardStats {
    const activeCount = issues.filter(
      (i) => i.status !== IssueStatus.RESOLVED && i.status !== IssueStatus.REJECTED
    ).length;
    const resolvedCount = issues.filter((i) => i.status === IssueStatus.RESOLVED).length;
    const totalSupportsCount = issues.reduce((sum, i) => sum + i.supportsCount, 0);
    const geoTaggedCount = issues.filter((i) => i.latitude !== null && i.longitude !== null).length;
    
    // Avg resolution in days
    const resolvedWithDates = issues.filter(
      (i) => i.status === IssueStatus.RESOLVED && i.updatedAt
    );
    let avgResolutionDays: number | null = null;
    if (resolvedWithDates.length > 0) {
      const totalMs = resolvedWithDates.reduce(
        (sum, i) => sum + (i.updatedAt!.getTime() - i.createdAt.getTime()),
        0
      );
      avgResolutionDays = Math.round(totalMs / resolvedWithDates.length / 86_400_000);
    }
    
    const duplicateCount = issues.filter((i) => i.masterIssueId !== null).length;
    
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const issuesThisWeek = issues.filter((i) => i.createdAt.getTime() >= sevenDaysAgo).length;
    
    const aiClassifiedCount = issues.length; // All ingestion is processed

    return { 
      activeCount, 
      resolvedCount, 
      totalSupportsCount,
      geoTaggedCount,
      avgResolutionDays,
      duplicateCount,
      issuesThisWeek,
      aiClassifiedCount
    };
  },

  computeAnalytics(issues: Issue[]): DashboardAnalytics {
    // -- Category breakdown ------------------------------------------------
    const catCount: Record<string, number> = {};
    issues.forEach((i) => {
      const c = i.category as string;
      catCount[c] = (catCount[c] || 0) + 1;
    });
    const categoryData: CategoryCount[] = Object.entries(catCount)
      .map(([name, count]) => ({
        name,
        count,
        color: CATEGORY_COLORS[name] ?? "#6366f1",
      }))
      .sort((a, b) => b.count - a.count);

    // -- Status breakdown --------------------------------------------------
    const statusData: StatusCount[] = [
      { name: "Reported",    value: issues.filter((i) => i.status === IssueStatus.REPORTED).length,    color: "#f59e0b" },
      { name: "In Progress", value: issues.filter((i) => i.status === IssueStatus.IN_PROGRESS).length, color: "#3b82f6" },
      { name: "Resolved",    value: issues.filter((i) => i.status === IssueStatus.RESOLVED).length,    color: "#22c55e" },
      { name: "Rejected",    value: issues.filter((i) => i.status === IssueStatus.REJECTED).length,    color: "#ef4444" },
    ].filter((s) => s.value > 0);

    // -- Avg resolution time (days) ----------------------------------------
    const resolvedWithDates = issues.filter(
      (i) => i.status === IssueStatus.RESOLVED && i.updatedAt
    );
    let avgResolutionDays: number | null = null;
    if (resolvedWithDates.length > 0) {
      const totalMs = resolvedWithDates.reduce(
        (sum, i) => sum + (i.updatedAt!.getTime() - i.createdAt.getTime()),
        0
      );
      avgResolutionDays = Math.round(totalMs / resolvedWithDates.length / 86_400_000);
    }

    return {
      categoryData,
      statusData,
      monthlyTrend: this.computeMonthlyTrend(issues),
      cityRanking:  this.computeCityRanking(issues),
      totalIssues:  issues.length,
      geoTaggedCount: issues.filter((i) => i.latitude && i.longitude).length,
      avgResolutionDays,
    };
  },

  computeMonthlyTrend(issues: Issue[]): MonthlyTrend[] {
    // Build a map for the last 6 months, initialised to 0
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    issues.forEach((issue) => {
      const key = issue.createdAt.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  },

  computeCityRanking(issues: Issue[]): CityRanking[] {
    const cityMap: Record<string, Issue[]> = {};
    issues.forEach((issue) => {
      const city = extractCity(issue.location);
      if (!cityMap[city]) cityMap[city] = [];
      cityMap[city].push(issue);
    });
    return Object.entries(cityMap)
      .map(([city, list]) => {
        const catCount: Record<string, number> = {};
        list.forEach((i) => {
          const c = i.category as string;
          catCount[c] = (catCount[c] || 0) + 1;
        });
        const topCategory =
          Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        const resolvedCount = list.filter((i) => i.status === IssueStatus.RESOLVED).length;
        return {
          city,
          count: list.length,
          resolvedCount,
          resolutionRate:
            list.length > 0 ? Math.round((resolvedCount / list.length) * 100) : 0,
          topCategory,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },
};
