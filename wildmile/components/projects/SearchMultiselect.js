import { MultiSelect } from "@mantine/core";

export default function SearchMultiselect({ itemsMap }) {
  return (
    <>
      <MultiSelect
        label="Your favorite libraries"
        placeholder="Pick value"
        data={itemsMap}
        searchable
      />
    </>
  );
}
