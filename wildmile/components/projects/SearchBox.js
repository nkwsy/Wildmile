/* eslint-disable function-paren-newline */
/* eslint-disable react/react-in-jsx-scope */

import { useState, useEffect } from "react";
import { useClientState } from "./context_mod_map";

import {
  CheckIcon,
  Combobox,
  Group,
  Pill,
  PillsInput,
  useCombobox,
} from "@mantine/core";

export default function SearchableMultiSelect({ itemsMap }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");
  const [value, setValue] = useState([]);

  const handleValueSelect = (val) => {
    console.log("Selected:", val);
    val.onClick();
    setValue((current) =>
      current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
    );
    console.log("Value:", value);
  };

  const handleValueRemove = (val) =>
    setValue((current) => current.filter((v) => v !== val));
  console.log(itemsMap);
  // const values = value.map((item) =>
  // <Pill
  //   key={item.id}
  //   withRemoveButton
  //   onRemove={() => handleValueRemove(item)}
  // >
  // itemsMap.get(item)
  // );
  const selectedPlants = useClientState("selectedPlants");

  const options = Array.from(itemsMap.entries())
    .filter(
      ([key, item]) =>
        item.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        item.subtitle.toLowerCase().includes(search.trim().toLowerCase())
    )
    .map(([key, item]) => (
      <Combobox.Option value={item} key={item.id} active={value.includes(key)}>
        <Group gap="sm">
          {selectedPlants.has(item.id) ? <CheckIcon size={12} /> : null}
          <span>{item.title}</span>
          <span> {item.subtitle}</span>
        </Group>
      </Combobox.Option>
    ));
  console.log(options);
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.toggleDropdown()}
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
        >
          <Pill.Group>
            {/* {values} */}

            <Combobox.EventsTarget>
              <PillsInput.Field
                // onFocus={() => combobox.openDropdown()}
                // onBlur={() => combobox.closeDropdown()}

                value={search}
                placeholder="Search values"
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options mah={400} style={{ overflowY: "auto" }}>
          {options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>Nothing found...</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
