"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      // Silent error
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
    return <div className="flex items-center justify-center h-screen bg-gray-100">Loading...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">No data found.</div>;
  }

  const loggedInUser = data.teamMembers.find(member => member.email === data.userEmail);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.startupName}</h1>
              <p className="text-sm text-gray-500">Startup Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loggedInUser && (
              <ChangeRequestForm teamMember={loggedInUser} onSuccess={fetchData}>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" /> Update Profile
                </Button>
              </ChangeRequestForm>
            )}
            <Button onClick={handleLogout} variant="ghost" size="icon" aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Startup Info */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Building className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Startup Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Startup Name</p>
              <p className="font-semibold">{data.startupName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Primary Contact</p>
              <p className="font-semibold">{data.primaryContactEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="font-semibold">{data.teamMembers.length} members</p>
            </div>
          </CardContent>
        </Card>
        {/* Team Members */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">Team Members</CardTitle>
              <CardDescription>All members of your startup team</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{member.name} {member.email === data.userEmail && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">Active</span>}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{member.position}</span>
                    <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{member.mobile}</span>
                    <span className="flex items-center gap-1"><UserCheck className="h-4 w-4" />{member.association}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Profile Card (full width on mobile) */}
        <Card className="rounded-xl shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{loggedInUser?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{loggedInUser?.mobile}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{loggedInUser?.position}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span>{loggedInUser?.association}</span>
            </div>
            <div>
              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">Active</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 