import Image from "next/image";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Github, Zap, Shield, Users, Code } from "lucide-react";

// Component to fetch and display GitHub stars
const GitHubStars = async () => {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Idrisvohra9/kdsm-encryptor",
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );
    const data = await response.json();
    const stars = data.stargazers_count || 0;

    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1 bg-secondary/50 text-primary border-primary/20 backdrop-blur-sm"
      >
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span>{stars} stars</span>
      </Badge>
    );
  } catch (error) {
    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1 bg-secondary/50 text-primary border-primary/20 backdrop-blur-sm"
      >
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span>Star us!</span>
      </Badge>
    );
  }
};

export default function ContributePage() {
  return (
    <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center overflow-x-hidden mb-20">
      {/* Header Section */}
      <div className="mb-12">
        <Image
          src="/icons/7.png"
          alt="Contribute to KDSM"
          width={200}
          height={200}
          className="rounded-full mx-auto mb-6 shadow-2xl ring-4 ring-primary/20"
        />

        <div className="flex items-center justify-center gap-4 mb-6">
          <h1 className="font-tomorrow text-4xl md:text-6xl font-bold text-primary drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            Join the Revolution!
          </h1>
          <GitHubStars />
        </div>

        <p className="text-xl text-primary/90 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          Help us build the future of encryption with the innovative{" "}
          <span className="text-blue-300 font-semibold">
            Keyed Dynamic Shift Matrix
          </span>{" "}
          algorithm
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="bg-secondary/50 backdrop-blur-md border-primary/20 text-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-semibold">Cutting-Edge Security</h3>
            </div>
            <p className="text-primary/80 leading-relaxed">
              Work with next-generation encryption that puts privacy back in
              users' hands. Our KDSM algorithm is blazingly fast and
              mathematically beautiful.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 backdrop-blur-md border-primary/20 text-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <h3 className="text-xl font-semibold">High Performance</h3>
            </div>
            <p className="text-primary/80 leading-relaxed">
              Built with Next.js 14, React 18, and optimized for lightning-fast
              encryption that scales with your needs. Performance meets
              security.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 backdrop-blur-md border-primary/20 text-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-semibold">Get Hired</h3>
            </div>
            <p className="text-primary/80 leading-relaxed">
              Core contributors and maintainers will get hired to work remotely
              on our next project and will be paid handsomely! 💰
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 backdrop-blur-md border-primary/20 text-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-semibold">Modern Tech Stack</h3>
            </div>
            <p className="text-primary/80 leading-relaxed">
              Work with cutting-edge technologies: Next.js, TypeScript, Tailwind
              CSS, shadcn/ui, and Appwrite backend integration.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Ready to Build Something Extraordinary?
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-primary font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <a
              href="https://github.com/Idrisvohra9/kdsm-encryptor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary/30 text-primary hover:bg-secondary/50 font-semibold px-8 py-3 rounded-lg transition-all duration-300 backdrop-blur-sm"
          >
            <a
              href="https://github.com/Idrisvohra9/kdsm-encryptor/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contributing Guidelines
            </a>
          </Button>
        </div>

        <p className="text-primary-foreground text-sm italic mt-6 max-w-xl mx-auto">
          "In a world where privacy is becoming a luxury, we're making it a
          right." - KDSM Team
        </p>
      </div>
    </div>
  );
}
