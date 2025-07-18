"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  return (
    <Card className="w-full max-w-sm shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl">UTS Startup Portal</CardTitle>
        <CardDescription>Enter your email below to log in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="svetlana.nevskaya@uts.edu.au" required />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Send Magic Link</Button>
      </CardFooter>
    </Card>
  );
} 