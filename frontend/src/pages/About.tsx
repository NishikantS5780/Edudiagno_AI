import LandingLayout from "@/components/layout/LandingLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const About = () => {
  return (
    <LandingLayout>
      <div className="container py-12 md:py-20">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>About</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Revolutionizing Hiring Through AI Innovation
            </h1>
            <p className="text-xl mb-6 text-muted-foreground">
              EduDiagno is on a mission to transform the hiring landscape by combining 
              cutting-edge AI technology with deep recruitment expertise to create smarter,
              faster, and more effective hiring processes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact">
                <Button size="lg">Contact Us</Button>
              </Link>
              <Link to="/case-studies">
                <Button variant="outline" size="lg">View Success Stories</Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden aspect-video">
            <img
              src="https://placehold.co/800x500?text=Team+Photo"
              alt="EduDiagno Team"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
          <div className="max-w-3xl mx-auto text-lg">
            <p className="mb-4">
              Founded in 2021 by a team of AI experts and recruitment professionals, EduDiagno 
              was born from a simple observation: the traditional hiring process was broken.
            </p>
            <p className="mb-4">
              Employers were spending countless hours screening resumes, conducting repetitive 
              interviews, and still struggling to identify the best candidates. Meanwhile, 
              qualified applicants were getting lost in outdated systems.
            </p>
            <p className="mb-4">
              We set out to build a solution that would harness the power of artificial intelligence 
              to transform every stage of the hiring process - from initial screening to final 
              selection. Our platform was designed to save time, reduce bias, and ultimately 
              help companies make better hiring decisions.
            </p>
            <p>
              Today, EduDiagno serves thousands of companies worldwide, from fast-growing 
              startups to global enterprises, all united by a desire to hire smarter and faster.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p>We constantly push the boundaries of what's possible with AI in recruitment, developing new features and capabilities that solve real problems.</p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Trust</h3>
              <p>We build systems that are transparent, explainable, and designed to earn the trust of both employers and candidates throughout the hiring process.</p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Inclusivity</h3>
              <p>We're committed to building AI systems that reduce bias in hiring and create more diverse, equitable, and inclusive workplaces for everyone.</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Sarah Chen",
                title: "Co-Founder & CEO",
                image: "https://placehold.co/300x300?text=SC",
                bio: "Former Google AI researcher with 15+ years in tech leadership",
              },
              {
                name: "Michael Rodriguez",
                title: "Co-Founder & CTO",
                image: "https://placehold.co/300x300?text=MR",
                bio: "AI pioneer with background in natural language processing",
              },
              {
                name: "Jennifer Park",
                title: "Chief Product Officer",
                image: "https://placehold.co/300x300?text=JP",
                bio: "Former VP of Product at leading HR tech companies",
              },
              {
                name: "David Washington",
                title: "Chief Revenue Officer",
                image: "https://placehold.co/300x300?text=DW",
                bio: "20+ years of enterprise sales leadership experience",
              },
            ].map((leader, index) => (
              <div key={index} className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold">{leader.name}</h3>
                <p className="text-primary mb-2">{leader.title}</p>
                <p className="text-muted-foreground">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about
            revolutionizing the hiring process through technology.
          </p>
          <Link to="/careers">
            <Button size="lg">View Open Positions</Button>
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
};

export default About;
