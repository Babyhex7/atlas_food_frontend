import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { FindFoodContent } from "./FindFoodContent";

export default function FindFoodPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <FindFoodContent />
    </Suspense>
  );
}
