// components/LocationModal.js
import { Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import LocationMap from "./LocationMap";

const LocationModal = ({ setLocation }) => {
  const [opened, { open, close }] = useDisclosure(false);

  const handleLocationSelect = (location) => {
    setLocation(location);
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Select a Location"
        size="xl"
        centered
      >
        <LocationMap onLocationSelect={handleLocationSelect} />
        <Button onClick={close}>Close</Button>
      </Modal>
      <Button onClick={open}>Location</Button>
    </>
  );
};

export default LocationModal;
