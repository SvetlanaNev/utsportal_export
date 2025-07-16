"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeRequestForm } from '@/components/change-request-form';
import { Mail, Phone, Building, LogOut, Briefcase, UserCheck, Users, Edit } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  position: string;
  mobile: string;
  association: string;
}

interface DashboardData {
  startupId: string;
  startupName: string;
  primaryContactEmail: string;
  teamMembers: TeamMember[];
  userEmail: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard', {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (e) {
      // Error handling is silent as per previous steps
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-50">Loading...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen bg-slate-50">No data found.</div>;
  }

  const loggedInUser = data.teamMembers.find(member => member.email === data.userEmail);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{data.startupName}</h1>
                <p className="text-sm text-gray-500">Startup Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {loggedInUser && (
                <ChangeRequestForm teamMember={loggedInUser} onSuccess={fetchData}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Update My Profile
                  </Button>
                </ChangeRequestForm>
              )}
              <Button onClick={handleLogout} variant="ghost" size="icon" aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2 grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Startup Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem icon={<Building />} label="Startup Name" value={data.startupName} />
                <InfoItem icon={<Mail />} label="Primary Contact" value={data.primaryContactEmail} />
                <InfoItem icon={<Users />} label="Team Size" value={`${data.teamMembers.length} members`} />
              </CardContent>
            </Card>

            {loggedInUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoItem icon={<Mail />} label="Email" value={loggedInUser.email} />
                  <InfoItem icon={<Phone />} label="Mobile" value={loggedInUser.mobile} />
                  <InfoItem icon={<Briefcase />} label="Position" value={loggedInUser.position} />
                  <InfoItem icon={<UserCheck />} label="UTS Association" value={loggedInUser.association} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>All members of your startup team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {data.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${member.name}`} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
} 