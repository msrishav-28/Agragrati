import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Page header skeleton
export const HeaderSkeleton = () => (
  <div className="text-center space-y-4 py-12">
    <Skeleton className="h-6 w-32 mx-auto" />
    <Skeleton className="h-12 w-80 mx-auto" />
    <Skeleton className="h-6 w-96 mx-auto" />
  </div>
);

// Card skeleton with header and content
export const CardSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <Card className="shadow-md">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </CardContent>
  </Card>
);

// Job card skeleton
export const JobCardSkeleton = () => (
  <Card className="shadow-md">
    <CardContent className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </CardContent>
  </Card>
);

// Job list skeleton
export const JobListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="space-y-3">
    <div className="flex gap-4 p-4 border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Stats cards skeleton
export const StatCardsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Resume analysis skeleton
export const ResumeAnalysisSkeleton = () => (
  <div className="space-y-6">
    <HeaderSkeleton />
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      <CardSkeleton rows={5} />
      <div className="grid md:grid-cols-2 gap-4">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <Card className="shadow-md">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 mt-4" />
    </CardContent>
  </Card>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      <CardSkeleton rows={4} />
      <CardSkeleton rows={4} />
    </div>
  </div>
);

// Interview question skeleton
export const InterviewQuestionSkeleton = () => (
  <Card className="shadow-md">
    <CardContent className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-32" />
    </CardContent>
  </Card>
);

// Cover letter skeleton
export const CoverLetterSkeleton = () => (
  <Card className="shadow-md">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ width: `${85 + Math.random() * 15}%` }} />
      ))}
    </CardContent>
  </Card>
);

// Generic page skeleton
export const PageSkeleton = () => (
  <div className="space-y-8 p-4">
    <HeaderSkeleton />
    <div className="max-w-6xl mx-auto space-y-6">
      <StatCardsSkeleton />
      <div className="grid md:grid-cols-2 gap-6">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
      <CardSkeleton rows={6} />
    </div>
  </div>
);
