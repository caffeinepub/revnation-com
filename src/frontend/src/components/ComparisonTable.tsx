import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Bike, Review } from '../backend';

interface ComparisonTableProps {
  bike1: Bike;
  bike2: Bike;
  review1?: Review;
  review2?: Review;
}

export default function ComparisonTable({ bike1, bike2, review1, review2 }: ComparisonTableProps) {
  const avgScore1 = review1
    ? (review1.score.performance + review1.score.design + review1.score.comfort + review1.score.value) / 4
    : null;
  const avgScore2 = review2
    ? (review2.score.performance + review2.score.design + review2.score.comfort + review2.score.value) / 4
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Specification</TableHead>
              <TableHead className="w-1/3 text-center">{bike1.brand} {bike1.name}</TableHead>
              <TableHead className="w-1/3 text-center">{bike2.brand} {bike2.name}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Brand</TableCell>
              <TableCell className="text-center">{bike1.brand}</TableCell>
              <TableCell className="text-center">{bike2.brand}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Model</TableCell>
              <TableCell className="text-center">{bike1.name}</TableCell>
              <TableCell className="text-center">{bike2.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Region</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{bike1.region}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{bike2.region}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Specifications</TableCell>
              <TableCell className="text-center text-sm">{bike1.specs}</TableCell>
              <TableCell className="text-center text-sm">{bike2.specs}</TableCell>
            </TableRow>
            {(review1 || review2) && (
              <>
                <TableRow>
                  <TableCell className="font-medium">Overall Score</TableCell>
                  <TableCell className="text-center">
                    {avgScore1 ? (
                      <Badge variant="secondary">{avgScore1.toFixed(1)}/5</Badge>
                    ) : (
                      <span className="text-muted-foreground">No review</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {avgScore2 ? (
                      <Badge variant="secondary">{avgScore2.toFixed(1)}/5</Badge>
                    ) : (
                      <span className="text-muted-foreground">No review</span>
                    )}
                  </TableCell>
                </TableRow>
                {review1 && review2 && (
                  <>
                    <TableRow>
                      <TableCell className="font-medium">Performance</TableCell>
                      <TableCell className={`text-center ${review1.score.performance > review2.score.performance ? 'font-semibold text-primary' : ''}`}>
                        {review1.score.performance}/5
                      </TableCell>
                      <TableCell className={`text-center ${review2.score.performance > review1.score.performance ? 'font-semibold text-primary' : ''}`}>
                        {review2.score.performance}/5
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Design</TableCell>
                      <TableCell className={`text-center ${review1.score.design > review2.score.design ? 'font-semibold text-primary' : ''}`}>
                        {review1.score.design}/5
                      </TableCell>
                      <TableCell className={`text-center ${review2.score.design > review1.score.design ? 'font-semibold text-primary' : ''}`}>
                        {review2.score.design}/5
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Comfort</TableCell>
                      <TableCell className={`text-center ${review1.score.comfort > review2.score.comfort ? 'font-semibold text-primary' : ''}`}>
                        {review1.score.comfort}/5
                      </TableCell>
                      <TableCell className={`text-center ${review2.score.comfort > review1.score.comfort ? 'font-semibold text-primary' : ''}`}>
                        {review2.score.comfort}/5
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Value</TableCell>
                      <TableCell className={`text-center ${review1.score.value > review2.score.value ? 'font-semibold text-primary' : ''}`}>
                        {review1.score.value}/5
                      </TableCell>
                      <TableCell className={`text-center ${review2.score.value > review1.score.value ? 'font-semibold text-primary' : ''}`}>
                        {review2.score.value}/5
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
