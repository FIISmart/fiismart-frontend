import { useEffect, useState } from "react";
import { Users, BookOpen, GraduationCap, MessageSquare, ShieldCheck, UserCheck, TrendingUp } from "lucide-react";
import { adminService } from "../services/admin.service";
import type { AdminStatsAPI } from "../types";
import AdminLayout from "../components/AdminLayout";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatsAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <p className="text-muted-foreground text-sm">Se încarcă statisticile...</p>
      ) : !stats ? (
        <p className="text-destructive text-sm">Nu s-au putut încărca statisticile.</p>
      ) : (
        <div className="space-y-8">
          {/* Welcome */}
          <div className="bg-gradient-to-r from-primary/90 to-secondary/80 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="font-serif font-bold text-xl">Bine ai venit în Admin Panel</h2>
            </div>
            <p className="text-white/80 text-sm">
              Gestionează toți utilizatorii, cursurile și înrolările din platformă.
            </p>
          </div>

          {/* Stats grid */}
          <div>
            <h3 className="font-serif font-semibold text-base text-foreground mb-4">Statistici generale</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users}        label="Total utilizatori"  value={stats.totalUsers}       color="bg-primary" />
              <StatCard icon={BookOpen}     label="Total cursuri"      value={stats.totalCourses}     color="bg-secondary" />
              <StatCard icon={GraduationCap} label="Total înrolări"   value={stats.totalEnrollments} color="bg-accent" />
              <StatCard icon={MessageSquare} label="Total comentarii" value={stats.totalComments}    color="bg-[#9B8EC7]" />
            </div>
          </div>

          {/* Role breakdown */}
          <div>
            <h3 className="font-serif font-semibold text-base text-foreground mb-4">Distribuție roluri</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={UserCheck}  label="Studenți"    value={stats.totalStudents}   color="bg-[#84C5C4]" />
              <StatCard icon={Users}      label="Profesori"   value={stats.totalProfessors} color="bg-[#BDA6CE]" />
              <StatCard icon={ShieldCheck} label="Admini"    value={stats.totalAdmins}     color="bg-[#5A5470]" />
              <StatCard icon={TrendingUp} label="Publicate"   value={stats.publishedCourses} color="bg-[#9B8EC7]" />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
