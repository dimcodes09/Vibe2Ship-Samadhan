import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Issue } from "@/shared/types/domain/Issue";
import { dashboardService } from "../services/dashboardService";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { ROUTES } from "@/shared/config/routes";
import {
  BarChart3,
  TrendingUp,
  Map,
  PieChart as PieIcon,
  MapPin,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface AnalyticsPanelProps {
  issues: Issue[];
}

// ---------------------------------------------------------------------------
// Shared chart styling
// ---------------------------------------------------------------------------
const TICK = { fill: "#9ca3af", fontSize: 11 };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl p-2.5 shadow-2xl text-xs font-sans">
      {label && <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 font-medium text-foreground mt-0.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: p.color ?? p.stroke ?? p.fill }} />
          <span>{p.name || "Value"}:</span>
          <span className="font-bold ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function AnalyticsPanel({ issues }: AnalyticsPanelProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const analytics = useMemo(
    () => dashboardService.computeAnalytics(issues),
    [issues]
  );

  if (issues.length === 0) return null;

  const handleCategoryClick = (category: string) =>
    navigate(`${ROUTES.CIVIC_MAP}?category=${encodeURIComponent(category)}`);

  const handleCityClick = (city: string) =>
    navigate(`${ROUTES.CIVIC_MAP}?city=${encodeURIComponent(city)}`);

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {language === "en" ? "Civic Analytics" : "नागरिक विश्लेषण"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {language === "en"
              ? `${analytics.totalIssues} issues · ${analytics.geoTaggedCount} geo-tagged${analytics.avgResolutionDays !== null ? ` · ~${analytics.avgResolutionDays}d avg. resolution` : ""}`
              : `${analytics.totalIssues} समस्याएं · ${analytics.geoTaggedCount} जियो-टैग`}
          </p>
        </div>
      </div>

      {/* Row 1: Category Donut + Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Category Donut ───────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <PieIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              {language === "en" ? "Issues by Category" : "श्रेणी अनुसार समस्याएं"}
            </h3>
            <span className="ml-auto text-[10px] text-muted-foreground italic">
              {language === "en" ? "click → filter map" : "क्लिक → मानचित्र"}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={analytics.categoryData}
                cx="50%"
                cy="48%"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={3}
                dataKey="count"
                nameKey="name"
                onClick={(d) => handleCategoryClick(d.name)}
                cursor="pointer"
              >
                {analytics.categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => (
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{v}</span>
                )}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ── Status Bar ───────────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              {language === "en" ? "Status Distribution" : "स्थिति वितरण"}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={analytics.statusData}
              layout="vertical"
              margin={{ left: 4, right: 20, top: 12, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={TICK}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={TICK}
                axisLine={false}
                tickLine={false}
                width={78}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(99,102,241,0.07)" }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {analytics.statusData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Monthly Reports Trend (full width) */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {language === "en" ? "Monthly Reports Trend" : "मासिक रिपोर्ट ट्रेंड"}
          </h3>
          <span className="ml-auto text-[10px] text-muted-foreground italic">
            {language === "en" ? "Last 6 months" : "पिछले 6 महीने"}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={analytics.monthlyTrend}
            margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="month"
              tick={TICK}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={TICK}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name={language === "en" ? "Issues Reported" : "दर्ज मुद्दे"}
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Top Affected Cities */}
      {analytics.cityRanking.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              {language === "en" ? "Top Affected Cities" : "प्रभावित शहर"}
            </h3>
            <span className="ml-auto text-[10px] text-muted-foreground italic">
              {language === "en" ? "click → zoom map" : "क्लिक → मानचित्र ज़ूम"}
            </span>
          </div>
          <div className="space-y-3">
            {analytics.cityRanking.map((entry, idx) => (
              <button
                key={entry.city}
                onClick={() => handleCityClick(entry.city)}
                className="w-full flex items-center gap-3 group text-left"
              >
                {/* Rank badge */}
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </div>

                {/* City info + progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {entry.city}
                    </p>
                    <div className="flex items-center gap-2 shrink-0 ml-2 text-xs">
                      <span className="text-muted-foreground">{entry.count}</span>
                      <span className="text-green-500 font-medium">
                        {entry.resolutionRate}% ✓
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${entry.resolutionRate}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {entry.topCategory}
                  </p>
                </div>

                {/* Map icon */}
                <MapPin className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>

          {/* Avg resolution metric at the bottom */}
          {analytics.avgResolutionDays !== null && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {language === "en"
                  ? `Average resolution time: ~${analytics.avgResolutionDays} day${analytics.avgResolutionDays !== 1 ? "s" : ""}`
                  : `औसत समाधान समय: ~${analytics.avgResolutionDays} दिन`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
