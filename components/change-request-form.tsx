"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { TEAM_MEMBERS_TABLE } from "@/lib/constants";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  position: string;
  mobile: string;
}

const formSchema = z.object({
  position: z.string().min(2, { message: "Position must be at least 2 characters." }),
  mobile: z.string().min(8, { message: "Please enter a valid mobile number." }),
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
});

interface ChangeRequestFormProps {
  teamMember: TeamMember;
  children: React.ReactNode;
  onSuccess: () => void;
}

export function ChangeRequestForm({ teamMember, children, onSuccess }: ChangeRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: teamMember.position,
      mobile: teamMember.mobile,
      reason: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const changes = {
        'Position at startup*': values.position,
        'Mobile*': values.mobile,
      };

      const response = await fetch('/api/change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: TEAM_MEMBERS_TABLE,
          recordId: teamMember.id,
          changes,
          reason: values.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Change request submitted successfully.");
        setIsOpen(false);
        onSuccess();
      } else {
        toast.error(data.message || "An error occurred.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Change for {teamMember.name}</DialogTitle>
          <DialogDescription>
            Submit your requested changes below. Your request will be logged.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Change</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Updated my role within the team." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 