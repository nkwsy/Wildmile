"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "lib/hooks";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";

export default function Login() {
  const { user, loading, mutate } = useUser();
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  async function doLogin(e) {
    e.preventDefault();
    
    // Basic validation
    if (!formValues.email || !formValues.email.includes('@')) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    
    if (!formValues.password) {
      setErrorMsg("Please enter your password");
      return;
    }
    
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });

    if (res.status === 200) {
      const userObj = await res.json();
      // set user to useSWR state
      mutate(userObj);
    } else {
      setErrorMsg(
        "Incorrect email or password. This is not the same as Galaxy digital. You must create an account here."
      );
    }
  }

  useEffect(() => {
    // redirect to home if user is authenticated
    if (user) router.push(callbackUrl);
  }, [user]);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back!</CardTitle>
          <CardDescription className="text-center">
            Do not have an account yet?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Create account
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={doLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@urbanriv.com"
                required
                value={formValues.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                required
                value={formValues.password}
                onChange={handleInputChange}
              />
            </div>
            {errorMsg && (
              <p className="text-sm font-medium text-destructive">{errorMsg}</p>
            )}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
