import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

const HADEES_ABOUT_NAMAZ = [
  {
    text: "The Prophet (ﷺ) said: 'The first matter that the slave will be brought to account for on the Day of Judgment is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is bad, then the rest of his deeds will be bad.'",
    source: "Recorded by at-Tabarani"
  },
  {
    text: "The Prophet (ﷺ) said: 'Between a man and disbelief and paganism is the abandonment of prayer.'",
    source: "Recorded by Muslim"
  },
  {
    text: "The Prophet (ﷺ) said: 'Prayer is the pillar of religion. Whoever establishes it has established religion, and whoever destroys it has destroyed religion.'",
    source: "Recorded by al-Bayhaqi"
  },
  {
    text: "The Prophet (ﷺ) said: 'The closest that a servant comes to his Lord is when he is prostrating, so make plenty of supplication then.'",
    source: "Recorded by Muslim"
  },
  {
    text: "The Prophet (ﷺ) said: 'Whoever prays the dawn prayer in congregation is under the protection of Allah.'",
    source: "Recorded by Muslim"
  },
  {
    text: "The Prophet (ﷺ) said: 'Prayer in congregation is twenty-seven times more virtuous than prayer performed individually.'",
    source: "Recorded by Bukhari and Muslim"
  }
];

export const HadeesCard = () => {
  const [currentHadees, setCurrentHadees] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHadees((prev) => (prev + 1) % HADEES_ABOUT_NAMAZ.length);
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const hadees = HADEES_ABOUT_NAMAZ[currentHadees];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-prayer animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-primary flex items-center justify-center gap-2">
          <span className="text-2xl">📿</span>
          Hadees about Namaz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-secondary/50 p-6 rounded-lg border-l-4 border-primary">
          <p className="text-foreground leading-relaxed text-lg italic mb-4">
            "{hadees.text}"
          </p>
          <p className="text-muted-foreground text-sm font-medium">
            — {hadees.source}
          </p>
        </div>
        
        <div className="flex justify-center gap-2 mt-4">
          {HADEES_ABOUT_NAMAZ.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentHadees ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};