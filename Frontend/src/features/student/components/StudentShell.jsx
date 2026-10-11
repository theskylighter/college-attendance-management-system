import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import DashboardShell from "../../../components/DashboardShell";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "corrections", label: "Corrections", icon: MessageSquareText },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: UserRound },
];

export default function StudentShell({ activeTab, onTabChange, user, onLogout, children }) {
  return (
    <DashboardShell
      roleLabel="Student Portal"
      user={user}
      onLogout={onLogout}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      {children}
    </DashboardShell>
  );
}