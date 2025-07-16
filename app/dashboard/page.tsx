"use client";

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeRequestForm } from '@/components/change-request-form';

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
  const [error, setError] = useState<string | null>(null);
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
        setError(e.message);
      } else {
        setError('An unexpected error occurred');
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
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen">No data found.</div>;
  }

  const loggedInUser = data.teamMembers.find(member => member.email === data.userEmail);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{data.startupName}</CardTitle>
              <CardDescription>Primary Contact: {data.primaryContactEmail}</CardDescription>
            </CardHeader>
          </Card>
          {loggedInUser && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Name:</strong> {loggedInUser.name}</p>
                <p><strong>Email:</strong> {loggedInUser.email}</p>
                <p><strong>Position:</strong> {loggedInUser.position}</p>
                <p><strong>Mobile:</strong> {loggedInUser.mobile}</p>
                <p><strong>UTS Association:</strong> {loggedInUser.association}</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  This is the list of members in your startup.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>UTS Association</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>{member.mobile}</TableCell>
                      <TableCell>{member.association}</TableCell>
                      <TableCell className="text-right">
                        {member.email === data.userEmail && (
                          <ChangeRequestForm teamMember={member} onSuccess={fetchData}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit My Profile
                            </Button>
                          </ChangeRequestForm>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 