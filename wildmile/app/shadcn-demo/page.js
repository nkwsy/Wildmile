"use client"

import { SampleForm } from "@/components/sample-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export default function ShadcnDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Shadcn UI Components Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Basic Components</CardTitle>
            <CardDescription>
              Examples of basic Shadcn UI components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter your email" />
            </div>
            
            <div className="space-y-2">
              <Label>Date Picker</Label>
              <DatePicker />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
            
            <div className="space-y-2">
              <Button onClick={() => toast.success("Button clicked!")}>
                Click me
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Examples of toast notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => toast("Default toast")}>
                Default
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.success("Success toast")}
              >
                Success
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.error("Error toast")}
              >
                Error
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.warning("Warning toast")}
              >
                Warning
              </Button>
              <Button 
                variant="outline" 
                onClick={() => 
                  toast("Toast with action", {
                    action: {
                      label: "Undo",
                      onClick: () => toast("Action clicked"),
                    },
                  })
                }
              >
                With Action
              </Button>
              <Button 
                variant="outline" 
                onClick={() => 
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 2000)),
                    {
                      loading: "Loading...",
                      success: "Promise resolved!",
                      error: "Promise rejected!",
                    }
                  )
                }
              >
                Promise
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Form Example</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <SampleForm />
        </TabsContent>
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Shadcn UI</CardTitle>
              <CardDescription>
                Information about the Shadcn UI component library
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Shadcn UI is a collection of reusable components built using Radix UI and Tailwind CSS.
                It's not a component library, but rather a collection of re-usable components that you can
                copy and paste into your apps.
              </p>
              <p>
                The components are designed to be accessible, customizable, and work well together.
                They're built with Radix UI primitives, which provide the accessibility and behavior,
                and styled with Tailwind CSS.
              </p>
              <p>
                This demo page showcases some of the components available in Shadcn UI and how they
                can be used together to build a cohesive UI.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 