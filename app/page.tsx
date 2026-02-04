import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Radio } from "lucide-react";
import { LiveStats } from "@/components/app/live-stats";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center max-w-6xl mx-auto">
      <div className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          Now live in San Francisco
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Find your next <span className="text-primary">coworking</span> spot.
        </h1>
        
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          See where other builders, designers, and founders are working right now. Join them, say hi, and get to work.
        </p>
        <LiveStats />
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto gap-2" asChild>
            <Link href="/nearby">
              <MapPin className="h-4 w-4" />
              Find Nearby
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto gap-2" asChild>
            <Link href="https://github.com/thetanav/workin" target="_blank">
              <span className="font-bold">GitHub</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12 w-full max-w-4xl">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Live Map</h3>
          <p className="text-sm text-muted-foreground">
            See active check-ins on a real-time map.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Social Context</h3>
          <p className="text-sm text-muted-foreground">
            See who is working and what they are working on.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Broadcast</h3>
          <p className="text-sm text-muted-foreground">
            Let others know where you are to encourage serendipity.
          </p>
        </div>
      </div>
    </div>
  );
}
