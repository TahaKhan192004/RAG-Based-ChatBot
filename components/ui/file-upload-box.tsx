import { Button } from "@/components/ui/button";

export function FileUploadBox() {
  return (
    <div className="rounded-[24px] border border-dashed border-ring bg-bg p-6 text-center">
      <p className="font-serif text-2xl text-primary">Drop a PDF here</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-fg">
        File handling is a placeholder for now. The next phase will extract,
        chunk, embed, and index the document.
      </p>
      <Button className="mt-5" type="button">
        Choose file
      </Button>
    </div>
  );
}
