import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Score } from '../backend';

interface ScoreBreakdownProps {
  score: Score;
  overallScore: number;
}

export default function ScoreBreakdown({ score, overallScore }: ScoreBreakdownProps) {
  const scores = [
    { label: 'Performance', value: score.performance },
    { label: 'Design', value: score.design },
    { label: 'Comfort', value: score.comfort },
    { label: 'Value', value: score.value },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Review Score</CardTitle>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {overallScore.toFixed(1)}/5
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scores.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.value}/5</span>
            </div>
            <Progress value={(item.value / 5) * 100} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
