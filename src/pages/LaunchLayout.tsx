import { Outlet, useParams } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { LaunchHeader } from "@/components/layout/LaunchHeader";

export default function LaunchLayout() {
  const { id } = useParams<{ id: string }>();
  const { setSelectedLaunch, launches } = useWorkspace();

  useEffect(() => {
    if (id && launches.length > 0) {
      const launch = launches.find(l => l.id === id);
      if (launch) {
        setSelectedLaunch(launch);
      }
    }
  }, [id, launches, setSelectedLaunch]);

  if (!id) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <LaunchHeader currentLaunchId={id} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}