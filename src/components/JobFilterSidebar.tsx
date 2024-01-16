import prisma from "@/lib/prisma";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Select from "./ui/select";
import { jobTypes } from "@/lib/job-types";
import { Button } from "./ui/button";
import { JobFilterValues, jobFilterSchema } from "@/lib/validation";
import { redirect } from "next/navigation";
import FormSubmitButton from "./FormSubmitButton";

async function filterJobs(formData: FormData) {
  "use server";
  const values = Object.fromEntries(formData.entries());

  const { q, type, location, remote } = jobFilterSchema.parse(values);

  const searchParams = new URLSearchParams({
    ...(q && { q: q.trim() }),
    ...(type && { type }),
    ...(location && { location }),
    ...(remote && { remote: "true" }),
  });

  redirect(`/?${searchParams.toString()}`);
}

interface JobFilterSideProps {
  defaultValues: JobFilterValues;
}

export default async function JobFilterSidebar({
  defaultValues,
}: JobFilterSideProps) {
  const disctinctLocations = (await prisma.job
    .findMany({
      where: { approved: true },
      select: { location: true },
      distinct: ["location"],
    })
    .then((locations) =>
      locations.map(({ location }) => location).filter(Boolean),
    )) as string[]; //filter(boolean) retourne que les location qui ont une valeur
  return (
    <aside className="sticky top-0 h-fit rounded-lg border bg-background p-4 md:w-[260px]">
      <form action={filterJobs} key={JSON.stringify(defaultValues)}>
        {/* key json stringify pour vider le form uniquement si on change de page le refresh de la page le vide pas*/}
        <div className="space-y-4">
          <div className=" flex flex-col gap-2">
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              name="q"
              placeholder="title, company, etc..."
              defaultValue={defaultValues.q}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <Select
              id="type"
              name="type"
              defaultValue={defaultValues.type || ""}
            >
              <option value=""> All types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}{" "}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Select
              id="location"
              name="location"
              defaultValue={defaultValues.location || ""}
            >
              <option value="">All locations</option>
              {disctinctLocations.map((location) => (
                <option key={location} value={location}>
                  {location}{" "}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              name="remote"
              className="scale-125 accent-black"
              defaultChecked={defaultValues.remote}
            />
            <Label htmlFor="remote">Remote jobs</Label>
          </div>
          <FormSubmitButton className="w-full">Submit</FormSubmitButton>
        </div>
      </form>
    </aside>
  );
}
