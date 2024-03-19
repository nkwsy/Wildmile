"use server";

export async function insertModules(formData) {
  console.log("Data:", formData);
  const rawFormData = {
    customerId: formData.model,
    amount: formData.locations,
    status: formData.model,
  };
  console.log("Raw Form Data:", rawFormData);
}

export const LoadMods = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams("");
  const mods = searchParams.get("");
  return fetch(`${pathname}/edit`)
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error));
};
