"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeRequestForm } from '@/components/change-request-form';
import { Mail, Phone, Building, User, LogOut, Briefcase, UserCheck, Users } from 'lucide-react';

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
      if (e instanceof Error) {
        // setError(e.message); // This line was removed as per the new_code
      } else {
        // setError('An unexpected error occurred'); // This line was removed as per the new_code
      }
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
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">No data found.</div>;
  }

  const loggedInUser = data.teamMembers.find(member => member.email === data.userEmail);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-slate-800 p-3 rounded-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{data.startupName}</h1>
              <p className="text-sm text-slate-500">Startup Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {loggedInUser && (
              <ChangeRequestForm teamMember={loggedInUser} onSuccess={fetchData}>
                <Button variant="outline">Update Profile</Button>
              </ChangeRequestForm>
            )}
            <Button onClick={handleLogout} variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Startup Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-slate-400 mr-4" />
                  <div>
                    <p className="text-sm text-slate-500">Startup Name</p>
                    <p className="font-medium">{data.startupName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-slate-400 mr-4" />
                  <div>
                    <p className="text-sm text-slate-500">Primary Contact</p>
                    <p className="font-medium">{data.primaryContactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-slate-400 mr-4" />
                  <div>
                    <p className="text-sm text-slate-500">Team Size</p>
                    <p className="font-medium">{data.teamMembers.length} members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loggedInUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-slate-400 mr-4" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{loggedInUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-slate-400 mr-4" />
                    <div>
                      <p className="text-sm text-slate-500">Mobile</p>
                      <p className="font-medium">{loggedInUser.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-slate-400 mr-4" />
                    <div>
                      <p className="text-sm text-slate-500">Position</p>
                      <p className="font-medium">{loggedInUser.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <UserCheck className="h-5 w-5 text-slate-400 mr-4" />
                    <div>
                      <p className="text-sm text-slate-500">UTS Association</p>
                      <p className="font-medium">{loggedInUser.association}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
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
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.email}</p>
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