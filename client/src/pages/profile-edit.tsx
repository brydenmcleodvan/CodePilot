import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  age: z.coerce.number().int().positive().optional(),
  healthGoals: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileEdit() {
  const { user, updateProfile } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      age: user?.age as number | undefined,
      healthGoals: user?.healthGoals || "",
    },
  });

  const onSubmit = async (values: ProfileForm) => {
    await updateProfile(values);
    setLocation("/profile");
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-heading mb-4">Edit Profile</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="healthGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Goals</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Save</Button>
        </form>
      </Form>
    </div>
  );
}
