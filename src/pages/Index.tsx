import { TimerCard } from '@/components/TimerCard';
import { HadeesCard } from '@/components/HadeesCard';
import { NotificationButton } from '@/components/NotificationButton';
import mosqueHero from '@/assets/mosque-hero.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={mosqueHero} 
          alt="Beautiful mosque at sunset" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Namaz Time Reminder
          </h1>
          <p className="text-foreground/80">
            Stay connected to your prayers with gentle reminders
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Notification Controls */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Prayer Dashboard
          </h2>
          <NotificationButton />
        </div>

        {/* Timer Section */}
        <div className="flex justify-center mb-8">
          <TimerCard />
        </div>

        {/* Hadees Section */}
        <div className="flex justify-center">
          <HadeesCard />
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border mt-12">
          <p className="text-muted-foreground text-sm">
            "And establish prayer and give zakah and bow with those who bow" - Al-Baqarah 2:43
          </p>
          <div className="mt-4 text-center">
            <span className="text-primary font-semibold">May Allah accept our prayers</span>
            <span className="text-accent ml-2">🤲</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;